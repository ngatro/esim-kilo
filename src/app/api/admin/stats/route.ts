import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBalance } from "@/lib/esim-access";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// In-memory sync progress tracker
let syncProgress = "";
export function setSyncProgress(msg: string) {
  syncProgress = msg;
}
export function clearSyncProgress() {
  syncProgress = "";
}

// Helper function to get session from cookies
async function getSessionFromRequest(request: Request) {
  const cookie = request.headers.get("cookie");
  const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
  
  if (token) {
    // For legacy auth (email/password), get user from token
    const userId = parseInt(token);
    if (!isNaN(userId)) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
      }
    }
  }
  
  // For NextAuth (Google OAuth), try to get session from JWT
  // This is a simplified version - in production, you should verify the JWT properly
  const nextAuthSession = request.headers.get("cookie")?.match(/next-auth.session-token=([^;]+)/)?.[1];
  if (nextAuthSession) {
    // Decode JWT (simplified - in production, verify the signature)
    try {
      const parts = nextAuthSession.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        if (payload.email) {
          const user = await prisma.user.findUnique({ where: { email: payload.email } });
          if (user) {
            return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
          }
        }
      }
    } catch (e) {
      console.error("Failed to decode JWT:", e);
    }
  }
  
  return null;
}

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    console.log(">>> ADMIN CHECK:", { 
      hasSession: !!session, 
      user: session?.user?.email, 
      role: session?.user?.role 
    });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
      syncProgress,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}