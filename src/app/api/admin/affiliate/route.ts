import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMMISSION_RATES } from "@/lib/affiliate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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


// GET: List all withdrawal requests
export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    console.log(">>> ADMIN AFFILIATE GET CHECK:", { 
      hasSession: !!session, 
      user: session?.user?.email, 
      role: session?.user?.role,
      userId: session?.user?.id
    });
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              affiliateCode: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.withdrawal.count({ where }),
    ]);

    // Get commission stats
    const affiliateStats = await prisma.user.aggregate({
      _sum: {
        affiliateBalance: true,
      },
      _count: true,
    });

    // Get wallet discount setting
    const walletDiscount = await prisma.setting.findUnique({
      where: { key: "wallet_discount_percent" },
    });

    // Get all users with wallet balances
    const walletBalances = await prisma.user.findMany({
      where: {
        OR: [
          { walletBalance: { gt: 0 } },
          { affiliateBalance: { gt: 0 } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        walletBalance: true,
        affiliateBalance: true,
        rank: true,
      },
      orderBy: { walletBalance: "desc" },
      take: 50,
    });

    return NextResponse.json({
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalBalance: affiliateStats._sum.affiliateBalance || 0,
        totalUsers: affiliateStats._count,
        commissionRates: COMMISSION_RATES,
        walletDiscountPercent: walletDiscount ? parseFloat(walletDiscount.value) : 0,
      },
      walletBalances,
    });
  } catch (error) {
    console.error("Admin affiliate error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// PUT: Update settings or withdrawal status
export async function PUT(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { type, withdrawalId, status, adminNote, walletDiscountPercent, userId, walletAmount } = await request.json();

    if (type === "withdrawal") {
      if (!withdrawalId || !status) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }


      const updateData: Record<string, unknown> = {
        status,
      };

      if (adminNote) {
        updateData.adminNote = adminNote;
      }


      if (status === "completed") {
        updateData.processedAt = new Date();
      }

      const withdrawal = await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: updateData,
        include: {
          user: { select: { name: true, email: true } },
        },
      });

      // If rejected, refund the balance
      if (status === "rejected") {
        await prisma.user.update({
          where: { id: withdrawal.userId },
          data: {
            affiliateBalance: {
              increment: withdrawal.amount,
            },
          },
        });
      }

      return NextResponse.json({ success: true, withdrawal });
    }

    if (type === "walletDiscount") {
      // Update wallet discount percentage
      const discount = walletDiscountPercent || 0;
      
      await prisma.setting.upsert({
        where: { key: "wallet_discount_percent" },
        update: { value: String(discount) },
        create: { key: "wallet_discount_percent", value: String(discount) },
      });

      return NextResponse.json({ success: true, walletDiscountPercent: discount });
    }

    if (type === "addWalletBalance") {
      if (!userId || !walletAmount) {
        return NextResponse.json({ error: "Missing userId or amount" }, { status: 400 });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            increment: walletAmount,
          },
        },
        select: { id: true, name: true, walletBalance: true },
      });

      return NextResponse.json({ success: true, user });
    }

    if (type === "deductWalletBalance") {
      if (!userId || !walletAmount) {
        return NextResponse.json({ error: "Missing userId or amount" }, { status: 400 });
      }

      // Check current balance
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { walletBalance: true },
      });

      if (!currentUser || currentUser.walletBalance < walletAmount) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
      }


      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            decrement: walletAmount,
          },
        },
        select: { id: true, name: true, walletBalance: true },
      });

      return NextResponse.json({ success: true, user });
    }

    if (type === "commissionRates") {
      // Commission rates are managed in code
      return NextResponse.json({ 
        success: true, 
        message: "Commission rates managed via code",
        rates: COMMISSION_RATES 
      });
    }


    if (type === "updateUserRank") {
      const { userId, rank } = await request.json();
      
      if (!userId || !rank) {
        return NextResponse.json({ error: "Missing userId or rank" }, { status: 400 });
      }

      const validRanks = ["bronze", "silver", "gold", "diamond"];
      if (!validRanks.includes(rank)) {
        return NextResponse.json({ error: "Invalid rank" }, { status: 400 });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { rank },
        select: { id: true, name: true, rank: true },
      });

      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Admin affiliate update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}