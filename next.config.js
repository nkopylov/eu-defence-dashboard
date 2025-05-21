/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure Next.js uses the correct base path
  basePath: '',
  // Allow deployment to Vercel
  images: {
    domains: ['vercel.app', 'www.livemint.com'],
  },
  // Disable TypeScript strict mode for build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;