// WeParlay Backend Performance Cache - Targeting < 200ms API response times
import NodeCache from 'node-cache';

// 🔄 API Response Caching for frequently accessed data
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes default
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Better performance
});

// 🔧 AUDIT ITEM 1: Enhanced Cache configurations for API overuse prevention
const CACHE_CONFIGS: Record<string, { ttl: number }> = {
  // Real-time data (extended cache to prevent API overuse)
  'sports-live': { ttl: 60 }, // Extended to 1 minute for live events
  'odds-live': { ttl: 120 }, // Extended to 2 minutes for live odds
  'rapidapi-football': { ttl: 300 }, // 5 minutes for football data
  'rapidapi-basketball': { ttl: 300 }, // 5 minutes for basketball data
  'rapidapi-baseball': { ttl: 600 }, // 10 minutes for baseball data
  'rapidapi-hockey': { ttl: 600 }, // 10 minutes for hockey data
  
  // Semi-static data (longer cache)
  'sports-list': { ttl: 1800 }, // 30 minutes for sports list
  'events-upcoming': { ttl: 300 }, // 5 minutes for upcoming events
  
  // Static data (very long cache)
  'tournaments': { ttl: 3600 }, // 1 hour for tournaments
  'user-profile': { ttl: 900 }, // 15 minutes for user profiles
  
  // API-specific aggressive caching
  'pinnacle-odds': { ttl: 180 }, // 3 minutes for Pinnacle data
  'espn-events': { ttl: 300 }, // 5 minutes for ESPN events
  'rapid-api-sports': { ttl: 600 }, // 10 minutes for RapidAPI sports data
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
  
  // Set cached data with smart TTL and API overuse prevention
  set: (key: string, data: any, type: string = 'default'): boolean => {
    const config = CACHE_CONFIGS[type] || { ttl: 300 }; // Default to 5 minutes instead of 1
    const success = cache.set(key, data, config.ttl);
    
    console.log(`💾 Cache SET: ${key} (TTL: ${config.ttl}s, Type: ${type})`);
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

// 🎯 Enhanced Rate limiting for aggressive API protection
const rateLimitStore = new NodeCache({ stdTTL: 300 }); // 5 minute windows for stricter control

// 🔧 AUDIT ITEM 1: Conservative rate limits to prevent 429 errors
const API_RATE_LIMITS = {
  'rapidapi': 5, // Very conservative for RapidAPI
  'pinnacle': 10,
  'espn': 20,
  'theoddsapi': 8,
  'default': 15
};

export const rateLimit = (key: string, apiType: string = 'default'): boolean => {
  const maxRequests = API_RATE_LIMITS[apiType] || API_RATE_LIMITS.default;
  const currentCount = rateLimitStore.get(key) as number || 0;
  
  if (currentCount >= maxRequests) {
    console.log(`🚫 Rate limit exceeded for ${key} (${apiType}): ${currentCount}/${maxRequests}`);
    return false;
  }
  
  rateLimitStore.set(key, currentCount + 1);
  console.log(`✅ Rate limit OK for ${key} (${apiType}): ${currentCount + 1}/${maxRequests}`);
  return true;
};

// 🔧 AUDIT ITEM 1: Cache-first strategy for API overuse prevention
export const getCachedOrFetch = async <T>(
  cacheKey: string,
  cacheType: string,
  fetchFunction: () => Promise<T>,
  forceCache: boolean = false
): Promise<T | null> => {
  // Always try cache first
  const cached = performanceCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // If force cache is enabled and no cache, return null
  if (forceCache) {
    console.log(`🔒 Cache-only mode: No data for ${cacheKey}`);
    return null;
  }
  
  try {
    const freshData = await fetchFunction();
    if (freshData) {
      performanceCache.set(cacheKey, freshData, cacheType);
    }
    return freshData;
  } catch (error) {
    console.error(`❌ Fetch failed for ${cacheKey}:`, error);
    return null;
  }
};