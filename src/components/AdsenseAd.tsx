"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initializeAd, waitForAdSense, cleanupAd } from "@/lib/adsense";

export default function AdsenseAd() {
  const pathname = usePathname();
  const adRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const initializedRef = useRef(false);

  // Block ads on admin, agent, operator, accountant, and shopper panels
  const isAdminPanel = pathname?.startsWith('/admin') || 
                       pathname?.startsWith('/agent') || 
                       pathname?.startsWith('/operator') ||
                       pathname?.startsWith('/accountant') ||
                       pathname?.startsWith('/shopper');

  useEffect(() => {
    if (isAdminPanel || initializedRef.current) return;

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
  }, [isAdminPanel]);

  if (isAdminPanel) {
    return null;
  }

  return (
    <div ref={adRef} className="adsense-ad-container">
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-4472734290958984"
        data-ad-slot="4723091404"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
