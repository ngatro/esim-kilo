"use client";

import FadeIn from "../animations/FadeIn";
import { useI18n } from "../providers/I18nProvider";



export default function Partners() {
    const { t } = useI18n();
    const networks = [
        "AT&T", "T-Mobile", "Vodafone", "Orange", "Telefonica", 
        "Deutsche Telekom", "Singtel", "Telstra", "Docomo", "SK Telecom"
    ];

  return (
    <section className="py-16 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">{t("partners.title")}</h2>
            <p className="text-slate-500">{t("partners.subtitle")}</p>
          </div>
        </FadeIn>
        
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
          {networks.map((network, index) => (
            <FadeIn key={index} delay={index * 0.05}>
              <div className="text-xl font-bold text-slate-500 hover:text-white transition-colors cursor-pointer">
                {network}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}