import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get visible destinations sorted by priority
    const destinations = await prisma.destination.findMany({
      where: { isVisible: true },
      orderBy: { priority: "asc" },
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
      destinations, 
      regions,
      originalRegions 
    });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 });
  }
}