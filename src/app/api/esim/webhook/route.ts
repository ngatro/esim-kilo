import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queryOrder, EsimListItem } from "@/lib/esim-access";
import { sendEmail, getOrderConfirmationHtml, getOrderConfirmationAdminHtml } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[eSIM Webhook] Received:", JSON.stringify(body));

    const notifyType = body.notifyType || body.notify_type;
    const orderNo = body.content?.orderNo || body.orderNo || body.order_no;
    const orderStatus = body.content?.orderStatus || body.orderStatus || body.order_status;
    const smdpStatus = body.content?.smdpStatus || body.smdpStatus;
    const iccid = body.content?.iccid || body.iccid;
    const eid = body.content?.eid || body.eid || body.content?.EID || null;
    const eventTime = body.content?.eventGenerateTime || body.eventGenerateTime || null;

    await prisma.webhookLog.create({
      data: {
        orderNo: orderNo || null,
        notifyType: notifyType || null,
        orderStatus: orderStatus || null,
        smdpStatus: smdpStatus || null,
        payload: body,
      },
    });

    if (notifyType === "CHECK_HEALTH") {
      console.log("[eSIM Webhook] Health Check - URL validated");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (!orderNo && !iccid) {
      console.log("[eSIM Webhook] Skip: Missing orderNo and iccid");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log("[eSIM Webhook] notifyType=" + notifyType + ", orderNo=" + orderNo + ", smdpStatus=" + smdpStatus);

    let order = null;
    let orderItems = null;

    if (orderNo) {
      order = await prisma.order.findFirst({
        where: { esimaccessOrderId: orderNo },
        include: { orderItems: true },
      });
    }

    if (!order && iccid) {
      orderItems = await prisma.orderItem.findMany({
        where: { esimIccid: iccid },
        include: { order: true },
      });
      if (orderItems.length > 0) {
        order = orderItems[0].order;
      }
    }

    if (!order) {
      console.log("[eSIM Webhook] Order not found for orderNo=" + orderNo + ", iccid=" + iccid);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const items = orderItems || order.orderItems;

    switch (notifyType) {
      case "ORDER_STATUS":
        if (orderStatus === "GOT_RESOURCE" || orderStatus === "ACTIVATED") {
          try {
            const esimData = orderNo ? await queryOrder(orderNo) : null;
            console.log("[eSIM Webhook] ORDER_STATUS - Query result:", esimData?.iccid ? "found" : "not found");

            if (esimData?.iccid) {
              const qrImageUrl = esimData.qrCodeUrl || esimData.qrCode || null;
              const lpaStr = esimData.ac || esimData.lpaString || null;

              await Promise.all(items.map(item =>
                prisma.orderItem.update({
                  where: { id: item.id },
                  data: {
                    esimIccid: esimData.iccid || item.esimIccid,
                    esimEid: esimData.eid || null,
                    esimTranNo: esimData.esimTranNo || orderNo || null,
                    esimQrImage: qrImageUrl || item.esimQrImage,
                    esimLpaString: lpaStr || item.esimLpaString,
                    activationCode: esimData.activationCode || null,
                    totalVolume: esimData.totalVolume || null,
                    smdpStatus: esimData.smdpStatus || "RELEASED",
                    esimStatus: orderStatus === "GOT_RESOURCE" ? "GOT_RESOURCE" : "IN_USE",
                    orderUsage: esimData.orderUsage || 0,
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
                      items: items.map(item => ({
                        planName: item.planName,
                        price: item.price,
                        quantity: item.quantity,
                        qrImage: qrImageUrl,
                        activationCode: esimData.activationCode,
                        iccid: esimData.iccid,
                        lpaString: lpaStr,
                      })),
                    }),
                  });
                  console.log("[eSIM Webhook] Email sent to customer");
                } catch (emailErr) {
                  console.error("[eSIM Webhook] Email error:", emailErr);
                }
              }
            }
          } catch (queryErr) {
            console.error("[eSIM Webhook] ORDER_STATUS query error:", queryErr);
          }
        }
        break;

      case "SMDP_EVENT":
        if (smdpStatus) {
          console.log("[eSIM Webhook] SMDP_EVENT - smdpStatus=" + smdpStatus + ", eid=" + eid);
          
          const updateData: Record<string, unknown> = { smdpStatus };
          
          if (smdpStatus === "ENABLED") {
            updateData.esimStatus = "IN_USE";
            const existingEnabled = items.some((item: { enabledAt: Date | null }) => item.enabledAt);
            if (!existingEnabled) {
              updateData.enabledAt = eventTime ? new Date(eventTime) : new Date();
              console.log("[eSIM Webhook] eSIM enabled - setting enabledAt and esimStatus=IN_USE");
            }
          }

          if (smdpStatus === "DOWNLOAD" || smdpStatus === "INSTALLATION") {
            updateData.esimStatus = "IN_USE";
          }

          if (smdpStatus === "RELEASED" || smdpStatus === "DELETED") {
            updateData.esimStatus = smdpStatus === "DELETED" ? "CANCEL" : "USED_UP";
          }

          if (eid) {
            updateData.esimEid = eid;
          }

          await Promise.all(items.map(item =>
            prisma.orderItem.update({
              where: { id: item.id },
              data: updateData,
            })
          ));
        }
        break;

      case "DATA_USAGE":
        const usage = body.content?.orderUsage || body.orderUsage || 0;
        const totalVol = body.content?.totalVolume || body.totalVolume || 0;

        console.log("[eSIM Webhook] DATA_USAGE - usage=" + usage + ", totalVolume=" + totalVol);

        await Promise.all(items.map(item =>
          prisma.orderItem.update({
            where: { id: item.id },
            data: {
              orderUsage: usage,
              totalVolume: totalVol || item.totalVolume,
              lastUsageSync: new Date(),
            },
          })
        ));

        if (order.customerEmail && usage >= totalVol * 0.8 && usage < totalVol * 0.9) {
          try {
            await sendEmail({
              to: order.customerEmail,
              subject: "OW SIM - 80% Data Used",
              html: "<h2>You've used 80% of your data</h2><p>Consider purchasing more data to avoid interruption.</p><p><a href='https://owsim.com/plans'>Browse Plans</a></p>",
            });
          } catch (emailErr) {
            console.error("[eSIM Webhook] 80% warning email error:", emailErr);
          }
        }
        break;

      case "ESIM_STATUS":
        const esimStatus = body.content?.esimStatus || body.esimStatus;
        const esimUsage = body.content?.orderUsage || body.orderUsage || 0;
        const esimTotalVol = body.content?.totalVolume || body.totalVolume || 0;

        console.log("[eSIM Webhook] ESIM_STATUS - status=" + esimStatus + ", usage=" + esimUsage);

        await Promise.all(items.map(item =>
          prisma.orderItem.update({
            where: { id: item.id },
            data: {
              esimStatus: esimStatus || item.esimStatus,
              orderUsage: esimUsage,
              totalVolume: esimTotalVol || item.totalVolume,
              lastUsageSync: new Date(),
            },
          })
        ));

        if (esimStatus === "USED_UP" && order.customerEmail) {
          try {
            await sendEmail({
              to: order.customerEmail,
              subject: "OW SIM - Data Limit Reached",
              html: "<h2>Your eSIM data has been used up</h2><p>Please purchase a new plan to continue using data.</p><p><a href='https://owsim.com/plans'>Browse Plans</a></p>",
            });
          } catch (emailErr) {
            console.error("[eSIM Webhook] Usage email error:", emailErr);
          }
        }
        break;

      case "VALIDITY_USAGE":
        console.log("[eSIM Webhook] VALIDITY_USAGE - expiration warning");
        if (order.customerEmail) {
          try {
            await sendEmail({
              to: order.customerEmail,
              subject: "OW SIM - Your eSIM is expiring soon",
              html: "<h2>Your eSIM validity is about to expire</h2><p>Please renew your plan to continue using data.</p><p><a href='https://owsim.com/plans'>Renew Now</a></p>",
            });
          } catch (emailErr) {
            console.error("[eSIM Webhook] Validity email error:", emailErr);
          }
        }
        break;

      default:
        console.log("[eSIM Webhook] Unknown notifyType: " + notifyType);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[eSIM Webhook] Catch error:", error);
    return NextResponse.json({ received: true, error: String(error) }, { status: 200 });
  }
}