export class ESPNFantasyService {
  private apiKey: string;
  private baseUrl = 'https://api-nba-v1.p.rapidapi.com'; // Using NBA API as backup

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || '';
  }

  async getFantasyPlayers(sport: string = 'nfl'): Promise<any[]> {
    if (!this.apiKey) {
      console.log('RapidAPI key not configured for ESPN Fantasy');
      return [];
    }

    try {
      // Try multiple ESPN Fantasy endpoints
      const endpoints = [
        'https://fantasy-sports-api.rapidapi.com',
        'https://espn-fantasy-api.p.rapidapi.com',
        'https://api-basketball.p.rapidapi.com'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${endpoint}/players`, {
            headers: {
              'X-RapidAPI-Key': this.apiKey,
              'X-RapidAPI-Host': endpoint.replace('https://', '')
            }
          });

          if (response.ok) {
            const data = await response.json();
            return Array.isArray(data) ? data : data.players || data.response || [];
          }
        } catch (e) {
          continue; // Try next endpoint
        }
      }

      return [];
    } catch (error) {
      console.log('ESPN Fantasy API unavailable:', error);
      return [];
    }
  }

  async getFantasyLeagues(): Promise<any[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/leagues`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'fantasy-sports-api.rapidapi.com'
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.leagues || [];
    } catch (error) {
      console.log('ESPN Fantasy leagues unavailable');
      return [];
    }
  }

  async getPlayerStats(playerId: string, sport: string = 'nfl'): Promise<any> {
    if (!this.apiKey || !playerId) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/players/${sport}/${playerId}/stats`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'fantasy-sports-api.rapidapi.com'
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      return null;
    }
  }
}

export const espnFantasyService = new ESPNFantasyService();