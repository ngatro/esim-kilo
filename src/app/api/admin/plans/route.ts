import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const { id, isPopular, isBestSeller, isHot, isActive, priority, badge } = await request.json();

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

    const plan = await prisma.plan.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Plan update error:", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}