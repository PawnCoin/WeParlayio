/**
 * All Sports API + Pinnacle Odds Integration via RapidAPI
 * Provides comprehensive sports data and professional-grade odds
 */

interface AllSportsMatch {
  id: string;
  sport: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  status: string;
  league: string;
}

interface PinnacleOdds {
  match_id: string;
  bookmaker: string;
  markets: Array<{
    key: string;
    outcomes: Array<{
      name: string;
      price: number;
      point?: number;
    }>;
  }>;
}

export class AllSportsRapidApiService {
  private baseUrl = 'https://api-football-v1.p.rapidapi.com';
  private pinnacleUrl = 'https://pinnacle-odds.p.rapidapi.com';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || '';
    if (!this.apiKey) {
      console.warn('RAPIDAPI_KEY not found - All Sports + Pinnacle integration disabled');
    }
  }

  private async makeRequest(url: string, host: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('RapidAPI key required for All Sports + Pinnacle integration');
    }

    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': host,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  // Get live sports matches from All Sports API
  async getLiveMatches(sport?: string): Promise<AllSportsMatch[]> {
    try {
      const sportParam = sport || 'football';
      const url = `${this.baseUrl}/v3/fixtures?live=all&season=2024`;
      
      const data = await this.makeRequest(url, 'api-football-v1.p.rapidapi.com');
      
      return data.response?.map((match: any) => ({
        id: match.fixture.id.toString(),
        sport: sportParam,
        home_team: match.teams.home.name,
        away_team: match.teams.away.name,
        commence_time: match.fixture.date,
        status: match.fixture.status.short === 'LIVE' ? 'live' : 'scheduled',
        league: match.league.name
      })) || [];
    } catch (error) {
      console.error('Error fetching live matches:', error);
      return [];
    }
  }

  // Get upcoming matches
  async getUpcomingMatches(sport: string, days: number = 7): Promise<AllSportsMatch[]> {
    try {
      const today = new Date();
      const endDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
      
      const url = `${this.baseUrl}/v3/fixtures?season=2024&from=${today.toISOString().split('T')[0]}&to=${endDate.toISOString().split('T')[0]}`;
      
      const data = await this.makeRequest(url, 'api-football-v1.p.rapidapi.com');
      
      return data.response?.map((match: any) => ({
        id: match.fixture.id.toString(),
        sport,
        home_team: match.teams.home.name,
        away_team: match.teams.away.name,
        commence_time: match.fixture.date,
        status: 'scheduled',
        league: match.league.name
      })) || [];
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      return [];
    }
  }

  // Get Pinnacle odds for specific matches
  async getPinnacleOdds(matchIds: string[]): Promise<PinnacleOdds[]> {
    try {
      const oddsData: PinnacleOdds[] = [];
      
      for (const matchId of matchIds) {
        const url = `${this.pinnacleUrl}/v1/odds?match_id=${matchId}`;
        
        try {
          const data = await this.makeRequest(url, 'pinnacle-odds.p.rapidapi.com');
          
          if (data && data.markets) {
            oddsData.push({
              match_id: matchId,
              bookmaker: 'Pinnacle',
              markets: data.markets.map((market: any) => ({
                key: market.type,
                outcomes: market.outcomes.map((outcome: any) => ({
                  name: outcome.name,
                  price: outcome.price,
                  point: outcome.point
                }))
              }))
            });
          }
        } catch (matchError) {
          console.log(`No Pinnacle odds available for match ${matchId}`);
        }
      }
      
      return oddsData;
    } catch (error) {
      console.error('Error fetching Pinnacle odds:', error);
      return [];
    }
  }

  // Get comprehensive sports data with odds
  async getSportsWithOdds(sport: string) {
    try {
      // Get matches from All Sports API
      const [liveMatches, upcomingMatches] = await Promise.all([
        this.getLiveMatches(sport),
        this.getUpcomingMatches(sport)
      ]);

      const allMatches = [...liveMatches, ...upcomingMatches];
      const matchIds = allMatches.map(match => match.id);

      // Get Pinnacle odds for these matches
      const oddsData = await this.getPinnacleOdds(matchIds);

      // Combine match data with odds
      const enrichedMatches = allMatches.map(match => {
        const matchOdds = oddsData.find(odds => odds.match_id === match.id);
        
        return {
          ...match,
          bookmakers: matchOdds ? [{
            key: 'pinnacle',
            title: 'Pinnacle',
            markets: matchOdds.markets
          }] : []
        };
      });

      return {
        success: true,
        matches: enrichedMatches,
        source: 'all_sports_pinnacle',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getSportsWithOdds:', error);
      throw error;
    }
  }

  // Get NBA specific data
  async getNBAData() {
    try {
      // NBA-specific endpoint
      const url = `${this.baseUrl}/v1/games?season=2024&league=nba`;
      const data = await this.makeRequest(url, 'api-basketball-v1.p.rapidapi.com');
      
      return this.formatBasketballData(data);
    } catch (error) {
      console.error('Error fetching NBA data:', error);
      return { success: false, matches: [] };
    }
  }

  // Get NFL specific data  
  async getNFLData() {
    try {
      const url = `${this.baseUrl}/v1/games?season=2024&league=nfl`;
      const data = await this.makeRequest(url, 'api-american-football-v1.p.rapidapi.com');
      
      return this.formatAmericanFootballData(data);
    } catch (error) {
      console.error('Error fetching NFL data:', error);
      return { success: false, matches: [] };
    }
  }

  // Get MLB specific data
  async getMLBData() {
    try {
      const url = `${this.baseUrl}/v1/games?season=2024&league=mlb`;
      const data = await this.makeRequest(url, 'api-baseball-v1.p.rapidapi.com');
      
      return this.formatBaseballData(data);
    } catch (error) {
      console.error('Error fetching MLB data:', error);
      return { success: false, matches: [] };
    }
  }

  // Format basketball data
  private formatBasketballData(data: any) {
    return {
      success: true,
      matches: data.response?.map((game: any) => ({
        id: game.id.toString(),
        sport_key: 'basketball_nba',
        sport_title: 'NBA',
        home_team: game.teams.home.name,
        away_team: game.teams.visitors.name,
        commence_time: game.date.start,
        status: game.status.long
      })) || []
    };
  }

  // Format American football data
  private formatAmericanFootballData(data: any) {
    return {
      success: true,
      matches: data.response?.map((game: any) => ({
        id: game.id.toString(),
        sport_key: 'americanfootball_nfl',
        sport_title: 'NFL',
        home_team: game.teams.home.name,
        away_team: game.teams.away.name,
        commence_time: game.date.start,
        status: game.status.long
      })) || []
    };
  }

  // Format baseball data
  private formatBaseballData(data: any) {
    return {
      success: true,
      matches: data.response?.map((game: any) => ({
        id: game.id.toString(),
        sport_key: 'baseball_mlb',
        sport_title: 'MLB',
        home_team: game.teams.home.name,
        away_team: game.teams.away.name,
        commence_time: game.date.start,
        status: game.status.long
      })) || []
    };
  }

  // Get line movement data
  async getLineMovement(matchId: string) {
    try {
      const url = `${this.pinnacleUrl}/v1/line-movement?match_id=${matchId}`;
      const data = await this.makeRequest(url, 'pinnacle-odds.p.rapidapi.com');
      
      return {
        success: true,
        movements: data.movements?.map((movement: any) => ({
          timestamp: movement.timestamp,
          market: movement.market,
          from: movement.from_price,
          to: movement.to_price,
          direction: movement.to_price > movement.from_price ? 'up' : 'down'
        })) || []
      };
    } catch (error) {
      console.error('Error fetching line movement:', error);
      return { success: false, movements: [] };
    }
  }
}

export const allSportsRapidApiService = new AllSportsRapidApiService();