"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function AdsenseAd() {
  const pathname = usePathname();
  const adRef = useRef<HTMLDivElement>(null);

  // Block ads on admin, agent, operator, accountant, and shopper panels
  const isAdminPanel = pathname?.startsWith('/admin') || 
                       pathname?.startsWith('/agent') || 
                       pathname?.startsWith('/operator') ||
                       pathname?.startsWith('/accountant') ||
                       pathname?.startsWith('/shopper');

  useEffect(() => {
    if (isAdminPanel || !adRef.current) return;

    // Prevent double ads on re-render
    if (adRef.current.getAttribute("data-loaded")) return;

    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        adRef.current?.setAttribute("data-loaded", "true");
      }
    } catch (e) {
      console.log("Adsense error", e);
    }
  }, [isAdminPanel]);

  if (isAdminPanel) {
    return null;
  }

  return (
    <div ref={adRef}>
      <ins
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
