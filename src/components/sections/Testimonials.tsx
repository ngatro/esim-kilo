"use client";

import FadeIn from "../animations/FadeIn";
import { useI18n } from "../providers/I18nProvider";

export default function Testimonials() {
  const { t } = useI18n();
  const testimonials = [
    {
      name: "Sarah M.",
      location: "United States",
      text: "SimPal made my Japan trip so much easier! Got a 10GB plan for $14 and had data the whole time. Setup took less than 5 minutes.",
      rating: 5,
      flag: "🇺🇸"
    },
    {
      name: "Marco D.",
      location: "Italy",
      text: "Best eSIM service I've used. Works perfectly in 15 Asian countries. Customer support was helpful when I had questions.",
      rating: 5,
      flag: "🇮🇹"
    },
    {
      name: "James T.",
      location: "United Kingdom",
      text: "Saved over $200 compared to my carrier's roaming. The connection was fast and reliable throughout my Europe trip.",
      rating: 5,
      flag: "🇬🇧"
    },
    {
      name: "Lisa Chen",
      location: "Australia",
      text: "Perfect for digital nomads! I've used OpenWorld eSIM in over 20 countries. The coverage is amazing and prices are unbeatable.",
      rating: 5,
      flag: "🇦🇺"
    },
    {
      name: "Carlos R.",
      location: "Spain",
      text: "The unlimited Japan plan was a game changer. Streamed Netflix and navigated Google Maps without any issues. Highly recommend!",
      rating: 5,
      flag: "🇪🇸"
    },
    {
      name: "Min-Ji K.",
      location: "South Korea",
      text: "Finally a service that actually works in Korea. Used it for 3 weeks and never had connectivity issues. Will use again!",
      rating: 5,
      flag: "🇰🇷"
    },
    {
      name: "Ahmed M.",
      location: "UAE",
      text: "Great coverage in Dubai and Abu Dhabi. The 5G speeds are incredible. Much better than my home carrier's roaming.",
      rating: 5,
      flag: "🇦🇪"
    },
    {
      name: "Emma W.",
      location: "Canada",
      text: "Crossed from US to Canada and the North America plan kept me connected the entire time. Seamless transition!",
      rating: 5,
      flag: "🇨🇦"
    },
  ];

  return (
    <section className="py-24 bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t("testimonials.title")}</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t("testimonials.subtitle")}
            </p>
          </div>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 hover:border-sky-500/30 transition-all hover:-translate-y-1">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-300 mb-4 leading-relaxed">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{testimonial.flag}</span>
                  <div>
                    <p className="text-white font-medium">{testimonial.name}</p>
                    <p className="text-slate-500 text-sm">{testimonial.location}</p>
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