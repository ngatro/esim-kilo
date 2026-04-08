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
      hotCountries: [
        { code: "JP", name: "Japan", emoji: "🇯🇵" },
        { code: "KR", name: "Korea", emoji: "🇰🇷" },
        { code: "TH", name: "Thailand", emoji: "🇹🇭" },
        { code: "SG", name: "Singapore", emoji: "🇸🇬" },
        { code: "VN", name: "Vietnam", emoji: "🇻🇳" },
        { code: "US", name: "USA", emoji: "🇺🇸" },
        { code: "GB", name: "UK", emoji: "🇬🇧" },
        { code: "FR", name: "France", emoji: "🇫🇷" },
        { code: "DE", name: "Germany", emoji: "🇩🇪" },
      ],
      regions: [
        { id: "asia", name: "Asia", emoji: "🌏" },
        { id: "europe", name: "Europe", emoji: "🏰" },
        { id: "americas", name: "Americas", emoji: "🌎" },
        { id: "oceania", name: "Oceania", emoji: "🌴" },
        { id: "global", name: "Global", emoji: "🌐" },
      ],
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
    if (body.hotCountries !== undefined) {
      settings.hotCountries = body.hotCountries;
    }
    if (body.regions !== undefined) {
      settings.regions = body.regions;
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