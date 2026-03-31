"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useI18n } from "@/components/providers/I18nProvider";

interface Plan {
  id: string;
  name: string;
  destination: string;
  dataAmount: number;
  validityDays: number;
  priceUsd: number;
  coverageCountries: number;
  networkType: string | null;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
  features: unknown;
  speeds: unknown;
  region: { id: string; name: string; emoji: string } | null;
  country: { id: string; name: string; emoji: string } | null;
}

function formatData(gb: number): string {
  if (gb >= 999) return "Unlimited";
  return `${gb}GB`;
}

export default function PlanDetailContent() {
  const { t } = useI18n();
  const params = useParams();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch(`/api/plans?search=${params.id}`);
        const data = await res.json();
        const found = (data.plans || []).find((p: Plan) => p.id === params.id);
        setPlan(found || null);
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
  const pricePerDay = (plan.priceUsd / plan.validityDays).toFixed(2);
  const features = Array.isArray(plan.features) ? plan.features : [];
  const speeds = Array.isArray(plan.speeds) ? plan.speeds : [];

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
                    {plan.badge && (
                      <span className="bg-slate-700 text-white text-xs font-semibold px-3 py-1 rounded-full">{plan.badge}</span>
                    )}
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-white">{plan.destination} eSIM</h1>
                {plan.coverageCountries > 1 && (
                  <p className="text-slate-400 mt-1">{plan.coverageCountries} countries covered</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: t("plans.data"), value: formatData(plan.dataAmount), color: "text-sky-400" },
                  { label: t("plans.validity"), value: `${plan.validityDays} ${t("plans.days")}`, color: "text-white" },
                  { label: "Cost/day", value: `$${pricePerDay}`, color: "text-emerald-400" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 text-center">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {speeds.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Network Speeds</h2>
                  <div className="flex flex-wrap gap-2">
                    {(speeds as string[]).map((speed) => (
                      <span key={speed} className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium px-3 py-1.5 rounded-lg">
                        {speed}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">What&apos;s Included</h2>
                <ul className="space-y-3">
                  {(features as string[]).map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-slate-300">
                      <svg className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {plan.country && (
                <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-3">Coverage</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{plan.country.emoji}</span>
                    <div>
                      <p className="text-white font-medium">{plan.country.name}</p>
                      <p className="text-slate-500 text-sm">Full nationwide coverage via local carriers</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                  {isUnlimited ? "Unlimited data" : `${plan.dataAmount}GB data`} · {plan.validityDays} days
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
                    { icon: "💰", text: "7-day refund policy" },
                    { icon: "📱", text: "Works on all eSIM devices" },
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