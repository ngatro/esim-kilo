"use client";

import FadeIn from "../animations/FadeIn";
import Image from "next/image";
import { useI18n } from "../providers/I18nProvider";

export default function Testimonials() {
  const { t } = useI18n();
  const testimonials = [
    {
      name: "Sarah M.",
      location: "United States",
      text: `${t("testimonials.says.sarah")}`,
      rating: 5,
      flag: "🇺🇸",
      image: "https://images.unsplash.com/photo-1618656172765-26774a4a38d2?q=80&w=1744&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      name: "Marco D.",
      location: "Italy",
      text: `${t("testimonials.says.marco")}`,
      rating: 5,
      flag: "🇮🇹",
      image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&q=80"
    },
    {
      name: "James T.",
      location: "United Kingdom",
      text: `${t("testimonials.says.james")}`,
      rating: 5,
      flag: "🇬🇧",
      image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&q=80"
    },
    {
      name: "Lisa Chen",
      location: "Australia",
      text: `${t("testimonials.says.lisa")}`,
      rating: 5,
      flag: "🇦🇺",
      image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400&q=80"
    },
    {
      name: "Carlos R.",
      location: "Spain",
      text: `${t("testimonials.says.carlos")}`,
      rating: 5,
      flag: "🇪🇸",
      image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&q=80"
    },
    {
      name: "Min-Ji K.",
      location: "South Korea",
      text: `${t("testimonials.says.minji")}`,
      rating: 5,
      flag: "🇰🇷",
      image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&q=80"
    },
    {
      name: "Ahmed M.",
      location: "UAE",
      text: `${t("testimonials.says.ahmed")}`,
      rating: 5,
      flag: "🇦🇪",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80"
    },
    {
      name: "Emma W.",
      location: "Canada",
      text: `${t("testimonials.says.emma")}`,
      rating: 5,
      flag: "🇨🇦",
      image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400&q=80"
    },
  ];

  return (
    <section className="py-24 bg-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">{t("testimonials.title")}</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              {t("testimonials.subtitle")}
            </p>
          </div>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="relative h-32 bg-slate-200">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.location}
                    fill
                    className="object-cover"
                    unoptimized
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-2xl">{testimonial.flag}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-600 mb-3 text-sm leading-relaxed">&quot;{testimonial.text}&quot;</p>
                  <div>
                    <p className="text-slate-800 font-medium">{testimonial.name}</p>
                    <p className="text-slate-500 text-xs">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}