export type Locale = "en" | "vi" | "de" | "fr";

export const LOCALE_TO_CURRENCY: Record<Locale, string> = {
  en: "USD",
  vi: "VND",
  de: "EUR",
  fr: "EUR",
};

export interface ExchangeRates {
  [key: string]: number;
}

export const DEFAULT_RATES: ExchangeRates = { USD: 1, VND: 24500, EUR: 0.92, JPY: 150, GBP: 0.79 };

function getRate(currency: string, rates?: ExchangeRates): number {
  const upper = currency.toUpperCase();
  const exchangeRates = { ...DEFAULT_RATES, ...rates };
  
  if (exchangeRates[upper] !== undefined) {
    return exchangeRates[upper];
  }
  
  const lower = currency.toLowerCase();
  if (exchangeRates[lower] !== undefined) {
    return exchangeRates[lower];
  }
  
  return 1;
}

export function formatCurrency(
  amountUSD: number,
  targetCurrency: string,
  rates?: ExchangeRates
): string {
  const currency = targetCurrency.toUpperCase();
  const rate = getRate(currency, rates);
  const converted = amountUSD * rate;

  const localeMap: Record<string, string> = {
    USD: "en-US",
    VND: "vi-VN",
    EUR: "de-DE",
    JPY: "ja-JP",
    GBP: "en-GB",
  };

  const locale = localeMap[currency] || "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      maximumFractionDigits: currency === "VND" || currency === "JPY" ? 0 : 2,
    }).format(converted);
  } catch {
    const fallback = converted.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return `${currency} ${fallback}`;
  }
}

export function convertFromUSD(
  amountUSD: number,
  targetCurrency: string,
  rates?: ExchangeRates
): number {
  const currency = targetCurrency.toUpperCase();
  const rate = getRate(currency, rates);
  return amountUSD * rate;
}
