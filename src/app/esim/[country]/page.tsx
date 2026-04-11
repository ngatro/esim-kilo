"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PlanCard } from "@/app/plans/PlanCard";

interface Plan {
  id: string;
  slug: string | null;
  packageCode: string;
  destination: string;
  dataAmount: number;
  dataVolume: number;
  durationDays: number;
  priceUsd: number;
  retailPriceUsd: number;
  countryId: string | null;
  regionId: string | null;
  isPopular: boolean;
  isBestSeller: boolean;
  badge: string | null;
}

const regions = ["global", "asia", "europe", "americas", "oceania"];

// Map slug to ISO country code
const slugToCodeMap: Record<string, string> = {
  "united-arab-emirates": "AE",
  "united-kingdom": "GB",
  "united-states": "US",
  "south-korea": "KR",
  "hong-kong": "HK",
  "czech-republic": "CZ",
  "new-zealand": "NZ",
  "saudi-arabia": "SA",
  "germany": "DE",
  "japan": "JP",
  "france": "FR",
  "italy": "IT",
  "spain": "ES",
  "thailand": "TH",
  "singapore": "SG",
  "australia": "AU",
  "india": "IN",
  "china": "CN",
  "vietnam": "VN",
  "taiwan": "TW",
  "malaysia": "MY",
  "indonesia": "ID",
  "philippines": "PH",
  "mexico": "MX",
  "brazil": "BR",
  "argentina": "AR",
  "canada": "CA",
  "russia": "RU",
  "turkey": "TR",
  "egypt": "EG",
  "south-africa": "ZA",
  "netherlands": "NL",
  "switzerland": "CH",
  "austria": "AT",
  "belgium": "BE",
  "sweden": "SE",
  "norway": "NO",
  "denmark": "DK",
  "finland": "FI",
  "portugal": "PT",
  "greece": "GR",
  "poland": "PL",
  "ireland": "IE",
  "luxembourg": "LU",
  "israel": "IL",
  "qatar": "QA",
  "kuwait": "KW",
  "bahrain": "BH",
  "oman": "OM",
  "jordan": "JO",
  "lebanon": "LB",
  "pakistan": "PK",
  "bangladesh": "BD",
  "sri-lanka": "LK",
  "nepal": "NP",
  "cambodia": "KH",
  "myanmar": "MM",
  "laos": "LA",
  "brunei": "BN",
};

async function loadPlans(countrySlug: string): Promise<Plan[]> {
  const isRegion = regions.includes(countrySlug.toLowerCase());
  
  // Use countryId ISO code for countries (original way), regionId for regions
  // Need to map slug to ISO code first: germany -> DE
  const countryCode = slugToCodeMap[countrySlug] || countrySlug.toUpperCase();
  
  // Use absolute URL for client-side fetch - relative URLs don't work in useEffect
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = isRegion 
    ? `${baseUrl}/api/plans?regionId=${countrySlug.toLowerCase()}`
    : `${baseUrl}/api/plans?countryId=${countryCode}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    console.error('Failed to fetch plans:', res.status, res.statusText);
    return [];
  }
  const data = await res.json();
  return data.plans || [];
}

export default function EsimCountryPage({ params }: { params: Promise<{ country: string }> }) {
  const [country, setCountry] = useState<string>("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(async ({ country: c }) => {
      setCountry(c);
      const data = await loadPlans(c);
      setPlans(data);
      setLoading(false);
    });
  }, [params]);

  const displayName = country.charAt(0).toUpperCase() + country.slice(1);

  if (!loading && plans.length === 0) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">{displayName} eSIM Plans</h1>
        <p className="text-slate-600 mb-8">Choose from {plans.length} available plans</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Link 
              key={plan.id}
              href={`/esim/${country}/${plan.slug}`}
            >
              <PlanCard plan={plan as any} index={index} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}