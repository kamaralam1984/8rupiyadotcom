'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAdStatus } from '@/contexts/AdStatusContext';

declare global {
  interface Window {
    adsbygoogle: any[] | { loaded?: boolean; push?: (ad: any) => void };
  }
}

interface GoogleAdSenseProps {
  slot?: string;
  style?: React.CSSProperties;
  format?: string;
  responsive?: string;
  adsenseId?: string;
}

export default function GoogleAdSense({
  slot,
  style = { display: 'block' },
  format = 'auto',
  responsive = 'true',
  adsenseId: propAdsenseId,
}: GoogleAdSenseProps) {
  const pathname = usePathname();
  const { incrementAdsCount } = useAdStatus();
  const envAdsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;
  const adsenseId = propAdsenseId || envAdsenseId;
  const adRef = useRef<HTMLModElement>(null);
  const initializedRef = useRef(false);

  // Block ads on admin, agent, operator, accountant, and shopper panels
  const isAdminPanel = pathname?.startsWith('/admin') || 
                       pathname?.startsWith('/agent') || 
                       pathname?.startsWith('/operator') ||
                       pathname?.startsWith('/accountant') ||
                       pathname?.startsWith('/shopper');

  if (isAdminPanel) {
    return null;
  }

  useEffect(() => {
    // Wait for AdSense script to load
    const initializeAd = () => {
      // Skip if already initialized or no ad element
      if (initializedRef.current || !adRef.current) {
        return;
      }

      const element = adRef.current;
      
      // Check if this specific element already has ads initialized
      if (element.hasAttribute('data-ads-initialized')) {
        initializedRef.current = true;
        return;
      }

      // Check if element already has the adsbygoogle property (from previous initialization)
      if ((element as any).adsbygoogle) {
        initializedRef.current = true;
        return;
      }

      // Check if adsbygoogle is available
      if (typeof window === 'undefined' || !(window as any).adsbygoogle) {
        // Retry after a short delay if script hasn't loaded yet
        setTimeout(initializeAd, 100);
        return;
      }

      try {
        // Initialize adsbygoogle array if it doesn't exist
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        
        // Only push if it's an array and this element hasn't been initialized
        if (Array.isArray((window as any).adsbygoogle)) {
          // Mark as initialized before pushing
          initializedRef.current = true;
          element.setAttribute('data-ads-initialized', 'true');
          (element as any).adsbygoogle = true;
          
          (window as any).adsbygoogle.push({});
          
          // Notify ad status context
          incrementAdsCount();
        }
      } catch (err) {
        console.error('AdSense error:', err);
        initializedRef.current = false;
      }
    };

    // Try to initialize immediately
    initializeAd();
    
    // Also listen for script load event
    if (typeof window !== 'undefined') {
      window.addEventListener('load', initializeAd);
      return () => window.removeEventListener('load', initializeAd);
    }
  }, []);

  if (!adsenseId) {
    return null;
  }

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={style}
      data-ad-client={adsenseId}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
  );
}

