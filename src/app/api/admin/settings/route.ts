import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const SETTINGS_FILE = join(process.cwd(), "data", "settings.json");

async function getSettings() {
  try {
    const data = await readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {
      whatsappNumber: "84912345678",
      supportEmail: "support@openworldesim.com",
      tawkPropertyId: "",
      tawkWidgetId: "",
      currencyRates: { EUR: 0.92, VND: 24500, GBP: 0.79, JPY: 150 },
    };
  }
}

async function saveSettings(settings: Record<string, unknown>) {
  try {
    const dir = join(process.cwd(), "data");
    await import("fs/promises").then((fs) => fs.mkdir(dir, { recursive: true }));
    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const settings = await getSettings();
    
    if (body.whatsappNumber !== undefined) {
      settings.whatsappNumber = body.whatsappNumber;
    }
    if (body.supportEmail !== undefined) {
      settings.supportEmail = body.supportEmail;
    }
    if (body.tawkPropertyId !== undefined) {
      settings.tawkPropertyId = body.tawkPropertyId;
    }
    if (body.tawkWidgetId !== undefined) {
      settings.tawkWidgetId = body.tawkWidgetId;
    }
    if (body.currencyRates !== undefined) {
      settings.currencyRates = body.currencyRates;
    }

    const saved = await saveSettings(settings);
    if (saved) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}