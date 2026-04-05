import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/components/providers/I18nProvider";

interface Plan {
  id: string;
  name: string;
  slug: string | null;
  packageCode: string;
  destination: string;
  dataAmount: number;
  dataVolume: number;
  durationDays: number;
  priceUsd: number;
  retailPriceUsd: number;
  speed: string | null;
  networkType: string | null;
  dataType: number;
  coverageCount: number;
  countryId: string | null;
  countryName: string | null;
  locations: unknown;
  ipExport: string | null;
  supportTopUp: boolean;
  unusedValidTime: number;
  isPopular: boolean;
  isBestSeller: boolean;
  isHot: boolean;
  badge: string | null;
}

const PLAN_IMAGES: Record<string, string> = {
  JP: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80",
  KR: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600&q=80",
  TH: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80",
  VN: "https://images.unsplash.com/photo-1559302504-64aae6f6e6d6?w=600&q=80",
  SG: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80",
  MY: "https://images.unsplash.com/photo-1512553232225-a498-2a0b6008d120?w=600&q=80",
  ID: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&q=80",
  PH: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600&q=80",
  IN: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80",
  CN: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&q=80",
  TW: "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=600&q=80",
  HK: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=600&q=80",
  US: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&q=80",
  CA: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=600&q=80",
  MX: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=600&q=80",
  BR: "https://images.unsplash.com/photo-1483729558449-99ef09a8e325?w=600&q=80",
  GB: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80",
  FR: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
  DE: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=80",
  IT: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=600&q=80",
  ES: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80",
  NL: "https://images.unsplash.com/photo-1512470876317-1f3c7c5ad1e9?w=600&q=80",
  CH: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&q=80",
  AT: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&q=80",
  SE: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  NO: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80",
  AU: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&q=80",
  NZ: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600&q=80",
  AE: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
  TR: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80",
  default: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
};

function getPlanImage(countryId: string | null): string {
  if (!countryId) return PLAN_IMAGES.default;
  return PLAN_IMAGES[countryId.toUpperCase()] || PLAN_IMAGES.default;
}

function formatVolume(bytes: number): string {
  if (bytes === 0) return "0";
  const k = 1024;
  const dm = 1;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}

export function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const { formatPrice } = useI18n();
  const isUnlimited = plan.badge === "Unlimited";
  const displayPrice = (plan.retailPriceUsd && plan.retailPriceUsd > 0) ? plan.retailPriceUsd : plan.priceUsd;
  const pricePerDay = formatPrice(displayPrice / plan.durationDays);
  const locations = Array.isArray(plan.locations) ? plan.locations : [];
  const heroImage = getPlanImage(plan.countryId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Hero Image */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <Image
          src={heroImage}
          alt={plan.destination}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
          {plan.isBestSeller && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              ⭐ Best Seller
            </span>
          )}
          {plan.isHot && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              🔥 Hot
            </span>
          )}
          {plan.isPopular && !plan.isBestSeller && (
            <span className="bg-cyan-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
              Popular
            </span>
          )}
        </div>

        {/* Destination on image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg sm:text-xl drop-shadow-lg">{plan.destination}</h3>
          <p className="text-white/80 text-xs">{plan.coverageCount > 1 ? `${plan.coverageCount} countries` : plan.countryName || plan.destination}</p>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gradient-to-br from-orange-50 to-cyan-50 rounded-xl p-2.5 text-center">
            <p className="text-lg sm:text-xl font-bold text-orange-600">{isUnlimited ? "∞" : formatVolume(plan.dataVolume)}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider">{isUnlimited ? "Unlimited" : "Data"}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-cyan-50 rounded-xl p-2.5 text-center">
            <p className="text-lg sm:text-xl font-bold text-slate-700">{plan.durationDays}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider">Days</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-cyan-50 rounded-xl p-2.5 text-center">
            <p className="text-lg sm:text-xl font-bold text-cyan-600">{pricePerDay}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider">/Day</p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-1.5 mb-4 flex-1">
          {plan.supportTopUp && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Supports Top-Up
            </div>
          )}
          {plan.ipExport && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              IP: {plan.ipExport}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Instant Activation
          </div>
          {plan.unusedValidTime > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Valid {plan.unusedValidTime} days after purchase
            </div>
          )}
        </div>

        {/* Countries preview */}
        {locations.length > 1 && (
          <div className="mb-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Coverage</p>
            <div className="flex flex-wrap gap-1">
              {(locations as string[]).slice(0, 6).map((loc) => (
                <span key={loc} className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded">
                  {loc}
                </span>
              ))}
              {locations.length > 6 && (
                <span className="text-slate-400 text-[10px]">+{locations.length - 6} more</span>
              )}
            </div>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
          <div>
            <p className="text-xl sm:text-2xl font-bold text-slate-800">{formatPrice(displayPrice)}</p>
            <p className="text-[10px] text-slate-400">one-time</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/plans/${plan.slug || plan.id}`}>
              <button className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl transition-colors">
                Details
              </button>
            </Link>
            <Link href={`/checkout?planId=${plan.id}`}>
              <motion.button
                className="bg-gradient-to-r from-orange-500 to-cyan-500 hover:from-orange-600 hover:to-cyan-600 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-xl transition-colors shadow-lg"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Buy
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}