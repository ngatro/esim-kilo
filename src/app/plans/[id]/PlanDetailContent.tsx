"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n } from "@/components/providers/I18nProvider";

interface Operator {
  networkType: string;
  operatorName: string;
}

interface LocationNetwork {
  locationCode: string;
  locationLogo: string;
  locationName: string;
  operatorList: Operator[];
}

interface Plan {
  id: string;
  name: string;
  slug: string | null;
  packageCode: string;
  description: string | null;
  destination: string;
  dataType: number;
  dataVolume: string;
  dataAmount: number;
  durationDays: number;
  durationUnit: string;
  priceRaw: number;
  priceUsd: number;
  currencyCode: string;
  speed: string | null;
  networkType: string | null;
  locationCode: string | null;
  locations: unknown;
  coverageCount: number;
  smsStatus: number;
  activeType: number;
  supportTopUp: boolean;
  unusedValidTime: number;
  ipExport: string | null;
  fupPolicy: string | null;
  locationNetworkList: unknown;
  isActive: boolean;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
  priority: number;
  region: { id: string; name: string; emoji: string } | null;
  country: { id: string; name: string; emoji: string } | null;
}

function formatData(gb: number): string {
  if (gb >= 999) return "Unlimited";
  return `${gb}GB`;
}

function getTypeLabel(dataType: number): string {
  return dataType === 2 ? "Day Pass" : "Fixed Data";
}

export default function PlanDetailContent() {
  const { t } = useI18n();
  const params = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch(`/api/plans/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setPlan(data.plan);
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
  const locations = Array.isArray(plan.locations) ? plan.locations : [];
  const networkList: LocationNetwork[] = Array.isArray(plan.locationNetworkList) ? plan.locationNetworkList as LocationNetwork[] : [];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-10">
            <Link href="/" className="hover:text-slate-300 transition-colors">{t("common.home")}</Link>
            <span>/</span>
            <Link href="/plans" className="hover:text-slate-300 transition-colors">{t("common.plans")}</Link>
            <span>/</span>
            <span className="text-slate-300">{plan.destination}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-6xl">{plan.country?.emoji || plan.region?.emoji || "🌍"}</span>
                  <div className="flex flex-wrap gap-2">
                    {plan.isBestSeller && (
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">BEST SELLER</span>
                    )}
                    {plan.isHot && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">HOT</span>
                    )}
                    {plan.isPopular && (
                      <span className="bg-gradient-to-r from-sky-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
                    )}
                    <span className="bg-slate-700 text-white text-xs font-semibold px-3 py-1 rounded-full">{getTypeLabel(plan.dataType)}</span>
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-white">{plan.name}</h1>
                {plan.description && <p className="text-slate-400 mt-2">{plan.description}</p>}
                <p className="text-slate-500 text-sm mt-1">Package: {plan.packageCode} · {plan.coverageCount} {plan.coverageCount > 1 ? "countries" : "country"}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Data", value: isUnlimited ? "∞" : `${plan.dataAmount}GB`, color: "text-sky-400" },
                  { label: "Duration", value: `${plan.durationDays} ${plan.durationUnit === "DAY" ? "Days" : plan.durationUnit}`, color: "text-white" },
                  { label: "Cost/Day", value: `$${pricePerDay}`, color: "text-emerald-400" },
                  { label: "Network", value: plan.speed || "4G", color: "text-purple-400" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 text-center">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Coverage Countries */}
              {locations.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Coverage ({locations.length} {locations.length > 1 ? "countries" : "country"})</h2>
                  <div className="flex flex-wrap gap-2">
                    {(locations as string[]).map((loc) => (
                      <span key={loc} className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium px-3 py-1.5 rounded-lg">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Network Operators */}
              {networkList.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Network Operators</h2>
                  <div className="space-y-4">
                    {networkList.map((loc) => (
                      <div key={loc.locationCode} className="flex items-start gap-4">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          {loc.locationLogo && (
                            <img src={`https://esimaccess.com${loc.locationLogo}`} alt={loc.locationName} className="w-6 h-4 rounded object-cover" />
                          )}
                          <span className="text-white text-sm font-medium">{loc.locationName}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {loc.operatorList?.map((op) => (
                            <span key={`${loc.locationCode}-${op.operatorName}`} className="bg-slate-700/50 text-slate-300 text-xs px-2.5 py-1 rounded-lg">
                              {op.operatorName} ({op.networkType})
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra Info */}
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Plan Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Package Code", value: plan.packageCode },
                    { label: "Type", value: getTypeLabel(plan.dataType) },
                    { label: "Data Volume", value: `${plan.dataAmount}GB` },
                    { label: "Duration", value: `${plan.durationDays} ${plan.durationUnit === "DAY" ? "Days" : plan.durationUnit}` },
                    { label: "SMS", value: plan.smsStatus === 2 ? "Supported" : "Not Supported" },
                    { label: "Top-Up", value: plan.supportTopUp ? "Supported" : "Not Supported" },
                    { label: "IP Export", value: plan.ipExport || "Not specified" },
                    { label: "Unused Valid Time", value: `${plan.unusedValidTime} days` },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between py-2 border-b border-slate-700/30 last:border-0">
                      <span className="text-slate-500 text-sm">{item.label}</span>
                      <span className="text-white text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Sidebar */}
            <div className="lg:col-span-2">
              <motion.div
                className="sticky top-24 bg-slate-800/70 border border-slate-700/60 rounded-3xl p-7 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-4xl font-bold text-white">${plan.priceUsd.toFixed(2)}</p>
                  <p className="text-sm text-slate-500">one-time</p>
                </div>
                <p className="text-slate-500 text-sm mb-6">
                  {isUnlimited ? "Unlimited" : `${plan.dataAmount}GB`} · {plan.durationDays} days
                </p>

                <Link href={`/checkout?planId=${plan.id}`}>
                  <motion.button
                    className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-4 rounded-xl text-lg transition-colors shadow-lg shadow-sky-900/30 mb-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t("plans.buyNow")}
                  </motion.button>
                </Link>

                <div className="mt-6 pt-6 border-t border-slate-700 space-y-3">
                  {[
                    { icon: "⚡", text: "Instant QR delivery" },
                    { icon: "🔒", text: "Secure checkout" },
                    { icon: "💰", text: `${plan.unusedValidTime}-day refund window` },
                    { icon: "📱", text: "Works on all eSIM devices" },
                    ...(plan.supportTopUp ? [{ icon: "🔄", text: "Supports Top-Up" }] : []),
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3 text-sm text-slate-400">
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="mt-14">
            <Link href="/plans" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all plans
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}