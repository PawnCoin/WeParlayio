import { OddsApiService } from './oddsApiService';
import { RapidApiService } from './rapidApiService';
import { comprehensiveRapidApi } from './comprehensiveRapidApi';

interface ApiSource {
  name: string;
  service: any;
  quotaRemaining: number;
  lastReset: number;
  isAvailable: boolean;
  priority: number;
}

export class ApiQuotaManager {
  private apiSources: Map<string, ApiSource> = new Map();
  private oddsApiService: OddsApiService;
  private rapidApiService: RapidApiService;
  
  constructor() {
    this.oddsApiService = new OddsApiService();
    this.rapidApiService = new RapidApiService();
    
    this.initializeApiSources();
  }

  private initializeApiSources(): void {
    // Initialize The Odds API
    this.apiSources.set('odds_api', {
      name: 'The Odds API',
      service: this.oddsApiService,
      quotaRemaining: 500, // Daily quota
      lastReset: Date.now(),
      isAvailable: true,
      priority: 1
    });

    // Initialize RapidAPI
    this.apiSources.set('rapid_api', {
      name: 'RapidAPI Sports',
      service: this.rapidApiService,
      quotaRemaining: 1000, // Monthly quota
      lastReset: Date.now(),
      isAvailable: true,
      priority: 2
    });

    // Initialize Comprehensive RapidAPI
    this.apiSources.set('comprehensive_rapid', {
      name: 'Comprehensive RapidAPI',
      service: comprehensiveRapidApi,
      quotaRemaining: 500,
      lastReset: Date.now(),
      isAvailable: true,
      priority: 3
    });
  }

  async getAvailableApiForSport(sport: string): Promise<ApiSource | null> {
    // Sort APIs by priority and availability
    const availableApis = Array.from(this.apiSources.values())
      .filter(api => api.isAvailable && api.quotaRemaining > 0)
      .sort((a, b) => a.priority - b.priority);

    if (availableApis.length === 0) {
      console.warn('No APIs available with remaining quota');
      return null;
    }

    return availableApis[0];
  }

  async fetchSportsData(sport: string): Promise<any> {
    const availableApi = await this.getAvailableApiForSport(sport);
    
    if (!availableApi) {
      throw new Error('No API sources available for fresh data');
    }

    try {
      let data;
      
      switch (availableApi.name) {
        case 'The Odds API':
          data = await this.oddsApiService.getOdds(sport);
          break;
        case 'RapidAPI Sports':
          data = await this.rapidApiService.getOdds(sport);
          break;
        case 'Comprehensive RapidAPI':
          data = await comprehensiveRapidApi.getAllSportsData();
          break;
        default:
          throw new Error('Unknown API source');
      }

      // Decrement quota
      availableApi.quotaRemaining--;
      
      // Mark as unavailable if quota exhausted
      if (availableApi.quotaRemaining <= 0) {
        availableApi.isAvailable = false;
        console.log(`${availableApi.name} quota exhausted, switching to next available API`);
      }

      return data;
    } catch (error) {
      // Mark API as unavailable on error
      availableApi.isAvailable = false;
      console.error(`${availableApi.name} failed:`, error);
      
      // Try next available API
      return this.fetchSportsData(sport);
    }
  }

  resetQuotaIfNeeded(): void {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    this.apiSources.forEach((api, key) => {
      if (now - api.lastReset > oneDay) {
        api.quotaRemaining = key === 'rapid_api' ? 1000 : 500;
        api.lastReset = now;
        api.isAvailable = true;
        console.log(`${api.name} quota reset`);
      }
    });
  }

  getQuotaStatus(): any {
    return Array.from(this.apiSources.entries()).map(([key, api]) => ({
      source: key,
      name: api.name,
      quotaRemaining: api.quotaRemaining,
      isAvailable: api.isAvailable,
      priority: api.priority
    }));
  }
}

export const apiQuotaManager = new ApiQuotaManager();