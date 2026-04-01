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

async function syncSinglePackage(pkg: Record<string, unknown>): Promise<boolean> {
  try {
    const dataAmount = bytesToGB(pkg.volume as number);
    const priceUsd = (pkg.price as number) / 1000;
    const { regionId, countryId, destination } = await resolveRegion(pkg.locationCode as string);

    const allNetworkTypes = new Set<string>();
    (pkg.locationNetworkList as Array<{ operatorList: Array<{ networkType: string }> }>)?.forEach((locItem) => {
      locItem.operatorList?.forEach((op) => allNetworkTypes.add(op.networkType));
    });
    const networkType = [...allNetworkTypes].join("/") || "4G";

    const locations = (pkg.location as string)?.split(",").map((s: string) => s.trim()) || [];

    await prisma.plan.upsert({
      where: { packageCode: pkg.packageCode as string },
      update: {
        name: pkg.name as string,
        slug: pkg.slug as string,
        description: (pkg.description as string) || null,
        destination,
        regionId,
        countryId,
        dataType: pkg.dataType as number,
        dataVolume: BigInt(pkg.volume as number),
        dataAmount,
        durationDays: pkg.duration as number,
        durationUnit: (pkg.durationUnit as string) || "DAY",
        priceRaw: pkg.price as number,
        priceUsd,
        currencyCode: (pkg.currencyCode as string) || "USD",
        speed: (pkg.speed as string) || null,
        networkType,
        locationCode: (pkg.locationCode as string) || null,
        locations,
        coverageCount: locations.length || 1,
        smsStatus: (pkg.smsStatus as number) || 0,
        activeType: (pkg.activeType as number) || 1,
        supportTopUp: (pkg.supportTopUpType as number) === 1,
        unusedValidTime: (pkg.unusedValidTime as number) || 0,
        ipExport: (pkg.ipExport as string) || null,
        fupPolicy: (pkg.fupPolicy as string) || null,
        locationNetworkList: pkg.locationNetworkList as object,
        isActive: true,
        rawApiData: pkg as object,
      },
      create: {
        id: `esimaccess-${pkg.packageCode as string}`,
        name: pkg.name as string,
        slug: pkg.slug as string,
        packageCode: pkg.packageCode as string,
        description: (pkg.description as string) || null,
        destination,
        regionId,
        countryId,
        dataType: pkg.dataType as number,
        dataVolume: BigInt(pkg.volume as number),
        dataAmount,
        durationDays: pkg.duration as number,
        durationUnit: (pkg.durationUnit as string) || "DAY",
        priceRaw: pkg.price as number,
        priceUsd,
        currencyCode: (pkg.currencyCode as string) || "USD",
        speed: (pkg.speed as string) || null,
        networkType,
        locationCode: (pkg.locationCode as string) || null,
        locations,
        coverageCount: locations.length || 1,
        smsStatus: (pkg.smsStatus as number) || 0,
        activeType: (pkg.activeType as number) || 1,
        supportTopUp: (pkg.supportTopUpType as number) === 1,
        unusedValidTime: (pkg.unusedValidTime as number) || 0,
        ipExport: (pkg.ipExport as string) || null,
        fupPolicy: (pkg.fupPolicy as string) || null,
        locationNetworkList: pkg.locationNetworkList as object,
        isActive: true,
        rawApiData: pkg as object,
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sync = url.searchParams.get("sync");

    // ADMIN: Sync ALL packages from eSIM Access
    if (sync === "true") {
      let totalSynced = 0;
      let totalFailed = 0;
      let page = 1;
      let hasMore = true;

      // Loop through all pages until no more packages
      while (hasMore) {
        try {
          const res = await getPackageList({ type: "BASE" });
          const packages = res.packageList || [];

          if (packages.length === 0) {
            hasMore = false;
            break;
          }

          for (const pkg of packages) {
            const ok = await syncSinglePackage(pkg as unknown as Record<string, unknown>);
            if (ok) totalSynced++;
            else totalFailed++;
          }

          // If we got fewer packages than expected, we've reached the end
          if (packages.length < 100) {
            hasMore = false;
          }
          page++;

          // Safety: max 50 pages to prevent infinite loop
          if (page > 50) hasMore = false;
        } catch (err) {
          console.error(`Sync page ${page} failed:`, err);
          hasMore = false;
        }
      }

      return NextResponse.json({
        success: true,
        synced: totalSynced,
        failed: totalFailed,
        pages: page - 1,
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

    // Get single plan by ID
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