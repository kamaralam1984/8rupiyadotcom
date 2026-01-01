/**
 * GOLU Reply Cache - FAST RESPONSE SYSTEM
 * Caches common queries for instant responses
 * Reduces API calls and improves speed 🚀
 */

/**
 * In-memory cache (for development)
 * In production, use Redis or similar
 */
const cache = new Map<string, CachedReply>();

interface CachedReply {
  reply: string;
  timestamp: number;
  hitCount: number;
}

/**
 * Cache duration in milliseconds
 * Default: 5 minutes for dynamic content
 * Can be increased for static FAQs
 */
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Generate cache key from query and role
 */
function generateCacheKey(query: string, role: string = 'user'): string {
  // Normalize query
  const normalized = query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special chars
    .replace(/\s+/g, '-');   // Replace spaces with dash

  return `${role}:${normalized}`;
}

/**
 * Get cached reply if available and not expired
 */
export function getCachedReply(query: string, role: string = 'user'): string | null {
  const key = generateCacheKey(query, role);
  const cached = cache.get(key);

  if (!cached) {
    return null;
  }

  // Check if expired
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  // Increment hit count
  cached.hitCount++;
  cache.set(key, cached);

  console.log(`✅ Cache HIT: ${key} (hits: ${cached.hitCount})`);
  return cached.reply;
}

/**
 * Set cached reply
 */
export function setCachedReply(
  query: string, 
  reply: string, 
  role: string = 'user'
): void {
  const key = generateCacheKey(query, role);
  
  cache.set(key, {
    reply,
    timestamp: Date.now(),
    hitCount: 0,
  });

  console.log(`💾 Cache SET: ${key}`);
}

/**
 * Clear specific cache entry
 */
export function clearCachedReply(query: string, role: string = 'user'): void {
  const key = generateCacheKey(query, role);
  cache.delete(key);
  console.log(`🗑️ Cache CLEAR: ${key}`);
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  const size = cache.size;
  cache.clear();
  console.log(`🗑️ Cache CLEARED: ${size} entries removed`);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const entries = Array.from(cache.values());
  const totalHits = entries.reduce((sum, entry) => sum + entry.hitCount, 0);
  
  return {
    size: cache.size,
    totalHits,
    avgHitsPerEntry: cache.size > 0 ? totalHits / cache.size : 0,
    oldestEntry: entries.length > 0 
      ? Math.min(...entries.map(e => e.timestamp))
      : null,
  };
}

/**
 * Pre-cache common FAQs
 * Call this on server startup
 */
export function preCacheCommonQueries(): void {
  const commonQueries: Array<{ query: string; reply: string; role?: string }> = [
    {
      query: 'hello',
      reply: 'haan bhai, bol! Main GOLU, tere liye yahaan hoon. Kya help chahiye? 👊',
    },
    {
      query: 'help',
      reply: 'haan bhai, main tumhe help karunga! Batao kya problem hai - shops dhundni hain, reminders set karne hain, ya kuch aur? Sab batao 🔥',
    },
    {
      query: 'shops kaise dhundhu',
      reply: 'simple hai bhai! Bas mujhe bolo kya chahiye - "mobile shop Patna me" ya "grocery store near me". Main turant dikha dunga best shops. Try karo! ✅',
    },
    {
      query: 'reminder kaise lagau',
      reply: 'haan bhai, bahut easy hai! Bas bol "subah 8 baje alarm" ya "kal 10 baje meeting yaad dilana". Main set kar dunga. Kya reminder lagana hai? ⏰',
    },
  ];

  commonQueries.forEach(({ query, reply, role }) => {
    setCachedReply(query, reply, role || 'user');
  });

  console.log(`✅ Pre-cached ${commonQueries.length} common queries`);
}

/**
 * Check if query should be cached
 * Some queries (like time-sensitive ones) shouldn't be cached
 */
export function shouldCache(query: string): boolean {
  const lowerQuery = query.toLowerCase();

  // Don't cache time-sensitive queries
  const timeSensitive = [
    'aaj',
    'abhi',
    'today',
    'now',
    'current',
    'latest',
    'weather',
    'mausam',
  ];

  if (timeSensitive.some(word => lowerQuery.includes(word))) {
    return false;
  }

  // Don't cache personal queries
  const personal = [
    'mera',
    'meri',
    'my',
    'naam',
    'name',
    'salary',
    'rent',
  ];

  if (personal.some(word => lowerQuery.includes(word))) {
    return false;
  }

  // Cache everything else
  return true;
}

/**
 * Clean expired cache entries
 * Call this periodically (e.g., every hour)
 */
export function cleanExpiredCache(): void {
  const now = Date.now();
  let removed = 0;

  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
      removed++;
    }
  }

  if (removed > 0) {
    console.log(`🧹 Cleaned ${removed} expired cache entries`);
  }
}

// Auto-clean every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanExpiredCache, 10 * 60 * 1000);
}

