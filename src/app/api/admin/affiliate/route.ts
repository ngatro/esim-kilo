import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { COMMISSION_RATES } from "@/lib/affiliate";

// Helper to verify admin role
async function verifyAdmin(request: Request): Promise<{ error: NextResponse | null, userId: number | null }> {
  const cookie = request.headers.get("cookie");
  const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
  
  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), userId: null };
  }
  
  const userId = parseInt(token);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user || user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 }), userId: null };
  }
  
  return { error: null, userId };
}

// GET: List all withdrawal requests
export async function GET(request: Request) {
  try {
    const authCheck = await verifyAdmin(request);
    if (authCheck.error) return authCheck.error;
    
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
    const authCheck = await verifyAdmin(request);
    if (authCheck.error) return authCheck.error;
    
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