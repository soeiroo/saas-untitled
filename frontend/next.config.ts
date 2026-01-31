import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: 'http://saas-untitled.onrender.com/:path*',      
      },
    ];
  },
};

export default nextConfig;