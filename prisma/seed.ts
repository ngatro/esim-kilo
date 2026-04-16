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
  { id: "FR", name: "France", code: "FR", emoji: "🇫🇷", slug: "france" },
  { id: "DE", name: "Germany", code: "DE", emoji: "🇩🇪", slug: "germany" },
  { id: "IT", name: "Italy", code: "IT", emoji: "🇮🇹", slug: "italy" },
  { id: "ES", name: "Spain", code: "ES", emoji: "🇪🇸", slug: "spain" },
  { id: "GB", name: "United Kingdom", code: "GB", emoji: "🇬🇧", slug: "united-kingdom" },
  { id: "NL", name: "Netherlands", code: "NL", emoji: "🇳🇱", slug: "netherlands" },
  { id: "BE", name: "Belgium", code: "BE", emoji: "🇧🇪", slug: "belgium" },
  { id: "AT", name: "Austria", code: "AT", emoji: "🇦🇹", slug: "austria" },
  { id: "PT", name: "Portugal", code: "PT", emoji: "🇵🇹", slug: "portugal" },
  { id: "GR", name: "Greece", code: "GR", emoji: "🇬🇷", slug: "greece" },
  { id: "PL", name: "Poland", code: "PL", emoji: "🇵🇱", slug: "poland" },
  { id: "CH", name: "Switzerland", code: "CH", emoji: "🇨🇭", slug: "switzerland" },
  { id: "SE", name: "Sweden", code: "SE", emoji: "🇸🇪", slug: "sweden" },
  { id: "NO", name: "Norway", code: "NO", emoji: "🇳🇴", slug: "norway" },
  { id: "DK", name: "Denmark", code: "DK", emoji: "🇩🇰", slug: "denmark" },
  { id: "FI", name: "Finland", code: "FI", emoji: "🇫🇮", slug: "finland" },
  { id: "IE", name: "Ireland", code: "IE", emoji: "🇮🇪", slug: "ireland" },
  { id: "CZ", name: "Czech Republic", code: "CZ", emoji: "🇨🇿", slug: "czech-republic" },
  { id: "HU", name: "Hungary", code: "HU", emoji: "🇭🇺", slug: "hungary" },
  { id: "RO", name: "Romania", code: "RO", emoji: "🇷🇴", slug: "romania" },
  // Asia
  { id: "JP", name: "Japan", code: "JP", emoji: "🇯🇵", slug: "japan" },
  { id: "KR", name: "South Korea", code: "KR", emoji: "🇰🇷", slug: "south-korea" },
  { id: "CN", name: "China", code: "CN", emoji: "🇨🇳", slug: "china" },
  { id: "TH", name: "Thailand", code: "TH", emoji: "🇹🇭", slug: "thailand" },
  { id: "VN", name: "Vietnam", code: "VN", emoji: "🇻🇳", slug: "vietnam" },
  { id: "SG", name: "Singapore", code: "SG", emoji: "🇸🇬", slug: "singapore" },
  { id: "MY", name: "Malaysia", code: "MY", emoji: "🇲🇾", slug: "malaysia" },
  { id: "ID", name: "Indonesia", code: "ID", emoji: "🇮🇩", slug: "indonesia" },
  { id: "PH", name: "Philippines", code: "PH", emoji: "🇵🇭", slug: "philippines" },
  { id: "TW", name: "Taiwan", code: "TW", emoji: "🇹🇼", slug: "taiwan" },
  { id: "HK", name: "Hong Kong", code: "HK", emoji: "🇭🇰", slug: "hong-kong" },
  { id: "IN", name: "India", code: "IN", emoji: "🇮🇳", slug: "india" },
  // Middle East
  { id: "AE", name: "UAE", code: "AE", emoji: "🇦🇪", slug: "uae" },
  { id: "SA", name: "Saudi Arabia", code: "SA", emoji: "🇸🇦", slug: "saudi-arabia" },
  { id: "QA", name: "Qatar", code: "QA", emoji: "🇶🇦", slug: "qatar" },
  { id: "KW", name: "Kuwait", code: "KW", emoji: "🇰🇼", slug: "kuwait" },
  { id: "BH", name: "Bahrain", code: "BH", emoji: "🇧🇭", slug: "bahrain" },
  // Americas
  { id: "US", name: "United States", code: "US", emoji: "🇺🇸", slug: "united-states" },
  { id: "CA", name: "Canada", code: "CA", emoji: "🇨🇦", slug: "canada" },
  { id: "MX", name: "Mexico", code: "MX", emoji: "🇲🇽", slug: "mexico" },
  { id: "BR", name: "Brazil", code: "BR", emoji: "🇧🇷", slug: "brazil" },
  { id: "AR", name: "Argentina", code: "AR", emoji: "🇦🇷", slug: "argentina" },
  { id: "CO", name: "Colombia", code: "CO", emoji: "🇨🇴", slug: "colombia" },
  { id: "CL", name: "Chile", code: "CL", emoji: "🇨🇱", slug: "chile" },
  // Oceania
  { id: "AU", name: "Australia", code: "AU", emoji: "🇦🇺", slug: "australia" },
  { id: "NZ", name: "New Zealand", code: "NZ", emoji: "🇳🇿", slug: "new-zealand" },
  // Africa
  { id: "ZA", name: "South Africa", code: "ZA", emoji: "🇿🇦", slug: "south-africa" },
  { id: "EG", name: "Egypt", code: "EG", emoji: "🇪🇬", slug: "egypt" },
  { id: "NG", name: "Nigeria", code: "NG", emoji: "🇳🇬", slug: "nigeria" },
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
    const countryWithSlug = country as { id: string; name: string; code: string; emoji: string; slug: string };
    await prisma.country.upsert({ where: { id: countryWithSlug.code }, update: {}, create: countryWithSlug });
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