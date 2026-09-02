import fetch from 'node-fetch';

export interface YahooFantasyPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  projectedPoints: number;
  averagePoints: number;
  lastWeekPoints: number;
  status: 'active' | 'injured' | 'questionable' | 'out';
  ownership: number;
  salary?: number;
}

export interface YahooFantasyLeague {
  id: string;
  name: string;
  sport: string;
  season: string;
  totalTeams: number;
  currentWeek: number;
  isActive: boolean;
  leagueType: 'public' | 'private';
  scoringType: 'standard' | 'ppr' | 'half_ppr';
}

export interface YahooFantasyTeam {
  id: string;
  name: string;
  logoUrl?: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  rank: number;
  ownerName: string;
  roster: YahooFantasyPlayer[];
}

export class YahooFantasyService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.login.yahoo.com/oauth2/request_auth';
  
  constructor() {
    this.apiKey = process.env.YAHOO_CLIENT_ID || 'demo_key';
    this.apiSecret = process.env.YAHOO_CLIENT_SECRET || 'demo_secret';
  }

  async getLeagues(userToken?: string): Promise<YahooFantasyLeague[]> {
    try {
      if (!userToken && process.env.NODE_ENV === 'development') {
        // Return mock data for development
        return [
          {
            id: 'yahoo_league_001',
            name: 'Championship Dynasty League',
            sport: 'nfl',
            season: '2024',
            totalTeams: 12,
            currentWeek: 8,
            isActive: true,
            leagueType: 'private',
            scoringType: 'ppr'
          },
          {
            id: 'yahoo_league_002',
            name: 'Public Fantasy Championship',
            sport: 'nfl',
            season: '2024',
            totalTeams: 10,
            currentWeek: 8,
            isActive: true,
            leagueType: 'public',
            scoringType: 'standard'
          }
        ];
      }

      const response = await fetch(`https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl/leagues`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Yahoo API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseLeaguesData(data);
    } catch (error) {
      console.error('Error fetching Yahoo Fantasy leagues:', error);
      throw error;
    }
  }

  async getTeams(leagueId: string, userToken?: string): Promise<YahooFantasyTeam[]> {
    try {
      if (!userToken && process.env.NODE_ENV === 'development') {
        return [
          {
            id: 'yahoo_team_001',
            name: 'Dynasty Dominators',
            wins: 6,
            losses: 2,
            ties: 0,
            pointsFor: 1245.8,
            pointsAgainst: 1089.2,
            rank: 1,
            ownerName: 'WeParlay User',
            roster: await this.getTopPlayers('nfl', userToken)
          },
          {
            id: 'yahoo_team_002',
            name: 'Championship Squad',
            wins: 5,
            losses: 3,
            ties: 0,
            pointsFor: 1198.4,
            pointsAgainst: 1156.7,
            rank: 3,
            ownerName: 'Rival Manager',
            roster: []
          }
        ];
      }

      const response = await fetch(`https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueId}/teams`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Yahoo API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseTeamsData(data);
    } catch (error) {
      console.error('Error fetching Yahoo Fantasy teams:', error);
      throw error;
    }
  }

  async getTopPlayers(sport: string = 'nfl', userToken?: string): Promise<YahooFantasyPlayer[]> {
    try {
      if (!userToken && process.env.NODE_ENV === 'development') {
        return [
          {
            id: 'yahoo_player_001',
            name: 'Josh Allen',
            position: 'QB',
            team: 'BUF',
            projectedPoints: 24.5,
            averagePoints: 23.8,
            lastWeekPoints: 28.2,
            status: 'active',
            ownership: 98.5,
            salary: 8900
          },
          {
            id: 'yahoo_player_002',
            name: 'Christian McCaffrey',
            position: 'RB',
            team: 'SF',
            projectedPoints: 22.1,
            averagePoints: 21.4,
            lastWeekPoints: 19.8,
            status: 'active',
            ownership: 97.2,
            salary: 8700
          },
          {
            id: 'yahoo_player_003',
            name: 'Tyreek Hill',
            position: 'WR',
            team: 'MIA',
            projectedPoints: 19.8,
            averagePoints: 18.9,
            lastWeekPoints: 22.4,
            status: 'active',
            ownership: 94.1,
            salary: 8200
          },
          {
            id: 'yahoo_player_004',
            name: 'Travis Kelce',
            position: 'TE',
            team: 'KC',
            projectedPoints: 16.2,
            averagePoints: 15.8,
            lastWeekPoints: 18.1,
            status: 'active',
            ownership: 91.7,
            salary: 7400
          },
          {
            id: 'yahoo_player_005',
            name: 'Justin Tucker',
            position: 'K',
            team: 'BAL',
            projectedPoints: 9.4,
            averagePoints: 8.9,
            lastWeekPoints: 11.0,
            status: 'active',
            ownership: 76.3,
            salary: 5100
          }
        ];
      }

      const response = await fetch(`https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/players;status=A;start=0;count=50`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Yahoo API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parsePlayersData(data);
    } catch (error) {
      console.error('Error fetching Yahoo Fantasy players:', error);
      throw error;
    }
  }

  async getPlayerStats(playerId: string, userToken?: string): Promise<any> {
    try {
      const response = await fetch(`https://fantasysports.yahooapis.com/fantasy/v2/player/${playerId}/stats`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Yahoo API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Yahoo player stats:', error);
      throw error;
    }
  }

  private parseLeaguesData(data: any): YahooFantasyLeague[] {
    // Parse Yahoo API response format
    return data.fantasy_content?.users?.[0]?.user?.[1]?.games?.[0]?.game?.[1]?.leagues || [];
  }

  private parseTeamsData(data: any): YahooFantasyTeam[] {
    // Parse Yahoo API response format
    return data.fantasy_content?.league?.[1]?.teams || [];
  }

  private parsePlayersData(data: any): YahooFantasyPlayer[] {
    // Parse Yahoo API response format
    return data.fantasy_content?.game?.[1]?.players || [];
  }

  // OAuth helpers
  generateAuthUrl(redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: this.apiKey,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: 'yahoo_fantasy_auth'
    });

    return `${this.baseUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
    try {
      const response = await fetch('https://api.login.yahoo.com/oauth2/request_auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri
        })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error exchanging Yahoo authorization code:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
}

export const yahooFantasyService = new YahooFantasyService();
