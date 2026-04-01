"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "../providers/I18nProvider";

interface Plan {
  id: string;
  name: string;
  slug: string | null;
  destination: string;
  dataAmount: number;
  durationDays: number;
  priceUsd: number;
  speed: string | null;
  networkType: string | null;
  regionId: string | null;
  regionName: string | null;
  countryName: string | null;
  coverageCount: number;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
}

interface Region {
  id: string;
  name: string;
  emoji: string;
}

function formatData(gb: number): string {
  if (gb >= 999) return "Unlimited";
  if (gb < 1) return `${Math.round(gb * 1024)}MB`;
  return `${gb}GB`;
}

function MiniPlanCard({ plan, index }: { plan: Plan; index: number }) {
  const isUnlimited = plan.dataAmount >= 999;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`relative flex flex-col bg-slate-800/60 border rounded-2xl p-5 hover:border-sky-500/60 hover:bg-slate-800 transition-all duration-200 group ${
        plan.isPopular || plan.isBestSeller ? "border-sky-500/50 shadow-lg shadow-sky-900/20" : "border-slate-700/60"
      }`}
    >
      {(plan.isBestSeller || plan.isHot || plan.badge) && (
        <span className="absolute -top-3 left-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          {plan.isBestSeller ? "BEST SELLER" : plan.isHot ? "HOT" : plan.badge}
        </span>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-white">{plan.destination}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {plan.coverageCount > 1 ? `${plan.coverageCount} countries` : plan.countryName || plan.regionName}
          </p>
        </div>
        <p className="text-xl font-bold text-white">${plan.priceUsd.toFixed(2)}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-900/60 rounded-xl p-2 text-center">
          <p className={`font-bold ${isUnlimited ? "text-sm" : "text-lg"} text-sky-400`}>{formatData(plan.dataAmount)}</p>
          <p className="text-[10px] text-slate-500">Data</p>
        </div>
        <div className="bg-slate-900/60 rounded-xl p-2 text-center">
          <p className="text-lg font-bold text-white">{plan.durationDays}</p>
          <p className="text-[10px] text-slate-500">Days</p>
        </div>
        <div className="bg-slate-900/60 rounded-xl p-2 text-center">
          <p className="text-sm font-bold text-emerald-400">${(plan.priceUsd / plan.durationDays).toFixed(2)}</p>
          <p className="text-[10px] text-slate-500">/Day</p>
        </div>
      </div>

      <Link
        href={`/plans/${plan.slug || plan.id}`}
        className="block w-full text-center py-2 rounded-xl text-sm font-semibold bg-slate-700 hover:bg-sky-500 text-white transition-all"
      >
        Buy Now
      </Link>
    </motion.div>
  );
}

export default function PlansSection() {
  const { t } = useI18n();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch regions
    fetch("/api/regions")
      .then((r) => r.json())
      .then((data) => setRegions(data.regions || []))
      .catch(console.error);

    // Fetch popular/best plans
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => setPlans(data.plans || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = plans.filter((plan) => {
    const matchRegion = activeRegion === "all" || plan.regionId === activeRegion;
    const matchSearch = !searchQuery || plan.destination.toLowerCase().includes(searchQuery.toLowerCase()) || plan.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRegion && matchSearch;
  }).slice(0, 12);

  return (
    <section id="plans" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">{t("plans.title")}</h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">{t("plans.subtitle")}</p>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">{plans.length} plans available</p>
        </div>

        <div className="max-w-md mx-auto mb-6 sm:mb-8">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-center mb-8 sm:mb-12 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveRegion("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeRegion === "all" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            }`}
          >
            All
          </button>
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => setActiveRegion(region.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeRegion === region.id ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              }`}
            >
              <span>{region.emoji}</span>{region.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-800/60 rounded-2xl p-5 animate-pulse">
                <div className="h-5 bg-slate-700 rounded w-2/3 mb-3" />
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="h-12 bg-slate-700 rounded-xl" />
                  <div className="h-12 bg-slate-700 rounded-xl" />
                  <div className="h-12 bg-slate-700 rounded-xl" />
                </div>
                <div className="h-9 bg-slate-700 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((plan, i) => (
                <MiniPlanCard key={plan.id} plan={plan} index={i} />
              ))}
            </div>
            <div className="text-center mt-8 sm:mt-12">
              <Link href="/plans">
                <motion.button
                  className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  View All Plans
                </motion.button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-slate-400 text-lg mb-2">No plans found</p>
            <p className="text-slate-500 text-sm">Admin needs to sync plans from eSIM Access first</p>
          </div>
        )}
      </div>
    </section>
  );
}