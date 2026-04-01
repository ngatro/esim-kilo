import { NextResponse } from "next/server";
import { getPackageList } from "@/lib/esim-access";
import { prisma } from "@/lib/prisma";

function bytesToGB(bytes: number): number {
  return Math.round((bytes / (1024 * 1024 * 1024)) * 10) / 10;
}

async function resolveRegion(locationCode: string): Promise<{ regionId: string | null; countryId: string | null; destination: string }> {
  if (!locationCode) return { regionId: null, countryId: null, destination: "Global" };
  if (locationCode === "!GL") return { regionId: "global", countryId: null, destination: "Global" };
  if (locationCode === "!RG") return { regionId: null, countryId: null, destination: "Regional" };
  if (locationCode.length === 2) {
    const country = await prisma.country.findUnique({ where: { id: locationCode } });
    if (country) return { regionId: country.regionId, countryId: country.id, destination: country.name };
    return { regionId: null, countryId: locationCode, destination: locationCode };
  }
  return { regionId: null, countryId: null, destination: locationCode };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sync = url.searchParams.get("sync");

    // ADMIN: Sync ALL packages from eSIM Access
    if (sync === "true") {
      // Get all packages from eSIM Access API (returns up to ~3000 in one call)
      const res = await getPackageList({ type: "BASE" });
      const packages = res.packageList || [];

      if (packages.length === 0) {
        return NextResponse.json({ success: false, error: "No packages returned from eSIM Access" });
      }

      let totalSynced = 0;
      let totalFailed = 0;
      const errors: string[] = [];

      // Process packages in batches of 50
      const BATCH_SIZE = 50;
      for (let i = 0; i < packages.length; i += BATCH_SIZE) {
        const batch = packages.slice(i, i + BATCH_SIZE);

        await Promise.all(batch.map(async (pkg) => {
          try {
            const dataAmount = bytesToGB(pkg.volume);
            const priceUsd = pkg.price / 1000;
            const { regionId, countryId, destination } = await resolveRegion(pkg.locationCode);

            const allNetworkTypes = new Set<string>();
            pkg.locationNetworkList?.forEach((locItem) => {
              locItem.operatorList?.forEach((op) => allNetworkTypes.add(op.networkType));
            });
            const networkType = [...allNetworkTypes].join("/") || "4G";

            const locations = pkg.location
              ? pkg.location.split(",").map((s: string) => s.trim())
              : [];

            await prisma.plan.upsert({
              where: { packageCode: pkg.packageCode },
              update: {
                name: pkg.name,
                slug: pkg.slug,
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
              },
              create: {
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
              },
            });

            totalSynced++;
          } catch (err: unknown) {
            totalFailed++;
            const msg = err instanceof Error ? err.message : "unknown";
            errors.push(`${pkg.packageCode}: ${msg}`);
            console.error(`Sync failed for ${pkg.packageCode}:`, msg);
          }
        }));
      }

      return NextResponse.json({
        success: true,
        synced: totalSynced,
        failed: totalFailed,
        total: packages.length,
        errors: errors.slice(0, 10),
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