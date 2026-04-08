import { NextResponse } from "next/server";
import { getPackageList } from "@/lib/esim-access";
import { prisma } from "@/lib/prisma";

function bytesToGB(bytes: number): number {
  if (!bytes || bytes <= 0) return 0;
  // If value is very small (less than 100), assume it's already in GB
  if (bytes < 100) return Math.round(bytes * 10) / 10;
  // If value is reasonable for MB (less than 100000), assume MB
  if (bytes < 100000) return Math.round((bytes / 1024) * 10) / 10;
  // Otherwise assume bytes
  return Math.round((bytes / (1024 * 1024 * 1024)) * 10) / 10;
}

function getRegionEmoji(regionId: string): string {
  const map: Record<string, string> = {
    "europe": "🏰",
    "asia": "🌏",
    "americas": "🌎",
    "oceania": "🌴",
    "africa": "🌍",
    "middle-east": "🕌",
    "global": "🌐",
  };
  return map[regionId.toLowerCase()] || "🌍";
}

function getCountryEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (code.length !== 2) return "🏳️";
  const offset = 127397;
  try {
    return String.fromCodePoint(offset + code.charCodeAt(0)) + String.fromCodePoint(offset + code.charCodeAt(1));
  } catch {
    return "🏳️";
  }
}

function generateSlug(name: string, fupPolicy?: string | null): string {
  let cleanName = name
    .replace(/[()]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  
  // Add esim- prefix for SEO
  const isUnlimited = fupPolicy && fupPolicy.trim().length > 0;
  
  if (isUnlimited) {
    return `esim-${cleanName}-unlimited`;
  }
  
  return `esim-${cleanName}`;
}

import countryToRegionData from "@/data/country-to-region.json";

const COUNTRY_TO_REGION: Record<string, { regionId: string; regionName: string; countryName: string }> = countryToRegionData;

function resolveLocation(pkg: Record<string, unknown>) {
  const locationCode = (pkg.locationCode as string) || "";
  const pkgName = (pkg.name as string) || "";
  const locations = ((pkg.location as string) || "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);

  if (locationCode === "!GL") return { regionId: "global", regionName: "Global", countryId: null, countryName: "", destination: pkgName || "Global" };

  // Single country
  if (locations.length === 1) {
    const info = COUNTRY_TO_REGION[locations[0]];
    if (info) return { regionId: info.regionId, regionName: info.regionName, countryId: locations[0], countryName: info.countryName, destination: pkgName || info.countryName };
  }

  // Multiple countries (regional plans) - derive region from countries
  if (locations.length > 1) {
    const counts: Record<string, { name: string; count: number }> = {};
    for (const loc of locations) {
      const info = COUNTRY_TO_REGION[loc];
      if (info) {
        if (!counts[info.regionId]) counts[info.regionId] = { name: info.regionName, count: 0 };
        counts[info.regionId].count++;
      }
    }
    
    // Find the region with most countries
    let maxR = "global"; let maxC = 0; let maxName = "Global";
    for (const [r, data] of Object.entries(counts)) { 
      if (data.count > maxC) { maxC = data.count; maxR = r; maxName = data.name; } 
    }
    
    // Only use derived region if we have at least 1 known country, otherwise fallback
    if (maxC > 0) {
      return { regionId: maxR, regionName: maxName, countryId: null, countryName: "", destination: pkgName || locationCode };
    }
    
    // No known countries in the list - try to parse from locationCode (e.g., "ASIA", "EUROPE")
    if (locationCode === "!RG" || locationCode.length > 2) {
      const regionFromCode = locationCode.replace("!RG", "").toLowerCase();
      if (regionFromCode && regionFromCode.length > 1) {
        const regionName = regionFromCode.charAt(0).toUpperCase() + regionFromCode.slice(1);
        return { regionId: regionFromCode, regionName, countryId: null, countryName: "", destination: pkgName || locationCode };
      }
    }
    
    return { regionId: "global", regionName: "Global", countryId: null, countryName: "", destination: pkgName || locationCode };
  }

  // Unknown - fallback
  return { regionId: "global", regionName: "Global", countryId: null, countryName: "", destination: pkgName || locationCode };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sync = url.searchParams.get("sync");

    if (sync === "true") {
      const startTime = Date.now();
      const res = await getPackageList({ type: "BASE" });
      const packages = res.packageList || [];
      if (packages.length === 0) return NextResponse.json({ success: false, error: "No packages" });

      const regionMap: Record<string, { id: string; name: string; emoji: string }> = {};
      const countryMap: Record<string, { id: string; name: string; code: string; emoji: string }> = {};

      const plans = packages.map((pkg) => {
        const dataAmount = bytesToGB(pkg.volume);
        const priceUsd = pkg.price / 10000;
        const retailPriceUsd = (pkg.retailPrice || pkg.price) / 10000;
        const loc = resolveLocation(pkg as unknown as Record<string, unknown>);
        const allNet = new Set<string>();
        pkg.locationNetworkList?.forEach((l) => l.operatorList?.forEach((o) => allNet.add(o.networkType)));
        const networkType = [...allNet].join("/") || "4G";
        const locations = (pkg.location || "").split(",").map((s: string) => s.trim()).filter(Boolean);
        const locationCount = locations.length || 1;

        // Build regional data - only for plans with 2+ locations (regional plans)
        // Each unique locationCode for multi-country packages becomes a Region
        if (locationCount >= 2 && (pkg as { locationCode?: string }).locationCode) {
          const locCode = (pkg as { locationCode: string }).locationCode;
          const regionKey = locCode.toUpperCase();
          if (!regionMap[regionKey]) {
            // Use locationCode as the unique region identifier for multi-country packages
            const regionName = loc.regionName || locCode.replace("!RG", "").replace("!GL", "Global");
            regionMap[regionKey] = { id: locCode, name: regionName, emoji: getRegionEmoji(locCode) };
          }
        }

        // Build country data - only for plans with 1 location (single country plans)
        if (loc.countryId && loc.countryName && locationCount === 1) {
          const countryKey = loc.countryId.toUpperCase();
          if (!countryMap[countryKey]) {
            countryMap[countryKey] = { id: loc.countryId.toUpperCase(), name: loc.countryName, code: loc.countryId, emoji: getCountryEmoji(loc.countryId) };
          }
        }

        return {
          id: `esimaccess-${pkg.packageCode}`,
          name: pkg.name,
          slug: generateSlug(pkg.name, pkg.fupPolicy),
          packageCode: pkg.packageCode,
          description: pkg.description || null,
          destination: loc.destination,
          regionId: locationCount >= 2 ? (pkg as { locationCode?: string }).locationCode || null : null,  // Use locationCode for regional plans
          countryId: locationCount === 1 ? loc.countryId?.toUpperCase() : null,  // Only set countryId for single country plans
          regionName: locationCount >= 2 ? loc.regionName : null,
          countryName: locationCount === 1 ? loc.countryName : null,
          dataType: pkg.dataType,
          dataVolume: BigInt(Math.floor(pkg.volume)),
          dataAmount,
          durationDays: pkg.duration,
          durationUnit: pkg.durationUnit || "DAY",
          priceRaw: pkg.price,
          priceUsd,
          retailPriceRaw: pkg.retailPrice || pkg.price,
          retailPriceUsd,
          currencyCode: pkg.currencyCode || "USD",
          speed: pkg.speed || null,
          networkType,
          locationCode: pkg.locationCode || null,
          locationLogo: pkg.locationLogo || null,
          locations: JSON.stringify(locations),
          coverageCount: locationCount,
          smsStatus: pkg.smsStatus || 0,
          activeType: pkg.activeType || 1,
          supportTopUp: pkg.supportTopUpType === 2 || pkg.supportTopUpType === 3,
          supportTopUpType: pkg.supportTopUpType || 1,
          unusedValidTime: pkg.unusedValidTime || 0,
          ipExport: pkg.ipExport || null,
          fupPolicy: pkg.fupPolicy || null,
          badge: pkg.fupPolicy && pkg.fupPolicy.trim().length > 0 ? "unlimited" : null,
          locationNetworkList: JSON.stringify(pkg.locationNetworkList || []),
          isActive: true,
        };
      });

      // Sync regions first (needed for FK)
      for (const region of Object.values(regionMap)) {
        await prisma.region.upsert({
          where: { id: region.id },
          update: { name: region.name, emoji: region.emoji },
          create: { id: region.id, name: region.name, emoji: region.emoji },
        });
      }

      // Sync countries (needed for FK)
      for (const country of Object.values(countryMap)) {
        await prisma.country.upsert({
          where: { code: country.code },
          update: { name: country.name, emoji: country.emoji },
          create: { id: country.id, name: country.name, code: country.code, emoji: country.emoji },
        });
      }

      // Delete existing plans
      await prisma.plan.deleteMany({});

      // Save plans in batches
      let totalCreated = 0;
      for (let i = 0; i < plans.length; i += 200) {
        await prisma.plan.createMany({ data: plans.slice(i, i + 200), skipDuplicates: true });
        totalCreated += Math.min(200, plans.length - i);
      }

      return NextResponse.json({ success: true, synced: totalCreated, total: packages.length, elapsed: `${((Date.now() - startTime) / 1000).toFixed(1)}s` });
    }

    // Query
    const regionId = url.searchParams.get("regionId") || undefined;
    const countryId = url.searchParams.get("countryId") || undefined;
    const search = url.searchParams.get("search") || undefined;
    const networkType = url.searchParams.get("networkType") || undefined;
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const minData = url.searchParams.get("minData");
    const maxData = url.searchParams.get("maxData");
    const dataType = url.searchParams.get("dataType");
    const dataAmount = url.searchParams.get("dataAmount");
    const durationDays = url.searchParams.get("durationDays");
    const sortBy = url.searchParams.get("sortBy") || "best";
    const limit = url.searchParams.get("limit");
    const id = url.searchParams.get("id");
    const slugParam = url.searchParams.get("slug");
    const planType = url.searchParams.get("planType") || undefined;

    // Single plan by ID or slug
    if (id) {
      const plan = await prisma.plan.findUnique({ where: { id } });
      if (plan) return NextResponse.json({ plans: [{ ...plan, dataVolume: Number(plan.dataVolume) }] });
      // Try as slug
      const bySlug = await prisma.plan.findFirst({ where: { slug: id } });
      if (bySlug) return NextResponse.json({ plans: [{ ...bySlug, dataVolume: Number(bySlug.dataVolume) }] });
      return NextResponse.json({ plans: [] });
    }

    if (slugParam) {
      const plan = await prisma.plan.findFirst({ where: { slug: slugParam } });
      if (plan) return NextResponse.json({ plans: [{ ...plan, dataVolume: Number(plan.dataVolume) }] });
      return NextResponse.json({ plans: [] });
    }

    const where: Record<string, unknown> = { isActive: true };
    
    // Exact country filter - match countryId exactly or in locations JSON
    if (countryId) {
      where.AND = [
        {
          OR: [
            { countryId: countryId },
            { locations: { contains: `"${countryId}"` } },
          ],
        },
      ];
    } else if (regionId) {
      // Filter by regionId - match regionId field or regionName
      where.AND = [
        {
          OR: [
            { regionId: regionId },
            { regionName: { equals: regionId, mode: "insensitive" } },
          ],
        },
      ];
    } else if (planType === "local") {
      where.countryId = { not: null };
      where.coverageCount = 1;
    } else if (planType === "region") {
      where.coverageCount = { gte: 2 };
    }
    // If no filter, show all active plans (no additional where clause)
    if (search) {
      const searchConditions = [
        { destination: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { countryName: { contains: search, mode: "insensitive" } },
      ];
      if (where.AND) {
        (where.AND as unknown[]).push({ OR: searchConditions });
      } else {
        where.AND = [{ OR: searchConditions }];
      }
    }
    if (networkType) where.networkType = { contains: networkType };
    if (dataType) where.dataType = parseInt(dataType);
    
    if (dataAmount) {
      const da = parseInt(dataAmount);
      if (da === 999) {
        where.dataAmount = { gte: 999 };
      } else {
        where.dataAmount = { gte: da - 1, lte: da + 1 };
      }
    }
    
    if (durationDays) {
      const dd = parseInt(durationDays);
      where.durationDays = { gte: dd - 2, lte: dd + 2 };
    }
    
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
      default: orderBy = [{ isBestSeller: "desc" }, { isPopular: "desc" }, { priceUsd: "asc" }];
    }

    const take = limit ? Math.min(parseInt(limit), 5000) : 5000;
    const plans = await prisma.plan.findMany({ where, orderBy, take });

    // Serialize BigInt to number for JSON
    const serialized = plans.map((p: { dataVolume: bigint }) => ({
      ...p,
      dataVolume: Number(p.dataVolume),
    }));

    return NextResponse.json({ plans: serialized, total: serialized.length });
  } catch (error) {
    console.error("Plans API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}