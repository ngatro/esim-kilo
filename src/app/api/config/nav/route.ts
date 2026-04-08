import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const SETTINGS_FILE = join(process.cwd(), "data", "settings.json");

export async function GET() {
  try {
    const data = await readFile(SETTINGS_FILE, "utf-8");
    const settings = JSON.parse(data);
    return NextResponse.json({
      hotCountries: settings.hotCountries || [],
      regions: settings.regions || [],
    });
  } catch {
    return NextResponse.json({ hotCountries: [], regions: [] });
  }
}