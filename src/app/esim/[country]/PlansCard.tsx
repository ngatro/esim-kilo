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
  durationDays: number;
  priceUsd: number;
  retailPriceUsd: number;
  dataType: number;
  supportTopUp: boolean;
  supportTopUpType: number;
  fupPolicy: string | null;
  topupPackageId?: number;
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
    countryCode?: string;
    dataType: number;
    plans: Plan[];
  };
  onDetailClick: (config: any) => void;
}

export default function PlansCard({ group, onDetailClick }: PlansCardProps) {
  const { destination, countryCode, dataType, plans } = group;
  const { formatPrice } = useI18n();
  const ALL_DURATIONS = [1, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 180];

  // 1. States
  const [selectedData, setSelectedData] = useState<number>(0);
  const [selectedDuration, setSelectedDuration] = useState<number>(0);
  const [dataCategory, setDataCategory] = useState<'regular' | 'fup'>('regular');
  const [topupPackages, setTopupPackages] = useState<TopupPackage[]>([]);

  // 2. Fetch Topup Packages y hệt Modal của mày
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
    if (!basePlan) return topupPackages[0];
    if (basePlan.topupPackageId) {
      const linked = topupPackages.find(p => p.id === basePlan.topupPackageId);
      if (linked) return linked;
    }
    const forPlan = topupPackages.find(p => p.planId === basePlan.id);
    if (forPlan) return forPlan;
    const flexible = topupPackages.find(p => p.isFlexible);
    if (flexible) return flexible;
    return topupPackages[0];
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
    if (dataType === 2) return ALL_DURATIONS;
    const plansToSearch = dataCategory === 'fup' ? fupPlans : regularPlans;
    return Array.from(new Set(plansToSearch.filter(p => p.dataAmount === selectedData).map(p => p.durationDays))).sort((a, b) => a - b);
  }, [dataType, dataCategory, fupPlans, regularPlans, selectedData]);

  return (
    <div className="group bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
      
      {/* Banner Ảnh */}
      <div className="relative aspect-[16/7] rounded-2xl overflow-hidden mb-5">
        <Image 
          src={getDestinationImage((countryCode || destination).toLowerCase())} 
          alt={destination} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
          unoptimized 
        />
        <div className="absolute top-2 left-2 bg-[#00E676] text-slate-900 text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
          BEST CHOICE
        </div>
        {dataCategory === 'fup' && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="bg-white/90 px-3 py-1 rounded-lg text-[10px] font-bold text-orange-500">
              Không giới hạn dung lượng
            </span>
          </div>
        )}
      </div>

      <div className="flex-grow space-y-4">
        {/* Hàng Dung lượng */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-500">Dung lượng</label>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 mb-1">
              {dataType === 1 ? "Cố định" : "Hàng Ngày"}
            </span>
            <div className="relative w-[140px]">
              <select 
                value={selectedData} 
                onChange={(e) => setSelectedData(Number(e.target.value))} 
                className="w-full h-10 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm appearance-none outline-none focus:border-orange-500 transition-all cursor-pointer"
              >
                {dataOptions.map(d => (
                  <option key={d} value={d}>{d} GB</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Hàng Số ngày */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-500">Số ngày</label>
          <div className="relative w-[100px]">
            <select 
              value={selectedDuration} 
              onChange={(e) => setSelectedDuration(Number(e.target.value))} 
              className="w-full h-10 pl-4 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm appearance-none outline-none focus:border-orange-500 transition-all cursor-pointer"
            >
              {durationOptions.map(day => (
                <option key={day} value={day}>{day} ngày</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Hàng Phạm vi */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-500">Phạm vi</label>
          <span className="text-sm font-black text-slate-900">{destination}</span>
        </div>
      </div>

      {/* Giá tiền và Button */}
      <div className="mt-8 pt-5 border-t border-slate-50 text-center">
        <div className="mb-5">
          <div className="text-3xl font-black text-orange-500 tracking-tighter">
            {formatPrice(pricePreview)}
          </div>
          <div className="flex justify-center mt-1">
            <span className="bg-orange-50 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              -40% <span className="line-through text-slate-300 font-normal">{formatPrice(pricePreview / 0.6)}</span>
            </span>
          </div>
        </div>

        <button 
          onClick={() => onDetailClick({
            selectedData, selectedDuration, dataCategory,
            pricePreview, basePlan, topupPackage, exactPlan,
            topupPackages, countryName: destination, countryCode, dataType
          })} 
          className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black rounded-xl transition-all text-sm uppercase tracking-tight shadow-sm"
        >
          Xem Chi Tiết
        </button>
      </div>
    </div>
  );
}