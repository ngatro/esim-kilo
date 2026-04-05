import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const countryCode = params.id;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "15");

    const plans = await prisma.plan.findMany({
      where: { 
        countryId: countryCode.toUpperCase(),
        isActive: true 
      },
      select: { dataAmount: true, durationDays: true },
      take: limit,
    });

    // Extract unique data amounts and durations
    const dataAmountsSet = new Set<number>();
    plans.forEach((p: { dataAmount: number }) => dataAmountsSet.add(p.dataAmount));
    const dataAmounts = Array.from(dataAmountsSet).sort((a, b) => a - b);
    
    const durationsSet = new Set<number>();
    plans.forEach((p: { durationDays: number }) => durationsSet.add(p.durationDays));
    const durations = Array.from(durationsSet).sort((a, b) => a - b);

    return NextResponse.json({ 
      dataAmounts, 
      durations,
      count: plans.length 
    });
  } catch (error) {
    console.error("Country filters error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}