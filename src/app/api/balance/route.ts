import { NextResponse } from "next/server";
import { getBalance } from "@/lib/esim-access";

export async function GET() {
  try {
    const balance = await getBalance();
    return NextResponse.json(balance);
  } catch (error) {
    console.error("Balance API error:", error);
    return NextResponse.json(
      { error: "Failed to get balance" },
      { status: 500 }
    );
  }
}