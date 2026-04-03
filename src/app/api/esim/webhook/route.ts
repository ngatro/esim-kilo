import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queryOrder, OrderObj } from "@/lib/esim-access";
import { sendEmail, getOrderConfirmationHtml, getOrderConfirmationAdminHtml } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[eSIM Webhook] Received:", JSON.stringify(body));

    const orderNo = body.orderNo || body.order_no;
    const orderStatus = body.orderStatus || body.order_status;

    if (!orderNo) {
      console.log("[eSIM Webhook] Missing orderNo");
      return NextResponse.json({ received: true });
    }

    console.log(`[eSIM Webhook] Order ${orderNo}: status=${orderStatus}`);

    const order = await prisma.order.findFirst({
      where: { esimaccessOrderId: orderNo },
      include: { orderItems: true },
    });

    if (!order) {
      console.log(`[eSIM Webhook] Order not found for orderNo=${orderNo}`);
      return NextResponse.json({ received: true });
    }

    let esimData: OrderObj | null = null;

    if (orderStatus === "GOT_RESOURCE" || orderStatus === "ACTIVATED") {
      try {
        esimData = await queryOrder(orderNo);
        console.log(`[eSIM Webhook] Query response: iccid=${esimData?.iccid}, qrcodeUrl=${esimData?.qrcodeUrl?.slice(0, 50)}...`);

        if (esimData?.iccid) {
          for (const item of order.orderItems) {
            await prisma.orderItem.update({
              where: { id: item.id },
              data: {
                esimIccid: esimData!.iccid,
                esimQrCode: esimData!.qrcode,
                esimQrImage: esimData!.qrcodeUrl,
                activationCode: esimData!.activationCode,
              },
            });
          }

          await prisma.order.update({
            where: { id: order.id },
            data: { esimaccessOrderStatus: orderStatus },
          });

          if (order.customerEmail) {
            const emailSent = await sendEmail({
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
                  qrImage: esimData!.qrcodeUrl,
                  activationCode: esimData!.activationCode,
                  iccid: esimData!.iccid,
                })),
              }),
            });
            console.log(`[eSIM Webhook] Email sent: ${emailSent}`);

            const adminEmail = process.env.ADMIN_EMAIL;
            if (adminEmail) {
              await sendEmail({
                to: adminEmail,
                subject: `New Order #${order.id} - $${order.totalAmount.toFixed(2)}`,
                html: getOrderConfirmationAdminHtml({
                  id: order.id,
                  totalAmount: order.totalAmount,
                  customerName: order.customerName,
                  customerEmail: order.customerEmail,
                  items: order.orderItems.map((item) => ({ planName: item.planName, price: item.price })),
                }),
              });
            }
          }
        }
      } catch (queryErr) {
        console.error(`[eSIM Webhook] Query failed:`, queryErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[eSIM Webhook] Error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
