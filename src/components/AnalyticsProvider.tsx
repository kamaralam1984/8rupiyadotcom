'use client';

import { useEffect } from 'react';
import Analytics from '@/lib/analytics';
import { setupErrorHandlers } from '@/lib/errorLogger';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize analytics tracking
    Analytics.init();
    console.log('✅ Analytics tracking initialized');
    
    // Setup global error handlers
    setupErrorHandlers();
  }, []);

  return <>{children}</>;
}

