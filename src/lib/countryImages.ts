const COUNTRY_NAMES: Record<string, string> = {
  JP: "Japan", KR: "South Korea", TH: "Thailand", VN: "Vietnam", SG: "Singapore",
  MY: "Malaysia", ID: "Indonesia", PH: "Philippines", IN: "India", CN: "China",
  TW: "Taiwan", HK: "Hong Kong", US: "United States", CA: "Canada", MX: "Mexico",
  BR: "Brazil", GB: "United Kingdom", FR: "France", DE: "Germany", IT: "Italy",
  ES: "Spain", NL: "Netherlands", CH: "Switzerland", AT: "Austria", SE: "Sweden",
  NO: "Norway", AU: "Australia", NZ: "New Zealand", AE: "United Arab Emirates",
  TR: "Turkey", RU: "Russia", PL: "Poland", GR: "Greece", PT: "Portugal",
  IE: "Ireland", FI: "Finland", DK: "Denmark", CZ: "Czech Republic", HU: "Hungary",
  RO: "Romania", BG: "Bulgaria", HR: "Croatia", SK: "Slovakia", SI: "Slovenia",
  LT: "Lithuania", LV: "Latvia", EE: "Estonia", UA: "Ukraine", EG: "Egypt",
  ZA: "South Africa", NG: "Nigeria", KE: "Kenya", MA: "Morocco", GH: "Ghana",
  AR: "Argentina", CL: "Chile", CO: "Colombia", PE: "Peru", VE: "Venezuela",
  PY: "Paraguay", UY: "Uruguay", BO: "Bolivia", EC: "Ecuador", CR: "Costa Rica",
  PA: "Panama", GT: "Guatemala", DO: "Dominican Republic", JM: "Jamaica", TT: "Trinidad",
  BH: "Bahrain", KW: "Kuwait", SA: "Saudi Arabia", QA: "Qatar", OM: "Oman",
  JO: "Jordan", LB: "Lebanon", SY: "Syria", IL: "Israel", PK: "Pakistan",
  BD: "Bangladesh", NP: "Nepal", LK: "Sri Lanka", MM: "Myanmar", KH: "Cambodia",
  LA: "Laos", BN: "Brunei", MO: "Macau", MN: "Mongolia", TJ: "Tajikistan",
  KG: "Kyrgyzstan", KZ: "Kazakhstan", UZ: "Uzbekistan", TM: "Turkmenistan",
  AF: "Afghanistan", AZ: "Azerbaijan", GE: "Georgia", AM: "Armenia",
};

export function getCountryName(isoCode: string | null): string | null {
  if (!isoCode) return null;
  return COUNTRY_NAMES[isoCode.toUpperCase()] || null;
}

export function getDynamicImageUrl(countryCode: string | null, seed: string): string | null {
  if (!countryCode) return null;
  
  const countryName = getCountryName(countryCode);
  if (!countryName) return null;
  
  const keywords = encodeURIComponent(`${countryName},landmark,travel`);
  return `https://source.unsplash.com/featured/800x600?${keywords}&sig=${encodeURIComponent(seed)}`;
}

export function getConsistentIndex(str: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % length;
}