'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { initializeAd, waitForAdSense, cleanupAd } from '@/lib/adsense';

interface InFeedAdProps {
  className?: string;
}

export default function InFeedAd({ className = '' }: InFeedAdProps) {
  const pathname = usePathname();
  const adRef = useRef<HTMLModElement>(null);
  const initializedRef = useRef(false);
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || 'ca-pub-4472734290958984';
  const adSlot = '4723091404';

  // Block ads on admin panels
  const isAdminPanel = pathname?.startsWith('/admin') || 
                       pathname?.startsWith('/agent') || 
                       pathname?.startsWith('/operator') ||
                       pathname?.startsWith('/accountant') ||
                       pathname?.startsWith('/shopper');

  if (isAdminPanel) {
    return null;
  }

  useEffect(() => {
    if (initializedRef.current || !adRef.current) {
      return;
    }

    const element = adRef.current;

    // Initialize ad (now handles retries internally)
    const init = async () => {
      // Wait for AdSense script (resolves gracefully if timeout)
      await waitForAdSense();
      
      // Initialize the ad (resolves gracefully if fails)
      await initializeAd(element);
      
      initializedRef.current = true;
    };

    init();

    // Cleanup on unmount
    return () => {
      if (element) {
        cleanupAd(element);
      }
    };
  }, []);

  if (!adsenseId) {
    return null;
  }

  return (
    <div className={`in-feed-ad ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="fluid"
        data-ad-layout-key="-fb+5w+4e-db+86"
        data-ad-client={adsenseId}
        data-ad-slot={adSlot}
      />
    </div>
  );
}

