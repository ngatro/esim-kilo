import { prisma } from "./prisma";

export interface PlanFilters {
  regionId?: string;
  countryId?: string;
  destination?: string;
  minData?: number;
  maxData?: number;
  minDuration?: number;
  maxDuration?: number;
  minPrice?: number;
  maxPrice?: number;
  networkType?: string;
  dataType?: number;
  isPopular?: boolean;
  isBestSeller?: boolean;
  isHot?: boolean;
}

export async function getPlans(filters: PlanFilters = {}) {
  const where: Record<string, unknown> = { isActive: true };

  if (filters.regionId) where.regionId = filters.regionId;
  if (filters.countryId) where.countryId = filters.countryId;
  if (filters.destination) where.destination = { contains: filters.destination, mode: "insensitive" };
  if (filters.networkType) where.speed = { contains: filters.networkType };
  if (filters.dataType) where.dataType = filters.dataType;
  if (filters.isPopular !== undefined) where.isPopular = filters.isPopular;
  if (filters.isBestSeller !== undefined) where.isBestSeller = filters.isBestSeller;
  if (filters.isHot !== undefined) where.isHot = filters.isHot;

  if (filters.minData || filters.maxData) {
    where.dataAmount = {};
    if (filters.minData) (where.dataAmount as Record<string, unknown>).gte = filters.minData;
    if (filters.maxData) (where.dataAmount as Record<string, unknown>).lte = filters.maxData;
  }

  if (filters.minDuration || filters.maxDuration) {
    where.durationDays = {};
    if (filters.minDuration) (where.durationDays as Record<string, unknown>).gte = filters.minDuration;
    if (filters.maxDuration) (where.durationDays as Record<string, unknown>).lte = filters.maxDuration;
  }

  if (filters.minPrice || filters.maxPrice) {
    where.priceUsd = {};
    if (filters.minPrice) (where.priceUsd as Record<string, unknown>).gte = filters.minPrice;
    if (filters.maxPrice) (where.priceUsd as Record<string, unknown>).lte = filters.maxPrice;
  }

  return prisma.plan.findMany({
    where,
    include: { region: true, country: true },
    orderBy: [
      { isBestSeller: "desc" },
      { isPopular: "desc" },
      { isHot: "desc" },
      { priority: "desc" },
      { priceUsd: "asc" },
    ],
  });
}

export async function getPopularPlans(limit = 8) {
  return prisma.plan.findMany({
    where: { isActive: true, isPopular: true },
    include: { region: true },
    orderBy: { priority: "desc" },
    take: limit,
  });
}

export async function getBestSellerPlans(limit = 8) {
  return prisma.plan.findMany({
    where: { isActive: true, isBestSeller: true },
    include: { region: true },
    orderBy: { priority: "desc" },
    take: limit,
  });
}

export async function getPlanById(id: string) {
  return prisma.plan.findUnique({
    where: { id },
    include: { region: true, country: true },
  });
}

export async function getPlanByPackageCode(packageCode: string) {
  return prisma.plan.findUnique({
    where: { packageCode },
    include: { region: true, country: true },
  });
}

export async function getRegions() {
  return prisma.region.findMany({
    orderBy: { name: "asc" },
    include: {
      countries: true,
      _count: { select: { plans: { where: { isActive: true } } } },
    },
  });
}

export async function getCountries() {
  return prisma.country.findMany({
    orderBy: { name: "asc" },
    include: { region: true },
  });
}

export async function getPlanStats() {
  const [total, active, popular, bestSellers, hot] = await Promise.all([
    prisma.plan.count(),
    prisma.plan.count({ where: { isActive: true } }),
    prisma.plan.count({ where: { isActive: true, isPopular: true } }),
    prisma.plan.count({ where: { isActive: true, isBestSeller: true } }),
    prisma.plan.count({ where: { isActive: true, isHot: true } }),
  ]);
  return { total, active, popular, bestSellers, hot };
}

export async function getBestPlans(options: {
  destination: string;
  dataNeeded?: number;
  daysNeeded?: number;
  preferCheapest?: boolean;
  preferMoreData?: boolean;
  preferBetterNetwork?: boolean;
}) {
  const { destination, dataNeeded, daysNeeded, preferCheapest, preferMoreData, preferBetterNetwork } = options;

  const plans = await prisma.plan.findMany({
    where: {
      isActive: true,
      destination: { contains: destination, mode: "insensitive" },
    },
    include: { region: true, country: true },
  });

  if (plans.length === 0) return [];

  const scoredPlans = plans.map((plan: typeof plans[number]) => {
    let score = 0;

    if (dataNeeded && plan.dataAmount >= dataNeeded) {
      score += 20;
      if (preferMoreData) score += Math.min(plan.dataAmount - dataNeeded, 50);
    } else if (dataNeeded && plan.dataAmount < dataNeeded) {
      score -= 30;
    }

    if (daysNeeded && plan.durationDays >= daysNeeded) {
      score += 10;
    } else if (daysNeeded && plan.durationDays < daysNeeded) {
      score -= 10;
    }

    if (preferCheapest) {
      const prices = plans.map((p: { priceUsd: number }) => p.priceUsd);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const range = maxPrice - minPrice || 1;
      score += ((maxPrice - plan.priceUsd) / range) * 30;
    }

    if (preferBetterNetwork && plan.speed?.includes("5G")) {
      score += 15;
    }

    score += plan.priority;
    if (plan.isPopular) score += 10;
    if (plan.isBestSeller) score += 15;
    if (plan.isHot) score += 12;

    return { ...plan, score };
  });

  return scoredPlans.sort((a: { score: number }, b: { score: number }) => b.score - a.score).slice(0, 5);
}