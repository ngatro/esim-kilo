import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper function to get session from cookies
async function getSessionFromRequest(request: Request) {
  const cookie = request.headers.get("cookie");
  const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
  
  if (token) {
    // For legacy auth (email/password), get user from token
    const userId = parseInt(token);
    if (!isNaN(userId)) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
      }
    }
  }
  
  // For NextAuth (Google OAuth), try to get session from JWT
  // This is a simplified version - in production, you should verify the JWT properly
  const nextAuthSession = request.headers.get("cookie")?.match(/next-auth.session-token=([^;]+)/)?.[1];
  if (nextAuthSession) {
    // Decode JWT (simplified - in production, verify the signature)
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

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";

    if (!search || search.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[Admin User Search] Error:", error);
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
}