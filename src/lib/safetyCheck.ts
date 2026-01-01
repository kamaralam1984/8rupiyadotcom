/**
 * Production Safety Checks
 * Ensures safe execution in all environments
 */

/**
 * Check if running in browser
 * @returns boolean
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if running in production
 * @returns boolean
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 * @returns boolean
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Safe console.log (only in development)
 * @param args - Arguments to log
 */
export function devLog(...args: any[]): void {
  if (isDevelopment()) {
    console.log(...args);
  }
}

/**
 * Safe console.error (always logs)
 * @param args - Arguments to log
 */
export function safeError(...args: any[]): void {
  console.error(...args);
}

/**
 * Safe console.warn (always logs)
 * @param args - Arguments to log
 */
export function safeWarn(...args: any[]): void {
  console.warn(...args);
}

/**
 * Execute function safely with try-catch
 * @param fn - Function to execute
 * @param errorMessage - Custom error message
 * @returns Result or null on error
 */
export async function safeExecute<T>(
  fn: () => Promise<T> | T,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    safeError(errorMessage || 'Safe execution failed:', error);
    return null;
  }
}

/**
 * Check if AdSense is blocked by ad blocker
 * @returns Promise<boolean>
 */
export async function isAdBlockerActive(): Promise<boolean> {
  if (!isBrowser()) return false;

  try {
    // Check if adsbygoogle is available
    if (!window.adsbygoogle) {
      return true;
    }

    // Check if ads are actually loading
    const testAd = document.createElement('ins');
    testAd.className = 'adsbygoogle';
    testAd.style.display = 'none';
    document.body.appendChild(testAd);

    try {
      (window.adsbygoogle as any).push({});
      document.body.removeChild(testAd);
      return false;
    } catch {
      document.body.removeChild(testAd);
      return true;
    }
  } catch (error) {
    safeError('Ad blocker detection failed:', error);
    return false;
  }
}

/**
 * Get environment info
 * @returns Environment configuration
 */
export function getEnvironmentInfo() {
  return {
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    isBrowser: isBrowser(),
    nodeEnv: process.env.NODE_ENV,
  };
}

