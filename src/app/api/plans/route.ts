import { NextResponse } from "next/server";
import { getPackageList } from "@/lib/esim-access";
import { prisma } from "@/lib/prisma";

function bytesToGB(bytes: number): number {
  return Math.round((bytes / (1024 * 1024 * 1024)) * 10) / 10;
}

// Cache countries to avoid repeated DB queries
let countryCache: Map<string, { regionId: string; name: string }> | null = null;

async function getCountryCache() {
  if (!countryCache) {
    countryCache = new Map();
    const countries = await prisma.country.findMany({ select: { id: true, regionId: true, name: true } });
    countries.forEach((c) => countryCache!.set(c.id, { regionId: c.regionId, name: c.name }));
  }
  return countryCache;
}

function resolveRegion(locationCode: string, countries: Map<string, { regionId: string; name: string }>): { regionId: string | null; countryId: string | null; destination: string } {
  if (!locationCode) return { regionId: null, countryId: null, destination: "Global" };
  if (locationCode === "!GL") return { regionId: "global", countryId: null, destination: "Global" };
  if (locationCode === "!RG") return { regionId: null, countryId: null, destination: "Regional" };

  // Check if country exists in our DB
  const country = countries.get(locationCode);
  if (country) {
    return { regionId: country.regionId, countryId: locationCode, destination: country.name };
  }

  // Country not in our DB - set countryId to null to avoid FK violation
  if (locationCode.length === 2) {
    return { regionId: null, countryId: null, destination: locationCode };
  }

  return { regionId: null, countryId: null, destination: locationCode };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sync = url.searchParams.get("sync");

    // ADMIN: Sync ALL packages from eSIM Access
    if (sync === "true") {
      // Get all packages from eSIM Access API
      const res = await getPackageList({ type: "BASE" });
      const packages = res.packageList || [];

      if (packages.length === 0) {
        return NextResponse.json({ success: false, error: "No packages returned from eSIM Access" });
      }

      // Load country cache once
      const countries = await getCountryCache();

      // Prepare all plans for bulk insert
      const plansToCreate = packages.map((pkg) => {
        const dataAmount = bytesToGB(pkg.volume);
        const priceUsd = pkg.price / 1000;
        const { regionId, countryId, destination } = resolveRegion(pkg.locationCode, countries);

        const allNetworkTypes = new Set<string>();
        pkg.locationNetworkList?.forEach((locItem) => {
          locItem.operatorList?.forEach((op) => allNetworkTypes.add(op.networkType));
        });
        const networkType = [...allNetworkTypes].join("/") || "4G";

        const locations = pkg.location
          ? pkg.location.split(",").map((s: string) => s.trim())
          : [];

        return {
          id: `esimaccess-${pkg.packageCode}`,
          name: pkg.name,
          slug: pkg.slug,
          packageCode: pkg.packageCode,
          description: pkg.description || null,
          destination,
          regionId,
          countryId,
          dataType: pkg.dataType,
          dataVolume: BigInt(Math.floor(pkg.volume)),
          dataAmount,
          durationDays: pkg.duration,
          durationUnit: pkg.durationUnit || "DAY",
          priceRaw: pkg.price,
          priceUsd,
          currencyCode: pkg.currencyCode || "USD",
          speed: pkg.speed || null,
          networkType,
          locationCode: pkg.locationCode || null,
          locations,
          coverageCount: locations.length || 1,
          smsStatus: pkg.smsStatus || 0,
          activeType: pkg.activeType || 1,
          supportTopUp: pkg.supportTopUpType === 1,
          unusedValidTime: pkg.unusedValidTime || 0,
          ipExport: pkg.ipExport || null,
          fupPolicy: pkg.fupPolicy || null,
          isActive: true,
        };
      });

      // Bulk upsert in batches of 100 using transaction
      const BATCH_SIZE = 100;
      let totalSynced = 0;
      let totalFailed = 0;

      for (let i = 0; i < plansToCreate.length; i += BATCH_SIZE) {
        const batch = plansToCreate.slice(i, i + BATCH_SIZE);

        try {
          await prisma.$transaction(
            batch.map((plan) =>
              prisma.plan.upsert({
                where: { packageCode: plan.packageCode },
                update: plan,
                create: plan,
              })
            )
          );
          totalSynced += batch.length;
        } catch (err) {
          // If batch fails, try one by one
          for (const plan of batch) {
            try {
              await prisma.plan.upsert({
                where: { packageCode: plan.packageCode },
                update: plan,
                create: plan,
              });
              totalSynced++;
            } catch {
              totalFailed++;
            }
          }
        }
      }

      // Clear cache
      countryCache = null;

      return NextResponse.json({
        success: true,
        synced: totalSynced,
        failed: totalFailed,
        total: packages.length,
      });
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
    const id = url.searchParams.get("id");

    if (id) {
      const plan = await prisma.plan.findUnique({
        where: { id },
        include: { region: true, country: true },
      });
      return NextResponse.json({ plans: plan ? [plan] : [] });
    }

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