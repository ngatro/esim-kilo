import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookie = request.headers.get("cookie");
    const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(token);
    const { amount, paymentMethod, paymentDetails } = await request.json();

    if (!amount || !paymentMethod || !paymentDetails) {
      return NextResponse.json(
        { error: "Amount, payment method and details are required" },
        { status: 400 }
      );
    }

    // Validate paymentDetails based on paymentMethod
    if (paymentMethod === "bank_transfer") {
      if (!paymentDetails.bankName || !paymentDetails.accountNumber || !paymentDetails.accountName) {
        return NextResponse.json(
          { error: "Bank name, account number, and account name are required" },
          { status: 400 }
        );
      }
    } else if (paymentMethod === "paypal") {
      if (!paymentDetails.email || typeof paymentDetails.email !== "string") {
        return NextResponse.json(
          { error: "Valid PayPal email is required" },
          { status: 400 }
        );
      }
    }

    // Get user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { affiliateBalance: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.affiliateBalance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Minimum withdrawal amount (e.g., $10)
    if (amount < 10) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is $10" },
        { status: 400 }
      );
    }

    // Create withdrawal request and deduct balance
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount,
        paymentMethod,
        paymentDetails: paymentDetails as any,
        status: "pending",
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        affiliateBalance: {
          decrement: amount,
        },
      },
    });

    return NextResponse.json({ success: true, withdrawal });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json({ error: "Withdrawal failed" }, { status: 500 });
  }
}