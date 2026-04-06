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
  JP: "https://images.unsplash.com/photo-1493976040374-85c2e8f8081c?w=800&q=80",
  KR: "https://images.unsplash.com/photo-1517154421773-0529f29ea3a5?w=800&q=80",
  SG: "https://images.unsplash.com/photo-1525625293386-3f8f99389bed?w=800&q=80",
  CN: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
  TW: "https://images.unsplash.com/photo-1559631658-138a500cc5bf?w=800&q=80",
  HK: "https://images.unsplash.com/photo-1536599018102-9f802c0c5d34?w=800&q=80",
  US: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80",
  CA: "https://images.unsplash.com/photo-1517935706615-30c3012de8de?w=800&q=80",
  MX: "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800&q=80",
  GB: "https://images.unsplash.com/photo-1529651837248-b5a6f8e8e0e6?w=800&q=80",
  FR: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  DE: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80",
  IT: "https://images.unsplash.com/photo-1515542622106-78bda8ba0adb?w=800&q=80",
  ES: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80",
  NL: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  CH: "https://images.unsplash.com/photo-1527668752968-14dc70a27c73?w=800&q=80",
  AT: "https://images.unsplash.com/photo-1559779609-6edd8c90a6bd?w=800&q=80",
  SE: "https://images.unsplash.com/photo-1508361001413-e12ed02f63c04?w=800&q=80",
  NO: "https://images.unsplash.com/photo-1531366936337-7c912bf5a5cd?w=800&q=80",
  AU: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80",
  NZ: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80",
  AE: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  TR: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7201?w=800&q=80",
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