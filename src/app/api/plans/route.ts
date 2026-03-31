import { NextResponse } from "next/server";
import { getPackageList } from "@/lib/esim-access";
import { prisma } from "@/lib/prisma";

// Convert bytes to GB
function bytesToGB(bytes: number): number {
  return Math.round((bytes / (1024 * 1024 * 1024)) * 10) / 10;
}

// Extract region from locationCode
async function resolveRegion(locationCode: string): Promise<{ regionId: string | null; countryId: string | null; destination: string }> {
  // Global package
  if (locationCode === "!GL") {
    return { regionId: "global", countryId: null, destination: "Global" };
  }
  // Regional package
  if (locationCode === "!RG") {
    return { regionId: null, countryId: null, destination: "Regional" };
  }

  // Single country (e.g. "JP")
  if (locationCode.length === 2) {
    const country = await prisma.country.findUnique({ where: { id: locationCode } });
    if (country) {
      return { regionId: country.regionId, countryId: country.id, destination: country.name };
    }
    return { regionId: null, countryId: locationCode, destination: locationCode };
  }

  // Multi-country code like "AUKUS-3" -> try to extract country codes
  return { regionId: null, countryId: null, destination: locationCode };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sync = url.searchParams.get("sync");
    const syncLocation = url.searchParams.get("syncLocation");

    // ADMIN: Sync all packages from eSIM Access to DB
    if (sync === "true") {
      const locationsToSync: string[] = [];
      
      if (syncLocation) {
        locationsToSync.push(syncLocation);
      } else {
        // Sync all regions: Global, Regional, + major countries
        locationsToSync.push("!GL", "!RG");
        const countries = await prisma.country.findMany({ select: { id: true } });
        countries.forEach((c: { id: string }) => locationsToSync.push(c.id));
      }

      let totalSynced = 0;

      for (const loc of locationsToSync) {
        try {
          const { packages } = await getPackageList({ locationCode: loc, size: 200 });

          for (const pkg of packages) {
            const dataAmount = bytesToGB(pkg.volume);
            const priceUsd = pkg.price / 1000;
            const { regionId, countryId, destination } = await resolveRegion(pkg.locationCode);

            // Extract network types from locationNetworkList
            const allNetworkTypes = new Set<string>();
            pkg.locationNetworkList?.forEach((loc) => {
              loc.operatorList?.forEach((op) => allNetworkTypes.add(op.networkType));
            });
            const networkType = [...allNetworkTypes].join("/") || "4G";

            // Extract locations array
            const locations = pkg.location
              ? pkg.location.split(",").map((s: string) => s.trim())
              : [];

            // Features list (for reference, stored in rawApiData)
            void pkg.supportTopUpType;
            void pkg.ipExport;

            await prisma.plan.upsert({
              where: { packageCode: pkg.packageCode },
              update: {
                name: pkg.name,
                slug: pkg.slug,
                description: pkg.description,
                destination,
                regionId,
                countryId,
                dataType: pkg.dataType,
                dataVolume: BigInt(pkg.volume),
                dataAmount,
                durationDays: pkg.duration,
                durationUnit: pkg.durationUnit,
                priceRaw: pkg.price,
                priceUsd,
                currencyCode: pkg.currencyCode,
                speed: pkg.speed,
                networkType,
                locationCode: pkg.locationCode,
                locations,
                coverageCount: locations.length || 1,
                smsStatus: pkg.smsStatus,
                activeType: pkg.activeType,
                supportTopUp: pkg.supportTopUpType === 1,
                unusedValidTime: pkg.unusedValidTime,
                ipExport: pkg.ipExport || null,
                fupPolicy: pkg.fupPolicy || null,
                locationNetworkList: pkg.locationNetworkList as unknown as object,
                isActive: true,
                rawApiData: pkg as unknown as object,
              },
              create: {
                id: `esimaccess-${pkg.packageCode}`,
                name: pkg.name,
                slug: pkg.slug,
                packageCode: pkg.packageCode,
                description: pkg.description,
                destination,
                regionId,
                countryId,
                dataType: pkg.dataType,
                dataVolume: BigInt(pkg.volume),
                dataAmount,
                durationDays: pkg.duration,
                durationUnit: pkg.durationUnit,
                priceRaw: pkg.price,
                priceUsd,
                currencyCode: pkg.currencyCode,
                speed: pkg.speed,
                networkType,
                locationCode: pkg.locationCode,
                locations,
                coverageCount: locations.length || 1,
                smsStatus: pkg.smsStatus,
                activeType: pkg.activeType,
                supportTopUp: pkg.supportTopUpType === 1,
                unusedValidTime: pkg.unusedValidTime,
                ipExport: pkg.ipExport || null,
                fupPolicy: pkg.fupPolicy || null,
                locationNetworkList: pkg.locationNetworkList as unknown as object,
                isActive: true,
                rawApiData: pkg as unknown as object,
              },
            });

            totalSynced++;
          }
        } catch (err) {
          console.error(`Sync failed for ${loc}:`, err);
        }
      }

      return NextResponse.json({ success: true, synced: totalSynced });
    }

    // FRONTEND: Filter plans from DB
    const regionId = url.searchParams.get("regionId") || undefined;
    const countryId = url.searchParams.get("countryId") || undefined;
    const search = url.searchParams.get("search") || undefined;
    const networkType = url.searchParams.get("networkType") || undefined;
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const minData = url.searchParams.get("minData");
    const dataType = url.searchParams.get("dataType");
    const isPopular = url.searchParams.get("isPopular");
    const isBestSeller = url.searchParams.get("isBestSeller");
    const isHot = url.searchParams.get("isHot");
    const sortBy = url.searchParams.get("sortBy") || "best";

    const where: Record<string, unknown> = { isActive: true };

    if (regionId) where.regionId = regionId;
    if (countryId) where.countryId = countryId;
    if (search) {
      where.OR = [
        { destination: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { locationCode: { contains: search, mode: "insensitive" } },
      ];
    }
    if (networkType) where.speed = { contains: networkType };
    if (dataType) where.dataType = parseInt(dataType);
    if (isPopular === "true") where.isPopular = true;
    if (isBestSeller === "true") where.isBestSeller = true;
    if (isHot === "true") where.isHot = true;

    if (minPrice || maxPrice) {
      where.priceUsd = {};
      if (minPrice) (where.priceUsd as Record<string, unknown>).gte = parseFloat(minPrice);
      if (maxPrice) (where.priceUsd as Record<string, unknown>).lte = parseFloat(maxPrice);
    }

    if (minData) where.dataAmount = { gte: parseFloat(minData) };

    let orderBy: Record<string, string>[] = [];
    switch (sortBy) {
      case "price-low": orderBy = [{ priceUsd: "asc" }]; break;
      case "price-high": orderBy = [{ priceUsd: "desc" }]; break;
      case "data": orderBy = [{ dataAmount: "desc" }]; break;
      case "duration": orderBy = [{ durationDays: "desc" }]; break;
      default: orderBy = [
        { isBestSeller: "desc" },
        { isPopular: "desc" },
        { isHot: "desc" },
        { priority: "desc" },
        { priceUsd: "asc" },
      ];
    }

    const plans = await prisma.plan.findMany({
      where,
      include: { region: true, country: true },
      orderBy,
    });

    return NextResponse.json({ plans, total: plans.length });
  } catch (error) {
    console.error("Plans API error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}