import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Cấu hình trình biên dịch để xóa console
    compiler: {
        // Chỉ xóa console khi chạy lệnh build (production)
        removeConsole: process.env.NODE_ENV === 'production' 
            ? { exclude: ['error', 'warn'] } // Giữ lại error và warn để theo dõi lỗi nếu có
            : false,
    },
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