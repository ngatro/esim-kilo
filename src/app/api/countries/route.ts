import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const where = q ? {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
      ],
    } : {};

    const countries = await prisma.country.findMany({
      where,
      include: { 
        plans: {
          where: { isActive: true },
          select: { regionName: true },
          take: 1,
        }
      },
      take: limit,
      orderBy: { name: "asc" },
    });

    const results = countries.map((c: { id: string; code: string; name: string; emoji: string; plans: { regionName: string | null }[] }) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      emoji: c.emoji,
      regionName: c.plans[0]?.regionName || null,
    }));

    return NextResponse.json({ countries: results });
  } catch (error) {
    console.error("Country search error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}