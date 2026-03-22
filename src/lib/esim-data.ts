export type Region = "europe" | "asia" | "americas" | "africa" | "oceania" | "middle-east" | "global";

export interface EsimPlan {
  id: string;
  destination: string;
  region: Region;
  flag: string;
  coverageCountries: number;
  dataGb: number;
  validityDays: number;
  priceUsd: number;
  popular?: boolean;
  badge?: string;
  speeds: string[];
  features: string[];
}

export const REGIONS: { id: Region; label: string; emoji: string }[] = [
  { id: "global", label: "Global", emoji: "🌍" },
  { id: "europe", label: "Europe", emoji: "🇪🇺" },
  { id: "asia", label: "Asia", emoji: "🌏" },
  { id: "americas", label: "Americas", emoji: "🌎" },
  { id: "middle-east", label: "Middle East", emoji: "🕌" },
  { id: "africa", label: "Africa", emoji: "🌍" },
  { id: "oceania", label: "Oceania", emoji: "🦘" },
];

export const ESIM_PLANS: EsimPlan[] = [
  // Global
  {
    id: "global-5gb-30d",
    destination: "Global",
    region: "global",
    flag: "🌍",
    coverageCountries: 130,
    dataGb: 5,
    validityDays: 30,
    priceUsd: 29.99,
    popular: true,
    badge: "Best Seller",
    speeds: ["4G LTE", "5G (select markets)"],
    features: ["Instant activation", "No roaming charges", "Hotspot sharing"],
  },
  {
    id: "global-10gb-30d",
    destination: "Global",
    region: "global",
    flag: "🌍",
    coverageCountries: 130,
    dataGb: 10,
    validityDays: 30,
    priceUsd: 49.99,
    speeds: ["4G LTE", "5G (select markets)"],
    features: ["Instant activation", "No roaming charges", "Hotspot sharing", "Top-up available"],
  },
  // Europe
  {
    id: "europe-5gb-15d",
    destination: "Europe",
    region: "europe",
    flag: "🇪🇺",
    coverageCountries: 35,
    dataGb: 5,
    validityDays: 15,
    priceUsd: 14.99,
    badge: "Popular",
    popular: true,
    speeds: ["4G LTE", "5G"],
    features: ["Instant activation", "No roaming", "Works in EU & UK"],
  },
  {
    id: "europe-20gb-30d",
    destination: "Europe",
    region: "europe",
    flag: "🇪🇺",
    coverageCountries: 35,
    dataGb: 20,
    validityDays: 30,
    priceUsd: 24.99,
    speeds: ["4G LTE", "5G"],
    features: ["Instant activation", "No roaming", "Works in EU & UK", "Hotspot sharing"],
  },
  {
    id: "uk-5gb-15d",
    destination: "United Kingdom",
    region: "europe",
    flag: "🇬🇧",
    coverageCountries: 1,
    dataGb: 5,
    validityDays: 15,
    priceUsd: 9.99,
    speeds: ["4G LTE", "5G"],
    features: ["Instant activation", "Unlimited calls & texts add-on available"],
  },
  {
    id: "france-10gb-30d",
    destination: "France",
    region: "europe",
    flag: "🇫🇷",
    coverageCountries: 1,
    dataGb: 10,
    validityDays: 30,
    priceUsd: 12.99,
    speeds: ["4G LTE", "5G"],
    features: ["Instant activation", "Paris metro coverage", "Hotspot sharing"],
  },
  // Asia
  {
    id: "japan-5gb-15d",
    destination: "Japan",
    region: "asia",
    flag: "🇯🇵",
    coverageCountries: 1,
    dataGb: 5,
    validityDays: 15,
    priceUsd: 13.99,
    popular: true,
    badge: "Top Pick",
    speeds: ["4G LTE", "5G"],
    features: ["Instant activation", "Nationwide coverage", "Docomo network"],
  },
  {
    id: "japan-unlimited-7d",
    destination: "Japan",
    region: "asia",
    flag: "🇯🇵",
    coverageCountries: 1,
    dataGb: 999,
    validityDays: 7,
    priceUsd: 18.99,
    badge: "Unlimited",
    speeds: ["4G LTE"],
    features: ["Unlimited data", "Nationwide coverage", "Perfect for tourists"],
  },
  {
    id: "southeast-asia-10gb-30d",
    destination: "Southeast Asia",
    region: "asia",
    flag: "🌏",
    coverageCountries: 10,
    dataGb: 10,
    validityDays: 30,
    priceUsd: 19.99,
    speeds: ["4G LTE"],
    features: ["Thailand, Vietnam, Indonesia & more", "Instant activation", "Multi-network"],
  },
  {
    id: "south-korea-5gb-15d",
    destination: "South Korea",
    region: "asia",
    flag: "🇰🇷",
    coverageCountries: 1,
    dataGb: 5,
    validityDays: 15,
    priceUsd: 11.99,
    speeds: ["4G LTE", "5G"],
    features: ["Instant activation", "SK Telecom network", "Nationwide coverage"],
  },
  // Americas
  {
    id: "usa-10gb-30d",
    destination: "United States",
    region: "americas",
    flag: "🇺🇸",
    coverageCountries: 1,
    dataGb: 10,
    validityDays: 30,
    priceUsd: 16.99,
    popular: true,
    speeds: ["4G LTE", "5G"],
    features: ["AT&T / T-Mobile network", "Nationwide coverage", "Hotspot sharing"],
  },
  {
    id: "usa-canada-mexico-10gb-30d",
    destination: "North America",
    region: "americas",
    flag: "🌎",
    coverageCountries: 3,
    dataGb: 10,
    validityDays: 30,
    priceUsd: 21.99,
    badge: "Popular",
    speeds: ["4G LTE", "5G"],
    features: ["USA, Canada & Mexico", "Instant activation", "Hotspot sharing"],
  },
  // Middle East
  {
    id: "uae-5gb-30d",
    destination: "UAE",
    region: "middle-east",
    flag: "🇦🇪",
    coverageCountries: 1,
    dataGb: 5,
    validityDays: 30,
    priceUsd: 15.99,
    speeds: ["4G LTE", "5G"],
    features: ["Instant activation", "Etisalat network", "Dubai & Abu Dhabi"],
  },
  {
    id: "middle-east-5gb-30d",
    destination: "Middle East",
    region: "middle-east",
    flag: "🕌",
    coverageCountries: 12,
    dataGb: 5,
    validityDays: 30,
    priceUsd: 22.99,
    speeds: ["4G LTE"],
    features: ["UAE, Saudi Arabia, Jordan & more", "Instant activation"],
  },
  // Africa
  {
    id: "south-africa-5gb-30d",
    destination: "South Africa",
    region: "africa",
    flag: "🇿🇦",
    coverageCountries: 1,
    dataGb: 5,
    validityDays: 30,
    priceUsd: 12.99,
    speeds: ["4G LTE"],
    features: ["Instant activation", "Vodacom network", "Major cities coverage"],
  },
  // Oceania
  {
    id: "australia-10gb-30d",
    destination: "Australia",
    region: "oceania",
    flag: "🇦🇺",
    coverageCountries: 1,
    dataGb: 10,
    validityDays: 30,
    priceUsd: 18.99,
    speeds: ["4G LTE", "5G"],
    features: ["Telstra network", "Nationwide coverage", "Instant activation"],
  },
];

export function getPlansByRegion(region: Region | "all"): EsimPlan[] {
  if (region === "all") return ESIM_PLANS;
  return ESIM_PLANS.filter((p) => p.region === region);
}

export function getPopularPlans(): EsimPlan[] {
  return ESIM_PLANS.filter((p) => p.popular);
}

export function getPlanById(id: string): EsimPlan | undefined {
  return ESIM_PLANS.find((p) => p.id === id);
}

export function formatData(gb: number): string {
  if (gb >= 999) return "Unlimited";
  return `${gb} GB`;
}
