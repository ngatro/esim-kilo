"use client";

import { useEffect, useState, useMemo, use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PlanCard } from "@/app/plans/PlanCard";
import { getDestinationImage } from "@/lib/unsplash";

interface Plan {
  id: string;
  name: string;
  slug: string | null;
  packageCode: string;
  destination: string;
  dataAmount: number;
  dataVolume: number;
  durationDays: number;
  priceUsd: number;
  retailPriceUsd: number;
  speed: string | null;
  networkType: string | null;
  dataType: number;
  coverageCount: number;
  countryId: string | null;
  countryName: string | null;
  regionId: string | null;
  regionName: string | null;
  locations: unknown;
  ipExport: string | null;
  supportTopUp: boolean;
  unusedValidTime: number;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
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
  const countryCode = slugToCodeMap[countrySlug] || countrySlug.toUpperCase();
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

// Fetch dynamic image from Unsplash API
async function fetchUnsplashImage(countryName: string): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/unsplash?q=${encodeURIComponent(countryName)}`);
    if (res.ok) {
      const data = await res.json();
      return data.url;
    }
  } catch (error) {
    console.error("Failed to fetch Unsplash image:", error);
  }
  return getDestinationImage(countryName.toLowerCase().replace(/\s+/g, '-'));
}

export default function EsimCountryPage({ params }: { params: Promise<{ country: string }> }) {
  const resolvedParams = use(params);
  const [country, setCountry] = useState<string>("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string>(getDestinationImage("global"));
  
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
  const [selectedData, setSelectedData] = useState<string>("all");

  useEffect(() => {
    async function load() {
      const c = resolvedParams.country;
      setCountry(c);
      
      // Fetch dynamic hero image from Unsplash
      const imageUrl = await fetchUnsplashImage(c);
      setHeroImage(imageUrl);
      
      const data = await loadPlans(c);
      setPlans(data);
      setLoading(false);
    }
    load();
  }, [resolvedParams]);

  // Duration options
  const durationOptions = useMemo(() => {
    const plansToConsider = selectedData !== "all" 
      ? plans.filter(p => p.dataAmount === parseInt(selectedData))
      : plans;
    
    const durations = new Set<number>();
    plansToConsider.forEach(plan => {
      if (plan.durationDays) durations.add(plan.durationDays);
    });
    return Array.from(durations).sort((a, b) => a - b);
  }, [plans, selectedData]);

  // Data options
  const dataOptions = useMemo(() => {
    const plansToConsider = selectedDuration !== "all"
      ? plans.filter(p => p.durationDays === parseInt(selectedDuration))
      : plans;
    
    const dataAmounts = new Set<number>();
    plansToConsider.forEach(plan => {
      if (plan.dataAmount) dataAmounts.add(plan.dataAmount);
    });
    return Array.from(dataAmounts).sort((a, b) => a - b);
  }, [plans, selectedDuration]);

  // Combined filter
  const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      if (selectedDuration !== "all" && plan.durationDays !== parseInt(selectedDuration)) return false;
      if (selectedData !== "all" && plan.dataAmount !== parseInt(selectedData)) return true;
      return true;
    });
  }, [plans, selectedDuration, selectedData]);

  const displayName = country.charAt(0).toUpperCase() + country.slice(1);

  if (!loading && plans.length === 0) {
    return notFound();
  }

  const handleClearFilters = () => {
    setSelectedDuration("all");
    setSelectedData("all");
  };

  const hasActiveFilters = selectedDuration !== "all" || selectedData !== "all";

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Hero 60vh with Dynamic Unsplash Image */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <Image
          src={heroImage}
          alt={displayName}
          fill
          className="object-cover scale-105"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#F8F9FA]" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 text-center drop-shadow-lg">
            {displayName}
          </h1>
          <p className="text-white/90 text-lg text-center drop-shadow">
            {plans.length} eSIM plans available
          </p>
        </div>
      </div>

      {/* Filter Section with Layering -mt-10 */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        {/* Button Chips Filter */}
        <div className="bg-white rounded-[2rem] shadow-2xl p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Duration Chips */}
            <div>
              <p className="text-sm font-medium text-slate-600 mb-3">📅 Số ngày:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedDuration("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedDuration === "all"
                      ? "bg-orange-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Tất cả
                </button>
                {durationOptions.map(duration => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration.toString())}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedDuration === duration.toString()
                        ? "bg-orange-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {duration} ngày
                  </button>
                ))}
              </div>
            </div>
            
            {/* Data Amount Chips */}
            <div>
              <p className="text-sm font-medium text-slate-600 mb-3">💾 Dung lượng:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedData("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedData === "all"
                      ? "bg-orange-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Tất cả
                </button>
                {dataOptions.map(data => (
                  <button
                    key={data}
                    onClick={() => setSelectedData(data.toString())}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedData === data.toString()
                        ? "bg-orange-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {data}GB
                  </button>
                ))}
              </div>
            </div>
            
            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
              >
                ✕ Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
          {filteredPlans.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>
        
        {filteredPlans.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">Không tìm thấy kế hoạch phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}