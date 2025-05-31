// API Rate Limit Manager - Prevents running out of API calls
import NodeCache from 'node-cache';

interface APILimits {
  [apiName: string]: {
    dailyLimit: number;
    currentCount: number;
    resetTime: number;
    priority: number; // 1 = critical, 2 = important, 3 = nice-to-have
  };
}

export class APIRateLimitManager {
  private static instance: APIRateLimitManager;
  private requestCounts: Map<string, number> = new Map();
  private resetTimers: Map<string, NodeJS.Timeout> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private cache = new NodeCache({ stdTTL: 86400 }); // 24 hour cache
  private limits: APILimits = {};

  constructor() {
    this.initializeLimits();
  }

  private initializeLimits() {
    const now = Date.now();
    const tomorrow = now + 86400000; // 24 hours

    this.limits = {
      'riot_games': {
        dailyLimit: 20000, // Riot gives 20k/day for personal key
        currentCount: 0,
        resetTime: tomorrow,
        priority: 1
      },
      'pandascore': {
        dailyLimit: 1000, // Free tier limit
        currentCount: 0,
        resetTime: tomorrow,
        priority: 1
      },
      'tracker_gg': {
        dailyLimit: 100, // Conservative estimate
        currentCount: 0,
        resetTime: tomorrow,
        priority: 2
      },
      'espn': {
        dailyLimit: 10000, // Usually unlimited but let's be safe
        currentCount: 0,
        resetTime: tomorrow,
        priority: 3
      },
      'odds_api': {
        dailyLimit: 500, // Free tier
        currentCount: 0,
        resetTime: tomorrow,
        priority: 1
      }
    };
  }

  async canMakeRequest(apiName: string): Promise<boolean> {
    const limit = this.limits[apiName];
    if (!limit) return true; // Unknown API, allow

    // Reset counter if day has passed
    if (Date.now() > limit.resetTime) {
      limit.currentCount = 0;
      limit.resetTime = Date.now() + 86400000;
    }

    // Check if we're under limit
    const canMake = limit.currentCount < limit.dailyLimit;

    if (!canMake) {
      console.warn(`🚨 API limit reached for ${apiName}. ${limit.currentCount}/${limit.dailyLimit} calls used.`);
    }

    return canMake;
  }

  async recordRequest(apiName: string): Promise<void> {
    const limit = this.limits[apiName];
    if (limit) {
      limit.currentCount++;

      // Cache the updated count
      this.cache.set(`api_count_${apiName}`, limit.currentCount);
    }
  }

  async getRemainingCalls(apiName: string): Promise<number> {
    const limit = this.limits[apiName];
    if (!limit) return 999999; // Unknown API

    return Math.max(0, limit.dailyLimit - limit.currentCount);
  }

  async getAPIStatus(): Promise<APILimits> {
    return this.limits;
  }

  // Intelligent API selection based on priority and remaining calls
  async selectBestAPI(apis: string[]): Promise<string | null> {
    const availableAPIs = [];

    for (const api of apis) {
      if (await this.canMakeRequest(api)) {
        const remaining = await this.getRemainingCalls(api);
        const priority = this.limits[api]?.priority || 5;

        availableAPIs.push({
          name: api,
          remaining,
          priority,
          score: remaining / priority // Higher score = better choice
        });
      }
    }

    if (availableAPIs.length === 0) {
      console.warn('🚨 No APIs available! Activating emergency fallback mode.');
      return 'fallback_mode';
    }

    // Sort by score (best first)
    availableAPIs.sort((a, b) => b.score - a.score);

    return availableAPIs[0].name;
  }

  // Emergency fallback when all APIs are exhausted
  async getEmergencyFallbackData(dataType: string): Promise<any> {
    console.log(`🆘 Emergency fallback activated for ${dataType}`);

    const fallbackData = {
      'esports_matches': [
        {
          id: 'emergency-1',
          game: 'League of Legends',
          tournament: 'Demo Tournament',
          team1: { name: 'Team Alpha', logo: '🏆', score: 1 },
          team2: { name: 'Team Beta', logo: '⚡', score: 0 },
          status: 'live',
          viewers: 50000,
          odds: { team1Win: 1.50, team2Win: 2.75 }
        }
      ],
      'sports_games': [
        {
          id: 'emergency-sport-1',
          sport: 'NBA',
          homeTeam: 'Lakers',
          awayTeam: 'Warriors',
          status: 'live',
          odds: { home: 1.85, away: 1.95 }
        }
      ]
    };

    return fallbackData[dataType] || { error: 'No fallback data available', useDemoMode: true };
  }

  // Warning system when approaching limits
  async checkAPIHealth(): Promise<string[]> {
    const warnings = [];

    for (const [apiName, limit] of Object.entries(this.limits)) {
      const remaining = limit.dailyLimit - limit.currentCount;
      const percentRemaining = (remaining / limit.dailyLimit) * 100;

      if (percentRemaining < 10) {
        warnings.push(`${apiName}: Only ${remaining} calls remaining (${percentRemaining.toFixed(1)}%)`);
      }
    }

    return warnings;
  }
}

export const apiRateLimitManager = new APIRateLimitManager();