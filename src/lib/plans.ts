import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export interface PlanFilters {
  regionId?: string;
  countryId?: string;
  destination?: string;
  minData?: number;
  maxData?: number;
  minValidity?: number;
  maxValidity?: number;
  minPrice?: number;
  maxPrice?: number;
  networkType?: string;
  isPopular?: boolean;
  isBestSeller?: boolean;
  isHot?: boolean;
}

export async function getPlans(filters: PlanFilters = {}) {
  const where: Prisma.PlanWhereInput = { isActive: true };

  if (filters.regionId) where.regionId = filters.regionId;
  if (filters.countryId) where.countryId = filters.countryId;
  if (filters.destination) where.destination = { contains: filters.destination, mode: "insensitive" };
  if (filters.networkType) where.networkType = { contains: filters.networkType, mode: "insensitive" };
  if (filters.isPopular !== undefined) where.isPopular = filters.isPopular;
  if (filters.isBestSeller !== undefined) where.isBestSeller = filters.isBestSeller;
  if (filters.isHot !== undefined) where.isHot = filters.isHot;

  if (filters.minData || filters.maxData) {
    where.dataAmount = {};
    if (filters.minData) where.dataAmount.gte = filters.minData;
    if (filters.maxData) where.dataAmount.lte = filters.maxData;
  }

  if (filters.minValidity || filters.maxValidity) {
    where.validityDays = {};
    if (filters.minValidity) where.validityDays.gte = filters.minValidity;
    if (filters.maxValidity) where.validityDays.lte = filters.maxValidity;
  }

  if (filters.minPrice || filters.maxPrice) {
    where.priceUsd = {};
    if (filters.minPrice) where.priceUsd.gte = filters.minPrice;
    if (filters.maxPrice) where.priceUsd.lte = filters.maxPrice;
  }

  return prisma.plan.findMany({
    where,
    include: {
      region: true,
      country: true,
    },
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
    include: {
      region: true,
    },
    orderBy: { priority: "desc" },
    take: limit,
  });
}

export async function getBestSellerPlans(limit = 8) {
  return prisma.plan.findMany({
    where: { isActive: true, isBestSeller: true },
    include: {
      region: true,
    },
    orderBy: { priority: "desc" },
    take: limit,
  });
}

export async function getHotPlans(limit = 8) {
  return prisma.plan.findMany({
    where: { isActive: true, isHot: true },
    include: {
      region: true,
    },
    orderBy: { priority: "desc" },
    take: limit,
  });
}

export async function getPlansByRegion(regionId: string) {
  return getPlans({ regionId });
}

export async function getPlansByCountry(countryId: string) {
  return getPlans({ countryId });
}

export async function getPlanById(id: string) {
  return prisma.plan.findUnique({
    where: { id },
    include: {
      region: true,
      country: true,
    },
  });
}

export async function getAllDestinations() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    select: { destination: true },
    distinct: ["destination"],
    orderBy: { destination: "asc" },
  });
  return plans.map((p: { destination: string }) => p.destination);
}

export async function getRegions() {
  return prisma.region.findMany({
    orderBy: { name: "asc" },
    include: {
      countries: true,
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
    include: {
      region: true,
      country: true,
    },
  });

  if (plans.length === 0) return [];

  const scoredPlans = plans.map((plan) => {
    let score = 0;

    if (dataNeeded && plan.dataAmount >= dataNeeded) {
      score += 20;
      if (preferMoreData) score += Math.min(plan.dataAmount - dataNeeded, 50);
    } else if (dataNeeded && plan.dataAmount < dataNeeded) {
      score -= 30;
    }

    if (daysNeeded && plan.validityDays >= daysNeeded) {
      score += 10;
    } else if (daysNeeded && plan.validityDays < daysNeeded) {
      score -= 10;
    }

    if (preferCheapest) {
      const minPrice = Math.min(...plans.map((p: { priceUsd: number }) => p.priceUsd));
      const maxPrice = Math.max(...plans.map((p: { priceUsd: number }) => p.priceUsd));
      const priceRange = maxPrice - minPrice || 1;
      score += ((maxPrice - plan.priceUsd) / priceRange) * 30;
    }

    if (preferBetterNetwork && plan.networkType?.includes("5G")) {
      score += 15;
    }

    score += plan.priority;
    if (plan.isPopular) score += 10;
    if (plan.isBestSeller) score += 15;
    if (plan.isHot) score += 12;

    return { ...plan, score };
  });

  return scoredPlans
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}