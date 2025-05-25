/**
 * Smart Rate Limiter for API calls
 * Prevents 429 errors and optimizes request frequency
 */

interface RateLimitInfo {
  lastRequest: number;
  requestCount: number;
  resetTime: number;
}

class SmartRateLimiter {
  private limits: Map<string, RateLimitInfo> = new Map();
  private defaultDelay = 1000; // 1 second between requests by default

  /**
   * Check if we can make a request to the given API
   */
  canMakeRequest(apiKey: string, maxRequestsPerMinute: number = 500): boolean {
    const now = Date.now();
    const limit = this.limits.get(apiKey);

    if (!limit) {
      // First request for this API
      this.limits.set(apiKey, {
        lastRequest: now,
        requestCount: 1,
        resetTime: now + 60000 // Reset after 1 minute
      });
      return true;
    }

    // Reset counter if minute has passed
    if (now > limit.resetTime) {
      limit.requestCount = 0;
      limit.resetTime = now + 60000;
    }

    // Check if we're within rate limit
    if (limit.requestCount >= maxRequestsPerMinute) {
      return false;
    }

    // Check minimum delay between requests
    const timeSinceLastRequest = now - limit.lastRequest;
    if (timeSinceLastRequest < this.defaultDelay) {
      return false;
    }

    return true;
  }

  /**
   * Record a successful request
   */
  recordRequest(apiKey: string): void {
    const now = Date.now();
    const limit = this.limits.get(apiKey);

    if (limit) {
      limit.lastRequest = now;
      limit.requestCount++;
    } else {
      this.limits.set(apiKey, {
        lastRequest: now,
        requestCount: 1,
        resetTime: now + 60000
      });
    }
  }

  /**
   * Get delay until next request is allowed
   */
  getDelayUntilNextRequest(apiKey: string): number {
    const limit = this.limits.get(apiKey);
    if (!limit) return 0;

    const now = Date.now();
    const timeSinceLastRequest = now - limit.lastRequest;
    
    if (timeSinceLastRequest < this.defaultDelay) {
      return this.defaultDelay - timeSinceLastRequest;
    }

    return 0;
  }

  /**
   * Wait for the appropriate delay before making next request
   */
  async waitForNextRequest(apiKey: string): Promise<void> {
    const delay = this.getDelayUntilNextRequest(apiKey);
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  /**
   * Get status of all API limits
   */
  getStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    const now = Date.now();

    for (const [apiKey, limit] of this.limits.entries()) {
      status[apiKey] = {
        requestCount: limit.requestCount,
        timeUntilReset: Math.max(0, limit.resetTime - now),
        canMakeRequest: this.canMakeRequest(apiKey),
        nextRequestDelay: this.getDelayUntilNextRequest(apiKey)
      };
    }

    return status;
  }
}

export const rateLimiter = new SmartRateLimiter();