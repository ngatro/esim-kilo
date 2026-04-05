import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get("countryId");

    if (!countryId) {
      return NextResponse.json({ error: "Country ID required" }, { status: 400 });
    }

    // Get all active plans for this country
    const plans = await prisma.plan.findMany({
      where: { countryId, isActive: true },
      select: { dataAmount: true, durationDays: true },
    });

    // Extract unique data amounts and durations
    const dataAmountsSet = new Set<number>();
    const durationsSet = new Set<number>();

    plans.forEach((plan) => {
      if (plan.dataAmount) {
        dataAmountsSet.add(Math.round(plan.dataAmount));
      }
      if (plan.durationDays) {
        durationsSet.add(plan.durationDays);
      }
    });

    return NextResponse.json({
      filters: {
        dataAmounts: Array.from(dataAmountsSet).sort((a, b) => a - b),
        durations: Array.from(durationsSet).sort((a, b) => a - b),
      },
      planCount: plans.length,
    });
  } catch (error) {
    console.error("Country filters error:", error);
    return NextResponse.json({ error: "Failed to get filters" }, { status: 500 });
  }
}