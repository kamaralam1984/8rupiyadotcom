'use client';

import { useEffect } from 'react';
import Analytics from '@/lib/analytics';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize analytics tracking
    Analytics.init();
    console.log('✅ Analytics tracking initialized');
  }, []);

  return <>{children}</>;
}

