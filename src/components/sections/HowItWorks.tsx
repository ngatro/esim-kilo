"use client";

import { motion } from "framer-motion";
import FadeIn from "../animations/FadeIn";
import { useI18n } from "../providers/I18nProvider";


export default function HowItWorks() {
  const { t } = useI18n();
  return (
    <section id="how-it-works" className="py-24 bg-slate-800/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">{t("howItWorks.title")}</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  {t("howItWorks.subtitle")}
                </p>
              </div>
            </FadeIn>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: "1", icon: "📋", title: t("howItWorks.step1"), desc: t("howItWorks.step1Desc") },
                { step: "2", icon: "💳", title: t("howItWorks.step2"), desc: t("howItWorks.step2Desc") },
                { step: "3", icon: "📧", title: t("howItWorks.step3"), desc: t("howItWorks.step3Desc") },
                { step: "4", icon: "📱", title: t("howItWorks.step4"), desc: t("howItWorks.step4Desc") },
              ].map((item, index) => (
                <FadeIn key={index} delay={index * 0.15}>
                  <motion.div 
                    className="relative"
                    whileHover={{ y: -5 }}
                  >
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center hover:border-sky-500/30 transition-all">
                      <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">{item.icon}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                    {index < 3 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <svg className="w-8 h-8 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
  );
}
