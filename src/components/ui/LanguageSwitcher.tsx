"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import { useState, useEffect } from "react";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (newLocale: "en" | "vi") => {
    setIsOpen(false);
    setLocale(newLocale);
  };

  const currentLabel = locale === "vi" ? "VN" : "EN";

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-md text-white text-sm font-medium">
        EN
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-md hover:bg-slate-700 transition-colors text-white text-sm font-medium"
      >
        {currentLabel}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-slate-800 rounded-md shadow-lg py-1 border border-slate-700">
          <button
            onClick={() => handleLanguageChange("en")}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${
              locale === "en" ? "text-sky-400" : "text-white"
            }`}
          >
            English
          </button>
          <button
            onClick={() => handleLanguageChange("vi")}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors ${
              locale === "vi" ? "text-sky-400" : "text-white"
            }`}
          >
            Tiếng Việt
          </button>
        </div>
      )}
    </div>
  );
}
