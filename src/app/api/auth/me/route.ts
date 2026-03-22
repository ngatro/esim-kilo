import { NextResponse } from "next/server";
import { getUserById } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get("cookie");
    const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
    
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const userId = parseInt(token);
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
