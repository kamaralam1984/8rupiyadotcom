/**
 * AdSense Helper Utility
 * Handles AdSense script loading and initialization
 */

import { adCache } from './adCache';
import { isBrowser, devLog, safeError, safeWarn } from './safetyCheck';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

/**
 * Initialize AdSense for a specific ad element
 * @param element - The ins.adsbygoogle element to initialize
 * @returns Promise that resolves when ad is initialized
 */
export function initializeAd(element: HTMLElement): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Check cache first
      if (adCache.isInitialized(element)) {
        devLog('✅ Ad already initialized (from cache)');
        resolve();
        return;
      }

      // Check if element is already initialized
      if (element.hasAttribute('data-ads-initialized')) {
        devLog('✅ Ad already initialized');
        adCache.markInitialized(element);
        resolve();
        return;
      }

      // Check if AdSense script is loaded
      if (!isBrowser() || !window.adsbygoogle) {
        safeWarn('⏳ Waiting for AdSense script to load...');
        // Retry after a short delay
        setTimeout(() => {
          initializeAd(element)
            .then(resolve)
            .catch((err) => {
              safeError('❌ Retry failed:', err);
              reject(err);
            });
        }, 100);
        return;
      }

      // Initialize adsbygoogle array
      window.adsbygoogle = window.adsbygoogle || [];

      // Mark as initialized
      element.setAttribute('data-ads-initialized', 'true');

      // Push to AdSense queue with error handling
      try {
        window.adsbygoogle.push({});
        
        // Add to cache
        adCache.markInitialized(element);
        
        devLog('✅ AdSense ad initialized successfully');
        resolve();
      } catch (pushError) {
        safeError('❌ AdSense push error:', pushError);
        // Remove initialization mark on failure
        element.removeAttribute('data-ads-initialized');
        adCache.remove(element);
        reject(pushError);
      }
    } catch (error) {
      safeError('❌ AdSense initialization error:', error);
      // Ensure element is not marked as initialized on error
      element.removeAttribute('data-ads-initialized');
      adCache.remove(element);
      reject(error);
    }
  });
}

/**
 * Check if AdSense script is loaded
 * @returns boolean indicating if script is ready
 */
export function isAdSenseLoaded(): boolean {
  return isBrowser() && Array.isArray(window.adsbygoogle);
}

/**
 * Wait for AdSense script to load
 * @param timeout - Maximum time to wait in milliseconds (default: 10000)
 * @returns Promise that resolves when script is loaded
 */
export function waitForAdSense(timeout: number = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isAdSenseLoaded()) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isAdSenseLoaded()) {
        clearInterval(checkInterval);
        devLog('✅ AdSense script loaded');
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('AdSense script load timeout'));
      }
    }, 100);
  });
}

/**
 * Cleanup AdSense ads on unmount
 * @param element - The ad element to cleanup
 */
export function cleanupAd(element: HTMLElement): void {
  try {
    element.removeAttribute('data-ads-initialized');
    adCache.remove(element);
    devLog('🧹 Ad cleanup completed');
  } catch (error) {
    safeError('❌ Ad cleanup error:', error);
  }
}

