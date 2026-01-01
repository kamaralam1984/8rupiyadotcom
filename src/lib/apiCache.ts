/**
 * ⚡ API RESPONSE CACHING
 * Wrapper functions to add caching to API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import cache, { CacheTTL, generateCacheKey } from './cache';

/**
 * Cached API handler wrapper
 * Automatically caches GET requests
 */
export function cachedApiHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    ttl?: number;
    keyGenerator?: (req: NextRequest) => string;
    methods?: string[];
  } = {}
) {
  const {
    ttl = CacheTTL.FIVE_MINUTES,
    keyGenerator,
    methods = ['GET'],
  } = options;

  return async (req: NextRequest) => {
    const method = req.method;
    
    // Only cache specified methods (default: GET)
    if (!methods.includes(method)) {
      return await handler(req);
    }

    // Generate cache key
    const cacheKey = keyGenerator 
      ? keyGenerator(req)
      : generateCacheKey('api', req.nextUrl.pathname, req.nextUrl.search);

    try {
      // Try to get from cache
      const cached = await cache.get(cacheKey);
      
      if (cached) {
        console.log(`✅ Cache HIT: ${cacheKey}`);
        
        // Return cached response with cache header
        const response = NextResponse.json(cached);
        response.headers.set('X-Cache-Status', 'HIT');
        response.headers.set('X-Cache-Key', cacheKey);
        return response;
      }

      console.log(`⚠️  Cache MISS: ${cacheKey}`);
      
      // Execute handler
      const response = await handler(req);
      
      // Cache successful responses
      if (response.status === 200) {
        const data = await response.json();
        await cache.set(cacheKey, data, ttl);
        
        // Return response with cache header
        const newResponse = NextResponse.json(data);
        newResponse.headers.set('X-Cache-Status', 'MISS');
        newResponse.headers.set('X-Cache-Key', cacheKey);
        return newResponse;
      }
      
      return response;
    } catch (error: any) {
      console.error('API cache error:', error.message);
      // If caching fails, just return the handler response
      return await handler(req);
    }
  };
}

/**
 * Cache database query results
 */
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = CacheTTL.FIVE_MINUTES
): Promise<T> {
  return await cache.getOrSet(key, queryFn, ttl);
}

/**
 * Invalidate cache for a pattern
 */
export async function invalidateCache(pattern: string): Promise<boolean> {
  return await cache.deletePattern(pattern);
}

/**
 * Cache shop search results
 */
export async function cachedShopSearch(
  query: {
    category?: string;
    city?: string;
    search?: string;
  },
  searchFn: () => Promise<any>
): Promise<any> {
  const cacheKey = generateCacheKey(
    'shops',
    query.category || 'all',
    query.city || 'all',
    query.search || 'all'
  );
  
  return await cachedQuery(cacheKey, searchFn, CacheTTL.TEN_MINUTES);
}

/**
 * Cache user profile
 */
export async function cachedUserProfile(
  userId: string,
  fetchFn: () => Promise<any>
): Promise<any> {
  const cacheKey = generateCacheKey('user-profile', userId);
  return await cachedQuery(cacheKey, fetchFn, CacheTTL.FIVE_MINUTES);
}

/**
 * Cache categories
 */
export async function cachedCategories(
  fetchFn: () => Promise<any>
): Promise<any> {
  const cacheKey = 'categories:all';
  return await cachedQuery(cacheKey, fetchFn, CacheTTL.ONE_HOUR);
}

/**
 * Cache GOLU responses for common queries
 */
export async function cachedGoluResponse(
  query: string,
  generateFn: () => Promise<any>,
  ttl: number = CacheTTL.ONE_HOUR
): Promise<any> {
  // Only cache simple, common queries
  const commonQueries = [
    'time', 'date', 'weather', 'categories', 'help',
    'kitne baje', 'mausam', 'categories', 'madad'
  ];
  
  const shouldCache = commonQueries.some(q => 
    query.toLowerCase().includes(q)
  );
  
  if (!shouldCache) {
    return await generateFn();
  }
  
  const cacheKey = generateCacheKey('golu', query.toLowerCase().trim());
  return await cachedQuery(cacheKey, generateFn, ttl);
}

/**
 * Clear cache for specific patterns
 */
export async function clearCacheForPatterns(patterns: string[]): Promise<void> {
  for (const pattern of patterns) {
    await invalidateCache(pattern);
  }
}

/**
 * Invalidate cache on data changes
 */
export const CacheInvalidation = {
  // Shops
  onShopCreate: () => invalidateCache('shops:*'),
  onShopUpdate: (shopId: string) => Promise.all([
    invalidateCache('shops:*'),
    cache.delete(generateCacheKey('shop', shopId)),
  ]),
  onShopDelete: () => invalidateCache('shops:*'),
  
  // Categories
  onCategoryChange: () => invalidateCache('categories:*'),
  
  // User profiles
  onUserProfileUpdate: (userId: string) => 
    cache.delete(generateCacheKey('user-profile', userId)),
  
  // GOLU responses
  clearGoluCache: () => invalidateCache('golu:*'),
};

export default {
  handler: cachedApiHandler,
  query: cachedQuery,
  invalidate: invalidateCache,
  shopSearch: cachedShopSearch,
  userProfile: cachedUserProfile,
  categories: cachedCategories,
  goluResponse: cachedGoluResponse,
  clear: clearCacheForPatterns,
  invalidation: CacheInvalidation,
};

