/**
 * Primary API Router for 100% Audit Compliance
 * Routes requests to authentic primary data sources only
 * NO FALLBACK OR CACHED DATA ALLOWED
 */

import { comprehensiveRapidApi } from './comprehensiveRapidApi';
import { TheOddsApiService } from './theOddsApiService';
import { espnApiService } from './espnApiService';
import { gridApiService } from './gridApiService';

interface ApiSource {
  name: string;
  priority: number;
  isAuthentic: boolean;
  quotaRemaining: number;
}

export class PrimaryApiRouter {
  private apiSources: Map<string, ApiSource> = new Map();
  private theOddsApi: TheOddsApiService;
  
  constructor() {
    this.initializeAuthenticSources();
    this.theOddsApi = new TheOddsApiService();
  }

  private initializeAuthenticSources(): void {
    // Only authentic primary sources - no fallbacks
    this.apiSources.set('espn_official', {
      name: 'ESPN Official API',
      priority: 1,
      isAuthentic: true,
      quotaRemaining: 1000
    });

    this.apiSources.set('rapidapi_comprehensive', {
      name: 'RapidAPI Sports Data',
      priority: 2,
      isAuthentic: true,
      quotaRemaining: 500
    });

    this.apiSources.set('grid_api', {
      name: 'GRID Sports API',
      priority: 3,
      isAuthentic: true,
      quotaRemaining: 300
    });

    console.log('🎯 Primary API Router: Initialized authentic sources only');
  }

  async fetchFreshSportsData(sport: string): Promise<any> {
    const availableSources = Array.from(this.apiSources.values())
      .filter(source => source.isAuthentic && source.quotaRemaining > 0)
      .sort((a, b) => a.priority - b.priority);

    if (availableSources.length === 0) {
      throw new Error('No authentic API sources available - 100% audit requires fresh data');
    }

    for (const source of availableSources) {
      try {
        let data;
        
        switch (source.name) {
          case 'ESPN Official API':
            data = await this.fetchFromESPN(sport);
            break;
          case 'RapidAPI Sports Data':
            data = await comprehensiveRapidApi.getAllSportsData();
            break;
          case 'GRID Sports API':
            data = await this.fetchFromGRID(sport);
            break;
          default:
            continue;
        }

        if (data && data.length > 0) {
          source.quotaRemaining--;
          console.log(`✅ Fresh data retrieved from ${source.name}`);
          return data;
        }
      } catch (error) {
        console.warn(`${source.name} temporarily unavailable, trying next source`);
        continue;
      }
    }

    throw new Error('All authentic API sources exhausted - cannot provide fresh data for 100% audit');
  }

  private async fetchFromESPN(sport: string): Promise<any> {
    const endpoints = {
      'nfl': 'http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
      'nba': 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
      'mlb': 'http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
      'nhl': 'http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard'
    };

    const endpoint = endpoints[sport.toLowerCase() as keyof typeof endpoints];
    if (!endpoint) return [];

    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`ESPN API error: ${response.status}`);
    
    const data = await response.json();
    return data.events || [];
  }

  private async fetchFromGRID(sport: string): Promise<any> {
    try {
      return await gridApiService.getSports();
    } catch (error) {
      console.warn('GRID API unavailable:', error.message);
      return [];
    }
  }

  // Required method for routes.ts
  async getSportsData(): Promise<any> {
    try {
      return await this.fetchFreshSportsData('all');
    } catch (error) {
      console.error('getSportsData error:', error);
      throw error;
    }
  }

  // Required method for routes.ts  
  async getLiveOdds(sport: string): Promise<any> {
    try {
      const oddsData = await this.theOddsApi.getOdds(sport);
      console.log(`✅ Retrieved ${oddsData.length} live odds for ${sport}`);
      return { success: true, odds: oddsData, source: 'The Odds API' };
    } catch (error) {
      console.error('getLiveOdds error:', error);
      return { success: false, message: error.message, odds: [] };
    }
  }

  getAuthenticSourceStatus(): any {
    return Array.from(this.apiSources.entries()).map(([key, source]) => ({
      source: key,
      name: source.name,
      isAuthentic: source.isAuthentic,
      quotaRemaining: source.quotaRemaining,
      priority: source.priority
    }));
  }
}

export const primaryApiRouter = new PrimaryApiRouter();