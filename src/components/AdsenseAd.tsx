"use client";
import { useEffect, useRef } from "react";
import { initializeAd, waitForAdSense, cleanupAd } from "@/lib/adsense";
import { useShouldBlockAds } from "@/lib/adBlocking";

interface AdsenseAdProps {
  shopsCount?: number; // Optional: Number of shops (for empty category pages)
  contentLength?: number; // Optional: Number of words on the page
}

export default function AdsenseAd({ shopsCount, contentLength }: AdsenseAdProps = {}) {
  const adRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const initializedRef = useRef(false);

  // Block ads on specific routes or if content is too short
  const shouldBlock = useShouldBlockAds(shopsCount, contentLength);

  useEffect(() => {
    if (shouldBlock || initializedRef.current) return;

    const insElement = insRef.current;
    if (!insElement) return;

    const init = async () => {
      // Wait for AdSense script (resolves gracefully if timeout)
      await waitForAdSense();
      
      // Initialize the ad (resolves gracefully if fails)
      await initializeAd(insElement);
      
      initializedRef.current = true;
    };

    init();

    return () => {
      if (insElement) {
        cleanupAd(insElement);
      }
    };
  }, [shouldBlock]);

  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (shouldBlock || !adsenseId) {
    return null;
  }

  return (
    <div ref={adRef} className="adsense-ad-container">
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseId}
        data-ad-slot="4723091404"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
