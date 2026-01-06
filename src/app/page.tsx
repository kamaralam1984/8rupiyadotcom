import HomepageClient from '@/components/HomepageClient';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Find Nearby Shops & Businesses in India | 8rupiya.com',
  description: 'Discover local businesses, shops, and services near you. Browse by category, location, and ratings. Find the best shops in your city with 8rupiya.com - India\'s leading local business directory.',
  keywords: ['shops near me', 'local businesses', 'find shops', 'business directory', 'India shops', 'local shops', 'nearby shops'],
  url: 'https://8rupiya.com',
  type: 'website',
});

export default function HomePage() {
  // Schema is already included in layout.tsx to avoid duplication
  return (
    <>
      {/* ⚡ ULTRA-FAST LOADING: Preload critical resources */}
      <link rel="preload" href="/api/shops/nearby?limit=3&page=1" as="fetch" crossOrigin="anonymous" />
      <link rel="preload" href="/api/categories" as="fetch" crossOrigin="anonymous" />
      <link rel="prefetch" href="/api/shops/nearby?limit=10&page=2" as="fetch" crossOrigin="anonymous" />
      {/* Preload critical images */}
      <link rel="preload" href="/uploads/logo.png" as="image" />
      <HomepageClient />
    </>
  );
}
