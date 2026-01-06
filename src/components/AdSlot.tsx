'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import GoogleAdSense from './GoogleAdSense';
import { useShouldBlockAds } from '@/lib/adBlocking';

interface CustomAd {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
}

interface AdSlotProps {
  slot: 'homepage' | 'category' | 'search' | 'shop';
  className?: string;
  style?: React.CSSProperties;
  shopsCount?: number; // Optional: Number of shops (for empty category pages)
  contentLength?: number; // Optional: Number of words on the page
}

export default function AdSlot({ slot, className = '', style, shopsCount, contentLength }: AdSlotProps) {
  const [enabled, setEnabled] = useState(false);
  const [adsenseId, setAdsenseId] = useState('');
  const [customAds, setCustomAds] = useState<CustomAd[]>([]);
  const [loading, setLoading] = useState(true);
  const adContainerRef = useRef<HTMLDivElement>(null);

  // Block ads on specific routes or if content is too short
  // IMPORTANT: This hook must be called before any early returns
  const shouldBlock = useShouldBlockAds(shopsCount, contentLength);

  // Fetch ad settings - define inline in useEffect to avoid temporal dead zone
  useEffect(() => {
    const fetchAdSettings = async () => {
      try {
        const response = await fetch('/api/ads/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings) {
            const settings = data.settings;
            
            // Check if this slot is enabled
            const slotEnabled = 
              (slot === 'homepage' && settings.homepageAds) ||
              (slot === 'category' && settings.categoryAds) ||
              (slot === 'search' && settings.searchAds) ||
              (slot === 'shop' && settings.shopPageAds);
            
            setEnabled(slotEnabled);
            setAdsenseId(settings.adsenseId || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '');
            
            // Get custom ads for this slot
            if (settings.customAds && settings.customAds[slot]) {
              setCustomAds(settings.customAds[slot].filter((ad: CustomAd) => ad.enabled));
            }
            
            // Note: AdSense script is already loaded in layout.tsx
            // We don't need to inject it here to avoid hydration mismatches
            // The AdSense script in layout.tsx will handle all ad initializations
          }
        }
      } catch (error) {
        console.error('Error fetching ad settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdSettings();
  }, [slot]);

  useEffect(() => {
    // Render custom ads when they're loaded
    if (customAds.length > 0 && adContainerRef.current) {
      customAds.forEach((ad) => {
        if (ad.enabled && ad.code) {
          // Check if this ad is already rendered
          const existingAd = adContainerRef.current?.querySelector(`[data-ad-id="${ad.id}"]`);
          if (!existingAd) {
            const adDiv = document.createElement('div');
            adDiv.setAttribute('data-ad-id', ad.id);
            adDiv.className = 'custom-ad mb-4';
            
            // Create a container for the ad code
            const parser = new DOMParser();
            const doc = parser.parseFromString(ad.code, 'text/html');
            
            // Clone all nodes from the parsed document
            Array.from(doc.body.childNodes).forEach((node) => {
              adDiv.appendChild(node.cloneNode(true));
            });
            
            // If there are scripts, execute them
            const scripts = adDiv.querySelectorAll('script');
            scripts.forEach((oldScript) => {
              const newScript = document.createElement('script');
              Array.from(oldScript.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
              });
              newScript.textContent = oldScript.textContent;
              oldScript.parentNode?.replaceChild(newScript, oldScript);
            });
            
            adContainerRef.current?.appendChild(adDiv);
          }
        }
      });
    }
  }, [customAds]);

  // Don't show ads on blocked routes - check AFTER all hooks are called
  if (shouldBlock) {
    return null;
  }

  if (loading) {
    return null;
  }

  // Show if slot is enabled and either has AdSense ID or custom ads
  const hasAds = enabled && (adsenseId || customAds.length > 0);
  
  if (!hasAds) {
    return null;
  }

  return (
    <div className={`ad-slot ad-slot-${slot} ${className}`} style={style} ref={adContainerRef}>
      {/* Custom Ads */}
      {customAds.length > 0 && (
        <div className="custom-ads-container space-y-4">
          {/* Custom ads are rendered via useEffect */}
        </div>
      )}
      
      {/* Google AdSense (if enabled and no custom ads, or if custom ads don't fill the space) */}
      {adsenseId && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 min-h-[100px] flex items-center justify-center">
          <GoogleAdSense
            adsenseId={adsenseId}
            shopsCount={shopsCount}
            contentLength={contentLength}
            style={{ 
              display: 'block',
              minWidth: '320px',
              minHeight: '100px',
              ...style 
            }}
            format="auto"
            responsive="true"
          />
        </div>
      )}
    </div>
  );
}

