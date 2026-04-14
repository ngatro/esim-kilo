"use client";
import Image from "next/image";
import FadeIn from "../animations/FadeIn";
import { useI18n } from "../providers/I18nProvider";



export default function Partners() {
    const { t } = useI18n();
    const networks = [
      { name: "AT&T", logo: "/at-t.svg", scale: "scale-150" },
      { name: "T-Mobile", logo: "/t-mobile.svg" },
      { name: "Vodafone", logo: "/vodafone.svg" },
      { name: "Orange", logo: "/orange.svg", scale: "scale-150"},
      { name: "Verizon", logo: "/verizon.svg" },
      { name: "Softbank", logo: "/softbank.svg" },
      { name: "Singtel", logo: "/singtel.svg" },
      { name: "Telefonica", logo: "/telefonica.svg" },
      { name: "China Mobile", logo: "/china-mobile.svg", scale: "scale-150" },
      { name: "Viettel", logo: "/viettel.svg" }
    ];

      return (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{t("partners.title")}</h2>
                <p className="text-slate-500">{t("partners.subtitle")}</p>
              </div>
            </FadeIn>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 items-center">
              {networks.map((network) => (
                <div 
                  key={network.name} 
                  className="flex items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100"
                >
                  <Image
                    src={network.logo}
                    alt={network.name}
                    width={150}  
                    height={40} 
                    title={network.name}
                    className={`h-8 md:h-10 w-auto object-contain ${network.scale}`} 
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }