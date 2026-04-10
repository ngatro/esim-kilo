import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ country: string }>;
}

// Map country code to name
const countryNames: Record<string, string> = {
  TH: "Thailand",
  VN: "Vietnam",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  US: "USA",
  AU: "Australia",
  SG: "Singapore",
  MY: "Malaysia",
  ID: "Indonesia",
  PH: "Philippines",
  HK: "Hong Kong",
  TW: "Taiwan",
  IN: "India",
  AE: "United Arab Emirates",
  GB: "United Kingdom",
  FR: "France",
  DE: "Germany",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  CA: "Canada",
  MX: "Mexico",
  BR: "Brazil",
};

// List of regions for detection
const regions = ["global", "asia", "europe", "americas", "oceania"];

export default async function EsimCountryPage({ params }: PageProps) {
  const { country } = await params;
  
  // Determine if slug is a region or specific country
  const isRegion = regions.includes(country.toLowerCase());
  const displayName = countryNames[country.toUpperCase()] || country;

  // Fetch plans - use regionId for regions, countryId for specific countries
  const queryParam = isRegion ? 'regionId' : 'countryId';
  const queryValue = isRegion ? country.toLowerCase() : country.toUpperCase();
  
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/plans?${queryParam}=${queryValue}`;
  const res = await fetch(apiUrl);
  
  if (!res.ok) return notFound();
  
  const data = await res.json();
  const plans = data.plans || [];
  
  if (!plans.length) return notFound();

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">{displayName} eSIM Plans</h1>
        <p className="text-slate-600 mb-8">Choose from {plans.length} available plans</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan: any) => (
            <Link 
              key={plan.id}
              href={`/esim/${country}/${plan.slug}`}
              className="block border border-slate-200 rounded-xl p-4 hover:border-orange-400 hover:shadow-lg transition-all"
            >
              <h3 className="font-semibold text-lg">{plan.destination}</h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-orange-500">${plan.priceUsd}</span>
                <span className="text-slate-500 text-sm">/ {plan.durationDays} days</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {plan.dataAmount ? `${plan.dataAmount}MB` : 'Unlimited'}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}