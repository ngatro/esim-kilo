"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useI18n } from "@/components/providers/I18nProvider";
import PlansSection from "@/components/sections/PlansSection";
import  FadeIn  from "@/components/animations/FadeIn";
import DeviceCompatibility from "@/components/sections/DeviceCompatibility";
import Comparison from "@/components/sections/Comparison";
import Coverage from "@/components/sections/Coverage";
import Testimonials from "@/components/sections/Testimonials";
import TrustBadges from "@/components/sections/TrustBadges";
import WhyChoose from "@/components/sections/WhyChoose";
import FAQ from "@/components/sections/FAQ";
import Partners from "@/components/sections/Partners";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";



// const DEVICE_IMAGES: Record<string, string> = {
//   "iPhone": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80",
//   "Samsung": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80",
//   "Google Pixel": "https://images.unsplash.com/photo-1598327105666-5b89351aff70?w=600&q=80",
//   "Other Android": "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=600&q=80",
//   "iPad": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
//   "Laptops": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
// };
// function DeviceCompatibility() {
//   const { t } = useI18n();
//   const devices = [
//     { icon: "📱", name: "iPhone", models: "XS, XS Max, XR, 11, 12, 13, 14, 15, SE (2020+)", supported: true },
//     { icon: "📱", name: "Samsung", models: "Galaxy S20, S21, S22, S23, S24, Fold, Flip series", supported: true },
//     { icon: "📱", name: "Google Pixel", models: "Pixel 3, 4, 5, 6, 7, 8 series", supported: true },
//     { icon: "📱", name: "Other Android", models: "Most phones with eSIM support", supported: true },
//     { icon: "💻", name: "iPad", models: "iPad Pro, Air, Mini with cellular", supported: true },
//     { icon: "🖥️", name: "Laptops", models: "Windows 11 PCs with eSIM", supported: false },
//   ];

//   return (
//     <section className="py-24 bg-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <FadeIn>
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-slate-800 mb-4">{t("device.title")}</h2>
//             <p className="text-slate-600 text-lg max-w-2xl mx-auto">
//               {t("device.subtitle")}
//             </p>
//           </div>
//         </FadeIn>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {devices.map((device, index) => (
//             <FadeIn key={index} delay={index * 0.1}>
//               <motion.div 
//                 className={`bg-white border rounded-2xl overflow-hidden ${device.supported ? 'border-slate-200 hover:border-orange-400 hover:shadow-lg' : 'border-slate-100 opacity-60'}`}
//                 whileHover={{ scale: 1.02 }}
//               >
//                 <div className="relative h-40 bg-slate-100">
//                   <Image
//                     src={DEVICE_IMAGES[device.name] || DEVICE_IMAGES["Other Android"]}
//                     alt={device.name}
//                     fill
//                     className="object-cover"
//                     unoptimized
//                     loading="eager"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
//                   <div className="absolute bottom-3 left-4">
//                     <span className="text-3xl">{device.icon}</span>
//                   </div>
//                 </div>
//                 <div className="p-5">
//                   <div className="flex items-center gap-2 mb-1">
//                     <h3 className="text-lg font-semibold text-slate-800">{device.name}</h3>
//                     {device.supported && (
//                       <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">Supported</span>
//                     )}
//                   </div>
//                   <p className="text-sm text-slate-500">{device.models}</p>
//                 </div>
//               </motion.div>
//             </FadeIn>
//           ))}
//         </div>

//         <FadeIn delay={0.3}>
//           <div className="mt-12 bg-orange-50 border border-slate-200 rounded-2xl p-8 text-center">
//             <p className="text-slate-600 mb-4">Not sure if your device supports eSIM?</p>
//             <a href="/compatibility" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium">
//               Check full compatibility list
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//               </svg>
//             </a>
//           </div>
//         </FadeIn>
//       </div>
//     </section>
//   );
// }

// function Comparison() {
//   return (
//     <section className="py-24 bg-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <FadeIn>
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-slate-800 mb-4">Why Choose OW SIM?</h2>
//             <p className="text-slate-600 text-lg max-w-2xl mx-auto">
//               Compare OW SIM with traditional roaming and see how much you can save
//             </p>
//           </div>
//         </FadeIn>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           <FadeIn delay={0}>
//             <motion.div 
//               className="bg-orange-50 border border-orange-200 rounded-2xl p-8"
//               whileHover={{ y: -5 }}
//             >
//               <h3 className="text-xl font-bold text-slate-800 mb-6">OW SIM eSIM</h3>
//               <ul className="space-y-4">
//                 {[
//                   "Up to 80% cheaper",
//                   "Instant activation",
//                   "No contract required",
//                   "190+ countries",
//                   "24/7 support",
//                   "No hidden fees"
//                 ].map((item, i) => (
//                   <li key={i} className="flex items-center gap-3 text-slate-600">
//                     <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                     </svg>
//                     {item}
//                   </li>
//                 ))}
//               </ul>
//             </motion.div>
//           </FadeIn>

//           <FadeIn delay={0.1}>
//             <motion.div 
//               className="bg-cyan-50 border-2 border-cyan-500 rounded-2xl p-8 relative"
//               whileHover={{ y: -5 }}
//             >
//               <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full">
//                 RECOMMENDED
//               </div>
//               <h3 className="text-xl font-bold text-slate-800 mb-6">Traditional Roaming</h3>
//               <ul className="space-y-4">
//                 {[
//                   "Expensive daily fees",
//                   "Activation in 24-48 hours",
//                   "Long-term contracts",
//                   "Limited coverage",
//                   "Limited support",
//                   "Surprise charges"
//                 ].map((item, i) => (
//                   <li key={i} className="flex items-center gap-3 text-slate-500">
//                     <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                     </svg>
//                     {item}
//                   </li>
//                 ))}
//               </ul>
//             </motion.div>
//           </FadeIn>

//           <FadeIn delay={0.2}>
//             <motion.div 
//               className="bg-slate-50 border border-slate-200 rounded-2xl p-8"
//               whileHover={{ y: -5 }}
//             >
//               <h3 className="text-xl font-bold text-slate-800 mb-6">Local SIM Cards</h3>
//               <ul className="space-y-4">
//                 {[
//                   "Requires physical store",
//                   "Language barrier",
//                   "Only works in one country",
//                   "Complex setup",
//                   "Limited data options",
//                   "Phone number issues"
//                 ].map((item, i) => (
//                   <li key={i} className="flex items-center gap-3 text-slate-500">
//                     <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                     </svg>
//                     {item}
//                   </li>
//                 ))}
//               </ul>
//             </motion.div>
//           </FadeIn>
//         </div>
//       </div>
//     </section>
//   );
// }

// function Coverage() {
//   const { t } = useI18n();
//   const regions = [
//     { name: "Europe", countries: "35+", flag: "🇪🇺", color: "bg-blue-100" },
//     { name: "Asia", countries: "40+", flag: "🌏", color: "bg-red-100" },
//     { name: "Americas", countries: "30+", flag: "🌎", color: "bg-green-100" },
//     { name: "Middle East", countries: "15+", flag: "🕌", color: "bg-purple-100" },
//     { name: "Africa", countries: "50+", flag: "🌍", color: "bg-yellow-100" },
//     { name: "Oceania", countries: "10+", flag: "🦘", color: "bg-pink-100" },
//   ];

//   const topCountries = [
//     "🇺🇸 United States", "🇬🇧 United Kingdom", "🇫🇷 France", "🇩🇪 Germany",
//     "🇮🇹 Italy", "🇪🇸 Spain", "🇯🇵 Japan", "🇰🇷 South Korea", "🇦🇺 Australia",
//     "🇨🇦 Canada", "🇹🇭 Thailand", "🇻🇳 Vietnam", "🇸🇬 Singapore", "🇦🇪 UAE"
//   ];

//   return (
//     <section className="py-24 bg-orange-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <FadeIn>
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-slate-800 mb-4">{t("coverage.title")}</h2>
//             <p className="text-slate-600 text-lg max-w-2xl mx-auto">
//               {t("coverage.subtitle")}
//             </p>
//           </div>
//         </FadeIn>

//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
//           {regions.map((region, index) => (
//             <FadeIn key={index} delay={index * 0.1}>
//               <motion.div 
//                 className={`${region.color} border border-slate-200 rounded-xl p-4 text-center hover:border-orange-400 hover:shadow-md transition-all cursor-pointer`}
//                 whileHover={{ scale: 1.05 }}
//               >
//                 <div className="text-3xl mb-2">{region.flag}</div>
//                 <h3 className="font-semibold text-slate-800">{region.name}</h3>
//                 <p className="text-sm text-slate-500">{region.countries} countries</p>
//               </motion.div>
//             </FadeIn>
//           ))}
//         </div>

//         <FadeIn delay={0.3}>
//           <div className="bg-white border border-slate-200 rounded-2xl p-8">
//             <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Popular Destinations</h3>
//             <div className="flex flex-wrap justify-center gap-3">
//               {topCountries.map((country, index) => (
//                 <span key={index} className="bg-orange-100 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-orange-200 hover:text-orange-800 transition-colors cursor-pointer">
//                   {country}
//                 </span>
//               ))}
//             </div>
//           </div>
//         </FadeIn>
//       </div>
//     </section>
//   );
// }

// function Testimonials() {
//   const { t } = useI18n();
//   const testimonials = [
//     {
//       name: "Sarah M.",
//       location: "United States",
//       text: `${t("testimonials.says.sarah")}`,
//       rating: 5,
//       flag: "🇺🇸",
//       image: "https://images.unsplash.com/photo-1618656172765-26774a4a38d2?q=80&w=1744&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
//     },
//     {
//       name: "Marco D.",
//       location: "Italy",
//       text: `${t("testimonials.says.marco")}`,
//       rating: 5,
//       flag: "🇮🇹",
//       image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&q=80"
//     },
//     {
//       name: "James T.",
//       location: "United Kingdom",
//       text: `${t("testimonials.says.james")}`,
//       rating: 5,
//       flag: "🇬🇧",
//       image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&q=80"
//     },
//     {
//       name: "Lisa Chen",
//       location: "Australia",
//       text: `${t("testimonials.says.lisa")}`,
//       rating: 5,
//       flag: "🇦🇺",
//       image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400&q=80"
//     },
//     {
//       name: "Carlos R.",
//       location: "Spain",
//       text: `${t("testimonials.says.carlos")}`,
//       rating: 5,
//       flag: "🇪🇸",
//       image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&q=80"
//     },
//     {
//       name: "Min-Ji K.",
//       location: "South Korea",
//       text: `${t("testimonials.says.minji")}`,
//       rating: 5,
//       flag: "🇰🇷",
//       image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&q=80"
//     },
//     {
//       name: "Ahmed M.",
//       location: "UAE",
//       text: `${t("testimonials.says.ahmed")}`,
//       rating: 5,
//       flag: "🇦🇪",
//       image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80"
//     },
//     {
//       name: "Emma W.",
//       location: "Canada",
//       text: `${t("testimonials.says.emma")}`,
//       rating: 5,
//       flag: "🇨🇦",
//       image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400&q=80"
//     },
//   ];

//   return (
//     <section className="py-24 bg-cyan-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <FadeIn>
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-slate-800 mb-4">{t("testimonials.title")}</h2>
//             <p className="text-slate-600 text-lg max-w-2xl mx-auto">
//               {t("testimonials.subtitle")}
//             </p>
//           </div>
//         </FadeIn>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {testimonials.map((testimonial, index) => (
//             <FadeIn key={index} delay={index * 0.1}>
//               <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all hover:-translate-y-1">
//                 <div className="relative h-32 bg-slate-200">
//                   <Image
//                     src={testimonial.image}
//                     alt={testimonial.location}
//                     fill
//                     className="object-cover"
//                     unoptimized
//                     loading="eager"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
//                   <div className="absolute bottom-3 left-4">
//                     <span className="text-2xl">{testimonial.flag}</span>
//                   </div>
//                 </div>
//                 <div className="p-5">
//                   <div className="flex items-center gap-1 mb-3">
//                     {[...Array(testimonial.rating)].map((_, i) => (
//                       <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                       </svg>
//                     ))}
//                   </div>
//                   <p className="text-slate-600 mb-3 text-sm leading-relaxed">&quot;{testimonial.text}&quot;</p>
//                   <div>
//                     <p className="text-slate-800 font-medium">{testimonial.name}</p>
//                     <p className="text-slate-500 text-xs">{testimonial.location}</p>
//                   </div>
//                 </div>
//               </div>
//             </FadeIn>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function TrustBadges() {
//   const { t } = useI18n();
//   const badges = [
//     { emoji: "🌍", value: "190+", label: `${t("trust.countries")}` },
//     { emoji: "📱", value: "500K+", label: `${t("trust.users")}` },
//     { emoji: "⚡", value: "5 min", label: `${t("trust.setup")}` },
//     { emoji: "💬", value: "24/7", label: `${t("trust.support")}` },
//     { emoji: "⭐", value: "4.9/5", label: `${t("trust.rating")}` },
//     { emoji: "💰", value: "80%", label: `${t("trust.savings")}` },
//   ];

//   return (
//     <section className="py-16 bg-orange-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
//           {badges.map((badge, index) => (
//             <FadeIn key={index} delay={index * 0.1}>
//               <motion.div 
//                 className="text-center"
//                 whileHover={{ scale: 1.05 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//               >
//                 <div className="text-4xl mb-2">{badge.emoji}</div>
//                 <p className="text-3xl font-bold text-slate-800">{badge.value}</p>
//                 <p className="text-slate-500">{badge.label}</p>
//               </motion.div>
//             </FadeIn>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function WhyChoose() {
//   const { t } = useI18n();
//   const features = [
//     {
//       icon: "⚡",
//       title: `${t("whyChoose.features.instant.title")}`,
//       description: `${t("whyChoose.features.instant.desc")}`
//     },
//     {
//       icon: "💰",
//       title: `${t("whyChoose.features.save.title")}`,
//       description: `${t("whyChoose.features.save.desc")}`
//     },
//     {
//       icon: "🔒",
//       title: `${t("whyChoose.features.secure.title")}`,
//       description: `${t("whyChoose.features.secure.desc")}`
//     },
//     {
//       icon: "🌐",
//       title: `${t("whyChoose.features.global.title")}`,
//       description: `${t("whyChoose.features.global.desc")}`
//     },
//     {
//       icon: "📱",
//       title: `${t("whyChoose.features.easy.title")}`,
//       description: `${t("whyChoose.features.easy.desc")}`
//     },
//     {
//       icon: "💳",
//       title: `${t("whyChoose.features.noContract.title")}`,
//       description: `${t("whyChoose.features.noContract.desc")}`
//     }
//   ];

//   return (
//     <section className="py-24 bg-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <FadeIn>
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-slate-800 mb-4">{t("whyChoose.title")}</h2>
//             <p className="text-slate-600 text-lg max-w-2xl mx-auto">
//               {t("whyChoose.subtitle")}
//             </p>
//           </div>
//         </FadeIn>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {features.map((feature, index) => (
//             <FadeIn key={index} delay={index * 0.1}>
//               <motion.div 
//                 className="bg-orange-50 border border-orange-200 rounded-2xl p-8 hover:border-orange-400 hover:shadow-lg transition-all hover:-translate-y-1"
//                 whileHover={{ scale: 1.02 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//               >
//                 <div className="text-4xl mb-4">{feature.icon}</div>
//                 <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
//                 <p className="text-slate-600 leading-relaxed">{feature.description}</p>
//               </motion.div>
//             </FadeIn>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function FAQ() {
//   const { t } = useI18n();
//   const faqs = [
//     {
//       q: `${t("faq.questions.whatIsEsim")}`,
//       a: `${t("faq.answers.whatIsEsim")}`
//     },
//     {
//       q: `${t("faq.questions.howToKnow")}`,
//       a: `${t("faq.answers.howToKnowAns")}`
//     },
//     {
//       q: `${t("faq.questions.activationTime")}`,
//       a: `${t("faq.answers.activationTimeAns")}`
//     },
//     {
//       q: `${t("faq.questions.keepOriginal")}`,
//       a: `${t("faq.answers.keepOriginalAns")}`
//     },
//     {
//       q: `${t("faq.questions.runOutData")}`,
//       a: `${t("faq.answers.runOutDataAns")}`
//     },
//     {
//       q: `${t("faq.questions.refund")}`,
//       a: `${t("faq.answers.refundAns")}`
//     },
//     {
//       q: `${t("faq.questions.cruiseShip")}`,
//       a: `${t("faq.answers.cruiseShipAns")}`
//     },
//     {
//       q: `${t("faq.questions.hotspot")}`,
//       a: `${t("faq.answers.hotspotAns")}`
//     },
//   ];

//   return (
//     <section id="faq" className="py-24 bg-orange-50">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         <FadeIn>
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-bold text-slate-800 mb-4">{t("faq.title")}</h2>
//             <p className="text-slate-600 text-lg">{t("faq.subtitle")}</p>
//           </div>
//         </FadeIn>
        
//         <div className="space-y-4">
//           {faqs.map((faq, index) => (
//             <FadeIn key={index} delay={index * 0.1}>
//               <motion.details 
//                 className="group bg-white border border-slate-200 rounded-xl overflow-hidden"
//                 initial={{ opacity: 0 }}
//                 whileInView={{ opacity: 1 }}
//                 viewport={{ once: true }}
//               >
//                 <summary className="flex items-center justify-between cursor-pointer p-6 font-medium text-slate-800 list-none">
//                   {faq.q}
//                   <span className="transition group-open:rotate-180">
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </span>
//                 </summary>
//                 <div className="text-slate-600 px-6 pb-6">
//                   {faq.a}
//                 </div>
//               </motion.details>
//             </FadeIn>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Partners() {
//   const { t } = useI18n();
//   const networks = [
//   { name: "AT&T", logo: "/at-t.svg", scale: "scale-150" },
//   { name: "T-Mobile", logo: "/t-mobile.svg" },
//   { name: "Vodafone", logo: "/vodafone.svg" },
//   { name: "Orange", logo: "/orange.svg", scale: "scale-150"},
//   { name: "Verizon", logo: "/verizon.svg" },
//   { name: "Softbank", logo: "/softbank.svg" },
//   { name: "Singtel", logo: "/singtel.svg" },
//   { name: "Telefonica", logo: "/telefonica.svg" },
//   { name: "China Mobile", logo: "/china-mobile.svg", scale: "scale-150" },
//   { name: "Viettel", logo: "/viettel.svg" }
// ];

//   return (
//     <section className="py-16 bg-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <FadeIn>
//           <div className="text-center mb-12">
//             <h2 className="text-2xl font-bold text-slate-800 mb-2">{t("partners.title")}</h2>
//             <p className="text-slate-500">{t("partners.subtitle")}</p>
//           </div>
//         </FadeIn>
        
//         <div className="grid grid-cols-2 md:grid-cols-5 gap-10 items-center">
//           {networks.map((network) => (
//             <div 
//               key={network.name} 
//               className="flex items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100"
//             >
//               <Image
//                 src={network.logo}
//                 alt={network.name}
//                 width={150}  // Thêm cái này
//                 height={40}  // Và cái này
//                 title={network.name}
//                 className={`h-8 md:h-10 w-auto object-contain ${network.scale}`} 
//               />
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

export default function Home() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <main>
        {/* <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-orange-50/30" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNHoiIGZpbGw9IiMyMDIzYjYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-2 mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-orange-700 text-sm font-medium">Now serving 190+ countries</span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Stay Connected
                <span className="text-orange-500"> Anywhere </span>
                You Go
              </motion.h1>
              
              <motion.p 
                className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Affordable eSIM data plans for international travel. No roaming fees, no contracts. 
                Instant activation in minutes.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.a
                  href="#plans"
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-orange-500/25"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Browse Plans
                </motion.a>
                <motion.a
                  href="#how-it-works"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-medium text-slate-600 hover:text-slate-800 border border-slate-300 hover:border-slate-400 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  How It Works
                </motion.a>
              </motion.div>

              <motion.div 
                className="flex flex-wrap items-center justify-center gap-8 text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No hidden fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Instant delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>7-day refund policy</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section> */}
        <Hero />

        <TrustBadges />
        <Coverage />
        <WhyChoose />
        <Comparison />
        <DeviceCompatibility />
        <Testimonials />
        <HowItWorks />
        <PlansSection />
        <Partners />
        <FAQ />

        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <motion.div 
                className="bg-orange-50 border border-orange-200 rounded-3xl p-12"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h2 className="text-4xl font-bold text-slate-800 mb-4">
                  {t("cta.title")}
                </h2>
                <p className="text-slate-600 text-lg mb-8 max-w-xl mx-auto">
                  {t("cta.subtitle")}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.a
                    href="#plans"
                    className="w-full sm:w-auto bg-orange-500 hover:bg-orange-400 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors shadow-xl shadow-orange-900/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Find Your Plan
                  </motion.a>
                  <motion.a
                    href="#how-it-works"
                    className="w-full sm:w-auto px-10 py-4 rounded-xl text-lg font-medium text-slate-600 hover:text-slate-800 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Learn More
                  </motion.a>
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </section>
      </main>
    </div>
  );
}
