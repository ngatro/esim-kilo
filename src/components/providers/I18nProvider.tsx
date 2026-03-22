"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import de from "@/messages/de.json";
import fr from "@/messages/fr.json";

export type Locale = "en" | "vi" | "de" | "fr";

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string ? (T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` : K) : never }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<typeof en>;

const translations: Record<Locale, typeof en> = {
  en,
  vi,
  de,
  fr,
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

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isReady, setIsReady] = useState(false);

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
    return getNestedValue(translations[currentLocale] as unknown as Record<string, unknown>, key);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isReady }}>
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
