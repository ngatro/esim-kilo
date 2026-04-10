import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Get wallet balance
export async function GET(request: Request) {
  try {
    const cookie = request.headers.get("cookie");
    const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(token);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        walletBalance: true,
        affiliateBalance: true,
        affiliateCode: true,
        rank: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      walletBalance: user.walletBalance,
      affiliateBalance: user.affiliateBalance,
      affiliateCode: user.affiliateCode,
      rank: user.rank,
    });
  } catch (error) {
    console.error("Wallet error:", error);
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}

// POST: Wallet operations (admin only for adding balance)
export async function POST(request: Request) {
  // Wallet top-up is disabled for security - integrate with real payment gateway
  return NextResponse.json({ 
    error: "Wallet top-up is disabled. Please integrate with a payment gateway." 
  }, { status: 501 });
}