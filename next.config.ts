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
    ],
  },
  
  // Compression enabled
  compress: true,
  
  // React strict mode
  reactStrictMode: true,
  
  // ⚡ Experimental features for performance
  experimental: {
    // Enable optimizeCss for faster CSS loading
    optimizeCss: true,
    
    // Enable optimizePackageImports for smaller bundles
    optimizePackageImports: ['react-icons', 'framer-motion'],
  },
  
  // ⚡ Compiler optimizations
  compiler: {
    // Remove console logs in production for smaller bundles
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
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
    ];
  },
  
  // ⚡ Optimize JavaScript bundles
  webpack: (config, { isServer }) => {
    // Enable tree shaking
    config.optimization.usedExports = true;
    
    // Optimize bundle size
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for node_modules
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // ⚡ Generate static pages for better performance
  output: 'standalone', // For optimized production builds
};

export default nextConfig;
