import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderNo = url.searchParams.get("orderNo");
    const limit = parseInt(url.searchParams.get("limit") || "100");

    const where: Record<string, unknown> = {};
    if (orderNo) where.orderNo = orderNo;

    const logs = await prisma.webhookLog.findMany({
      where,
      orderBy: { processedAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("[Admin Webhooks] Error:", error);
    return NextResponse.json({ error: "Failed to fetch webhook logs" }, { status: 500 });
  }
}