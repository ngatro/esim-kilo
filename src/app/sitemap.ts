import { MetadataRoute } from "next";
import countryToRegionData from "@/data/country-to-region.json";

interface Plan {
  id: string;
  countryName: string;
  slug?: string;
  countryId?: string;
  updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://owsim.com";

  try {
    const response = await fetch(`${BASE_URL}/api/plans`, {
      next: { revalidate: 3600 },
    });

    const data = await response.json();
    const plans: Plan[] = data.plans || [];

    const countryMap = new Map<string, any>();
    const planSlugs = new Map<string, string>();

    plans.forEach((plan) => {
      if (plan.slug) {
        planSlugs.set(plan.slug, plan.id);
      }

      if (!plan.countryName && !plan.countryId) return;

      const countryCode = plan.countryId;
      if (countryCode) {
        const slug = countryCode.toLowerCase();
        planSlugs.set(slug, plan.id);
      }

      const slug = plan.countryName
        ?.toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-");

      if (slug) {
        countryMap.set(slug, {
          en: `${BASE_URL}/en/esim/${slug}`,
          de: `${BASE_URL}/de/esim/${slug}`,
          fr: `${BASE_URL}/fr/esim/${slug}`,
          vi: `${BASE_URL}/vi/esim/${slug}`,
          updatedAt: plan.updatedAt,
        });
      }
    });

    // Add all countries from the country-to-region data
    Object.entries(countryToRegionData).forEach(([, value]) => {
      const slug = value.countryName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-");
      if (!countryMap.has(slug)) {
        countryMap.set(slug, {
          en: `${BASE_URL}/en/esim/${slug}`,
          de: `${BASE_URL}/de/esim/${slug}`,
          fr: `${BASE_URL}/fr/esim/${slug}`,
          vi: `${BASE_URL}/vi/esim/${slug}`,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    // Add regions
    const regions = ["global", "asia", "europe", "americas", "oceania", "africa", "middle-east"];
    regions.forEach((region) => {
      countryMap.set(region, {
        en: `${BASE_URL}/en/esim/${region}`,
        de: `${BASE_URL}/de/esim/${region}`,
        fr: `${BASE_URL}/fr/esim/${region}`,
        vi: `${BASE_URL}/vi/esim/${region}`,
        updatedAt: new Date().toISOString(),
      });
    });

    // Static pages for all languages
    const staticPages: MetadataRoute.Sitemap = [];
    const staticPaths = ["", "/plans", "/blog", "/compatibility"];

    ["en", "de", "fr", "vi"].forEach((lang) => {
      staticPaths.forEach((path) => {
        staticPages.push({
          url: `${BASE_URL}/${lang}${path}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: path === "" ? 1 : 0.8,
        });
      });
    });

    const dynamicPages: MetadataRoute.Sitemap = [];

    countryMap.forEach((value) => {
      ["en", "de", "fr", "vi"].forEach((lang) => {
        if (value[lang]) {
          dynamicPages.push({
            url: value[lang],
            lastModified: new Date(value.updatedAt),
            changeFrequency: "daily",
            priority: 0.9,
          });
        }
      });
    });

    // Add individual plan pages
    const planPages: MetadataRoute.Sitemap = [];
    planSlugs.forEach((planId, slug) => {
      ["en", "de", "fr", "vi"].forEach((lang) => {
        const countrySlug = slug.split("-")[1] || slug;
        planPages.push({
          url: `${BASE_URL}/${lang}/esim/${countrySlug}/${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      });
    });

    return [...staticPages, ...dynamicPages, ...planPages];
  } catch (error) {
    return [
      {
        url: `${BASE_URL}/en`,
        lastModified: new Date(),
      },
    ];
  }
}