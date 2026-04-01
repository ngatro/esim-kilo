import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrder, queryOrder } from "@/lib/esim-access";

export async function POST(request: Request) {
  try {
    const cookie = request.headers.get("cookie");
    const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
    
    const userId = token ? parseInt(token) : null;
    const { items, customerName, customerEmail } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    let totalAmount = 0;
    const orderItemsData: {
      planId: string | null;
      planName: string;
      price: number;
      quantity: number;
    }[] = [];

    for (const item of items) {
      const plan = await prisma.plan.findUnique({
        where: { id: item.planId },
      });

      if (!plan) {
        return NextResponse.json(
          { error: `Plan not found: ${item.planId}` },
          { status: 400 }
        );
      }

      const itemTotal = plan.priceUsd * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        planId: plan.id,
        planName: plan.name,
        price: plan.priceUsd,
        quantity: item.quantity || 1,
      });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: "completed",
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: true,
      },
    });

    const esimResults: { orderItem: number; status: string; orderNo: string }[] = [];

    for (const orderItem of order.orderItems) {
      const plan = await prisma.plan.findUnique({
        where: { id: orderItem.planId || "" },
      });

      if (plan?.packageCode) {
        try {
          const esimOrder = await createOrder({
            packageCode: plan.packageCode,
            count: orderItem.quantity,
          });

          await prisma.orderItem.update({
            where: { id: orderItem.id },
            data: {
              esimIccid: esimOrder.iccid,
              esimQrCode: esimOrder.qrcode,
              esimQrImage: esimOrder.qrcodeUrl,
              activationCode: esimOrder.activationCode,
            },
          });

          esimResults.push({
            orderItem: orderItem.id,
            status: esimOrder.orderStatus,
            orderNo: esimOrder.orderNo,
          });

          await prisma.order.update({
            where: { id: order.id },
            data: {
              esimaccessOrderId: esimOrder.orderNo,
              esimaccessOrderStatus: esimOrder.orderStatus,
            },
          });
        } catch (esimError) {
          console.error("eSIM Access order error:", esimError);
        }
      }
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { orderItems: true },
    });

    return NextResponse.json({ success: true, order: updatedOrder, esimResults });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Order failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    const cookie = request.headers.get("cookie");
    const token = cookie?.match(/auth-token=([^;]+)/)?.[1];

    const where: Record<string, unknown> = {};

    if (token) {
      where.userId = parseInt(token);
    } else if (email) {
      where.customerEmail = email;
    } else {
      return NextResponse.json({ error: "Unauthorized - login or provide email" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}