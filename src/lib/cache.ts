/**
 * ⚡ REDIS CACHE LAYER
 * Fast caching system for API responses and database queries
 * Reduces database load and improves response times
 */

import { createClient, RedisClientType } from 'redis';

// Redis client instance
let redisClient: RedisClientType | null = null;
let isConnecting = false;

// Cache configuration
const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_URI;
const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false'; // Enable by default
const DEFAULT_TTL = 300; // 5 minutes default TTL

/**
 * Connect to Redis
 */
async function connectRedis(): Promise<RedisClientType | null> {
  // If already connected, return client
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  // If already connecting, wait
  if (isConnecting) {
    return null;
  }

  // If no Redis URL, cache is disabled
  if (!REDIS_URL || !CACHE_ENABLED) {
    console.log('ℹ️  Redis cache disabled (no REDIS_URL or CACHE_ENABLED=false)');
    return null;
  }

  try {
    isConnecting = true;
    
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 5000, // 5 seconds
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.error('❌ Redis connection failed after 3 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    await redisClient.connect();
    isConnecting = false;
    
    return redisClient;
  } catch (error: any) {
    console.error('❌ Redis connection failed:', error.message);
    console.log('ℹ️  Continuing without cache');
    isConnecting = false;
    redisClient = null;
    return null;
  }
}

/**
 * Get value from cache
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  try {
    const client = await connectRedis();
    if (!client) return null;

    const value = await client.get(key);
    if (!value) return null;

    return JSON.parse(value) as T;
  } catch (error: any) {
    console.error('Cache get error:', error.message);
    return null;
  }
}

/**
 * Set value in cache
 */
export async function setCache(
  key: string,
  value: any,
  ttl: number = DEFAULT_TTL
): Promise<boolean> {
  try {
    const client = await connectRedis();
    if (!client) return false;

    const serialized = JSON.stringify(value);
    await client.setEx(key, ttl, serialized);
    
    return true;
  } catch (error: any) {
    console.error('Cache set error:', error.message);
    return false;
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<boolean> {
  try {
    const client = await connectRedis();
    if (!client) return false;

    await client.del(key);
    return true;
  } catch (error: any) {
    console.error('Cache delete error:', error.message);
    return false;
  }
}

/**
 * Delete multiple keys matching pattern
 */
export async function deleteCachePattern(pattern: string): Promise<boolean> {
  try {
    const client = await connectRedis();
    if (!client) return false;

    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    
    return true;
  } catch (error: any) {
    console.error('Cache pattern delete error:', error.message);
    return false;
  }
}

/**
 * Check if key exists in cache
 */
export async function hasCache(key: string): Promise<boolean> {
  try {
    const client = await connectRedis();
    if (!client) return false;

    const exists = await client.exists(key);
    return exists === 1;
  } catch (error: any) {
    console.error('Cache exists error:', error.message);
    return false;
  }
}

/**
 * Get or set cache (fetch if not exists)
 */
export async function getOrSetCache<T = any>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  try {
    // Try to get from cache first
    const cached = await getCache<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetchFn();
    
    // Store in cache (don't wait)
    setCache(key, fresh, ttl).catch(() => {});
    
    return fresh;
  } catch (error: any) {
    console.error('Cache getOrSet error:', error.message);
    // If cache fails, just fetch fresh data
    return await fetchFn();
  }
}

/**
 * Generate cache key
 */
export function generateCacheKey(prefix: string, ...parts: any[]): string {
  return `${prefix}:${parts.map(p => String(p)).join(':')}`;
}

/**
 * Cache TTL presets (in seconds)
 */
export const CacheTTL = {
  ONE_MINUTE: 60,
  FIVE_MINUTES: 300,
  TEN_MINUTES: 600,
  THIRTY_MINUTES: 1800,
  ONE_HOUR: 3600,
  SIX_HOURS: 21600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
  ONE_MONTH: 2592000,
};

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<boolean> {
  try {
    const client = await connectRedis();
    if (!client) return false;

    await client.flushDb();
    console.log('✅ All cache cleared');
    return true;
  } catch (error: any) {
    console.error('Cache clear error:', error.message);
    return false;
  }
}

/**
 * Disconnect Redis (cleanup)
 */
export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      redisClient = null;
      console.log('✅ Redis disconnected');
    }
  } catch (error: any) {
    console.error('Redis disconnect error:', error.message);
  }
}

// Export default cache functions
export default {
  get: getCache,
  set: setCache,
  delete: deleteCache,
  deletePattern: deleteCachePattern,
  has: hasCache,
  getOrSet: getOrSetCache,
  generateKey: generateCacheKey,
  TTL: CacheTTL,
  clearAll: clearAllCache,
  disconnect: disconnectRedis,
};

