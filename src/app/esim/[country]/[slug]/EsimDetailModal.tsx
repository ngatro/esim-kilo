"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/components/providers/I18nProvider";
import { getCountryImageUrl, getRegionImageUrl, getDefaultImage } from "@/lib/countryImages";
import { getDestinationImage, getValidUrl } from "@/lib/unsplash";

interface OperatorInfo {
  operatorName: string;
  networkType: string;
}

interface LocationNetwork {
  locationCode: string;
  locationLogo: string;
  locationName: string;
  operatorList: OperatorInfo[];
}

interface Plan {
  id: string;
  name: string;
  slug: string | null;
  packageCode: string;
  description: string | null;
  destination: string;
  dataType: number;
  dataVolume: number;
  dataAmount: number;
  durationDays: number;
  durationUnit: string;
  priceUsd: number;
  retailPriceUsd: number;
  currencyCode: string;
  speed: string | null;
  networkType: string | null;
  locationCode: string | null;
  locationLogo: string | null;
  locations: unknown;
  coverageCount: number;
  smsStatus: number;
  activeType: number;
  supportTopUp: boolean;
  unusedValidTime: number;
  ipExport: string | null;
  fupPolicy: string | null;
  countryId: string | null;
  countryName: string | null;
  regionId: string | null;
  regionName: string | null;
  isActive: boolean;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
  locationNetworkList: unknown;
  supportTopUpType: number;
  topupPackageId?: number;
}

function formatData(gb: number, volume?: number): string {
  const dataValue = gb > 0 ? gb : (volume ? Math.round((volume / (1024 * 1024 * 1024)) * 10) / 10 : 0);
  if (dataValue >= 999) return "Unlimited";
  if (dataValue < 1 && dataValue > 0) return `${Math.round(dataValue * 1024)}MB`;
  if (dataValue === 0) return "N/A";
  return `${dataValue}GB`;
}

function getDataTypeLabel(type: number): string {
  switch (type) {
    case 1: return "Fixed Data";
    case 2: return "Daily Limit (Speed Reduced)";
    case 3: return "Daily Limit (Service Cut-off)";
    case 4: return "Daily Unlimited";
    default: return "Data Plan";
  }
}

function getHeroImage(plan: Plan): string {
  // Try to get image from Unsplash
  if (plan.countryId) {
    const unsplashUrl = getDestinationImage(plan.countryId.toLowerCase());
    if (unsplashUrl) return unsplashUrl;
  }
  // Fallback to existing logic
  if (plan.coverageCount >= 2 && plan.regionId) {
    return getRegionImageUrl(plan.regionId);
  }
  if (plan.countryId) {
    return getCountryImageUrl(plan.countryId) || getDefaultImage(plan.packageCode);
  }
  return getDefaultImage(plan.packageCode);
}

export default function EsimDetailModal({ plan, country, slug }: { plan: any; country: string; slug: string }) {
  const { t, formatPrice } = useI18n();
  const [imgError, setImgError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [topupPackages, setTopupPackages] = useState<any[]>([]);

  // Fetch topup packages for this plan
  useEffect(() => {
    if (plan?.topupPackageId) {
      fetch(`/api/topup-packages?planIds=${plan.id}`)
        .then(r => r.json())
        .then(data => {
          console.log("[EsimDetailModal] Topup packages:", data.packages);
          setTopupPackages(data.packages || []);
        })
        .catch(console.error);
    }
  }, [plan?.topupPackageId, plan?.id]);

  // Debug: log plan data to console
  if (plan) {
    console.log("[EsimDetailModal] Plan data:", {
      id: plan.id,
      packageCode: plan.packageCode,
      priceUsd: plan.priceUsd,
      retailPriceUsd: plan.retailPriceUsd,
      supportTopUp: plan.supportTopUp,
      supportTopUpType: plan.supportTopUpType,
      topupPackageId: plan.topupPackageId,
    });
  }

  const heroImage = plan ? (imgError ? getDefaultImage(plan.packageCode) : getHeroImage(plan)) : "";

  const isUnlimited = !!plan?.fupPolicy;
  const displayPrice = (plan?.retailPriceUsd && plan?.retailPriceUsd > 0) ? plan.retailPriceUsd : plan?.priceUsd;
  // const hasDiscount = plan?.retailPriceUsd > 0 && plan?.retailPriceUsd > plan?.priceUsd;
  const pricePerDay = displayPrice && plan?.durationDays ? (displayPrice / plan.durationDays).toFixed(2) : "0";
  
  let networkList: LocationNetwork[] = [];
  let locations: string[] = [];
  try {
    if (plan?.locationNetworkList) {
      // Parse string if needed
      const networkData = typeof plan.locationNetworkList === 'string' 
        ? JSON.parse(plan.locationNetworkList) 
        : plan.locationNetworkList;
      networkList = Array.isArray(networkData) ? networkData as LocationNetwork[] : [];
    }
    if (plan?.locations) {
      locations = Array.isArray(plan.locations) ? plan.locations as string[] : JSON.parse(plan.locations as string);
    }
  } catch {
    networkList = [];
    locations = [];
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-orange-500">{t("common.home")}</Link>
            <span>/</span>
            <Link href="/plans" className="hover:text-orange-500">{t("common.plans")}</Link>
            <span>/</span>
            <span className="text-slate-800">{plan?.destination}</span>
          </div>
        </div>
      </div>

      {/* Split Hero Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left - Image */}
          <div className="relative aspect-[1/1] lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={heroImage}
              alt={plan?.destination || 'eSIM'}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
              unoptimized
              onError={() => setImgError(true)}
            />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {plan?.badge === "unlimited" && (
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  ∞ {t("plans.unlimited")}
                </span>
              )}
              {plan?.isBestSeller && plan?.badge !== "unlimited" && (
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  ⭐ {t("plans.bestSeller")}
                </span>
              )}
              {plan?.isHot && !plan?.isBestSeller && !plan?.badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  🔥 {t("plans.hot")}
                </span>
              )}
              {plan?.isPopular && !plan?.isHot && !plan?.isBestSeller && !plan?.badge && (
                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {t("plans.popular")}
                </span>
              )}
            </div>
          </div>

          {/* Right - Plan Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
              {plan?.destination}
            </h1>
            
            {/* Data & Duration */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-lg font-medium text-slate-600">
                {formatData(plan?.dataAmount || 0, plan?.dataVolume)} • {plan?.durationDays} {plan?.durationUnit || 'Days'}
              </span>
              {plan?.dataType && (
                <span className="text-sm text-slate-500">
                  ({getDataTypeLabel(plan.dataType)})
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-orange-500">
                {formatPrice(displayPrice || 5)}

              </span>
              {/* {hasDiscount && (
                <span className="text-lg text-slate-400 line-through">
                  
                  ${plan?.retailPriceUsd}
                </span>
              )} */}
              <span className="text-slate-500">{t("planDetail.oneTime")}</span>
              {plan?.durationDays > 1 && (
                <span className="text-sm text-slate-400">
                  (${pricePerDay}/day)
                </span>
              )}
            </div>

            {/* Quick Features */}
            <div className="mb-6 space-y-2">
              {[
                { icon: "✓", text: `${t("planDetail.instantDelivery")}`, color: "text-green-600" },
                { icon: "✓", text: `${t("planDetail.secureCheckout")}`, color: "text-green-600" },
                { icon: "✓", text: `${t("planDetail.refundPolicy")}`, color: "text-green-600" },
                { icon: "✓", text: `${t("planDetail.worksOnAll")}`, color: "text-green-600" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className={item.color}>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}

              {/* Coverage Preview */}
              {locations.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-2 pt-2 border-t border-slate-100">
                  <span>🌍</span>
                  <span>
                    {t("planDetail.coverage")}:{" "}
                    {locations
                      .slice(0, 3)
                      .map(code => t(`countries.${code}`))
                      .join(", ")
                    }
                    {locations.length > 3 ? ` +${locations.length - 3} more` : ""}
                    </span>
                </div>
              )}
            </div>

            {/* DEBUG: Base Package & Topup Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4 font-mono text-xs">
              <p className="font-bold text-yellow-800 mb-2">🔧 Debug Info:</p>
              <p>Base: {plan?.packageCode} | price=${plan?.priceUsd} | retail=${plan?.retailPriceUsd}</p>
              <p>displayPrice = ${displayPrice?.toFixed(2)} × {quantity} = ${(displayPrice * quantity).toFixed(2)}</p>
              <p>topupPackageId: {plan?.topupPackageId || "None"}</p>
              {topupPackages.length > 0 && (
                <div className="mt-2 pt-2 border-t border-yellow-200">
                  <p className="font-semibold">Topup Packages ({topupPackages.length}):</p>
                  {topupPackages.map((pkg: any) => (
                    <p key={pkg.id}>{pkg.packageCode} | ${pkg.priceUsd?.toFixed(2)} | {pkg.isFlexible ? "flex" : "fixed"}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity & Buy Button */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium text-slate-600">{t("common.quantity")}:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <Link
                href={`/checkout?planId=${plan?.id}&qty=${quantity}`}
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl text-lg text-center transition-colors"
              >
                {t("plans.buyNow")} - {formatPrice(displayPrice * quantity)}
              </Link>
              
              <p className="text-center text-sm text-slate-500 mt-4">
                {t("planDetail.securePayment")} • {t("planDetail.instantDelivery")} • {t("planDetail.support247")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Details Section */}
      <div className="mt-12 sm:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Plan Specifications */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">{t("plans.planSpecifications")}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t("plans.data")}</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {plan?.fupPolicy ? (
                      <>{t("plans.unlimited")} <span className="text-green-600 text-sm">({plan.fupPolicy} {t("planDetail.after")})</span></>
                    ) : (
                      formatData(plan?.dataAmount || 0, plan?.dataVolume)
                    )}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t("plans.validity")}</p>
                  <p className="text-lg font-semibold text-slate-800">{plan?.durationDays} {t("plans.days")}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t("plans.networkSpeed")}</p>
                  <p className="text-lg font-semibold text-slate-800">{plan?.speed || "4G LTE"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Plan Type</p>
                  <p className="text-lg font-semibold text-slate-800">{plan?.smsStatus === 0 ? "Data Only" : "Data + SMS"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Tethering</p>
                  <p className="text-lg font-semibold text-slate-800">{plan?.ipExport ? `Supported (${plan.ipExport})` : "Not Supported"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t("plans.activation")}</p>
                  <p className="text-lg font-semibold text-slate-800">{plan?.activeType === 1 ? `${t("planDetail.onFirstInstallation")}` : `${t("planDetail.onFirstConnection")}`}</p>
                </div>
                {plan?.unusedValidTime > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">{t("plans.validAfterPurchase")}</p>
                    <p className="text-lg font-semibold text-slate-800">{plan.unusedValidTime} {t("plans.days")}</p>
                  </div>
                )}
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{t("plans.topUp")}</p>
                  <p className="text-lg font-semibold text-slate-800">{plan?.supportTopUp ? t("plans.topUpSupported") : t("plans.topUpNotSupported")}</p>
                </div>
              </div>
            </div>

            {/* Fair Use Policy */}
            {plan?.fupPolicy && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6">
                <h2 className="text-lg font-bold text-amber-700 mb-2">{t("plans.fairUsePolicy")}</h2>
                <p className="text-amber-600 text-sm">{t("plans.fairUsePolicyDesc")} <strong className="text-amber-800">{plan.fupPolicy}</strong></p>
              </div>
            )}

            {/* Coverage */}
            {locations.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">{t("plans.coverage")} ({locations.length} {locations.length === 1 ? t("plans.country") : t("plans.countries")})</h2>
                <div className="flex flex-wrap gap-2">
                  {locations.map((loc, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 text-sm px-3 py-1.5 rounded-full font-medium">{t(`countries.${loc}`) !== `countries.${loc}` ? t(`countries.${loc}`) : loc}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Networks */}
            {networkList.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">{t("plans.network")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {networkList.map((loc: LocationNetwork, idx: number) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">{(() => {
                                                                                        const code = loc.locationCode;
                                                                                        const key = `countries.${code}`;
                                                                                        const value = t(key);
                                                                                        return value === key ? code : value;
                                                                                      })()}</p>
                      <div className="flex flex-wrap gap-2">
                        {loc.operatorList?.map((op, j) => (
                          <span key={j} className="bg-white border border-slate-200 text-slate-600 text-sm px-3 py-1 rounded-lg">
                            {op.operatorName} {op.networkType}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* What's Included */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">What&apos;s Included</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>eSIM with QR code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Installation guide</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{plan?.durationDays || 30} day validity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>24/7 customer support</span>
                </li>
              </ul>
            </div>

            {/* How It Works */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">How It Works</h3>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">1.</span>
                  <span>Purchase and receive QR code via email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">2.</span>
                  <span>Scan QR code or enter manual code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">3.</span>
                  <span>Data activates on first connection</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}