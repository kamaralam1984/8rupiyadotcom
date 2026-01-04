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
 * @param retryCount - Current retry attempt (internal use)
 * @param maxRetries - Maximum number of retries (default: 50)
 * @returns Promise that resolves when ad is initialized
 */
export function initializeAd(
  element: HTMLElement, 
  retryCount: number = 0, 
  maxRetries: number = 50
): Promise<void> {
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

      // Check if element already has adsbygoogle property (from previous initialization)
      if ((element as any).adsbygoogle) {
        devLog('✅ Ad already initialized (has adsbygoogle property)');
        element.setAttribute('data-ads-initialized', 'true');
        adCache.markInitialized(element);
        resolve();
        return;
      }

      // Check if this element already has ads loaded (AdSense internal check)
      if (element.querySelector && element.querySelector('.adsbygoogle[data-ads-loaded="true"]')) {
        devLog('✅ Ad already has ads loaded');
        element.setAttribute('data-ads-initialized', 'true');
        adCache.markInitialized(element);
        resolve();
        return;
      }

      // Check if AdSense script is loaded
      if (!isBrowser() || !window.adsbygoogle) {
        // Check max retries
        if (retryCount >= maxRetries) {
          devLog('⚠️ AdSense script not available, skipping ad initialization');
          // Resolve instead of reject - fail gracefully
          resolve();
          return;
        }

        // Retry after a short delay
        setTimeout(() => {
          initializeAd(element, retryCount + 1, maxRetries)
            .then(resolve)
            .catch(resolve); // Resolve even on error - fail gracefully
        }, 200);
        return;
      }

      // Initialize adsbygoogle array
      window.adsbygoogle = window.adsbygoogle || [];

      // Double-check: Make sure this element hasn't been initialized by another process
      if ((element as any).adsbygoogle || element.hasAttribute('data-ads-initialized')) {
        devLog('✅ Ad already initialized (double-check passed)');
        adCache.markInitialized(element);
        resolve();
        return;
      }

      // Mark as initialized BEFORE pushing to prevent duplicate pushes
      element.setAttribute('data-ads-initialized', 'true');
      (element as any).adsbygoogle = true;

      // Push to AdSense queue with error handling
      try {
        window.adsbygoogle.push({});
        
        // Add to cache
        adCache.markInitialized(element);
        
        // Only log first few initializations to reduce console spam
        adInitCount++;
        if (adInitCount <= 3 && process.env.NODE_ENV === 'development') {
        devLog('✅ AdSense ad initialized successfully');
        }
        resolve();
      } catch (pushError: any) {
        // Check if error is about already having ads
        if (pushError?.message?.includes('already have ads')) {
          devLog('⚠️ Ad already has ads - marking as initialized');
          adCache.markInitialized(element);
          resolve();
          return;
        }
        
        safeError('❌ AdSense push error:', pushError);
        // Remove initialization mark on failure
        element.removeAttribute('data-ads-initialized');
        delete (element as any).adsbygoogle;
        adCache.remove(element);
        // Resolve instead of reject - fail gracefully
        resolve();
      }
    } catch (error) {
      safeError('❌ AdSense initialization error:', error);
      // Ensure element is not marked as initialized on error
      element.removeAttribute('data-ads-initialized');
      adCache.remove(element);
      // Resolve instead of reject - fail gracefully
      resolve();
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

// Track if timeout warning has been shown (to prevent spam)
let timeoutWarningShown = false;
// Track ad initialization count (to reduce success log spam)
let adInitCount = 0;

/**
 * Wait for AdSense script to load
 * @param timeout - Maximum time to wait in milliseconds (default: 30000)
 * @returns Promise that resolves when script is loaded or timeout
 */
export function waitForAdSense(timeout: number = 30000): Promise<void> {
  return new Promise((resolve) => {
    // Already loaded
    if (isAdSenseLoaded()) {
      // Only log success in development mode
      if (process.env.NODE_ENV === 'development') {
      devLog('✅ AdSense script already loaded');
      }
      resolve();
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isAdSenseLoaded()) {
        clearInterval(checkInterval);
        // Only log success in development mode
        if (process.env.NODE_ENV === 'development') {
        devLog('✅ AdSense script loaded successfully');
        }
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        // Only show timeout warning once per session and only in development
        if (!timeoutWarningShown && process.env.NODE_ENV === 'development') {
          devLog('⚠️ AdSense script load timeout - continuing without ads (this warning will only show once)');
          timeoutWarningShown = true;
        }
        resolve();
      }
    }, 200);
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

