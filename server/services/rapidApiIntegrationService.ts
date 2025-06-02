import { Request, Response } from 'express';

// RapidAPI Integration Service - Connect all your active subscriptions
export class RapidApiIntegrationService {
  private rapidApiKey: string;
  
  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY || '';
  }

  // API-BASKETBALL integration
  async getBasketballData(league: string = 'nba') {
    try {
      const response = await fetch(`https://api-basketball.p.rapidapi.com/games?league=${league}&season=2024`, {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'api-basketball.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Basketball API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.response || [];
    } catch (error) {
      console.error('Basketball API error:', error);
      return [];
    }
  }

  // AllSportsApi integration
  async getAllSportsData() {
    try {
      const response = await fetch('https://allsportsapi2.p.rapidapi.com/api/live-events', {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'allsportsapi2.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`AllSports API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('AllSports API error:', error);
      return [];
    }
  }

  // FlashLive Sports integration
  async getFlashLiveData() {
    try {
      const response = await fetch('https://flashlive-sports.p.rapidapi.com/v1/events/live', {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'flashlive-sports.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`FlashLive API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.DATA || [];
    } catch (error) {
      console.error('FlashLive API error:', error);
      return [];
    }
  }

  // Sportsbook API integration
  async getSportsbookOdds(sport: string) {
    try {
      const response = await fetch(`https://sportsbook-api.p.rapidapi.com/v1/odds/${sport}`, {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'sportsbook-api.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Sportsbook API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.odds || [];
    } catch (error) {
      console.error('Sportsbook API error:', error);
      return [];
    }
  }

  // Pinnacle Odds integration
  async getPinnacleOdds() {
    try {
      const response = await fetch('https://pinnacle-odds.p.rapidapi.com/kit/v1/markets', {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'pinnacle-odds.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Pinnacle API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Pinnacle API error:', error);
      return [];
    }
  }

  // League of Legends Esports integration
  async getLoLEsportsData() {
    try {
      const response = await fetch('https://league-of-legends-esports.p.rapidapi.com/live', {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'league-of-legends-esports.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`LoL Esports API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error('LoL Esports API error:', error);
      return [];
    }
  }

  // Valorant Esports integration
  async getValorantEsportsData() {
    try {
      const response = await fetch('https://valorant-esports.p.rapidapi.com/v1/matches', {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'valorant-esports.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Valorant Esports API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error('Valorant Esports API error:', error);
      return [];
    }
  }

  // Unified feed combining all your RapidAPI subscriptions
  async getUnifiedSportsData() {
    try {
      const [
        basketballData,
        allSportsData,
        flashLiveData,
        lolData,
        valorantData
      ] = await Promise.all([
        this.getBasketballData(),
        this.getAllSportsData(),
        this.getFlashLiveData(),
        this.getLoLEsportsData(),
        this.getValorantEsportsData()
      ]);

      return {
        basketball: basketballData,
        allSports: allSportsData,
        flashLive: flashLiveData,
        lolEsports: lolData,
        valorantEsports: valorantData,
        totalEvents: basketballData.length + allSportsData.length + flashLiveData.length + lolData.length + valorantData.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Unified sports data error:', error);
      return {
        basketball: [],
        allSports: [],
        flashLive: [],
        lolEsports: [],
        valorantEsports: [],
        totalEvents: 0,
        error: error.message
      };
    }
  }

  // Test all API subscriptions
  async testAllSubscriptions() {
    const results = {
      timestamp: new Date().toISOString(),
      subscriptions: {}
    };

    const subscriptions = [
      { name: 'API-BASKETBALL', host: 'api-basketball.p.rapidapi.com', endpoint: '/leagues' },
      { name: 'AllSportsApi', host: 'allsportsapi2.p.rapidapi.com', endpoint: '/api/live-events' },
      { name: 'FlashLive Sports', host: 'flashlive-sports.p.rapidapi.com', endpoint: '/v1/sports' },
      { name: 'Sportsbook API', host: 'sportsbook-api.p.rapidapi.com', endpoint: '/v1/sports' },
      { name: 'Pinnacle Odds', host: 'pinnacle-odds.p.rapidapi.com', endpoint: '/kit/v1/sports' },
      { name: 'League Of Legends Esports', host: 'league-of-legends-esports.p.rapidapi.com', endpoint: '/tournaments' },
      { name: 'Valorant Esports', host: 'valorant-esports.p.rapidapi.com', endpoint: '/v1/tournaments' },
      { name: 'ESportApi', host: 'esportapi1.p.rapidapi.com', endpoint: '/tournaments' }
    ];

    for (const sub of subscriptions) {
      try {
        const response = await fetch(`https://${sub.host}${sub.endpoint}`, {
          headers: {
            'X-RapidAPI-Key': this.rapidApiKey,
            'X-RapidAPI-Host': sub.host
          }
        });

        results.subscriptions[sub.name] = {
          status: response.ok ? 'ACTIVE' : 'INACTIVE',
          statusCode: response.status,
          message: response.ok ? 'Subscription active' : `HTTP ${response.status}`
        };
      } catch (error) {
        results.subscriptions[sub.name] = {
          status: 'ERROR',
          message: error.message
        };
      }
    }

    return results;
  }
}

export const rapidApiIntegration = new RapidApiIntegrationService();