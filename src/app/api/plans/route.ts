import { NextResponse } from "next/server";
import { getPackageList } from "@/lib/esim-access";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const regionId = url.searchParams.get("regionId") || undefined;
    const countryId = url.searchParams.get("countryId") || undefined;
    const search = url.searchParams.get("search") || undefined;
    const networkType = url.searchParams.get("networkType") || undefined;
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const minData = url.searchParams.get("minData");
    const isPopular = url.searchParams.get("isPopular");
    const isBestSeller = url.searchParams.get("isBestSeller");
    const isHot = url.searchParams.get("isHot");
    const sync = url.searchParams.get("sync");

    if (sync === "true") {
      const { packages } = await getPackageList({ size: 200 });
      
      for (const pkg of packages) {
        const planId = `esimaccess-${pkg.packageCode}`;
        const isUnlimited = pkg.unlimitedData;
        const dataAmount = isUnlimited ? 999 : Math.floor(pkg.dataVolume);
        const priceUsd = pkg.price;
        
        let regionIdDb: string | null = null;
        let countryIdDb: string | null = null;
        let destination = pkg.locationName || "Global";
        
        if (pkg.coverageCountryList && pkg.coverageCountryList.length === 1) {
          countryIdDb = pkg.coverageCountryList[0].countryCode;
          destination = pkg.coverageCountryList[0].countryName;
          
          const country = await prisma.country.findUnique({
            where: { id: countryIdDb },
          });
          if (country) regionIdDb = country.regionId;
        } else if (pkg.coverageCountryList && pkg.coverageCountryList.length > 1) {
          if (pkg.locationName) {
            const region = await prisma.region.findFirst({
              where: { name: { contains: pkg.locationName, mode: "insensitive" } },
            });
            if (region) regionIdDb = region.id;
          }
        }

        await prisma.plan.upsert({
          where: { id: planId },
          update: {
            name: pkg.packageName,
            destination,
            regionId: regionIdDb,
            countryId: countryIdDb,
            dataAmount,
            validityDays: pkg.durationDay,
            priceUsd,
            coverageCountries: pkg.coverageCountryList?.length || 1,
            networkType: pkg.networkType || "4G",
            speeds: pkg.speedDesc ? [pkg.speedDesc] : [],
            features: [
              isUnlimited ? "Unlimited Data" : `${dataAmount}GB Data`,
              `${pkg.durationDay} Days`,
              pkg.networkType || "4G LTE",
              "Instant Activation",
              "No Contract",
            ],
            esimaccessPackageName: pkg.packageName,
            esimaccessPackageCode: pkg.packageCode,
            esimaccessRawData: pkg as unknown as object,
            isActive: true,
          },
          create: {
            id: planId,
            name: pkg.packageName,
            destination,
            regionId: regionIdDb,
            countryId: countryIdDb,
            dataAmount,
            validityDays: pkg.durationDay,
            priceUsd,
            coverageCountries: pkg.coverageCountryList?.length || 1,
            networkType: pkg.networkType || "4G",
            speeds: pkg.speedDesc ? [pkg.speedDesc] : [],
            features: [
              isUnlimited ? "Unlimited Data" : `${dataAmount}GB Data`,
              `${pkg.durationDay} Days`,
              pkg.networkType || "4G LTE",
              "Instant Activation",
              "No Contract",
            ],
            esimaccessPackageName: pkg.packageName,
            esimaccessPackageCode: pkg.packageCode,
            esimaccessRawData: pkg as unknown as object,
            isActive: true,
          },
        });
      }

      return NextResponse.json({ success: true, synced: packages.length });
    }

    const where: Record<string, unknown> = { isActive: true };
    if (regionId) where.regionId = regionId;
    if (countryId) where.countryId = countryId;
    if (search) where.destination = { contains: search, mode: "insensitive" };
    if (networkType) where.networkType = { contains: networkType };
    if (minPrice) where.priceUsd = { ...(where.priceUsd as object || {}), gte: parseFloat(minPrice) };
    if (maxPrice) where.priceUsd = { ...(where.priceUsd as object || {}), lte: parseFloat(maxPrice) };
    if (minData) where.dataAmount = { gte: parseInt(minData) };
    if (isPopular === "true") where.isPopular = true;
    if (isBestSeller === "true") where.isBestSeller = true;
    if (isHot === "true") where.isHot = true;

    const plans = await prisma.plan.findMany({
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

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Plans API error:", error);
    return NextResponse.json(
      { error: "Failed to get plans" },
      { status: 500 }
    );
  }
}