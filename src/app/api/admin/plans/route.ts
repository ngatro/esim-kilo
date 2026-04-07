import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isPopular, isBestSeller, isHot, isActive, priority, badge, priceUsd, priceRaw, retailPriceUsd, retailPriceRaw, supportTopUp } = body;

    if (!id) {
      return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (isPopular !== undefined) updateData.isPopular = isPopular;
    if (isBestSeller !== undefined) updateData.isBestSeller = isBestSeller;
    if (isHot !== undefined) updateData.isHot = isHot;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (priority !== undefined) updateData.priority = priority;
    if (badge !== undefined) updateData.badge = badge;
    if (priceUsd !== undefined) updateData.priceUsd = priceUsd;
    if (priceRaw !== undefined) updateData.priceRaw = priceRaw;
    if (retailPriceUsd !== undefined) updateData.retailPriceUsd = retailPriceUsd;
    if (retailPriceRaw !== undefined) updateData.retailPriceRaw = retailPriceRaw;
    if (supportTopUp !== undefined) updateData.supportTopUp = supportTopUp;

    const plan = await prisma.plan.update({
      where: { id },
      data: updateData,
    });

    const serializedPlan = {
      ...plan,
      dataVolume: plan.dataVolume.toString(),
      dataAmount: Number(plan.dataAmount),
      priceUsd: Number(plan.priceUsd),
      retailPriceUsd: Number(plan.retailPriceUsd),
      priceRaw: Number(plan.priceRaw),
      retailPriceRaw: Number(plan.retailPriceRaw),
    };

    return NextResponse.json({ success: true, plan: serializedPlan });
  } catch (error) {
    console.error("Plan update error:", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}