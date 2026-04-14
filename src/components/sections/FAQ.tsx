"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import { useI18n } from "@/components/providers/I18nProvider";




export default function FAQ() {
const { t } = useI18n();
  const faqs = [
    {
      q: `${t("faq.questions.whatIsEsim")}`,
      a: `${t("faq.answers.whatIsEsim")}`
    },
    {
      q: `${t("faq.questions.howToKnow")}`,
      a: `${t("faq.answers.howToKnowAns")}`
    },
    {
      q: `${t("faq.questions.activationTime")}`,
      a: `${t("faq.answers.activationTimeAns")}`
    },
    {
      q: `${t("faq.questions.keepOriginal")}`,
      a: `${t("faq.answers.keepOriginalAns")}`
    },
    {
      q: `${t("faq.questions.runOutData")}`,
      a: `${t("faq.answers.runOutDataAns")}`
    },
    {
      q: `${t("faq.questions.refund")}`,
      a: `${t("faq.answers.refundAns")}`
    },
    {
      q: `${t("faq.questions.cruiseShip")}`,
      a: `${t("faq.answers.cruiseShipAns")}`
    },
    {
      q: `${t("faq.questions.hotspot")}`,
      a: `${t("faq.answers.hotspotAns")}`
    },
  ];

  return (
    <section id="faq" className="py-24 bg-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">{t("faq.title")}</h2>
            <p className="text-slate-600 text-lg">{t("faq.subtitle")}</p>
          </div>
        </FadeIn>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <motion.details 
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <summary className="flex items-center justify-between cursor-pointer p-6 font-medium text-slate-800 list-none">
                  {faq.q}
                  <span className="transition group-open:rotate-180">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="text-slate-600 px-6 pb-6">
                  {faq.a}
                </div>
              </motion.details>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}