import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [];
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
