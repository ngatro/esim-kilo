import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queryEsimUsage } from "@/lib/esim-access";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== "Bearer " + cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        esimIccid: { not: null },
        esimTranNo: { not: null },
        esimStatus: { in: ["GOT_RESOURCE", "ACTIVATED"] },
      },
      include: { order: true },
    });

    console.log(`[Usage Sync] Checking ${orderItems.length} active eSIMs`);

    let updated = 0;
    let failed = 0;

    for (const item of orderItems) {
      try {
        const usage = await queryEsimUsage(item.esimIccid!);
        
        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            esimStatus: usage.esimStatus,
            orderUsage: usage.orderUsage,
            lastUsageSync: new Date(),
          },
        });

        updated++;
      } catch (err) {
        console.error("[Usage Sync] Failed for ICCID " + item.esimIccid + ":", err);
        failed++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      checked: orderItems.length, 
      updated, 
      failed 
    });
  } catch (error) {
    console.error("[Usage Sync] Error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}