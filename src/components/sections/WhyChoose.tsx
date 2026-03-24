"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import { useI18n } from "@/components/providers/I18nProvider";

    export default function WhyChoose() {
        const { t } = useI18n();
        const features = [
            {
            icon: "⚡",
            title: "instant",
            description: "Get your eSIM QR code via email within minutes of purchase. Start using data immediately."
            },
            {
            icon: "💰",
            title: "save",
            description: "Avoid expensive roaming fees from your home carrier. Get affordable data for all your travels."
            },
            {
            icon: "🔒",
            title: "secure",
            description: "Your payment information is encrypted and secure. We use industry-standard security."
            },
            {
            icon: "🌐",
            title: "global",
            description: "Connect in 190+ countries worldwide with our reliable partner networks."
            },
            {
            icon: "📱",
            title: "easy",
            description: "Simple QR code installation. No physical SIM card needed."
            },
            {
            icon: "💳",
            title: "noContract",
            description: "Pay as you go. No monthly fees, commitments, or hidden costs."
            }
        ];

        return (
            <section className="py-24 bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <FadeIn>
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">{t("whyChoose.title")}</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    {t("whyChoose.subtitle")}
                    </p>
                </div>
                </FadeIn>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <FadeIn key={index} delay={index * 0.1}>
                    <motion.div 
                        className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 hover:border-sky-500/30 transition-all hover:-translate-y-1"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="text-4xl mb-4">{feature.icon}</div>
                        <h3 className="text-xl font-semibold text-white mb-2">{t(`whyChoose.features.${feature.title}.title`)}</h3>

                        {/* <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3> */}
                        <p className="text-slate-400 leading-relaxed">{t(`whyChoose.features.${feature.title}.desc`)}</p>
                    </motion.div>
                    </FadeIn>
                ))}
                </div>
            </div>
            </section>
        );
        }
