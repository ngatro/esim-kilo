"use client";

import { useEffect, useState, useMemo, use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getDestinationImage } from "@/lib/unsplash";
import { useI18n } from "@/components/providers/I18nProvider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import EsimDataTypeModal from "./EsimDataTypeModal";

interface OperatorInfo {
  operatorName: string;
  networkType: string;
}

interface LocationNetwork {
  locationCode: string;
  locationLogo: string;
  locationName: string;
  operatorList: OperatorInfo[];
}

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
  locationNetworkList: unknown;
  fupPolicy: string | null;
  smsStatus: number;
  activeType: number;
}

// Grouped plan for display
interface GroupedPlan {
  key: string;
  destination: string;
  fupPolicy: string | null;
  plans: Plan[];
  minPrice: number;
  maxPrice: number;
  dataType: number;
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

function formatData(gb: number, volume?: number): string {
  const dataValue = gb > 0 ? gb : (volume ? Math.round((volume / (1024 * 1024 * 1024)) * 10) / 10 : 0);
  if (dataValue >= 999) return "Unlimited";
  if (dataValue < 1 && dataValue > 0) return `${Math.round(dataValue * 1024)}MB`;
  if (dataValue === 0) return "N/A";
  return `${dataValue}GB`;
}

function getDataTypeLabel(type: number): string {
  switch (type) {
    case 1: return "Fixed Data";
    case 2: return "Daily Limit (Speed Reduced)";
    case 3: return "Daily Limit (Service Cut-off)";
    case 4: return "Daily Unlimited";
    default: return "Data Plan";
  }
}

// Modal Component
function PlanModal({ 
  plan, 
  onClose, 
  isOpen 
}: { 
  plan: Plan | null; 
  onClose: () => void;
  isOpen: boolean;
}) {
  const { t, formatPrice } = useI18n();
  const [selectedData, setSelectedData] = useState<number>(0);
  const [selectedDuration, setSelectedDuration] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'info' | 'coverage' | 'policy'>('info');

  // Parse locations and networks
  let locations: string[] = [];
  let networkList: LocationNetwork[] = [];
  try {
    if (plan?.locationNetworkList) {
      const networkData = typeof plan.locationNetworkList === 'string' 
        ? JSON.parse(plan.locationNetworkList) 
        : plan.locationNetworkList;
      networkList = Array.isArray(networkData) ? networkData as LocationNetwork[] : [];
    }
    if (plan?.locations) {
      locations = Array.isArray(plan.locations) ? plan.locations as string[] : JSON.parse(plan.locations as string);
    }
  } catch {
    networkList = [];
    locations = [];
  }

  // Get unique data options
  const dataOptions = useMemo(() => {
    // In real app, this would come from API as variants
    // For now, we'll use the plan data itself
    return [plan?.dataAmount || 1].filter(Boolean);
  }, [plan]);

  // Get unique duration options
  const durationOptions = useMemo(() => {
    return [plan?.durationDays || 30].filter(Boolean);
  }, [plan]);

  // Calculate price based on selection
  const currentPrice = useMemo(() => {
    if (!plan) return 0;
    return plan.retailPriceUsd > 0 ? plan.retailPriceUsd : plan.priceUsd;
  }, [plan, selectedData, selectedDuration]);

  // Initialize selections
  useEffect(() => {
    if (plan) {
      setSelectedData(plan.dataAmount || 1);
      setSelectedDuration(plan.durationDays || 30);
    }
  }, [plan]);

  if (!plan) return null;

  const isUnlimited = plan.badge === "unlimited";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto">
              {/* Left Side - Banner & Info */}
              <div className="lg:w-1/2 bg-gradient-to-br from-slate-100 to-slate-50 p-6 lg:p-8">
                {/* Banner Image */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-lg">
                  <Image
                    src={getDestinationImage(plan.countryId?.toLowerCase() || plan.destination.toLowerCase())}
                    alt={plan.destination}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      eSIM
                    </span>
                  </div>
                </div>

                {/* Product Name */}
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
                  {plan.destination}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <span className="text-sm text-slate-500">4.9 (128 reviews)</span>
                </div>

                {/* Short Description */}
                <p className="text-slate-600 mb-6">
                  Get connected with {plan.dataAmount}GB data for {plan.durationDays} days in {plan.destination}. Instant delivery via email.
                </p>

                {/* Data & Duration Selection */}
                <div className="space-y-4">
                  {/* Data Amount */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      {t("plans.data") || "Data"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {dataOptions.map((data) => (
                        <button
                          key={data}
                          onClick={() => setSelectedData(data)}
                          className={`px-4 py-2.5 rounded-full font-medium text-sm transition-all ${
                            selectedData === data
                              ? "bg-orange-500 text-white border-2 border-orange-500"
                              : "bg-white text-slate-600 border-2 border-slate-200 hover:border-orange-300"
                          }`}
                        >
                          {formatData(data, plan.dataVolume)}
                        </button>
                      ))}
                      {/* Add more options */}
                      {[3, 5, 10, 20].map((data) => (
                        <button
                          key={data}
                          onClick={() => setSelectedData(data)}
                          className={`px-4 py-2.5 rounded-full font-medium text-sm transition-all ${
                            selectedData === data
                              ? "bg-orange-500 text-white border-2 border-orange-500"
                              : "bg-white text-slate-600 border-2 border-slate-200 hover:border-orange-300"
                          }`}
                        >
                          {data}GB
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Duration
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {durationOptions.map((duration) => (
                        <button
                          key={duration}
                          onClick={() => setSelectedDuration(duration)}
                          className={`px-4 py-2.5 rounded-full font-medium text-sm transition-all ${
                            selectedDuration === duration
                              ? "bg-orange-500 text-white border-2 border-orange-500"
                              : "bg-white text-slate-600 border-2 border-slate-200 hover:border-orange-300"
                          }`}
                        >
                          {duration} days
                        </button>
                      ))}
                      {/* Add more options */}
                      {[3, 5, 7, 10, 15, 30].map((duration) => (
                        <button
                          key={duration}
                          onClick={() => setSelectedDuration(duration)}
                          className={`px-4 py-2.5 rounded-full font-medium text-sm transition-all ${
                            selectedDuration === duration
                              ? "bg-orange-500 text-white border-2 border-orange-500"
                              : "bg-white text-slate-600 border-2 border-slate-200 hover:border-orange-300"
                          }`}
                        >
                          {duration} days
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Summary Box */}
              <div className="lg:w-1/2 p-6 lg:p-8 bg-white">
                <div className="bg-slate-50 rounded-2xl p-6">
                  {/* Quantity */}
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      {t("common.quantity") || "Quantity"}
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center hover:border-orange-300 transition-colors text-slate-600 font-bold"
                      >
                        -
                      </button>
                      <span className="w-16 text-center font-bold text-xl">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center hover:border-orange-300 transition-colors text-slate-600 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-orange-500">
                        {formatPrice(currentPrice * quantity)}
                      </span>
                      <span className="text-slate-500">{t("planDetail.oneTime") || "one-time"}</span>
                    </div>
                    {plan.durationDays > 1 && (
                      <p className="text-sm text-slate-400">
                        ({(currentPrice / plan.durationDays).toFixed(2)}/day)
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-full text-lg transition-colors flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {t("plans.addToCart") || "Add to Cart"}
                    </button>
                    <Link
                      href={`/checkout?planId=${plan.id}&qty=${quantity}`}
                      className="block w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-4 rounded-full text-lg text-center transition-colors"
                    >
                      {t("plans.buyNow") || "Buy Now"}
                    </Link>
                  </div>
                </div>

                {/* Tabs - Product Info */}
                <div className="mt-6">
                  <div className="flex border-b border-slate-200 mb-4">
                    <button
                      onClick={() => setActiveTab('info')}
                      className={`px-4 py-2 font-medium text-sm transition-colors ${
                        activeTab === 'info' 
                          ? "text-orange-500 border-b-2 border-orange-500" 
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Info
                    </button>
                    <button
                      onClick={() => setActiveTab('coverage')}
                      className={`px-4 py-2 font-medium text-sm transition-colors ${
                        activeTab === 'coverage' 
                          ? "text-orange-500 border-b-2 border-orange-500" 
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Coverage ({locations.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('policy')}
                      className={`px-4 py-2 font-medium text-sm transition-colors ${
                        activeTab === 'policy' 
                          ? "text-orange-500 border-b-2 border-orange-500" 
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Policy
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[200px]">
                    {activeTab === 'info' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-500">{t("plans.networkSpeed")}</p>
                          <p className="font-semibold text-slate-800">{plan.speed || "4G LTE"}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-500">Network</p>
                          <p className="font-semibold text-slate-800">{plan.networkType || "4G/5G"}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-500">Plan Type</p>
                          <p className="font-semibold text-slate-800">{plan.smsStatus === 0 ? "Data Only" : "Data + SMS"}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-500">{t("plans.topUp")}</p>
                          <p className="font-semibold text-slate-800">{plan.supportTopUp ? "Supported" : "Not Supported"}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-500">Tethering</p>
                          <p className="font-semibold text-slate-800">{plan.ipExport ? "Supported" : "Not Supported"}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-500">{t("plans.activation")}</p>
                          <p className="font-semibold text-slate-800">{plan.activeType === 1 ? "On Install" : "On First Connection"}</p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'coverage' && (
                      <div className="flex flex-wrap gap-2">
                        {locations.length > 0 ? (
                          locations.map((loc, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 text-sm px-3 py-1.5 rounded-full font-medium">
                              {loc}
                            </span>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">Single country coverage</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'policy' && (
                      <div className="space-y-3 text-sm text-slate-600">
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="font-semibold text-slate-700 mb-1">Fair Use Policy</p>
                          <p className="text-slate-500">{plan.fupPolicy || "Standard fair use policy applies. Data speeds may reduce after limit."}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="font-semibold text-slate-700 mb-1">Refund Policy</p>
                          <p className="text-slate-500">Full refund within 30 days if eSIM not activated. After activation, no refund available.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Plan Card Component (for the grid)
function PlanCard({ plan, index, onClick, groupInfo }: { plan: Plan; index: number; onClick: () => void; groupInfo?: { count: number; minPrice: number; maxPrice: number } }) {
  const { formatPrice, t } = useI18n();
  const [imgError, setImgError] = useState(false);
  const isUnlimited = plan.badge === "unlimited";
  const displayPrice = groupInfo ? groupInfo.minPrice : (plan.retailPriceUsd > 0 ? plan.retailPriceUsd : plan.priceUsd);

  const heroImage = imgError 
    ? "/favicon.ico" 
    : getDestinationImage(plan.countryId?.toLowerCase() || plan.destination.toLowerCase());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      onClick={onClick}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full cursor-pointer"
    >
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <Image
          src={heroImage}
          alt={plan.destination}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
          priority={index < 3}
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
          {isUnlimited && (
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              ∞ {t("plans.unlimited")}
            </span>
          )}
          {plan.isBestSeller && !isUnlimited && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              ⭐ {t("plans.bestSeller")}
            </span>
          )}
          {plan.isHot && !plan.isBestSeller && !isUnlimited && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              🔥 {t("plans.hot")}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">
          {plan.destination} {plan.dataType === 2 ? "(Daily)" : (plan.dataType > 2 ? "(Unlimited)" : "")}
        </h3>
        <p className="text-sm text-slate-500 mb-3">
          {groupInfo 
            ? `${groupInfo.count} options from ${formatPrice(groupInfo.minPrice)}${groupInfo.maxPrice > groupInfo.minPrice ? ` - ${formatPrice(groupInfo.maxPrice)}` : ""}`
            : (plan.dataType === 1 ? "Fixed" : (plan.dataType === 2 ? "Daily" : "Unlimited"))
          }
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-orange-500">
              {formatPrice(displayPrice)}
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {(displayPrice / plan.durationDays).toFixed(2)}/day
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function EsimCountryPage({ params }: { params: Promise<{ country: string }> }) {
  const resolvedParams = use(params);
  const { t, formatPrice } = useI18n();
  const [country, setCountry] = useState<string>("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string>(getDestinationImage("global"));
  
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
  const [selectedData, setSelectedData] = useState<string>("all");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // New DataType Modal state
  const [isDataTypeModalOpen, setIsDataTypeModalOpen] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState<number>(0);
  const [plansForDataType, setPlansForDataType] = useState<Plan[]>([]);

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

  // Handle plan click - open modal
  const handlePlanClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  // Handle dataType group click - open new modal with all plans for that dataType
  const handleDataTypeClick = (dataType: number, groupPlans: Plan[]) => {
    setSelectedDataType(dataType);
    setPlansForDataType(groupPlans);
    setIsDataTypeModalOpen(true);
  };

  const handleCloseDataTypeModal = () => {
    setIsDataTypeModalOpen(false);
    setSelectedDataType(0);
    setPlansForDataType([]);
  };

  // Filter to only Fixed and Daily plans, then group by dataType only (for single country page)
  const displayPlans = useMemo(() => {
    // First filter only dataType 1 (Fixed) and 2 (Daily)
    const relevantPlans = filteredPlans.filter(p => p.dataType === 1 || p.dataType === 2);
    const groups: Record<string, GroupedPlan> = {};
    relevantPlans.forEach(plan => {
      // Group by dataType only: "fixed" or "daily"
      const dataTypeKey = plan.dataType === 1 ? "fixed" : "daily";
      const key = dataTypeKey; // Single key per dataType
      if (!groups[key]) {
        groups[key] = {
          key,
          destination: country.charAt(0).toUpperCase() + country.slice(1), // Use URL country param
          fupPolicy: plan.fupPolicy,
          plans: [],
          minPrice: plan.retailPriceUsd || plan.priceUsd,
          maxPrice: plan.retailPriceUsd || plan.priceUsd,
          dataType: plan.dataType,
        };
      }
      groups[key].plans.push(plan);
      const price = plan.retailPriceUsd || plan.priceUsd;
      if (price < groups[key].minPrice) groups[key].minPrice = price;
      if (price > groups[key].maxPrice) groups[key].maxPrice = price;
    });
    // Return sorted: Fixed first (dataType=1), then Daily (dataType=2)
    return Object.values(groups).sort((a, b) => {
      if (a.dataType === 1 && b.dataType !== 1) return -1;
      if (b.dataType === 1 && a.dataType !== 1) return 1;
      return a.minPrice - b.minPrice;
    });
  }, [filteredPlans, country]);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Hero with Dynamic Unsplash Image */}
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
            {plans.length} {t("countryPage.esimPlansAvailable")}
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        {/* Mobile Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 md:hidden">
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedDuration("all")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedDuration === "all" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t("countryPage.all")}
                </button>
                {durationOptions.map(duration => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration.toString())}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedDuration === duration.toString() ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {duration} {t("countryPage.days")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedData("all")}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedData === "all" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t("countryPage.all")}
                </button>
                {dataOptions.map(data => (
                  <button
                    key={data}
                    onClick={() => setSelectedData(data.toString())}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedData === data.toString() ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {data}GB
                  </button>
                ))}
              </div>
            </div>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} className="text-orange-500 text-sm font-medium hover:text-orange-600">
                ✕ {t("countryPage.clearFilters")}
              </button>
            )}
          </div>
        </div>

        {/* Desktop Filter Bar */}
        <div className="hidden md:flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-2 bg-white rounded-full shadow-lg border border-slate-200 px-4 py-2">
            <span className="text-sm text-slate-500 font-medium">📅</span>
            <select
              value={selectedDuration}
              onChange={e => setSelectedDuration(e.target.value)}
              className="bg-transparent border-0 text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer min-w-[100px]"
            >
              <option value="all">{t("countryPage.all")}</option>
              {durationOptions.map(d => (
                <option key={d} value={d.toString()}>{d} {t("countryPage.days")}</option>
              ))}
            </select>
            <div className="w-px h-5 bg-slate-300" />
            <span className="text-sm text-slate-500 font-medium">💾</span>
            <select
              value={selectedData}
              onChange={e => setSelectedData(e.target.value)}
              className="bg-transparent border-0 text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer min-w-[100px]"
            >
              <option value="all">{t("countryPage.all")}</option>
              {dataOptions.map(d => (
                <option key={d} value={d.toString()}>{d}GB</option>
              ))}
            </select>
            {hasActiveFilters && (
              <>
                <div className="w-px h-5 bg-slate-300" />
                <button
                  onClick={handleClearFilters}
                  className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                >
                  ✕ {t("countryPage.clearFilters")}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Plans Grid - Show 2 simple cards: Fixed and Daily */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
          {displayPlans.map((group, index) => (
            <div 
              key={group.key}
              onClick={() => handleDataTypeClick(group.dataType, group.plans)}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl cursor-pointer text-center"
            >
              <h3 className="font-bold text-2xl text-slate-800 mb-2">
                {group.destination}
              </h3>
              <p className="text-orange-500 font-semibold text-lg">
                {group.dataType === 1 ? "Fixed" : "Daily"}
              </p>
              <p className="text-slate-500 mt-2">
                {group.plans.length} plans from {formatPrice(group.minPrice)}
              </p>
            </div>
          ))}
          {displayPlans.length === 0 && (
            <div className="col-span-2 text-center py-16">
              <p className="text-slate-500 text-lg">No Fixed or Daily plans available</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Legacy single plan modal */}
      <PlanModal 
        plan={selectedPlan} 
        onClose={handleCloseModal} 
        isOpen={isModalOpen}
      />

      {/* New DataType Selection Modal */}
      <EsimDataTypeModal
        plans={plansForDataType}
        dataType={selectedDataType}
        countryName={country}
        countryCode={country}
        isOpen={isDataTypeModalOpen}
        onClose={handleCloseDataTypeModal}
      />
    </div>
  );
}
