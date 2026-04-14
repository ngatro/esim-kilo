"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import { useI18n } from "@/components/providers/I18nProvider";

    export default function WhyChoose() {
        const { t } = useI18n();
        const features = [
    {
      icon: "⚡",
      title: `${t("whyChoose.features.instant.title")}`,
      description: `${t("whyChoose.features.instant.desc")}`
    },
    {
      icon: "💰",
      title: `${t("whyChoose.features.save.title")}`,
      description: `${t("whyChoose.features.save.desc")}`
    },
    {
      icon: "🔒",
      title: `${t("whyChoose.features.secure.title")}`,
      description: `${t("whyChoose.features.secure.desc")}`
    },
    {
      icon: "🌐",
      title: `${t("whyChoose.features.global.title")}`,
      description: `${t("whyChoose.features.global.desc")}`
    },
    {
      icon: "📱",
      title: `${t("whyChoose.features.easy.title")}`,
      description: `${t("whyChoose.features.easy.desc")}`
    },
    {
      icon: "💳",
      title: `${t("whyChoose.features.noContract.title")}`,
      description: `${t("whyChoose.features.noContract.desc")}`
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">{t("whyChoose.title")}</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              {t("whyChoose.subtitle")}
            </p>
          </div>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <motion.div 
                className="bg-orange-50 border border-orange-200 rounded-2xl p-8 hover:border-orange-400 hover:shadow-lg transition-all hover:-translate-y-1"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}