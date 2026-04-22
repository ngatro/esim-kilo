import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrder, queryOrder, createTopUp } from "@/lib/esim-access";
import { sendEmail, getOrderConfirmationHtml, getOrderConfirmationAdminHtml } from "@/lib/email";
import { createCommission } from "@/lib/affiliate";

// Backend-only price calculation to prevent price manipulation
function calculateOrderPrice(
  plan: { id: string; priceUsd: number; retailPriceUsd: number; durationDays: number; supportTopUpType: number },
  topupMode: boolean,
  selectedDuration: number | undefined,
  quantity: number
): { price: number; extraDays: number; basePlanDays: number; topupPackageCode: string | null } {
  let itemPrice = plan.priceUsd;
  let extraDays = 0;
  let basePlanDays = plan.durationDays;
  let topupPackageCode: string | null = null;

  // Use retail price if available (customer-facing price)
  if (plan.retailPriceUsd > 0) {
    itemPrice = plan.retailPriceUsd;
  }

  // Handle top-up mode: Calculate extra days
  // Note: actual topupPackageCode is fetched in main handler to avoid multiple DB calls
  if (topupMode && selectedDuration && selectedDuration > 0) {
    extraDays = selectedDuration - plan.durationDays;
    // topupPackageCode will be fetched from DB in the main handler
  }

  const totalPrice = itemPrice * quantity;
  
  return { price: totalPrice, extraDays, basePlanDays, topupPackageCode };
}

// Process top-up after base order is created
async function processTopUp(
  orderItemId: number,
  iccid: string,
  extraDays: number,
  topupPackageCode: string
): Promise<{ success: boolean; error?: string; topupResult?: unknown }> {
  try {
    console.log(`[TopUp] Starting for orderItem=${orderItemId}, extraDays=${extraDays}, packageCode=${topupPackageCode}`);
    
    // Call the top-up API
    const topupResult = await createTopUp({
      packageCode: topupPackageCode,
      iccid: iccid,
      periodNum: String(extraDays), // The number of extra days
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

    return { success: true, topupResult };
  } catch (error) {
    console.error(`[TopUp] Failed for orderItem=${orderItemId}:`, error);
    return { success: false, error: String(error) };
  }
}

export async function POST(request: Request) {
  try {
    const cookie = request.headers.get("cookie");
    const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
    
    const userId = token ? parseInt(token) : null;
    const { 
      items, 
      customerName, 
      customerEmail, 
      status,
      // Top-up mode fields
      isTopupMode = false,
      selectedDuration,
    } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    let totalAmount = 0;
    let totalExtraDays = 0;
    let hasTopupMode = false;
    const orderItemsData: {
      planId: string | null;
      planName: string;
      price: number;
      quantity: number;
      extraDays?: number;
      basePlanDays?: number;
      topupPackageCode?: string | null;
    }[] = [];

    for (const item of items) {
      const plan = await prisma.plan.findUnique({
        where: { id: item.planId },
      });

      if (!plan) {
        return NextResponse.json(
          { error: `Plan not found: ${item.planId}` },
          { status: 400 }
        );
      }

      // Get top-up package if in top-up mode
      let extraDays = 0;
      let topupPackageCode: string | null = null;
      let topupRetailPrice = 0;

      // Check if this item is in top-up mode
      const itemIsTopupMode = item.isTopupMode || (isTopupMode && item.days && item.days > 0);
      const itemSelectedDuration = item.selectedDuration || item.days || selectedDuration;

      if (itemIsTopupMode && itemSelectedDuration) {
        extraDays = itemSelectedDuration - plan.durationDays;
        
        if (extraDays > 0) {
          hasTopupMode = true;
          totalExtraDays = Math.max(totalExtraDays, extraDays);
          
          // Fetch the flexible top-up package for this plan
          const topupPkg = await prisma.topupPackage.findFirst({
            where: { planId: plan.id, isActive: true, isFlexible: true },
          });
          
          if (topupPkg) {
            topupPackageCode = topupPkg.packageCode;
            topupRetailPrice = topupPkg.retailPriceUsd > 0 ? topupPkg.retailPriceUsd : topupPkg.priceUsd;
          }
        }
      }

      // Calculate price: Base price + (extraDays * topupPrice) - Backend-only calculation
      let itemPrice = plan.priceUsd;
      if (plan.retailPriceUsd > 0) {
        itemPrice = plan.retailPriceUsd;
      }
      
      // Add top-up cost if applicable
      if (extraDays > 0 && topupRetailPrice > 0) {
        itemPrice = itemPrice + (extraDays * topupRetailPrice);
      }

      const itemTotal = itemPrice * (item.quantity || 1);
      totalAmount += itemTotal;

      orderItemsData.push({
        planId: plan.id,
        planName: plan.name,
        price: itemPrice,
        quantity: item.quantity || 1,
        extraDays: extraDays > 0 ? extraDays : undefined,
        basePlanDays: plan.durationDays,
        topupPackageCode,
      });
    }

    // Determine order status: pending for failed payments, otherwise completed
    const orderStatus = status === "pending" ? "pending" : "completed";
    
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: orderStatus,
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        // Top-up metadata
        isTopupMode: hasTopupMode,
        selectedDuration: selectedDuration || null,
        basePlanDays: hasTopupMode ? orderItemsData[0]?.basePlanDays : null,
        extraDays: hasTopupMode ? totalExtraDays : null,
        topupPackageCode: hasTopupMode ? orderItemsData[0]?.topupPackageCode : null,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Skip eSIM creation for pending orders - will create when payment completed
    if (orderStatus === "pending") {
      return NextResponse.json({ success: true, order, message: "Pending order created" });
    }

    // Process orders - Create eSIM and handle top-up if needed
    const esimResults: { 
      orderItem: number; 
      status: string; 
      orderNo: string;
      topupStatus?: string;
      topupError?: string;
    }[] = [];

    for (const orderItem of order.orderItems) {
      const plan = await prisma.plan.findUnique({
        where: { id: orderItem.planId || "" },
      });

      if (plan?.packageCode) {
        try {
          // Step 1: Create base eSIM order
          const esimOrder = await createOrder({
            packageCode: plan.packageCode,
            count: orderItem.quantity,
          });

          const qrCodeUrl = esimOrder.qrCodeUrl || esimOrder.qrCode || null;
          
          await prisma.orderItem.update({
            where: { id: orderItem.id },
            data: {
              esimIccid: esimOrder.iccid || null,
              esimEid: esimOrder.eid || null,
              esimTranNo: esimOrder.esimTranNo || null,
              esimQrCode: qrCodeUrl,
              esimQrImage: qrCodeUrl,
              esimLpaString: esimOrder.ac || esimOrder.lpaString || null,
              activationCode: esimOrder.activationCode || null,
              totalVolume: esimOrder.totalVolume || null,
              smdpStatus: null,
              esimStatus: esimOrder.esimStatus || "GOT_RESOURCE",
            },
          });

          const baseOrderResult = {
            orderItem: orderItem.id,
            status: esimOrder.esimStatus || "created",
            orderNo: esimOrder.orderNo || "",
          };

          // Step 2: Process top-up if needed (after getting ICCID)
          let topupStatus = "not_needed";
          let topupError: string | undefined;
          
          if (orderItem.extraDays && orderItem.extraDays > 0 && orderItem.topupPackageCode && esimOrder.iccid) {
            const topupResult = await processTopUp(
              orderItem.id,
              esimOrder.iccid,
              orderItem.extraDays,
              orderItem.topupPackageCode
            );
            
            if (topupResult.success) {
              topupStatus = "success";
            } else {
              topupStatus = "failed";
              topupError = topupResult.error;
              // Log for admin attention - don't fail the whole order
              console.error(`[Order ${order.id}] Top-up failed for orderItem ${orderItem.id}: ${topupResult.error}`);
            }
          }

          esimResults.push({
            ...baseOrderResult,
            topupStatus,
            topupError,
          });

          if (esimOrder.orderNo) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                esimaccessOrderId: esimOrder.orderNo,
                esimaccessOrderStatus: esimOrder.esimStatus || esimOrder.orderStatus || "created",
              },
            });
          }
        } catch (esimError) {
          console.error("eSIM Access order error:", esimError);
          esimResults.push({
            orderItem: orderItem.id,
            status: "error",
            orderNo: "",
            topupStatus: "not_needed",
            topupError: String(esimError),
          });
        }
      }
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { orderItems: true },
    });

    const hasEsimData = updatedOrder?.orderItems.some(i => i.esimIccid);
    if (updatedOrder?.customerEmail && hasEsimData) {
      await sendEmail({
        to: updatedOrder.customerEmail,
        subject: `OW SIM Order #${updatedOrder.id} - Your eSIM is ready!`,
        html: getOrderConfirmationHtml({
          id: updatedOrder.id,
          totalAmount: updatedOrder.totalAmount,
          customerName: updatedOrder.customerName,
          items: updatedOrder.orderItems.map((item) => ({
            planName: item.planName,
            price: item.price,
            quantity: item.quantity,
            qrImage: item.esimQrImage,
            activationCode: item.activationCode,
            iccid: item.esimIccid,
          })),
        }),
      });

      // Send admin notification
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: `New Order #${updatedOrder.id} - ${updatedOrder.totalAmount.toFixed(2)}`,
          html: getOrderConfirmationAdminHtml({
            id: updatedOrder.id,
            totalAmount: updatedOrder.totalAmount,
            customerName: updatedOrder.customerName,
            customerEmail: updatedOrder.customerEmail,
            items: updatedOrder.orderItems.map((item) => ({
              planName: item.planName,
              price: item.price,
            })),
          }),
        });
      }
    }

    // Create commission for referrer if user was referred (after order confirmation)
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { referredById: true },
      });

      if (user?.referredById) {
        try {
          await createCommission(
            user.referredById,
            userId,
            order.id,
            String(order.id),
            totalAmount
          );
        } catch (commissionError) {
          // Log but don't fail the order if commission creation fails
          console.error("Commission creation error:", commissionError);
        }
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder, esimResults });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Order failed" }, { status: 500 });
  }
}

// PUT: Retry payment for pending order
export async function PUT(request: Request) {
  try {
    const cookie = request.headers.get("cookie");
    const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { orderId, paymentMethod } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }
    
    // Find the pending order
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        userId: parseInt(token),
        status: "pending",
      },
      include: { orderItems: true },
    });
    
    if (!order) {
      return NextResponse.json({ error: "Pending order not found" }, { status: 404 });
    }
    
    // Mark as awaiting payment
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "awaiting_payment" },
    });
    
    return NextResponse.json({ success: true, order, message: "Ready for payment" });
  } catch (error) {
    console.error("Retry payment error:", error);
    return NextResponse.json({ error: "Failed to prepare payment" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    const cookie = request.headers.get("cookie");
    const token = cookie?.match(/auth-token=([^;]+)/)?.[1];

    const where: Record<string, unknown> = {};

    if (token) {
      where.userId = parseInt(token);
    } else if (email) {
      where.customerEmail = email;
    } else {
      return NextResponse.json({ error: "Unauthorized - login or provide email" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            plan: { select: { id: true, supportTopUpType: true, name: true } },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}