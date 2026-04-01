import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrder as createEsimOrder } from "@/lib/esim-access";

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
        orderItems: { include: { plan: { select: { name: true, packageCode: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ orders, total: orders.length });
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
      include: { plan: true },
    });

    if (!orderItem) {
      return NextResponse.json({ error: "Order item not found" }, { status: 404 });
    }

    if (orderItem.esimQrCode || orderItem.esimQrImage) {
      return NextResponse.json({ error: "eSIM already activated" }, { status: 400 });
    }

    if (!orderItem.plan?.packageCode) {
      return NextResponse.json({ error: "No package code found" }, { status: 400 });
    }

    // Call eSIM Access API
    const esimOrder = await createEsimOrder({
      packageCode: orderItem.plan.packageCode,
      count: orderItem.quantity,
    });

    // Update order item with eSIM data
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        esimIccid: esimOrder.iccid,
        esimQrCode: esimOrder.qrcode,
        esimQrImage: esimOrder.qrcodeUrl,
        activationCode: esimOrder.activationCode,
      },
    });

    // Update order with eSIM order info
    await prisma.order.update({
      where: { id: orderItem.orderId },
      data: {
        esimaccessOrderId: esimOrder.orderNo,
        esimaccessOrderStatus: esimOrder.orderStatus,
      },
    });

    return NextResponse.json({
      success: true,
      esim: {
        iccid: esimOrder.iccid,
        qrCode: esimOrder.qrcode,
        qrImage: esimOrder.qrcodeUrl,
        activationCode: esimOrder.activationCode,
        orderNo: esimOrder.orderNo,
      },
    });
  } catch (error) {
    console.error("eSIM activation error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}