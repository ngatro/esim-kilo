import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get topup packages for given plan IDs (public, no auth)
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const planIds = url.searchParams.get("planIds"); // comma-separated plan IDs

    if (!planIds) {
      return NextResponse.json({ error: "planIds required" }, { status: 400 });
    }

    const ids = planIds.split(",").filter(Boolean);

    const packages = await prisma.topupPackage.findMany({
      where: {
        planId: { in: ids },
        isActive: true,
      },
      select: {
        id: true,
        planId: true,
        packageCode: true,
        name: true,
        priceUsd: true,
        retailPriceUsd: true,
        isFlexible: true,
        isActive: true,
      },
      orderBy: { priority: "asc" },
    });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Error fetching topup packages:", error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}