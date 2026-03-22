"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("common");
  const [isOpen, setIsOpen] = useState(false);

  const locales = ['en', 'vi'];

  const handleLanguageChange = (newLocale: string) => {
    setIsOpen(false);
    router.push(`/${newLocale}${pathname}`);
  };

  const currentLabel = locale === 'vi' ? t("vietnamese") : t("english");

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium">{currentLabel}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
          {locales.map((localeOption) => (
            <button
              key={localeOption}
              onClick={() => handleLanguageChange(localeOption)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                locale === localeOption ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              {localeOption === 'vi' ? t("vietnamese") : t("english")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
