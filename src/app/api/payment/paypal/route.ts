import { NextResponse } from "next/server";

const PAYPAL_API = process.env.PAYPAL_SANDBOX === "true"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal not configured");
  }

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const { planId, planName, price, customerEmail } = await request.json();

    const token = await getAccessToken();

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
            description: `eSIM: ${planName}`,
            amount: {
              currency_code: "USD",
              value: price.toFixed(2),
            },
            custom_id: JSON.stringify({ planId, planName }),
          },
        ],
        application_context: {
          brand_name: "OW SIM - OpenWorld eSIM",
          landing_page: "BILLING",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://owsim.com"}/checkout?success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://owsim.com"}/checkout?cancelled=true`,
        },
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
              brand_name: "OW SIM",
              locale: "en-US",
              landing_page: "BILLING",
              shipping_preference: "NO_SHIPPING",
              user_action: "PAY_NOW",
              return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://owsim.com"}/checkout?success=true`,
              cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://owsim.com"}/checkout?cancelled=true`,
            },
          },
          apple_pay: {},
          google_pay: {},
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed" }, { status: 500 });
    }

    const approveLink = data.links?.find((l: { rel: string }) => l.rel === "approve");

    return NextResponse.json({
      orderId: data.id,
      approveUrl: approveLink?.href,
      status: data.status,
    });
  } catch (error) {
    console.error("PayPal error:", error);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
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