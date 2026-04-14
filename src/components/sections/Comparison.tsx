"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import { useI18n } from "../providers/I18nProvider";

export default function Comparison() {
      const { t } = useI18n();
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">{t("comparison.title")}</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              {t("comparison.subtitle")}
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FadeIn delay={0}>
            <motion.div 
              className="bg-orange-50 border border-orange-200 rounded-2xl p-8 relative"
              whileHover={{ y: -5 }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                {t("comparison.recommended")}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-6">{t("comparison.ow-sim")}</h3>
              <ul className="space-y-4">
                {[
                  t("comparison.features.cheaper"),
                  t("comparison.features.instant"),
                  t("comparison.features.noContract"),
                  t("comparison.features.countries"),
                  t("comparison.features.support"),
                  t("comparison.features.noFees")
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600">
                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <motion.div 
              className="bg-slate-50 border border-slate-200 rounded-2xl p-8"
              whileHover={{ y: -5 }}
            >              
              <h3 className="text-xl font-bold text-slate-800 mb-6">{t("comparison.roaming")}</h3>
              <ul className="space-y-4">
                {[
                  t("comparison.features.expensive"),
                  t("comparison.features.slow"),
                  t("comparison.features.contract"),
                  t("comparison.features.limited"),
                  t("comparison.features.limitedSupport"),
                  t("comparison.features.surprise")
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-500">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <motion.div 
              className="bg-slate-50 border border-slate-200 rounded-2xl p-8"
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-bold text-slate-800 mb-6">{t("comparison.local")}</h3>
              <ul className="space-y-4">
                {[
                  t("comparison.features.store"),
                  t("comparison.features.language"),
                  t("comparison.features.oneCountry"),
                  t("comparison.features.complex"),
                  t("comparison.features.limitedData"),
                  t("comparison.features.number")
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-500">
                    <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}