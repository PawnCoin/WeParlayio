interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
  minBackoffMs: number;
}

interface APIEndpoint {
  name: string;
  requests: number[];
  lastRequest: number;
  backoffUntil: number;
  consecutiveFailures: number;
}

export class SmartRateLimiter {
  private endpoints: Map<string, APIEndpoint> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  
  constructor(private config: RateLimitConfig = {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
    backoffMultiplier: 2,
    maxBackoffMs: 300000, // 5 minutes
    minBackoffMs: 1000 // 1 second
  }) {}

  // Check if we can make a request to this endpoint
  canMakeRequest(endpointName: string): boolean {
    const endpoint = this.getEndpoint(endpointName);
    const now = Date.now();

    // Check if we're in backoff period
    if (now < endpoint.backoffUntil) {
      return false;
    }

    // Clean old requests outside the window
    endpoint.requests = endpoint.requests.filter(
      time => now - time < this.config.windowMs
    );

    // Check if we're under the rate limit
    return endpoint.requests.length < this.config.maxRequests;
  }

  // Record a successful request
  recordSuccess(endpointName: string): void {
    const endpoint = this.getEndpoint(endpointName);
    const now = Date.now();
    
    endpoint.requests.push(now);
    endpoint.lastRequest = now;
    endpoint.consecutiveFailures = 0;
    endpoint.backoffUntil = 0;
  }

  // Record a rate limit failure (429 error)
  recordRateLimit(endpointName: string): void {
    const endpoint = this.getEndpoint(endpointName);
    const now = Date.now();
    
    endpoint.consecutiveFailures++;
    
    // Calculate exponential backoff
    const backoffMs = Math.min(
      this.config.minBackoffMs * Math.pow(this.config.backoffMultiplier, endpoint.consecutiveFailures - 1),
      this.config.maxBackoffMs
    );
    
    endpoint.backoffUntil = now + backoffMs;
    
    console.log(`🚫 Rate limit hit for ${endpointName}. Backing off for ${backoffMs}ms`);
  }

  // Get cached response if available and not expired
  getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // Store response in cache
  setCached(key: string, data: any, ttlMs: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  // Get time until next allowed request
  getBackoffTime(endpointName: string): number {
    const endpoint = this.getEndpoint(endpointName);
    const now = Date.now();
    return Math.max(0, endpoint.backoffUntil - now);
  }

  // Get endpoint stats
  getStats(endpointName: string): {
    requestsInWindow: number;
    consecutiveFailures: number;
    backoffTime: number;
    canRequest: boolean;
  } {
    const endpoint = this.getEndpoint(endpointName);
    const now = Date.now();
    
    // Clean old requests
    endpoint.requests = endpoint.requests.filter(
      time => now - time < this.config.windowMs
    );
    
    return {
      requestsInWindow: endpoint.requests.length,
      consecutiveFailures: endpoint.consecutiveFailures,
      backoffTime: this.getBackoffTime(endpointName),
      canRequest: this.canMakeRequest(endpointName)
    };
  }

  // Clear cache for specific keys or all
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  private getEndpoint(name: string): APIEndpoint {
    if (!this.endpoints.has(name)) {
      this.endpoints.set(name, {
        name,
        requests: [],
        lastRequest: 0,
        backoffUntil: 0,
        consecutiveFailures: 0
      });
    }
    return this.endpoints.get(name)!;
  }
}

// Global smart rate limiter instance
export const smartRateLimiter = new SmartRateLimiter({
  maxRequests: 8, // Conservative limit
  windowMs: 60000, // 1 minute window
  backoffMultiplier: 2,
  maxBackoffMs: 600000, // 10 minutes max backoff
  minBackoffMs: 2000 // 2 second min backoff
});