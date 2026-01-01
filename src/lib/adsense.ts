/**
 * AdSense Helper Utility
 * Handles AdSense script loading and initialization
 */

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
      // Check if element is already initialized
      if (element.hasAttribute('data-ads-initialized')) {
        console.log('✅ Ad already initialized');
        resolve();
        return;
      }

      // Check if AdSense script is loaded
      if (typeof window === 'undefined' || !window.adsbygoogle) {
        console.warn('⏳ Waiting for AdSense script to load...');
        // Retry after a short delay
        setTimeout(() => {
          initializeAd(element).then(resolve).catch(reject);
        }, 100);
        return;
      }

      // Initialize adsbygoogle array
      window.adsbygoogle = window.adsbygoogle || [];

      // Mark as initialized
      element.setAttribute('data-ads-initialized', 'true');

      // Push to AdSense queue
      window.adsbygoogle.push({});

      console.log('✅ AdSense ad initialized successfully');
      resolve();
    } catch (error) {
      console.error('❌ AdSense initialization error:', error);
      reject(error);
    }
  });
}

/**
 * Check if AdSense script is loaded
 * @returns boolean indicating if script is ready
 */
export function isAdSenseLoaded(): boolean {
  return typeof window !== 'undefined' && Array.isArray(window.adsbygoogle);
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
        console.log('✅ AdSense script loaded');
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
    console.log('🧹 Ad cleanup completed');
  } catch (error) {
    console.error('❌ Ad cleanup error:', error);
  }
}

