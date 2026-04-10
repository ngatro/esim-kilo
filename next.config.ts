import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            // SEO-friendly plan URLs: /esim/{country}/{slug} -> render at /plans?id={slug}
            // Example: /esim/france/esim-france-500mbday-unlimited -> /plans?id=esim-france-500mbday-unlimited
            {
                source: '/esim/:country/:slug*',
                destination: '/plans/:slug*',
            },
        ];
    },
    images: {
        domains: ['p.qrsim.net', 'images.unsplash.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
        ],
    },
  
};

export default nextConfig;
