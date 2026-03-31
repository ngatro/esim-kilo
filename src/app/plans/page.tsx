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

function getTypeLabel(dataType: number): string {
  return dataType === 2 ? "Day Pass" : "Fixed";
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const isUnlimited = plan.dataAmount >= 999;
  const pricePerDay = (plan.priceUsd / plan.durationDays).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-sky-500/40 transition-all duration-300 hover:-translate-y-1"
    >
      {(plan.isBestSeller || plan.isHot || plan.isPopular) && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
          {plan.isBestSeller && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">BEST SELLER</span>
          )}
          {plan.isHot && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">HOT</span>
          )}
          {plan.isPopular && !plan.isBestSeller && (
            <span className="bg-gradient-to-r from-sky-500 to-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">POPULAR</span>
          )}
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{plan.country?.emoji || plan.region?.emoji || "🌍"}</span>
              <h3 className="text-lg font-semibold text-white">{plan.destination}</h3>
            </div>
            <p className="text-slate-500 text-xs">
              {plan.coverageCount} {plan.coverageCount > 1 ? "countries" : "country"} · {getTypeLabel(plan.dataType)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-sky-400">{isUnlimited ? "∞" : plan.dataAmount}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{isUnlimited ? "Unlimited" : "GB"}</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-white">{plan.durationDays}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Days</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-emerald-400">${pricePerDay}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">/Day</p>
          </div>
        </div>

        {plan.speed && (
          <div className="flex items-center gap-2 mb-5">
            <span className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium px-2.5 py-1 rounded-lg">{plan.speed}</span>
            {plan.supportTopUp && (
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-lg">Top-Up</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <div>
            <p className="text-2xl font-bold text-white">${plan.priceUsd.toFixed(2)}</p>
            <p className="text-[10px] text-slate-500">one-time payment</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/plans/${plan.id}`}>
              <motion.button
                className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white text-sm px-4 py-2.5 rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Details
              </motion.button>
            </Link>
            <Link href={`/checkout?planId=${plan.id}`}>
              <motion.button
                className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-sky-500/20"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Buy Now
              </motion.button>
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
  const [syncing, setSyncing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("best");
  const [networkFilter, setNetworkFilter] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRegion && selectedRegion !== "all") params.set("regionId", selectedRegion);
      if (selectedCountry) params.set("countryId", selectedCountry);
      if (searchQuery) params.set("search", searchQuery);
      if (networkFilter) params.set("networkType", networkFilter);
      if (sortBy) params.set("sortBy", sortBy);
      if (priceRange) {
        const [min, max] = priceRange.split("-");
        if (min) params.set("minPrice", min);
        if (max) params.set("maxPrice", max);
      }

      const res = await fetch(`/api/plans?${params.toString()}`);
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedCountry, searchQuery, networkFilter, sortBy, priceRange]);

  useEffect(() => {
    fetch("/api/regions")
      .then((r) => r.json())
      .then((data) => setRegions(data.regions || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  async function syncPlans() {
    setSyncing(true);
    try {
      const res = await fetch("/api/plans?sync=true");
      const data = await res.json();
      if (data.success) {
        await fetchPlans();
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  }

  const currentRegion = regions.find((r) => r.id === selectedRegion);
  const countries = currentRegion?.countries || [];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-3">{t("plans.title")}</h1>
            <p className="text-slate-400 text-lg">{t("plans.subtitle")}</p>
            <p className="text-slate-500 text-sm mt-1">{plans.length} plans available</p>
          </div>

          {/* Filters */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 mb-8">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Japan, Europe, Global..."
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="min-w-[160px]">
                <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => { setSelectedRegion(e.target.value); setSelectedCountry(""); }}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500"
                >
                  <option value="all">All Regions</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.emoji} {r.name}</option>
                  ))}
                </select>
              </div>

              {countries.length > 0 && (
                <div className="min-w-[160px]">
                  <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500"
                  >
                    <option value="">All Countries</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="min-w-[140px]">
                <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Network</label>
                <select
                  value={networkFilter}
                  onChange={(e) => setNetworkFilter(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500"
                >
                  <option value="">All</option>
                  <option value="5G">5G</option>
                  <option value="4G">4G LTE</option>
                  <option value="3G">3G</option>
                </select>
              </div>

              <div className="min-w-[140px]">
                <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Price</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500"
                >
                  <option value="">Any Price</option>
                  <option value="0-10">Under $10</option>
                  <option value="10-20">$10 - $20</option>
                  <option value="20-50">$20 - $50</option>
                  <option value="50-999">$50+</option>
                </select>
              </div>

              <div className="min-w-[140px]">
                <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500"
                >
                  <option value="best">Best Match</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="data">Most Data</option>
                  <option value="duration">Longest Duration</option>
                </select>
              </div>
            </div>
          </div>

          {/* Region Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => { setSelectedRegion("all"); setSelectedCountry(""); }}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedRegion === "all" ? "bg-sky-500/20 border-sky-500/40 text-sky-400" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}
            >
              All
            </button>
            {regions.map((r) => (
              <button
                key={r.id}
                onClick={() => { setSelectedRegion(r.id); setSelectedCountry(""); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedRegion === r.id ? "bg-sky-500/20 border-sky-500/40 text-sky-400" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}
              >
                {r.emoji} {r.name} ({r._count?.plans || 0})
              </button>
            ))}
          </div>

          {/* Plans Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-800/50 rounded-2xl p-6 animate-pulse">
                  <div className="h-6 bg-slate-700 rounded mb-4 w-1/2" />
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="h-14 bg-slate-700 rounded-xl" />
                    <div className="h-14 bg-slate-700 rounded-xl" />
                    <div className="h-14 bg-slate-700 rounded-xl" />
                  </div>
                  <div className="h-10 bg-slate-700 rounded-xl" />
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">📦</p>
              <h3 className="text-xl font-semibold text-white mb-2">No plans found</h3>
              <p className="text-slate-400 mb-6">Try adjusting your filters or sync plans from eSIM Access</p>
              <button
                onClick={syncPlans}
                disabled={syncing}
                className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                {syncing ? "Syncing..." : "Sync Plans Now"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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