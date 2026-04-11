"use client";

import Link from "next/link";
import Image from "next/image";
import { getCountryImageUrl, getRegionImageUrl, getDefaultImage } from "@/lib/countryImages";
import { useState } from "react";

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
  locations: unknown;
  ipExport: string | null;
  supportTopUp: boolean;
  unusedValidTime: number;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
  locationNetworkList?: string;
}

function formatVolume(bytes: number): string {
  if (bytes === 0) return "0";
  const k = 1024;
  const dm = 1;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}

function getPlanImage(plan: Plan): string {
  if (plan.coverageCount >= 2 && plan.regionId) {
    return getRegionImageUrl(plan.regionId);
  }
  if (plan.countryId) {
    return getCountryImageUrl(plan.countryId) || getDefaultImage(plan.packageCode);
  }
  return getDefaultImage(plan.packageCode);
}

export default function EsimRedirectClient({ plan, country, slug }: { plan: any; country: string; slug: string }) {
  const displayPrice = plan?.retailPriceUsd > 0 ? plan.retailPriceUsd : plan?.priceUsd || 0;
  const originalPrice = plan?.retailPriceUsd > plan?.priceUsd ? plan.priceUsd : null;
  const imageUrl = getPlanImage(plan);
  
  // Parse network list if available
  let networkList: { operatorName: string; networkType: string }[] = [];
  try {
    if (plan?.locationNetworkList) {
      networkList = JSON.parse(plan.locationNetworkList);
    }
  } catch (e) {
    // ignore parse errors
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <span>/</span>
            <Link href="/plans" className="hover:text-orange-500">Plans</Link>
            <span>/</span>
            <span className="text-slate-800">{plan?.destination}</span>
          </div>
        </div>
      </div>

      {/* Plan Details */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column - Image & Features */}
          <div>
            {/* Plan Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-6">
              <Image
                src={imageUrl}
                alt={plan?.destination || 'eSIM Plan'}
                fill
                className="object-cover"
                unoptimized
              />
              {/* Badges */}
              {(plan?.isHot || plan?.isPopular || plan?.badge) && (
                <div className="absolute top-4 left-4 flex gap-2">
                  {plan?.isHot && (
                    <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      HOT
                    </span>
                  )}
                  {plan?.isPopular && (
                    <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      POPULAR
                    </span>
                  )}
                  {plan?.badge && (
                    <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {plan.badge.toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Data</p>
                <p className="text-lg font-semibold text-slate-800">
                  {formatVolume(plan?.dataVolume || plan?.dataAmount * 1024 * 1024)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Validity</p>
                <p className="text-lg font-semibold text-slate-800">{plan?.durationDays} Days</p>
              </div>
            </div>

            {/* Network */}
            {networkList.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-700 mb-2">Networks</p>
                <div className="flex flex-wrap gap-2">
                  {networkList.map((net: any, i: number) => (
                    <span key={i} className="bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-lg">
                      {net.operatorName} ({net.networkType})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Speed */}
            {plan?.speed && (
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-700 mb-1">Speed</p>
                <p className="text-slate-600">{plan.speed}</p>
              </div>
            )}

            {/* Top Up Info */}
            {plan?.supportTopUp && (
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-700 mb-1">Top Up</p>
                <p className="text-slate-600">Supported - extends data when needed</p>
              </div>
            )}
          </div>

          {/* Right Column - Purchase */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              {plan?.destination}
            </h1>
            
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-orange-500">${displayPrice}</span>
              {originalPrice && originalPrice > displayPrice && (
                <span className="text-xl text-slate-400 line-through">${originalPrice}</span>
              )}
              <span className="text-slate-500">one-time</span>
            </div>

            {/* Features List */}
            <ul className="space-y-3 mb-8 text-slate-600">
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Instant eSIM delivery via email
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                QR code + manual installation
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Works in {plan?.countryName || country}
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {plan?.unusedValidTime || 180} days validity
              </li>
            </ul>

            <Link 
              href={`/checkout?planId=${plan?.id}&qty=1`}
              className="block text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Buy Now - ${displayPrice}
            </Link>

            <p className="text-center text-sm text-slate-500 mt-4">
              Secure payment • Instant delivery • 24/7 support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}