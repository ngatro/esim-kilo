import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CountryWithPlan {
  id: string;
  code: string;
  name: string;
  emoji: string;
  plans: { regionName: string | null }[];
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim();
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10") || 10, 50);

    const where = q ? {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
      ],
    } : {};

    const countries = await prisma.country.findMany({
      where,
      select: {
        id: true,
        code: true,
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

    const results: CountryWithPlan[] = countries.map((c: CountryWithPlan) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      emoji: c.emoji,
      regionName: c.plans[0]?.regionName || null,
    }));

    return NextResponse.json({ countries: results });
  } catch (error) {
    console.error("Country search error:", error);
    return NextResponse.json({ error: "Failed to search countries" }, { status: 500 });
  }
}