/**
 * GRID API Service - Premium Sports Data Integration
 * Provides comprehensive sports coverage with real-time data
 * https://grid.ai/ - Sports Data API
 */

export class GridApiService {
  private baseUrl = 'https://api-football-v1.p.rapidapi.com';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GRID_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GRID_API_KEY not found - GRID API integration disabled');
    }
  }

  private async makeRequest(endpoint: string, params: any = {}): Promise<any> {
    if (!this.apiKey) {
      throw new Error('GRID API key not configured');
    }

    const url = new URL(endpoint, this.baseUrl);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key].toString());
      }
    });

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`GRID API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GRID API request failed:', error);
      throw error;
    }
  }

  /**
   * Get all available sports and leagues from GRID
   */
  async getSports(): Promise<any[]> {
    try {
      const data = await this.makeRequest('/v1/sports');
      return data.sports || [];
    } catch (error) {
      console.error('Error fetching GRID sports:', error);
      return [];
    }
  }

  /**
   * Get live matches across all sports
   */
  async getLiveMatches(): Promise<any[]> {
    try {
      const data = await this.makeRequest('/v1/matches/live');
      return this.formatMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching GRID live matches:', error);
      return [];
    }
  }

  /**
   * Get upcoming matches for next 7 days
   */
  async getUpcomingMatches(days: number = 7): Promise<any[]> {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      
      const data = await this.makeRequest('/v1/matches/upcoming', {
        end_date: endDate.toISOString().split('T')[0]
      });
      
      return this.formatMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching GRID upcoming matches:', error);
      return [];
    }
  }

  /**
   * Get matches by sport
   */
  async getMatchesBySport(sportKey: string): Promise<any[]> {
    try {
      const data = await this.makeRequest(`/v1/sports/${sportKey}/matches`);
      return this.formatMatches(data.matches || []);
    } catch (error) {
      console.error(`Error fetching GRID matches for ${sportKey}:`, error);
      return [];
    }
  }

  /**
   * Get live odds from GRID
   */
  async getLiveOdds(sportKey?: string): Promise<any[]> {
    try {
      const endpoint = sportKey 
        ? `/v1/sports/${sportKey}/odds` 
        : '/v1/odds/live';
      
      const data = await this.makeRequest(endpoint);
      return this.formatOdds(data.odds || []);
    } catch (error) {
      console.error('Error fetching GRID odds:', error);
      return [];
    }
  }

  /**
   * Get team statistics
   */
  async getTeamStats(teamId: string): Promise<any> {
    try {
      const data = await this.makeRequest(`/v1/teams/${teamId}/stats`);
      return data.stats || {};
    } catch (error) {
      console.error(`Error fetching team stats for ${teamId}:`, error);
      return {};
    }
  }

  /**
   * Get player statistics
   */
  async getPlayerStats(playerId: string): Promise<any> {
    try {
      const data = await this.makeRequest(`/v1/players/${playerId}/stats`);
      return data.stats || {};
    } catch (error) {
      console.error(`Error fetching player stats for ${playerId}:`, error);
      return {};
    }
  }

  /**
   * Get league standings
   */
  async getLeagueStandings(leagueId: string): Promise<any[]> {
    try {
      const data = await this.makeRequest(`/v1/leagues/${leagueId}/standings`);
      return data.standings || [];
    } catch (error) {
      console.error(`Error fetching standings for league ${leagueId}:`, error);
      return [];
    }
  }

  /**
   * Get comprehensive market data (betting markets)
   */
  async getMarketData(matchId: string): Promise<any[]> {
    try {
      const data = await this.makeRequest(`/v1/matches/${matchId}/markets`);
      return data.markets || [];
    } catch (error) {
      console.error(`Error fetching market data for match ${matchId}:`, error);
      return [];
    }
  }

  /**
   * Format matches for WeParlay compatibility
   */
  private formatMatches(matches: any[]): any[] {
    return matches.map(match => ({
      id: match.id,
      sport_key: match.sport?.key || 'unknown',
      sport_title: match.sport?.name || 'Unknown Sport',
      commence_time: match.start_time,
      home_team: match.home_team?.name || 'Home Team',
      away_team: match.away_team?.name || 'Away Team',
      home_team_logo: match.home_team?.logo_url,
      away_team_logo: match.away_team?.logo_url,
      bookmakers: this.formatBookmakers(match.odds || []),
      scores: match.scores || null,
      status: match.status || 'scheduled',
      venue: match.venue?.name,
      league: match.league?.name,
      season: match.season?.year,
      round: match.round,
      grid_match_id: match.id,
      last_update: match.updated_at
    }));
  }

  /**
   * Format odds for WeParlay compatibility
   */
  private formatOdds(odds: any[]): any[] {
    return odds.map(odd => ({
      match_id: odd.match_id,
      bookmaker: odd.bookmaker?.name || 'Unknown',
      market_type: odd.market?.type || 'unknown',
      selections: odd.selections?.map((selection: any) => ({
        name: selection.name,
        price: selection.price,
        point: selection.point || null
      })) || [],
      last_update: odd.updated_at
    }));
  }

  /**
   * Format bookmaker data
   */
  private formatBookmakers(odds: any[]): any[] {
    return odds.map(bookmaker => ({
      key: bookmaker.bookmaker?.key || 'unknown',
      title: bookmaker.bookmaker?.name || 'Unknown Bookmaker',
      markets: bookmaker.markets?.map((market: any) => ({
        key: market.type,
        outcomes: market.outcomes?.map((outcome: any) => ({
          name: outcome.name,
          price: outcome.price,
          point: outcome.point || null
        })) || []
      })) || []
    }));
  }

  /**
   * Get trending markets (most active betting markets)
   */
  async getTrendingMarkets(): Promise<any[]> {
    try {
      const data = await this.makeRequest('/v1/markets/trending');
      return data.markets || [];
    } catch (error) {
      console.error('Error fetching trending markets:', error);
      return [];
    }
  }

  /**
   * Get esports data from GRID
   */
  async getEsportsData(): Promise<any[]> {
    try {
      const data = await this.makeRequest('/v1/esports/matches');
      return this.formatMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching GRID esports data:', error);
      return [];
    }
  }

  /**
   * Get comprehensive sports coverage summary
   */
  async getSportsCoverage(): Promise<any> {
    try {
      const [sports, liveMatches, upcomingMatches] = await Promise.all([
        this.getSports(),
        this.getLiveMatches(),
        this.getUpcomingMatches()
      ]);

      return {
        total_sports: sports.length,
        live_matches: liveMatches.length,
        upcoming_matches: upcomingMatches.length,
        sports_available: sports.map(sport => ({
          id: sport.id,
          name: sport.name,
          key: sport.key,
          active_matches: sport.active_matches || 0
        })),
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting GRID sports coverage:', error);
      return {
        total_sports: 0,
        live_matches: 0,
        upcoming_matches: 0,
        sports_available: [],
        last_updated: new Date().toISOString()
      };
    }
  }
}