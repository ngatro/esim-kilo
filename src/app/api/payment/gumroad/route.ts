import { NextResponse } from "next/server";

const GUMROAD_API = "https://api.gumroad.com/v2";

export async function POST(request: Request) {
  try {
    const accessToken = process.env.GUMROAD_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "Gumroad not configured" }, { status: 500 });
    }

    const { planId, planName, price, customerEmail } = await request.json();

    const res = await fetch(`${GUMROAD_API}/products`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `OW SIM - ${planName}`,
        description: `eSIM data plan: ${planName}. QR code will be delivered to your email after purchase.`,
        price: Math.round(price * 100),
        currency: "USD",
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://owsim.com"}/checkout?planId=${planId}`,
        max_purchase_count: 999999,
        custom_receipt: `Your eSIM plan ${planName} has been activated. Check your email for the QR code.`,
        custom_fields: [
          { name: "email_for_esim", required: true, type: "email" },
        ],
      }),
    });

    const data = await res.json();

    if (!data.success) {
      return NextResponse.json({ error: data.message || "Gumroad failed" }, { status: 500 });
    }

    return NextResponse.json({
      checkoutUrl: data.product.short_url,
      productId: data.product.id,
    });
  } catch (error) {
    console.error("Gumroad error:", error);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}