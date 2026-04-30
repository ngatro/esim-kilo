import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";
import path from "path";
import fs from "fs";

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

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), "public/images/promotions");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// GET - Fetch all promotions
export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const promotions = await prisma.promotion.findMany({
      orderBy: { priority: "asc" },
    });
    return NextResponse.json({ promotions });
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 });
  }
}

// POST - Create or update promotion
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const link = formData.get("link") as string;
    const isActive = formData.get("isActive") === "true";
    const priority = parseInt(formData.get("priority") as string) || 0;
    const badge = formData.get("badge") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const image = formData.get("image") as File | null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    let imageUrl: string | undefined;

    // Handle image upload
    if (image && (image.type === "image/jpeg" || image.type === "image/png" || image.type === "image/jpg")) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const fileName = `promo-${Date.now()}.webp`;
      const outputPath = path.join(UPLOAD_DIR, fileName);

      await sharp(buffer)
        .webp({ quality: 80 })
        .toFile(outputPath);

      imageUrl = `/images/promotions/${fileName}`;
    }

    // Parse dates
    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate) : null;

    // If id exists, update; otherwise create
    if (id) {
      const promotion = await prisma.promotion.update({
        where: { id: parseInt(id) },
        data: {
          title,
          link,
          isActive,
          priority,
          badge,
          startDate: startDateObj,
          endDate: endDateObj,
          ...(imageUrl && { imageUrl }),
        },
      });
      return NextResponse.json({ promotion });
    } else {
      const promotion = await prisma.promotion.create({
        data: {
          title,
          imageUrl: imageUrl || "",
          link,
          isActive,
          priority,
          badge,
          startDate: startDateObj,
          endDate: endDateObj,
        },
      });
      return NextResponse.json({ promotion });
    }
  } catch (error) {
    console.error("Error saving promotion:", error);
    return NextResponse.json({ error: "Failed to save promotion" }, { status: 500 });
  }
}

// DELETE - Delete promotion
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") as string;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.promotion.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    return NextResponse.json({ error: "Failed to delete promotion" }, { status: 500 });
  }
}