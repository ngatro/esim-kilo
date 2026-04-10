import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAffiliateStats, COMMISSION_RATES } from "@/lib/affiliate";

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get("cookie");
    const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(token);
    const stats = await getAffiliateStats(userId);

    if (!stats) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get commissions history
    const commissions = await prisma.commission.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Get withdrawal requests
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Get referral list
    const referrals = await prisma.user.findMany({
      where: { referredById: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        rank: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      stats,
      commissions,
      withdrawals,
      referrals,
      commissionRates: COMMISSION_RATES,
    });
  } catch (error) {
    console.error("Affiliate stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}