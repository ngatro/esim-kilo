import { NextResponse } from "next/server";
import { getPackageList } from "@/lib/esim-access";
import { prisma } from "@/lib/prisma";

function bytesToGB(bytes: number): number {
  return Math.round((bytes / (1024 * 1024 * 1024)) * 10) / 10;
}

function generateSlug(name: string, fupPolicy?: string | null): string {
  // 1. Dọn dẹp cái name gốc (Turkey 500MB/Day -> turkey-500mb-day)
  let cleanName = name
    .replace(/[()]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  // 2. Logic "Chủ tịch": Chỉ tin vào fupPolicy để định danh Unlimited
  // Nếu fupPolicy có chữ (không rỗng, không null) -> Đây là gói Unlimited
  const isUnlimited = fupPolicy && fupPolicy.trim().length > 0;

  // 3. Trả về Slug "Vua SEO"
  if (isUnlimited) {
    return `esim-${cleanName}-unlimited`;
  }

  return `esim-${cleanName}`;
}

const COUNTRY_TO_REGION: Record<string, { regionId: string; regionName: string; countryName: string }> = {
  FR: { regionId: "europe", regionName: "Europe", countryName: "France" },
  DE: { regionId: "europe", regionName: "Europe", countryName: "Germany" },
  IT: { regionId: "europe", regionName: "Europe", countryName: "Italy" },
  ES: { regionId: "europe", regionName: "Europe", countryName: "Spain" },
  GB: { regionId: "europe", regionName: "Europe", countryName: "United Kingdom" },
  NL: { regionId: "europe", regionName: "Europe", countryName: "Netherlands" },
  BE: { regionId: "europe", regionName: "Europe", countryName: "Belgium" },
  AT: { regionId: "europe", regionName: "Europe", countryName: "Austria" },
  PT: { regionId: "europe", regionName: "Europe", countryName: "Portugal" },
  GR: { regionId: "europe", regionName: "Europe", countryName: "Greece" },
  PL: { regionId: "europe", regionName: "Europe", countryName: "Poland" },
  CH: { regionId: "europe", regionName: "Europe", countryName: "Switzerland" },
  SE: { regionId: "europe", regionName: "Europe", countryName: "Sweden" },
  NO: { regionId: "europe", regionName: "Europe", countryName: "Norway" },
  DK: { regionId: "europe", regionName: "Europe", countryName: "Denmark" },
  FI: { regionId: "europe", regionName: "Europe", countryName: "Finland" },
  IE: { regionId: "europe", regionName: "Europe", countryName: "Ireland" },
  CZ: { regionId: "europe", regionName: "Europe", countryName: "Czech Republic" },
  HU: { regionId: "europe", regionName: "Europe", countryName: "Hungary" },
  RO: { regionId: "europe", regionName: "Europe", countryName: "Romania" },
  RU: { regionId: "europe", regionName: "Europe", countryName: "Russia" },
  UA: { regionId: "europe", regionName: "Europe", countryName: "Ukraine" },
  TR: { regionId: "europe", regionName: "Europe", countryName: "Turkey" },
  JP: { regionId: "asia", regionName: "Asia", countryName: "Japan" },
  KR: { regionId: "asia", regionName: "Asia", countryName: "South Korea" },
  CN: { regionId: "asia", regionName: "Asia", countryName: "China" },
  TH: { regionId: "asia", regionName: "Asia", countryName: "Thailand" },
  VN: { regionId: "asia", regionName: "Asia", countryName: "Vietnam" },
  SG: { regionId: "asia", regionName: "Asia", countryName: "Singapore" },
  MY: { regionId: "asia", regionName: "Asia", countryName: "Malaysia" },
  ID: { regionId: "asia", regionName: "Asia", countryName: "Indonesia" },
  PH: { regionId: "asia", regionName: "Asia", countryName: "Philippines" },
  TW: { regionId: "asia", regionName: "Asia", countryName: "Taiwan" },
  HK: { regionId: "asia", regionName: "Asia", countryName: "Hong Kong" },
  IN: { regionId: "asia", regionName: "Asia", countryName: "India" },
  US: { regionId: "americas", regionName: "Americas", countryName: "United States" },
  CA: { regionId: "americas", regionName: "Americas", countryName: "Canada" },
  MX: { regionId: "americas", regionName: "Americas", countryName: "Mexico" },
  BR: { regionId: "americas", regionName: "Americas", countryName: "Brazil" },
  AR: { regionId: "americas", regionName: "Americas", countryName: "Argentina" },
  CO: { regionId: "americas", regionName: "Americas", countryName: "Colombia" },
  CL: { regionId: "americas", regionName: "Americas", countryName: "Chile" },
  PE: { regionId: "americas", regionName: "Americas", countryName: "Peru" },
  AE: { regionId: "middle-east", regionName: "Middle East", countryName: "UAE" },
  SA: { regionId: "middle-east", regionName: "Middle East", countryName: "Saudi Arabia" },
  QA: { regionId: "middle-east", regionName: "Middle East", countryName: "Qatar" },
  KW: { regionId: "middle-east", regionName: "Middle East", countryName: "Kuwait" },
  BH: { regionId: "middle-east", regionName: "Middle East", countryName: "Bahrain" },
  IL: { regionId: "middle-east", regionName: "Middle East", countryName: "Israel" },
  ZA: { regionId: "africa", regionName: "Africa", countryName: "South Africa" },
  EG: { regionId: "africa", regionName: "Africa", countryName: "Egypt" },
  NG: { regionId: "africa", regionName: "Africa", countryName: "Nigeria" },
  KE: { regionId: "africa", regionName: "Africa", countryName: "Kenya" },
  MA: { regionId: "africa", regionName: "Africa", countryName: "Morocco" },
  AU: { regionId: "oceania", regionName: "Oceania", countryName: "Australia" },
  NZ: { regionId: "oceania", regionName: "Oceania", countryName: "New Zealand" },
};

function resolveLocation(pkg: Record<string, unknown>) {
  const locationCode = (pkg.locationCode as string) || "";
  const pkgName = (pkg.name as string) || "";
  const locations = ((pkg.location as string) || "").split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);

  if (locationCode === "!GL") return { regionId: "global", regionName: "Global", countryId: null, countryName: "", destination: pkgName || "Global" };
  if (locationCode === "!RG" || locations.length > 5) return { regionId: "global", regionName: "Global", countryId: null, countryName: "", destination: pkgName || locationCode };

  if (locations.length === 1) {
    const info = COUNTRY_TO_REGION[locations[0]];
    if (info) return { regionId: info.regionId, regionName: info.regionName, countryId: locations[0], countryName: info.countryName, destination: pkgName || info.countryName };
  }

  if (locations.length > 1) {
    const counts: Record<string, number> = {};
    for (const loc of locations) {
      const info = COUNTRY_TO_REGION[loc];
      if (info) counts[info.regionId] = (counts[info.regionId] || 0) + 1;
    }
    let maxR = "global"; let maxC = 0;
    for (const [r, c] of Object.entries(counts)) { if (c > maxC) { maxC = c; maxR = r; } }
    return { regionId: maxR, regionName: maxR.charAt(0).toUpperCase() + maxR.slice(1), countryId: null, countryName: "", destination: pkgName || locationCode };
  }

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

      const plans = packages.map((pkg) => {
        const dataAmount = bytesToGB(pkg.volume);
        const priceUsd = pkg.price / 10000;

        // tính giá hiển thị
        let rawRetailPrice;
        // 1. Phân khúc tỉ lệ lãi (Markup)
        if (priceUsd < 20) {
            rawRetailPrice = priceUsd * 2.5; // Gói nhỏ: x2.5
        } else if (priceUsd < 50) {
            rawRetailPrice = priceUsd * 1.8; // Gói vừa: x1.8
        } else {
            rawRetailPrice = priceUsd * 1.1; // Gói lớn: x1.1
        }

        // 2. Làm tròn 2 chữ số thập phân và đảm bảo tối thiểu 1.99$
        const retailPriceUsd = Math.round(Math.max(rawRetailPrice, 1.99) * 100) / 100;

                // const retailPriceUsd = (pkg.retailPrice || pkg.price) / 10000;
        const loc = resolveLocation(pkg as unknown as Record<string, unknown>);
        const allNet = new Set<string>();
        pkg.locationNetworkList?.forEach((l) => l.operatorList?.forEach((o) => allNet.add(o.networkType)));
        const networkType = [...allNet].join("/") || "4G";
        const locations = (pkg.location || "").split(",").map((s: string) => s.trim()).filter(Boolean);
        const badge = (pkg.fupPolicy && pkg.fupPolicy.trim().length > 0) 
          ? "Unlimited" 
          : null;

        return {
          id: `esimaccess-${pkg.packageCode}`,
          name: pkg.name,
          slug: generateSlug(pkg.name, pkg.fupPolicy),
          packageCode: pkg.packageCode,
          description: pkg.description || null,
          destination: loc.destination,
          regionId: loc.regionId,
          regionName: loc.regionName,
          countryId: loc.countryId,
          countryName: loc.countryName,
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
          locations: JSON.stringify(locations),
          coverageCount: locations.length || 1,
          smsStatus: pkg.smsStatus || 0,
          activeType: pkg.activeType || 1,
          supportTopUp: pkg.supportTopUpType === 2,
          unusedValidTime: pkg.unusedValidTime || 0,
          ipExport: pkg.ipExport || null,
          fupPolicy: pkg.fupPolicy || null,
          locationNetworkList: JSON.stringify(pkg.locationNetworkList || []),
          isActive: true,
          badge: badge,
        };
      });

      await prisma.plan.deleteMany({});
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
    const limit = url.searchParams.get("limit"); // Display limit (e.g., 20)
    const id = url.searchParams.get("id");
    const slugParam = url.searchParams.get("slug");

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
    if (regionId) where.regionId = regionId;
    if (countryId) where.countryId = countryId;
    if (search) {
      where.OR = [
        { destination: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { countryName: { contains: search, mode: "insensitive" } },
      ];
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

    const take = limit ? parseInt(limit) : 500;
    const plans = await prisma.plan.findMany({ where, orderBy, take });

    // Serialize BigInt to number for JSON
    const serialized = plans.map((p) => ({
      ...p,
      dataVolume: Number(p.dataVolume),
    }));

    // Generate aggregations for dynamic filters (dataAmounts and durations)
    let aggregations: { dataAmounts: number[]; durations: number[] } | undefined;
    if (regionId || countryId || search) {
      // Get all matching plans without limit to extract unique dataAmounts and durations
      const allMatchingPlans = await prisma.plan.findMany({ 
        where, 
        select: { dataAmount: true, durationDays: true },
        orderBy: [{ dataAmount: "asc" }, { durationDays: "asc" }]
      });
      
      const dataAmountsSet = new Set<number>();
      const durationsSet = new Set<number>();
      
      allMatchingPlans.forEach((plan) => {
        if (plan.dataAmount) {
          // Round to nearest integer for display
          const rounded = Math.round(plan.dataAmount);
          dataAmountsSet.add(rounded);
        }
        if (plan.durationDays) {
          durationsSet.add(plan.durationDays);
        }
      });
      
      aggregations = {
        dataAmounts: Array.from(dataAmountsSet).sort((a, b) => a - b),
        durations: Array.from(durationsSet).sort((a, b) => a - b),
      };
    }

    return NextResponse.json({ 
      plans: serialized, 
      total: serialized.length,
      aggregations 
    });
  } catch (error) {
    console.error("Plans API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}