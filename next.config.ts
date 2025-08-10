// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' for now during development
  // output: 'export', 
  trailingSlash: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: false, // Disable for now to avoid critters issues
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
