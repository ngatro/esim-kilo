"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useI18n } from "@/components/providers/I18nProvider";

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
  dataAmount: number;
  dataVolume: number;
  durationDays: number;
  durationUnit: string;
  priceRaw: number;
  priceUsd: number;
  retailPriceRaw: number;
  retailPriceUsd: number;
  currencyCode: string;
  speed: string | null;
  networkType: string | null;
  dataType: number;
  regionName: string | null;
  countryId: string | null;
  countryName: string | null;
  coverageCount: number;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
  locationCode: string | null;
  locations: unknown;
  ipExport: string | null;
  supportTopUp: boolean;
  unusedValidTime: number;
  smsStatus: number;
  activeType: number;
  fupPolicy: string | null;
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

const HERO_IMAGES: Record<string, string> = {
  JP: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80",
  KR: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1200&q=80",
  TH: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&q=80",
  VN: "https://images.unsplash.com/photo-1559302504-64aae6f6e6d6?w=1200&q=80",
  SG: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80",
  MY: "https://images.unsplash.com/photo-1512553232225-a498-2a0b6008d120?w=1200&q=80",
  ID: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&q=80",
  PH: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&q=80",
  IN: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80",
  CN: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&q=80",
  TW: "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=1200&q=80",
  HK: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1200&q=80",
  US: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80",
  CA: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1200&q=80",
  MX: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&q=80",
  BR: "https://images.unsplash.com/photo-1483729558449-99ef09a8e325?w=1200&q=80",
  GB: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80",
  FR: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80",
  DE: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80",
  IT: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&q=80",
  ES: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80",
  NL: "https://images.unsplash.com/photo-1512470876317-1f3c7c5ad1e9?w=1200&q=80",
  CH: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&q=80",
  AT: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200&q=80",
  SE: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
  NO: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80",
  AU: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200&q=80",
  NZ: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1200&q=80",
  AE: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",
  TR: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
  default: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80",
};

function getHeroImage(countryId: string | null): string {
  if (!countryId) return HERO_IMAGES.default;
  return HERO_IMAGES[countryId.toUpperCase()] || HERO_IMAGES.default;
}

export default function PlanDetailContent() {
  const { t, formatPrice } = useI18n();
  const params = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

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

  const isUnlimited = plan.dataAmount >= 999;
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
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={getHeroImage(plan.countryId)}
              alt={plan.destination}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {plan.isBestSeller && (
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  ⭐ Best Seller
                </span>
              )}
              {plan.isHot && (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  🔥 Hot
                </span>
              )}
              {plan.isPopular && !plan.isBestSeller && (
                <span className="bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Popular
                </span>
              )}
            </div>
          </div>

          {/* Right - Product Info */}
          <div className="flex flex-col">
            {/* Breadcrumb (match reference layout) */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Link href="/" className="hover:text-orange-500">Home</Link>
                <span>/</span>
                <Link href="/plans" className="hover:text-orange-500">Local eSIMs</Link>
                <span>/</span>
                <span className="text-slate-800">{plan.destination} eSIM</span>
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <h1 className="text-4xl font-bold text-slate-800 mb-3">{plan.destination} eSIM</h1>
              <div className="flex items-center gap-2 text-base">
                <span className="font-medium">Excellent</span>
                <span className="text-slate-700">4.8 out of 5</span>
                <span className="text-green-600">★ Trustpilot</span>
              </div>
            </div>

            {/* Top 3 Column Stats Card */}
            <div className="grid grid-cols-3 bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
              <div className="text-center px-2">
                <p className="text-sm text-slate-500 font-medium mb-1">PREMIUM NETWORK</p>
                <p className="text-xl font-bold text-slate-800">KDDI / SoftBank</p>
                <p className="text-sm text-slate-600 mt-1">Coverage #1</p>
              </div>
              <div className="text-center px-2 border-x border-slate-200">
                <p className="text-sm text-slate-500 font-medium mb-1">DATA OPTIONS</p>
                <p className="text-xl font-bold text-slate-800">Daily / Total / <span className="text-green-600">Unlimited</span></p>
                <p className="text-sm text-slate-600 mt-1">Flexible Choice</p>
              </div>
              <div className="text-center px-2">
                <p className="text-sm text-slate-500 font-medium mb-1">MAX SPEED</p>
                <p className="text-xl font-bold text-slate-800"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm">5G</span> / 4G LTE</p>
                <p className="text-sm text-slate-600 mt-1">⚡ High Speed</p>
              </div>
            </div>

            {/* Technical Specifications Header */}
            <h2 className="text-xl font-bold text-slate-800 mb-4">Technical Specifications</h2>
            <p className="text-base text-slate-500 mb-4">NETWORK SELECTION</p>

            {/* Network Selection 2 Column Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <p className="text-sm font-semibold text-blue-700 mb-2">FOR DAILY PLANS</p>
                <p className="text-lg font-bold text-slate-800 mb-2">SoftBank 5G</p>
                <div className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-md mb-3">
                  🇯🇵 Native IP
                </div>
                <p className="text-sm text-slate-700">Ultra-Low Latency. Best for <strong>Local Apps & Gaming</strong>.</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-5">
                <p className="text-sm font-semibold text-green-700 mb-2">TOTAL / UNLIMITED</p>
                <p className="text-lg font-bold text-slate-800 mb-2">KDDI 5G + SoftBank 5G</p>
                <div className="inline-flex items-center gap-1 bg-green-600 text-white text-xs px-2 py-1 rounded-md mb-3">
                  🐉 Dual Coverage
                </div>
                <p className="text-sm text-slate-700">Widest Signal. Auto-switch. Best for <strong>Sakura & Rural Areas</strong>.</p>
              </div>
            </div>

            {/* Specifications List */}
            <div className="space-y-0 mb-6">
              <div className="py-4 border-t border-slate-200 grid grid-cols-3">
                <p className="text-base text-slate-500 font-medium">Plan Type</p>
                <div className="col-span-2">
                  <p className="text-base font-semibold text-slate-800">Data Only</p>
                  <p className="text-sm text-slate-600">Use WhatsApp/VoIP for calls. No phone number provided.</p>
                </div>
              </div>
              <div className="py-4 border-t border-slate-200 grid grid-cols-3">
                <p className="text-base text-slate-500 font-medium">Activation</p>
                <div className="col-span-2">
                  <p className="text-base font-semibold text-green-600">Automatic</p>
                  <p className="text-sm text-slate-600">Auto-start on arrival; turn on data roaming for ByteSIM.</p>
                </div>
              </div>
            </div>

            {/* Quantity & Buy */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
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
                    <p className="text-lg font-semibold text-slate-800">{formatData(plan.dataAmount)}</p>
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
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Coverage ({locations.length} countries)</h2>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((loc) => (
                      <span key={loc} className="bg-slate-100 text-slate-600 text-sm px-3 py-1.5 rounded-full">{loc}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Network Operators */}
              {networkList.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Network Operators</h2>
                  <div className="space-y-4">
                    {networkList.map((net) => (
                      <div key={net.locationCode} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">
                          {net.locationCode}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 mb-2">{net.locationName}</p>
                          <div className="flex flex-wrap gap-2">
                            {net.operatorList?.map((op, i) => (
                              <span key={i} className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                {op.operatorName} ({op.networkType})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What's Included */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">What's Included</h2>
                <ul className="space-y-3">
                  {[
                    isUnlimited ? "Unlimited Data" : `${plan.dataAmount}GB Data`,
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