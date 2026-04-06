import { motion } from "framer-motion";
import Image from "next/image";
import { useI18n } from "@/components/providers/I18nProvider";
import { getCountryImagePath, getRegionImagePath, DEFAULT_IMAGE_PATH } from "@/lib/countryImages";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

function getPlanImage(plan: Plan): string {
  if (plan.coverageCount >= 2 && plan.regionId) {
    return getRegionImagePath(plan.regionId);
  }

  if (plan.countryId) {
    return getCountryImagePath(plan.countryId) || DEFAULT_IMAGE_PATH;
  }

  return DEFAULT_IMAGE_PATH;
}

function formatVolume(bytes: number): string {
  if (bytes === 0) return "0";
  const k = 1024;
  const dm = 1;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}

export function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const { formatPrice } = useI18n();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const isUnlimited = plan.badge === "unlimited";
  const displayPrice = (plan.retailPriceUsd && plan.retailPriceUsd > 0) ? plan.retailPriceUsd : plan.priceUsd;
  const pricePerDay = formatPrice(displayPrice / plan.durationDays);
  const locations = Array.isArray(plan.locations) ? plan.locations : [];
  const heroImage = imgError ? DEFAULT_IMAGE_PATH : getPlanImage(plan);
  const planUrl = `/plans/${plan.slug || plan.id}`;

  const handleClick = () => {
    router.push(planUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={handleClick}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full cursor-pointer"
    >
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <Image
          src={heroImage}
          alt={plan.destination}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
          priority={index < 4}
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
          {isUnlimited && (
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              ∞ Unlimited
            </span>
          )}
          {plan.isBestSeller && !isUnlimited && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              ⭐ Best Seller
            </span>
          )}
          {plan.isHot && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              🔥 Hot
            </span>
          )}
          {plan.isPopular && !plan.isBestSeller && !plan.isHot && (
            <span className="bg-cyan-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              Popular
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg sm:text-xl drop-shadow-lg">{plan.destination}</h3>
          <p className="text-white/80 text-xs">{plan.coverageCount > 1 ? `${plan.coverageCount} countries` : plan.countryName || plan.destination}</p>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-orange-50 rounded-xl p-2.5 text-center">
            <p className="text-lg sm:text-xl font-bold text-orange-600">{isUnlimited ? "∞" : formatVolume(plan.dataVolume)}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider">{isUnlimited ? "Unlimited" : "Data"}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 text-center">
            <p className="text-lg sm:text-xl font-bold text-slate-700">{plan.durationDays}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider">Days</p>
          </div>
          <div className="bg-cyan-50 rounded-xl p-2.5 text-center">
            <p className="text-lg sm:text-xl font-bold text-cyan-600">{pricePerDay}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider">/Day</p>
          </div>
        </div>

        <div className="space-y-1.5 mb-4 flex-1">
          {plan.supportTopUp && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Supports Top-Up
            </div>
          )}
          {plan.ipExport && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              IP: {plan.ipExport}
            </div>
          )}
          {plan.speed && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
              {plan.speed}
            </div>
          )}
          {locations.length > 1 && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              {locations.slice(0, 3).join(", ")}{locations.length > 3 ? ` +${locations.length - 3}` : ""}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 line-through">{plan.retailPriceUsd > plan.priceUsd ? formatPrice(plan.retailPriceUsd) : ""}</p>
            <p className="text-2xl font-bold text-slate-800">{formatPrice(displayPrice)}</p>
          </div>
          <span className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm">
            Buy Now
          </span>
        </div>
      </div>
    </motion.div>
  );
}