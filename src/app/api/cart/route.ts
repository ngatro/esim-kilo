import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to get session from cookies
async function getSessionFromRequest(request: Request) {
  const cookie = request.headers.get("cookie");
  const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
  
  if (token) {
    const userId = parseInt(token);
    if (!isNaN(userId)) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
      }
    }
  }
  
  const nextAuthSession = request.headers.get("cookie")?.match(/next-auth.session-token=([^;]+)/)?.[1];
  if (nextAuthSession) {
    try {
      const parts = nextAuthSession.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        if (payload.email) {
          const user = await prisma.user.findUnique({ where: { email: payload.email } });
          if (user) {
            return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
          }
        }
      }
    } catch (e) {
      console.error("Failed to decode JWT:", e);
    }
  }
  
  return null;
}

// GET /api/cart - Lấy danh sách cart items của user
export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json({ cartItems });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

// POST /api/cart - Thêm item vào giỏ (check tồn tại, tăng quantity hoặc tạo mới)
export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { planId, planName, price, quantity = 1 } = await request.json();
    
    // Validation
    if (!planId || !planName || !price) {
      return NextResponse.json(
        { error: "Missing required fields: planId, planName, price" },
        { status: 400 }
      );
    }
    
    // Server-side price validation: Lấy giá từ Plan table
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      select: { id: true, name: true, priceUsd: true, retailPriceUsd: true },
    });
    
    if (!plan) {
      return NextResponse.json({ error: `Plan not found: ${planId}` }, { status: 404 });
    }
    
    // Sử dụng retailPriceUsd nếu có, fallback về priceUsd
    const validPrice = plan.retailPriceUsd > 0 ? plan.retailPriceUsd : plan.priceUsd;
    
    // Kiểm tra xem planId đã tồn tại trong giỏ chưa
    const existingItem = await prisma.cartItem.findFirst({
      where: { userId, planId },
    });
    
    if (existingItem) {
      // Nếu tồn tại: Tăng quantity thêm 1 (dùng update)
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      return NextResponse.json({ 
        success: true, 
        item: updatedItem,
        message: "Cart updated" 
      });
    } else {
      // Nếu chưa: Tạo mới record
      const newItem = await prisma.cartItem.create({
        data: {
          userId,
          planId,
          planName: plan.name, // Sử dụng tên từ DB để đảm bảo chính xác
          price: validPrice,
          quantity,
        },
      });
      return NextResponse.json({ 
        success: true, 
        item: newItem,
        message: "Added to cart" 
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}
