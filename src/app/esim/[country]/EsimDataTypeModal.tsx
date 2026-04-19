"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getDestinationImage } from "@/lib/unsplash";
import { useI18n } from "@/components/providers/I18nProvider";

interface Plan {
  id: string;
  name: string;
  packageCode: string;
  destination: string;
  dataAmount: number;
  dataVolume: number;
  durationDays: number;
  priceUsd: number;
  retailPriceUsd: number;
  dataType: number;
  supportTopUp: boolean;
  supportTopUpType: number;
  countryId: string | null;
  fupPolicy: string | null;
}

interface TopupPackage {
  id: number;
  planId: string;
  packageCode: string;
  name: string | null;
  priceUsd: number;
  retailPriceUsd: number;
  isFlexible: boolean;
  isActive: boolean;
}

// Props for the modal
interface EsimDataTypeModalProps {
  plans: Plan[]; // All plans for this dataType (Fixed or Daily)
  dataType: number; // 1 = Fixed, 2 = Daily
  countryName: string;
  countryCode: string;
  isOpen: boolean;
  onClose: () => void;
}

function formatData(gb: number, volume?: number): string {
  const dataValue = gb > 0 ? gb : (volume ? Math.round((volume / (1024 * 1024 * 1024)) * 10) / 10 : 0);
  if (dataValue >= 999) return "Unlimited";
  if (dataValue < 1 && dataValue > 0) return `${Math.round(dataValue * 1024)}MB`;
  if (dataValue === 0) return "N/A";
  return `${dataValue}GB`;
}

export default function EsimDataTypeModal({
  plans,
  dataType,
  countryName,
  countryCode,
  isOpen,
  onClose,
}: EsimDataTypeModalProps) {
  const { t, formatPrice } = useI18n();
  const [imgError, setImgError] = useState(false);
  const [topupPackages, setTopupPackages] = useState<TopupPackage[]>([]);
  
  // Fetch topup packages for these plans
  useEffect(() => {
    async function fetchTopups() {
      if (!plans.length) return;
      const planIds = plans.map(p => p.id).join(',');
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/topup-packages?planIds=${planIds}`);
        if (res.ok) {
          const data = await res.json();
          setTopupPackages(data.packages || []);
        }
      } catch (e) {
        console.error('Failed to fetch topup packages:', e);
      }
    }
    fetchTopups();
  }, [plans]);

  // Selected options
  const [selectedData, setSelectedData] = useState<number>(0);
  const [selectedDuration, setSelectedDuration] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  
  // Track which type is selected: 'regular' or 'fup'
  const [dataCategory, setDataCategory] = useState<'regular' | 'fup'>('regular');

  // Separate plans into regular and FUP (Unlimited) groups
  const { regularPlans, fupPlans } = useMemo(() => {
    const regular: Plan[] = [];
    const fup: Plan[] = [];
    plans.forEach(plan => {
      if (plan.fupPolicy) {
        fup.push(plan);
      } else {
        regular.push(plan);
      }
    });
    return { regularPlans: regular, fupPlans: fup };
  }, [plans]);

  // Get unique data options from regular plans (REAL data from DB)
  const dataOptions = useMemo(() => {
    const dataAmounts = new Set<number>();
    regularPlans.forEach(plan => {
      if (plan.dataAmount) dataAmounts.add(plan.dataAmount);
    });
    return Array.from(dataAmounts).sort((a, b) => a - b);
  }, [regularPlans]);

  // Get unique data options from FUP plans
  const fupDataOptions = useMemo(() => {
    const dataAmounts = new Set<number>();
    fupPlans.forEach(plan => {
      if (plan.dataAmount) dataAmounts.add(plan.dataAmount);
    });
    return Array.from(dataAmounts).sort((a, b) => a - b);
  }, [fupPlans]);

  // Get unique duration options from regular plans (REAL durations from DB)
  const durationOptions = useMemo(() => {
    const durations = new Set<number>();
    regularPlans.forEach(plan => {
      if (plan.durationDays) durations.add(plan.durationDays);
    });
    return Array.from(durations).sort((a, b) => a - b);
  }, [regularPlans]);

  // Get unique duration options from FUP plans
  const fupDurationOptions = useMemo(() => {
    const durations = new Set<number>();
    fupPlans.forEach(plan => {
      if (plan.durationDays) durations.add(plan.durationDays);
    });
    return Array.from(durations).sort((a, b) => a - b);
  }, [fupPlans]);

  // Find base plan for top-up calculation
  // Must match the selected data AND have shortest duration
  const basePlan = useMemo(() => {
    const plansToSearch = dataCategory === 'fup' ? fupPlans : regularPlans;
    if (!plansToSearch.length) return null;
    
    // Find plan that matches selected data amount
    const matchingData = plansToSearch.find(p => p.dataAmount === selectedData);
    if (matchingData) {
      // Try to find 1-day plan with same data
      const oneDayPlan = plansToSearch.find(p => p.dataAmount === selectedData && p.durationDays === 1);
      if (oneDayPlan) return oneDayPlan;
      // Fallback to shortest duration with same data
      const sameDataPlans = plansToSearch.filter(p => p.dataAmount === selectedData);
      const shortestDuration = Math.min(...sameDataPlans.map(p => p.durationDays));
      return sameDataPlans.find(p => p.durationDays === shortestDuration) || matchingData;
    }
    
    // Fallback: find 1-day plan
    const oneDayPlan = plansToSearch.find(p => p.durationDays === 1);
    if (oneDayPlan) return oneDayPlan;
    
    // Fallback to shortest
    const shortestDuration = Math.min(...plansToSearch.map(p => p.durationDays));
    return plansToSearch.find(p => p.durationDays === shortestDuration) || plansToSearch[0];
  }, [regularPlans, fupPlans, selectedData, dataCategory]);

  // Filter topup packages for the current basePlan
  const relevantTopupPackages = useMemo(() => {
    if (!basePlan) return [];
    return topupPackages.filter(p => p.planId === basePlan.id);
  }, [topupPackages, basePlan]);

  // Check if top-up is flexible based on TopupPackages for this plan
  const canMultiply = useMemo(() => {
    return relevantTopupPackages.some(p => p.isFlexible);
  }, [relevantTopupPackages]);

  // Check if any top-up is available for this plan
  const hasTopupPackages = useMemo(() => {
    return relevantTopupPackages.length > 0;
  }, [relevantTopupPackages]);

  // Find first topup package for the correct plan
  const topupPackage = useMemo(() => {
    return relevantTopupPackages[0];
  }, [relevantTopupPackages]);

  // Find exact matching plan based on selection (search in correct group)
  const exactPlan = useMemo(() => {
    const plansToSearch = dataCategory === 'fup' ? fupPlans : regularPlans;
    return plansToSearch.find(p => 
      p.dataAmount === selectedData && 
      p.durationDays === selectedDuration
    );
  }, [regularPlans, fupPlans, selectedData, selectedDuration, dataCategory]);

  // Check supportTopUpType from plans
  const supportTopUpType = useMemo(() => {
    const maxType = plans.reduce((max, p) => Math.max(max, p.supportTopUpType || 1), 1);
    return maxType;
  }, [plans]);

  // Determine if we're using top-up
  // Must have: supportTopUpType === 3 AND canMultiply AND topupPackage
  const isUsingTopUp = useMemo(() => {
    return !exactPlan && supportTopUpType === 3 && canMultiply && basePlan && topupPackage;
  }, [exactPlan, supportTopUpType, canMultiply, basePlan, topupPackage]);

  // Calculate price based on selection
  // Price formula: Base price + (SelectedDays - BasePlanDays) * TopupRetailPrice
  const pricePreview = useMemo(() => {
    // 1. If exact match plan exists (e.g., user selects 7 days and there's a 7-day plan)
    if (exactPlan) {
      return exactPlan.retailPriceUsd > 0 ? exactPlan.retailPriceUsd : exactPlan.priceUsd;
    }

    // 2. If using top-up (stacking multiple 1-day packages)
    if (isUsingTopUp && basePlan && topupPackage) {
      // Base price from the 1-day plan
      const basePrice = basePlan.retailPriceUsd > 0 ? basePlan.retailPriceUsd : basePlan.priceUsd;
      // Use retailPriceUsd from topup package (fallback to priceUsd)
      const topupRetail = topupPackage.retailPriceUsd > 0 ? topupPackage.retailPriceUsd : topupPackage.priceUsd;
      
      // Extra days = Selected duration - Base plan's default duration (usually 1)
      const extraDays = selectedDuration - basePlan.durationDays;
      
      // Price = Base price + (Extra days × Topup retail price per day)
      return extraDays > 0 ? basePrice + (extraDays * topupRetail) : basePrice;
    }

    // 3. Default: just show base plan price
    return basePlan ? (basePlan.retailPriceUsd > 0 ? basePlan.retailPriceUsd : basePlan.priceUsd) : 0;
  }, [exactPlan, isUsingTopUp, basePlan, topupPackage, selectedDuration]);

  // Initialize with first available options
  useEffect(() => {
    const options = dataCategory === 'fup' ? fupDataOptions : dataOptions;
    if (options.length > 0 && !selectedData) {
      setSelectedData(options[0]);
    }
  }, [dataOptions, fupDataOptions, selectedData, dataCategory]);

  useEffect(() => {
    const options = dataCategory === 'fup' ? fupDurationOptions : durationOptions;
    if (options.length > 0 && !selectedDuration) {
      setSelectedDuration(options[0]);
    }
  }, [durationOptions, fupDurationOptions, selectedDuration, dataCategory]);

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedData(dataOptions[0] || 0);
      setSelectedDuration(durationOptions[0] || 0);
      setQuantity(1);
      // Default to regular category, unless no regular plans
      setDataCategory(regularPlans.length > 0 ? 'regular' : 'fup');
    }
  }, [isOpen, dataOptions, durationOptions, regularPlans]);

  // Disable duration options based on supportTopUpType
  const isDurationDisabled = (duration: number) => {
    const plansToCheck = dataCategory === 'fup' ? fupPlans : regularPlans;
    
    // If there's an exact plan for this duration, it's available
    const hasExactPlan = plansToCheck.some(p => p.dataAmount === selectedData && p.durationDays === duration);
    if (hasExactPlan) return false;

    // Check if top-up is available at all
    if (!hasTopupPackages && !exactPlan) return true;
    
    // If exact plan exists, it's always available
    // If no exact plan but top-up exists and can multiply, it's available
    if (!exactPlan && canMultiply) return false;
    
    // If top-up exists but cannot multiply (isFlexible=false), only show exact durations
    return false;
  };

  if (!isOpen) return null;

  const heroImage = imgError 
    ? "/favicon.ico" 
    : getDestinationImage(countryCode?.toLowerCase() || countryName.toLowerCase());

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto">
              {/* Left Side - Banner & Selection */}
              <div className="lg:w-1/2 bg-gradient-to-br from-slate-100 to-slate-50 p-6 lg:p-8">
                {/* Banner Image */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-lg">
                  <Image
                    src={heroImage}
                    alt={countryName}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={() => setImgError(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      {dataType === 1 ? "Fixed Data" : "Daily Data"}
                    </span>
                  </div>
                </div>

                {/* Product Name */}
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
                  {countryName}
                </h2>

                {/* Data Type Badge */}
                <p className="text-slate-600 mb-6">
                  {dataType === 1 
                    ? "Fixed data - all data available for the entire validity period"
                    : "Daily data - data resets each day"
                  }
                </p>

                {/* Data & Duration Selection - REAL options from database */}
                <div className="space-y-4">
                  {/* Category Toggle (Regular vs FUP) - Only show if FUP plans exist */}
                  {fupPlans.length > 0 && dataType === 2 && (
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => { setDataCategory('regular'); setSelectedData(dataOptions[0] || 0); }}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                          dataCategory === 'regular'
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        📵 {t("modal.regular") || "Regular"}
                      </button>
                      <button
                        onClick={() => { setDataCategory('fup'); setSelectedData(fupDataOptions[0] || 0); }}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                          dataCategory === 'fup'
                            ? "bg-green-500 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        ♾ {t("modal.unlimited") || "Unlimited"}
                      </button>
                    </div>
                  )}

                  {/* Data Amount Selection */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      {t("plans.data") || "Data"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(dataCategory === 'fup' ? fupDataOptions : dataOptions).map((data) => {
                        const plansToCheck = dataCategory === 'fup' ? fupPlans : regularPlans;
                        const hasAnyPlan = plansToCheck.some(p => p.dataAmount === data);
                        return (
                        <button
                          key={data}
                          onClick={() => setSelectedData(data)}
                          className={`px-4 py-2.5 rounded-full font-medium text-sm transition-all ${
                            selectedData === data
                              ? "bg-orange-500 text-white border-2 border-orange-500"
                              : "bg-white text-slate-600 border-2 border-slate-200 hover:border-orange-300"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {dataType === 1 
                            ? formatData(data) 
                            : `${formatData(data)}/day`
                          }
                        </button>
                      )})}
                    </div>
                  </div>

                  {/* Duration Selection */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Duration (Days)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(dataCategory === 'fup' ? fupDurationOptions : durationOptions).map((duration) => (
                        <button
                          key={duration}
                          onClick={() => setSelectedDuration(duration)}
                          disabled={isDurationDisabled(duration)}
                          className={`px-4 py-2.5 rounded-full font-medium text-sm transition-all ${
                            selectedDuration === duration
                              ? "bg-orange-500 text-white border-2 border-orange-500"
                              : "bg-white text-slate-600 border-2 border-slate-200 hover:border-orange-300"
                          } disabled:opacity-50 disabled:cursor-not-allowed disabled:line-through`}
                        >
                          {duration} days
                        </button>
                      ))}
                      {/* Additional duration options if top-up is supported */}
                      {/* Only show additional durations if canMultiply (TopupPackage.isFlexible) */}
                      {canMultiply && [1, 3, 5, 7, 10, 15, 30].filter(d => !(dataCategory === 'fup' ? fupDurationOptions : durationOptions).includes(d)).map((duration) => (
                        <button
                          key={duration}
                          onClick={() => setSelectedDuration(duration)}
                          className={`px-4 py-2.5 rounded-full font-medium text-sm transition-all ${
                            selectedDuration === duration
                              ? "bg-orange-500 text-white border-2 border-orange-500"
                              : "bg-white text-slate-600 border-2 border-slate-200 hover:border-orange-300"
                          }`}
                        >
                          {duration} days
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Summary Box */}
              <div className="lg:w-1/2 p-6 lg:p-8 bg-white">
                <div className="bg-slate-50 rounded-2xl p-6">
                  {/* FUP Warning */}
                  {dataCategory === 'fup' && exactPlan && exactPlan.fupPolicy && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-green-700 text-sm font-medium">
                        ♾️ {t("modal.fupWarning") || `Sau khi dùng hết ${formatData(selectedData)} tốc độ cao, vẫn có thể tiếp tục sử dụng với tốc độ thấp (${exactPlan.fupPolicy})`}
                      </p>
                    </div>
                  )}

                  {/* Top-up Warning */}
                  {isUsingTopUp && (
                    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-amber-700 text-sm font-medium">
                        ⚠️ {t("modal.stackedWarning") || "Gói này được cộng dồn từ nhiều gói 1 ngày"}
                      </p>
                    </div>
                  )}

                  {/* Selected Plan Summary */}
                  <div className="mb-4 pb-4 border-b border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">Selected:</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {dataCategory === 'fup' ? '♾️ ' : ''}
                      {dataType === 1 
                        ? formatData(selectedData) 
                        : `${formatData(selectedData)}/day`
                      } • {selectedDuration} days
                      {exactPlan?.fupPolicy && ` (${exactPlan.fupPolicy})`}
                    </p>
                    {/* Debug info */}
                    {exactPlan && (
                      <div className="text-xs text-slate-500 mt-2 p-2 bg-slate-100 rounded">
                        <p>📦 Plan packageCode: <code className="bg-slate-200 px-1 rounded">{exactPlan.packageCode}</code></p>
                      </div>
                    )}
                    {exactPlan && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Exact plan available
                      </p>
                    )}
                    {isUsingTopUp && basePlan && topupPackage && (
                      <div className="text-xs text-amber-600 mt-1">
                        <p>⚠️ Top-up × {selectedDuration} days (stacked)</p>
                        <p>📦 Topup packageCode: <code className="bg-amber-100 px-1 rounded">{topupPackage.packageCode}</code></p>
                        <p>💰 Base retailPriceUsd: {basePlan.retailPriceUsd} (DB)</p>
                        <p>💰 Base priceUsd: {basePlan.priceUsd} (wholesale)</p>
                        <p>💰 Topup retailPriceUsd: {topupPackage.retailPriceUsd}</p>
                        <p>💰 Topup priceUsd: {topupPackage.priceUsd}</p>
                        <p>💰 Extra days: {selectedDuration} - {basePlan.durationDays} = {selectedDuration - basePlan.durationDays}</p>
                        <p>💰 Total: {formatPrice(pricePreview)}</p>
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      {t("common.quantity") || "Quantity"}
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center hover:border-orange-300 transition-colors text-slate-600 font-bold"
                      >
                        -
                      </button>
                      <span className="w-16 text-center font-bold text-xl">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center hover:border-orange-300 transition-colors text-slate-600 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-orange-500">
                        {formatPrice(pricePreview * quantity)}
                      </span>
                      <span className="text-slate-500">{t("planDetail.oneTime") || "one-time"}</span>
                    </div>
                    {selectedDuration > 1 && (
                      <p className="text-sm text-slate-400">
                        ({(pricePreview / selectedDuration).toFixed(2)}/day)
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-full text-lg transition-colors flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {t("plans.addToCart") || "Add to Cart"}
                    </button>
                    
                    {/* Buy Now - use packageCode + quantity */}
                    {exactPlan ? (
                      <Link
                        href={`/checkout?planId=${exactPlan.id}&qty=${quantity}`}
                        className="block w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-4 rounded-full text-lg text-center transition-colors"
                      >
                        {t("plans.buyNow") || "Buy Now"}
                      </Link>
                    ) : isUsingTopUp && basePlan ? (
                      // Using top-up - buy the base plan with quantity = selected duration
                      <Link
                        href={`/checkout?planId=${basePlan.id}&qty=${quantity}&days=${selectedDuration}&mode=topup`}
                        className="block w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-4 rounded-full text-lg text-center transition-colors"
                      >
                        {t("plans.buyNow") || "Buy Now"}
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="block w-full bg-slate-300 text-slate-500 font-semibold py-4 rounded-full text-lg text-center cursor-not-allowed"
                      >
                        Not Available
                      </button>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{t("planDetail.instantDelivery")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{t("planDetail.secureCheckout")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>{t("planDetail.refundPolicy")}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
