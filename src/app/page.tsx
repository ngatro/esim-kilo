"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/components/providers/I18nProvider";
import FadeIn from "@/components/animations/FadeIn";
import PlansSection from "@/components/sections/PlansSection";
import Hero from "@/components/sections/Hero";
import TrustBadges from "@/components/sections/TrustBadges";
import Coverage from "@/components/sections/Coverage";
import WhyChoose from "@/components/sections/WhyChoose";
import Comparison from "@/components/sections/Comparison";
import DeviceCompatibility from "@/components/sections/DeviceCompatibility";
import Testimonials from "@/components/sections/Testimonials";
import HowItWorks from "@/components/sections/HowItWorks";
import Partners from "@/components/sections/Partners";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";




export default function Home() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <main>
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
        <CTA />
      </main>
    </div>
  );
}
