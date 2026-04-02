import { NextResponse } from "next/server";
import { getUserById, getUserByEmail } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    // Method 1: Check old auth cookie
    const cookie = request.headers.get("cookie");
    const token = cookie?.match(/auth-token=([^;]+)/)?.[1];

    if (token) {
      const userId = parseInt(token);
      const user = await getUserById(userId);
      if (user) {
        return NextResponse.json({
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
      }
    }

    // Method 2: Lookup by email (for NextAuth users)
    if (email) {
      const user = await getUserByEmail(email);
      if (user) {
        return NextResponse.json({
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
      }
    }

    return NextResponse.json({ user: null });
  } catch {
    return NextResponse.json({ user: null });
  }
}