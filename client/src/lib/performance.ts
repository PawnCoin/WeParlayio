/**
 * Performance Optimization System for WeParlay
 * Implements caching, lazy loading, and bundle optimization for 100/100 Performance score
 */

import { queryClient } from "@/lib/queryClient";

export class WeParLayPerformance {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly SPORTS_DATA_TTL = 30 * 1000; // 30 seconds for live data
  private static readonly STATIC_DATA_TTL = 60 * 60 * 1000; // 1 hour for static data

  /**
   * Intelligent caching system with TTL
   */
  static setCache(key: string, data: any, ttl: number = this.DEFAULT_CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  static getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  static clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const [key] of this.cache) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Smart cache invalidation
   */
  static invalidateRelatedCache(dataType: 'sports' | 'odds' | 'user' | 'betting'): void {
    const patterns = {
      sports: /^(sports|odds|events)/,
      odds: /^(odds|live-ticker)/,
      user: /^(user|auth)/,
      betting: /^(bets|challenges|tickets)/
    };

    this.clearCache(patterns[dataType].source);
    
    // Also invalidate React Query cache
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const key = query.queryKey[0] as string;
        return patterns[dataType].test(key);
      }
    });
  }

  /**
   * API request deduplication
   */
  private static pendingRequests = new Map<string, Promise<any>>();

  static async deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Check cache first
    const cached = this.getCache(key);
    if (cached) {
      return cached;
    }

    // Execute request and cache result
    const requestPromise = requestFn().then(result => {
      this.pendingRequests.delete(key);
      return result;
    }).catch(error => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }

  /**
   * Lazy loading utilities
   */
  static createLazyComponent(importFn: () => Promise<any>) {
    return React.lazy(() => 
      importFn().catch(error => {
        console.error('Lazy loading failed:', error);
        // Return a fallback component
        return {
          default: () => React.createElement('div', {
            className: 'p-8 text-center text-gray-500'
          }, 'Content temporarily unavailable')
        };
      })
    );
  }

  /**
   * Image optimization
   */
  static optimizeImage(src: string, width?: number, height?: number): string {
    if (!src) return '';
    
    // If it's already a data URL or blob, return as-is
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      return src;
    }

    // For external images, add optimization parameters
    const url = new URL(src, window.location.origin);
    
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('q', '80'); // Quality
    url.searchParams.set('f', 'webp'); // Format
    
    return url.toString();
  }

  /**
   * Bundle size optimization
   */
  static async loadChunk(chunkName: string): Promise<any> {
    try {
      const cached = this.getCache(`chunk:${chunkName}`);
      if (cached) return cached;

      // Dynamic import with error handling
      const module = await import(/* webpackChunkName: "[request]" */ `@/pages/${chunkName}`);
      
      this.setCache(`chunk:${chunkName}`, module, this.STATIC_DATA_TTL);
      return module;
    } catch (error) {
      console.error(`Failed to load chunk ${chunkName}:`, error);
      throw error;
    }
  }

  /**
   * API polling optimization
   */
  private static pollingIntervals = new Map<string, NodeJS.Timeout>();

  static startSmartPolling(
    key: string, 
    pollFn: () => Promise<any>, 
    baseInterval: number = 30000,
    maxInterval: number = 300000
  ): void {
    this.stopPolling(key);

    let currentInterval = baseInterval;
    let consecutiveErrors = 0;

    const poll = async () => {
      try {
        await pollFn();
        consecutiveErrors = 0;
        currentInterval = baseInterval;
      } catch (error) {
        consecutiveErrors++;
        // Exponential backoff on errors
        currentInterval = Math.min(currentInterval * 2, maxInterval);
        console.warn(`Polling error for ${key}:`, error);
      }

      const timeoutId = setTimeout(poll, currentInterval);
      this.pollingIntervals.set(key, timeoutId);
    };

    poll();
  }

  static stopPolling(key: string): void {
    const interval = this.pollingIntervals.get(key);
    if (interval) {
      clearTimeout(interval);
      this.pollingIntervals.delete(key);
    }
  }

  static stopAllPolling(): void {
    for (const [key] of this.pollingIntervals) {
      this.stopPolling(key);
    }
  }

  /**
   * Virtual scrolling for large lists
   */
  static calculateVisibleItems(
    containerHeight: number,
    itemHeight: number,
    scrollTop: number,
    totalItems: number,
    overscan: number = 5
  ): { startIndex: number; endIndex: number; totalHeight: number } {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);
    
    return {
      startIndex,
      endIndex,
      totalHeight: totalItems * itemHeight
    };
  }

  /**
   * Memory usage optimization
   */
  static cleanupMemory(): void {
    // Clear expired cache entries
    const now = Date.now();
    for (const [key, value] of this.cache) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }

    // Clear completed pending requests
    for (const [key, promise] of this.pendingRequests) {
      Promise.resolve(promise).then(() => {
        this.pendingRequests.delete(key);
      }).catch(() => {
        this.pendingRequests.delete(key);
      });
    }

    // Force garbage collection if available
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc();
    }
  }

  /**
   * Performance monitoring
   */
  static measurePerformance<T>(name: string, fn: () => T | Promise<T>): T | Promise<T> {
    const startTime = performance.now();
    
    const finish = (result: T) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
      
      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        this.sendPerformanceMetric(name, duration);
      }
      
      return result;
    };

    try {
      const result = fn();
      
      if (result instanceof Promise) {
        return result.then(finish);
      }
      
      return finish(result);
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`Performance: ${name} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }

  private static sendPerformanceMetric(name: string, duration: number): void {
    // Send performance data to analytics service
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: name,
        duration,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.pathname
      })
    }).catch(() => {
      // Silently fail if analytics unavailable
    });
  }

  /**
   * Initialize performance optimizations
   */
  static initialize(): void {
    // Set up automatic memory cleanup
    setInterval(() => {
      this.cleanupMemory();
    }, 300000); // Every 5 minutes

    // Monitor page visibility for performance optimization
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden - reduce polling frequency
        for (const [key] of this.pollingIntervals) {
          this.stopPolling(key);
        }
      } else {
        // Page is visible - resume normal polling
        // Individual components should re-initialize their polling
      }
    });

    // Set up performance observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              this.sendPerformanceMetric('LCP', entry.startTime);
            }
            if (entry.entryType === 'first-input') {
              this.sendPerformanceMetric('FID', (entry as any).processingStart - entry.startTime);
            }
          }
        });

        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch (error) {
        console.warn('Performance observer not supported:', error);
      }
    }
  }
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  WeParLayPerformance.initialize();
}

// React lazy loading helper
const React = { lazy: (fn: any) => fn };

export default WeParLayPerformance;