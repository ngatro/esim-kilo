import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Helper to generate slug from country name
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const REGIONS = [
  { id: "global", name: "Global", emoji: "🌍" },
  { id: "europe", name: "Europe", emoji: "🇪🇺" },
  { id: "asia", name: "Asia", emoji: "🌏" },
  { id: "americas", name: "Americas", emoji: "🌎" },
  { id: "middle-east", name: "Middle East", emoji: "🕌" },
  { id: "africa", name: "Africa", emoji: "🌍" },
  { id: "oceania", name: "Oceania", emoji: "🦘" },
];

const COUNTRIES = [
  // Europe
  { id: "FR", name: "France", code: "FR", emoji: "🇫🇷", regionId: "europe", slug: "france" },
  { id: "DE", name: "Germany", code: "DE", emoji: "🇩🇪", regionId: "europe", slug: "germany" },
  { id: "IT", name: "Italy", code: "IT", emoji: "🇮🇹", regionId: "europe", slug: "italy" },
  { id: "ES", name: "Spain", code: "ES", emoji: "🇪🇸", regionId: "europe", slug: "spain" },
  { id: "GB", name: "United Kingdom", code: "GB", emoji: "🇬🇧", regionId: "europe", slug: "united-kingdom" },
  { id: "NL", name: "Netherlands", code: "NL", emoji: "🇳🇱", regionId: "europe", slug: "netherlands" },
  { id: "BE", name: "Belgium", code: "BE", emoji: "🇧🇪", regionId: "europe", slug: "belgium" },
  { id: "AT", name: "Austria", code: "AT", emoji: "🇦🇹", regionId: "europe", slug: "austria" },
  { id: "PT", name: "Portugal", code: "PT", emoji: "🇵🇹", regionId: "europe", slug: "portugal" },
  { id: "GR", name: "Greece", code: "GR", emoji: "🇬🇷", regionId: "europe", slug: "greece" },
  { id: "PL", name: "Poland", code: "PL", emoji: "🇵🇱", regionId: "europe", slug: "poland" },
  { id: "CH", name: "Switzerland", code: "CH", emoji: "🇨🇭", regionId: "europe", slug: "switzerland" },
  { id: "SE", name: "Sweden", code: "SE", emoji: "🇸🇪", regionId: "europe", slug: "sweden" },
  { id: "NO", name: "Norway", code: "NO", emoji: "🇳🇴", regionId: "europe", slug: "norway" },
  { id: "DK", name: "Denmark", code: "DK", emoji: "🇩🇰", regionId: "europe", slug: "denmark" },
  { id: "FI", name: "Finland", code: "FI", emoji: "🇫🇮", regionId: "europe", slug: "finland" },
  { id: "IE", name: "Ireland", code: "IE", emoji: "🇮🇪", regionId: "europe", slug: "ireland" },
  { id: "CZ", name: "Czech Republic", code: "CZ", emoji: "🇨🇿", regionId: "europe", slug: "czech-republic" },
  { id: "HU", name: "Hungary", code: "HU", emoji: "🇭🇺", regionId: "europe", slug: "hungary" },
  { id: "RO", name: "Romania", code: "RO", emoji: "🇷🇴", regionId: "europe" },
  // Asia
  { id: "JP", name: "Japan", code: "JP", emoji: "🇯🇵", regionId: "asia" },
  { id: "KR", name: "South Korea", code: "KR", emoji: "🇰🇷", regionId: "asia" },
  { id: "CN", name: "China", code: "CN", emoji: "🇨🇳", regionId: "asia" },
  { id: "TH", name: "Thailand", code: "TH", emoji: "🇹🇭", regionId: "asia" },
  { id: "VN", name: "Vietnam", code: "VN", emoji: "🇻🇳", regionId: "asia" },
  { id: "SG", name: "Singapore", code: "SG", emoji: "🇸🇬", regionId: "asia" },
  { id: "MY", name: "Malaysia", code: "MY", emoji: "🇲🇾", regionId: "asia" },
  { id: "ID", name: "Indonesia", code: "ID", emoji: "🇮🇩", regionId: "asia" },
  { id: "PH", name: "Philippines", code: "PH", emoji: "🇵🇭", regionId: "asia" },
  { id: "TW", name: "Taiwan", code: "TW", emoji: "🇹🇼", regionId: "asia" },
  { id: "HK", name: "Hong Kong", code: "HK", emoji: "🇭🇰", regionId: "asia" },
  { id: "IN", name: "India", code: "IN", emoji: "🇮🇳", regionId: "asia" },
  // Middle East
  { id: "AE", name: "UAE", code: "AE", emoji: "🇦🇪", regionId: "middle-east" },
  { id: "SA", name: "Saudi Arabia", code: "SA", emoji: "🇸🇦", regionId: "middle-east" },
  { id: "QA", name: "Qatar", code: "QA", emoji: "🇶🇦", regionId: "middle-east" },
  { id: "KW", name: "Kuwait", code: "KW", emoji: "🇰🇼", regionId: "middle-east" },
  { id: "BH", name: "Bahrain", code: "BH", emoji: "🇧🇭", regionId: "middle-east" },
  // Americas
  { id: "US", name: "United States", code: "US", emoji: "🇺🇸", regionId: "americas" },
  { id: "CA", name: "Canada", code: "CA", emoji: "🇨🇦", regionId: "americas" },
  { id: "MX", name: "Mexico", code: "MX", emoji: "🇲🇽", regionId: "americas" },
  { id: "BR", name: "Brazil", code: "BR", emoji: "🇧🇷", regionId: "americas" },
  { id: "AR", name: "Argentina", code: "AR", emoji: "🇦🇷", regionId: "americas" },
  { id: "CO", name: "Colombia", code: "CO", emoji: "🇨🇴", regionId: "americas" },
  { id: "CL", name: "Chile", code: "CL", emoji: "🇨🇱", regionId: "americas" },
  // Oceania
  { id: "AU", name: "Australia", code: "AU", emoji: "🇦🇺", regionId: "oceania" },
  { id: "NZ", name: "New Zealand", code: "NZ", emoji: "🇳🇿", regionId: "oceania" },
  // Africa
  { id: "ZA", name: "South Africa", code: "ZA", emoji: "🇿🇦", regionId: "africa" },
  { id: "EG", name: "Egypt", code: "EG", emoji: "🇪🇬", regionId: "africa" },
  { id: "NG", name: "Nigeria", code: "NG", emoji: "🇳🇬", regionId: "africa" },
  { id: "KE", name: "Kenya", code: "KE", emoji: "🇰🇪", regionId: "africa" },
  { id: "MA", name: "Morocco", code: "MA", emoji: "🇲🇦", regionId: "africa" },
];

async function main() {
  console.log("Seeding database...");

  for (const region of REGIONS) {
    await prisma.region.upsert({ where: { id: region.id }, update: {}, create: region });
  }
  console.log("✓ Regions seeded");

  for (const country of COUNTRIES) {
    await prisma.country.upsert({ where: { id: country.code }, update: {}, create: country });
  }
  console.log("✓ Countries seeded");

  await prisma.setting.upsert({
    where: { key: "site_name" },
    update: {},
    create: { key: "site_name", value: "OW SIM - OpenWorld eSIM" },
  });
  await prisma.setting.upsert({
    where: { key: "site_tagline" },
    update: {},
    create: { key: "site_tagline", value: "Stay Connected Anywhere" },
  });
  console.log("✓ Settings seeded");

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });