import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), "public/images/promotions");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// GET - Fetch all promotions
export async function GET() {
  try {
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