"use client";

import { motion } from "framer-motion";

import { useI18n } from "../providers/I18nProvider";
import FadeIn from "../animations/FadeIn";

export default function CTA() {
  const { t } = useI18n();
  
  return (
    <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <motion.div 
                className="bg-linear-to-br from-sky-600/20 to-indigo-600/20 border border-sky-500/20 rounded-3xl p-12"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h2 className="text-4xl font-bold text-white mb-4">
                  {t("cta.title")}
                </h2>
                <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
                  {t("cta.subtitle")}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.a
                    href="#plans"
                    className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors shadow-xl shadow-sky-900/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t("cta.button")}
                  </motion.a>
                  <motion.a
                    href="#how-it-works"
                    className="w-full sm:w-auto px-10 py-4 rounded-xl text-lg font-medium text-slate-300 hover:text-white transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t("cta.button1")}
                  </motion.a>
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </section>
      );
}