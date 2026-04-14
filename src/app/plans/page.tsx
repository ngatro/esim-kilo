"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/components/providers/I18nProvider";
import { getDestinationImage, getValidUrl } from "@/lib/unsplash";

interface Destination {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  landmark: string | null;
  imageUrl: string | null;
  isVisible: boolean;
  priority: number;
  isHot?: boolean;
  price?: string;
  photoId?: string;
}

interface DestinationRegion {
  id: string;
  name: string;
  emoji: string;
  imageUrl: string | null;
  isVisible: boolean;
  priority: number;
  _count?: { plans: number };
}

// Default destinations with landmark names (photo IDs for Unsplash)
const DEFAULT_DESTINATIONS = [
  { id: "jp", name: "Japan", slug: "japan", emoji: "🇯🇵", landmark: "Mount Fuji", isHot: true, price: "From $4.50", photoId: "1490806843955-31ec4f4f6a60" },
  { id: "kr", name: "Korea", slug: "south-korea", emoji: "🇰🇷", landmark: "Bukchon Hanok", isHot: true, price: "From $3.90", photoId: "1535568097429-8d6c4c586db4" },
  { id: "th", name: "Thailand", slug: "thailand", emoji: "🇹🇭", landmark: "Phi Phi Islands", isHot: true, price: "From $2.90", photoId: "1552465011-b4e21bf6e79a" },
  { id: "sg", name: "Singapore", slug: "singapore", emoji: "🇸🇬", landmark: "Marina Bay", isHot: true, price: "From $5.90", photoId: "1525966160135-9e8d4f15c8d2" },
  { id: "vn", name: "Vietnam", slug: "vietnam", emoji: "🇻🇳", landmark: "Ha Long Bay", isHot: false, price: "From $2.50", photoId: "1528127269322-539801943592" },
  { id: "us", name: "USA", slug: "united-states", emoji: "🇺🇸", landmark: "Grand Canyon", isHot: false, price: "From $8.90", photoId: "1474044159687-1ee9fc1e22c2" },
  { id: "gb", name: "UK", slug: "united-kingdom", emoji: "🇬🇧", landmark: "Tower Bridge", isHot: false, price: "From $6.90", photoId: "1513635269975-59663e0ac1ad" },
  { id: "fr", name: "France", slug: "france", emoji: "🇫🇷", landmark: "French Alps", isHot: false, price: "From $5.50", photoId: "1502602898657-3e91760cbb34" },
  { id: "de", name: "Germany", slug: "germany", emoji: "🇩🇪", landmark: "Neuschwanstein", isHot: false, price: "From $5.90", photoId: "1467269204594-9661b134dd2b" },
  { id: "cn", name: "China", slug: "china", emoji: "🇨🇳", landmark: "Zhangjiajie", isHot: false, price: "From $4.90", photoId: "1537533160920-2a56329a092b" },
  { id: "hk", name: "Hong Kong", slug: "hong-kong", emoji: "🇭🇰", landmark: "Victoria Peak", isHot: false, price: "From $5.50", photoId: "1536599018102-9f803c140fc1" },
  { id: "tw", name: "Taiwan", slug: "taiwan", emoji: "🇹🇼", landmark: "Alishan", isHot: false, price: "From $3.50", photoId: "1470005434218-02f92e9f63ac" },
  { id: "my", name: "Malaysia", slug: "malaysia", emoji: "🇲🇾", landmark: "Langkawi", isHot: false, price: "From $3.90", photoId: "1595399724438-08f1c76b2d0c" },
  { id: "id", name: "Indonesia", slug: "indonesia", emoji: "🇮🇩", landmark: "Bali", isHot: false, price: "From $2.90", photoId: "1537996194471-e657df975ab4" },
  { id: "au", name: "Australia", slug: "australia", emoji: "🇦🇺", landmark: "Great Barrier Reef", isHot: false, price: "From $7.90", photoId: "1506973035872-a4ec16b8e28d" },
  { id: "it", name: "Italy", slug: "italy", emoji: "🇮🇹", landmark: "Amalfi Coast", isHot: false, price: "From $5.50", photoId: "1516483638261-f4dbaf036963" },
];

const DEFAULT_REGIONS = [
  { id: "asia", name: "Asia", emoji: "🌏", imageUrl: getValidUrl("1528181304800-259d08817609", 800, 600), _count: { plans: 12 } },
  { id: "europe", name: "Europe", emoji: "🏰", imageUrl: getValidUrl("1499856871958-5b9627545d1a", 800, 600), _count: { plans: 8 } },
  { id: "americas", name: "Americas", emoji: "🗽", imageUrl: getValidUrl("1485738422979-f5c462d49f74", 800, 600), _count: { plans: 3 } },
  { id: "middle-east", name: "Middle East", emoji: "🕌", imageUrl: getValidUrl("1488085061387-422e29b40080", 800, 600), _count: { plans: 2 } },
  { id: "oceania", name: "Oceania", emoji: "🏝️", imageUrl: getValidUrl("1504214208752-2c4b56670f25", 800, 600), _count: { plans: 2 } },
  { id: "africa", name: "Africa", emoji: "🦁", imageUrl: getValidUrl("1488085061387-422e29b40080", 800, 600), _count: { plans: 1 } },
];

// Fetch dynamic image from Unsplash API
async function fetchUnsplashImage(countryName: string): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/unsplash?q=${encodeURIComponent(countryName)}`);
    if (res.ok) {
      const data = await res.json();
      return data.url;
    }
  } catch (error) {
    console.error("Failed to fetch Unsplash image:", error);
  }
  return getDestinationImage(countryName.toLowerCase().replace(/\s+/g, '-'));
}

// Hero image for main page
const HERO_IMAGE = getDestinationImage("global");

export default function PlansPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [regions, setRegions] = useState<DestinationRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string>(HERO_IMAGE);

  useEffect(() => {
    async function loadData() {
      // Fetch hero image from Unsplash
      const heroUrl = await fetchUnsplashImage("travel");
      setHeroImage(heroUrl);

      const res = await fetch("/api/destinations");
      const data = await res.json();
        
      if (data.destinations && data.destinations.length > 0) {
        setDestinations(data.destinations.map((d: any) => ({
          ...d,
          isHot: d.priority <= 3,
          price: `From $${(3 + d.priority).toFixed(2)}`,
        })) as Destination[]);
      } else {
        setDestinations(DEFAULT_DESTINATIONS.map((d) => ({
          ...d,
          imageUrl: d.imageUrl || getDestinationImage(d.slug),
          isVisible: true,
          priority: parseInt(d.id) || 1,
        })) as Destination[]);
      }
      
      if (data.regions && data.regions.length > 0) {
        setRegions(data.regions as DestinationRegion[]);
      } else {
        setRegions(DEFAULT_REGIONS.map((r, i) => ({
          ...r,
          isVisible: true,
          priority: i + 1,
        })) as DestinationRegion[]);
      }
      
      setLoading(false);
    }
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Hero Section with Dynamic Unsplash Image */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <Image
          src={heroImage}
          alt="Travel Hero"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-[#F8F9FA]" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-center drop-shadow-lg">
            {t("plans.title") || "Browse eSIM Plans"}
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-8 text-center drop-shadow">
            {t("plans.subtitle") || "Choose your destination and stay connected"}
          </p>
          
          {/* White Glass Search Bar */}
          <div className="w-full max-w-2xl">
            <div className="relative bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-2xl">
              <input
                type="text"
                placeholder="Tìm kiếm điểm đến..."
                className="w-full px-8 py-5 bg-transparent text-slate-800 placeholder:text-slate-500 focus:outline-none text-lg rounded-[2rem]"
                onChange={(e) => {
                  const query = e.target.value.toLowerCase();
                  if (query) {
                    router.push(`/esim/search?q=${encodeURIComponent(query)}`);
                  }
                }}
              />
              <svg className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-16">
        
        {/* Countries Grid - Cards with Unsplash Images */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-slate-700">🏝️ Top Destinations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {destinations.slice(0, 16).map((dest) => (
              <Link
                key={dest.id}
                href={`/esim/${dest.slug}`}
                className="group relative bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={dest.imageUrl || getDestinationImage(dest.slug)}
                    alt={dest.landmark || dest.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  
                  {dest.price && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white font-bold px-4 py-1.5 rounded-full text-sm shadow-lg">
                      {dest.price}
                    </div>
                  )}
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{dest.emoji}</span>
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">
                        {dest.name}
                      </h3>
                    </div>
                    <p className="text-white/80 text-sm font-medium drop-shadow">{dest.landmark}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Regions - Cards with Unsplash Images */}
        <div>
          <h2 className="text-2xl font-semibold mb-8 text-slate-700">🌍 Browse by Region</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((region) => (
              <Link
                key={region.id}
                href={`/esim/${region.id}`}
                className="group relative bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={region.imageUrl || HERO_IMAGE}
                    alt={region.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                  
                  <div className="absolute inset-0 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{region.emoji}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white drop-shadow-lg">
                          {region.name}
                        </h3>
                        <p className="text-white/70 text-sm">
                          {region._count?.plans || 0} eSIM plans
                        </p>
                      </div>
                    </div>
                    <svg className="w-8 h-8 text-white/70 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
