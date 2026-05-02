import { MetadataRoute } from "next";

interface Plan {
  id: string;
  countryName: string;
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

    plans.forEach((plan) => {
      if (!plan.countryName) return;

      const slug = plan.countryName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-");

      countryMap.set(slug, {
        en: `${BASE_URL}/en/esim/${slug}`,
        de: `${BASE_URL}/de/esim/${slug}`,
        fr: `${BASE_URL}/fr/esim/${slug}`,
        vi: `${BASE_URL}/vi/esim/${slug}`,
        updatedAt: plan.updatedAt,
      });
    });

    const staticPages: MetadataRoute.Sitemap = [
      {
        url: `${BASE_URL}/en`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
    ];

    const dynamicPages: MetadataRoute.Sitemap = [];

    countryMap.forEach((value) => {
      ["en", "de", "fr", "vi"].forEach((lang) => {
        dynamicPages.push({
          url: value[lang],
          lastModified: new Date(value.updatedAt),
          changeFrequency: "daily",
          priority: 0.9,
        });
      });
    });

    return [...staticPages, ...dynamicPages];
  } catch (error) {
    return [
      {
        url: `${BASE_URL}/en`,
        lastModified: new Date(),
      },
    ];
  }
}