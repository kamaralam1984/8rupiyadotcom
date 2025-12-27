import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: ReturnType<typeof createClient> | null = null;
let isRedisAvailable = false;
let connectionAttempted = false;
let connectionPromise: Promise<ReturnType<typeof createClient> | null> | null = null;

export async function getRedisClient() {
  // If already connected, return client
  if (redisClient && isRedisAvailable) {
    return redisClient;
  }

  // If connection failed before, don't try again
  if (connectionAttempted && !isRedisAvailable) {
    return null;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // Try to connect only once
  connectionAttempted = true;
  connectionPromise = (async () => {
    try {
      redisClient = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: false, // Don't auto-reconnect
        },
      });

      redisClient.on('error', (err) => {
        // Silently handle errors - don't log repeatedly
        isRedisAvailable = false;
      });

      await redisClient.connect();
      isRedisAvailable = true;
      console.log('✅ Redis connected successfully');
      return redisClient;
    } catch (error: any) {
      // Connection failed - mark as unavailable
      isRedisAvailable = false;
      redisClient = null;
      // Only log once on first failure
      if (!connectionAttempted || error.message.includes('ECONNREFUSED')) {
        console.warn('⚠️ Redis not available. App will work without caching.');
      }
      return null;
    }
  })();

  return connectionPromise;
}

export async function cacheGet(key: string): Promise<string | null> {
  try {
    const client = await getRedisClient();
    if (!client || !isRedisAvailable) {
      return null;
    }
    return await client.get(key);
  } catch (error) {
    return null; // Silently return null on any error
  }
}

export async function cacheSet(key: string, value: string, ttl?: number): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client || !isRedisAvailable) {
      return; // Silently fail if Redis is not available
    }
    if (ttl) {
      await client.setEx(key, ttl, value);
    } else {
      await client.set(key, value);
    }
  } catch (error) {
    // Silently fail - app works without cache
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client || !isRedisAvailable) {
      return;
    }
    await client.del(key);
  } catch (error) {
    // Silently fail
  }
}
