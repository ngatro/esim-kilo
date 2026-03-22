"use client";

import { useState } from "react";
import { REGIONS, ESIM_PLANS, Region } from "@/lib/esim-data";
import PlanCard from "@/components/ui/PlanCard";

export default function PlansSection() {
  const [activeRegion, setActiveRegion] = useState<Region | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = ESIM_PLANS.filter((plan) => {
    const matchRegion = activeRegion === "all" || plan.region === activeRegion;
    const matchSearch =
      searchQuery === "" ||
      plan.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRegion && matchSearch;
  });

  return (
    <section id="plans" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Browse eSIM Plans</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Instant data for every journey. Filter by region or search for your destination.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search destination (e.g. Japan, Europe…)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        {/* Region filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <button
            onClick={() => setActiveRegion("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeRegion === "all"
                ? "bg-sky-500 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600"
            }`}
          >
            All Regions
          </button>
          {REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => setActiveRegion(region.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeRegion === region.id
                  ? "bg-sky-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600"
              }`}
            >
              <span>{region.emoji}</span>
              {region.label}
            </button>
          ))}
        </div>

        {/* Plans grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-slate-400 text-lg">No plans found for &ldquo;{searchQuery}&rdquo;</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 text-sky-400 hover:text-sky-300 text-sm underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
