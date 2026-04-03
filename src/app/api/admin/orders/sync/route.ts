import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queryOrder } from "@/lib/esim-access";

export async function POST(request: Request) {
  try {
    const { orderItemId } = await request.json();

    if (!orderItemId) {
      return NextResponse.json({ error: "orderItemId required" }, { status: 400 });
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!orderItem) {
      return NextResponse.json({ error: "Order item not found" }, { status: 404 });
    }

    const orderNo = orderItem.esimTranNo || orderItem.order?.esimaccessOrderId;
    
    if (!orderNo) {
      return NextResponse.json({ error: "No orderNo found for this item" }, { status: 400 });
    }

    console.log("[Admin Sync] Querying eSIM Access for orderNo:", orderNo);
    const esimData = await queryOrder(orderNo);

    if (!esimData?.iccid) {
      return NextResponse.json({ error: "No eSIM data found from API" }, { status: 404 });
    }

    const qrCodeUrl = esimData.qrCodeUrl || esimData.qrCode || null;
    
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        esimIccid: esimData.iccid || orderItem.esimIccid,
        esimEid: esimData.eid || orderItem.esimEid,
        esimTranNo: esimData.esimTranNo || orderNo,
        esimQrImage: qrCodeUrl || orderItem.esimQrImage,
        esimLpaString: esimData.ac || esimData.lpaString || orderItem.esimLpaString,
        activationCode: esimData.activationCode || orderItem.activationCode,
        totalVolume: esimData.totalVolume || orderItem.totalVolume,
        smdpStatus: esimData.smdpStatus || orderItem.smdpStatus,
        esimStatus: esimData.esimStatus || orderItem.esimStatus,
        orderUsage: esimData.orderUsage ?? orderItem.orderUsage,
        lastUsageSync: new Date(),
      },
    });

    await prisma.order.update({
      where: { id: orderItem.orderId },
      data: { esimaccessOrderStatus: esimData.esimStatus || orderItem.order?.esimaccessOrderStatus },
    });

    console.log("[Admin Sync] Success! ICCID:", esimData.iccid, "Usage:", esimData.orderUsage);

    return NextResponse.json({
      success: true,
      data: {
        iccid: esimData.iccid,
        eid: esimData.eid,
        qrImage: qrCodeUrl,
        smdpStatus: esimData.smdpStatus,
        esimStatus: esimData.esimStatus,
        orderUsage: esimData.orderUsage,
        totalVolume: esimData.totalVolume,
      },
    });
  } catch (error) {
    console.error("[Admin Sync] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
