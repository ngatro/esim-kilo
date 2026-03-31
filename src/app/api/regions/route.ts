import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      include: {
        countries: true,
        _count: {
          select: { plans: { where: { isActive: true } } },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ regions });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get regions" }, { status: 500 });
  }
}