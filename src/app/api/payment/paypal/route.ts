import { NextResponse } from "next/server";

const PAYPAL_API = process.env.PAYPAL_SANDBOX === "true"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal not configured - set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET");
  }

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const { planId, planName, price, customerEmail, isTopUp, orderItemId, packageCode, periodNum } = await request.json();

    if (!price || price <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const token = await getAccessToken();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Build return URL based on whether it's a top-up or new order
    let returnUrl = `${appUrl}/checkout?success=true&planId=${planId}`;
    if (isTopUp) {
      returnUrl = `${appUrl}/topup?success=true&orderItemId=${orderItemId}&packageCode=${packageCode || ""}`;
    }

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: planId,
            description: `OW SIM eSIM: ${planName}`,
            amount: {
              currency_code: "USD",
              value: price.toFixed(2),
            },
            custom_id: JSON.stringify({ planId, planName, email: customerEmail, isTopUp, orderItemId, packageCode, periodNum }),
          },
        ],
        application_context: {
          brand_name: "OW SIM",
          landing_page: "BILLING",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: returnUrl,
          cancel_url: isTopUp ? `${appUrl}/topup?cancelled=true` : `${appUrl}/checkout?cancelled=true`,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("PayPal create order error:", data);
      return NextResponse.json({ error: data.message || data.details?.[0]?.description || "PayPal failed" }, { status: 500 });
    }

    const approveLink = data.links?.find((l: { rel: string }) => l.rel === "approve");

    return NextResponse.json({
      orderId: data.id,
      approveUrl: approveLink?.href,
      status: data.status,
    });
  } catch (error) {
    console.error("PayPal error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { orderId } = await request.json();
    const token = await getAccessToken();

    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Capture failed" }, { status: 500 });
    }

    return NextResponse.json({
      status: data.status,
      captureId: data.purchase_units?.[0]?.payments?.captures?.[0]?.id,
    });
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.json({ error: "Capture failed" }, { status: 500 });
  }
}