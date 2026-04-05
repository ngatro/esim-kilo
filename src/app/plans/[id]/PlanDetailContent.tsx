"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
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
  DK: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&q=80",
  FI: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=1200&q=80",
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
  const idOrSlug = params.id as string;

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch(`/api/plans?id=${encodeURIComponent(idOrSlug)}`);
        const data = await res.json();
        setPlan(data.plans?.[0] || null);
      } catch {
        setPlan(null);
      } finally {
        setLoading(false);
      }
    }
    if (idOrSlug) fetchPlan();
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">📦</p>
          <h2 className="text-2xl font-bold mb-2">Plan not found</h2>
          <Link href="/plans" className="text-sky-400 hover:text-sky-300">Browse all plans →</Link>
        </div>
      </div>
    );
  }

  const isUnlimited = plan.dataAmount >= 999;
  const displayPrice = (plan.retailPriceUsd && plan.retailPriceUsd > 0) ? plan.retailPriceUsd : plan.priceUsd;
  const pricePerDay = (displayPrice / plan.durationDays).toFixed(2);
  const locations = Array.isArray(plan.locations) ? (plan.locations as string[]) : [];
  
  let networkList: LocationNetwork[] = [];
  try {
    const parsed = typeof plan.locationNetworkList === 'string' 
      ? JSON.parse(plan.locationNetworkList) 
      : plan.locationNetworkList;
    networkList = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    networkList = [];
  }
  
  const hasDiscount = plan.retailPriceUsd > 0 && plan.retailPriceUsd > plan.priceUsd;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 text-slate-800">
      {/* Hero Banner */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-white/80 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('${getHeroImage(plan.countryId)}')`,
          }}
        />
        <div className="relative z-20 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 h-full flex items-end pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {plan.isBestSeller && <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">⭐ Best Seller</span>}
              {plan.isHot && <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">🔥 Hot</span>}
              {plan.isPopular && <span className="bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">Popular</span>}
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg">{plan.destination}</h1>
            <p className="text-white/80 text-lg mt-1 drop-shadow">{plan.name}</p>
          </div>
        </div>
      </div>

      <main className="pt-8 sm:pt-12 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
            <div className="lg:col-span-3 space-y-5 sm:space-y-6">
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: "Data", value: formatData(plan.dataAmount), color: "text-orange-600" },
                  { label: "Duration", value: `${plan.durationDays} ${plan.durationUnit === "DAY" ? "Days" : plan.durationUnit}`, color: "text-slate-700" },
                  { label: "Per Day", value: `$${pricePerDay}`, color: "text-cyan-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-center shadow-md">
                    <p className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md">
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">Plan Details</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-slate-500 text-xs">Data</p><p className="text-slate-800">{formatData(plan.dataAmount)}</p></div>
                  <div><p className="text-slate-500 text-xs">Validity</p><p className="text-slate-800">{plan.durationDays} Days</p></div>
                  <div><p className="text-slate-500 text-xs">Speed</p><p className="text-slate-800">{plan.speed || "4G LTE"}</p></div>
                  <div><p className="text-slate-500 text-xs">Plan Type</p><p className="text-slate-800">{plan.smsStatus === 0 ? "Data Only" : "Data + SMS"}</p></div>
                  <div><p className="text-slate-500 text-xs">Tethering</p><p className="text-slate-800">{plan.ipExport ? "Supported" : "Not supported"}</p></div>
                  <div><p className="text-slate-500 text-xs">Activation</p><p className="text-slate-800">{plan.activeType === 1 ? "First installation" : "First network connection"}</p></div>
                  {plan.unusedValidTime > 0 && <div><p className="text-slate-500 text-xs">Valid After Purchase</p><p className="text-slate-800">{plan.unusedValidTime} days</p></div>}
                  <div><p className="text-slate-500 text-xs">Top-Up</p><p className="text-slate-800">{plan.supportTopUp ? "Supported" : "Not supported"}</p></div>
                  <div><p className="text-slate-500 text-xs">Package Code</p><p className="text-slate-400 text-xs font-mono">{plan.packageCode}</p></div>
                </div>
              </div>

              {plan.fupPolicy && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold text-amber-600 mb-2">Fair Use Policy</h2>
                  <p className="text-amber-700 text-sm">After full speed is depleted, speed will be reduced to <strong>{plan.fupPolicy}</strong></p>
                </div>
              )}

              {networkList.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Network Operators</h2>
                  <div className="space-y-4">
                    {networkList.map((net) => (
                      <div key={net.locationCode} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xs">{net.locationCode}</div>
                        <div className="flex-1">
                          <p className="text-slate-800 text-sm font-medium">Location: {net.locationName}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {net.operatorList?.map((op, i) => (
                              <span key={i} className="bg-green-50 text-green-600 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
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

              {locations.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">Coverage ({locations.length} countries)</h2>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((loc) => (
                      <span key={loc} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">{loc}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md">
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">What&apos;s Included</h2>
                <ul className="space-y-2 sm:space-y-3">
                  {[
                    isUnlimited ? "Unlimited Data" : `${plan.dataAmount}GB Data`,
                    `${plan.durationDays} ${plan.durationUnit === "DAY" ? "Days" : plan.durationUnit} Validity`,
                    plan.speed || "4G LTE",
                    "Instant QR Code Delivery",
                    plan.supportTopUp ? "Supports Top-Up" : null,
                    plan.ipExport ? `IP: ${plan.ipExport}` : null,
                    plan.unusedValidTime > 0 ? `Valid ${plan.unusedValidTime} days after purchase` : null,
                    plan.smsStatus > 0 ? "SMS Supported" : null,
                    `Activation: ${plan.activeType === 1 ? "First installation" : "First network connection"}`,
                  ].filter(Boolean).map((f) => (
                    <li key={f} className="flex items-start gap-2 sm:gap-3 text-slate-600 text-sm">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2">
              <motion.div className="sticky top-20 sm:top-24 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {hasDiscount && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-slate-500 line-through text-lg">{formatPrice(plan.retailPriceUsd || plan.priceUsd)}</span>
                    <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">-{Math.round((1 - plan.priceUsd / (plan.retailPriceUsd || plan.priceUsd)) * 100)}%</span>
                  </div>
                )}
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-3xl sm:text-4xl font-bold text-white">{formatPrice(displayPrice)}</p>
                  <p className="text-sm text-slate-500">one-time</p>
                </div>
                <p className="text-slate-500 text-sm mb-5 sm:mb-6">{isUnlimited ? "Unlimited" : `${plan.dataAmount}GB`} · {plan.durationDays} days</p>

                <Link href={`/checkout?planId=${plan.id}`}>
                  <motion.button className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 sm:py-4 rounded-xl text-base sm:text-lg transition-colors shadow-lg shadow-sky-900/30 mb-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    {t("plans.buyNow")}
                  </motion.button>
                </Link>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-700 space-y-2 sm:space-y-3">
                  {[{ icon: "⚡", text: "Instant QR delivery" }, { icon: "🔒", text: "Secure checkout" }, { icon: "💰", text: "7-day refund policy" }, { icon: "📱", text: "Works on all eSIM devices" }].map((item) => (
                    <div key={item.text} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-400"><span>{item.icon}</span><span>{item.text}</span></div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="mt-10 sm:mt-14">
            <Link href="/plans" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to all plans
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}