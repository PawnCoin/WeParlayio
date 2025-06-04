import fetch from 'node-fetch';

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
  private alternateHosts = [
    'allsportsapi.p.rapidapi.com',
    'allsports.p.rapidapi.com', 
    'sportsapi.p.rapidapi.com',
    'api-sports.p.rapidapi.com'
  ];

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || '';
    if (!this.apiKey) {
      console.warn('AllSportsAPI: RAPIDAPI_KEY not configured');
    } else {
      console.log('AllSportsAPI: Initialized with API key');
    }
  }

  private async makeRequest(endpoint: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('AllSportsAPI: API key not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;
    console.log(`AllSportsAPI: Fetching ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'allsportsapi2.p.rapidapi.com',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`AllSportsAPI: HTTP ${response.status} ${response.statusText}`);
        console.error(`AllSportsAPI: Response headers:`, Object.fromEntries(response.headers.entries()));
        const errorText = await response.text();
        console.error(`AllSportsAPI: Error response:`, errorText);
        throw new Error(`AllSportsAPI: HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AllSportsAPI request failed:', error);
      throw error;
    }
  }

  async getSports(): Promise<AllSportsSport[]> {
    try {
      // Based on the RapidAPI response headers, trying AllSportsAPI endpoints
      const endpointConfigs = [
        { host: 'allsportsapi2.p.rapidapi.com', endpoint: '/football', method: 'GET' },
        { host: 'allsportsapi2.p.rapidapi.com', endpoint: '/basketball', method: 'GET' },
        { host: 'allsportsapi2.p.rapidapi.com', endpoint: '/baseball', method: 'GET' },
        { host: 'allsportsapi2.p.rapidapi.com', endpoint: '/hockey', method: 'GET' },
        { host: 'allsportsapi2.p.rapidapi.com', endpoint: '/tennis', method: 'GET' },
        { host: 'allsportsapi2.p.rapidapi.com', endpoint: '/soccer', method: 'GET' }
      ];
      
      const availableSports: AllSportsSport[] = [];
      
      for (const config of endpointConfigs) {
        try {
          const response = await fetch(`https://${config.host}${config.endpoint}`, {
            method: config.method,
            headers: {
              'X-RapidAPI-Key': this.apiKey,
              'X-RapidAPI-Host': config.host,
              'Accept': 'application/json'
            }
          });

          console.log(`AllSportsAPI: Testing ${config.host}${config.endpoint} - Status: ${response.status}`);
          
          if (response.ok && response.status !== 204) {
            const data = await response.json();
            
            // Create sport entry based on successful endpoint
            const sportKey = config.endpoint.replace('/', '');
            availableSports.push({
              key: sportKey,
              group: sportKey.charAt(0).toUpperCase() + sportKey.slice(1),
              title: sportKey.charAt(0).toUpperCase() + sportKey.slice(1),
              description: `${sportKey.charAt(0).toUpperCase() + sportKey.slice(1)} events and data`,
              active: true,
              has_outrights: false
            });
            
            console.log(`AllSportsAPI: ${sportKey} endpoint available`);
          } else if (response.status === 204) {
            console.log(`AllSportsAPI: ${config.endpoint} endpoint exists but returns no content`);
          }
        } catch (error) {
          console.log(`AllSportsAPI: ${config.endpoint} endpoint failed`);
          continue;
        }
      }
      
      if (availableSports.length > 0) {
        console.log(`AllSportsAPI: Found ${availableSports.length} available sports`);
        return availableSports;
      }
      
      // If no sports endpoints work, provide standard sports structure
      const standardSports: AllSportsSport[] = [
        { key: 'football', title: 'Football', group: 'American Football', description: 'NFL and college football', active: true, has_outrights: false },
        { key: 'basketball', title: 'Basketball', group: 'Basketball', description: 'NBA and college basketball', active: true, has_outrights: false },
        { key: 'baseball', title: 'Baseball', group: 'Baseball', description: 'MLB baseball', active: true, has_outrights: false },
        { key: 'hockey', title: 'Hockey', group: 'Ice Hockey', description: 'NHL hockey', active: true, has_outrights: false },
        { key: 'soccer', title: 'Soccer', group: 'Soccer', description: 'International soccer leagues', active: true, has_outrights: false },
        { key: 'tennis', title: 'Tennis', group: 'Tennis', description: 'Professional tennis', active: true, has_outrights: false }
      ];
      
      console.log('AllSportsAPI: Using standard sports configuration');
      return standardSports;
    } catch (error) {
      console.error('AllSportsAPI: Service error:', error);
      return [];
    }
  }

  async getOdds(sportKey: string, regions = 'us', markets = 'h2h'): Promise<AllSportsGame[]> {
    try {
      // Try sport-specific endpoints for odds data
      const oddsEndpoints = [
        `/${sportKey}/odds`,
        `/${sportKey}/games`,
        `/${sportKey}/events`,
        `/${sportKey}/matches`,
        `/${sportKey}`
      ];
      
      for (const endpoint of oddsEndpoints) {
        try {
          const response = await fetch(`https://allsportsapi2.p.rapidapi.com${endpoint}`, {
            headers: {
              'X-RapidAPI-Key': this.apiKey,
              'X-RapidAPI-Host': 'allsportsapi2.p.rapidapi.com',
              'Accept': 'application/json'
            }
          });

          if (response.ok && response.status !== 204) {
            const data = await response.json();
            console.log(`AllSportsAPI: Retrieved odds for ${sportKey} from ${endpoint}`);
            
            // Convert response to internal format
            if (Array.isArray(data)) {
              return data.map(game => this.convertToInternalGame(game));
            } else if (data.games && Array.isArray(data.games)) {
              return data.games.map((game: any) => this.convertToInternalGame(game));
            } else if (data.events && Array.isArray(data.events)) {
              return data.events.map((game: any) => this.convertToInternalGame(game));
            }
          }
        } catch (error) {
          continue;
        }
      }
      
      console.log(`AllSportsAPI: No odds data found for ${sportKey}`);
      return [];
    } catch (error) {
      console.error(`AllSportsAPI: Failed to get odds for ${sportKey}:`, error);
      return [];
    }
  }

  async getUpcomingGames(sportKey?: string): Promise<AllSportsGame[]> {
    try {
      const endpoint = sportKey ? `/odds?sport=${sportKey}` : '/odds';
      const data = await this.makeRequest(endpoint);
      console.log(`AllSportsAPI: Retrieved ${data.length} upcoming games`);
      return data;
    } catch (error) {
      console.error('AllSportsAPI: Failed to get upcoming games:', error);
      return [];
    }
  }

  async getLiveGames(): Promise<AllSportsGame[]> {
    try {
      // AllSportsAPI doesn't have a specific live endpoint, so we filter by commence_time
      const allGames = await this.getUpcomingGames();
      const now = new Date();
      const liveGames = allGames.filter(game => {
        const gameTime = new Date(game.commence_time);
        const timeDiff = now.getTime() - gameTime.getTime();
        // Consider games live if they started within the last 4 hours
        return timeDiff > 0 && timeDiff < 4 * 60 * 60 * 1000;
      });
      
      console.log(`AllSportsAPI: Filtered ${liveGames.length} live games from ${allGames.length} total`);
      return liveGames;
    } catch (error) {
      console.error('AllSportsAPI: Failed to get live games:', error);
      return [];
    }
  }

  // Convert AllSportsAPI data to our internal format
  convertToInternalSport(sport: AllSportsSport) {
    return {
      id: sport.key,
      name: sport.title,
      key: sport.key,
      group: sport.group,
      active: sport.active,
      iconName: this.getSportIcon(sport.key)
    };
  }

  convertToInternalGame(game: AllSportsGame) {
    const homeOdds = this.extractOdds(game, game.home_team);
    const awayOdds = this.extractOdds(game, game.away_team);
    
    return {
      id: `allsports-${game.id}`,
      sportId: game.sport,
      title: `${game.away_team} vs ${game.home_team}`,
      homeTeam: {
        id: game.home_team.toLowerCase().replace(/\s+/g, '-'),
        name: game.home_team,
        score: 0
      },
      awayTeam: {
        id: game.away_team.toLowerCase().replace(/\s+/g, '-'),
        name: game.away_team,
        score: 0
      },
      startTime: game.commence_time,
      status: this.getGameStatus(game.commence_time),
      leagueName: game.league,
      odds: {
        homeWin: homeOdds,
        awayWin: awayOdds,
        draw: this.extractDrawOdds(game)
      },
      isEsport: false
    };
  }

  private extractOdds(game: AllSportsGame, teamName: string): number {
    if (!game.bookmakers || game.bookmakers.length === 0) return 2.0;
    
    const bookmaker = game.bookmakers[0];
    const market = bookmaker.markets.find(m => m.key === 'h2h');
    if (!market) return 2.0;
    
    const outcome = market.outcomes.find(o => o.name === teamName);
    return outcome ? outcome.price : 2.0;
  }

  private extractDrawOdds(game: AllSportsGame): number | undefined {
    if (!game.bookmakers || game.bookmakers.length === 0) return undefined;
    
    const bookmaker = game.bookmakers[0];
    const market = bookmaker.markets.find(m => m.key === 'h2h');
    if (!market) return undefined;
    
    const drawOutcome = market.outcomes.find(o => o.name === 'Draw');
    return drawOutcome ? drawOutcome.price : undefined;
  }

  private getGameStatus(commenceTime: string): 'live' | 'scheduled' | 'completed' {
    const now = new Date();
    const gameTime = new Date(commenceTime);
    const timeDiff = now.getTime() - gameTime.getTime();
    
    if (timeDiff > 0 && timeDiff < 4 * 60 * 60 * 1000) {
      return 'live';
    } else if (timeDiff > 4 * 60 * 60 * 1000) {
      return 'completed';
    } else {
      return 'scheduled';
    }
  }

  private getSportIcon(sportKey: string): string {
    const iconMap: Record<string, string> = {
      'americanfootball_nfl': 'football',
      'basketball_nba': 'basketball',
      'icehockey_nhl': 'hockey',
      'baseball_mlb': 'baseball',
      'soccer_epl': 'soccer',
      'soccer_uefa_champs_league': 'soccer',
      'tennis_atp': 'tennis',
      'golf_pga': 'golf',
      'mma_mixed_martial_arts': 'mma',
      'boxing': 'boxing'
    };
    return iconMap[sportKey] || 'sport';
  }
}

export const allSportsApiService = new AllSportsApiService();