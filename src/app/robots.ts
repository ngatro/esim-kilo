// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://owsim.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'] // Chặn bot vào các folder api và admin nếu cần
    },
    sitemap: `${BASE_URL}/sitemap.xml`, // Đường dẫn sitemap
  }
}