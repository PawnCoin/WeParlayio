// WeParlay Backend Performance Cache - Targeting < 200ms API response times
import NodeCache from 'node-cache';

// 🔄 API Response Caching for frequently accessed data
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes default
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Better performance
});

// Cache configurations for different data types
const CACHE_CONFIGS = {
  // Real-time data (short cache)
  'sports-live': { ttl: 5 }, // 5 seconds for live events
  'odds-live': { ttl: 10 }, // 10 seconds for live odds
  
  // Semi-static data (medium cache)
  'sports-list': { ttl: 300 }, // 5 minutes for sports list
  'events-upcoming': { ttl: 60 }, // 1 minute for upcoming events
  
  // Static data (long cache)
  'tournaments': { ttl: 600 }, // 10 minutes for tournaments
  'user-profile': { ttl: 300 }, // 5 minutes for user profiles
};

export const performanceCache = {
  // Get cached data with performance tracking
  get: (key: string): any => {
    const start = Date.now();
    const data = cache.get(key);
    const duration = Date.now() - start;
    
    if (data) {
      console.log(`⚡ Cache HIT: ${key} (${duration}ms)`);
    }
    return data;
  },
  
  // Set cached data with smart TTL
  set: (key: string, data: any, type: string = 'default'): boolean => {
    const config = CACHE_CONFIGS[type] || { ttl: 60 };
    const success = cache.set(key, data, config.ttl);
    
    console.log(`💾 Cache SET: ${key} (TTL: ${config.ttl}s)`);
    return success;
  },
  
  // Clear specific cache entries
  clear: (pattern?: string): void => {
    if (pattern) {
      const keys = cache.keys().filter(key => key.includes(pattern));
      cache.del(keys);
      console.log(`🗑️ Cache CLEAR: ${keys.length} keys matching "${pattern}"`);
    } else {
      cache.flushAll();
      console.log('🗑️ Cache CLEAR: All entries');
    }
  },
  
  // Get cache stats for monitoring
  getStats: () => {
    const stats = cache.getStats();
    return {
      keys: stats.keys,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: stats.hits / (stats.hits + stats.misses) * 100
    };
  }
};

// 🎯 Rate limiting for API protection
const rateLimitStore = new NodeCache({ stdTTL: 60 }); // 1 minute windows

export const rateLimit = (key: string, maxRequests: number = 100): boolean => {
  const currentCount = rateLimitStore.get(key) as number || 0;
  
  if (currentCount >= maxRequests) {
    console.log(`🚫 Rate limit exceeded for ${key}: ${currentCount}/${maxRequests}`);
    return false;
  }
  
  rateLimitStore.set(key, currentCount + 1);
  return true;
};