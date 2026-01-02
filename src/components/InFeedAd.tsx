'use client';

import { useEffect, useRef, useId } from 'react';
import { usePathname } from 'next/navigation';
import { initializeAd, waitForAdSense, cleanupAd } from '@/lib/adsense';

interface InFeedAdProps {
  className?: string;
}

export default function InFeedAd({ className = '' }: InFeedAdProps) {
  const pathname = usePathname();
  const adRef = useRef<HTMLModElement>(null);
  const initializedRef = useRef(false);
  const uniqueId = useId();
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
    const element = adRef.current;
    if (!element || initializedRef.current) {
      return;
    }

    // Check if already initialized (double-check)
    if (element.hasAttribute('data-ads-initialized') || (element as any).adsbygoogle) {
      initializedRef.current = true;
      return;
    }

    // Initialize ad (now handles retries internally)
    const initAd = async () => {
      // Wait for AdSense script (resolves gracefully if timeout)
      await waitForAdSense();
      
      // Double-check before initializing
      const currentElement = adRef.current;
      if (!currentElement || currentElement.hasAttribute('data-ads-initialized')) {
        initializedRef.current = true;
        return;
      }
      
      // Initialize the ad (resolves gracefully if fails)
      await initializeAd(currentElement);
      initializedRef.current = true;
    };

    initAd();

    // Cleanup on unmount
    return () => {
      const currentElement = adRef.current;
      if (currentElement) {
        cleanupAd(currentElement);
      }
    };
  }, [uniqueId]);

  if (!adsenseId) {
    return null;
  }

  return (
    <div className={`in-feed-ad ${className}`}>
      <ins
        ref={adRef}
        id={`infeed-ad-${uniqueId}`}
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
