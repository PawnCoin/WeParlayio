/**
 * RapidAPI Service - Multiple Sports APIs Integration
 * Provides comprehensive sports data from RapidAPI marketplace
 */

interface RapidApiConfig {
  baseUrl: string;
  apiKey: string;
  endpoints: {
    odds: string;
    scores: string;
    fixtures: string;
    standings: string;
  };
}

export class RapidApiService {
  private apiKey: string;
  private baseHeaders: Record<string, string>;

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || '';
    this.baseHeaders = {
      'X-RapidAPI-Key': this.apiKey,
      'X-RapidAPI-Host': '',
      'Content-Type': 'application/json'
    };

    if (!this.apiKey) {
      console.warn('RAPIDAPI_KEY environment variable is not set');
    }
  }

  /**
   * API-Sports Integration (130+ football leagues worldwide)
   */
  async getFootballOdds(league: string, season: string = '2024'): Promise<any> {
    const headers = {
      ...this.baseHeaders,
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
    };

    try {
      const response = await fetch(
        `https://api-football-v1.p.rapidapi.com/v3/odds?league=${league}&season=${season}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Football API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformFootballOdds(data);
    } catch (error) {
      console.error('Error fetching football odds:', error);
      throw error;
    }
  }

  /**
   * API-Basketball Integration (90+ basketball leagues)
   */
  async getBasketballOdds(league: string, season: string = '2024-2025'): Promise<any> {
    const headers = {
      ...this.baseHeaders,
      'X-RapidAPI-Host': 'api-basketball-v1.p.rapidapi.com'
    };

    try {
      const response = await fetch(
        `https://api-basketball-v1.p.rapidapi.com/odds?league=${league}&season=${season}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Basketball API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformBasketballOdds(data);
    } catch (error) {
      console.error('Error fetching basketball odds:', error);
      throw error;
    }
  }

  /**
   * API-Baseball Integration (Major leagues worldwide)
   */
  async getBaseballOdds(league: string, season: string = '2024'): Promise<any> {
    const headers = {
      ...this.baseHeaders,
      'X-RapidAPI-Host': 'api-baseball-v1.p.rapidapi.com'
    };

    try {
      const response = await fetch(
        `https://api-baseball-v1.p.rapidapi.com/odds?league=${league}&season=${season}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Baseball API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformBaseballOdds(data);
    } catch (error) {
      console.error('Error fetching baseball odds:', error);
      throw error;
    }
  }

  /**
   * API-Hockey Integration (25+ hockey leagues)
   */
  async getHockeyOdds(league: string, season: string = '2024'): Promise<any> {
    const headers = {
      ...this.baseHeaders,
      'X-RapidAPI-Host': 'api-hockey-v1.p.rapidapi.com'
    };

    try {
      const response = await fetch(
        `https://api-hockey-v1.p.rapidapi.com/odds?league=${league}&season=${season}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Hockey API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformHockeyOdds(data);
    } catch (error) {
      console.error('Error fetching hockey odds:', error);
      throw error;
    }
  }

  /**
   * LiveScore API Integration (Multiple sports)
   */
  async getLiveScores(sport: string): Promise<any> {
    const headers = {
      ...this.baseHeaders,
      'X-RapidAPI-Host': 'livescore6.p.rapidapi.com'
    };

    try {
      const response = await fetch(
        `https://livescore6.p.rapidapi.com/matches/v2/list-live?Category=${sport}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`LiveScore API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformLiveScores(data, sport);
    } catch (error) {
      console.error('Error fetching live scores:', error);
      throw error;
    }
  }

  /**
   * ESPN API Integration (Comprehensive US sports)
   */
  async getESPNData(sport: string, league: string): Promise<any> {
    const headers = {
      ...this.baseHeaders,
      'X-RapidAPI-Host': 'espn-unofficial.p.rapidapi.com'
    };

    try {
      const response = await fetch(
        `https://espn-unofficial.p.rapidapi.com/${sport}/${league}/scores`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      return this.transformESPNData(data, sport);
    } catch (error) {
      console.error('Error fetching ESPN data:', error);
      throw error;
    }
  }

  /**
   * Get all available sports and leagues
   */
  async getAllSportsLeagues(): Promise<any> {
    const sportCategories = {
      football: {
        api: 'api-football-v1.p.rapidapi.com',
        leagues: [
          { id: 39, name: 'Premier League', country: 'England' },
          { id: 140, name: 'La Liga', country: 'Spain' },
          { id: 78, name: 'Bundesliga', country: 'Germany' },
          { id: 135, name: 'Serie A', country: 'Italy' },
          { id: 61, name: 'Ligue 1', country: 'France' },
          { id: 2, name: 'UEFA Champions League', country: 'World' },
          { id: 3, name: 'UEFA Europa League', country: 'World' },
          // Add 130+ more leagues
        ]
      },
      basketball: {
        api: 'api-basketball-v1.p.rapidapi.com',
        leagues: [
          { id: 12, name: 'NBA', country: 'USA' },
          { id: 120, name: 'NCAA', country: 'USA' },
          { id: 117, name: 'EuroLeague', country: 'Europe' },
          { id: 1, name: 'NBA G League', country: 'USA' },
          // Add 90+ more leagues
        ]
      },
      baseball: {
        api: 'api-baseball-v1.p.rapidapi.com',
        leagues: [
          { id: 1, name: 'MLB', country: 'USA' },
          { id: 2, name: 'NPB', country: 'Japan' },
          { id: 3, name: 'KBO', country: 'South Korea' },
          // Add more leagues
        ]
      },
      hockey: {
        api: 'api-hockey-v1.p.rapidapi.com',
        leagues: [
          { id: 57, name: 'NHL', country: 'USA' },
          { id: 1, name: 'KHL', country: 'Russia' },
          { id: 2, name: 'AHL', country: 'USA' },
          // Add 25+ more leagues
        ]
      }
    };

    return sportCategories;
  }

  /**
   * Transform football odds to unified format
   */
  private transformFootballOdds(data: any): any {
    if (!data.response) return [];

    return data.response.map((match: any) => ({
      id: `football_${match.fixture.id}`,
      sport_key: 'soccer',
      sport_title: 'Soccer',
      commence_time: match.fixture.date,
      home_team: match.teams.home.name,
      away_team: match.teams.away.name,
      league: match.league.name,
      country: match.league.country,
      bookmakers: match.bookmakers?.map((bookmaker: any) => ({
        key: bookmaker.name.toLowerCase().replace(/\s+/g, '_'),
        title: bookmaker.name,
        last_update: match.fixture.date,
        markets: bookmaker.bets?.map((bet: any) => ({
          key: bet.name === 'Match Winner' ? 'h2h' : 'totals',
          outcomes: bet.values?.map((value: any) => ({
            name: value.value,
            price: parseFloat(value.odd) || 2.0
          })) || []
        })) || []
      })) || []
    }));
  }

  /**
   * Transform basketball odds to unified format
   */
  private transformBasketballOdds(data: any): any {
    if (!data.response) return [];

    return data.response.map((match: any) => ({
      id: `basketball_${match.id}`,
      sport_key: 'basketball',
      sport_title: 'Basketball',
      commence_time: match.date,
      home_team: match.teams.home.name,
      away_team: match.teams.away.name,
      league: match.league.name,
      country: match.country.name,
      bookmakers: []
    }));
  }

  /**
   * Transform baseball odds to unified format
   */
  private transformBaseballOdds(data: any): any {
    if (!data.response) return [];

    return data.response.map((match: any) => ({
      id: `baseball_${match.id}`,
      sport_key: 'baseball',
      sport_title: 'Baseball',
      commence_time: match.date,
      home_team: match.teams.home.name,
      away_team: match.teams.away.name,
      league: match.league.name,
      country: match.country.name,
      bookmakers: []
    }));
  }

  /**
   * Transform hockey odds to unified format
   */
  private transformHockeyOdds(data: any): any {
    if (!data.response) return [];

    return data.response.map((match: any) => ({
      id: `hockey_${match.id}`,
      sport_key: 'ice_hockey',
      sport_title: 'Ice Hockey',
      commence_time: match.date,
      home_team: match.teams.home.name,
      away_team: match.teams.away.name,
      league: match.league.name,
      country: match.country.name,
      bookmakers: []
    }));
  }

  /**
   * Transform live scores to unified format
   */
  private transformLiveScores(data: any, sport: string): any {
    if (!data.Stages) return [];

    const matches = [];
    for (const stage of data.Stages) {
      if (stage.Events) {
        for (const event of stage.Events) {
          matches.push({
            id: `live_${event.Eid}`,
            sport_key: sport.toLowerCase(),
            sport_title: sport,
            commence_time: new Date(event.Esd * 1000).toISOString(),
            home_team: event.T1?.[0]?.Nm || 'TBD',
            away_team: event.T2?.[0]?.Nm || 'TBD',
            live: true,
            scores: {
              home: event.Tr1 || 0,
              away: event.Tr2 || 0
            }
          });
        }
      }
    }

    return matches;
  }

  /**
   * Transform ESPN data to unified format
   */
  private transformESPNData(data: any, sport: string): any {
    if (!data.events) return [];

    return data.events.map((event: any) => ({
      id: `espn_${event.id}`,
      sport_key: sport.toLowerCase(),
      sport_title: sport.toUpperCase(),
      commence_time: event.date,
      home_team: event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'home')?.team?.displayName || 'TBD',
      away_team: event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'away')?.team?.displayName || 'TBD',
      status: event.status?.type?.description || 'scheduled'
    }));
  }

  /**
   * Get comprehensive odds for all sports
   */
  async getComprehensiveOdds(): Promise<any> {
    const allOdds = [];
    
    try {
      // Fetch from multiple sources in parallel
      const [footballOdds, basketballOdds, baseballOdds, hockeyOdds] = await Promise.allSettled([
        this.getFootballOdds('39'), // Premier League
        this.getBasketballOdds('12'), // NBA
        this.getBaseballOdds('1'), // MLB
        this.getHockeyOdds('57') // NHL
      ]);

      if (footballOdds.status === 'fulfilled') {
        allOdds.push(...footballOdds.value);
      }
      if (basketballOdds.status === 'fulfilled') {
        allOdds.push(...basketballOdds.value);
      }
      if (baseballOdds.status === 'fulfilled') {
        allOdds.push(...baseballOdds.value);
      }
      if (hockeyOdds.status === 'fulfilled') {
        allOdds.push(...hockeyOdds.value);
      }

      return allOdds;
    } catch (error) {
      console.error('Error fetching comprehensive odds:', error);
      throw error;
    }
  }
}