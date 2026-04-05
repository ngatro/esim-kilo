import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { name: "asc" },
    });

    const regionsWithCount = await Promise.all(
      regions.map(async (r: { id: string; name: string; emoji: string }) => {
        const planCount = await prisma.plan.count({ where: { regionId: r.id, isActive: true } });
        // Get countries that have plans in this region
        const countryIds = await prisma.plan.findMany({
          where: { regionId: r.id, isActive: true, countryId: { not: null } },
          select: { countryId: true },
          distinct: ["countryId"],
        });
        const countryIdList = countryIds.map((p: { countryId: string | null }) => p.countryId).filter(Boolean) as string[];
        const countries = await prisma.country.findMany({
          where: { id: { in: countryIdList } },
          take: 20,
        });
        return {
          ...r,
          planCount,
          countries: countries.map((c: { id: string; name: string; emoji: string }) => ({ id: c.id, name: c.name, emoji: c.emoji })),
        };
      })
    );

    return NextResponse.json({ regions: regionsWithCount });
  } catch (error) {
    console.error("Regions API error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}