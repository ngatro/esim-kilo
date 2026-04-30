import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.length < 1) {
      return NextResponse.json({ countries: [] });
    }

    // Search countries by name (case-insensitive)
    const countries = await prisma.country.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        emoji: true,
        plans: {
          where: { isActive: true },
          select: { regionName: true },
          take: 1,
        },
      },
      take: limit,
      orderBy: { name: "asc" },
    });

    // Format response with country info + plan count + regionName
    const result = await Promise.all(
      countries.map(async (country) => {
        const planCount = await prisma.plan.count({
          where: { countryId: country.id, isActive: true },
        });
        return {
          id: country.id,
          code: country.id,
          name: country.name,
          emoji: country.emoji,
          regionName: country.plans[0]?.regionName || null,
          planCount,
        };
      })
    );

    return NextResponse.json({ countries: result });
  } catch (error) {
    console.error("Country search error:", error);
    return NextResponse.json({ error: "Failed to search countries" }, { status: 500 });
  }
}
