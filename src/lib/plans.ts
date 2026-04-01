import { prisma } from "./prisma";

export async function getPlans(filters: {
  regionId?: string;
  countryId?: string;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  networkType?: string;
  dataType?: number;
} = {}) {
  const where: Record<string, unknown> = { isActive: true };
  if (filters.regionId) where.regionId = filters.regionId;
  if (filters.countryId) where.countryId = filters.countryId;
  if (filters.destination) where.destination = { contains: filters.destination, mode: "insensitive" };
  if (filters.networkType) where.speed = { contains: filters.networkType };
  if (filters.dataType) where.dataType = filters.dataType;
  if (filters.minPrice || filters.maxPrice) {
    where.priceUsd = {};
    if (filters.minPrice) (where.priceUsd as Record<string, unknown>).gte = filters.minPrice;
    if (filters.maxPrice) (where.priceUsd as Record<string, unknown>).lte = filters.maxPrice;
  }
  return prisma.plan.findMany({ where, orderBy: [{ priceUsd: "asc" }] });
}

export async function getPopularPlans(limit = 8) {
  return prisma.plan.findMany({ where: { isActive: true, isPopular: true }, take: limit });
}

export async function getPlanById(id: string) {
  return prisma.plan.findUnique({ where: { id } });
}

export async function getRegions() {
  return prisma.region.findMany({ orderBy: { name: "asc" }, include: { countries: true } });
}

export async function getCountries() {
  return prisma.country.findMany({ orderBy: { name: "asc" }, include: { region: true } });
}