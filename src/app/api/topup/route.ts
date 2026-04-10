import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTopUp, getPackageList } from "@/lib/esim-access";

export async function POST(request: Request) {
  try {
    const { orderItemId, packageCode, periodNum } = await request.json();

    if (!orderItemId || !packageCode) {
      return NextResponse.json({ error: "orderItemId and packageCode required" }, { status: 400 });
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!orderItem) {
      return NextResponse.json({ error: "Order item not found" }, { status: 404 });
    }

    if (!orderItem.esimIccid && !orderItem.esimTranNo) {
      return NextResponse.json({ error: "No ICCID or esimTranNo found for this order" }, { status: 400 });
    }

    // Check plan supportTopUpType
    let supportTopUpType = 1;
    if (orderItem.planId) {
      const plan = await prisma.plan.findUnique({ where: { id: orderItem.planId } });
      if (plan) {
        supportTopUpType = plan.supportTopUpType || 1;
      }
    }

    // For type 3, periodNum is required
    if (supportTopUpType === 3 && !periodNum) {
      return NextResponse.json({ error: "Period number is required for this top-up type" }, { status: 400 });
    }

    const packages = await getPackageList({ iccid: orderItem.esimIccid ?? undefined, type: "TOPUP" });
    const packageList = packages.packageList || [];
    const topUpPackage = packageList.find((p: { packageCode: string }) => p.packageCode === packageCode);

    if (!topUpPackage) {
      return NextResponse.json({ error: "Invalid top-up package" }, { status: 400 });
    }

    const priceUSD = topUpPackage.price / 10000;

    // Build createTopUp params
    const topUpParams: {
      packageCode: string;
      iccid?: string;
      esimTranNo?: string;
      periodNum?: string;
      amount?: string;
    } = {
      packageCode,
    };

    if (orderItem.esimIccid) {
      topUpParams.iccid = orderItem.esimIccid;
    } else if (orderItem.esimTranNo) {
      topUpParams.esimTranNo = orderItem.esimTranNo;
    }
    
    if (supportTopUpType === 3 && periodNum) {
      topUpParams.periodNum = periodNum;
    }

    console.log("[Top-up] Creating top-up with params:", JSON.stringify(topUpParams, null, 2));

    const topUpResult = await createTopUp(topUpParams);

    // Update the order item with new volume
    await prisma.orderItem.update({
      where: { id: orderItem.id },
      data: {
        totalVolume: topUpResult.totalVolume,
        orderUsage: topUpResult.orderUsage,
      },
    });

    // Create a new order item for the top-up record (no planId since it's a top-up)
    const newOrderItem = await prisma.orderItem.create({
      data: {
        orderId: orderItem.orderId,
        planId: undefined, // No associated plan for top-up
        planName: `Top-up: ${topUpPackage.name || packageCode}`,
        price: priceUSD,
        quantity: 1,
        esimIccid: topUpResult.iccid,
        esimTranNo: topUpResult.topUpEsimTranNo,
        esimStatus: "IN_USE",
        smdpStatus: "ENABLED",
        totalVolume: topUpResult.totalVolume,
        orderUsage: 0,
      },
    });

    const updatedOrder = await prisma.order.update({
      where: { id: orderItem.orderId },
      data: { totalAmount: { increment: priceUSD } },
    });

    return NextResponse.json({
      success: true,
      topUp: {
        id: newOrderItem.id,
        packageCode,
        price: priceUSD,
        iccid: topUpResult.iccid,
        expiredTime: topUpResult.expiredTime,
        totalVolume: topUpResult.totalVolume,
        totalDuration: topUpResult.totalDuration,
        supportTopUpType,
      },
    });
  } catch (error) {
    console.error("[Top-up] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const iccid = url.searchParams.get("iccid");

    if (!iccid) {
      return NextResponse.json({ error: "ICCID required" }, { status: 400 });
    }

    const orderItem = await prisma.orderItem.findFirst({
      where: { esimIccid: iccid },
      include: { order: { include: { orderItems: true } } },
      orderBy: { id: "desc" },
    });

    if (!orderItem) {
      return NextResponse.json({ error: "No order found for this ICCID" }, { status: 404 });
    }

    const packages = await getPackageList({ iccid, type: "TOPUP" });
    const packageList = packages.packageList || [];
    
    // Get plan to check supportTopUpType
    let supportTopUpType = 1;
    if (orderItem.planId) {
      const plan = await prisma.plan.findUnique({ where: { id: orderItem.planId } });
      if (plan) {
        supportTopUpType = plan.supportTopUpType || 1;
      }
    }

    const topUpPackages = packageList.map((p: { packageCode: string; name: string; price: number; volume: number; duration: number }) => ({
      packageCode: p.packageCode,
      name: p.name,
      priceUSD: p.price / 10000,
      volume: p.volume,
      duration: p.duration,
    }));

    return NextResponse.json({
      currentPlan: {
        planName: orderItem.planName,
        iccid: orderItem.esimIccid!,
        esimStatus: orderItem.esimStatus,
        smdpStatus: orderItem.smdpStatus,
        totalVolume: orderItem.totalVolume || 0,
        orderUsage: orderItem.orderUsage || 0,
        orderItemId: orderItem.id,
        supportTopUpType,
      },
      topUpPackages,
    });
  } catch (error) {
    console.error("[Top-up GET] Error:", error);
    return NextResponse.json({ 
      error: "Unable to fetch top-up packages. Please try again later.",
      topUpPackages: [],
      currentPlan: null
    }, { status: 500 });
  }
}
