import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";

interface PlanCardData {
  id: string;
  name: string;
  slug: string | null;
  destination: string;
  dataAmount: number;
  durationDays: number;
  priceUsd: number;
  retailPriceUsd: number;
  speed: string | null;
  regionName: string | null;
  countryName: string | null;
  coverageCount: number;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
}

interface PlanCardProps {
  plan: PlanCardData;
}

function formatData(gb: number): string {
  if (gb >= 999) return "Unlimited";
  if (gb < 1) return `${Math.round(gb * 1024)}MB`;
  return `${gb}GB`;
}

export default function PlanCard({ plan }: PlanCardProps) {
  const { formatPrice } = useI18n();
  const isUnlimited = plan.dataAmount >= 999;
  const displayPrice = (plan.retailPriceUsd && plan.retailPriceUsd > 0) ? plan.retailPriceUsd : plan.priceUsd;
  const hasDiscount = plan.retailPriceUsd > 0 && plan.retailPriceUsd > plan.priceUsd;
  const pricePerDay = formatPrice(displayPrice / plan.durationDays);

  return (
    <div
      className={`relative flex flex-col bg-slate-800/60 border rounded-2xl p-5 hover:border-sky-500/60 hover:bg-slate-800 transition-all duration-200 group ${
        plan.isPopular || plan.isBestSeller ? "border-sky-500/50 shadow-lg shadow-sky-900/20" : "border-slate-700/60"
      }`}
    >
      {(plan.isBestSeller || plan.isHot || plan.badge) && (
        <span className="absolute -top-3 left-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
          {plan.isBestSeller ? "BEST SELLER" : plan.isHot ? "HOT" : plan.badge}
        </span>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-white">{plan.destination}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {plan.coverageCount > 1 ? `${plan.coverageCount} countries` : plan.countryName || plan.regionName}
          </p>
        </div>
        <div className="text-right">
          {hasDiscount && (
            <p className="text-xs text-slate-500 line-through">{formatPrice(plan.priceUsd)}</p>
          )}
          <p className="text-xl font-bold text-white">{formatPrice(displayPrice)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-900/60 rounded-xl p-2 text-center">
          <p className={`font-bold ${isUnlimited ? "text-sm" : "text-lg"} text-sky-400`}>{formatData(plan.dataAmount)}</p>
          <p className="text-[10px] text-slate-500">Data</p>
        </div>
        <div className="bg-slate-900/60 rounded-xl p-2 text-center">
          <p className="text-lg font-bold text-white">{plan.durationDays}</p>
          <p className="text-[10px] text-slate-500">Days</p>
        </div>
        <div className="bg-slate-900/60 rounded-xl p-2 text-center">
          <p className="text-sm font-bold text-emerald-400">{pricePerDay}</p>
          <p className="text-[10px] text-slate-500">/Day</p>
        </div>
      </div>

      <Link
        href={`/plans/${plan.slug || plan.id}`}
        className="block w-full text-center py-2 rounded-xl text-sm font-semibold bg-slate-700 hover:bg-sky-500 text-white transition-all"
      >
        Buy Now
      </Link>
    </div>
  );
}