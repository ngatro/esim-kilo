"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";

interface Plan {
  id: string;
  name: string;
  slug: string | null;
  packageCode: string;
  destination: string;
  dataAmount: number;
  durationDays: number;
  priceUsd: number;
  retailPriceUsd: number;
  speed: string | null;
  networkType: string | null;
  dataType: number;
  coverageCount: number;
  locationCode: string | null;
  locations: unknown;
  ipExport: string | null;
  smsStatus: number;
  supportTopUp: boolean;
  unusedValidTime: number;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
  regionId: string | null;
  regionName: string | null;
  countryId: string | null;
  countryName: string | null;
}

interface Region {
  id: string;
  name: string;
  emoji: string;
  countries: { id: string; name: string; emoji: string }[];
  _count?: { plans: number };
}

function formatData(gb: number): string {
  if (gb >= 999) return "Unlimited";
  if (gb < 1) return `${Math.round(gb * 1024)}MB`;
  return `${gb}GB`;
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const { formatPrice } = useI18n();
  const isUnlimited = plan.dataAmount >= 999;
  const displayPrice = (plan.retailPriceUsd && plan.retailPriceUsd > 0) ? plan.retailPriceUsd : plan.priceUsd;
  const pricePerDay = formatPrice(displayPrice / plan.durationDays);
  const locations = Array.isArray(plan.locations) ? plan.locations : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="group relative bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-sky-500/40 transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Badges */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        {plan.isBestSeller && (
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
            BEST SELLER
          </span>
        )}
        {plan.isHot && (
          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
            HOT
          </span>
        )}
        {plan.isPopular && !plan.isBestSeller && (
          <span className="bg-gradient-to-r from-sky-500 to-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
            POPULAR
          </span>
        )}
        {plan.badge && !plan.isBestSeller && !plan.isHot && (
          <span className="bg-slate-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {plan.badge}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl sm:text-2xl">{plan.countryId ? "🏳️" : plan.coverageCount > 1 ? "🌍" : "📱"}</span>
            <h3 className="text-base sm:text-lg font-semibold text-white truncate">{plan.destination}</h3>
          </div>
          <p className="text-slate-500 text-xs">
            {plan.coverageCount > 1 ? `${plan.coverageCount} countries` : plan.countryName || plan.destination}
            {plan.speed && ` · ${plan.speed}`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-900/60 rounded-xl p-2.5 text-center">
            <p className="text-lg sm:text-xl font-bold text-sky-400">{isUnlimited ? "∞" : plan.dataAmount}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider">{isUnlimited ? "Unlimited" : "GB"}</p>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-2.5 text-center">
            <p className="text-lg sm:text-xl font-bold text-white">{plan.durationDays}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider">Days</p>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-2.5 text-center">
            <p className="text-lg sm:text-xl font-bold text-emerald-400">${pricePerDay}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider">/Day</p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-1.5 mb-4 flex-1">
          {plan.supportTopUp && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Supports Top-Up
            </div>
          )}
          {plan.ipExport && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              IP: {plan.ipExport}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Instant Activation
          </div>
          {plan.unusedValidTime > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Valid {plan.unusedValidTime} days after purchase
            </div>
          )}
        </div>

        {/* Countries preview */}
        {locations.length > 1 && (
          <div className="mb-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Coverage</p>
            <div className="flex flex-wrap gap-1">
              {(locations as string[]).slice(0, 6).map((loc) => (
                <span key={loc} className="bg-slate-700/50 text-slate-400 text-[10px] px-1.5 py-0.5 rounded">
                  {loc}
                </span>
              ))}
              {locations.length > 6 && (
                <span className="text-slate-500 text-[10px]">+{locations.length - 6} more</span>
              )}
            </div>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50 mt-auto">
          <div>
            <p className="text-xl sm:text-2xl font-bold text-white">{formatPrice(displayPrice)}</p>
            <p className="text-[10px] text-slate-500">one-time</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/plans/${plan.slug || plan.id}`}>
              <button className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl transition-colors">
                Details
              </button>
            </Link>
            <Link href={`/checkout?planId=${plan.id}`}>
              <motion.button
                className="bg-sky-500 hover:bg-sky-400 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-xl transition-colors shadow-lg shadow-sky-500/20"
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
  const { t } = useI18n();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Region[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [sortBy, setSortBy] = useState("best");
  const [networkFilter, setNetworkFilter] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [dataType, setDataType] = useState("");
  const [dataFilter, setDataFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/regions")
      .then((r) => r.json())
      .then((data) => setRegions(data.regions || []))
      .catch(console.error);
  }, []);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRegion && selectedRegion !== "all") params.set("regionId", selectedRegion);
      if (selectedCountry) params.set("countryId", selectedCountry);
      if (searchQuery) params.set("search", searchQuery);
      if (networkFilter) params.set("networkType", networkFilter);
      if (dataType) params.set("dataType", dataType);
      if (dataFilter) params.set("dataAmount", dataFilter);
      if (durationFilter) params.set("durationDays", durationFilter);
      if (sortBy) params.set("sortBy", sortBy);

      if (priceRange) {
        const [min, max] = priceRange.split("-");
        if (min) params.set("minPrice", min);
        if (max) params.set("maxPrice", max);
      }

      const res = await fetch(`/api/plans?${params.toString()}`);
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err) {
      console.error("Fetch plans failed:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedCountry, searchQuery, networkFilter, priceRange, sortBy, dataType, dataFilter, durationFilter]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matched = regions
      .map((r) => {
        const regionMatch = r.name.toLowerCase().includes(q);
        const matchedCountries = r.countries.filter(
          (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
        );
        if (regionMatch || matchedCountries.length > 0) {
          return {
            ...r,
            countries: regionMatch ? r.countries : matchedCountries,
          };
        }
        return null;
      })
      .filter(Boolean) as Region[];
    setSearchResults(matched);
  }, [searchQuery, regions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSelect(regionId?: string, countryId?: string) {
    if (countryId) {
      setSelectedRegion(regionId || "all");
      setSelectedCountry(countryId);
    } else if (regionId) {
      setSelectedRegion(regionId);
      setSelectedCountry("");
    }
    setShowSearchDropdown(false);
  }

  function handleSearchSubmit() {
    setShowSearchDropdown(false);
    fetchPlans();
  }

  function clearFilters() {
    setSelectedRegion("all");
    setSelectedCountry("");
    setSearchQuery("");
    setNetworkFilter("");
    setPriceRange("");
    setSortBy("best");
    setDataType("");
    setDataFilter("");
    setDurationFilter("");
  }

  const currentRegion = regions.find((r) => r.id === selectedRegion);
  const countries = currentRegion?.countries || [];
  const hasActiveFilters = selectedRegion !== "all" || selectedCountry || searchQuery || networkFilter || priceRange || dataType || dataFilter || durationFilter;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="pt-20 sm:pt-28 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">{t("plans.title")}</h1>
            <p className="text-slate-400 text-sm sm:text-lg">{t("plans.subtitle")}</p>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">{plans.length} plans available</p>
          </div>

          {/* Smart Search */}
          <div className="mb-4 sm:mb-6" ref={searchRef}>
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                    onFocus={() => setShowSearchDropdown(true)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                    placeholder="Search country or region... (e.g. Japan, Europe, US)"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`sm:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                    showFilters || hasActiveFilters ? "bg-sky-500/20 border-sky-500/40 text-sky-400" : "bg-slate-800/60 border-slate-700 text-slate-400"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {hasActiveFilters && <span className="w-2 h-2 bg-sky-400 rounded-full" />}
                </button>
              </div>

              <AnimatePresence>
                {showSearchDropdown && searchQuery.trim() && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto"
                  >
                    {searchResults.map((region) => (
                      <div key={region.id}>
                        <button
                          onClick={() => handleSearchSelect(region.id)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/50 transition-colors text-left"
                        >
                          <span className="text-lg">{region.emoji}</span>
                          <div>
                            <p className="text-white text-sm font-medium">{region.name}</p>
                            <p className="text-slate-500 text-xs">{region.countries.length} countries</p>
                          </div>
                        </button>
                        {region.countries.length > 0 && region.countries.length <= 15 && (
                          <div className="pl-8 border-l-2 border-slate-700 ml-4">
                            {region.countries.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => handleSearchSelect(region.id, c.id)}
                                className="w-full flex items-center gap-2 px-4 py-1.5 hover:bg-slate-700/50 transition-colors text-left"
                              >
                                <span className="text-sm">{c.emoji}</span>
                                <span className="text-slate-300 text-sm">{c.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden sm:block bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 mb-6">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="min-w-[160px]">
                <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Region</label>
                <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setSelectedCountry(""); }}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors">
                  <option value="all">All Regions</option>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.emoji} {r.name}</option>)}
                </select>
              </div>

              {countries.length > 0 && (
                <div className="min-w-[160px]">
                  <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Country</label>
                  <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors">
                    <option value="">All Countries</option>
                    {countries.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
              )}

              <div className="min-w-[130px]">
                <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Network</label>
                <select value={networkFilter} onChange={(e) => setNetworkFilter(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors">
                  <option value="">All</option><option value="5G">5G</option><option value="4G">4G</option><option value="3G">3G</option>
                </select>
              </div>

              <div className="min-w-[130px]">
                <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Price</label>
                <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors">
                  <option value="">Any</option><option value="0-5">Under $5</option><option value="5-15">$5-$15</option>
                  <option value="15-30">$15-$30</option><option value="30-100">$30-$100</option><option value="100-999">$100+</option>
                </select>
              </div>

              <div className="min-w-[130px]">
                <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Type</label>
                <select value={dataType} onChange={(e) => setDataType(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors">
                  <option value="">All</option><option value="1">Fixed Data</option><option value="2">Day Pass</option>
                </select>
              </div>

              <div className="min-w-[130px]">
                <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Data</label>
                <select value={dataFilter} onChange={(e) => setDataFilter(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors">
                  <option value="">Any</option>
                  <option value="1">1GB</option>
                  <option value="3">3GB</option>
                  <option value="5">5GB</option>
                  <option value="10">10GB</option>
                  <option value="20">20GB</option>
                  <option value="999">Unlimited</option>
                </select>
              </div>

              <div className="min-w-[130px]">
                <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Duration</label>
                <select value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors">
                  <option value="">Any</option>
                  <option value="7">7 days</option>
                  <option value="15">15 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">365 days</option>
                </select>
              </div>

              <div className="min-w-[130px]">
                <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Sort</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors">
                  <option value="best">Best Match</option><option value="price-low">Price ↑</option>
                  <option value="price-high">Price ↓</option><option value="data">Most Data</option><option value="duration">Duration</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-white underline underline-offset-2 transition-colors">
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="sm:hidden bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 mb-4 overflow-hidden">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Region</label>
                    <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setSelectedCountry(""); }}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500">
                      <option value="all">All Regions</option>
                      {regions.map((r) => <option key={r.id} value={r.id}>{r.emoji} {r.name}</option>)}
                    </select>
                  </div>
                  {countries.length > 0 && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Country</label>
                      <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500">
                        <option value="">All Countries</option>
                        {countries.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Network</label>
                      <select value={networkFilter} onChange={(e) => setNetworkFilter(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500">
                        <option value="">All</option><option value="5G">5G</option><option value="4G">4G</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Price</label>
                      <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500">
                        <option value="">Any</option><option value="0-5">Under $5</option><option value="5-15">$5-$15</option>
                        <option value="15-30">$15-$30</option><option value="30-100">$30-$100</option><option value="100-999">$100+</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Type</label>
                      <select value={dataType} onChange={(e) => setDataType(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500">
                        <option value="">All</option><option value="1">Fixed</option><option value="2">Day Pass</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Sort</label>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500">
                        <option value="best">Best</option><option value="price-low">Price ↑</option>
                        <option value="price-high">Price ↓</option><option value="data">Data</option><option value="duration">Duration</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Data</label>
                      <select value={dataFilter} onChange={(e) => setDataFilter(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500">
                        <option value="">Any</option>
                        <option value="1">1GB</option>
                        <option value="3">3GB</option>
                        <option value="5">5GB</option>
                        <option value="10">10GB</option>
                        <option value="999">Unlimited</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Duration</label>
                      <select value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500">
                        <option value="">Any</option>
                        <option value="7">7 days</option>
                        <option value="15">15 days</option>
                        <option value="30">30 days</option>
                        <option value="90">90 days</option>
                      </select>
                    </div>
                  </div>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="w-full text-sm text-sky-400 hover:text-sky-300 py-2">Clear all filters</button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Region chips */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button onClick={() => { setSelectedRegion("all"); setSelectedCountry(""); }}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedRegion === "all" && !selectedCountry ? "bg-sky-500/20 border-sky-500/40 text-sky-400" : "border-slate-700 text-slate-400 hover:border-slate-500"
              }`}>All</button>
            {regions.map((r) => (
              <button key={r.id} onClick={() => { setSelectedRegion(r.id); setSelectedCountry(""); }}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                  selectedRegion === r.id ? "bg-sky-500/20 border-sky-500/40 text-sky-400" : "border-slate-700 text-slate-400 hover:border-slate-500"
                }`}>{r.emoji} {r.name}</button>
            ))}
          </div>

          {/* Plans Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-800/50 rounded-2xl p-5 animate-pulse">
                  <div className="h-5 bg-slate-700 rounded w-1/2 mb-4" />
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="h-14 bg-slate-700 rounded-xl" />
                    <div className="h-14 bg-slate-700 rounded-xl" />
                    <div className="h-14 bg-slate-700 rounded-xl" />
                  </div>
                  <div className="h-10 bg-slate-700 rounded-xl" />
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <p className="text-4xl sm:text-5xl mb-4">📦</p>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No plans found</h3>
              <p className="text-slate-400 text-sm mb-6">Try adjusting your filters or browse all regions</p>
              <button onClick={clearFilters} className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2.5 rounded-xl text-sm transition-colors">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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