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
      include: {
        region: {
          select: { id: true, name: true, emoji: true },
        },
      },
      take: limit,
      orderBy: { name: "asc" },
    });

    // Format response with country info + plan count
    const result = await Promise.all(
      countries.map(async (country: { id: string; name: string; emoji: string; regionId: string | null; region: { id: string; name: string; emoji: string } | null }) => {
        const planCount = await prisma.plan.count({
          where: { countryId: country.id, isActive: true },
        });
        return {
          id: country.id,
          code: country.id, // Add code field for compatibility
          name: country.name,
          emoji: country.emoji,
          regionId: country.regionId,
          regionName: country.region?.name,
          regionEmoji: country.region?.emoji,
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