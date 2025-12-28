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
  return <HomepageClient />;
}
