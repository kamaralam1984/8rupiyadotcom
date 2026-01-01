'use client';

import { useEffect, useState, ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { isBrowser, isDevelopment, devLog, safeError } from '@/lib/safetyCheck';
import { getDeviceInfo, logDeviceInfo } from '@/lib/deviceDetection';
import { adCache } from '@/lib/adCache';

interface SafeAdWrapperProps {
  children: ReactNode;
  adType?: string;
  fallback?: ReactNode;
}

/**
 * Safe Ad Wrapper Component
 * Wraps ads with error handling, device detection, and caching
 */
export default function SafeAdWrapper({ 
  children, 
  adType = 'generic',
  fallback 
}: SafeAdWrapperProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isBrowser()) return;

    try {
      // Log device info in development
      if (isDevelopment()) {
        logDeviceInfo();
        devLog(`🎯 Initializing ${adType} ad`);
      }

      // Get device info
      const deviceInfo = getDeviceInfo();
      devLog('Device Info:', deviceInfo);

      // Mark as ready
      setIsReady(true);

    } catch (error) {
      safeError(`SafeAdWrapper error for ${adType}:`, error);
      setHasError(true);
    }
  }, [adType]);

  // Don't render if there's an error
  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  // Wait for ready state
  if (!isReady) {
    return (
      <div className="safe-ad-loading">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-[250px] w-full" />
      </div>
    );
  }

  // Render with error boundary
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="safe-ad-error p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {isDevelopment() && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ad failed to load ({adType})
              </p>
            )}
          </div>
        )
      }
    >
      <div className="safe-ad-container" data-ad-type={adType}>
        {children}
      </div>
    </ErrorBoundary>
  );
}

/**
 * HOC to wrap any ad component with SafeAdWrapper
 */
export function withSafeAd<P extends object>(
  Component: React.ComponentType<P>,
  adType: string
) {
  return function SafeAdComponent(props: P) {
    return (
      <SafeAdWrapper adType={adType}>
        <Component {...props} />
      </SafeAdWrapper>
    );
  };
}

