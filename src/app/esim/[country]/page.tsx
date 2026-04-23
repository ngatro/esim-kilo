"use client";

import { useEffect, useState, useMemo, use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getDestinationImage } from "@/lib/unsplash";
import { useI18n } from "@/components/providers/I18nProvider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import EsimDataTypeModal from "./EsimDataTypeModal";
import WifiLoader from "@/components/animations/WifiLoader";
import FadeIn from "@/components/animations/FadeIn";
import PlansCard from "./PlansCard";
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
  supportTopUpType: number;
  topupPackageId?: number;
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
    setLoading(true); // Đảm bảo bật loading khi bắt đầu

    // Tạo một cái "hẹn giờ" 1.5 giây
    const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Chạy song song: vừa lấy ảnh, vừa lấy plans, vừa đợi 1.5s
      const [imageUrl, data] = await Promise.all([
        fetchUnsplashImage(c),
        loadPlans(c),
        minDelay // Cái này sẽ giữ chân setLoading(false) ít nhất 1.5s
      ]);

      setHeroImage(imageUrl);
      setPlans(data);
    } catch (error) {
      console.error("Lỗi load data:", error);
    } finally {
      // Sau khi data xong VÀ đã đợi đủ 1.5s thì mới tắt loading
      setLoading(false);
    }
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

  const displayName = country.charAt(0).toUpperCase() + country.slice(1);

  if (!loading && plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="scale-110"> {/* Phóng to nhẹ loader nếu muốn */}
          <WifiLoader text="" /> 
        </div>
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          Vui lòng đợi giây lát...
        </p>
      </div>
          );
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
        {/* Plans Grid - Show 2 simple cards: Fixed and Daily */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
          {displayPlans.map((group, index) => (
            <FadeIn key={group.key}> 
              <PlansCard 
                group={group} 
                onDetailClick={() => handleDataTypeClick(group.dataType, group.plans)} 
              />
            </FadeIn>
          ))}

          {displayPlans.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200">
              <WifiLoader />
              <p className="text-slate-400 mt-4 font-medium italic">
                Đang tìm kiếm gói cước tốt nhất cho bạn...
              </p>
            </div>
        )}
        </div>
      </div>
      {/* Modal - Legacy single plan modal */}
      {/* <PlanModal 
        plan={selectedPlan} 
        onClose={handleCloseModal} 
        isOpen={isModalOpen}
      /> */}

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
