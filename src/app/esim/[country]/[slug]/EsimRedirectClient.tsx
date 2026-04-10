"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Plan {
  id: string;
  name: string;
  destination: string;
  priceUsd: number;
  retailPriceUsd: number;
  dataAmount: number;
  durationDays: number;
  // Add other fields as needed
}

export default function EsimRedirectClient({ planId, country, slug }: { planId: string; country: string; slug: string }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Keep the current SEO-friendly URL in browser address bar
    // (already at /esim/{country}/{slug} but ensure it stays on any client-side navigation)
    // This runs after plan fetch to ensure URL doesn't change
    
    // Fetch plan by ID for display
    fetch(`/api/plans?id=${planId}`)
      .then(res => res.json())
      .then(data => {
        if (data.plans?.[0]) setPlan(data.plans[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [planId, country, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!plan) {
    return <div className="min-h-screen flex items-center justify-center">Plan not found</div>;
  }

  // Render plan details inline with country in URL
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-4">{plan.destination}</h1>
        <p className="text-2xl font-bold text-orange-500">${plan.priceUsd}</p>
        <a href={`/checkout?planId=${plan.id}&qty=1`} className="mt-4 inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-medium">
          Buy Now
        </a>
      </div>
    </div>
  );
}