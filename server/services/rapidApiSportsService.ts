// RapidAPI Sports Service - Connect to all your subscribed sports APIs
import fetch from 'node-fetch';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

if (!RAPIDAPI_KEY) {
  console.warn('RapidAPI key not configured - limited sports data available');
}

interface RapidApiResponse {
  data?: any;
  error?: string;
}

export class RapidApiSportsService {
  private async makeRequest(host: string, endpoint: string): Promise<RapidApiResponse> {
    if (!RAPIDAPI_KEY) {
      return { error: 'RapidAPI key not configured' };
    }

    try {
      const response = await fetch(`https://${host}${endpoint}`, {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': host
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { error: data.message || 'API request failed' };
      }

      return { data };
    } catch (error) {
      return { error: `Request failed: ${error.message}` };
    }
  }

  // Test different sports APIs to see what you're subscribed to
  async getAvailableServices(): Promise<string[]> {
    const servicesWithDescriptions = [
      { host: 'api-football-v1.p.rapidapi.com', endpoint: '/v3/status', description: 'Soccer/Football API' },
      { host: 'api-basketball.p.rapidapi.com', endpoint: '/leagues', description: 'Basketball API' },
      { host: 'api-baseball.p.rapidapi.com', endpoint: '/status', description: 'Baseball API' },
      { host: 'api-hockey.p.rapidapi.com', endpoint: '/status', description: 'Hockey API' },
      { host: 'sportscore1.p.rapidapi.com', endpoint: '/sports', description: 'Multi-Sport API' },
      { host: 'livescore6.p.rapidapi.com', endpoint: '/sports/list', description: 'Live Scores API' },
      { host: 'free-nba.p.rapidapi.com', endpoint: '/teams', description: 'NBA API' },
      { host: 'odds-api1.p.rapidapi.com', endpoint: '/sports', description: 'Odds API' },
      { host: 'sports-live-scores.p.rapidapi.com', endpoint: '/sports', description: 'Live Sports API' },
      { host: 'flashlive-sports.p.rapidapi.com', endpoint: '/sports/list', description: 'Flash Live Sports' }
    ];

    const availableServices = [];

    for (const service of servicesWithDescriptions) {
      const result = await this.makeRequest(service.host, service.endpoint);
      if (!result.error || !result.error.includes('not subscribed')) {
        availableServices.push(service.description);
        console.log(`✅ Available: ${service.description} (${service.host})`);
      } else {
        console.log(`❌ Not subscribed: ${service.description}`);
      }
    }

    return availableServices;
  }

  // NFL/American Football
  async getNFLGames() {
    const result = await this.makeRequest('api-american-football.p.rapidapi.com', '/games');
    return result.data || [];
  }

  // NBA Basketball
  async getNBAGames() {
    const result = await this.makeRequest('free-nba.p.rapidapi.com', '/games');
    return result.data || [];
  }

  // Soccer/Football
  async getSoccerMatches() {
    const result = await this.makeRequest('api-football-v1.p.rapidapi.com', '/v3/fixtures?live=all');
    return result.data?.response || [];
  }

  // MLB Baseball
  async getMLBGames() {
    const result = await this.makeRequest('api-baseball.p.rapidapi.com', '/games');
    return result.data || [];
  }

  // NHL Hockey
  async getNHLGames() {
    const result = await this.makeRequest('api-hockey.p.rapidapi.com', '/games');
    return result.data || [];
  }

  // Multi-sport live scores
  async getLiveScores() {
    const result = await this.makeRequest('livescore6.p.rapidapi.com', '/matches/v2/list-live');
    return result.data || [];
  }

  // Tennis
  async getTennisMatches() {
    const result = await this.makeRequest('ultimate-tennis1.p.rapidapi.com', '/live_events');
    return result.data || [];
  }

  // Boxing/MMA
  async getCombatSports() {
    const result = await this.makeRequest('mma-stats.p.rapidapi.com', '/events');
    return result.data || [];
  }

  // Motorsports
  async getMotorsports() {
    const result = await this.makeRequest('f1-live-motorsport-data.p.rapidapi.com', '/races');
    return result.data || [];
  }

  // Esports
  async getEsportsMatches() {
    const result = await this.makeRequest('esports-api1.p.rapidapi.com', '/matches');
    return result.data || [];
  }
}

export const rapidApiSportsService = new RapidApiSportsService();