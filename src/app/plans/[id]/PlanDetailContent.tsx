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

export default function PlanDetailContent() {
  const { t } = useI18n();
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
  const pricePerDay = (plan.priceUsd / plan.durationDays).toFixed(2);
  const locations = Array.isArray(plan.locations) ? (plan.locations as string[]) : [];
  const networkList = Array.isArray(plan.locationNetworkList) ? (plan.locationNetworkList as LocationNetwork[]) : [];
  const hasDiscount = plan.retailPriceUsd > plan.priceUsd;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="pt-20 sm:pt-28 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6 sm:mb-10">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span>/</span>
            <Link href="/plans" className="hover:text-slate-300">Plans</Link>
            <span>/</span>
            <span className="text-slate-300">{plan.destination}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
            <div className="lg:col-span-3 space-y-5 sm:space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {plan.isBestSeller && <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">BEST SELLER</span>}
                  {plan.isHot && <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">HOT</span>}
                  {plan.isPopular && <span className="bg-gradient-to-r from-sky-500 to-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">POPULAR</span>}
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold text-white">{plan.destination} eSIM</h1>
                <p className="text-slate-400 text-sm mt-1">{plan.name}</p>
                {plan.description && <p className="text-slate-500 text-xs mt-1">{plan.description}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: "Data", value: formatData(plan.dataAmount), color: "text-sky-400" },
                  { label: "Duration", value: `${plan.durationDays} ${plan.durationUnit === "DAY" ? "Days" : plan.durationUnit}`, color: "text-white" },
                  { label: "Per Day", value: `$${pricePerDay}`, color: "text-emerald-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 text-center">
                    <p className={`text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-white mb-3">Plan Details</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-slate-500 text-xs">Data Type</p><p className="text-white">{getDataTypeLabel(plan.dataType)}</p></div>
                  <div><p className="text-slate-500 text-xs">Network</p><p className="text-white">{plan.speed || "4G LTE"}</p></div>
                  <div><p className="text-slate-500 text-xs">Activation</p><p className="text-white">{plan.activeType === 1 ? "First installation" : "First network connection"}</p></div>
                  <div><p className="text-slate-500 text-xs">SMS</p><p className="text-white">{plan.smsStatus === 0 ? "Not supported" : plan.smsStatus === 1 ? "API + Mobile" : "API only"}</p></div>
                  {plan.ipExport && <div><p className="text-slate-500 text-xs">IP Export</p><p className="text-white">{plan.ipExport}</p></div>}
                  <div><p className="text-slate-500 text-xs">Top-Up</p><p className="text-white">{plan.supportTopUp ? "Supported" : "Not supported"}</p></div>
                  {plan.unusedValidTime > 0 && <div><p className="text-slate-500 text-xs">Valid After Purchase</p><p className="text-white">{plan.unusedValidTime} days</p></div>}
                  <div><p className="text-slate-500 text-xs">Package Code</p><p className="text-slate-400 text-xs font-mono">{plan.packageCode}</p></div>
                </div>
              </div>

              {plan.fupPolicy && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold text-amber-400 mb-2">Fair Use Policy</h2>
                  <p className="text-amber-200 text-sm">After full speed is depleted, speed will be reduced to <strong>{plan.fupPolicy}</strong></p>
                </div>
              )}

              {networkList.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold text-white mb-4">Network Operators</h2>
                  <div className="space-y-4">
                    {networkList.map((net) => (
                      <div key={net.locationCode} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 text-xs">{net.locationCode}</div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{net.locationName}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {net.operatorList?.map((op, i) => (
                              <span key={i} className="bg-sky-500/10 text-sky-400 text-xs px-2 py-0.5 rounded-full">{op.operatorName} ({op.networkType})</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {locations.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-semibold text-white mb-3">Coverage ({locations.length} countries)</h2>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((loc) => (
                      <span key={loc} className="bg-slate-700/50 text-slate-300 text-xs px-2.5 py-1 rounded-full">{loc}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-white mb-3">What&apos;s Included</h2>
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
                    <li key={f} className="flex items-start gap-2 sm:gap-3 text-slate-300 text-sm">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2">
              <motion.div className="sticky top-20 sm:top-24 bg-slate-800/70 border border-slate-700/60 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {hasDiscount && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-slate-500 line-through text-lg">${plan.retailPriceUsd.toFixed(2)}</span>
                    <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">-{Math.round((1 - plan.priceUsd / plan.retailPriceUsd) * 100)}%</span>
                  </div>
                )}
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-3xl sm:text-4xl font-bold text-white">${plan.priceUsd.toFixed(2)}</p>
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