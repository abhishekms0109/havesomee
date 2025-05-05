/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Optimizes for hosting environments like Hostinger
  poweredByHeader: false, // Removes the X-Powered-By header for security
  env: {
    // Public environment variables
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure image domains if needed
  images: {
    domains: ['localhost', 'your-hostinger-domain.com'],
    // Allow placeholder images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/placeholder.svg**',
      },
    ],
    unoptimized: true,
  },
  // Optimize for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig
