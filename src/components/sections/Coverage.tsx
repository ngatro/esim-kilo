"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import { useI18n } from "@/components/providers/I18nProvider";



export default function Coverage() {
  const { t } = useI18n();
  const regions = [
    { name: "Europe", countries: "35+", flag: "🇪🇺", color: "bg-blue-500/20" },
    { name: "Asia", countries: "40+", flag: "🌏", color: "bg-red-500/20" },
    { name: "Americas", countries: "30+", flag: "🌎", color: "bg-green-500/20" },
    { name: "Middle East", countries: "15+", flag: "🕌", color: "bg-purple-500/20" },
    { name: "Africa", countries: "50+", flag: "🌍", color: "bg-yellow-500/20" },
    { name: "Oceania", countries: "10+", flag: "🦘", color: "bg-pink-500/20" },
  ];

  const topCountries = [
    "🇺🇸 United States", "🇬🇧 United Kingdom", "🇫🇷 France", "🇩🇪 Germany",
    "🇮🇹 Italy", "🇪🇸 Spain", "🇯🇵 Japan", "🇰🇷 South Korea", "🇦🇺 Australia",
    "🇨🇦 Canada", "🇹🇭 Thailand", "🇻🇳 Vietnam", "🇸🇬 Singapore", "🇦🇪 UAE"
  ];

  return (
    <section className="py-24 bg-slate-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t("coverage.title")}</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t("coverage.subtitle")}
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {regions.map((region, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <motion.div 
                className={`${region.color} border border-slate-700 rounded-xl p-4 text-center hover:border-sky-500/50 transition-all cursor-pointer`}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl mb-2">{region.flag}</div>
                <h3 className="font-semibold text-white">{region.name}</h3>
                <p className="text-sm text-slate-400">{region.countries} {t("coverage.countries")}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4 text-center">{t("coverage.popular")}</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {topCountries.map((country, index) => (
                <span key={index} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm hover:bg-sky-500/20 hover:text-sky-300 transition-colors cursor-pointer">
                  {country}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}