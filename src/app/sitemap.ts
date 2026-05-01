import { MetadataRoute } from 'next'

// Định nghĩa kiểu dữ liệu cho Plan từ API của bạn
interface Plan {
  id: string;
  countryName: string;
  updatedAt: string;
  // ... các trường khác bạn có thể bỏ qua nếu không dùng đến
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://owsim.com';

  try {
    // 1. Fetch dữ liệu từ API plans
    const response = await fetch(`${BASE_URL}/api/plans`, {
      next: { revalidate: 3600 } // Cache dữ liệu trong 1 tiếng để tăng tốc độ
    });
    
    const data = await response.json();
    const plans: Plan[] = data.plans || [];

    // 2. Lọc trùng quốc gia và tạo slug
    const countryMap = new Map();

    plans.forEach((plan) => {
      if (plan.countryName) {
        const countrySlug = plan.countryName
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-');

        // Map sẽ ghi đè nếu trùng slug, đảm bảo mỗi nước chỉ xuất hiện 1 lần
        countryMap.set(countrySlug, {
          url: `${BASE_URL}/esim/${countrySlug}`,
          lastModified: new Date(plan.updatedAt),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        });
      }
    });

    // 3. Kết hợp với các trang tĩnh khác (Trang chủ, v.v.)
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];

    const dynamicPages = Array.from(countryMap.values());

    return [...staticPages, ...dynamicPages];
  } catch (error) {
    console.error('Sitemap fetch error:', error);
    // Nếu lỗi API, vẫn trả về trang chủ để bot không bị 404
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
      },
    ];
  }
}