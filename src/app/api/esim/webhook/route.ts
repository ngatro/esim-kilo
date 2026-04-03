import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queryOrder, OrderObj } from "@/lib/esim-access";
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

    const order = await prisma.order.findFirst({
      where: { esimaccessOrderId: orderNo },
      include: { orderItems: true },
    });

    if (!order) {
      console.log("[eSIM Webhook] Order not found: " + orderNo);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    let esimData: OrderObj | null = null;

    if (orderStatus === "GOT_RESOURCE" || orderStatus === "ACTIVATED") {
      try {
        esimData = await queryOrder(orderNo);
        console.log("[eSIM Webhook] Query result: iccid=" + (esimData?.iccid || "none"));

        if (esimData?.iccid) {
          await Promise.all(order.orderItems.map(item =>
            prisma.orderItem.update({
              where: { id: item.id },
              data: {
                esimIccid: esimData.iccid,
                esimEid: esimData.eid || null,
                esimTranNo: esimData.tranNo || null,
                esimQrCode: esimData.qrcode,
                esimQrImage: esimData.qrcodeUrl,
                esimLpaString: esimData.lpaString || null,
                activationCode: esimData.activationCode,
                esimStatus: esimData.esimStatus || orderStatus,
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