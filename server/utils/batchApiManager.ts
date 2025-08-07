import { smartRateLimiter } from './smartRateLimiter';

interface BatchRequest {
  endpoint: string;
  params: any;
  priority: number;
}

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  fromCache?: boolean;
}

export class BatchAPIManager {
  private requestQueue: BatchRequest[] = [];
  private processing = false;
  
  // Add request to batch queue
  queueRequest(endpoint: string, params: any, priority: number = 1): void {
    this.requestQueue.push({ endpoint, params, priority });
    // Sort by priority (higher numbers = higher priority)
    this.requestQueue.sort((a, b) => b.priority - a.priority);
  }

  // Process queued requests in optimal batches
  async processBatch(): Promise<Map<string, APIResponse>> {
    if (this.processing || this.requestQueue.length === 0) {
      return new Map();
    }

    this.processing = true;
    const results = new Map<string, APIResponse>();
    const processedRequests: BatchRequest[] = [];

    try {
      // Group requests by API endpoint to optimize calls
      const groupedRequests = this.groupRequestsByEndpoint();
      
      for (const [endpointName, requests] of groupedRequests) {
        // Check rate limits before processing
        if (!smartRateLimiter.canMakeRequest(endpointName)) {
          const backoffTime = smartRateLimiter.getBackoffTime(endpointName);
          console.log(`⏳ Skipping ${endpointName} - backing off for ${backoffTime}ms`);
          continue;
        }

        // Process requests for this endpoint
        const batchResult = await this.processSingleEndpoint(endpointName, requests);
        
        // Store results
        for (const [key, response] of batchResult) {
          results.set(key, response);
        }
        
        processedRequests.push(...requests);
        
        // Add small delay between different endpoints
        await this.sleep(100);
      }

      // Remove processed requests from queue
      this.requestQueue = this.requestQueue.filter(
        req => !processedRequests.includes(req)
      );

    } finally {
      this.processing = false;
    }

    return results;
  }

  // Process requests for a single endpoint efficiently
  private async processSingleEndpoint(
    endpointName: string, 
    requests: BatchRequest[]
  ): Promise<Map<string, APIResponse>> {
    const results = new Map<string, APIResponse>();

    // Check cache first for all requests
    for (const request of requests) {
      const cacheKey = this.getCacheKey(endpointName, request.params);
      const cached = smartRateLimiter.getCached(cacheKey);
      
      if (cached) {
        results.set(this.getRequestKey(request), {
          success: true,
          data: cached,
          fromCache: true
        });
        continue;
      }

      // For non-cached requests, make optimized API calls
      try {
        const response = await this.makeOptimizedRequest(endpointName, request.params);
        
        if (response.success) {
          smartRateLimiter.recordSuccess(endpointName);
          // Cache successful responses
          smartRateLimiter.setCached(cacheKey, response.data, 300000); // 5 min cache
          
          results.set(this.getRequestKey(request), response);
        } else {
          if (response.error?.includes('429')) {
            smartRateLimiter.recordRateLimit(endpointName);
          }
          results.set(this.getRequestKey(request), response);
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${endpointName}:`, error);
        results.set(this.getRequestKey(request), {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Rate limit between requests to same endpoint
      await this.sleep(200);
    }

    return results;
  }

  // Make optimized API request with minimal payload
  private async makeOptimizedRequest(endpoint: string, params: any): Promise<APIResponse> {
    // This will be implemented by specific API services
    // For now, return a placeholder that integrates with existing services
    return {
      success: false,
      error: 'Not implemented - should be overridden by API service'
    };
  }

  // Group requests by endpoint for efficient processing
  private groupRequestsByEndpoint(): Map<string, BatchRequest[]> {
    const grouped = new Map<string, BatchRequest[]>();
    
    for (const request of this.requestQueue) {
      if (!grouped.has(request.endpoint)) {
        grouped.set(request.endpoint, []);
      }
      grouped.get(request.endpoint)!.push(request);
    }
    
    return grouped;
  }

  // Generate cache key for request
  private getCacheKey(endpoint: string, params: any): string {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  // Generate unique key for request
  private getRequestKey(request: BatchRequest): string {
    return `${request.endpoint}_${JSON.stringify(request.params)}_${request.priority}`;
  }

  // Utility sleep function
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get queue status
  getQueueStatus(): {
    queueLength: number;
    processing: boolean;
    endpointStats: Map<string, any>;
  } {
    const endpointStats = new Map();
    
    // Get stats for active endpoints
    const endpoints = [...new Set(this.requestQueue.map(r => r.endpoint))];
    for (const endpoint of endpoints) {
      endpointStats.set(endpoint, smartRateLimiter.getStats(endpoint));
    }
    
    return {
      queueLength: this.requestQueue.length,
      processing: this.processing,
      endpointStats
    };
  }

  // Clear queue and cache
  reset(): void {
    this.requestQueue = [];
    this.processing = false;
    smartRateLimiter.clearCache();
  }
}

// Global batch manager instance
export const batchAPIManager = new BatchAPIManager();