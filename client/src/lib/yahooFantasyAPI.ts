import { apiRequest } from "@/lib/queryClient";

export interface YahooTeam {
  team_id: string;
  name: string;
  team_logo: string;
  team_stats: {
    wins: number;
    losses: number;
    ties: number;
    rank: number;
    points?: number;
    projected_points?: number;
  };
  league?: {
    league_id: string;
    name: string;
    season: string;
    scoring_type: string;
  };
}

export interface YahooPlayer {
  player_id: string;
  name: string;
  position: string;
  team: string;
  status: string;
  photo_url: string;
  salary?: number;
  projected_points?: number;
  stats: {
    points: number;
    assists: number;
    rebounds: number;
    threes?: number;
    steals?: number;
    blocks?: number;
    turnovers?: number;
    fg_pct?: number;
    ft_pct?: number;
    games_played?: number;
    minutes?: number;
  };
  last_update?: string;
  injury_status?: 'OK' | 'Questionable' | 'Doubtful' | 'Out' | 'IR' | '';
  matchup?: {
    opponent: string;
    date: string;
    home_away: 'home' | 'away';
    opponent_rank?: number;
  };
}

// Yahoo Fantasy Sports API client
const yahooFantasyAPI = {
  /**
   * Check if the user is authenticated with Yahoo
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const response = await apiRequest("GET", "/api/yahoo/status");
      const data = await response.json();
      return data.authenticated;
    } catch (error) {
      console.error("Error checking Yahoo authentication:", error);
      return false;
    }
  },
  
  /**
   * Authenticate with Yahoo Fantasy Sports
   */
  authenticate: async (): Promise<void> => {
    try {
      // Redirect to start the OAuth flow
      window.location.href = "/api/yahoo/auth";
    } catch (error) {
      console.error("Error authenticating with Yahoo:", error);
      throw error;
    }
  },
  
  /**
   * Get the user's Yahoo Fantasy teams
   */
  getUserTeams: async (): Promise<YahooTeam[]> => {
    try {
      const response = await apiRequest("GET", "/api/yahoo/teams");
      const teams = await response.json();
      return teams;
    } catch (error) {
      console.error("Error fetching Yahoo teams:", error);
      throw error;
    }
  },
  
  /**
   * Get a team's roster
   */
  getTeamRoster: async (teamKey: string): Promise<YahooPlayer[]> => {
    try {
      const response = await apiRequest("GET", `/api/yahoo/team/${teamKey}/roster`);
      const roster = await response.json();
      return roster;
    } catch (error) {
      console.error("Error fetching team roster:", error);
      throw error;
    }
  },
  
  /**
   * Get player stats
   */
  getPlayerStats: async (playerKey: string): Promise<YahooPlayer> => {
    try {
      const response = await apiRequest("GET", `/api/yahoo/player/${playerKey}/stats`);
      const player = await response.json();
      return player;
    } catch (error) {
      console.error("Error fetching player stats:", error);
      throw error;
    }
  },
  
  /**
   * Get league standings
   */
  getLeagueStandings: async (leagueKey: string): Promise<any> => {
    try {
      const response = await apiRequest("GET", `/api/yahoo/league/${leagueKey}/standings`);
      const standings = await response.json();
      return standings;
    } catch (error) {
      console.error("Error fetching league standings:", error);
      throw error;
    }
  },
  
  /**
   * Import a Yahoo team to our system
   */
  importTeam: async (yahooTeamKey: string, teamName?: string): Promise<any> => {
    try {
      const response = await apiRequest("POST", "/api/yahoo/import-team", {
        yahooTeamKey,
        teamName
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error importing Yahoo team:", error);
      throw error;
    }
  },
  
  /**
   * Disconnect from Yahoo Fantasy
   */
  disconnect: async (): Promise<void> => {
    try {
      await apiRequest("POST", "/api/yahoo/disconnect");
    } catch (error) {
      console.error("Error disconnecting from Yahoo:", error);
      throw error;
    }
  }
};

export default yahooFantasyAPI;