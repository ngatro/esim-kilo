"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";

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

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const isUnlimited = plan.dataAmount >= 999;
  const pricePerDay = (plan.priceUsd / plan.durationDays).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Badges */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        {plan.isBestSeller && (
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
            BEST SELLER
          </span>
        )}
        {plan.isHot && (
          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
            HOT DEAL
          </span>
        )}
        {plan.isPopular && !plan.isBestSeller && (
          <span className="bg-gradient-to-r from-sky-500 to-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
            POPULAR
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">{plan.country?.emoji || plan.region?.emoji || "🌍"}</span>
            <div>
              <h3 className="text-base font-bold text-slate-900">{plan.destination}</h3>
              <p className="text-xs text-slate-500">
                {plan.coverageCount > 1 ? `${plan.coverageCount} countries` : "1 country"}
              </p>
            </div>
          </div>
        </div>

        {/* Data / Duration / Speed */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-sky-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-sky-600">{isUnlimited ? "∞" : plan.dataAmount}</p>
            <p className="text-[10px] text-sky-500 uppercase font-medium">{isUnlimited ? "Unlimited" : "GB"}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-slate-700">{plan.durationDays}</p>
            <p className="text-[10px] text-slate-500 uppercase font-medium">Days</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-slate-700">{plan.speed || "4G"}</p>
            <p className="text-[10px] text-slate-500 uppercase font-medium">Network</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {plan.supportTopUp && (
            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">Top-Up</span>
          )}
          {plan.dataType === 2 && (
            <span className="bg-purple-50 text-purple-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">Day Pass</span>
          )}
          {plan.speed?.includes("5G") && (
            <span className="bg-blue-50 text-blue-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">5G</span>
          )}
          {plan.ipExport && (
            <span className="bg-orange-50 text-orange-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">IP: {plan.ipExport}</span>
          )}
        </div>

        {/* Price + Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <p className="text-xl font-bold text-slate-900">${plan.priceUsd.toFixed(2)}</p>
            <p className="text-[10px] text-slate-400">${pricePerDay}/day</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/plans/${plan.id}`}>
              <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm px-4 py-2 rounded-xl transition-colors font-medium">
                Details
              </button>
            </Link>
            <Link href={`/checkout?planId=${plan.id}`}>
              <button className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-md shadow-sky-200">
                Buy
              </button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PlansPage() {
  const { t } = useI18n();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
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

      // Client-side filter for duration
      if (selectedDuration) {
        filtered = filtered.filter((p: Plan) => p.durationDays === selectedDuration);
      }

      // Client-side filter for data
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

  const hasActiveFilters = selectedRegion !== "all" || selectedCountry || selectedDuration || selectedData;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{t("plans.title")}</h1>
            <p className="text-slate-500 text-lg">{t("plans.subtitle")}</p>
          </div>

          {/* ===== FILTER BAR ===== */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* 1. Destination */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                  Where are you going?
                </label>
                <select
                  value={selectedCountry || selectedRegion}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Check if it's a country or region
                    const isRegion = regions.some((r) => r.id === val);
                    if (isRegion) {
                      setSelectedRegion(val);
                      setSelectedCountry("");
                    } else {
                      setSelectedCountry(val);
                      setSelectedRegion(regions.find((r) =>
                        r.countries.some((c) => c.id === val)
                      )?.id || "all");
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
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

              {/* 2. Duration */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                  How long?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedDuration(selectedDuration === opt.value ? null : opt.value)}
                      className={`text-xs px-3 py-2 rounded-lg font-medium transition-all ${
                        selectedDuration === opt.value
                          ? "bg-sky-500 text-white shadow-md shadow-sky-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Data */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                  How much data?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DATA_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedData(selectedData?.label === opt.label ? null : opt.label === "Unlimited" ? null : opt)}
                      className={`text-xs px-3 py-2 rounded-lg font-medium transition-all ${
                        selectedData?.label === opt.label
                          ? "bg-sky-500 text-white shadow-md shadow-sky-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Sort */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                >
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="data">Most Data</option>
                  <option value="duration">Longest Duration</option>
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500">Active filters:</span>
                {selectedCountry && (
                  <button onClick={() => setSelectedCountry("")} className="bg-sky-50 text-sky-600 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-sky-100 transition-colors">
                    {regions.flatMap((r) => r.countries).find((c) => c.id === selectedCountry)?.emoji} {selectedCountry} ×
                  </button>
                )}
                {selectedDuration && (
                  <button onClick={() => setSelectedDuration(null)} className="bg-sky-50 text-sky-600 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-sky-100 transition-colors">
                    {selectedDuration} days ×
                  </button>
                )}
                {selectedData && (
                  <button onClick={() => setSelectedData(null)} className="bg-sky-50 text-sky-600 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-sky-100 transition-colors">
                    {selectedData.label} ×
                  </button>
                )}
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-medium ml-2">
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              {loading ? "Loading..." : `${plans.length} plan${plans.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {/* Plans Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-slate-200">
                  <div className="h-6 bg-slate-200 rounded mb-3 w-1/2" />
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="h-12 bg-slate-100 rounded-xl" />
                    <div className="h-12 bg-slate-100 rounded-xl" />
                    <div className="h-12 bg-slate-100 rounded-xl" />
                  </div>
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No plans found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your filters to find the perfect eSIM plan</p>
              <button onClick={clearFilters} className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                Clear Filters
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