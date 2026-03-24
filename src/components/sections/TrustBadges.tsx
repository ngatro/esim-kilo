"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import { useI18n } from "@/components/providers/I18nProvider";

export default function TrustBadges() {
    const { t } = useI18n();
    const badges = [
        { emoji: "🌍", value: "190+", label: "Countries" },
        { emoji: "📱", value: "500K+", label: "Happy Users" },
        { emoji: "⚡", value: "5 min", label: "Setup Time" },
        { emoji: "💬", value: "24/7", label: "Support" },
        { emoji: "⭐", value: "4.9/5", label: "User Rating" },
        { emoji: "💰", value: "80%", label: "Savings" },
        ];

return (
    <section className="py-16 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {badges.map((badge, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl mb-2">{badge.emoji}</div>
                <p className="text-3xl font-bold text-white">{badge.value}</p>
                <p className="text-slate-500">{badge.label}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}