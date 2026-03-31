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
  { label: "3D", value: 3 },
  { label: "7D", value: 7 },
  { label: "15D", value: 15 },
  { label: "30D", value: 30 },
  { label: "60D", value: 60 },
  { label: "90D", value: 90 },
];

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const isUnlimited = plan.dataAmount >= 999;
  const pricePerDay = (plan.priceUsd / plan.durationDays).toFixed(2);
  const locations = Array.isArray(plan.locations) ? plan.locations as string[] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group relative bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-sky-500/30 hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/5"
    >
      {/* Badge */}
      {plan.isBestSeller && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold text-center py-1 tracking-wider">
          ⭐ BEST SELLER
        </div>
      )}
      {plan.isHot && !plan.isBestSeller && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold text-center py-1 tracking-wider">
          🔥 HOT DEAL
        </div>
      )}
      {plan.isPopular && !plan.isBestSeller && !plan.isHot && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-sky-500 to-blue-500 text-white text-[10px] font-bold text-center py-1 tracking-wider">
          👑 POPULAR
        </div>
      )}

      <div className={`p-5 ${(plan.isBestSeller || plan.isHot || plan.isPopular) ? "pt-8" : ""}`}>
        {/* Destination */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center text-2xl">
            {plan.country?.emoji || plan.region?.emoji || "🌍"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate">{plan.destination}</h3>
            <p className="text-xs text-slate-500">
              {plan.coverageCount > 1 ? `${plan.coverageCount} countries` : plan.packageCode}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-slate-900/50 rounded-xl py-2.5 text-center">
            <p className="text-lg font-bold text-sky-400">{isUnlimited ? "∞" : `${plan.dataAmount}`}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">{isUnlimited ? "Unlimited" : "GB"}</p>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-xl py-2.5 text-center">
            <p className="text-lg font-bold text-white">{plan.durationDays}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">Days</p>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-xl py-2.5 text-center">
            <p className="text-lg font-bold text-emerald-400">${pricePerDay}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider">/Day</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {plan.speed && (
            <span className="bg-sky-500/10 text-sky-400 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-sky-500/20">
              {plan.speed}
            </span>
          )}
          {plan.supportTopUp && (
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-500/20">
              Top-Up
            </span>
          )}
          {plan.ipExport && (
            <span className="bg-orange-500/10 text-orange-400 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-orange-500/20">
              IP: {plan.ipExport}
            </span>
          )}
        </div>

        {/* Countries preview */}
        {locations.length > 1 && (
          <p className="text-[10px] text-slate-600 mb-4 truncate">
            {locations.join(", ")}
          </p>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          <div>
            <p className="text-2xl font-bold text-white">${plan.priceUsd.toFixed(2)}</p>
            <p className="text-[10px] text-slate-500">one-time</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/plans/${plan.id}`}>
              <button className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white text-sm px-4 py-2.5 rounded-xl transition-colors">
                Details
              </button>
            </Link>
            <Link href={`/checkout?planId=${plan.id}`}>
              <motion.button
                className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-sky-500/20"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Buy
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
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

  const currentRegion = regions.find((r) => r.id === selectedRegion);
  const countries = currentRegion?.countries || [];

  function clearFilters() {
    setSelectedRegion("all");
    setSelectedCountry("");
    setSelectedDuration(null);
    setSelectedData(null);
    setSortBy("price-low");
  }

  const hasFilters = selectedRegion !== "all" || selectedCountry || selectedDuration || selectedData;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Find Your Perfect <span className="text-sky-400">eSIM</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Choose your destination, pick your data plan, stay connected in 190+ countries
            </p>
          </div>

          {/* ===== FILTER PANEL ===== */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 mb-8 backdrop-blur-sm">
            
            {/* Row 1: Destination + Sort */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {/* Destination */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  📍 Where are you traveling?
                </label>
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
                      const parentRegion = regions.find((r) => r.countries.some((c) => c.id === val));
                      setSelectedRegion(parentRegion?.id || "all");
                    }
                  }}
                  className="w-full bg-slate-900/60 border border-slate-600 rounded-xl px-4 py-3.5 text-white text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all"
                >
                  <option value="all">🌍 All Destinations</option>
                  {regions.map((r) => (
                    <optgroup key={r.id} label={`${r.emoji} ${r.name}`}>
                      {r.countries.map((c) => (
                        <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-600 rounded-xl px-4 py-3.5 text-white text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all"
                >
                  <option value="price-low">💰 Price: Low → High</option>
                  <option value="price-high">💰 Price: High → Low</option>
                  <option value="data">📊 Most Data</option>
                  <option value="duration">📅 Longest Duration</option>
                </select>
              </div>
            </div>

            {/* Row 2: Duration pills */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">
                ⏱️ Duration
              </label>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.value}
                    onClick={() => setSelectedDuration(selectedDuration === opt.value ? null : opt.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                      selectedDuration === opt.value
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                        : "bg-slate-700/40 text-slate-300 hover:bg-slate-700/70 border border-slate-600/50"
                    }`}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Row 3: Data pills */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">
                📶 Data Amount
              </label>
              <div className="flex flex-wrap gap-2">
                {DATA_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.label}
                    onClick={() => setSelectedData(selectedData?.label === opt.label ? null : opt)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                      selectedData?.label === opt.label
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                        : "bg-slate-700/40 text-slate-300 hover:bg-slate-700/70 border border-slate-600/50"
                    }`}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Active filters */}
            {hasFilters && (
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-700/50">
                <span className="text-xs text-slate-500">Filters:</span>
                {selectedCountry && (
                  <button onClick={() => { setSelectedCountry(""); setSelectedRegion("all"); }} className="bg-sky-500/20 text-sky-400 text-xs px-2.5 py-1 rounded-full hover:bg-sky-500/30 transition-colors">
                    {regions.flatMap((r) => r.countries).find((c) => c.id === selectedCountry)?.emoji} {selectedCountry} ×
                  </button>
                )}
                {selectedRegion !== "all" && !selectedCountry && (
                  <button onClick={() => setSelectedRegion("all")} className="bg-sky-500/20 text-sky-400 text-xs px-2.5 py-1 rounded-full hover:bg-sky-500/30 transition-colors">
                    {regions.find((r) => r.id === selectedRegion)?.emoji} {selectedRegion} ×
                  </button>
                )}
                {selectedDuration && (
                  <button onClick={() => setSelectedDuration(null)} className="bg-sky-500/20 text-sky-400 text-xs px-2.5 py-1 rounded-full hover:bg-sky-500/30 transition-colors">
                    {selectedDuration} days ×
                  </button>
                )}
                {selectedData && (
                  <button onClick={() => setSelectedData(null)} className="bg-sky-500/20 text-sky-400 text-xs px-2.5 py-1 rounded-full hover:bg-sky-500/30 transition-colors">
                    {selectedData.label} ×
                  </button>
                )}
                <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 font-medium ml-2">
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-400">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full" />
                  Loading...
                </span>
              ) : (
                <span>{plans.length} plan{plans.length !== 1 ? "s" : ""} available</span>
              )}
            </p>
            {countries.length > 0 && selectedRegion !== "all" && (
              <div className="flex flex-wrap gap-1.5">
                {countries.slice(0, 8).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCountry(selectedCountry === c.id ? "" : c.id)}
                    className={`text-xs px-2 py-1 rounded-lg transition-all ${
                      selectedCountry === c.id
                        ? "bg-sky-500/30 text-sky-300 border border-sky-500/50"
                        : "bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50"
                    }`}
                  >
                    {c.emoji} {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-slate-800/50 rounded-2xl p-5 animate-pulse border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-5 bg-slate-700 rounded mb-2 w-2/3" />
                      <div className="h-3 bg-slate-700 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 h-14 bg-slate-700 rounded-xl" />
                    <div className="flex-1 h-14 bg-slate-700 rounded-xl" />
                    <div className="flex-1 h-14 bg-slate-700 rounded-xl" />
                  </div>
                  <div className="h-12 bg-slate-700 rounded-xl" />
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <p className="text-5xl mb-4">✈️</p>
              <h3 className="text-xl font-bold text-white mb-2">No plans match your search</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Try a different destination, duration, or data amount to find your perfect eSIM
              </p>
              <button onClick={clearFilters} className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence>
                {plans.map((plan, index) => (
                  <PlanCard key={plan.id} plan={plan} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}