import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queryOrder, queryEsimUsage } from "@/lib/esim-access";

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

    let orderNo = orderItem.esimTranNo || orderItem.order?.esimaccessOrderId;
    
    if (!orderNo) {
      return NextResponse.json({ error: "No orderNo/TranNo found. esimTranNo is missing in database." }, { status: 400 });
    }

    const isPayPalId = /^[0-9A-Z]{4,}$/.test(orderNo) && !orderNo.startsWith("B") && orderNo.length > 20;
    if (isPayPalId) {
      return NextResponse.json({ error: "Cannot sync - esimTranNo is missing. Current esimaccessOrderId appears to be PayPal ID: " + orderNo }, { status: 400 });
    }

    console.log("[Admin Sync] Querying eSIM Access for orderNo:", orderNo);
    
    let esimData;
    try {
      esimData = await queryOrder(orderNo);
    } catch (queryErr) {
      console.log("[Admin Sync] queryOrder failed, trying by ICCID:", orderItem.esimIccid);
      if (orderItem.esimIccid) {
        const usageData = await queryEsimUsage(orderItem.esimIccid);
        esimData = {
          iccid: orderItem.esimIccid,
          eid: orderItem.esimEid,
          smdpStatus: usageData.smdpStatus,
          esimStatus: usageData.esimStatus,
          orderUsage: usageData.orderUsage,
          totalVolume: usageData.totalVolume,
        };
      }
    }

    if (!esimData?.iccid) {
      return NextResponse.json({ error: "No eSIM data found from API for orderNo: " + orderNo }, { status: 404 });
    }

    const qrCodeUrl = (esimData as { qrCodeUrl?: string; qrCode?: string }).qrCodeUrl || (esimData as { qrCodeUrl?: string; qrCode?: string }).qrCode || null;
    
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        esimIccid: (esimData as { iccid?: string }).iccid || orderItem.esimIccid,
        esimEid: (esimData as { eid?: string }).eid || orderItem.esimEid,
        esimTranNo: (esimData as { esimTranNo?: string }).esimTranNo || orderNo,
        esimQrImage: qrCodeUrl || orderItem.esimQrImage,
        esimLpaString: (esimData as { ac?: string; lpaString?: string }).ac || (esimData as { ac?: string; lpaString?: string }).lpaString || orderItem.esimLpaString,
        activationCode: (esimData as { activationCode?: string }).activationCode || orderItem.activationCode,
        totalVolume: (esimData as { totalVolume?: number }).totalVolume || orderItem.totalVolume,
        smdpStatus: (esimData as { smdpStatus?: string }).smdpStatus || orderItem.smdpStatus,
        esimStatus: (esimData as { esimStatus?: string }).esimStatus || orderItem.esimStatus,
        orderUsage: (esimData as { orderUsage?: number }).orderUsage ?? orderItem.orderUsage,
        lastUsageSync: new Date(),
      },
    });

    await prisma.order.update({
      where: { id: orderItem.orderId },
      data: { esimaccessOrderStatus: (esimData as { esimStatus?: string }).esimStatus || orderItem.order?.esimaccessOrderStatus },
    });

    console.log("[Admin Sync] Success! ICCID:", (esimData as { iccid?: string }).iccid, "Usage:", (esimData as { orderUsage?: number }).orderUsage);

    return NextResponse.json({
      success: true,
      data: {
        iccid: (esimData as { iccid?: string }).iccid,
        eid: (esimData as { eid?: string }).eid,
        qrImage: qrCodeUrl,
        smdpStatus: (esimData as { smdpStatus?: string }).smdpStatus,
        esimStatus: (esimData as { esimStatus?: string }).esimStatus,
        orderUsage: (esimData as { orderUsage?: number }).orderUsage,
        totalVolume: (esimData as { totalVolume?: number }).totalVolume,
      },
    });
  } catch (error) {
    console.error("[Admin Sync] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
