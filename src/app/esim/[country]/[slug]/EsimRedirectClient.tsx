"use client";

import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  destination: string;
  priceUsd: number;
  retailPriceUsd: number;
  dataAmount: number;
  durationDays: number;
  packageCode: string;
}

export default function EsimRedirectClient({ plan, country, slug }: { plan: any; country: string; slug: string }) {
  const displayPrice = plan?.retailPriceUsd > 0 ? plan.retailPriceUsd : plan?.priceUsd || 0;
  
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
        <h1 className="text-4xl font-bold text-slate-800 mb-4">{plan?.destination}</h1>
        
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-4xl font-bold text-orange-500">${displayPrice}</span>
          <span className="text-slate-500">one-time</span>
        </div>

        <Link 
          href={`/checkout?planId=${plan?.id}&qty=1`}
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
        >
          Buy Now - ${displayPrice}
        </Link>

        <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Data</p>
            <p className="text-lg font-semibold text-slate-800">{plan?.dataAmount || 0}MB</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Validity</p>
            <p className="text-lg font-semibold text-slate-800">{plan?.durationDays} Days</p>
          </div>
        </div>
      </div>
    </div>
  );
}