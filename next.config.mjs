/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['blob.v0.dev'],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blob.v0.dev',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
