'use client';

import { useEffect, useRef } from 'react';

interface DisplayAdProps {
  className?: string;
}

export default function DisplayAd({ className = '' }: DisplayAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initializedRef = useRef(false);
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || 'ca-pub-4472734290958984';
  const adSlot = '3350299981';

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
          
          (window as any).adsbygoogle.push({});
        }
      } catch (err) {
        console.error('Display Ad AdSense error:', err);
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
    <div className={`display-ad ${className}`}>
      {/* 8rupididplay */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseId}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

