// Simple API optimization wrapper to prevent 429 errors
class APIOptimizer {
  private lastRequests: Map<string, number> = new Map();
  private backoffUntil: Map<string, number> = new Map();
  private cache: Map<string, { data: any; expires: number }> = new Map();
  
  // Check if we can make a request (simple rate limiting)
  canRequest(apiName: string, minInterval: number = 2000): boolean {
    const now = Date.now();
    const lastRequest = this.lastRequests.get(apiName) || 0;
    const backoff = this.backoffUntil.get(apiName) || 0;
    
    // Check if we're in backoff period
    if (now < backoff) {
      return false;
    }
    
    // Check minimum interval between requests
    return (now - lastRequest) >= minInterval;
  }
  
  // Record successful request
  recordSuccess(apiName: string): void {
    this.lastRequests.set(apiName, Date.now());
    this.backoffUntil.delete(apiName);
  }
  
  // Record rate limit hit (start exponential backoff)
  recordRateLimit(apiName: string, backoffMs: number = 60000): void {
    const now = Date.now();
    this.backoffUntil.set(apiName, now + backoffMs);
    console.log(`🚫 Rate limit hit for ${apiName}, backing off for ${backoffMs}ms`);
  }
  
  // Get cached data if available
  getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached || Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }
  
  // Set cache with TTL
  setCache(key: string, data: any, ttlMs: number = 300000): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs
    });
  }
  
  // Get backoff time remaining
  getBackoffTime(apiName: string): number {
    const backoff = this.backoffUntil.get(apiName) || 0;
    return Math.max(0, backoff - Date.now());
  }
}

export const apiOptimizer = new APIOptimizer();