"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";
import { PlanCard } from "./PlanCard";

interface Plan {
  id: string;
  name: string;
  slug: string | null;
  packageCode: string;
  destination: string;
  dataAmount: number;
  dataVolume: number;
  durationDays: number;
  priceUsd: number;
  retailPriceUsd: number;
  speed: string | null;
  networkType: string | null;
  dataType: number;
  coverageCount: number;
  countryId: string | null;
  countryName: string | null;
  locations: unknown;
  ipExport: string | null;
  supportTopUp: boolean;
  unusedValidTime: number;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
}

interface Region {
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

// Remove old PlanCard function - using imported PlanCard from PlanCard.tsx

export default function PlansPage() {
  const { t } = useI18n();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [countrySearchResults, setCountrySearchResults] = useState<{ id: string; code: string; name: string; emoji: string; regionName: string }[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCountryName, setSelectedCountryName] = useState("");
  const [sortBy, setSortBy] = useState("best");
  const [networkFilter, setNetworkFilter] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [dataType, setDataType] = useState("");
  const [dataFilter, setDataFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [dynamicDataOptions, setDynamicDataOptions] = useState<number[]>([]);
  const [dynamicDurationOptions, setDynamicDurationOptions] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/regions")
      .then((r) => r.json())
      .then((data) => setRegions(data.regions || []))
      .catch(console.error);
  }, []);

  // Fetch filters when country is selected
  useEffect(() => {
    if (selectedCountry) {
      fetch(`/api/countries/${selectedCountry}`)
        .then(r => r.json())
        .then(data => {
          setDynamicDataOptions(data.dataAmounts || []);
          setDynamicDurationOptions(data.durations || []);
        })
        .catch(console.error);
    } else {
      setDynamicDataOptions([]);
      setDynamicDurationOptions([]);
    }
  }, [selectedCountry]);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRegion && selectedRegion !== "all") params.set("regionId", selectedRegion);
      if (selectedCountry) params.set("countryId", selectedCountry);
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

      // Limit to 20 plans
      if (selectedCountry) {
        params.set("limit", "20");
      }

      const res = await fetch(`/api/plans?${params.toString()}`);
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err) {
      console.error("Fetch plans failed:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedCountry, networkFilter, priceRange, sortBy, dataType, dataFilter, durationFilter]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Search countries as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setCountrySearchResults([]);
      return;
    }
    
    const timer = setTimeout(() => {
      fetch(`/api/countries?q=${encodeURIComponent(searchQuery)}&limit=10`)
        .then(r => r.json())
        .then(data => {
          setCountrySearchResults(data.countries || []);
        })
        .catch(console.error);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCountrySelect(country: { id: string; code: string; name: string }) {
    setSelectedCountry(country.code);
    setSelectedCountryName(country.name);
    // Load filters immediately for the selected country
    fetch(`/api/countries/${country.code}`)
      .then(r => r.json())
      .then(data => {
        setDynamicDataOptions(data.dataAmounts || []);
        setDynamicDurationOptions(data.durations || []);
      })
      .catch(console.error);
    // Find region from country code
    const countryData = countrySearchResults.find(c => c.code === country.code);
    if (countryData) {
      fetch("/api/regions")
        .then(r => r.json())
        .then(data => {
          const region = data.regions?.find((r: Region) => r.countries?.some((c: { id: string }) => c.id === country.code));
          if (region) {
            setSelectedRegion(region.id);
          }
        })
        .catch(console.error);
    }
    setShowSearchDropdown(false);
    setSearchQuery("");
  }

  function clearFilters() {
    setDataFilter("");
    setDurationFilter("");
    setSortBy("best");
  }

  function clearAll() {
    setSelectedRegion("all");
    setSelectedCountry("");
    setSelectedCountryName("");
    setSearchQuery("");
    setNetworkFilter("");
    setPriceRange("");
    setDataType("");
    setDataFilter("");
    setDurationFilter("");
    setSortBy("best");
    setDynamicDataOptions([]);
    setDynamicDurationOptions([]);
  }

  const currentRegion = regions.find((r) => r.id === selectedRegion);
  const countries = currentRegion?.countries || [];
  const hasActiveFilters = selectedCountryName && (dataFilter || durationFilter || sortBy !== "best");

  return (
    <div className="min-h-screen bg-orange-50 text-slate-800">
      <main className="pt-20 sm:pt-28 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-2 sm:mb-3">{t("plans.title")}</h1>
            <p className="text-slate-600 text-sm sm:text-lg">{t("plans.subtitle")}</p>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">{plans.length} plans available</p>
          </div>

          {/* Simple Search Bar */}
          <div className="mb-6" ref={searchRef}>
            <div className="relative max-w-xl mx-auto">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                onFocus={() => setShowSearchDropdown(true)}
                onKeyDown={(e) => { if (e.key === "Enter") setShowSearchDropdown(false); }}
                placeholder="Search destination... (e.g. Japan, Thailand, Europe)"
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-800 text-base placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all shadow-lg"
              />
              
              <AnimatePresence>
                {showSearchDropdown && searchQuery.trim() && countrySearchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto"
                  >
                    {countrySearchResults.map((country) => (
                      <button
                        key={country.id}
                        onClick={() => handleCountrySelect(country)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
                      >
                        <span className="text-xl">{country.emoji}</span>
                        <div>
                          <p className="text-slate-800 font-medium">{country.name}</p>
                          <p className="text-slate-400 text-xs">{country.regionName}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Simple Filter Bar - Only show when country is selected */}
          {selectedCountryName && (
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {/* Duration Filter */}
              <select 
                value={durationFilter} 
                onChange={(e) => setDurationFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:border-orange-400 transition-colors"
              >
                <option value="">⏱️ Duration</option>
                {dynamicDurationOptions.map((dd) => (
                  <option key={dd} value={dd}>{dd} days</option>
                ))}
              </select>

              {/* Data Filter */}
              <select 
                value={dataFilter} 
                onChange={(e) => setDataFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:border-orange-400 transition-colors"
              >
                <option value="">📊 Data</option>
                {dynamicDataOptions.map((da) => (
                  <option key={da} value={da}>
                    {da === 999 ? "∞ Unlimited" : `${da}GB`}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:border-orange-400 transition-colors"
              >
                <option value="best">⚡ Best Match</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💰 Price: High to Low</option>
                <option value="data">📈 Most Data</option>
                <option value="duration">📅 Longest Duration</option>
              </select>

              {hasActiveFilters && (
                <button 
                  onClick={clearAll} 
                  className="text-sm text-slate-400 hover:text-orange-500 transition-colors"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          )}

          {/* Active Filter Display */}
          {selectedCountryName && (
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm">
                <span className="text-lg">📍</span>
                {selectedCountryName}
                <button onClick={clearAll} className="hover:text-orange-900">
                  ✕
                </button>
              </span>
            </div>
          )}

          {/* Region chips */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
            <button onClick={() => { setSelectedRegion("all"); setSelectedCountry(""); }}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedRegion === "all" && !selectedCountry ? "bg-orange-100 border-orange-300 text-orange-700" : "border-slate-200 text-slate-500 hover:border-orange-300"
              }`}>All</button>
            {regions.map((r) => (
              <button key={r.id} onClick={() => { setSelectedRegion(r.id); setSelectedCountry(""); }}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                  selectedRegion === r.id ? "bg-orange-100 border-orange-300 text-orange-700" : "border-slate-200 text-slate-500 hover:border-orange-300"
                }`}>{r.emoji} {r.name}</button>
            ))}
          </div>

          {/* Plans Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-slate-200">
                  <div className="h-5 bg-slate-200 rounded w-1/2 mb-4" />
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="h-14 bg-slate-200 rounded-xl" />
                    <div className="h-14 bg-slate-200 rounded-xl" />
                    <div className="h-14 bg-slate-200 rounded-xl" />
                  </div>
                  <div className="h-10 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <p className="text-4xl sm:text-5xl mb-4">📦</p>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">No plans found</h3>
              <p className="text-slate-500 text-sm mb-6">Try adjusting your filters or browse all regions</p>
              <button onClick={clearAll} className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 rounded-xl text-sm transition-colors">Clear Filters</button>
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