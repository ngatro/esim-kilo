"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";

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

function getTypeLabel(dt: number): string {
  return dt === 2 ? "Day Pass" : "Fixed Data";
}

export default function PlanDetailContent() {
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
      } catch {
        setPlan(null);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchPlan();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex items-center justify-center">
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
  const locations = Array.isArray(plan.locations) ? plan.locations as string[] : [];
  const networkList: LocationNetwork[] = Array.isArray(plan.locationNetworkList) ? plan.locationNetworkList as LocationNetwork[] : [];

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <main className="pt-28 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-10">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/plans" className="hover:text-slate-300 transition-colors">Plans</Link>
            <span>/</span>
            <span className="text-slate-300">{plan.destination}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left */}
            <div className="lg:col-span-3 space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/50 border border-slate-700/40 rounded-3xl p-8">
                <div className="flex items-center gap-5 mb-4">
                  <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center text-5xl">
                    {plan.country?.emoji || plan.region?.emoji || "🌍"}
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-white">{plan.name}</h1>
                    <p className="text-slate-400 mt-1">
                      {plan.coverageCount > 1 ? `${plan.coverageCount} countries covered` : plan.destination}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {plan.isBestSeller && (
                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">⭐ BEST SELLER</span>
                      )}
                      {plan.isHot && (
                        <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">🔥 HOT</span>
                      )}
                      <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full">{getTypeLabel(plan.dataType)}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 mt-6">
                  {[
                    { label: "Data", value: isUnlimited ? "∞" : `${plan.dataAmount}GB`, gradient: true },
                    { label: "Duration", value: `${plan.durationDays} Days` },
                    { label: "Cost/Day", value: `$${pricePerDay}`, color: "text-emerald-400" },
                    { label: "Network", value: plan.speed || "4G", color: "text-purple-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-900/50 border border-slate-700/30 rounded-2xl p-4 text-center">
                      <p className={`text-2xl font-extrabold ${s.gradient ? "bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent" : s.color || "text-white"}`}>
                        {s.value}
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coverage */}
              {locations.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-700/30 rounded-3xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Coverage ({locations.length} countries)</h2>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((loc) => (
                      <span key={loc} className="bg-sky-500/10 text-sky-400 text-sm font-semibold px-3 py-1.5 rounded-xl border border-sky-500/20">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Network Operators */}
              {networkList.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-700/30 rounded-3xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Network Operators</h2>
                  <div className="space-y-3">
                    {networkList.map((loc) => (
                      <div key={loc.locationCode} className="flex items-start gap-4 bg-slate-900/30 rounded-2xl p-4">
                        <div className="flex items-center gap-2 min-w-[140px]">
                          {loc.locationLogo && (
                            <img src={`https://esimaccess.com${loc.locationLogo}`} alt="" className="w-6 h-4 rounded" />
                          )}
                          <span className="text-white text-sm font-medium">{loc.locationName}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {loc.operatorList?.map((op) => (
                            <span key={op.operatorName} className="bg-slate-700/50 text-slate-300 text-xs px-2.5 py-1 rounded-lg">
                              {op.operatorName} <span className="text-sky-400">{op.networkType}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Table */}
              <div className="bg-slate-800/40 border border-slate-700/30 rounded-3xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Plan Info</h2>
                <div className="grid grid-cols-2 gap-y-0 gap-x-8">
                  {[
                    ["Package Code", plan.packageCode],
                    ["Type", getTypeLabel(plan.dataType)],
                    ["Data", isUnlimited ? "Unlimited" : `${plan.dataAmount}GB`],
                    ["Duration", `${plan.durationDays} ${plan.durationUnit === "DAY" ? "Days" : plan.durationUnit}`],
                    ["SMS", plan.smsStatus === 2 ? "✅ Supported" : "❌ Not Available"],
                    ["Top-Up", plan.supportTopUp ? "✅ Supported" : "❌ Not Available"],
                    ["IP Export", plan.ipExport || "—"],
                    ["Refund Window", `${plan.unusedValidTime} days`],
                  ].map(([label, value], i) => (
                    <div key={label} className={`flex justify-between py-3 ${i < 6 ? "border-b border-slate-700/30" : ""}`}>
                      <span className="text-slate-500 text-sm">{label}</span>
                      <span className="text-white text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right - Sticky Price */}
            <div className="lg:col-span-2">
              <motion.div
                className="sticky top-24 bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/40 rounded-3xl p-8 shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Total Price</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="text-5xl font-extrabold text-white">${plan.priceUsd.toFixed(2)}</p>
                  <p className="text-slate-500 text-sm">USD</p>
                </div>
                <p className="text-slate-500 text-sm mb-6">
                  ${pricePerDay}/day · {isUnlimited ? "Unlimited" : `${plan.dataAmount}GB`} · {plan.durationDays} days
                </p>

                <Link href={`/checkout?planId=${plan.id}`}>
                  <motion.button
                    className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold py-4 rounded-2xl text-lg transition-all shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Buy Now →
                  </motion.button>
                </Link>

                <div className="mt-6 pt-6 border-t border-slate-700/40 space-y-3">
                  {[
                    { icon: "⚡", text: "Instant QR code delivery" },
                    { icon: "🔒", text: "Secure payment" },
                    { icon: "💰", text: `${plan.unusedValidTime}-day refund window` },
                    { icon: "📱", text: "Works on all eSIM devices" },
                    ...(plan.supportTopUp ? [{ icon: "🔄", text: "Top-up available" }] : []),
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

          {/* Back */}
          <div className="mt-14">
            <Link href="/plans" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm">
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