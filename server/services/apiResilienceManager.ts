// WeParlay API Resilience Manager - Real APIs Only, No Fallbacks
import NodeCache from 'node-cache';
import { apiRateLimitManager } from './apiRateLimitManager';

interface APIEndpoint {
  name: string;
  url: string;
  isHealthy: boolean;
  lastSuccess: number;
  failures: number;
  timeout: number;
  priority: number;
}

class APIResilienceManager {
  private cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache for real data only
  private endpoints: Map<string, APIEndpoint> = new Map();

  constructor() {
    this.registerRealEndpoints();
    this.startHealthCheck();
  }

  private registerRealEndpoints() {
    let priority = 1;

    // Register The Odds API (Premium)
    if (process.env.THE_ODDS_API_KEY) {
      this.registerEndpoint(
        'the_odds_api',
        `https://api.the-odds-api.com/v4/sports/upcoming/odds/?apiKey=${process.env.THE_ODDS_API_KEY}&regions=us&markets=h2h`,
        priority++
      );
    }

    // Register GRID API (Premium)
    if (process.env.GRID_API_KEY) {
      this.registerEndpoint(
        'grid_api',
        'https://api.grid.is/sports/events',
        priority++
      );
    }

    // Register RapidAPI Sports (Premium)
    if (process.env.RAPIDAPI_KEY) {
      this.registerEndpoint(
        'rapid_api_sports',
        'https://odds-api1.p.rapidapi.com/odds',
        priority++
      );
    }

    // Register ESPN (Free but reliable)
    this.registerEndpoint(
      'espn_api',
      'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
      priority++
    );

    console.log(`🎯 Registered ${this.endpoints.size} real API endpoints, NO FALLBACK DATA`);
  }

  registerEndpoint(name: string, url: string, priority: number) {
    this.endpoints.set(name, {
      name,
      url,
      isHealthy: true,
      lastSuccess: Date.now(),
      failures: 0,
      timeout: 10000,
      priority
    });
  }

  async makeResilientCall(endpointName: string, options: any = {}): Promise<any> {
    const cacheKey = `api_${endpointName}_${JSON.stringify(options)}`;

    // Try cache first (real data only)
    if (this.cache.has(cacheKey)) {
      console.log(`✅ Real cached data for ${endpointName}`);
      return this.cache.get(cacheKey);
    }

    // Get available endpoints sorted by priority
    const availableEndpoints = Array.from(this.endpoints.values())
      .filter(endpoint => endpoint.isHealthy && endpoint.failures < 3)
      .sort((a, b) => a.priority - b.priority);

    if (availableEndpoints.length === 0) {
      throw new Error('No real API endpoints available - cannot provide synthetic data');
    }

    // Try each endpoint in priority order
    for (const endpoint of availableEndpoints) {
      try {
        console.log(`🌐 Calling real API: ${endpoint.name}`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), endpoint.timeout);

        const response = await fetch(endpoint.url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        // Success! Cache real data and return
        endpoint.failures = 0;
        endpoint.lastSuccess = Date.now();
        endpoint.isHealthy = true;

        this.cache.set(cacheKey, data);

        await apiRateLimitManager.recordRequest(endpointName);

        console.log(`✅ Real data retrieved and cached from ${endpoint.name}`);
        return data;

      } catch (error: any) {
        console.warn(`❌ ${endpoint.name} failed:`, error.message);
        endpoint.failures++;

        if (endpoint.failures >= 3) {
          endpoint.isHealthy = false;
        }

        continue; // Try next real API
      }
    }

    throw new Error('All real APIs exhausted - no synthetic data will be provided');
  }

  private startHealthCheck() {
    setInterval(async () => {
      let healthyEndpoints = 0;
      const totalEndpoints = this.endpoints.size;

      for (const [name, endpoint] of this.endpoints) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);

          await fetch(endpoint.url, {
            method: 'HEAD',
            signal: controller.signal
          });

          clearTimeout(timeout);
          endpoint.isHealthy = true;
          endpoint.failures = 0;
          healthyEndpoints++;
        } catch {
          endpoint.isHealthy = false;
          endpoint.failures++;
        }
      }

      const healthPercentage = (healthyEndpoints / totalEndpoints) * 100;
      console.log(`📊 API Health: ${healthPercentage.toFixed(1)}% of real APIs are healthy`);

    }, 60000); // Check every minute
  }

  getSystemStatus() {
    const endpointStatus = Array.from(this.endpoints.entries()).map(([name, endpoint]) => ({
      name,
      healthy: endpoint.isHealthy,
      failures: endpoint.failures,
      priority: endpoint.priority,
      lastSuccess: new Date(endpoint.lastSuccess).toISOString()
    }));

    return {
      totalEndpoints: this.endpoints.size,
      healthyEndpoints: endpointStatus.filter(e => e.healthy).length,
      endpoints: endpointStatus,
      timestamp: new Date().toISOString(),
      note: 'NO SYNTHETIC DATA - REAL APIS ONLY'
    };
  }

  clearAllCaches() {
    this.cache.flushAll();
    console.log('🗑️ Real data caches cleared');
  }
}

export const apiResilienceManager = new APIResilienceManager();