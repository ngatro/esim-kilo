export type Locale = "en" | "vi" | "de" | "fr";

export const LOCALE_TO_CURRENCY: Record<Locale, string> = {
  en: "USD",
  vi: "VND",
  de: "EUR",
  fr: "EUR",
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  VND: "₫",
  EUR: "€",
  JPY: "¥",
  GBP: "£",
};

export const CURRENCY_DECIMALS: Record<string, number> = {
  USD: 2,
  VND: 0,
  EUR: 2,
  JPY: 0,
  GBP: 2,
};

export interface ExchangeRates {
  [key: string]: number;
}

export const DEFAULT_RATES: ExchangeRates = { USD: 1, VND: 24500, EUR: 0.92, JPY: 150, GBP: 0.79 };

export function formatCurrency(
  amountUSD: number,
  targetCurrency: string,
  rates?: ExchangeRates
): string {
  const currency = targetCurrency.toUpperCase();
  const exchangeRates = rates || DEFAULT_RATES;
  
  const rate = exchangeRates[currency] || 1;
  const converted = amountUSD * rate;
  const decimals = CURRENCY_DECIMALS[currency] || 2;
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  const formatted = converted.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (currency === "VND" || currency === "JPY") {
    return `${symbol}${formatted}`;
  }
  
  return `${symbol}${formatted}`;
}
