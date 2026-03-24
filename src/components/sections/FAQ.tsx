"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import { useI18n } from "@/components/providers/I18nProvider";




export default function FAQ() {
  const { t } = useI18n();
  const faqs = [
    {
      q: "whatIsEsim",
      a: "whatIsEsimAns"
    },
    {
      q: "howToKnow",
      a: "howToKnowAns"
    },
    {
      q: "activationTime",
      a: "activationTimeAns"
    },
    {
      q: "keepOriginal",
      a: "keepOriginalAns"
    },
    {
      q: "runOutData",
      a: "runOutDataAns"
    },
    {
      q: "refund",
      a: "refundAns"
    },
    {
      q: "cruiseShip",
      a: "cruiseShipAns"
    },
    {
      q: "hotspot",
      a: "hotspotAns"
    },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-800/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t("faq.title")}</h2>
            <p className="text-slate-400 text-lg">{t("faq.subtitle")}</p>
          </div>
        </FadeIn>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <motion.details 
                className="group bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <summary className="flex items-center justify-between cursor-pointer p-6 font-medium text-white list-none">
                  {t(`faq.questions.${faq.q}`)}
                  <span className="transition group-open:rotate-180">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="text-slate-400 px-6 pb-6">
                  {t(`faq.questions.${faq.a}`)}
                </div>
              </motion.details>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
