import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to verify admin role
async function verifyAdmin(request: Request): Promise<{ error: NextResponse | null, userId: number | null }> {
  const cookie = request.headers.get("cookie");
  const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
  
  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), userId: null };
  }
  
  const userId = parseInt(token);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user || user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 }), userId: null };
  }
  
  return { error: null, userId };
}

// GET - List all top-up packages
export async function GET(request: Request) {
  try {
    const authCheck = await verifyAdmin(request);
    if (authCheck.error) return authCheck.error;

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
    const authCheck = await verifyAdmin(request);
    if (authCheck.error) return authCheck.error;

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
    const authCheck = await verifyAdmin(request);
    if (authCheck.error) return authCheck.error;

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
    const authCheck = await verifyAdmin(request);
    if (authCheck.error) return authCheck.error;

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