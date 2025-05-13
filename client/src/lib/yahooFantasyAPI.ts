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

// Mock data for Yahoo Fantasy API
const mockTeamRoster: YahooPlayer[] = [
  {
    player_id: "1",
    name: "Stephen Curry",
    position: "PG",
    team: "GSW",
    status: "active",
    photo_url: "",
    salary: 9800,
    projected_points: 48.7,
    stats: { 
      points: 28.5, 
      assists: 6.3, 
      rebounds: 5.2,
      threes: 4.5,
      steals: 1.2,
      blocks: 0.4,
      turnovers: 2.7,
      fg_pct: 0.435,
      ft_pct: 0.916,
      games_played: 65,
      minutes: 34.5
    },
    last_update: new Date().toISOString(),
    injury_status: 'OK',
    matchup: {
      opponent: "LAL",
      date: "2025-05-14T19:30:00Z",
      home_away: "home",
      opponent_rank: 15
    }
  },
  {
    player_id: "2",
    name: "LeBron James",
    position: "SF",
    team: "LAL",
    status: "active",
    photo_url: "",
    salary: 10500,
    projected_points: 52.1,
    stats: { 
      points: 25.7, 
      assists: 7.9, 
      rebounds: 7.4,
      threes: 2.2,
      steals: 1.3,
      blocks: 0.9,
      turnovers: 3.2,
      fg_pct: 0.517,
      ft_pct: 0.735,
      games_played: 70,
      minutes: 35.2
    },
    last_update: new Date().toISOString(),
    injury_status: 'OK',
    matchup: {
      opponent: "GSW",
      date: "2025-05-14T19:30:00Z",
      home_away: "away",
      opponent_rank: 4
    }
  },
  {
    player_id: "3",
    name: "Giannis Antetokounmpo",
    position: "PF",
    team: "MIL",
    status: "active",
    photo_url: "",
    salary: 11500,
    projected_points: 56.8,
    stats: { 
      points: 29.9, 
      assists: 5.8, 
      rebounds: 11.6,
      threes: 0.8,
      steals: 1.1,
      blocks: 1.3,
      turnovers: 3.5,
      fg_pct: 0.583,
      ft_pct: 0.682,
      games_played: 68,
      minutes: 33.8
    },
    last_update: new Date().toISOString(),
    injury_status: 'OK',
    matchup: {
      opponent: "BOS",
      date: "2025-05-15T20:00:00Z",
      home_away: "home",
      opponent_rank: 1
    }
  },
  {
    player_id: "4",
    name: "Nikola Jokic",
    position: "C",
    team: "DEN",
    status: "active",
    photo_url: "",
    salary: 12000,
    projected_points: 60.2,
    stats: { 
      points: 26.8, 
      assists: 9.0, 
      rebounds: 13.5,
      threes: 1.2,
      steals: 1.4,
      blocks: 0.8,
      turnovers: 3.1,
      fg_pct: 0.566,
      ft_pct: 0.825,
      games_played: 72,
      minutes: 34.5
    },
    last_update: new Date().toISOString(),
    injury_status: 'OK',
    matchup: {
      opponent: "DAL",
      date: "2025-05-14T21:00:00Z",
      home_away: "home",
      opponent_rank: 6
    }
  },
  {
    player_id: "5",
    name: "Donovan Mitchell",
    position: "SG",
    team: "CLE",
    status: "active",
    photo_url: "",
    salary: 8400,
    projected_points: 42.1,
    stats: { 
      points: 27.1, 
      assists: 4.9, 
      rebounds: 4.2,
      threes: 3.6,
      steals: 1.8,
      blocks: 0.5,
      turnovers: 2.4,
      fg_pct: 0.458,
      ft_pct: 0.867,
      games_played: 64,
      minutes: 35.1
    },
    last_update: new Date().toISOString(),
    injury_status: 'Questionable',
    matchup: {
      opponent: "NYK",
      date: "2025-05-15T19:00:00Z",
      home_away: "away",
      opponent_rank: 5
    }
  }
];

const mockTeams: YahooTeam[] = [
  {
    team_id: "1",
    name: "WeParlay All-Stars",
    team_logo: "",
    team_stats: { 
      wins: 10, 
      losses: 5, 
      ties: 0, 
      rank: 3,
      points: 1280,
      projected_points: 154.2
    },
    league: {
      league_id: "101",
      name: "WeParlay Pro League",
      season: "2025",
      scoring_type: "H2H"
    }
  },
  {
    team_id: "2",
    name: "WeParlay Dream Team",
    team_logo: "",
    team_stats: { 
      wins: 12, 
      losses: 3, 
      ties: 0, 
      rank: 1,
      points: 1450,
      projected_points: 162.8
    },
    league: {
      league_id: "202",
      name: "WeParlay Elite League",
      season: "2025",
      scoring_type: "Roto"
    }
  }
];

// This would be a real Yahoo Fantasy Sports API implementation in production
// Here we're just simulating the interface
const yahooFantasyAPI = {
  isAuthenticated: async (): Promise<boolean> => {
    try {
      // In a real app, this would check if we have a valid Yahoo token
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return !!user.yahooIntegrationToken;
    } catch (error) {
      console.error("Error checking Yahoo authentication:", error);
      return false;
    }
  },
  
  authenticate: async (userId: number): Promise<void> => {
    try {
      // In a real app, this would redirect to Yahoo OAuth
      console.log("Authenticating with Yahoo Fantasy for user:", userId);
      
      // Mock successful authentication
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.yahooIntegrationToken = "mock_token";
      user.yahooIntegrationRefreshToken = "mock_refresh_token";
      user.yahooIntegrationExpiry = new Date(Date.now() + 3600000).toISOString();
      localStorage.setItem("user", JSON.stringify(user));
      
      // Update user in database
      await apiRequest("POST", `/api/users/${userId}/yahoo-integration`, {
        token: user.yahooIntegrationToken,
        refreshToken: user.yahooIntegrationRefreshToken,
        expiry: user.yahooIntegrationExpiry
      });
    } catch (error) {
      console.error("Error authenticating with Yahoo:", error);
      throw error;
    }
  },
  
  getUserTeams: async (): Promise<YahooTeam[]> => {
    try {
      // In a real app, this would fetch from Yahoo API
      return mockTeams;
    } catch (error) {
      console.error("Error fetching Yahoo teams:", error);
      throw error;
    }
  },
  
  getTeamRoster: async (teamId: string): Promise<YahooPlayer[]> => {
    try {
      // In a real app, this would fetch from Yahoo API based on teamId
      return mockTeamRoster;
    } catch (error) {
      console.error("Error fetching Yahoo team roster:", error);
      throw error;
    }
  },
  
  getPlayerStats: async (playerId: string): Promise<YahooPlayer> => {
    try {
      // In a real app, this would fetch detailed stats from Yahoo API
      const player = mockTeamRoster.find((p: YahooPlayer) => p.player_id === playerId);
      
      if (!player) {
        throw new Error("Player not found");
      }
      
      return player;
    } catch (error) {
      console.error("Error fetching player stats:", error);
      throw error;
    }
  },
  
  getLeagueStandings: async (leagueId: string): Promise<any> => {
    try {
      // In a real app, this would fetch league standings from Yahoo API
      return {
        league_id: leagueId,
        name: leagueId === "101" ? "WeParlay Pro League" : "WeParlay Elite League",
        teams: [
          { team_id: "1", name: "WeParlay All-Stars", rank: 3, record: "10-5-0", points: 1280 },
          { team_id: "2", name: "WeParlay Dream Team", rank: 1, record: "12-3-0", points: 1450 },
          { team_id: "3", name: "Dynasty Warriors", rank: 2, record: "11-4-0", points: 1320 },
          { team_id: "4", name: "Slam Dunkers", rank: 4, record: "9-6-0", points: 1240 },
          { team_id: "5", name: "Three-Point Kings", rank: 5, record: "7-8-0", points: 1150 },
          { team_id: "6", name: "Rebound Machines", rank: 6, record: "6-9-0", points: 1080 },
          { team_id: "7", name: "Fast Break", rank: 7, record: "5-10-0", points: 990 },
          { team_id: "8", name: "Free Throw Masters", rank: 8, record: "4-11-0", points: 950 },
        ]
      };
    } catch (error) {
      console.error("Error fetching league standings:", error);
      throw error;
    }
  },
  
  importYahooTeam: async (yahooTeamId: string, userId: number): Promise<any> => {
    try {
      // In a real app, this would:
      // 1. Get team data from Yahoo API
      // 2. Convert to our format
      // 3. Save in our database
      
      const roster = await yahooFantasyAPI.getTeamRoster(yahooTeamId);
      
      // Create fantasy team in our system
      const fantasyTeam = await apiRequest("POST", "/api/fantasy-teams", {
        userId,
        name: "Imported from Yahoo",
        sportId: 1, // Basketball
        yahooTeamId
      });
      
      return fantasyTeam.json();
    } catch (error) {
      console.error("Error importing Yahoo team:", error);
      throw error;
    }
  }
};

export default yahooFantasyAPI;
