import { NextResponse } from "next/server";

const LEMON_API = "https://api.lemonsqueezy.com/v1";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;

    if (!apiKey || !storeId || !variantId) {
      return NextResponse.json({ error: "LemonSqueezy not configured" }, { status: 500 });
    }

    const { planId, planName, price, customerEmail } = await request.json();

    const res = await fetch(`${LEMON_API}/checkouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: customerEmail,
              custom: {
                plan_id: planId,
                plan_name: planName,
              },
            },
            product_options: {
              name: planName,
              description: `eSIM plan: ${planName}`,
              price: Math.round(price * 100),
              currency: "USD",
            },
            checkout_options: {
              embed: false,
              media: false,
              button_color: "#0ea5e9",
            },
          },
          relationships: {
            store: {
              data: { type: "stores", id: storeId },
            },
            variant: {
              data: { type: "variants", id: variantId },
            },
          },
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.errors?.[0]?.detail || "Failed" }, { status: 500 });
    }

    return NextResponse.json({
      checkoutUrl: data.data.attributes.url,
      checkoutId: data.data.id,
    });
  } catch (error) {
    console.error("LemonSqueezy error:", error);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}