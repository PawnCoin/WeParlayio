/**
 * Real Yahoo Fantasy API Integration using OAuth 2.0
 * Connects to actual Yahoo Fantasy Sports API
 */

interface YahooOAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  expires_at: number;
}

interface YahooLeague {
  league_key: string;
  league_id: string;
  name: string;
  num_teams: number;
  scoring_type: string;
  current_week: number;
}

export class RealYahooApiService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private tokenStore = new Map<string, YahooOAuthTokens>();

  constructor() {
    this.clientId = process.env.YAHOO_CLIENT_ID || '';
    this.clientSecret = process.env.YAHOO_CLIENT_SECRET || '';
    // Use the correct Replit domain format
    const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'f7097b10-74b9-45ad-9152-e5c7329e5010-00-dwypxvoq2aso.worf.replit.dev';
    this.redirectUri = `https://${replitDomain}/api/yahoo-real/oauth/callback`;
    
    console.log('✅ Real Yahoo Fantasy API service initialized');
  }

  /**
   * Get OAuth 2.0 authorization URL
   */
  getAuthUrl(sessionId: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'fspt-r', // Fantasy Sports Read permission
      state: sessionId // Pass session ID as state for security
    });

    return `https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, sessionId: string): Promise<YahooOAuthTokens> {
    try {
      const response = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri
        })
      });

      if (!response.ok) {
        throw new Error(`Yahoo OAuth error: ${response.status} ${response.statusText}`);
      }

      const tokens: YahooOAuthTokens = await response.json();
      tokens.expires_at = Date.now() + (tokens.expires_in * 1000);
      
      // Store tokens for this session
      this.tokenStore.set(sessionId, tokens);
      
      console.log('✅ Yahoo OAuth tokens obtained successfully');
      return tokens;
    } catch (error) {
      console.error('Yahoo OAuth error:', error);
      throw error;
    }
  }

  /**
   * Get user's fantasy leagues
   */
  async getUserLeagues(sessionId: string): Promise<YahooLeague[]> {
    const tokens = this.tokenStore.get(sessionId);
    if (!tokens || this.isTokenExpired(tokens)) {
      throw new Error('Yahoo authentication required');
    }

    try {
      const response = await fetch(
        'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues?format=json',
        {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Yahoo API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Yahoo leagues retrieved successfully');
      
      return this.parseLeaguesResponse(data);
    } catch (error) {
      console.error('Yahoo leagues error:', error);
      throw error;
    }
  }

  /**
   * Get league details
   */
  async getLeagueDetails(leagueKey: string, sessionId: string): Promise<any> {
    const tokens = this.tokenStore.get(sessionId);
    if (!tokens || this.isTokenExpired(tokens)) {
      throw new Error('Yahoo authentication required');
    }

    try {
      const response = await fetch(
        `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}?format=json`,
        {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Yahoo API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Yahoo league ${leagueKey} details retrieved`);
      
      return this.parseLeagueDetails(data);
    } catch (error) {
      console.error('Yahoo league details error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(sessionId: string): boolean {
    const tokens = this.tokenStore.get(sessionId);
    return tokens ? !this.isTokenExpired(tokens) : false;
  }

  /**
   * Get authentication status
   */
  getAuthStatus(sessionId: string): { authenticated: boolean; expireTime?: number } {
    const tokens = this.tokenStore.get(sessionId);
    if (!tokens) {
      return { authenticated: false };
    }

    return {
      authenticated: !this.isTokenExpired(tokens),
      expireTime: tokens.expires_at
    };
  }

  // Private helper methods
  private isTokenExpired(tokens: YahooOAuthTokens): boolean {
    return Date.now() >= tokens.expires_at;
  }

  private parseLeaguesResponse(data: any): YahooLeague[] {
    try {
      const leagues = data?.fantasy_content?.users?.[0]?.user?.[1]?.games?.[0]?.game?.[1]?.leagues;
      if (!leagues) return [];

      return Object.values(leagues)
        .filter((item: any) => item?.league)
        .map((item: any) => {
          const league = item.league[0];
          return {
            league_key: league.league_key,
            league_id: league.league_id,
            name: league.name,
            num_teams: parseInt(league.num_teams),
            scoring_type: league.scoring_type,
            current_week: parseInt(league.current_week || '1')
          };
        });
    } catch (error) {
      console.error('Error parsing Yahoo leagues response:', error);
      return [];
    }
  }

  private parseTeamsResponse(data: any): any[] {
    try {
      const teams = data?.fantasy_content?.users?.[0]?.user?.[1]?.games?.[0]?.game?.[1]?.teams;
      if (!teams) return [];

      return Object.values(teams)
        .filter((item: any) => item?.team)
        .map((item: any) => {
          const team = item.team[0];
          const standings = team.team_standings?.[0];
          return {
            team_key: team.team_key,
            team_id: team.team_id,
            name: team.name,
            managers: team.managers?.map((m: any) => ({ nickname: m.manager?.nickname })) || [],
            wins: parseInt(standings?.outcome_totals?.wins || '0'),
            losses: parseInt(standings?.outcome_totals?.losses || '0'),
            ties: parseInt(standings?.outcome_totals?.ties || '0'),
            percentage: parseFloat(standings?.outcome_totals?.percentage || '0'),
            points_for: parseFloat(standings?.points_for || '0'),
            points_against: parseFloat(standings?.points_against || '0'),
            rank: parseInt(standings?.rank || '1')
          };
        });
    } catch (error) {
      console.error('Error parsing Yahoo teams response:', error);
      return [];
    }
  }

  private parsePlayersResponse(data: any): any[] {
    try {
      const players = data?.fantasy_content?.league?.[1]?.players;
      if (!players) return [];

      return Object.values(players)
        .filter((item: any) => item?.player)
        .map((item: any) => {
          const player = item.player[0];
          return {
            player_key: player.player_key,
            player_id: player.player_id,
            name: {
              full: player.name?.full || '',
              first: player.name?.first || '',
              last: player.name?.last || ''
            },
            editorial_team_abbr: player.editorial_team_abbr || '',
            display_position: player.display_positions?.[0]?.display_position || '',
            position_type: player.position_type || '',
            bye_weeks: player.bye_weeks || [],
            image_url: player.image_url || '',
            is_undroppable: player.is_undroppable === '1',
            ownership: {
              ownership_type: player.ownership?.ownership_type || 'free_agents',
              owner_team_key: player.ownership?.owner_team_key,
              owner_team_name: player.ownership?.owner_team_name
            },
            percent_owned: parseFloat(player.percent_owned?.value || '0'),
            fantasy_points: parseFloat(player.player_points?.total || '0'),
            projected_points: parseFloat(player.player_projected_points?.total || '0')
          };
        });
    } catch (error) {
      console.error('Error parsing Yahoo players response:', error);
      return [];
    }
  }

  private parseLeagueDetailsResponse(data: any): any {
    try {
      const league = data?.fantasy_content?.league?.[0];
      if (!league) return null;

      return {
        league_key: league.league_key,
        league_id: league.league_id,
        name: league.name,
        num_teams: parseInt(league.num_teams),
        scoring_type: league.scoring_type,
        current_week: parseInt(league.current_week || '1'),
        season: league.season,
        start_date: league.start_date,
        end_date: league.end_date,
        start_week: parseInt(league.start_week || '1'),
        end_week: parseInt(league.end_week || '17'),
        is_finished: league.is_finished === '1'
      };
    } catch (error) {
      console.error('Error parsing Yahoo league details:', error);
      return null;
    }
  }

  private parseLeagueDetails(data: any): any {
    try {
      const league = data?.fantasy_content?.league?.[0];
      if (!league) return null;

      return {
        league_key: league.league_key,
        league_id: league.league_id,
        name: league.name,
        num_teams: parseInt(league.num_teams),
        scoring_type: league.scoring_type,
        current_week: parseInt(league.current_week || '1'),
        season: league.season,
        start_date: league.start_date,
        end_date: league.end_date
      };
    } catch (error) {
      console.error('Error parsing Yahoo league details:', error);
      return null;
    }
  }
}

export const realYahooApiService = new RealYahooApiService();