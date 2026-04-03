import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queryOrder, EsimListItem } from "@/lib/esim-access";
import { sendEmail, getOrderConfirmationHtml, getOrderConfirmationAdminHtml } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[eSIM Webhook] Received:", JSON.stringify(body));

    if (body.notifyType === "CHECK_HEALTH") {
      console.log("[eSIM Webhook] Health Check - URL validated successfully");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const orderNo = body.content?.orderNo || body.orderNo || body.order_no;
    const orderStatus = body.content?.orderStatus || body.orderStatus || body.order_status;

    if (!orderNo) {
      console.log("[eSIM Webhook] Skip: Missing orderNo");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log("[eSIM Webhook] Processing: " + orderNo + " | status=" + orderStatus);

    console.log("[eSIM Webhook] Searching for order with esimaccessOrderId: " + orderNo);

    const order = await prisma.order.findFirst({
      where: { esimaccessOrderId: orderNo },
      include: { orderItems: true },
    });

    if (!order) {
      console.log("[eSIM Webhook] Order not found for esimaccessOrderId: " + orderNo);
      const orders = await prisma.order.findMany({ select: { id: true, esimaccessOrderId: true }, take: 10 });
      console.log("[eSIM Webhook] Sample orders in DB:", JSON.stringify(orders));
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log("[eSIM Webhook] Found order ID: " + order.id + " with " + order.orderItems.length + " items");

    let esimData: EsimListItem | null = null;

    if (orderStatus === "GOT_RESOURCE" || orderStatus === "ACTIVATED") {
      try {
        esimData = await queryOrder(orderNo);
        console.log("[eSIM Webhook] Query result: iccid=" + (esimData?.iccid || "none") + ", qrCodeUrl=" + (esimData?.qrCodeUrl ? "present" : "none") + ", ac=" + (esimData?.ac ? "present" : "none"));

        if (esimData?.iccid) {
          const qrImageUrl = esimData.qrCodeUrl || esimData.qrCode || null;
          const lpaStr = esimData.ac || esimData.lpaString || null;
          
          console.log("[eSIM Webhook] Mapping: qrCodeUrl=" + qrImageUrl + ", ac=" + lpaStr + ", esimTranNo=" + esimData.esimTranNo + ", totalVolume=" + esimData.totalVolume);

          await Promise.all(order.orderItems.map(item =>
            prisma.orderItem.update({
              where: { id: item.id },
              data: {
                esimIccid: esimData!.iccid || null,
                esimEid: esimData!.eid || null,
                esimTranNo: esimData!.esimTranNo || null,
                esimQrCode: esimData!.qrCode || null,
                esimQrImage: qrImageUrl,
                esimLpaString: lpaStr,
                activationCode: esimData!.activationCode || null,
                totalVolume: esimData!.totalVolume || null,
                smdpStatus: esimData!.smdpStatus || null,
                esimStatus: esimData!.esimStatus || orderStatus,
                orderUsage: esimData!.orderUsage || 0,
              },
            })
          ));

          await prisma.order.update({
            where: { id: order.id },
            data: { esimaccessOrderStatus: orderStatus },
          });

          if (order.customerEmail) {
            try {
              await sendEmail({
                to: order.customerEmail,
                subject: "OW SIM Order #" + order.id + " - Your eSIM is ready!",
                html: getOrderConfirmationHtml({
                  id: order.id,
                  totalAmount: order.totalAmount,
                  customerName: order.customerName,
                  items: order.orderItems.map(item => ({
                    planName: item.planName,
                    price: item.price,
                    quantity: item.quantity,
                    qrImage: esimData!.qrcodeUrl,
                    activationCode: esimData!.activationCode,
                    iccid: esimData!.iccid,
                  })),
                }),
              });
              console.log("[eSIM Webhook] Customer email sent");

              const adminEmail = process.env.ADMIN_EMAIL;
              if (adminEmail) {
                await sendEmail({
                  to: adminEmail,
                  subject: "New Order #" + order.id + " - $" + order.totalAmount.toFixed(2),
                  html: getOrderConfirmationAdminHtml({
                    id: order.id,
                    totalAmount: order.totalAmount,
                    customerName: order.customerName,
                    customerEmail: order.customerEmail,
                    items: order.orderItems.map(item => ({ planName: item.planName, price: item.price })),
                  }),
                });
              }
            } catch (emailErr) {
              console.error("[eSIM Webhook] Email error:", emailErr);
            }
          }
        }
      } catch (queryErr) {
        console.error("[eSIM Webhook] Query error:", queryErr);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[eSIM Webhook] Catch error:", error);
    return NextResponse.json({ received: true, error: String(error) }, { status: 200 });
  }
}