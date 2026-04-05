import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBalance } from "@/lib/esim-access";

export async function GET() {
  try {
    const [totalUsers, totalOrders, totalPlans, activePlans, recentOrders] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.plan.count(),
      prisma.plan.count({ where: { isActive: true } }),
      prisma.order.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { orderItems: true } }),
    ]);

    let balance = { balance: 0, currency: "USD" };
    try {
      balance = await getBalance();
    } catch (e) {
      console.error("Failed to get balance:", e);
    }

    const totalRevenue = await prisma.order.aggregate({
      where: { status: "completed" },
      _sum: { totalAmount: true },
    });

    const regions = await prisma.region.findMany();

    const regionsWithCount = await Promise.all(
      regions.map(async (r: { id: string; name: string; emoji: string }) => ({
        id: r.id,
        name: r.name,
        emoji: r.emoji,
        planCount: await prisma.plan.count({ where: { regionId: r.id, isActive: true } }),
      }))
    );

    return NextResponse.json({
      stats: {
        totalUsers,
        totalOrders,
        totalPlans,
        activePlans,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        balance: balance.balance,
        currency: balance.currency,
      },
      recentOrders,
      regions: regionsWithCount,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}