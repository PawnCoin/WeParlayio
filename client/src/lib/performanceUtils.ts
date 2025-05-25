// WeParlay Performance Utilities
// Final optimizations to reach 100% platform completion

// Cache management for API responses
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  // Clear expired items
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const cacheManager = new CacheManager();

// Optimized API request function with caching
export async function optimizedFetch(url: string, options?: RequestInit) {
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  
  // Check cache first
  const cachedData = cacheManager.get(cacheKey);
  if (cachedData) {
    return { ...cachedData, fromCache: true };
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache successful responses
    cacheManager.set(cacheKey, data);
    
    return { ...data, fromCache: false };
  } catch (error) {
    console.error('Optimized fetch error:', error);
    throw error;
  }
}

// Image optimization utilities
export function getOptimizedImageUrl(url: string, width?: number, quality: number = 80) {
  if (!url) return '/placeholder-image.jpg';
  
  // For external images, return as-is
  if (url.startsWith('http')) return url;
  
  // For local images, add optimization parameters
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  params.append('q', quality.toString());
  
  return `${url}?${params.toString()}`;
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: { [key: string]: number[] } = {};

  startTimer(name: string) {
    return {
      end: () => {
        const duration = performance.now();
        this.recordMetric(name, duration);
      }
    };
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics[name]) {
      this.metrics[name] = [];
    }
    this.metrics[name].push(value);
    
    // Keep only last 100 measurements
    if (this.metrics[name].length > 100) {
      this.metrics[name] = this.metrics[name].slice(-100);
    }
  }

  getAverageMetric(name: string) {
    const values = this.metrics[name] || [];
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getAllMetrics() {
    const result: { [key: string]: { average: number; count: number } } = {};
    for (const [name, values] of Object.entries(this.metrics)) {
      result[name] = {
        average: this.getAverageMetric(name),
        count: values.length
      };
    }
    return result;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Batch API requests to reduce server load
export class BatchRequestManager {
  private batches: { [endpoint: string]: { requests: any[]; timeout: NodeJS.Timeout } } = {};
  private batchDelay = 100; // 100ms batching window

  addRequest(endpoint: string, request: any) {
    if (!this.batches[endpoint]) {
      this.batches[endpoint] = {
        requests: [],
        timeout: setTimeout(() => this.processBatch(endpoint), this.batchDelay)
      };
    }

    this.batches[endpoint].requests.push(request);
  }

  private async processBatch(endpoint: string) {
    const batch = this.batches[endpoint];
    if (!batch || batch.requests.length === 0) return;

    try {
      // Process all requests in the batch
      const batchData = {
        requests: batch.requests,
        timestamp: Date.now()
      };

      const response = await fetch(`/api/batch/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchData)
      });

      const results = await response.json();
      
      // Distribute results back to individual requests
      batch.requests.forEach((request, index) => {
        if (request.callback) {
          request.callback(results[index]);
        }
      });
    } catch (error) {
      console.error('Batch request error:', error);
      // Handle individual request failures
      batch.requests.forEach(request => {
        if (request.errorCallback) {
          request.errorCallback(error);
        }
      });
    } finally {
      delete this.batches[endpoint];
    }
  }
}

export const batchRequestManager = new BatchRequestManager();

// Memory usage optimization
export function optimizeMemoryUsage() {
  // Clean up cache periodically
  setInterval(() => {
    cacheManager.cleanup();
  }, 2 * 60 * 1000); // Every 2 minutes

  // Monitor memory usage
  if ('memory' in performance) {
    setInterval(() => {
      const memInfo = (performance as any).memory;
      if (memInfo.usedJSHeapSize > memInfo.jsHeapSizeLimit * 0.9) {
        console.warn('⚠️ High memory usage detected, clearing caches');
        cacheManager.clear();
      }
    }, 30 * 1000); // Every 30 seconds
  }
}

// Initialize performance optimizations
export function initializePerformanceOptimizations() {
  console.log('🚀 WeParlay Performance Optimizations Initialized');
  
  // Start memory optimization
  optimizeMemoryUsage();
  
  // Log performance metrics periodically
  setInterval(() => {
    const metrics = performanceMonitor.getAllMetrics();
    if (Object.keys(metrics).length > 0) {
      console.log('📊 WeParlay Performance Metrics:', metrics);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

// Utility to measure component render time
export function withPerformanceTracking<T extends {}>(
  Component: React.ComponentType<T>,
  name: string
) {
  return function PerformanceTrackedComponent(props: T) {
    const timer = performanceMonitor.startTimer(`render_${name}`);
    
    React.useEffect(() => {
      timer.end();
    });

    return React.createElement(Component, props);
  };
}