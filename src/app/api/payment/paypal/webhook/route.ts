import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrder as createEsimOrder } from "@/lib/esim-access";

const PAYPAL_API = process.env.PAYPAL_SANDBOX === "true"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("PayPal not configured");

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

// Webhook endpoint - PayPal calls this when payment is completed
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);

    console.log("PayPal webhook event:", event.event_type);

    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED" || event.event_type === "CHECKOUT.ORDER.APPROVED") {
      const orderId = event.resource?.supplementary_data?.related_ids?.order_id || event.resource?.id;

      if (orderId) {
        // Verify payment with PayPal
        const token = await getAccessToken();
        const verifyRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const orderData = await verifyRes.json();

        if (orderData.status === "APPROVED" || orderData.status === "COMPLETED") {
          // Extract custom_id from purchase_units
          const customId = orderData.purchase_units?.[0]?.custom_id;
          let planId = "";

          try {
            const parsed = JSON.parse(customId || "{}");
            planId = parsed.planId || "";
          } catch {}

          // Create order in DB
          const purchaseUnit = orderData.purchase_units?.[0];
          const amount = parseFloat(purchaseUnit?.amount?.value || "0");

          const order = await prisma.order.create({
            data: {
              totalAmount: amount,
              status: "completed",
              customerEmail: orderData.payer?.email_address || "",
              customerName: `${orderData.payer?.name?.given_name || ""} ${orderData.payer?.name?.surname || ""}`.trim(),
              esimaccessOrderId: orderId,
              esimaccessOrderStatus: "paid",
              orderItems: {
                create: [{
                  planId,
                  planName: purchaseUnit?.description || "eSIM Plan",
                  price: amount,
                  quantity: 1,
                }],
              },
            },
            include: { orderItems: true },
          });

          // Call eSIM Access to get the package
          if (planId) {
            const plan = await prisma.plan.findUnique({ where: { id: planId } });
            if (plan?.packageCode) {
              try {
                const esimOrder = await createEsimOrder({ packageCode: plan.packageCode });
                await prisma.orderItem.update({
                  where: { id: order.orderItems[0].id },
                  data: {
                    esimIccid: esimOrder.iccid,
                    esimQrCode: esimOrder.qrcode,
                    esimQrImage: esimOrder.qrcodeUrl,
                    activationCode: esimOrder.activationCode,
                  },
                });
                await prisma.order.update({
                  where: { id: order.id },
                  data: { esimaccessOrderStatus: esimOrder.orderStatus },
                });
              } catch (esimErr) {
                console.error("eSIM Access order failed:", esimErr);
              }
            }
          }

          console.log(`Order ${order.id} created from PayPal webhook`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

// Confirm payment and create order (called from frontend after PayPal redirect)
export async function PUT(request: Request) {
  try {
    const { orderId, planId, quantity = 1 } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    // Verify with PayPal
    const token = await getAccessToken();
    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (data.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not completed", status: data.status }, { status: 400 });
    }

    // Get plan info
    const plan = await prisma.plan.findUnique({ where: { id: planId || "" } });
    const amount = parseFloat(data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || "0");

    // Create order in DB
    const order = await prisma.order.create({
      data: {
        totalAmount: amount,
        status: "completed",
        customerEmail: data.payer?.email_address || "",
        customerName: `${data.payer?.name?.given_name || ""} ${data.payer?.name?.surname || ""}`.trim(),
        esimaccessOrderId: orderId,
        esimaccessOrderStatus: "paid",
        orderItems: {
          create: [{
            planId: planId || null,
            planName: plan?.name || "eSIM Plan",
            price: amount,
            quantity,
          }],
        },
      },
      include: { orderItems: true },
    });

    // Call eSIM Access
    let esimData = null;
    if (plan?.packageCode) {
      try {
        const esimOrder = await createEsimOrder({ packageCode: plan.packageCode, count: quantity });
        await prisma.orderItem.update({
          where: { id: order.orderItems[0].id },
          data: {
            esimIccid: esimOrder.iccid,
            esimQrCode: esimOrder.qrcode,
            esimQrImage: esimOrder.qrcodeUrl,
            activationCode: esimOrder.activationCode,
          },
        });
        await prisma.order.update({
          where: { id: order.id },
          data: { esimaccessOrderStatus: esimOrder.orderStatus },
        });
        esimData = esimOrder;
      } catch (esimErr) {
        console.error("eSIM order failed:", esimErr);
      }
    }

    // Fetch updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { orderItems: true },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      esim: esimData,
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}