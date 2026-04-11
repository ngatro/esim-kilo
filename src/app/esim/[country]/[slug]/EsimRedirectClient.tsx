"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/components/providers/I18nProvider";
import { getCountryImageUrl, getRegionImageUrl, getDefaultImage } from "@/lib/countryImages";

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
  description: string | null;
  destination: string;
  dataType: number;
  dataVolume: number;
  dataAmount: number;
  durationDays: number;
  durationUnit: string;
  priceUsd: number;
  retailPriceUsd: number;
  currencyCode: string;
  speed: string | null;
  networkType: string | null;
  locationCode: string | null;
  locationLogo: string | null;
  locations: unknown;
  coverageCount: number;
  smsStatus: number;
  activeType: number;
  supportTopUp: boolean;
  unusedValidTime: number;
  ipExport: string | null;
  fupPolicy: string | null;
  countryId: string | null;
  countryName: string | null;
  regionId: string | null;
  regionName: string | null;
  isActive: boolean;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
  locationNetworkList: unknown;
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

function getHeroImage(plan: Plan): string {
  if (plan.coverageCount >= 2 && plan.regionId) {
    return getRegionImageUrl(plan.regionId);
  }
  if (plan.countryId) {
    return getCountryImageUrl(plan.countryId) || getDefaultImage(plan.packageCode);
  }
  return getDefaultImage(plan.packageCode);
}

export default function EsimRedirectClient({ plan, country, slug }: { plan: any; country: string; slug: string }) {
  const { t, formatPrice } = useI18n();
  const [imgError, setImgError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const heroImage = plan ? (imgError ? getDefaultImage(plan.packageCode) : getHeroImage(plan)) : "";

  const isUnlimited = !!plan?.fupPolicy;
  const displayPrice = (plan?.retailPriceUsd && plan?.retailPriceUsd > 0) ? plan.retailPriceUsd : plan?.priceUsd;
  const hasDiscount = plan?.retailPriceUsd > 0 && plan?.retailPriceUsd > plan?.priceUsd;
  const pricePerDay = displayPrice && plan?.durationDays ? (displayPrice / plan.durationDays).toFixed(2) : "0";
  
  let networkList: LocationNetwork[] = [];
  let locations: string[] = [];
  try {
    if (plan?.locationNetworkList) {
      networkList = Array.isArray(plan.locationNetworkList) ? plan.locationNetworkList as LocationNetwork[] : [];
    }
    if (plan?.locations) {
      locations = Array.isArray(plan.locations) ? plan.locations as string[] : JSON.parse(plan.locations as string);
    }
  } catch {
    networkList = [];
    locations = [];
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <span>/</span>
            <Link href="/plans" className="hover:text-orange-500">Plans</Link>
            <span>/</span>
            <span className="text-slate-800">{plan?.destination}</span>
          </div>
        </div>
      </div>

      {/* Split Hero Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left - Image */}
          <div className="relative aspect-[1/1] lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={heroImage}
              alt={plan?.destination || 'eSIM'}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
              unoptimized
              onError={() => setImgError(true)}
            />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {plan?.badge === "unlimited" && (
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  ∞ Unlimited
                </span>
              )}
              {plan?.isBestSeller && plan?.badge !== "unlimited" && (
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  ⭐ Best Seller
                </span>
              )}
              {plan?.isHot && !plan?.isBestSeller && !plan?.badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  🔥 HOT
                </span>
              )}
              {plan?.isPopular && !plan?.isHot && !plan?.isBestSeller && !plan?.badge && (
                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  popular
                </span>
              )}
            </div>
          </div>

          {/* Right - Plan Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
              {plan?.destination}
            </h1>
            
            {/* Data & Duration */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-lg font-medium text-slate-600">
                {formatData(plan?.dataAmount || 0, plan?.dataVolume)} • {plan?.durationDays} {plan?.durationUnit || 'Days'}
              </span>
              {plan?.dataType && (
                <span className="text-sm text-slate-500">
                  ({getDataTypeLabel(plan.dataType)})
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-orange-500">
                ${displayPrice}
              </span>
              {hasDiscount && (
                <span className="text-lg text-slate-400 line-through">
                  ${plan?.retailPriceUsd}
                </span>
              )}
              <span className="text-slate-500">one-time</span>
              {plan?.durationDays > 1 && (
                <span className="text-sm text-slate-400">
                  (${pricePerDay}/day)
                </span>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-slate-600">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Instant eSIM delivery via email
              </li>
              <li className="flex items-center gap-3 text-slate-600">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                QR code + manual installation guide
              </li>
              <li className="flex items-center gap-3 text-slate-600">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Works in {plan?.countryName || country}
              </li>
              <li className="flex items-center gap-3 text-slate-600">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {plan?.unusedValidTime || 180} days validity
              </li>
              {plan?.supportTopUp && (
                <li className="flex items-center gap-3 text-slate-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Top-up supported
                </li>
              )}
              {plan?.ipExport && (
                <li className="flex items-center gap-3 text-slate-600">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  IP Export: {plan.ipExport}
                </li>
              )}
            </ul>

            {/* Quantity & Buy Button */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium text-slate-600">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <Link
                href={`/checkout?planId=${plan?.id}&qty=${quantity}`}
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl text-lg text-center transition-colors"
              >
                Buy Now - ${(displayPrice * quantity).toFixed(2)}
              </Link>
              
              <p className="text-center text-sm text-slate-500 mt-4">
                Secure payment • Instant delivery • 24/7 support
              </p>
            </div>

            {/* Network Info */}
            {networkList.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-slate-700 mb-2">Networks</p>
                <div className="flex flex-wrap gap-2">
                  {networkList.map((loc: LocationNetwork, i: number) => (
                    <div key={i} className="bg-slate-100 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">{loc.locationName}</p>
                      <div className="flex flex-wrap gap-1">
                        {loc.operatorList?.map((op, j) => (
                          <span key={j} className="bg-white text-slate-600 text-xs px-2 py-1 rounded">
                            {op.operatorName} {op.networkType}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speed Info */}
            {plan?.speed && (
              <div className="mt-4 text-sm text-slate-500">
                <strong>Speed:</strong> {plan.speed}
                {plan?.fupPolicy && <span className="text-orange-500"> ({plan.fupPolicy} after limit)</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}