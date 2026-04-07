"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/components/providers/I18nProvider";
import Footer from "@/components/layout/Footer";

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
  regionId: string | null;
  regionName: string | null;
  ipExport: string | null;
  supportTopUp: boolean;
  unusedValidTime: number;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
}

const DEVICE_TYPES = [
  { id: "iphone", name: "iPhone", emoji: "📱" },
  { id: "android", name: "Android", emoji: "📱" },
  { id: "ipad", name: "iPad", emoji: "📱" },
  { id: "hotspot", name: "Mobile Hotspot", emoji: "📡" },
  { id: "laptop", name: "Laptop", emoji: "💻" },
  { id: "smartwatch", name: "Smartwatch", emoji: "⌚" },
];

export default function DevicesPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedType = searchParams.get("type") || "all";

  useEffect(() => {
    fetchPlans();
  }, [selectedType]);

  async function fetchPlans() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType && selectedType !== "all") {
        params.set("deviceType", selectedType);
      }
      params.set("limit", "20");

      const res = await fetch(`/api/plans?${params.toString()}`);
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err) {
      console.error("Fetch plans failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">eSIM for All Devices</h1>
            <p className="text-lg text-slate-600">Choose your device type to find compatible eSIM plans</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {DEVICE_TYPES.map((device) => (
              <a
                key={device.id}
                href={`/devices?type=${device.id}`}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  selectedType === device.id
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span className="mr-2">{device.emoji}</span>
                {device.name}
              </a>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No plans found</h3>
              <p className="text-slate-500">Try selecting a different device type</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <a
                  key={plan.id}
                  href={`/plans/${plan.slug || plan.id}`}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-orange-400 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-orange-500 transition-colors">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-slate-500">{plan.destination}</p>
                    </div>
                    {plan.isHot && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">Hot</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-800">${plan.priceUsd.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">
                        {plan.dataAmount >= 999 ? "Unlimited" : `${plan.dataAmount}GB`} • {plan.durationDays} days
                      </p>
                    </div>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      {t("common.viewSite") || "View"}
                    </button>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}