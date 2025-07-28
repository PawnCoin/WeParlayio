/**
 * Performance Monitoring Service for WeParlay
 * Tracks API performance, database queries, and user experience metrics
 */

import { logger } from './enhancedLoggingService';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: number;
  context?: Record<string, any>;
}

export interface APIPerformanceData {
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: number;
  userId?: string;
  cached?: boolean;
}

export interface DatabasePerformanceData {
  query: string;
  duration: number;
  rowCount?: number;
  timestamp: number;
  context?: Record<string, any>;
}

class PerformanceMonitoringService {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private apiMetrics: APIPerformanceData[] = [];
  private dbMetrics: DatabasePerformanceData[] = [];
  private readonly MAX_STORED_METRICS = 10000;
  private readonly SLOW_API_THRESHOLD = 1000; // 1 second
  private readonly SLOW_DB_THRESHOLD = 500; // 500ms

  constructor() {
    // Clean up old metrics every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 60 * 60 * 1000);

    // Report performance summary every 5 minutes in production
    if (process.env.NODE_ENV === 'production') {
      setInterval(() => {
        this.reportPerformanceSummary();
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Record custom performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    const key = metric.name;
    const existing = this.metrics.get(key) || [];
    
    existing.push(metric);
    
    // Keep only recent metrics to prevent memory bloat
    if (existing.length > this.MAX_STORED_METRICS) {
      existing.splice(0, existing.length - this.MAX_STORED_METRICS);
    }
    
    this.metrics.set(key, existing);
  }

  /**
   * Record API performance data
   */
  recordAPIPerformance(data: APIPerformanceData): void {
    this.apiMetrics.push(data);
    
    // Log slow APIs
    if (data.duration > this.SLOW_API_THRESHOLD) {
      logger.warn('Slow API detected', {
        endpoint: data.endpoint,
        method: data.method,
        duration: data.duration,
        statusCode: data.statusCode,
        userId: data.userId,
      });
    }

    // Keep only recent metrics
    if (this.apiMetrics.length > this.MAX_STORED_METRICS) {
      this.apiMetrics.splice(0, this.apiMetrics.length - this.MAX_STORED_METRICS);
    }

    // Record as custom metric for aggregation
    this.recordMetric({
      name: `api_${data.endpoint.replace(/[^a-zA-Z0-9]/g, '_')}_duration`,
      value: data.duration,
      unit: 'ms',
      timestamp: data.timestamp,
      context: {
        method: data.method,
        statusCode: data.statusCode,
        cached: data.cached,
      },
    });
  }

  /**
   * Record database performance data
   */
  recordDatabasePerformance(data: DatabasePerformanceData): void {
    this.dbMetrics.push(data);
    
    // Log slow queries
    if (data.duration > this.SLOW_DB_THRESHOLD) {
      logger.logSlowQuery(data.query, data.duration, data.context);
    }

    // Keep only recent metrics
    if (this.dbMetrics.length > this.MAX_STORED_METRICS) {
      this.dbMetrics.splice(0, this.dbMetrics.length - this.MAX_STORED_METRICS);
    }

    // Record as custom metric
    this.recordMetric({
      name: 'database_query_duration',
      value: data.duration,
      unit: 'ms',
      timestamp: data.timestamp,
      context: {
        queryType: this.extractQueryType(data.query),
        rowCount: data.rowCount,
      },
    });
  }

  /**
   * Get performance statistics for a metric
   */
  getMetricStats(metricName: string, timeWindowMs: number = 60 * 60 * 1000): {
    count: number;
    average: number;
    median: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
  } | null {
    const metrics = this.metrics.get(metricName);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const cutoff = Date.now() - timeWindowMs;
    const recentMetrics = metrics
      .filter(m => m.timestamp > cutoff)
      .map(m => m.value)
      .sort((a, b) => a - b);

    if (recentMetrics.length === 0) {
      return null;
    }

    const count = recentMetrics.length;
    const sum = recentMetrics.reduce((a, b) => a + b, 0);
    const average = sum / count;
    const median = this.calculatePercentile(recentMetrics, 50);
    const p95 = this.calculatePercentile(recentMetrics, 95);
    const p99 = this.calculatePercentile(recentMetrics, 99);
    const min = recentMetrics[0];
    const max = recentMetrics[recentMetrics.length - 1];

    return { count, average, median, p95, p99, min, max };
  }

  /**
   * Get API performance summary
   */
  getAPIPerformanceSummary(timeWindowMs: number = 60 * 60 * 1000): {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    slowestEndpoints: Array<{ endpoint: string; averageTime: number }>;
  } {
    const cutoff = Date.now() - timeWindowMs;
    const recentAPIs = this.apiMetrics.filter(m => m.timestamp > cutoff);

    if (recentAPIs.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        slowestEndpoints: [],
      };
    }

    const totalRequests = recentAPIs.length;
    const totalTime = recentAPIs.reduce((sum, api) => sum + api.duration, 0);
    const averageResponseTime = totalTime / totalRequests;
    const errorCount = recentAPIs.filter(api => api.statusCode >= 400).length;
    const errorRate = (errorCount / totalRequests) * 100;

    // Group by endpoint and calculate average times
    const endpointTimes = new Map<string, number[]>();
    recentAPIs.forEach(api => {
      const key = `${api.method} ${api.endpoint}`;
      const times = endpointTimes.get(key) || [];
      times.push(api.duration);
      endpointTimes.set(key, times);
    });

    const slowestEndpoints = Array.from(endpointTimes.entries())
      .map(([endpoint, times]) => ({
        endpoint,
        averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10);

    return {
      totalRequests,
      averageResponseTime,
      errorRate,
      slowestEndpoints,
    };
  }

  /**
   * Get database performance summary
   */
  getDatabasePerformanceSummary(timeWindowMs: number = 60 * 60 * 1000): {
    totalQueries: number;
    averageQueryTime: number;
    slowQueries: number;
    queryTypeBreakdown: Record<string, number>;
  } {
    const cutoff = Date.now() - timeWindowMs;
    const recentQueries = this.dbMetrics.filter(m => m.timestamp > cutoff);

    if (recentQueries.length === 0) {
      return {
        totalQueries: 0,
        averageQueryTime: 0,
        slowQueries: 0,
        queryTypeBreakdown: {},
      };
    }

    const totalQueries = recentQueries.length;
    const totalTime = recentQueries.reduce((sum, query) => sum + query.duration, 0);
    const averageQueryTime = totalTime / totalQueries;
    const slowQueries = recentQueries.filter(q => q.duration > this.SLOW_DB_THRESHOLD).length;

    const queryTypeBreakdown: Record<string, number> = {};
    recentQueries.forEach(query => {
      const type = this.extractQueryType(query.query);
      queryTypeBreakdown[type] = (queryTypeBreakdown[type] || 0) + 1;
    });

    return {
      totalQueries,
      averageQueryTime,
      slowQueries,
      queryTypeBreakdown,
    };
  }

  /**
   * Memory usage monitoring
   */
  recordMemoryUsage(): void {
    const usage = process.memoryUsage();
    const timestamp = Date.now();

    Object.entries(usage).forEach(([key, value]) => {
      this.recordMetric({
        name: `memory_${key}`,
        value: value,
        unit: 'bytes',
        timestamp,
      });
    });
  }

  /**
   * CPU usage monitoring (simplified)
   */
  recordCPUUsage(): void {
    const usage = process.cpuUsage();
    const timestamp = Date.now();

    this.recordMetric({
      name: 'cpu_user_time',
      value: usage.user / 1000, // Convert to milliseconds
      unit: 'ms',
      timestamp,
    });

    this.recordMetric({
      name: 'cpu_system_time',
      value: usage.system / 1000,
      unit: 'ms',
      timestamp,
    });
  }

  /**
   * Monitor event loop lag
   */
  recordEventLoopLag(): void {
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to milliseconds
      this.recordMetric({
        name: 'event_loop_lag',
        value: lag,
        unit: 'ms',
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Performance middleware for Express
   */
  createPerformanceMiddleware() {
    return (req: any, res: any, next: any) => {
      const startTime = process.hrtime.bigint();
      
      res.on('finish', () => {
        const duration = Number(process.hrtime.bigint() - startTime) / 1000000; // Convert to milliseconds
        
        this.recordAPIPerformance({
          endpoint: req.route?.path || req.path,
          method: req.method,
          statusCode: res.statusCode,
          duration,
          timestamp: Date.now(),
          userId: req.user?.id,
          cached: res.getHeader('X-Cache-Status') === 'HIT',
        });
      });

      next();
    };
  }

  /**
   * Database query timing wrapper
   */
  wrapDatabaseQuery<T>(
    queryFunction: () => Promise<T>,
    queryString: string,
    context?: Record<string, any>
  ): Promise<T> {
    const startTime = process.hrtime.bigint();
    
    return queryFunction().then(
      (result) => {
        const duration = Number(process.hrtime.bigint() - startTime) / 1000000;
        
        this.recordDatabasePerformance({
          query: queryString,
          duration,
          timestamp: Date.now(),
          context,
          rowCount: Array.isArray(result) ? result.length : undefined,
        });
        
        return result;
      },
      (error) => {
        const duration = Number(process.hrtime.bigint() - startTime) / 1000000;
        
        this.recordDatabasePerformance({
          query: queryString,
          duration,
          timestamp: Date.now(),
          context: { ...context, error: error.message },
        });
        
        throw error;
      }
    );
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): {
    timestamp: string;
    api: ReturnType<typeof this.getAPIPerformanceSummary>;
    database: ReturnType<typeof this.getDatabasePerformanceSummary>;
    system: {
      memoryUsage: any;
      eventLoopLag: any;
      cpuUsage: any;
    };
  } {
    return {
      timestamp: new Date().toISOString(),
      api: this.getAPIPerformanceSummary(),
      database: this.getDatabasePerformanceSummary(),
      system: {
        memoryUsage: this.getMetricStats('memory_rss'),
        eventLoopLag: this.getMetricStats('event_loop_lag'),
        cpuUsage: this.getMetricStats('cpu_user_time'),
      },
    };
  }

  /**
   * Clean up old metrics to prevent memory leaks
   */
  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    this.metrics.forEach((metrics, key) => {
      const filtered = metrics.filter(m => m.timestamp > cutoff);
      this.metrics.set(key, filtered);
    });

    this.apiMetrics = this.apiMetrics.filter(m => m.timestamp > cutoff);
    this.dbMetrics = this.dbMetrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Report performance summary to logs
   */
  private reportPerformanceSummary(): void {
    const report = this.generatePerformanceReport();
    logger.info('Performance Summary', report);
  }

  /**
   * Calculate percentile from sorted array
   */
  private calculatePercentile(sortedArray: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sortedArray[lower];
    }
    
    const weight = index - lower;
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  /**
   * Extract query type from SQL string
   */
  private extractQueryType(query: string): string {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.startsWith('select')) return 'SELECT';
    if (trimmed.startsWith('insert')) return 'INSERT';
    if (trimmed.startsWith('update')) return 'UPDATE';
    if (trimmed.startsWith('delete')) return 'DELETE';
    if (trimmed.startsWith('with')) return 'WITH';
    return 'OTHER';
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitoringService();
export default performanceMonitor;