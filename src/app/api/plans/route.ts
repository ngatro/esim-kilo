import { NextResponse } from "next/server";
import { getPackageList } from "@/lib/esim-access";
import { prisma } from "@/lib/prisma";

function bytesToGB(bytes: number): number {
  return Math.round((bytes / (1024 * 1024 * 1024)) * 10) / 10;
}

// Region mapping based on country code
const COUNTRY_TO_REGION: Record<string, string> = {
  // Europe
  FR: "europe", DE: "europe", IT: "europe", ES: "europe", GB: "europe",
  NL: "europe", BE: "europe", AT: "europe", PT: "europe", GR: "europe",
  PL: "europe", CH: "europe", SE: "europe", NO: "europe", DK: "europe",
  FI: "europe", IE: "europe", CZ: "europe", HU: "europe", RO: "europe",
  RU: "europe", UA: "europe", TR: "europe", HR: "europe", BG: "europe",
  SK: "europe", SI: "europe", EE: "europe", LV: "europe", LT: "europe",
  LU: "europe", MT: "europe", CY: "europe", IS: "europe", AL: "europe",
  MK: "europe", ME: "europe", RS: "europe", BA: "europe", MD: "europe",
  BY: "europe", GE: "europe", AM: "europe", AZ: "europe",
  // Asia
  JP: "asia", KR: "asia", CN: "asia", TH: "asia", VN: "asia",
  SG: "asia", MY: "asia", ID: "asia", PH: "asia", TW: "asia",
  HK: "asia", IN: "asia", PK: "asia", BD: "asia", LK: "asia",
  KH: "asia", LA: "asia", MM: "asia", NP: "asia",
  // Americas
  US: "americas", CA: "americas", MX: "americas", BR: "americas",
  AR: "americas", CO: "americas", CL: "americas", PE: "americas",
  VE: "americas", EC: "americas", BO: "americas", UY: "americas",
  PY: "americas", CR: "americas", PA: "americas", DO: "americas",
  GT: "americas", HN: "americas", SV: "americas", NI: "americas",
  CU: "americas", JM: "americas", TT: "americas",
  // Middle East
  AE: "middle-east", SA: "middle-east", QA: "middle-east", KW: "middle-east",
  BH: "middle-east", OM: "middle-east", IL: "middle-east", JO: "middle-east",
  LB: "middle-east", IQ: "middle-east", IR: "middle-east",
  // Africa
  ZA: "africa", EG: "africa", NG: "africa", KE: "africa", MA: "africa",
  TZ: "africa", GH: "africa", ET: "africa", UG: "africa", DZ: "africa",
  TN: "africa", AO: "africa", MZ: "africa", RW: "africa", SN: "africa",
  // Oceania
  AU: "oceania", NZ: "oceania", FJ: "oceania",
};

function resolveRegion(pkg: Record<string, unknown>): { regionId: string | null; countryId: string | null; destination: string } {
  const locationCode = (pkg.locationCode as string) || "";
  const locations = ((pkg.location as string) || "").split(",").map((s: string) => s.trim()).filter(Boolean);

  // Global package
  if (locationCode === "!GL" || locationCode.toUpperCase() === "GLOBAL") {
    return { regionId: "global", countryId: null, destination: "Global" };
  }

  // Regional package - determine from countries
  if (locationCode === "!RG" || locations.length > 3) {
    // Count countries per region
    const regionCounts: Record<string, number> = {};
    for (const loc of locations) {
      const region = COUNTRY_TO_REGION[loc.toUpperCase()];
      if (region) regionCounts[region] = (regionCounts[region] || 0) + 1;
    }
    // Find dominant region
    let maxRegion = "";
    let maxCount = 0;
    for (const [region, count] of Object.entries(regionCounts)) {
      if (count > maxCount) { maxCount = count; maxRegion = region; }
    }
    if (maxRegion) {
      return { regionId: maxRegion, countryId: null, destination: (pkg.name as string) || locationCode };
    }
    return { regionId: "global", countryId: null, destination: (pkg.name as string) || "Multi-region" };
  }

  // Single country
  if (locations.length === 1) {
    const code = locations[0].toUpperCase();
    const region = COUNTRY_TO_REGION[code];
    if (region) return { regionId: region, countryId: code, destination: code };
    return { regionId: null, countryId: null, destination: code };
  }

  // Multi-country (2-3 countries) - assign to first country's region
  if (locations.length > 1) {
    for (const loc of locations) {
      const code = loc.toUpperCase();
      const region = COUNTRY_TO_REGION[code];
      if (region) return { regionId: region, countryId: null, destination: (pkg.name as string) || locationCode };
    }
  }

  // Fallback - use locationCode directly
  if (locationCode.length === 2) {
    const region = COUNTRY_TO_REGION[locationCode.toUpperCase()];
    if (region) return { regionId: region, countryId: locationCode.toUpperCase(), destination: locationCode };
  }

  return { regionId: null, countryId: null, destination: (pkg.name as string) || locationCode || "Unknown" };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sync = url.searchParams.get("sync");

    // ADMIN: Sync ALL packages
    if (sync === "true") {
      const startTime = Date.now();
      const res = await getPackageList({ type: "BASE" });
      const packages = res.packageList || [];

      if (packages.length === 0) {
        return NextResponse.json({ success: false, error: "No packages from eSIM Access" });
      }

      // Prepare plans
      const plans = packages.map((pkg) => {
        const dataAmount = bytesToGB(pkg.volume);
        const priceUsd = pkg.price / 1000;
        const { regionId, countryId, destination } = resolveRegion(pkg as unknown as Record<string, unknown>);

        const allNetworkTypes = new Set<string>();
        pkg.locationNetworkList?.forEach((locItem) => {
          locItem.operatorList?.forEach((op) => allNetworkTypes.add(op.networkType));
        });
        const networkType = [...allNetworkTypes].join("/") || "4G";

        const locations = (pkg.location || "").split(",").map((s: string) => s.trim()).filter(Boolean);

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
          locations: JSON.stringify(locations),
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

      // Fast sync: delete all old plans, then create new ones
      const deleteResult = await prisma.plan.deleteMany({});
      console.log(`Deleted ${deleteResult.count} old plans`);

      // Bulk create in batches
      const BATCH_SIZE = 200;
      let totalCreated = 0;
      for (let i = 0; i < plans.length; i += BATCH_SIZE) {
        const batch = plans.slice(i, i + BATCH_SIZE);
        await prisma.plan.createMany({
          data: batch,
          skipDuplicates: true,
        });
        totalCreated += batch.length;
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      return NextResponse.json({
        success: true,
        synced: totalCreated,
        deleted: deleteResult.count,
        total: packages.length,
        elapsed: `${elapsed}s`,
      });
    }

    // FRONTEND: Query plans
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

    let orderBy: Record<string, string>[];
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
      take: 500,
    });

    return NextResponse.json({ plans, total: plans.length });
  } catch (error) {
    console.error("Plans API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}