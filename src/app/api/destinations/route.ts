import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get visible destinations sorted by priority
    const destinations = await prisma.destination.findMany({
      where: { isVisible: true },
      orderBy: { priority: "asc" },
    });

    // Get minPrice and isHot status from Country and Plan tables
    const countries = await prisma.country.findMany({
      select: {
        code: true,
        minPrice: true,
      },
    });

    const countryPriceMap = Object.fromEntries(
      countries.map(c => [c.code, c.minPrice])
    );

    // Get hot plans to determine which destinations are hot
    const hotPlans = await prisma.plan.findMany({
      where: { isHot: true, isActive: true, countryId: { not: null } },
      select: { countryId: true },
    });
    const hotCountries = new Set(hotPlans.map(p => p.countryId));

    // Add minPrice and isHot to destinations
    const destinationsWithPrice = destinations.map(d => {
      const code = d.id.toUpperCase();
      return {
        ...d,
        minPrice: countryPriceMap[code] || null,
        isHot: hotCountries.has(code),
      };
    });

    // Get visible regions sorted by priority
    const regions = await prisma.destinationRegion.findMany({
      where: { isVisible: true },
      orderBy: { priority: "asc" },
    });

    // Also get regions from the original Region table for the filter bar
    const originalRegions = await prisma.region.findMany({
      include: {
        _count: {
          select: { plans: true },
        },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ 
      destinations: destinationsWithPrice, 
      regions,
      originalRegions 
    });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 });
  }
}