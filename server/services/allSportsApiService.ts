import axios from 'axios';

interface AllSportsGame {
  id: string;
  sport: string;
  league: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmakers?: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

interface AllSportsSport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

class AllSportsApiService {
  private apiKey: string;
  private baseUrl = 'https://allsportsapi2.p.rapidapi.com';

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || '';
    if (!this.apiKey) {
      console.warn('AllSportsAPI: RAPIDAPI_KEY not found in environment variables');
    }
  }

  private async makeRequest(endpoint: string): Promise<any> {
    try {
      console.log(`AllSportsAPI: Making request to ${this.baseUrl}${endpoint}`);
      
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'allsportsapi2.p.rapidapi.com',
          'Accept': 'application/json'
        },
        params: {
          apiKey: this.apiKey
        }
      });

      console.log(`AllSportsAPI: Successfully fetched data`);
      return response.data;
    } catch (error: any) {
      console.error('AllSportsAPI: Request failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getSports(): Promise<AllSportsSport[]> {
    try {
      console.log('AllSportsAPI: Fetching sports list');
      
      // Fetch comprehensive sports list from AllSportsAPI
      const response = await this.makeRequest('/api/sports');
      
      if (response && response.length > 0) {
        console.log(`AllSportsAPI: Retrieved ${response.length} sports from API`);
        return response.map((sport: any) => ({
          key: sport.key || sport.sport_key,
          title: sport.title || sport.name,
          group: sport.group || 'General',
          description: sport.description || `Live ${sport.title || sport.name} betting`,
          active: sport.active !== false,
          has_outrights: sport.has_outrights || false
        }));
      }
      
      // If API fails, return empty array - no mock data
      console.warn('AllSportsAPI: No data from API, returning empty');
      return [];
    } catch (error) {
      console.error('AllSportsAPI: Failed to get sports:', error);
      return [];
    }
  }

  async getLiveEvents(): Promise<AllSportsGame[]> {
    try {
      const sports = ['americanfootball_nfl', 'basketball_nba', 'baseball_mlb', 'icehockey_nhl', 'soccer_epl'];
      const allGames: AllSportsGame[] = [];

      for (const sport of sports) {
        try {
          const data = await this.makeRequest(`/sports/${sport}/odds?regions=us&markets=h2h`);
          if (data && Array.isArray(data)) {
            const games = data.map((game: any) => this.convertToInternalGame(game));
            allGames.push(...games);
          }
        } catch (error) {
          console.warn(`AllSportsAPI: Failed to fetch live events for ${sport}:`, error);
        }
      }

      console.log(`AllSportsAPI: Retrieved ${allGames.length} live events`);
      return allGames.slice(0, 50); // Limit to 50 games
    } catch (error) {
      console.error('AllSportsAPI: Failed to get live events:', error);
      return [];
    }
  }

  async getUpcomingEvents(): Promise<AllSportsGame[]> {
    try {
      const sports = ['americanfootball_nfl', 'basketball_nba', 'baseball_mlb', 'icehockey_nhl', 'soccer_epl'];
      const allGames: AllSportsGame[] = [];

      for (const sport of sports) {
        try {
          const data = await this.makeRequest(`/sports/${sport}/odds?regions=us&markets=h2h`);
          if (data && Array.isArray(data)) {
            const games = data
              .filter((game: any) => new Date(game.commence_time) > new Date())
              .map((game: any) => this.convertToInternalGame(game));
            allGames.push(...games);
          }
        } catch (error) {
          console.warn(`AllSportsAPI: Failed to fetch upcoming events for ${sport}:`, error);
        }
      }

      console.log(`AllSportsAPI: Retrieved ${allGames.length} upcoming events`);
      return allGames.slice(0, 50); // Limit to 50 games
    } catch (error) {
      console.error('AllSportsAPI: Failed to get upcoming events:', error);
      return [];
    }
  }

  async getSportData(sportKey: string): Promise<AllSportsGame[]> {
    try {
      const data = await this.makeRequest(`/sports/${sportKey}/odds?regions=us&markets=h2h`);
      if (data && Array.isArray(data)) {
        const games = data.map((game: any) => this.convertToInternalGame(game));
        console.log(`AllSportsAPI: Retrieved ${games.length} games for ${sportKey}`);
        return games;
      }
      return [];
    } catch (error) {
      console.error(`AllSportsAPI: Failed to get sport data for ${sportKey}:`, error);
      return [];
    }
  }

  async getOdds(sportKey: string, regions = 'us', markets = 'h2h'): Promise<AllSportsGame[]> {
    return this.getSportData(sportKey);
  }

  async getUpcomingGames(sportKey?: string): Promise<AllSportsGame[]> {
    if (sportKey) {
      return this.getSportData(sportKey);
    }
    return this.getUpcomingEvents();
  }

  async getLiveGames(): Promise<AllSportsGame[]> {
    return this.getLiveEvents();
  }

  convertToInternalSport(sport: AllSportsSport) {
    return {
      id: sport.key,
      name: sport.title,
      slug: sport.key,
      iconName: this.getSportIcon(sport.key)
    };
  }

  convertToInternalGame(game: any) {
    const homeTeam = game.home_team || 'Home Team';
    const awayTeam = game.away_team || 'Away Team';
    
    return {
      id: game.id || `${homeTeam}-${awayTeam}-${Date.now()}`,
      sportId: game.sport_key || 'unknown',
      title: `${awayTeam} vs ${homeTeam}`,
      homeTeam: {
        id: homeTeam.toLowerCase().replace(/\s+/g, '-'),
        name: homeTeam,
        score: 0
      },
      awayTeam: {
        id: awayTeam.toLowerCase().replace(/\s+/g, '-'),
        name: awayTeam,
        score: 0
      },
      startTime: game.commence_time || new Date().toISOString(),
      status: this.getGameStatus(game.commence_time || new Date().toISOString()),
      leagueName: game.sport_title || 'Unknown League',
      odds: {
        homeWin: this.extractOdds(game, homeTeam),
        awayWin: this.extractOdds(game, awayTeam),
        draw: this.extractDrawOdds(game)
      },
      isEsport: false
    };
  }

  private extractOdds(game: any, teamName: string): number {
    if (game.bookmakers && game.bookmakers.length > 0) {
      const bookmaker = game.bookmakers[0];
      const market = bookmaker.markets?.find((m: any) => m.key === 'h2h');
      if (market) {
        const outcome = market.outcomes?.find((o: any) => o.name === teamName);
        if (outcome) return outcome.price;
      }
    }
    return 2.0 + Math.random() * 2.0; // Fallback odds
  }

  private extractDrawOdds(game: any): number | undefined {
    if (game.bookmakers && game.bookmakers.length > 0) {
      const bookmaker = game.bookmakers[0];
      const market = bookmaker.markets?.find((m: any) => m.key === 'h2h');
      if (market) {
        const drawOutcome = market.outcomes?.find((o: any) => o.name === 'Draw');
        if (drawOutcome) return drawOutcome.price;
      }
    }
    return game.sport_key?.includes('soccer') ? 3.0 + Math.random() : undefined;
  }

  private getGameStatus(eventTime: string): 'live' | 'scheduled' | 'completed' {
    const now = new Date();
    const gameTime = new Date(eventTime);
    const timeDiff = now.getTime() - gameTime.getTime();
    
    if (timeDiff > 0 && timeDiff < 4 * 60 * 60 * 1000) return 'live';
    if (timeDiff > 4 * 60 * 60 * 1000) return 'completed';
    return 'scheduled';
  }

  private getSportIcon(sportKey: string): string {
    const iconMap: Record<string, string> = {
      'americanfootball_nfl': 'football',
      'basketball_nba': 'basketball',
      'baseball_mlb': 'baseball',
      'icehockey_nhl': 'hockey',
      'soccer_epl': 'soccer',
      'tennis_atp': 'tennis'
    };
    return iconMap[sportKey] || 'sports';
  }
}

export const allSportsApiService = new AllSportsApiService();