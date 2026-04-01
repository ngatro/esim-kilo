import { NextResponse } from "next/server";

const PAYONEER_API = "https://api.payoneer.com/v2";

export async function POST(request: Request) {
  try {
    const partnerId = process.env.PAYONEER_PARTNER_ID;
    const partnerUsername = process.env.PAYONEER_PARTNER_USERNAME;
    const apiKey = process.env.PAYONEER_API_KEY;

    if (!partnerId || !partnerUsername || !apiKey) {
      return NextResponse.json({ error: "Payoneer not configured" }, { status: 500 });
    }

    const { planId, planName, price, customerEmail } = await request.json();

    const programId = process.env.PAYONEER_PROGRAM_ID || "default";

    const res = await fetch(`${PAYONEER_API}/programs/${programId}/payees/checkout-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        payee_id: customerEmail || `user-${Date.now()}`,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://owsim.com"}/checkout?planId=${planId}&payment=payoneer`,
        amount: price.toFixed(2),
        currency: "USD",
        description: `OW SIM - ${planName}`,
        reference_id: `${planId}-${Date.now()}`,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Payoneer failed" }, { status: 500 });
    }

    return NextResponse.json({
      checkoutUrl: data.url || data.checkout_url,
      referenceId: data.reference_id,
    });
  } catch (error) {
    console.error("Payoneer error:", error);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}