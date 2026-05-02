"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/components/providers/I18nProvider";

const ESIM_DEVICES = [
  { brand: "Apple", models: [
    { name: "iPhone 15 Pro Max", esim: true, dual: true },
    { name: "iPhone 15 Pro", esim: true, dual: true },
    { name: "iPhone 15", esim: true, dual: true },
    { name: "iPhone 15 Plus", esim: true, dual: true },
    { name: "iPhone 14 Pro Max", esim: true, dual: true },
    { name: "iPhone 14 Pro", esim: true, dual: true },
    { name: "iPhone 14", esim: true, dual: true },
    { name: "iPhone 14 Plus", esim: true, dual: true },
    { name: "iPhone 13 Pro Max", esim: true, dual: true },
    { name: "iPhone 13 Pro", esim: true, dual: true },
    { name: "iPhone 13", esim: true, dual: true },
    { name: "iPhone 13 mini", esim: true, dual: true },
    { name: "iPhone 12 Pro Max", esim: true, dual: true },
    { name: "iPhone 12 Pro", esim: true, dual: true },
    { name: "iPhone 12", esim: true, dual: true },
    { name: "iPhone 12 mini", esim: true, dual: true },
    { name: "iPhone SE (2022)", esim: true, dual: false },
    { name: "iPhone SE (2020)", esim: true, dual: false },
    { name: "iPhone 11 Pro Max", esim: false, dual: false },
    { name: "iPhone 11 Pro", esim: false, dual: false },
    { name: "iPhone 11", esim: false, dual: false },
    { name: "iPad Pro (M1)", esim: true, dual: false },
    { name: "iPad Pro 2020", esim: true, dual: false },
    { name: "iPad Air (M1)", esim: true, dual: false },
    { name: "iPad Air 2020", esim: true, dual: false },
    { name: "iPad mini (A15)", esim: true, dual: false },
    { name: "iPad (2021)", esim: true, dual: false },
  ]},
  { brand: "Samsung", models: [
    { name: "Galaxy S24 Ultra", esim: true, dual: true },
    { name: "Galaxy S24+", esim: true, dual: true },
    { name: "Galaxy S24", esim: true, dual: true },
    { name: "Galaxy S23 Ultra", esim: true, dual: true },
    { name: "Galaxy S23+", esim: true, dual: true },
    { name: "Galaxy S23", esim: true, dual: true },
    { name: "Galaxy S22 Ultra", esim: true, dual: true },
    { name: "Galaxy S22+", esim: true, dual: true },
    { name: "Galaxy S22", esim: true, dual: true },
    { name: "Galaxy S21 Ultra", esim: true, dual: true },
    { name: "Galaxy S21+", esim: true, dual: true },
    { name: "Galaxy S21", esim: true, dual: true },
    { name: "Galaxy Z Fold 5", esim: true, dual: true },
    { name: "Galaxy Z Fold 4", esim: true, dual: true },
    { name: "Galaxy Z Fold 3", esim: true, dual: true },
    { name: "Galaxy Z Flip 5", esim: true, dual: true },
    { name: "Galaxy Z Flip 4", esim: true, dual: true },
    { name: "Galaxy Z Flip 3", esim: true, dual: true },
    { name: "Galaxy A54", esim: true, dual: false },
    { name: "Galaxy A53", esim: true, dual: false },
    { name: "Galaxy S20 FE", esim: false, dual: false },
  ]},
  { brand: "Google", models: [
    { name: "Pixel 8 Pro", esim: true, dual: true },
    { name: "Pixel 8", esim: true, dual: true },
    { name: "Pixel 8a", esim: true, dual: true },
    { name: "Pixel 7 Pro", esim: true, dual: true },
    { name: "Pixel 7", esim: true, dual: true },
    { name: "Pixel 7a", esim: true, dual: true },
    { name: "Pixel 6 Pro", esim: true, dual: true },
    { name: "Pixel 6", esim: true, dual: true },
    { name: "Pixel 6a", esim: true, dual: true },
    { name: "Pixel Fold", esim: true, dual: true },
  ]},
  { brand: "Sony", models: [
    { name: "Xperia 1 V", esim: true, dual: true },
    { name: "Xperia 1 IV", esim: true, dual: true },
    { name: "Xperia 1 III", esim: true, dual: false },
    { name: "Xperia 5 IV", esim: true, dual: true },
    { name: "Xperia 5 III", esim: true, dual: false },
    { name: "Xperia Pro-I", esim: true, dual: false },
  ]},
  { brand: "Motorola", models: [
    { name: "Razr 40 Ultra", esim: true, dual: true },
    { name: "Razr 40", esim: true, dual: true },
    { name: "Razr+", esim: true, dual: true },
    { name: "Razr 2022", esim: true, dual: true },
    { name: "Edge 40 Pro", esim: true, dual: true },
    { name: "Edge 30 Pro", esim: true, dual: false },
  ]},
  { brand: "OnePlus", models: [
    { name: "OnePlus 12", esim: true, dual: true },
    { name: "OnePlus 11", esim: true, dual: true },
    { name: "OnePlus Open", esim: true, dual: true },
  ]},
  { brand: "OPPO", models: [
    { name: "Find N3 Flip", esim: true, dual: true },
    { name: "Find N2 Flip", esim: true, dual: true },
    { name: "Find X6 Pro", esim: true, dual: true },
    { name: "Find X5 Pro", esim: true, dual: false },
    { name: "Find X5", esim: true, dual: false },
    { name: "Reno 10 Pro", esim: true, dual: false },
  ]},
  { brand: "Other", models: [
    { name: "Huawei P50 Pro", esim: true, dual: false },
    { name: "Huawei Mate X3", esim: true, dual: true },
    { name: "Nokia X30", esim: true, dual: false },
    { name: "Nokia G60", esim: true, dual: false },
    { name: "Fairphone 5", esim: true, dual: true },
  ]},
];

export default function DeviceCompatibilityPage() {
   const { t, locale } = useI18n();
  const [search, setSearch] = useState("");

  const filteredDevices = useMemo(() => {
    if (!search.trim()) return ESIM_DEVICES;
    
    const query = search.toLowerCase();
    return ESIM_DEVICES.map(brand => ({
      ...brand,
      models: brand.models.filter(model => 
        model.name.toLowerCase().includes(query) || 
        brand.brand.toLowerCase().includes(query)
      )
    })).filter(brand => brand.models.length > 0);
  }, [search]);

  return (
    <div className="min-h-screen bg-orange-50 text-slate-800">
      <main className="pt-20 sm:pt-28 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-3">
              {t("compatibility.title") || "Device Compatibility"}
            </h1>
            <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto">
              {t("compatibility.subtitle") || "Check if your device supports eSIM before purchasing. Most modern smartphones support eSIM technology."}
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your device (e.g., iPhone 15, Samsung S24)..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-800 text-base placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">✓</div>
              <p className="text-green-600 font-semibold">eSIM Supported</p>
              <p className="text-slate-500 text-sm mt-1">Ready to use</p>
            </div>
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">🔷</div>
              <p className="text-slate-800 font-semibold">Dual SIM</p>
              <p className="text-slate-500 text-sm mt-1">Physical + eSIM</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">✗</div>
              <p className="text-red-600 font-semibold">Not Supported</p>
              <p className="text-slate-500 text-sm mt-1">Physical SIM only</p>
            </div>
          </div>

          {/* Device List */}
          <div className="space-y-6">
            {filteredDevices.map((brand, idx) => (
              <motion.div 
                key={brand.brand}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/80 border border-slate-200 rounded-2xl overflow-hidden"
              >
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-800">{brand.brand}</h2>
                </div>
                <div className="divide-y divide-slate-200/50">
                  {brand.models.map((model, modelIdx) => (
                    <div key={modelIdx} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <span className="text-slate-800">{model.name}</span>
                      <div className="flex items-center gap-3">
                        {model.esim ? (
                          <>
                            <span className="text-green-600 text-sm">✓ eSIM</span>
                            {model.dual && (
                              <span className="bg-orange-500/20 text-orange-600 text-xs px-2 py-0.5 rounded-full">Dual</span>
                            )}
                          </>
                        ) : (
                          <span className="text-red-500 text-sm">✗ Not supported</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {filteredDevices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">No devices found matching &quot;{search}&quot;</p>
              <p className="text-slate-500 text-sm mt-2">Try searching for a different model</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">Ready to get your eSIM?</p>
<Link href={`/${locale}/plans`}>
               <button className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
                 Browse Plans
               </button>
             </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
