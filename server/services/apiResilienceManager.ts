
// WeParlay API Resilience Manager - Ensures site never breaks due to API failures
import NodeCache from 'node-cache';
import { apiRateLimitManager } from './apiRateLimitManager';

interface FallbackData {
  [key: string]: any;
}

interface APIEndpoint {
  name: string;
  url: string;
  fallbackData: any;
  isHealthy: boolean;
  lastSuccess: number;
  failures: number;
  timeout: number;
}

class APIResilienceManager {
  private cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache
  private longTermCache = new NodeCache({ stdTTL: 3600 }); // 1 hour backup cache
  private endpoints: Map<string, APIEndpoint> = new Map();
  private isEmergencyMode = false;

  constructor() {
    this.initializeFallbackData();
    this.startHealthCheck();
  }

  private initializeFallbackData() {
    // Comprehensive fallback data for all features
    const fallbackData = {
      // Sports data
      nfl_games: [
        {
          id: 'emergency-nfl-1',
          homeTeam: 'Chiefs',
          awayTeam: 'Bills',
          odds: { home: 1.85, away: 1.95, total: 47.5 },
          status: 'scheduled',
          date: new Date().toISOString()
        }
      ],
      
      nba_games: [
        {
          id: 'emergency-nba-1',
          homeTeam: 'Lakers',
          awayTeam: 'Warriors',
          odds: { home: 1.90, away: 1.90, total: 225.5 },
          status: 'live',
          score: { home: 85, away: 82 }
        }
      ],

      // Esports data
      esports_matches: [
        {
          id: 'emergency-esports-1',
          game: 'League of Legends',
          tournament: 'WeParlay Championship',
          team1: { name: 'Team Alpha', logo: '🏆' },
          team2: { name: 'Team Beta', logo: '⚡' },
          odds: { team1Win: 1.75, team2Win: 2.05 },
          status: 'live',
          viewers: 45000
        }
      ],

      // Gaming stats
      player_stats: {
        riot: { rank: 'Gold II', wins: 125, losses: 98 },
        steam: { level: 45, hours: 1250 },
        xbox: { gamerscore: 15000, achievements: 350 }
      },

      // Crypto data
      crypto_prices: [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 43250,
          change24h: 2.45,
          volume: 28500000000,
          marketCap: 847000000000
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          price: 2580,
          change24h: -1.25,
          volume: 15200000000,
          marketCap: 310000000000
        }
      ],

      // Tournament brackets
      tournaments: [
        {
          id: 'emergency-tournament-1',
          name: 'WeParlay Championship',
          game: 'League of Legends',
          prizePool: 100000,
          teams: 8,
          status: 'active'
        }
      ],

      // Live odds
      live_odds: {
        updateTime: new Date().toISOString(),
        markets: {
          match_winner: { team1: 1.85, team2: 1.95 },
          total_rounds: { over: 1.90, under: 1.90 }
        }
      }
    };

    // Store fallback data in long-term cache
    Object.entries(fallbackData).forEach(([key, data]) => {
      this.longTermCache.set(`fallback_${key}`, data);
    });
  }

  // Register an API endpoint for monitoring
  registerEndpoint(name: string, url: string, fallbackData: any) {
    this.endpoints.set(name, {
      name,
      url,
      fallbackData,
      isHealthy: true,
      lastSuccess: Date.now(),
      failures: 0,
      timeout: 10000
    });
  }

  // Make a resilient API call
  async makeResilientCall(endpointName: string, options: any = {}): Promise<any> {
    const cacheKey = `api_${endpointName}_${JSON.stringify(options)}`;
    
    // 1. Try cache first
    if (this.cache.has(cacheKey)) {
      console.log(`✅ Cache hit for ${endpointName}`);
      return this.cache.get(cacheKey);
    }

    // 2. Check if API is healthy and within rate limits
    const endpoint = this.endpoints.get(endpointName);
    if (!endpoint) {
      return this.getFallbackData(endpointName);
    }

    // 3. Check rate limits
    if (!(await apiRateLimitManager.canMakeRequest(endpointName))) {
      console.warn(`⚠️ Rate limit reached for ${endpointName}, using fallback`);
      return this.getFallbackData(endpointName);
    }

    // 4. Try the API call with circuit breaker
    if (endpoint.failures >= 3) {
      console.warn(`🔌 Circuit breaker: ${endpointName} has failed too many times`);
      return this.getFallbackData(endpointName);
    }

    try {
      console.log(`🌐 Making API call to ${endpointName}`);
      
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
      
      // Success! Reset failure counter and cache the result
      endpoint.failures = 0;
      endpoint.lastSuccess = Date.now();
      endpoint.isHealthy = true;
      
      this.cache.set(cacheKey, data);
      this.longTermCache.set(`backup_${cacheKey}`, data); // Backup cache
      
      await apiRateLimitManager.recordRequest(endpointName);
      
      console.log(`✅ Successfully cached ${endpointName}`);
      return data;

    } catch (error: any) {
      console.warn(`❌ API call failed for ${endpointName}:`, error.message);
      
      endpoint.failures++;
      endpoint.isHealthy = false;

      // Try backup cache first
      const backupKey = `backup_api_${endpointName}_${JSON.stringify(options)}`;
      if (this.longTermCache.has(backupKey)) {
        console.log(`📦 Using backup cache for ${endpointName}`);
        return this.longTermCache.get(backupKey);
      }

      // Use fallback data
      return this.getFallbackData(endpointName);
    }
  }

  // Get fallback data for any endpoint
  private getFallbackData(endpointName: string): any {
    console.log(`🆘 Using fallback data for ${endpointName}`);
    
    // First try specific fallback
    const fallbackKey = `fallback_${endpointName}`;
    if (this.longTermCache.has(fallbackKey)) {
      return this.longTermCache.get(fallbackKey);
    }

    // Generic fallback based on endpoint type
    if (endpointName.includes('sport') || endpointName.includes('game')) {
      return this.longTermCache.get('fallback_nfl_games') || [];
    }
    
    if (endpointName.includes('esport') || endpointName.includes('lol')) {
      return this.longTermCache.get('fallback_esports_matches') || [];
    }
    
    if (endpointName.includes('crypto') || endpointName.includes('price')) {
      return this.longTermCache.get('fallback_crypto_prices') || [];
    }

    // Default fallback
    return {
      error: false,
      message: 'Using cached data - service temporarily unavailable',
      data: [],
      fallback: true,
      timestamp: new Date().toISOString()
    };
  }

  // Health check system
  private startHealthCheck() {
    setInterval(async () => {
      let healthyEndpoints = 0;
      const totalEndpoints = this.endpoints.size;

      for (const [name, endpoint] of this.endpoints) {
        try {
          // Simple health check
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);

          await fetch(endpoint.url, {
            method: 'HEAD',
            signal: controller.signal
          });

          clearTimeout(timeout);
          endpoint.isHealthy = true;
          healthyEndpoints++;
        } catch {
          endpoint.isHealthy = false;
        }
      }

      // Emergency mode if more than 50% of APIs are down
      const healthPercentage = (healthyEndpoints / totalEndpoints) * 100;
      this.isEmergencyMode = healthPercentage < 50;

      if (this.isEmergencyMode) {
        console.warn(`🚨 Emergency mode activated! Only ${healthPercentage.toFixed(1)}% of APIs are healthy`);
      }

    }, 60000); // Check every minute
  }

  // Get system status
  getSystemStatus() {
    const endpointStatus = Array.from(this.endpoints.entries()).map(([name, endpoint]) => ({
      name,
      healthy: endpoint.isHealthy,
      failures: endpoint.failures,
      lastSuccess: new Date(endpoint.lastSuccess).toISOString()
    }));

    return {
      emergencyMode: this.isEmergencyMode,
      endpoints: endpointStatus,
      cacheStats: {
        shortTerm: this.cache.keys().length,
        longTerm: this.longTermCache.keys().length
      },
      timestamp: new Date().toISOString()
    };
  }

  // Force refresh all caches (admin function)
  clearAllCaches() {
    this.cache.flushAll();
    console.log('🗑️ All caches cleared - next requests will attempt fresh API calls');
  }

  // Update fallback data (admin function)
  updateFallbackData(category: string, data: any) {
    this.longTermCache.set(`fallback_${category}`, data);
    console.log(`📝 Updated fallback data for ${category}`);
  }
}

export const apiResilienceManager = new APIResilienceManager();
