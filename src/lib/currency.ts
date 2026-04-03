import { prisma } from "./prisma";

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

let cachedRates: ExchangeRates = { USD: 1, VND: 24500, EUR: 0.92, JPY: 150 };
let ratesLastFetched: number = 0;
const RATES_CACHE_TTL = 5 * 60 * 1000;

export async function getExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();
  if (cachedRates && now - ratesLastFetched < RATES_CACHE_TTL) {
    return cachedRates;
  }

  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "currency_rates" },
    });

    if (setting?.value) {
      cachedRates = JSON.parse(setting.value);
      ratesLastFetched = now;
      return cachedRates;
    }
  } catch (error) {
    console.error("[Currency] Failed to fetch rates:", error);
  }

  return { USD: 1, VND: 24500, EUR: 0.92, JPY: 150 };
}

export function formatCurrency(
  amountUSD: number,
  targetCurrency: string,
  rates?: ExchangeRates
): string {
  const currency = targetCurrency.toUpperCase();
  const exchangeRates = rates || { USD: 1, VND: 24500, EUR: 0.92, JPY: 150 };
  
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

export async function formatCurrencyWithRates(
  amountUSD: number,
  targetCurrency: string
): Promise<string> {
  const rates = await getExchangeRates();
  return formatCurrency(amountUSD, targetCurrency, rates);
}
