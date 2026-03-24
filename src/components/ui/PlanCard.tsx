import Link from "next/link";
import { EsimPlan, formatData } from "@/lib/esim-data";
import { useI18n } from "../providers/I18nProvider";

interface PlanCardProps {
  plan: EsimPlan;
}

export default function PlanCard({ plan }: PlanCardProps) {
  const isUnlimited = plan.dataGb >= 999;
  const { t } = useI18n();

  return (
    <div
      className={`relative flex flex-col bg-slate-800/60 border rounded-2xl p-6 hover:border-sky-500/60 hover:bg-slate-800 transition-all duration-200 group ${
        plan.popular
          ? "border-sky-500/50 shadow-lg shadow-sky-900/20"
          : "border-slate-700/60"
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-5 bg-sky-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
          {plan.badge}
        </span>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-3xl">{plan.flag}</span>
          <h3 className="text-lg font-semibold text-white mt-1">{plan.destination}</h3>
          {plan.coverageCountries > 1 && (
            <p className="text-xs text-slate-500 mt-0.5">{plan.coverageCountries} {t("hero.countries")}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">${plan.priceUsd.toFixed(2)}</p>
          <p className="text-xs text-slate-500">{t("plans.oneTime")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-slate-900/60 rounded-xl p-3 text-center">
          <p className={`font-bold ${isUnlimited ? "text-base" : "text-xl"} text-sky-400`}>
            {formatData(plan.dataGb)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{t("plans.data")}</p>
        </div>
        <div className="bg-slate-900/60 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-sky-400">{plan.validityDays}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t("plans.days")}</p>
        </div>
        <div className="bg-slate-900/60 rounded-xl p-3 text-center">
          <p className="text-sm font-bold text-sky-400 leading-tight">
            {plan.speeds[0].replace(" LTE", "")}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{t("plans.speed")}</p>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-1.5 mb-6 flex-1">
        {plan.features.slice(0, 3).map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-slate-400">
            <svg className="w-3.5 h-3.5 text-sky-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={`/plans/${plan.id}`}
        className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          plan.popular
            ? "bg-sky-500 hover:bg-sky-400 text-white"
            : "bg-slate-700 hover:bg-slate-600 text-white group-hover:bg-sky-500 group-hover:text-white"
        }`}
      >
       {t("plans.getThisPlan")}
      </Link>
    </div>
  );
}
