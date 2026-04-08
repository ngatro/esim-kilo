import { NextResponse } from "next/server";
import { verifyLogin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe } = await request.json();
    
    const user = await verifyLogin(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

    // Cookie expires in 7 days if rememberMe is true, otherwise session cookie (browser closes)
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined; // 30 days if rememberMe, otherwise session

    response.cookies.set("auth-token", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
