/**
 * Ad Cache Management
 * Prevents duplicate ad loading and improves performance
 */

interface AdCacheEntry {
  initialized: boolean;
  timestamp: number;
  element: HTMLElement;
}

class AdCache {
  private cache: Map<string, AdCacheEntry> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute

  /**
   * Generate unique key for ad element
   */
  private generateKey(element: HTMLElement): string {
    const slot = element.getAttribute('data-ad-slot') || '';
    const client = element.getAttribute('data-ad-client') || '';
    return `${client}-${slot}-${element.id || Date.now()}`;
  }

  /**
   * Check if ad is already in cache and valid
   */
  isInitialized(element: HTMLElement): boolean {
    const key = this.generateKey(element);
    const entry = this.cache.get(key);

    if (!entry) return false;

    // Check if cache is still valid
    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return false;
    }

    return entry.initialized;
  }

  /**
   * Mark ad as initialized in cache
   */
  markInitialized(element: HTMLElement): void {
    const key = this.generateKey(element);
    this.cache.set(key, {
      initialized: true,
      timestamp: Date.now(),
      element,
    });
  }

  /**
   * Remove ad from cache
   */
  remove(element: HTMLElement): void {
    const key = this.generateKey(element);
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const adCache = new AdCache();

/**
 * Auto-clean expired cache every minute
 */
if (typeof window !== 'undefined') {
  setInterval(() => {
    adCache.cleanExpired();
  }, 60000);
}

