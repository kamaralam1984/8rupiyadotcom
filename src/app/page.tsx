import HomepageNew from '@/components/HomepageNew';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Find Nearby Shops & Businesses in India | 8rupiya.com - Best Local Business Directory',
  description: 'Discover 1000+ local businesses, shops, and services near you. Browse by category, location, and ratings. Find the best shops in your city with 8rupiya.com - India\'s #1 local business directory. Search shops near me, local businesses, business directory, shop finder, and more.',
  keywords: [
    'shops near me',
    'local businesses',
    'find shops',
    'business directory',
    'India shops',
    'local shops',
    'nearby shops',
    'shop finder',
    'local business directory',
    'business listings',
    'shop directory',
    'local services',
    'find businesses',
    'shop search',
    'business search',
    'best shops',
    'top rated shops',
    'shop reviews',
    'local business reviews',
    'find local shops',
    'shop directory India',
    'business directory India',
    'local business finder',
    'nearby business directory',
    'shop listings',
    'business listings India',
    'local shop directory',
    'find shops by category',
    'shop ratings',
    'business ratings',
  ],
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
      {/* DNS Prefetch for faster API calls */}
      <link rel="dns-prefetch" href="https://8rupiya.com" />
      <HomepageNew />
    </>
  );
}
