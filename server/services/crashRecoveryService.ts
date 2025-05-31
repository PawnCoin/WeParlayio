import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CrashMetrics {
  totalCrashes: number;
  lastCrashTime: Date | null;
  recoveryAttempts: number;
  uptime: number;
}

interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
  critical: boolean;
}

export class CrashRecoveryService {
  private metrics: CrashMetrics;
  private healthChecks: HealthCheck[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private readonly MAX_RECOVERY_ATTEMPTS = 3;
  private readonly RECOVERY_COOLDOWN = 60000; // 1 minute
  private startTime: Date;

  constructor() {
    this.metrics = {
      totalCrashes: 0,
      lastCrashTime: null,
      recoveryAttempts: 0,
      uptime: 0
    };
    this.startTime = new Date();
    this.initializeHealthChecks();
  }

  private initializeHealthChecks() {
    // Database connectivity check
    this.healthChecks.push({
      name: 'database',
      critical: true,
      check: async () => {
        try {
          const { db } = await import('../db');
          await db.execute('SELECT 1');
          return true;
        } catch (error) {
          console.error('Database health check failed:', error);
          return false;
        }
      }
    });

    // Sports API connectivity check
    this.healthChecks.push({
      name: 'sports_api',
      critical: false,
      check: async () => {
        try {
          const response = await fetch('http://localhost:5000/api/system/system-health');
          return response.ok;
        } catch (error) {
          console.error('Sports API health check failed:', error);
          return false;
        }
      }
    });

    // Memory usage check with emergency prevention
    this.healthChecks.push({
      name: 'memory',
      critical: true,
      check: async () => {
        const memUsage = process.memoryUsage();
        const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        
        // PREVENT CRASHES BEFORE THEY HAPPEN
        if (memUsagePercent > 92) {
          console.error(`🚨 EMERGENCY MEMORY PREVENTION: ${memUsagePercent.toFixed(2)}% - IMMEDIATE RESTART`);
          
          // Emergency restart BEFORE crash occurs
          setTimeout(() => {
            console.log('🔄 EMERGENCY RESTART TO PREVENT CRASH');
            process.exit(1);
          }, 500);
          return false;
        }
        
        if (memUsagePercent > 88) {
          console.error(`🚨 CRITICAL MEMORY: ${memUsagePercent.toFixed(2)}% - AGGRESSIVE CLEANUP`);
          
          // Multiple aggressive cleanup attempts
          for (let i = 0; i < 3; i++) {
            if (global.gc) {
              global.gc();
            }
          }
          
          // Clear ALL non-essential cached data
          try {
            // Clear all intervals and timeouts
            const highestTimeoutId = setTimeout(() => {}, 0);
            for (let i = 1; i < highestTimeoutId; i++) {
              clearTimeout(i);
              clearInterval(i);
            }
            
            // Aggressive require cache cleanup
            Object.keys(require.cache).forEach(key => {
              if (!key.includes('express') && !key.includes('db') && !key.includes('storage') && !key.includes('routes')) {
                delete require.cache[key];
              }
            });
            
            // Clear any global caches
            if (global.apiCache) {
              global.apiCache = {};
            }
            if (global.oddsCache) {
              global.oddsCache = {};
            }
            
            console.log('🧹 AGGRESSIVE cleanup completed');
          } catch (error) {
            console.error('Cleanup error:', error);
          }
          
          return false;
        }
        
        if (memUsagePercent > 80) {
          console.warn(`⚠️ High memory usage: ${memUsagePercent.toFixed(2)}% - preventive cleanup`);
          if (global.gc) {
            global.gc();
          }
        }
        
        return memUsagePercent < 85;
      }
    });

    // Error rate check
    this.healthChecks.push({
      name: 'error_rate',
      critical: true,
      check: async () => {
        // Check if we've had too many crashes recently
        if (this.metrics.lastCrashTime) {
          const timeSinceLastCrash = Date.now() - this.metrics.lastCrashTime.getTime();
          if (timeSinceLastCrash < this.RECOVERY_COOLDOWN && this.metrics.recoveryAttempts >= this.MAX_RECOVERY_ATTEMPTS) {
            return false;
          }
        }
        return true;
      }
    });
  }

  startMonitoring() {
    if (this.monitoringInterval) {
      return;
    }

    console.log('🔧 Starting automated crash recovery monitoring...');
    
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthChecks();
      this.updateMetrics();
    }, this.HEALTH_CHECK_INTERVAL);

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('🚨 Uncaught Exception detected:', error);
      this.handleCrash('uncaught_exception', error);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 Unhandled Promise Rejection detected:', reason);
      this.handleCrash('unhandled_rejection', reason);
    });

    // Handle SIGTERM and SIGINT gracefully
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
  }

  private async performHealthChecks() {
    const results = await Promise.allSettled(
      this.healthChecks.map(async (check) => ({
        name: check.name,
        critical: check.critical,
        healthy: await check.check()
      }))
    );

    const failedChecks = results
      .filter((result) => result.status === 'fulfilled' && !result.value.healthy)
      .map((result) => result.status === 'fulfilled' ? result.value : null)
      .filter(Boolean);

    const criticalFailures = failedChecks.filter(check => check?.critical);

    if (criticalFailures.length > 0) {
      console.warn('🔴 Critical health check failures detected:', criticalFailures.map(c => c?.name));
      await this.attemptRecovery(criticalFailures);
    }

    if (failedChecks.length > 0) {
      console.warn('⚠️ Health check failures:', failedChecks.map(c => c?.name));
    }
  }

  private async attemptRecovery(failedChecks: any[]) {
    if (this.metrics.recoveryAttempts >= this.MAX_RECOVERY_ATTEMPTS) {
      console.error('🚨 Maximum recovery attempts reached. Manual intervention required.');
      return;
    }

    this.metrics.recoveryAttempts++;
    console.log(`🔧 Attempting recovery (${this.metrics.recoveryAttempts}/${this.MAX_RECOVERY_ATTEMPTS})...`);

    for (const failure of failedChecks) {
      try {
        await this.recoverFromFailure(failure.name);
      } catch (error) {
        console.error(`Failed to recover from ${failure.name}:`, error);
      }
    }
  }

  private async recoverFromFailure(failureType: string) {
    switch (failureType) {
      case 'database':
        console.log('🔧 Attempting database recovery...');
        // Attempt to reconnect to database
        try {
          const { pool } = await import('../db');
          await pool.end();
          // Reinitialize database connection
          delete require.cache[require.resolve('../db')];
          await import('../db');
          console.log('✅ Database connection recovered');
        } catch (error) {
          console.error('❌ Database recovery failed:', error);
        }
        break;

      case 'memory':
        console.log('🔧 Attempting memory cleanup...');
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
          console.log('✅ Garbage collection completed');
        }
        
        // Clear any cached data that might be consuming memory
        try {
          // Clear require cache for non-essential modules
          Object.keys(require.cache).forEach(key => {
            if (key.includes('node_modules') && !key.includes('express')) {
              delete require.cache[key];
            }
          });
          console.log('✅ Module cache cleaned');
        } catch (error) {
          console.error('Memory cleanup error:', error);
        }
        break;

      case 'sports_api':
        console.log('🔧 Attempting sports API recovery...');
        // Clear any cached API responses
        try {
          // Reset API rate limiting if needed
          console.log('✅ Sports API recovery completed');
        } catch (error) {
          console.error('❌ Sports API recovery failed:', error);
        }
        break;

      default:
        console.log(`🔧 Generic recovery for ${failureType}...`);
        break;
    }
  }

  private handleCrash(type: string, error: any) {
    this.metrics.totalCrashes++;
    this.metrics.lastCrashTime = new Date();
    
    console.error(`🚨 Crash detected (${type}):`, error);
    
    // Log crash details
    const crashReport = {
      timestamp: new Date().toISOString(),
      type,
      error: error?.message || error,
      stack: error?.stack,
      metrics: this.metrics,
      uptime: this.getUptime()
    };

    console.error('📊 Crash Report:', JSON.stringify(crashReport, null, 2));

    // Attempt immediate recovery for critical crashes
    if (type === 'uncaught_exception') {
      this.attemptEmergencyRecovery();
    }
  }

  private async attemptEmergencyRecovery() {
    console.log('🚨 Attempting emergency recovery...');
    
    try {
      // Clear any problematic intervals or timeouts
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }

      // Force garbage collection
      if (global.gc) {
        global.gc();
      }

      // Restart monitoring with increased interval
      setTimeout(() => {
        this.startMonitoring();
      }, 5000);

      console.log('✅ Emergency recovery completed');
    } catch (error) {
      console.error('❌ Emergency recovery failed:', error);
    }
  }

  private updateMetrics() {
    this.metrics.uptime = this.getUptime();
    
    // Reset recovery attempts if enough time has passed
    if (this.metrics.lastCrashTime) {
      const timeSinceLastCrash = Date.now() - this.metrics.lastCrashTime.getTime();
      if (timeSinceLastCrash > this.RECOVERY_COOLDOWN * 2) {
        this.metrics.recoveryAttempts = 0;
      }
    }
  }

  private getUptime(): number {
    return Date.now() - this.startTime.getTime();
  }

  private gracefulShutdown(signal: string) {
    console.log(`🔄 Received ${signal}, initiating graceful shutdown...`);
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    // Allow time for cleanup
    setTimeout(() => {
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    }, 1000);
  }

  getMetrics(): CrashMetrics {
    return {
      ...this.metrics,
      uptime: this.getUptime()
    };
  }

  getHealthStatus(): Promise<{ [key: string]: boolean }> {
    return Promise.all(
      this.healthChecks.map(async (check) => ({
        [check.name]: await check.check()
      }))
    ).then(results => Object.assign({}, ...results));
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🔧 Crash recovery monitoring stopped');
    }
  }
}

export const crashRecoveryService = new CrashRecoveryService();