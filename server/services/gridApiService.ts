/**
 * GRID API Service - Premium Esports and Gaming Data Integration
 * Provides comprehensive esports coverage with real-time data
 * https://grid.gg/ - Esports Data API via GraphQL
 */

export class GridApiService {
  private baseUrl = 'https://api-op.grid.gg/central-data/graphql';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GRID_API_KEY || '';
    if (!this.apiKey) {
      console.warn('GRID_API_KEY not found - GRID API integration disabled');
    }
  }

  private async makeGraphQLRequest(query: string, variables: any = {}): Promise<any> {
    if (!this.apiKey) {
      throw new Error('GRID API key not configured');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables
        }),
      });

      if (!response.ok) {
        throw new Error(`GRID API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      return data.data;
    } catch (error) {
      console.error('GRID API request failed:', error);
      throw error;
    }
  }

  /**
   * Get all available sports and leagues from GRID
   */
  async getSports(): Promise<any[]> {
    const query = `
      query GetSeries {
        allSeries(first: 50) {
          totalCount
          edges {
            node {
              id
              startTimeScheduled
              tournament {
                id
                name
              }
            }
          }
        }
      }
    `;

    try {
      const data = await this.makeGraphQLRequest(query);
      if (data && data.allSeries && data.allSeries.edges) {
        return this.formatSports(data.allSeries.edges);
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch sports from GRID:', error);
      return [];
    }
  }

  /**
   * Get live matches across all sports
   */
  async getLiveMatches(): Promise<any[]> {
    const query = `
      query GetLiveMatches {
        allMatches(filter: { status: RUNNING }) {
          id
          status
          scheduledAt
          beginAt
          endedAt
          name
          numberOfGames
          tournament {
            id
            name
            slug
            serie {
              id
              name
              videogame {
                id
                name
                slug
              }
            }
          }
          opponents {
            opponent {
              id
              name
              slug
              imageUrl
            }
          }
          games {
            id
            status
            position
            winner {
              id
              name
            }
          }
        }
      }
    `;

    try {
      const data = await this.makeGraphQLRequest(query);
      return this.formatMatches(data.allMatches?.edges || []);
    } catch (error) {
      console.error('Failed to fetch live matches from GRID:', error);
      return [];
    }
  }

  /**
   * Get upcoming matches for next 7 days using GraphQL
   */
  async getUpcomingMatches(days: number = 7): Promise<any[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    const query = `
      query GetUpcomingMatches($endDate: DateTime!) {
        allMatches(
          filter: { 
            status: SCHEDULED,
            beginAt_lte: $endDate
          },
          first: 100
        ) {
          edges {
            node {
              id
              status
              scheduledAt
              beginAt
              name
              tournament {
                id
                name
                slug
                serie {
                  id
                  name
                  slug
                  videogame {
                    id
                    name
                    slug
                  }
                }
              }
              opponents {
                opponent {
                  id
                  name
                  slug
                  imageUrl
                }
              }
            }
          }
        }
      }
    `;

    try {
      const data = await this.makeGraphQLRequest(query, { 
        endDate: endDate.toISOString() 
      });
      return this.formatMatches(data.allMatches?.edges || []);
    } catch (error) {
      console.error('Error fetching GRID upcoming matches:', error);
      return [];
    }
  }

  /**
   * Get all series (the 74,000+ esports series)
   */
  async getAllSeries(limit: number = 1000): Promise<any[]> {
    const query = `
      query GetAllSeries($limit: Int!) {
        allSeries(first: $limit) {
          totalCount
          edges {
            node {
              id
              name
              slug
              startTimeScheduled
              endTimeScheduled
              videogame {
                id
                name
                slug
              }
              tournaments {
                id
                name
                slug
              }
            }
          }
        }
      }
    `;

    try {
      const data = await this.makeGraphQLRequest(query, { limit });
      console.log(`📊 GRID API: Found ${data.allSeries?.totalCount || 0} total esports series`);
      return data.allSeries?.edges || [];
    } catch (error) {
      console.error('Error fetching all GRID series:', error);
      return [];
    }
  }

  /**
   * Get matches by sport using GraphQL
   */
  async getMatchesBySport(gameSlug: string): Promise<any[]> {
    const query = `
      query GetMatchesByGame($gameSlug: String!) {
        allMatches(
          filter: { 
            tournament: { 
              serie: { 
                videogame: { slug: $gameSlug } 
              } 
            } 
          },
          first: 50
        ) {
          edges {
            node {
              id
              status
              scheduledAt
              beginAt
              name
              tournament {
                id
                name
                slug
                serie {
                  id
                  name
                  videogame {
                    id
                    name
                    slug
                  }
                }
              }
              opponents {
                opponent {
                  id
                  name
                  slug
                  imageUrl
                }
              }
            }
          }
        }
      }
    `;

    try {
      const data = await this.makeGraphQLRequest(query, { gameSlug });
      return this.formatMatches(data.allMatches?.edges || []);
    } catch (error) {
      console.error(`Error fetching GRID matches for ${gameSlug}:`, error);
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
   * Format sports data for WeParlay compatibility
   */
  private formatSports(series: any[]): any[] {
    const uniqueSports = new Map();
    
    series.forEach(edge => {
      const tournamentName = edge.node.tournament?.name || 'Esports Tournament';
      const sportKey = 'esports';
      
      if (!uniqueSports.has(sportKey)) {
        uniqueSports.set(sportKey, {
          id: 'esports',
          name: 'Esports',
          key: sportKey,
          title: 'Esports Competitions',
          description: 'Professional esports tournaments and matches',
          active: true,
          has_outrights: false,
          tournaments: []
        });
      }
      
      uniqueSports.get(sportKey).tournaments.push({
        id: edge.node.id,
        name: tournamentName,
        start_time: edge.node.startTimeScheduled
      });
    });
    
    return Array.from(uniqueSports.values());
  }

  /**
   * Format matches for WeParlay compatibility (GraphQL format)
   */
  private formatMatches(matchEdges: any[]): any[] {
    return matchEdges.map(edge => {
      const match = edge.node;
      const opponents = match.opponents || [];
      
      return {
        id: match.id,
        sport_key: match.tournament?.serie?.videogame?.slug || 'esports',
        sport_title: match.tournament?.serie?.videogame?.name || 'Esports',
        game: match.tournament?.serie?.videogame?.name || 'Unknown Game',
        commence_time: match.beginAt || match.scheduledAt,
        home_team: opponents[0]?.opponent?.name || 'Team 1',
        away_team: opponents[1]?.opponent?.name || 'Team 2',
        home_team_logo: opponents[0]?.opponent?.imageUrl,
        away_team_logo: opponents[1]?.opponent?.imageUrl,
        tournament: match.tournament?.name || 'Unknown Tournament',
        serie: match.tournament?.serie?.name || 'Unknown Series',
        status: match.status?.toLowerCase() || 'scheduled',
        grid_match_id: match.id,
        grid_tournament_id: match.tournament?.id,
        grid_serie_id: match.tournament?.serie?.id,
        last_update: new Date().toISOString(),
        // Additional esports-specific data
        teams: opponents.map((opp: any) => ({
          id: opp.opponent?.id,
          name: opp.opponent?.name,
          slug: opp.opponent?.slug,
          logo: opp.opponent?.imageUrl
        }))
      };
    });
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