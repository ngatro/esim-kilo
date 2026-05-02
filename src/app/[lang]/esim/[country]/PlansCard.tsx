"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
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
  fupPolicy: string | null;
  topupPackageId?: number;
  speed?: string | null;
  networkType?: string | null;
  locationNetworkList?: unknown;
  ipExport?: string | null;
  coverageCount?: number;
  smsStatus?: number;
  activeType?: number;
  unusedValidTime?: number;
  badge?: string | null;
  isPopular?: boolean;
  isBestSeller?: boolean;

  isHot?: boolean;
  locations?: unknown;
}

interface TopupPackage {
  id: number;
  planId: string;
  packageCode: string;
  priceUsd: number;
  retailPriceUsd: number;
  isFlexible: boolean;
}

interface PlansCardProps {
  group: {
    destination: string;
    countryId?: string | null;
    dataType: number
    plans: Plan[];
  };
  onDetailClick: (config: PlanCardConfig) => void;
}

// Configuration object that will be passed to the modal
export interface PlanCardConfig {
  selectedData: number;
  selectedDuration: number;
  dataCategory: 'regular' | 'fup';
  pricePreview: number;
  basePlan: Plan | null;
  topupPackage: TopupPackage | null;
  exactPlan: Plan | null;
  topupPackages: TopupPackage[];
  countryName: string;
  countryId?: string;
  dataType: number;
  quantity: number;
  canMultiply: boolean;
  supportTopUpType: number;
  isUsingTopUp: boolean;
  fupPlans: Plan[];
  regularPlans: Plan[];
  dataOptions: number[];
  fupDataOptions: number[];
  durationOptions: number[];
  fupDurationOptions: number[];
  // imageUrl: string | null;

  allPlans: Plan[];
}

export default function PlansCard({ group, onDetailClick }: PlansCardProps) {
  const { destination, countryId, dataType, plans } = group;
  const { formatPrice } = useI18n();
  const ALL_DURATIONS = [1, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 180];
  const { t } = useI18n();

  // 1. States
  const [selectedData, setSelectedData] = useState<number>(0);
  const [selectedDuration, setSelectedDuration] = useState<number>(0);
  const [dataCategory, setDataCategory] = useState<'regular' | 'fup'>('regular');
  const [topupPackages, setTopupPackages] = useState<TopupPackage[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

  // 2. Fetch Topup Packages
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
        console.error('Failed to fetch topup packages in Card:', e);
      }
    }
    fetchTopups();
  }, [plans]);

  // 3. Phân loại Regular và FUP
  const { regularPlans, fupPlans } = useMemo(() => {
    const regular: Plan[] = [];
    const fup: Plan[] = [];
    plans.forEach(p => p.fupPolicy ? fup.push(p) : regular.push(p));
    return { regularPlans: regular, fupPlans: fup };
  }, [plans]);

  // 4. Lấy Options Data theo Category (Regular/FUP)
  const dataOptions = useMemo(() => {
    const plansToSearch = dataCategory === 'fup' ? fupPlans : regularPlans;
    const amounts = new Set<number>();
    plansToSearch.forEach(p => p.dataAmount && amounts.add(p.dataAmount));
    return Array.from(amounts).sort((a, b) => a - b);
  }, [dataCategory, regularPlans, fupPlans]);

  // 5. Khởi tạo mặc định
  useEffect(() => {
    if (regularPlans.length === 0 && fupPlans.length > 0) setDataCategory('fup');
  }, [regularPlans, fupPlans]);

  useEffect(() => {
    if (dataOptions.length > 0 && (!selectedData || !dataOptions.includes(selectedData))) {
      setSelectedData(dataOptions[0]);
    }
    if (!selectedDuration) {
      setSelectedDuration(dataType === 2 ? 1 : (plans[0]?.durationDays || 7));
    }
  }, [dataOptions, dataType, plans, selectedData, selectedDuration]);

  // 6. Logic tìm BASE PLAN (Bê nguyên từ Modal sang)
  const basePlan = useMemo(() => {
    const plansToSearch = dataCategory === 'fup' ? fupPlans : regularPlans;
    if (!plansToSearch.length) return null;
    
    const sameDataPlans = plansToSearch.filter(p => p.dataAmount === selectedData);
    if (sameDataPlans.length > 0) {
      const exactDuration = sameDataPlans.find(p => p.durationDays === selectedDuration);
      if (exactDuration) return exactDuration;
      
      const availableDurations = sameDataPlans.map(p => p.durationDays).sort((a, b) => a - b);
      const closestDuration = availableDurations.find(d => d <= selectedDuration) || availableDurations[0];
      return sameDataPlans.find(p => p.durationDays === closestDuration) || sameDataPlans[0];
    }
    return plansToSearch[0];
  }, [dataCategory, regularPlans, fupPlans, selectedData, selectedDuration]);

  // 7. Logic tìm TOPUP PACKAGE (Bê nguyên từ Modal sang)
  const topupPackage = useMemo(() => {
    if (!basePlan) return null;
    if (basePlan.topupPackageId) {
      const linked = topupPackages.find(p => p.id === basePlan.topupPackageId);
      if (linked) return linked;
    }
    const forPlan = topupPackages.find(p => p.planId === basePlan.id);
    if (forPlan) return forPlan;
    const flexible = topupPackages.find(p => p.isFlexible);
    if (flexible) return flexible;
    return null;
  }, [topupPackages, basePlan]);

  // 8. Logic tính GIÁ (Bê nguyên từ Modal sang)
  const pricePreview = useMemo(() => {
    if (basePlan && topupPackage && selectedDuration > basePlan.durationDays) {
      const basePrice = basePlan.retailPriceUsd > 0 ? basePlan.retailPriceUsd : basePlan.priceUsd;
      const topupRetail = topupPackage.retailPriceUsd > 0 ? topupPackage.retailPriceUsd : topupPackage.priceUsd;
      const extraDays = selectedDuration - basePlan.durationDays;
      return basePrice + (extraDays * topupRetail);
    }
    if (basePlan) {
      return basePlan.retailPriceUsd > 0 ? basePlan.retailPriceUsd : basePlan.priceUsd;
    }
    return 0;
  }, [basePlan, topupPackage, selectedDuration]);

  // Logic xác định gói chính xác để mở checkout nhanh
  const exactPlan = useMemo(() => {
    const plansToSearch = dataCategory === 'fup' ? fupPlans : regularPlans;
    return plansToSearch.find(p => p.dataAmount === selectedData && p.durationDays === selectedDuration);
  }, [dataCategory, fupPlans, regularPlans, selectedData, selectedDuration]);

  // 9. Duration Options cho Select
  const durationOptions = useMemo(() => {
    const allDurations = [1, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 180];
    if (dataType === 2) return allDurations;
    const plansToSearch = dataCategory === 'fup' ? fupPlans : regularPlans;
    return Array.from(new Set(plansToSearch.filter(p => p.dataAmount === selectedData).map(p => p.durationDays))).sort((a, b) => a - b);
  }, [dataType, dataCategory, fupPlans, regularPlans, selectedData]);

  // 10. FUP Data Options
  const fupDataOptions = useMemo(() => {
    const amounts = new Set<number>();
    fupPlans.forEach(p => p.dataAmount && amounts.add(p.dataAmount));
    return Array.from(amounts).sort((a, b) => a - b);
  }, [fupPlans]);

  // 11. FUP Duration Options
  const fupDurationOptions = useMemo(() => {
    const durations = new Set<number>();
    fupPlans.forEach(p => p.durationDays && durations.add(p.durationDays));
    return Array.from(durations).sort((a, b) => a - b);
  }, [fupPlans]);

  // 12. Check if can multiply (has flexible topup)
  const canMultiply = useMemo(() => {
    return topupPackages.some(p => p.isFlexible);
  }, [topupPackages]);

  // 13. Get supportTopUpType from plans
  const supportTopUpType = useMemo(() => {
    const maxType = plans.reduce((max, p) => Math.max(max, p.supportTopUpType || 1), 1);
    return maxType;
  }, [plans]);

  // 14. Determine if using top-up
  const isUsingTopUp = useMemo(() => {
    return !exactPlan && supportTopUpType === 3 && canMultiply && basePlan !== null && topupPackage !== null;
  }, [exactPlan, supportTopUpType, canMultiply, basePlan, topupPackage]);

  return (
    <div className="flex justify-center w-full py-4"> {/* Giảm py-8 xuống py-4 để tiết kiệm không gian dọc */}
      <div className={`group bg-white rounded-[28px] transition-all duration-500 flex flex-col w-full max-w-[340px] relative overflow-hidden
        ${dataCategory === 'fup' 
        ? 'ring-1 ring-orange-500/30 shadow-[0_20px_40px_-12px_rgba(249,115,22,0.15)]' 
        : 'border border-slate-100 shadow-[0_8px_25px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.07)]'
      }`}>
      
      {/* Badge UNLIMITED - Thu nhỏ lại */}
      {dataCategory === 'fup' && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-orange-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md border border-white/10 tracking-wider">
            <span className="w-1 h-1 bg-white rounded-full animate-ping" />
            {t('plans.unlimited')}
          </div>
        </div>
      )}

      {/* Banner Ảnh - Dẹt hơn (16/8) để đẩy nội dung lên */}
      <div className="relative w-full aspect-[16/8] overflow-hidden">
        <Image 
          src={ getDestinationImage((countryId || destination).toLowerCase())}
          alt={destination} 
          fill 
          className="object-cover transition-transform duration-1000 group-hover:scale-110" 
          unoptimized 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-black/10" />
        
        <div className="absolute bottom-4 left-6">
          <p className="text-slate-500 text-[8px] font-semibold uppercase tracking-[0.3em] mb-0.5">eSIM</p>
          <h3 className="text-3xl font-medium text-slate-900 tracking-tighter leading-none">
            {t(`countries.${countryId}`)}
          </h3>
        </div>
      </div>

      {/* Body Section - Giảm padding từ 9 xuống 6 */}
      <div className="flex-grow space-y-5 p-6 pt-3">
        {/* Hàng Dung lượng */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{t('plansCard.data')}</label>
            <p className="text-[12px] text-slate-600 font-medium leading-tight">
              {dataType === 1 ? `${t('plansCard.fixed')}` : `${t('plansCard.daily')}`}
            </p>
          </div>
          <div className="relative">
            <select 
              value={selectedData} 
              onChange={(e) => setSelectedData(Number(e.target.value))} 
              className="pl-3 pr-8 py-2 rounded-xl bg-slate-50 border-none text-slate-800 font-semibold text-xs appearance-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer"
            >
              {dataOptions.map(d => (
                <option key={d} value={d}>{d} GB</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 scale-75">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Hàng Số ngày */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{t('plansCard.duration')}</label>
            <p className="text-[12px] text-slate-600 font-medium leading-tight">{t('plansCard.validity')}</p>
          </div>
          <div className="relative">
            <select 
              value={selectedDuration} 
              onChange={(e) => setSelectedDuration(Number(e.target.value))} 
              className="pl-3 pr-8 py-2 rounded-xl bg-slate-50 border-none text-slate-800 font-semibold text-xs appearance-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer"
            >
              {durationOptions.map(day => (
                <option key={day} value={day}>{day} {t('plansCard.days')}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 scale-75">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Footer - Tiết kiệm tối đa chiều cao */}
        <div className="mt-2 pt-5 border-t border-slate-50">
          <div className="flex items-center justify-between mb-5">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded w-fit mb-1 tracking-tighter">{t('plansCard.offer')} -40%</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold text-slate-900 tracking-tighter leading-none">
                  {formatPrice(pricePreview)}
                </span>
                <span className="text-[10px] line-through text-slate-300">
                  {formatPrice(pricePreview / 0.6)}
                </span>
              </div>
            </div>
            {dataCategory === 'fup' && (
              <div className="text-orange-500 font-semibold text-[8px] uppercase tracking-widest">{t('plansCard.fupActive')}</div>
            )}
          </div>

          <button 
            onClick={() => onDetailClick({
              selectedData, selectedDuration, dataCategory, pricePreview, 
              basePlan: basePlan || null, topupPackage: topupPackage || null, 
              exactPlan: exactPlan || null, topupPackages, countryName: destination, 
              countryId: countryId || undefined, dataType, quantity, canMultiply, supportTopUpType,
              isUsingTopUp, fupPlans, regularPlans, dataOptions, fupDataOptions,
              durationOptions, fupDurationOptions, allPlans: plans
            })} 
            className="w-full h-12 rounded-[18px] bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs uppercase tracking-[0.15em] transition-all shadow-lg shadow-orange-100 active:scale-[0.96]"
          >
            {t('plansCard.viewDetails')}
          </button>
        </div>
      </div>
    </div>
  </div>
);
}