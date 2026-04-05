import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: countryCode } = await params;
    const code = countryCode.toUpperCase();
    
    // Check if country exists
    const country = await prisma.country.findUnique({
      where: { code },
    });

    if (!country) {
      return NextResponse.json({ 
        dataAmounts: [], 
        durations: [],
        count: 0 
      });
    }

    // Get plans for this country
    const plans = await prisma.plan.findMany({
      where: { 
        countryId: code,
        isActive: true 
      },
      select: { dataAmount: true, durationDays: true },
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