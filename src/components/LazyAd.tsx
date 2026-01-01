'use client';

import { Suspense, lazy } from 'react';
import dynamic from 'next/dynamic';

/**
 * Lazy-loaded Ad Components
 * Improves initial page load performance
 */

// Dynamic import with no SSR
const DisplayAd = dynamic(() => import('./DisplayAd'), {
  ssr: false,
  loading: () => <AdSkeleton />,
});

const AdsenseAd = dynamic(() => import('./AdsenseAd'), {
  ssr: false,
  loading: () => <AdSkeleton />,
});

const InFeedAd = dynamic(() => import('./InFeedAd'), {
  ssr: false,
  loading: () => <AdSkeleton />,
});

// Ad Skeleton Loader
function AdSkeleton() {
  return (
    <div className="ad-skeleton animate-pulse">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-[250px] w-full" />
    </div>
  );
}

// Export lazy-loaded components
export { DisplayAd, AdsenseAd, InFeedAd, AdSkeleton };

/**
 * Wrapper component with error boundary
 */
interface LazyAdProps {
  type: 'display' | 'adsense' | 'infeed';
  className?: string;
}

export default function LazyAd({ type, className }: LazyAdProps) {
  const AdComponent = 
    type === 'display' ? DisplayAd :
    type === 'adsense' ? AdsenseAd :
    InFeedAd;

  return (
    <Suspense fallback={<AdSkeleton />}>
      <AdComponent className={className} />
    </Suspense>
  );
}

