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

const COUNTRY_STATIC_IMAGES: Record<string, string> = {
  VN: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
  RU: "https://images.unsplash.com/photo-1518676595309-0cbc5636a85c?w=800&q=80",
  AZ: "https://images.unsplash.com/photo-1602343165832-d28cb3a9d863?w=800&q=80",
  PE: "https://images.unsplash.com/photo-1531969179221-3946e6b5a5e7?w=800&q=80",
  CO: "https://images.unsplash.com/photo-1579465231221-58b4f8b3d61e?w=800&q=80",
  CL: "https://images.unsplash.com/photo-1470739661298-91ba2e7675a2?w=800&q=80",
  AR: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80",
  BR: "https://images.unsplash.com/photo-1483729558449-99ef09a8e325?w=800&q=80",
  IN: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  TH: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
  ID: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80",
  PH: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80",
  MY: "https://images.unsplash.com/photo-1512553232225-a498-2a0b6008d120?w=800&q=80",
  KH: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&q=80",
  NP: "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?w=800&q=80",
  PK: "https://images.unsplash.com/photo-1664473489856-108a3a43d973?w=800&q=80",
  BD: "https://images.unsplash.com/photo-1598094667329-5dc05b5b1c88?w=800&q=80",
  LK: "https://images.unsplash.com/photo-1580064059820-4a2a195f74f7?w=800&q=80",
  MM: "https://images.unsplash.com/photo-1553712947-0f9f819f2d6c?w=800&q=80",
  NG: "https://images.unsplash.com/photo-1590650046871-e7b73ba2dd89?w=800&q=80",
  KE: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
  MA: "https://images.unsplash.com/photo-1517821099086-6c381a079749?w=800&q=80",
  EG: "https://images.unsplash.com/photo-1539650116574-8efeb43e4170?w=800&q=80",
  ZA: "https://images.unsplash.com/photo-1580060839134-75a5edca2e27?w=800&q=80",
  UA: "https://images.unsplash.com/photo-1549488346-6352e9129a56?w=800&q=80",
  RO: "https://images.unsplash.com/photo-1578662996442-48f60103f96c?w=800&q=80",
  PL: "https://images.unsplash.com/photo-1595881233410-17c997a32c56?w=800&q=80",
  CZ: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80",
  HU: "https://images.unsplash.com/photo-1531401536085-f2b5c4e9c4a1?w=800&q=80",
  GR: "https://images.unsplash.com/photo-1555993539-1732b0258238?w=800&q=80",
  PT: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
};

export function getCountryName(isoCode: string | null): string | null {
  if (!isoCode) return null;
  return COUNTRY_NAMES[isoCode.toUpperCase()] || null;
}

export function getDynamicImageUrl(countryCode: string | null, seed: string): string | null {
  if (!countryCode) return null;
  
  const code = countryCode.toUpperCase();
  
  // Check for static fallback first
  if (COUNTRY_STATIC_IMAGES[code]) {
    return COUNTRY_STATIC_IMAGES[code];
  }
  
  const countryName = getCountryName(code);
  if (!countryName) return null;
  
  // Try using picsum.photos as alternative (more reliable than source.unsplash.com)
  const keywords = encodeURIComponent(`${countryName},landmark,tourism`);
  return `https://image.pollinations.ai/prompt/${keywords}?width=800&height=600&nologo=true&seed=${encodeURIComponent(seed)}`;
}

export function getConsistentIndex(str: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % length;
}