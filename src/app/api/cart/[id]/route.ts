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

// PATCH /api/cart/:id - Cập nhật số lượng
export async function PATCH(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const cartItemId = parseInt(id);
    const { quantity } = await request.json();
    
    if (quantity === undefined || quantity < 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }
    
    // Kiểm tra cart item thuộc về user này
    const existingItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, userId },
    });
    
    if (!existingItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }
    
    if (quantity === 0) {
      // Nếu quantity = 0 thì xóa item
      await prisma.cartItem.delete({ where: { id: cartItemId } });
      return NextResponse.json({ success: true, message: "Item removed" });
    }
    
    // Cập nhật quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
    
    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("Cart PATCH error:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

// DELETE /api/cart/:id - Xóa item khỏi giỏ
export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const cartItemId = parseInt(id);
    
    // Kiểm tra và xóa item (chỉ xóa nếu thuộc về user)
    const result = await prisma.cartItem.deleteMany({
      where: { id: cartItemId, userId },
    });
    
    if (result.count === 0) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Item deleted" });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete cart item" }, { status: 500 });
  }
}
