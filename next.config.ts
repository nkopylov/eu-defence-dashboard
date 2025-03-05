import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ensure Next.js uses the correct base path
  basePath: '',
  // Allow deployment to Vercel
  images: {
    domains: ['vercel.app'],
  },
};

export default nextConfig;
