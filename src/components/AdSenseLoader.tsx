'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function AdSenseLoader() {
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;

  if (!adsenseId) {
    return null;
  }

  return (
    <Script
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
      async
    />
  );
}

