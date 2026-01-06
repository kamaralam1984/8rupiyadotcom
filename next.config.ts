import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚡ Performance Optimizations for 1-second load time
  
  // Image optimization - WEBP/AVIF for faster loading
  images: {
    formats: ['image/avif', 'image/webp'], // AVIF first for best compression
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // Cache images for 1 year (aggressive caching)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  
  // Compression enabled
  compress: true,
  
  // React strict mode
  reactStrictMode: true,
  
  // ⚡ Experimental features for performance
  experimental: {
    // Enable optimizeCss for faster CSS loading (critters now installed)
    optimizeCss: true,
    
    // Enable optimizePackageImports for smaller bundles
    optimizePackageImports: [
      'react-icons', 
      'framer-motion',
      'recharts',
      'swiper',
      '@googlemaps/js-api-loader'
    ],
    
    // Optimize server components
    serverActions: {
      bodySizeLimit: '2mb',
    },
    
    // Note: cacheComponents disabled due to route segment config conflicts
    // Performance optimizations are handled via other methods
  },
  
  // ⚡ Compiler optimizations
  compiler: {
    // Remove console logs in production for smaller bundles
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // ⚡ Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for faster builds
  
  // ⚡ SWC Minification for smaller bundles (enabled by default in Next.js 13+)
  
  // ⚡ PoweredByHeader - Remove for security and performance
  poweredByHeader: false,
  
  // ⚡ Headers for aggressive caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/shops/nearby',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/api/homepage-layout',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        ],
      },
      {
        source: '/api/shops/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=120',
          },
        ],
      },
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // ⚡ Turbopack configuration (Next.js 16 default)
  turbopack: {
    // Empty config to silence warning - Turbopack works great by default!
  },
  
  // ⚡ Generate static pages for better performance
  output: 'standalone', // For optimized production builds
};

export default nextConfig;
