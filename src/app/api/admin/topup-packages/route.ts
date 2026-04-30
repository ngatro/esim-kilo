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


// GET - List all top-up packages
export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const planId = url.searchParams.get("planId");

    const where = planId ? { planId } : {};

    const packages = await prisma.topupPackage.findMany({
      where,
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            packageCode: true,
            destination: true,
          },
        },
      },
      orderBy: [
        { planId: "asc" },
        { priority: "asc" },
      ],
    });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("[Admin TopupPackages GET] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST - Create a new top-up package
export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planId, packageCode, name, priceUsd, isFlexible, isActive, priority } = body;

    if (!packageCode || priceUsd === undefined) {
      return NextResponse.json({ error: "packageCode and priceUsd are required" }, { status: 400 });
    }

    // Check if packageCode already exists
    const existing = await prisma.topupPackage.findUnique({
      where: { packageCode },
    });

    if (existing) {
      return NextResponse.json({ error: "Package code already exists" }, { status: 400 });
    }

    const topupPackage = await prisma.topupPackage.create({
      data: {
        planId: planId || null,
        packageCode,
        name,
        priceUsd,
        isFlexible: isFlexible ?? false,
        isActive: isActive ?? true,
        priority: priority || 0,
      },
    });

    return NextResponse.json({ package: topupPackage });
  } catch (error) {
    console.error("[Admin TopupPackages POST] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PUT - Update a top-up package
export async function PUT(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, packageCode, name, priceUsd, isFlexible, isActive, priority } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (packageCode !== undefined) updateData.packageCode = packageCode;
    if (name !== undefined) updateData.name = name;
    if (priceUsd !== undefined) updateData.priceUsd = priceUsd;
    if (isFlexible !== undefined) updateData.isFlexible = isFlexible;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (priority !== undefined) updateData.priority = priority;

    const topupPackage = await prisma.topupPackage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ package: topupPackage });
  } catch (error) {
    console.error("[Admin TopupPackages PUT] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE - Delete a top-up package
export async function DELETE(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.topupPackage.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin TopupPackages DELETE] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}