"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";
import Image from "next/image";

interface Plan {
  id: string;
  name: string;
  slug: string | null;
  packageCode: string;
  destination: string;
  dataVolume: number;
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

interface CountrySearchResult {
  id: string;
  name: string;
  emoji: string;
  regionId: string | null;
  regionName: string | null;
  regionEmoji: string;
  planCount: number;
}

function formatVolume(bytes: number): string {
  if (bytes === 0) return "0";
  
  const k = 1024;
  const dm = 1;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const { formatPrice } = useI18n();
  const isUnlimited = plan.badge === "Unlimited";
  const displayPrice = (plan.retailPriceUsd && plan.retailPriceUsd > 0) 
  ? plan.retailPriceUsd 
  : (plan.priceUsd * 2);
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
          <span className="bg-orange-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-md shadow-lg border border-red-700 animate-pulse uppercase tracking-wider">
          🔥 {plan.badge}
        </span>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="relative w-10 h-10 min-w-[40px] overflow-hidden rounded-lg ">
              {/* @ts-ignore */}
              {plan.locationNetworkList && (typeof plan.locationNetworkList === 'string' ? JSON.parse(plan.locationNetworkList) : plan.locationNetworkList)?.[0]?.locationLogo ? (
                <Image
                  /* @ts-ignore */
                  src={`https://p.qrsim.net${(typeof plan.locationNetworkList === 'string' ? JSON.parse(plan.locationNetworkList) : plan.locationNetworkList)[0].locationLogo}`} 
                  alt="flag"
                  fill
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://p.qrsim.net/img/flags/default.png" }}
                />
              ) : (
                <span className="text-2xl">{plan.coverageCount > 1 ? "🌍" : "📱"}</span>
              )}
            </div>
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
            <p className="text-lg sm:text-xl font-bold text-cyan-400">{isUnlimited ? `${formatVolume(plan.dataVolume)}` : formatVolume(plan.dataVolume)}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider">{isUnlimited ? "High Speed" : "High Speed"}</p>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-2.5 text-center">
            <p className="text-lg sm:text-xl font-bold text-cyan-400">{plan.durationDays}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider">Days</p>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-2.5 text-center">
            <p className="text-lg sm:text-xl font-bold text-cyan-400">{pricePerDay}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider">/Day</p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-1.5 mb-4 flex-1">
          {plan.supportTopUp && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Supports Top-Up
            </div>
          )}
          {plan.ipExport && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              IP: {plan.ipExport}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Instant Activation
          </div>
          {plan.unusedValidTime > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
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
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CountrySearchResult[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Selected country for filtering
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [selectedCountryName, setSelectedCountryName] = useState<string>("");

  // Dynamic filters based on selected country
  const [availableDataAmounts, setAvailableDataAmounts] = useState<number[]>([]);
  const [availableDurations, setAvailableDurations] = useState<number[]>([]);
  const [selectedDataAmount, setSelectedDataAmount] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");

  // Fetch country filters when a country is selected
  useEffect(() => {
    if (!selectedCountryId) {
      setAvailableDataAmounts([]);
      setAvailableDurations([]);
      return;
    }

    fetch(`/api/countries/${selectedCountryId}/filters`)
      .then((r) => r.json())
      .then((data) => {
        if (data.filters) {
          setAvailableDataAmounts(data.filters.dataAmounts || []);
          setAvailableDurations(data.filters.durations || []);
        }
      })
      .catch(console.error);
  }, [selectedCountryId]);

  // Fetch plans based on selected country and filters
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCountryId) params.set("countryId", selectedCountryId);
      if (selectedDataAmount) params.set("dataAmount", selectedDataAmount);
      if (selectedDuration) params.set("durationDays", selectedDuration);

      // Fetch all plans for selected country (no limit)
      params.set("limit", "100");

      const res = await fetch(`/api/plans?${params.toString()}`);
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err) {
      console.error("Fetch plans failed:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCountryId, selectedDataAmount, selectedDuration]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for countries as user types (debounced)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/countries/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
        const data = await res.json();
        setSearchResults(data.countries || []);
      } catch (err) {
        console.error("Search countries failed:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  function handleCountrySelect(country: CountrySearchResult) {
    setSelectedCountryId(country.id);
    setSelectedCountryName(country.name);
    setSearchQuery(country.name);
    setShowSearchDropdown(false);
    setSelectedDataAmount("");
    setSelectedDuration("");
  }

  function clearFilters() {
    setSelectedCountryId("");
    setSelectedCountryName("");
    setSearchQuery("");
    setSelectedDataAmount("");
    setSelectedDuration("");
    setAvailableDataAmounts([]);
    setAvailableDurations([]);
  }

  // Helper to format data amount for display
  const formatDataOption = (amount: number): string => {
    if (amount >= 999) return "Unlimited";
    return `${amount}GB`;
  };

  const hasActiveFilters = selectedCountryId || selectedDataAmount || selectedDuration;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main className="pt-20 sm:pt-28 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-10">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">{t("plans.title")}</h1>
            <p className="text-slate-400 text-sm sm:text-lg">{t("plans.subtitle")}</p>
            {selectedCountryName && (
              <p className="text-sky-400 text-sm sm:text-lg mt-1">📍 {selectedCountryName}</p>
            )}
          </div>

          {/* Search with Autocomplete */}
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
                    placeholder="Search country... (e.g. Japan, Vietnam, USA)"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {selectedCountryId && !searchLoading && (
                    <button
                      onClick={clearFilters}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                      title="Clear selection"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Search Dropdown */}
              <AnimatePresence>
                {showSearchDropdown && searchQuery.trim() && (searchResults.length > 0 || searchLoading) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto"
                  >
                    {searchLoading ? (
                      <div className="p-4 text-center text-slate-500">Searching...</div>
                    ) : (
                      searchResults.map((country) => (
                        <button
                          key={country.id}
                          onClick={() => handleCountrySelect(country)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/50 transition-colors text-left"
                        >
                          <span className="text-lg">{country.emoji}</span>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">{country.name}</p>
                            {country.regionName && (
                              <p className="text-slate-500 text-xs">{country.regionEmoji} {country.regionName}</p>
                            )}
                          </div>
                          <span className="text-slate-500 text-xs">{country.planCount} plans</span>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Dynamic Filters - Show when country is selected */}
          {selectedCountryId && availableDataAmounts.length > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 sm:p-5 mb-6">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="min-w-40">
                  <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Data</label>
                  <select 
                    value={selectedDataAmount} 
                    onChange={(e) => { setSelectedDataAmount(e.target.value); fetchPlans(); }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="">All Data</option>
                    {availableDataAmounts.map((amount) => (
                      <option key={amount} value={amount}>{formatDataOption(amount)}</option>
                    ))}
                  </select>
                </div>

                <div className="min-w-40">
                  <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Duration</label>
                  <select 
                    value={selectedDuration} 
                    onChange={(e) => { setSelectedDuration(e.target.value); fetchPlans(); }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="">All Durations</option>
                    {availableDurations.map((days) => (
                      <option key={days} value={days}>{days} days</option>
                    ))}
                  </select>
                </div>

                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-sky-400 hover:text-white underline underline-offset-2 transition-colors">
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}

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
              <p className="text-4xl sm:text-5xl mb-4">🔍</p>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No plans found</h3>
              <p className="text-slate-400 text-sm mb-2">
                {selectedCountryId 
                  ? `No eSIM plans match your filters for ${selectedCountryName}.`
                  : "Search for a country to see available plans."}
              </p>
              {selectedCountryId && (
                <button onClick={clearFilters} className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2.5 rounded-xl text-sm transition-colors">Clear Filters</button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 text-center">
                <p className="text-slate-400 text-sm">{plans.length} plans available for {selectedCountryName}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <AnimatePresence>
                  {plans.map((plan, index) => (
                    <PlanCard key={plan.id} plan={plan} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}