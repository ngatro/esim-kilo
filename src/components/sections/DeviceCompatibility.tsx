"use client";

import { motion } from "framer-motion";
import FadeIn from "../animations/FadeIn";
import { useI18n } from "../providers/I18nProvider";


export default function DeviceCompatibility() {
  const { t } = useI18n();
  const devices = [
    { icon: "📱", name: "iPhone", models: "XS, XS Max, XR, 11, 12, 13, 14, 15, SE (2020+)", supported: true },
    { icon: "📱", name: "Samsung", models: "Galaxy S20, S21, S22, S23, S24, Fold, Flip series", supported: true },
    { icon: "📱", name: "Google Pixel", models: "Pixel 3, 4, 5, 6, 7, 8 series", supported: true },
    { icon: "📱", name: "Other Android", models: "Most phones with eSIM support", supported: true },
    { icon: "💻", name: "iPad", models: "iPad Pro, Air, Mini with cellular", supported: true },
    { icon: "🖥️", name: "Laptops", models: "Windows 11 PCs with eSIM", supported: false },
  ];

  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t("device.title")}</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t("device.subtitle")}
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <motion.div 
                className={`bg-slate-900 border rounded-2xl p-6 ${device.supported ? 'border-slate-700 hover:border-sky-500/50' : 'border-slate-800 opacity-60'}`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{device.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">{device.name}</h3>
                      {device.supported && (
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">{t("device.supported")}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">{device.models}</p>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <div className="mt-12 bg-slate-900/50 border border-slate-700 rounded-2xl p-8 text-center">
            <p className="text-slate-300 mb-4">{t("device.notSure")}</p>
            <a href="#" className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-medium">
              {t("device.checkList")}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}