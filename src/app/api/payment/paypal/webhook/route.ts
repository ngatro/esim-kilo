import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrder as createEsimOrder, createTopUp } from "@/lib/esim-access";

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

// Process top-up after base eSIM is created
async function processTopUp(
  orderItemId: number,
  iccid: string,
  extraDays: number,
  topupPackageCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[TopUp] Starting for orderItem=${orderItemId}, extraDays=${extraDays}, packageCode=${topupPackageCode}`);
    
    const topupResult = await createTopUp({
      packageCode: topupPackageCode,
      iccid: iccid,
      periodNum: String(extraDays),
    });

    console.log(`[TopUp] Success for orderItem=${orderItemId}:`, topupResult);

    // Update order item with top-up info
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        extraDays: extraDays,
        topupPackageCode: topupPackageCode,
      },
    });

    return { success: true };
  } catch (error) {
    console.error(`[TopUp] Failed for orderItem=${orderItemId}:`, error);
    return { success: false, error: String(error) };
  }
}

// Shared: activate eSIM after payment (with optional top-up)
async function activateEsimAndEmail(
  orderId: number, 
  planId: string | null, 
  quantity: number,
  isTopupMode: boolean = false,
  extraDays: number = 0,
  topupPackageCode: string | null = null
) {
  const plan = planId ? await prisma.plan.findUnique({ where: { id: planId } }) : null;
  const packageCode = plan?.packageCode;

  console.log(`[AUTO] Order ${orderId}: plan=${planId}, packageCode=${packageCode}, isTopupMode=${isTopupMode}, extraDays=${extraDays}`);

  if (!packageCode) {
    console.error(`[AUTO] Order ${orderId}: No packageCode found`);
    return;
  }

  try {
    // Step 1: Call eSIM Access - Create base order
    console.log(`[AUTO] Calling eSIM Access: ${packageCode}`);
    const esimOrder = await createEsimOrder({ packageCode, count: quantity, orderId: String(orderId) });
    console.log(`[AUTO] eSIM Response: iccid=${esimOrder.iccid}, orderNo=${esimOrder.orderNo}`);

    // Get order item to check for top-up data
    const orderItem = await prisma.orderItem.findFirst({ where: { orderId } });
    
    // Use orderItem data if provided, otherwise use parameters
    const itemExtraDays = orderItem?.extraDays || extraDays;
    const itemTopupPackageCode = orderItem?.topupPackageCode || topupPackageCode;

    // Update order item with eSIM data
    await prisma.orderItem.update({
      where: { id: orderItem?.id },
      data: {
        esimIccid: esimOrder.iccid || null,
        esimQrCode: esimOrder.qrCode || null,
        esimQrImage: esimOrder.qrCodeUrl || null,
        esimLpaString: esimOrder.ac || esimOrder.lpaString || null,
        activationCode: esimOrder.activationCode || null,
        esimStatus: esimOrder.esimStatus || "ACTIVATED",
        smdpStatus: "ENABLED",
        enabledAt: new Date(),
      },
    });

    // Step 2: Process top-up if needed (after getting ICCID)
    let topupStatus = "not_needed";
    if (itemExtraDays && itemExtraDays > 0 && itemTopupPackageCode && esimOrder.iccid) {
      topupStatus = "processing";
      const topupResult = await processTopUp(
        orderItem!.id,
        esimOrder.iccid,
        itemExtraDays,
        itemTopupPackageCode
      );
      
      if (topupResult.success) {
        topupStatus = "success";
        console.log(`[AUTO] Order ${orderId}: Top-up completed successfully`);
      } else {
        topupStatus = "failed";
        console.error(`[AUTO] Order ${orderId}: Top-up FAILED - ${topupResult.error}`);
        // Send alert to admin about failed top-up
        try {
          const adminEmail = process.env.ADMIN_EMAIL;
          if (adminEmail) {
            const { sendEmail } = await import("@/lib/email");
            await sendEmail({
              to: adminEmail,
              subject: `[URGENT] Top-up Failed - Order #${orderId}`,
              html: `
                <h2>Top-up Failed</h2>
                <p>Order ID: ${orderId}</p>
                <p>ICCID: ${esimOrder.iccid}</p>
                <p>Extra Days: ${itemExtraDays}</p>
                <p>Package Code: ${itemTopupPackageCode}</p>
                <p>Error: ${topupResult.error}</p>
                <p>Please process manually!</p>
              `,
            });
          }
        } catch (emailErr) {
          console.error(`[AUTO] Failed to send admin alert:`, emailErr);
        }
      }
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        esimaccessOrderStatus: topupStatus === "failed" ? "partial" : esimOrder.esimStatus || esimOrder.orderStatus || "ACTIVATED",
      },
    });

    console.log("[AUTO] Order " + orderId + ": eSIM activated successfully" + (topupStatus !== "not_needed" ? `, top-up: ${topupStatus}` : ""));

    // Send email
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (order?.customerEmail) {
      try {
        const { sendEmail, getOrderConfirmationHtml, getOrderConfirmationAdminHtml } = await import("@/lib/email");

        await sendEmail({
          to: order.customerEmail,
          subject: `OW SIM Order #${order.id} - Your eSIM is ready!`,
          html: getOrderConfirmationHtml({
            id: order.id,
            totalAmount: order.totalAmount,
            customerName: order.customerName,
            items: order.orderItems.map((item) => ({
              planName: item.planName,
              price: item.price,
              quantity: item.quantity,
              qrImage: item.esimQrImage,
              activationCode: item.activationCode,
              iccid: item.esimIccid,
            })),
          }),
        });
        console.log(`[AUTO] Order ${orderId}: Email sent to ${order.customerEmail}`);

        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          await sendEmail({
            to: adminEmail,
            subject: `New Order #${order.id} - ${order.totalAmount.toFixed(2)}`,
            html: getOrderConfirmationAdminHtml({
              id: order.id,
              totalAmount: order.totalAmount,
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              items: order.orderItems.map((item) => ({ planName: item.planName, price: item.price })),
            }),
          });
        }
      } catch (emailErr) {
        console.error(`[AUTO] Order ${orderId}: Email failed:`, emailErr);
      }
    }
  } catch (esimErr) {
    console.error(`[AUTO] Order ${orderId}: eSIM activation FAILED:`, esimErr);
  }
}

// PayPal webhook (called by PayPal)
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);
    console.log("[PayPal Webhook]", event.event_type);

    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id;
      if (paypalOrderId) {
        const token = await getAccessToken();
        const verifyRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const orderData = await verifyRes.json();

        if (orderData.status === "APPROVED" || orderData.status === "COMPLETED") {
          const customId = orderData.purchase_units?.[0]?.custom_id;
          let planId = "";
          let isTopupMode = false;
          let selectedDuration: number | undefined;
          try { 
            const parsed = JSON.parse(customId || "{}");
            planId = parsed.planId || "";
            isTopupMode = parsed.isTopupMode || false;
            selectedDuration = parsed.selectedDuration;
          } catch {}

          // Get top-up metadata if in top-up mode
          let extraDays = 0;
          let topupPackageCode: string | null = null;
          let basePlanDays: number | null = null;
          
          if (isTopupMode && planId) {
            const plan = await prisma.plan.findUnique({ where: { id: planId } });
            if (plan && selectedDuration) {
              extraDays = selectedDuration - plan.durationDays;
              basePlanDays = plan.durationDays;
              if (extraDays > 0) {
                const topupPkg = await prisma.topupPackage.findFirst({
                  where: { planId: plan.id, isActive: true, isFlexible: true },
                });
                topupPackageCode = topupPkg?.packageCode || null;
              }
            }
          }

          const amount = parseFloat(orderData.purchase_units?.[0]?.amount?.value || "0");
          const order = await prisma.order.create({
            data: {
              totalAmount: amount,
              status: "completed",
              customerEmail: orderData.payer?.email_address || "",
              customerName: `${orderData.payer?.name?.given_name || ""} ${orderData.payer?.name?.surname || ""}`.trim(),
              esimaccessOrderId: paypalOrderId,
              esimaccessOrderStatus: "paid",
              // Top-up metadata
              isTopupMode,
              selectedDuration: selectedDuration || null,
              basePlanDays,
              extraDays: extraDays > 0 ? extraDays : null,
              topupPackageCode,
              orderItems: {
                create: [{
                  planId,
                  planName: orderData.purchase_units?.[0]?.description || "eSIM",
                  packageCode: planId ? (await prisma.plan.findUnique({ where: { id: planId } }))?.packageCode || null : null,
                  price: amount,
                  quantity: 1,
                  extraDays: extraDays > 0 ? extraDays : null,
                  basePlanDays: basePlanDays,
                  topupPackageCode,
                }],
              },
            },
          });

          // Auto-activate (with top-up processing)
          await activateEsimAndEmail(order.id, planId, 1, isTopupMode, extraDays, topupPackageCode);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[PayPal Webhook] Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

// Frontend confirmation (after PayPal redirect)
export async function PUT(request: Request) {
  try {
    const { orderId, planId, quantity = 1, isTopupMode = false, selectedDuration } = await request.json();
    if (!orderId) return NextResponse.json({ error: "Order ID required" }, { status: 400 });

    // Get userId from cookie
    const cookie = request.headers.get("cookie");
    const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
    const userId = token ? parseInt(token) : null;

    // Idempotency: Check if order already exists
    const existingOrder = await prisma.order.findFirst({
      where: { esimaccessOrderId: orderId },
      include: { orderItems: true },
    });

    if (existingOrder) {
      console.log("[PayPal Confirm] Order already exists: " + existingOrder.id);
      return NextResponse.json({ 
        success: true, 
        order: existingOrder,
        alreadyProcessed: true 
      });
    }

    // Verify with PayPal
    const accessToken = await getAccessToken();
    const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (data.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not completed", status: data.status }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId || "" } });
    const amount = parseFloat(data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || "0");

    // Get top-up metadata if in top-up mode
    let extraDays = 0;
    let topupPackageCode: string | null = null;
    let basePlanDays: number | null = null;
    let itemPrice = amount;
    
    if (isTopupMode && plan && selectedDuration) {
      extraDays = selectedDuration - plan.durationDays;
      basePlanDays = plan.durationDays;
      
      if (extraDays > 0) {
        const topupPkg = await prisma.topupPackage.findFirst({
          where: { planId: plan.id, isActive: true, isFlexible: true },
        });
        
        if (topupPkg) {
          topupPackageCode = topupPkg.packageCode;
          // Recalculate price to match backend calculation
          const basePrice = plan.retailPriceUsd > 0 ? plan.retailPriceUsd : plan.priceUsd;
          const topupRetail = topupPkg.retailPriceUsd > 0 ? topupPkg.retailPriceUsd : topupPkg.priceUsd;
          itemPrice = basePrice + (extraDays * topupRetail);
        }
      }
    }

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: amount,
        status: "completed",
        customerEmail: data.payer?.email_address || "",
        customerName: `${data.payer?.name?.given_name || ""} ${data.payer?.name?.surname || ""}`.trim(),
        esimaccessOrderId: orderId,
        esimaccessOrderStatus: "paid",
        // Top-up metadata
        isTopupMode,
        selectedDuration: selectedDuration || null,
        basePlanDays,
        extraDays: extraDays > 0 ? extraDays : null,
        topupPackageCode,
        orderItems: {
          create: [{
            planId: planId || null,
            planName: plan?.name || "eSIM Plan",
            packageCode: plan?.packageCode || null,
            price: itemPrice,
            quantity,
            extraDays: extraDays > 0 ? extraDays : null,
            basePlanDays,
            topupPackageCode,
          }],
        },
      },
    });

    // Auto-activate eSIM + send email (with top-up processing)
    await activateEsimAndEmail(order.id, planId, quantity, isTopupMode, extraDays, topupPackageCode);

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { orderItems: true },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("[PayPal Confirm] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}