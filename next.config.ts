import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    domains: [],
    // Enable unoptimized for local development
    unoptimized: process.env.NODE_ENV === 'development',
    // Add formats
    formats: ['image/webp', 'image/avif'],
    // Disable image optimization for uploads folder in production
    loader: process.env.NODE_ENV === 'production' ? 'custom' : 'default',
    loaderFile: process.env.NODE_ENV === 'production' ? './imageLoader.js' : undefined,
  },
  serverExternalPackages: ['better-sqlite3'],
  // Enable static file serving for uploads
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
