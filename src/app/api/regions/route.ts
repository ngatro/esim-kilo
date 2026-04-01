import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      include: { countries: true },
      orderBy: { name: "asc" },
    });

    // Count plans per region
    const regionsWithCount = await Promise.all(
      regions.map(async (r) => ({
        ...r,
        planCount: await prisma.plan.count({ where: { regionId: r.id, isActive: true } }),
      }))
    );

    return NextResponse.json({ regions: regionsWithCount });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}