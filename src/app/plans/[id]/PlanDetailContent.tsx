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

const HERO_IMAGES: Record<string, string[]> = {
  JP: [
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&q=80",
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1600&q=80",
    "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1600&q=80",
    "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=1600&q=80",
  ],
  KR: [
    "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1600&q=80",
    "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1600&q=80",
    "https://images.unsplash.com/photo-1590051807006-011c10ac2d27?w=1600&q=80",
  ],
  TH: [
    "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1600&q=80",
    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1600&q=80",
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1600&q=80",
  ],
  VN: [
    "https://images.unsplash.com/photo-1559302504-64aae6f6e6d6?w=1600&q=80",
    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1600&q=80",
    "https://images.unsplash.com/photo-1605446537526-44126f5c4e66?w=1600&q=80",
  ],
  SG: [
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600&q=80",
    "https://images.unsplash.com/photo-1565967511849-76a60a516169?w=1600&q=80",
  ],
  MY: [
    "https://images.unsplash.com/photo-1512553232225-a498-2a0b6008d120?w=1600&q=80",
    "https://images.unsplash.com/photo-1532236204323-e17e960324f2?w=1600&q=80",
  ],
  ID: [
    "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1600&q=80",
    "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1600&q=80",
  ],
  PH: [
    "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1600&q=80",
    "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1600&q=80",
  ],
  IN: [
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=80",
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=80",
  ],
  CN: [
    "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1600&q=80",
    "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1600&q=80",
  ],
  TW: [
    "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=1600&q=80",
    "https://images.unsplash.com/photo-1625596702273-5be4d321e805?w=1600&q=80",
  ],
  HK: [
    "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1600&q=80",
    "https://images.unsplash.com/photo-1532236204993-a6e98d343660?w=1600&q=80",
  ],
  US: [
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600&q=80",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600&q=80",
  ],
  CA: [
    "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1600&q=80",
    "https://images.unsplash.com/photo-1517931524326-bdd55a541177?w=1600&q=80",
  ],
  MX: [
    "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1600&q=80",
    "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1600&q=80",
  ],
  BR: [
    "https://images.unsplash.com/photo-1483729558449-99ef09a8e325?w=1600&q=80",
    "https://images.unsplash.com/photo-1483729558449-99ef09a8e325?w=1600&q=80",
  ],
  GB: [
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=80",
    "https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=1600&q=80",
  ],
  FR: [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80",
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80",
  ],
  DE: [
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600&q=80",
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600&q=80",
  ],
  IT: [
    "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1600&q=80",
    "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1600&q=80",
  ],
  ES: [
    "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1600&q=80",
    "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1600&q=80",
  ],
  NL: [
    "https://images.unsplash.com/photo-1512470876317-1f3c7c5ad1e9?w=1600&q=80",
  ],
  CH: [
    "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1600&q=80",
  ],
  AT: [
    "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1600&q=80",
  ],
  SE: [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
  ],
  NO: [
    "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&q=80",
  ],
  AU: [
    "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1600&q=80",
    "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1600&q=80",
  ],
  NZ: [
    "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1600&q=80",
  ],
  AE: [
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80",
  ],
  TR: [
    "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1600&q=80",
  ],
};

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80",
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1600&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
];

function getHeroImage(countryId: string | null): string {
  if (!countryId) {
    return DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
  }
  const key = countryId.toUpperCase();
  const images = HERO_IMAGES[key];
  if (images && images.length > 0) {
    return images[Math.floor(Math.random() * images.length)];
  }
  return DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
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

  const isUnlimited = !!plan.fupPolicy || plan.dataAmount >= 999;
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