"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  slug: string | null;
  packageCode: string;
  description: string | null;
  destination: string;
  dataType: number;
  dataAmount: number;
  durationDays: number;
  durationUnit: string;
  priceUsd: number;
  speed: string | null;
  networkType: string | null;
  coverageCount: number;
  locationCode: string | null;
  locations: unknown;
  supportTopUp: boolean;
  isActive: boolean;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
  ipExport: string | null;
  region: { id: string; name: string; emoji: string } | null;
  country: { id: string; name: string; emoji: string } | null;
}

interface Region {
  id: string;
  name: string;
  emoji: string;
  countries: { id: string; name: string; emoji: string }[];
  _count: { plans: number };
}

const DATA_OPTIONS = [
  { label: "1GB", min: 0.5, max: 1.5 },
  { label: "3GB", min: 2, max: 4 },
  { label: "5GB", min: 4, max: 6 },
  { label: "10GB", min: 9, max: 12 },
  { label: "20GB+", min: 19, max: 998 },
  { label: "Unlimited", min: 999, max: 9999 },
];

const DURATION_OPTIONS = [
  { label: "3 Days", value: 3 },
  { label: "7 Days", value: 7 },
  { label: "15 Days", value: 15 },
  { label: "30 Days", value: 30 },
  { label: "60 Days", value: 60 },
  { label: "90 Days", value: 90 },
];

function PlanCard({ plan }: { plan: Plan }) {
  const isUnlimited = plan.dataAmount >= 999;
  const pricePerDay = (plan.priceUsd / plan.durationDays).toFixed(2);

  return (
    <motion.div layout>
      <Link href={`/plans/${plan.id}`} className="block h-full">
        <div className="group relative h-full bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/40 rounded-3xl overflow-hidden transition-all duration-300 hover:border-sky-500/30 hover:shadow-[0_0_40px_rgba(14,165,233,0.08)]">
          {/* Top banner badge */}
          {(plan.isBestSeller || plan.isHot) && (
            <div className={`absolute top-0 left-0 right-0 text-center text-[11px] font-bold tracking-wider py-1.5 ${
              plan.isBestSeller
                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                : "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
            }`}>
              {plan.isBestSeller ? "⭐ BEST SELLER" : "🔥 HOT DEAL"}
            </div>
          )}

          <div className={`p-6 flex flex-col h-full ${(plan.isBestSeller || plan.isHot) ? "pt-9" : ""}`}>
            {/* Country */}
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">{plan.country?.emoji || plan.region?.emoji || "🌍"}</div>
              <h3 className="text-lg font-bold text-white">{plan.destination}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {plan.coverageCount > 1 ? `${plan.coverageCount} countries` : plan.packageCode}
              </p>
            </div>

            {/* Data + Days */}
            <div className="flex items-center justify-center gap-6 mb-5">
              <div className="text-center">
                <p className="text-3xl font-extrabold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
                  {isUnlimited ? "∞" : `${plan.dataAmount}`}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">
                  {isUnlimited ? "Unlimited" : "GB"}
                </p>
              </div>
              <div className="w-px h-10 bg-slate-700/60" />
              <div className="text-center">
                <p className="text-3xl font-extrabold text-white">{plan.durationDays}</p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Days</p>
              </div>
            </div>

            {/* Network + tags */}
            <div className="flex justify-center flex-wrap gap-1.5 mb-5">
              {plan.speed && (
                <span className="bg-sky-500/10 text-sky-400 text-[11px] font-bold px-3 py-1 rounded-full border border-sky-500/20">
                  {plan.speed}
                </span>
              )}
              {plan.supportTopUp && (
                <span className="bg-emerald-500/10 text-emerald-400 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                  Top-Up
                </span>
              )}
              {plan.dataType === 2 && (
                <span className="bg-violet-500/10 text-violet-400 text-[11px] font-bold px-3 py-1 rounded-full border border-violet-500/20">
                  Day Pass
                </span>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Price */}
            <div className="text-center pt-4 border-t border-slate-700/40">
              <p className="text-3xl font-extrabold text-white">${plan.priceUsd.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">${pricePerDay}/day</p>
            </div>

            {/* CTA */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={(e) => { e.preventDefault(); }}
                className="flex-1 bg-slate-700/40 hover:bg-slate-600/50 text-slate-300 text-sm font-medium py-3 rounded-2xl transition-colors"
              >
                Details
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = `/checkout?planId=${plan.id}`;
                }}
                className="flex-[1.5] bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white text-sm font-bold py-3 rounded-2xl transition-all shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30"
              >
                Buy Now →
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`relative px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/25"
          : "bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:border-slate-500 hover:text-white"
      }`}
    >
      {children}
    </motion.button>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedData, setSelectedData] = useState<typeof DATA_OPTIONS[0] | null>(null);
  const [sortBy, setSortBy] = useState("price-low");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRegion !== "all") params.set("regionId", selectedRegion);
      if (selectedCountry) params.set("countryId", selectedCountry);
      if (sortBy) params.set("sortBy", sortBy);

      const res = await fetch(`/api/plans?${params.toString()}`);
      const data = await res.json();
      let filtered = data.plans || [];

      if (selectedDuration) {
        filtered = filtered.filter((p: Plan) => p.durationDays === selectedDuration);
      }
      if (selectedData) {
        filtered = filtered.filter(
          (p: Plan) => p.dataAmount >= selectedData.min && p.dataAmount <= selectedData.max
        );
      }

      setPlans(filtered);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedCountry, selectedDuration, selectedData, sortBy]);

  useEffect(() => {
    fetch("/api/regions")
      .then((r) => r.json())
      .then((data) => setRegions(data.regions || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  function clearFilters() {
    setSelectedRegion("all");
    setSelectedCountry("");
    setSelectedDuration(null);
    setSelectedData(null);
  }

  const hasFilters = selectedRegion !== "all" || selectedCountry || selectedDuration || selectedData;
  const currentRegion = regions.find((r) => r.id === selectedRegion);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <main className="pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ===== HERO ===== */}
          <div className="relative text-center mb-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-cyan-500/10 to-sky-500/5 rounded-3xl blur-3xl" />
            <div className="relative py-10">
              <p className="text-sky-400 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Travel eSIM Plans</p>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Stay Connected
                </span>
                <br />
                <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
                  Anywhere You Go
                </span>
              </h1>
              <p className="text-slate-400 text-lg max-w-xl mx-auto">
                Instant eSIM for 190+ countries. No contracts, no roaming fees.
              </p>
            </div>
          </div>

          {/* ===== SEARCH BAR ===== */}
          <div className="relative mb-8">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-2 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <select
                    value={selectedCountry || selectedRegion}
                    onChange={(e) => {
                      const val = e.target.value;
                      const isRegion = regions.some((r) => r.id === val);
                      if (isRegion) {
                        setSelectedRegion(val);
                        setSelectedCountry("");
                      } else {
                        setSelectedCountry(val);
                        const parent = regions.find((r) => r.countries.some((c) => c.id === val));
                        setSelectedRegion(parent?.id || "all");
                      }
                    }}
                    className="w-full bg-transparent border-0 pl-12 pr-4 py-4 text-white text-sm font-medium focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900">🔍 Search destination or region...</option>
                    {regions.map((r) => (
                      <optgroup key={r.id} label={`${r.emoji} ${r.name}`} className="bg-slate-900">
                        {r.countries.map((c) => (
                          <option key={c.id} value={c.id} className="bg-slate-900">{c.emoji} {c.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="h-8 w-px bg-slate-700/50" />

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-700/30 text-slate-300 text-sm font-medium px-4 py-3 rounded-2xl border-0 focus:outline-none appearance-none cursor-pointer hover:bg-slate-700/50 transition-colors"
                >
                  <option value="price-low" className="bg-slate-900">Price ↑</option>
                  <option value="price-high" className="bg-slate-900">Price ↓</option>
                  <option value="data" className="bg-slate-900">Most Data</option>
                  <option value="duration" className="bg-slate-900">Longest</option>
                </select>
              </div>
            </div>
          </div>

          {/* ===== FILTER PILLS ===== */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {/* Duration */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">⏱️</span>
              <div className="flex gap-1.5">
                {DURATION_OPTIONS.map((opt) => (
                  <FilterChip
                    key={opt.value}
                    active={selectedDuration === opt.value}
                    onClick={() => setSelectedDuration(selectedDuration === opt.value ? null : opt.value)}
                  >
                    {opt.label}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="w-px h-6 bg-slate-700/50" />

            {/* Data */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">📶</span>
              <div className="flex gap-1.5">
                {DATA_OPTIONS.map((opt) => (
                  <FilterChip
                    key={opt.label}
                    active={selectedData?.label === opt.label}
                    onClick={() => setSelectedData(selectedData?.label === opt.label ? null : opt)}
                  >
                    {opt.label}
                  </FilterChip>
                ))}
              </div>
            </div>

            {hasFilters && (
              <>
                <div className="w-px h-6 bg-slate-700/50" />
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={clearFilters}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 px-3 py-2 rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reset
                </motion.button>
              </>
            )}
          </div>

          {/* ===== RESULTS BAR ===== */}
          <div className="flex items-center justify-between mb-6">
            <div>
              {loading ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <div className="animate-spin w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full" />
                  Finding best plans...
                </div>
              ) : (
                <p className="text-slate-400 text-sm">
                  <span className="text-white font-bold">{plans.length}</span> plans found
                  {selectedCountry && (
                    <span className="ml-2">
                      for <span className="text-sky-400 font-semibold">{regions.flatMap((r) => r.countries).find((c) => c.id === selectedCountry)?.emoji} {regions.flatMap((r) => r.countries).find((c) => c.id === selectedCountry)?.name}</span>
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* ===== PLANS GRID ===== */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded-3xl p-6 animate-pulse">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full mx-auto mb-4" />
                  <div className="h-5 bg-slate-700/50 rounded mb-2 mx-auto w-24" />
                  <div className="h-3 bg-slate-700/30 rounded mb-5 mx-auto w-16" />
                  <div className="flex justify-center gap-6 mb-5">
                    <div className="h-12 w-12 bg-slate-700/50 rounded" />
                    <div className="h-12 w-12 bg-slate-700/50 rounded" />
                  </div>
                  <div className="h-16 bg-slate-700/30 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 bg-slate-800/20 border border-slate-700/30 rounded-3xl"
            >
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-4xl">✈️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No plans found</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-8">
                We couldn&apos;t find plans matching your filters. Try adjusting your search.
              </p>
              <button onClick={clearFilters} className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold px-8 py-3 rounded-2xl hover:shadow-lg hover:shadow-sky-500/25 transition-all">
                Reset Filters
              </button>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence>
                {plans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}