"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
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

function formatData(gb: number): string {
  if (gb >= 999) return "Unlimited";
  if (gb < 1) return `${Math.round(gb * 1024)}MB`;
  return `${gb}GB`;
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

export default function PlanDetailContent() {
  const { t, formatPrice } = useI18n();
  const params = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  const heroImage = plan ? (imgError ? getDefaultImage(plan.packageCode) : getHeroImage(plan)) : "";

  useEffect(() => {
    async function fetchPlan() {
      try {
        const id = params.id as string;
        const res = await fetch(`/api/plans?id=${id}`);
        const data = await res.json();
        if (data.plans?.[0]) {
          setPlan(data.plans[0]);
        }
      } catch (error) {
        console.error("Failed to fetch plan:", error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchPlan();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-slate-600">Plan not found</p>
          <Link href="/plans" className="text-orange-500 hover:underline mt-2 inline-block">Back to plans</Link>
        </div>
      </div>
    );
  }

  const isUnlimited = !!plan.fupPolicy;
  const displayPrice = (plan.retailPriceUsd && plan.retailPriceUsd > 0) ? plan.retailPriceUsd : plan.priceUsd;
  const hasDiscount = plan.retailPriceUsd > 0 && plan.retailPriceUsd > plan.priceUsd;
  const pricePerDay = (displayPrice / plan.durationDays).toFixed(2);
  
  let networkList: LocationNetwork[] = [];
  let locations: string[] = [];
  try {
    if (plan.locationNetworkList) {
      networkList = Array.isArray(plan.locationNetworkList) ? plan.locationNetworkList as LocationNetwork[] : [];
    }
    if (plan.locations) {
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
            <span className="text-slate-800">{plan.destination}</span>
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
              alt={plan.destination}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
              unoptimized
              onError={() => setImgError(true)}
            />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {plan.badge === "unlimited" && (
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  ∞ Unlimited
                </span>
              )}
              {plan.isBestSeller && plan.badge !== "unlimited" && (
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  ⭐ Best Seller
                </span>
              )}
              {plan.isHot && (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  🔥 Hot
                </span>
              )}
              {plan.isPopular && !plan.isBestSeller && plan.badge !== "unlimited" && (
                <span className="bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Popular
                </span>
              )}
            </div>
          </div>

          {/* Right - Product Info */}
          <div className="flex flex-col">
            {/* Title */}
            <div className="mb-4">
              <h1 className="text-4xl font-bold text-slate-800 mb-2">{plan.destination} eSIM</h1>
              <div className="flex items-center gap-2 text-base">
                <span className="font-medium text-slate-600">Excellent</span>
                <span className="text-slate-700">4.8 out of 5</span>
                <span className="text-green-600">★ Trustpilot</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-5">
              <div className="flex items-baseline gap-3">
                {hasDiscount && (
                  <span className="text-xl text-slate-400 line-through">{formatPrice(plan.retailPriceUsd || plan.priceUsd)}</span>
                )}
                <span className="text-4xl font-bold text-slate-800">{formatPrice(displayPrice)}</span>
                <span className="text-slate-500">one-time</span>
              </div>
            </div>

            {/* Buy Button - Prominent */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-fit">
                <span className="text-sm text-slate-500">Qty:</span>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-orange-400 flex items-center justify-center text-slate-600">-</button>
                <span className="font-medium text-slate-800 min-w-[24px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-orange-400 flex items-center justify-center text-slate-600">+</button>
              </div>
              <Link href={`/checkout?planId=${plan.id}&qty=${quantity}`} className="flex-1">
                <motion.button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl text-lg transition-colors shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Buy Now - {formatPrice(displayPrice * quantity)}
                </motion.button>
              </Link>
            </div>

            {/* Quick Features */}
            <div className="mb-6 space-y-2">
              {[
                { icon: "✓", text: "Instant QR code delivery", color: "text-green-600" },
                { icon: "✓", text: "Secure checkout", color: "text-green-600" },
                { icon: "✓", text: "7-day refund policy", color: "text-green-600" },
                { icon: "✓", text: "Works on all eSIM devices", color: "text-green-600" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className={item.color}>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}

              {/* Coverage Preview */}
              {locations.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-2 pt-2 border-t border-slate-100">
                  <span>🌍</span>
                  <span>Coverage: {locations.slice(0, 3).join(", ")}{locations.length > 3 ? ` +${locations.length - 3} more` : ""}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plan Details Section */}
        <div className="mt-12 sm:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Plan Specifications */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Plan Specifications</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Data</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {plan.fupPolicy ? (
                        <>Unlimited <span className="text-green-600 text-sm">({plan.fupPolicy} after)</span></>
                      ) : (
                        formatData(plan.dataAmount)
                      )}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Validity</p>
                    <p className="text-lg font-semibold text-slate-800">{plan.durationDays} Days</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Network Speed</p>
                    <p className="text-lg font-semibold text-slate-800">{plan.speed || "4G LTE"}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Plan Type</p>
                    <p className="text-lg font-semibold text-slate-800">{plan.smsStatus === 0 ? "Data Only" : "Data + SMS"}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Tethering/Hotspot</p>
                    <p className="text-lg font-semibold text-slate-800">{plan.ipExport ? `Supported (${plan.ipExport})` : "Not supported"}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Activation</p>
                    <p className="text-lg font-semibold text-slate-800">{plan.activeType === 1 ? "On first installation" : "On first connection"}</p>
                  </div>
                  {plan.unusedValidTime > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-500 mb-1">Valid After Purchase</p>
                      <p className="text-lg font-semibold text-slate-800">{plan.unusedValidTime} days</p>
                    </div>
                  )}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Top-Up</p>
                    <p className="text-lg font-semibold text-slate-800">{plan.supportTopUp ? "Supported" : "Not supported"}</p>
                  </div>
                </div>
              </div>

              {/* Fair Use Policy */}
              {plan.fupPolicy && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-amber-700 mb-2">Fair Use Policy</h2>
                  <p className="text-amber-600 text-sm">After full speed data is depleted, speed will be reduced to <strong className="text-amber-800">{plan.fupPolicy}</strong></p>
                </div>
              )}

              {/* Coverage */}
              {locations.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Coverage ({locations.length} {locations.length === 1 ? "country" : "countries"})</h2>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((loc) => (
                      <span key={loc} className="bg-slate-100 text-slate-700 text-sm px-3 py-1.5 rounded-full font-medium">{loc}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Network Operators */}
              {networkList.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Network Operators</h2>
                  <div className="space-y-3">
                    {networkList.map((net) => (
                      <div key={net.locationCode} className="p-3 bg-slate-50 rounded-xl">
                        <p className="font-semibold text-slate-800 mb-2">{net.locationName}</p>
                        <div className="flex flex-wrap gap-2">
                          {net.operatorList?.map((op, i) => (
                            <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md font-medium">
                              {op.operatorName} ({op.networkType})
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What's Included */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">What&apos;s Included</h2>
                <ul className="space-y-3">
                  {[
                    plan.fupPolicy 
                      ? `Unlimited Data (high speed, then ${plan.fupPolicy})` 
                      : `${plan.dataAmount}GB Data`,
                    `${plan.durationDays} Days Validity`,
                    plan.speed || "4G LTE Network",
                    "Instant QR Code Delivery via Email",
                    plan.supportTopUp ? "Supports Data Top-Up" : null,
                    plan.ipExport ? `Tethering/Hotspot: ${plan.ipExport}` : null,
                    plan.unusedValidTime > 0 ? `Valid for ${plan.unusedValidTime} days after purchase` : null,
                    plan.smsStatus > 0 ? "SMS Included" : "SMS not included",
                  ].filter(Boolean).map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar - Sticky Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                  <h3 className="font-bold text-slate-800 mb-3">Why Choose Us?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">⚡</span>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">Instant Activation</p>
                        <p className="text-xs text-slate-500">QR code delivered in minutes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">💰</span>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">Best Price Guarantee</p>
                        <p className="text-xs text-slate-500">Up to 80% cheaper than roaming</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🔒</span>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">Secure Payment</p>
                        <p className="text-xs text-slate-500">SSL encrypted checkout</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">📱</span>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">190+ Countries</p>
                        <p className="text-xs text-slate-500">Global coverage</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h3 className="font-bold text-slate-800 mb-3">Need Help?</h3>
                  <p className="text-sm text-slate-500 mb-3">Contact our support team for assistance</p>
                  <a href="mailto:support@openworldesim.com" className="block text-center bg-white border border-slate-200 hover:border-orange-400 text-slate-700 font-medium py-2.5 rounded-xl text-sm transition-colors">
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-10 sm:mt-14">
          <Link href="/plans" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all plans
          </Link>
        </div>
      </div>
    </div>
  );
}