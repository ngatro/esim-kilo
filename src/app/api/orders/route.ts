import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const cookie = request.headers.get("cookie");
    const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(token);
    const { items, totalAmount } = await request.json();

    const order = await db.insert(orders).values({
      userId,
      totalAmount,
      status: "completed",
    }).returning();

    const orderId = order[0].id;

    for (const item of items) {
      await db.insert(orderItems).values({
        orderId,
        planId: item.planId,
        planName: item.planName,
        price: item.price,
        quantity: item.quantity,
      });
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    return NextResponse.json({ error: "Order failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get("cookie");
    const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(token);
    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId));

    return NextResponse.json({ orders: userOrders });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
