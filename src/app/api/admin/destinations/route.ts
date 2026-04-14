import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), "public/images/countries");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// GET - Fetch all destinations and regions
export async function GET() {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: { priority: "asc" },
    });

    const regions = await prisma.destinationRegion.findMany({
      orderBy: { priority: "asc" },
    });

    return NextResponse.json({ destinations, regions });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 });
  }
}

// POST - Create or update destination/region
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get("type") as string; // "destination" or "region"

    if (type === "destination") {
      const id = formData.get("id") as string;
      const name = formData.get("name") as string;
      const slug = formData.get("slug") as string;
      const emoji = formData.get("emoji") as string;
      const landmark = formData.get("landmark") as string;
      const isVisible = formData.get("isVisible") === "true";
      const priority = parseInt(formData.get("priority") as string) || 0;
      const image = formData.get("image") as File | null;

      // Validate required fields
      if (!id || !name || !slug) {
        return NextResponse.json({ error: "ID, name, and slug are required" }, { status: 400 });
      }

      let imageUrl: string | undefined;

      // Handle image upload
      if (image && (image.type === "image/jpeg" || image.type === "image/png" || image.type === "image/jpg")) {
        const buffer = Buffer.from(await image.arrayBuffer());
        const fileName = `${slug}-${Date.now()}.webp`;
        const outputPath = path.join(UPLOAD_DIR, fileName);

        await sharp(buffer)
          .webp({ quality: 80 })
          .toFile(outputPath);

        imageUrl = `/images/countries/${fileName}`;
      }

      // Upsert destination
      const destination = await prisma.destination.upsert({
        where: { id },
        update: {
          name,
          slug,
          emoji,
          landmark,
          isVisible,
          priority,
          ...(imageUrl && { imageUrl }),
        },
        create: {
          id,
          name,
          slug,
          emoji,
          landmark,
          isVisible,
          priority,
          imageUrl,
        },
      });

      return NextResponse.json({ destination });
    } else if (type === "region") {
      const id = formData.get("id") as string;
      const name = formData.get("name") as string;
      const emoji = formData.get("emoji") as string;
      const isVisible = formData.get("isVisible") === "true";
      const priority = parseInt(formData.get("priority") as string) || 0;
      const image = formData.get("image") as File | null;

      // Validate required fields
      if (!id || !name) {
        return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
      }

      let imageUrl: string | undefined;

      // Handle image upload
      if (image && (image.type === "image/jpeg" || image.type === "image/png" || image.type === "image/jpg")) {
        const buffer = Buffer.from(await image.arrayBuffer());
        const fileName = `${id}-${Date.now()}.webp`;
        const outputPath = path.join(UPLOAD_DIR, fileName);

        await sharp(buffer)
          .webp({ quality: 80 })
          .toFile(outputPath);

        imageUrl = `/images/countries/${fileName}`;
      }

      // Upsert region
      const region = await prisma.destinationRegion.upsert({
        where: { id },
        update: {
          name,
          emoji,
          isVisible,
          priority,
          ...(imageUrl && { imageUrl }),
        },
        create: {
          id,
          name,
          emoji,
          isVisible,
          priority,
          imageUrl,
        },
      });

      return NextResponse.json({ region });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error saving destination:", error);
    return NextResponse.json({ error: "Failed to save destination" }, { status: 500 });
  }
}

// DELETE - Delete destination or region
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as string;
    const id = searchParams.get("id") as string;

    if (type === "destination") {
      await prisma.destination.delete({
        where: { id },
      });
    } else if (type === "region") {
      await prisma.destinationRegion.delete({
        where: { id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting destination:", error);
    return NextResponse.json({ error: "Failed to delete destination" }, { status: 500 });
  }
}