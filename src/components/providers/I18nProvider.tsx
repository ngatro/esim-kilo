"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import de from "@/messages/de.json";
import fr from "@/messages/fr.json";
import { formatCurrency, LOCALE_TO_CURRENCY, DEFAULT_RATES, type ExchangeRates } from "@/lib/currency";

export type Locale = "en" | "vi" | "de" | "fr";

const translations: Record<Locale, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  vi: vi as Record<string, unknown>,
  de: de as Record<string, unknown>,
  fr: fr as Record<string, unknown>,
};

export const SUPPORTED_LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isReady: boolean;
  currency: string;
  formatPrice: (usdAmount: number) => string;
  rates: ExchangeRates;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let result: unknown = obj;
  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof result === "string" ? result : path;
}

interface I18nProviderProps {
  children: ReactNode;
  initialRates?: ExchangeRates;
}

export function I18nProvider({ children, initialRates }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isReady, setIsReady] = useState(false);
  const rates = initialRates || DEFAULT_RATES;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("locale");
      if (saved && SUPPORTED_LOCALES.some(l => l.code === saved)) {
        setLocaleState(saved as Locale);
      }
    } catch {
      // ignore
    }
    setIsReady(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    if (SUPPORTED_LOCALES.some(l => l.code === newLocale)) {
      setLocaleState(newLocale);
      try {
        localStorage.setItem("locale", newLocale);
      } catch {
        // ignore
      }
    }
  };

  const t = (key: string): string => {
    const currentLocale = isReady ? locale : "en";
    return getNestedValue(translations[currentLocale], key);
  };

  const currency = LOCALE_TO_CURRENCY[locale] || "USD";
  
  const formatPrice = (usdAmount: number): string => {
    return formatCurrency(usdAmount, currency, rates);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isReady, currency, formatPrice, rates }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
