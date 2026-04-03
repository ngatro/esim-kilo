import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrder as createEsimOrder, cancelOrder as cancelEsimOrder, queryOrder, queryEsimUsage } from "@/lib/esim-access";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || undefined;
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Fetch plans separately for each order item
    const ordersWithPlans = await Promise.all(
      orders.map(async (order) => {
        const itemsWithPlans = await Promise.all(
          order.orderItems.map(async (item) => {
            let plan = null;
            if (item.planId) {
              plan = await prisma.plan.findUnique({
                where: { id: item.planId },
                select: { id: true, name: true, packageCode: true, destination: true },
              });
            }
            return { ...item, plan };
          })
        );
        return { ...order, orderItems: itemsWithPlans };
      })
    );

    return NextResponse.json({ orders: ordersWithPlans, total: orders.length });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// Admin: Activate eSIM for an order item
export async function POST(request: Request) {
  try {
    const { orderItemId } = await request.json();

    if (!orderItemId) {
      return NextResponse.json({ error: "Order item ID required" }, { status: 400 });
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
    });

    if (!orderItem) {
      return NextResponse.json({ error: "Order item not found" }, { status: 404 });
    }

    if (orderItem.esimQrCode || orderItem.esimQrImage) {
      return NextResponse.json({ error: "eSIM already activated" }, { status: 400 });
    }

    // Fetch plan separately to get packageCode, or use it from order item
    const plan = orderItem.planId
      ? await prisma.plan.findUnique({ where: { id: orderItem.planId } })
      : null;

    // Try: plan.packageCode > orderItem.packageCode
    const packageCode = plan?.packageCode || orderItem.packageCode;

    console.log(`[eSIM] OrderItem ${orderItemId}, planId: ${orderItem.planId}, packageCode: ${packageCode}, planExists: ${!!plan}`);

    if (!packageCode) {
      return NextResponse.json({
        error: "No package code found. Plan may not be linked to this order item.",
        debug: { planId: orderItem.planId, planName: orderItem.planName, planExists: !!plan },
      }, { status: 400 });
    }

    // Call eSIM Access API
    console.log("[eSIM Activation] Calling eSIM Access with packageCode: " + packageCode);
    const esimOrder = await createEsimOrder({
      packageCode,
      count: orderItem.quantity,
    });
    console.log("[eSIM Activation] eSIM Access response:", JSON.stringify(esimOrder));

    // Update order item with eSIM data
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        esimIccid: esimOrder.iccid || null,
        esimEid: esimOrder.eid || null,
        esimTranNo: esimOrder.esimTranNo || null,
        esimQrCode: esimOrder.qrCode || null,
        esimQrImage: esimOrder.qrCodeUrl || null,
        esimLpaString: esimOrder.ac || esimOrder.lpaString || null,
        activationCode: esimOrder.activationCode || null,
        totalVolume: esimOrder.totalVolume || null,
        smdpStatus: esimOrder.smdpStatus || null,
        esimStatus: esimOrder.esimStatus || null,
      },
    });

    // Update order with eSIM order info
    await prisma.order.update({
      where: { id: orderItem.orderId },
      data: {
        esimaccessOrderId: esimOrder.orderNo || esimOrder.iccid,
        esimaccessOrderStatus: esimOrder.esimStatus || esimOrder.orderStatus || "activated",
      },
    });

    console.log("[eSIM Activation] Success! ICCID: " + esimOrder.iccid);

    return NextResponse.json({
      success: true,
      esim: {
        iccid: esimOrder.iccid,
        qrCode: esimOrder.qrCode,
        qrImage: esimOrder.qrCodeUrl,
        activationCode: esimOrder.activationCode,
        lpaString: esimOrder.ac,
        totalVolume: esimOrder.totalVolume,
        esimStatus: esimOrder.esimStatus,
        orderNo: esimOrder.orderNo,
      },
    });
  } catch (error) {
    console.error("[eSIM Activation] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// Admin: Cancel/Refund eSIM (unused only)
export async function DELETE(request: Request) {
  try {
    const { orderItemId } = await request.json();

    if (!orderItemId) {
      return NextResponse.json({ error: "Order item ID required" }, { status: 400 });
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
    });

    if (!orderItem) {
      return NextResponse.json({ error: "Order item not found" }, { status: 404 });
    }

    if (!orderItem.esimTranNo) {
      return NextResponse.json({ error: "No esimTranNo - eSIM may not be activated" }, { status: 400 });
    }

    if (orderItem.orderUsage && orderItem.orderUsage > 0) {
      return NextResponse.json({ error: "Cannot cancel - eSIM has been used", used: orderItem.orderUsage }, { status: 400 });
    }

    const canceled = await cancelEsimOrder(orderItem.esimTranNo);

    if (!canceled) {
      return NextResponse.json({ error: "Failed to cancel eSIM" }, { status: 500 });
    }

    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        esimStatus: "CANCELED",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[eSIM Cancel] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// Admin: Sync eSIM usage/status from provider
export async function PATCH(request: Request) {
  try {
    const { orderItemId, orderNo } = await request.json();

    if (!orderNo) {
      return NextResponse.json({ error: "Order number required" }, { status: 400 });
    }

    const esimData = await queryOrder(orderNo);
    
    if (!esimData?.iccid) {
      return NextResponse.json({ error: "No eSIM data found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      esimIccid: esimData.iccid,
      esimEid: esimData.eid || null,
      esimTranNo: esimData.esimTranNo || null,
      esimQrCode: esimData.qrCode || null,
      esimQrImage: esimData.qrCodeUrl || null,
      esimLpaString: esimData.ac || null,
      activationCode: esimData.activationCode || null,
      totalVolume: esimData.totalVolume || null,
      smdpStatus: esimData.smdpStatus || null,
      esimStatus: esimData.esimStatus || null,
      orderUsage: esimData.orderUsage || 0,
      lastUsageSync: new Date(),
    };

    if (orderItemId) {
      await prisma.orderItem.update({
        where: { id: orderItemId },
        data: updateData,
      });
    } else {
      await prisma.orderItem.updateMany({
        where: { esimTranNo: esimData.esimTranNo },
        data: updateData,
      });
    }

    return NextResponse.json({ success: true, data: esimData });
  } catch (error) {
    console.error("[eSIM Sync] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}