# WeParlay.io Code Highlights

This document contains key code snippets and implementation highlights from the WeParlay.io platform.

## Table of Contents
1. [Data Models](#data-models)
2. [Yahoo Fantasy API Integration](#yahoo-fantasy-api-integration)
3. [Fantasy Team Builder Component](#fantasy-team-builder-component)
4. [Betting Slip Integration](#betting-slip-integration)
5. [Odds API Integration](#odds-api-integration)

## Data Models

### Schema Definitions
```typescript
// Player model with fantasy sports integration
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  position: varchar("position", { length: 50 }).notNull(),
  teamId: integer("team_id").references(() => teams.id),
  salary: integer("salary"),
  projectedPoints: numeric("projected_points", { precision: 10, scale: 2 }),
  yahooPlayerId: varchar("yahoo_player_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fantasy Team model
export const fantasyTeams = pgTable("fantasy_teams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  sportId: integer("sport_id").references(() => sports.id).notNull(),
  salary: integer("salary").default(0),
  maxSalary: integer("max_salary").default(50000),
  yahooTeamId: varchar("yahoo_team_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

## Yahoo Fantasy API Integration

### YahooPlayer Interface
```typescript
// Enhanced Yahoo Fantasy API Player Interface
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

// Yahoo Team Interface
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
```

### Yahoo Fantasy API Implementation
```typescript
// Yahoo Fantasy API service implementation
const yahooFantasyAPI = {
  isAuthenticated: async (): Promise<boolean> => {
    try {
      // Check if we have a valid Yahoo token
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return !!user.yahooIntegrationToken;
    } catch (error) {
      console.error("Error checking Yahoo authentication:", error);
      return false;
    }
  },
  
  authenticate: async (userId: number): Promise<void> => {
    try {
      // In production, this would redirect to Yahoo OAuth
      console.log("Authenticating with Yahoo Fantasy for user:", userId);
      
      // Mock successful authentication for development
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
    // Get user's Yahoo Fantasy teams
    // In production, this would fetch from Yahoo API
    return mockTeams;
  },
  
  getTeamRoster: async (teamId: string): Promise<YahooPlayer[]> => {
    // Get roster for a specific team
    // In production, this would fetch from Yahoo API based on teamId
    return mockTeamRoster;
  },
  
  getPlayerStats: async (playerId: string): Promise<YahooPlayer> => {
    // Get detailed stats for a specific player
    const player = mockTeamRoster.find((p: YahooPlayer) => p.player_id === playerId);
    
    if (!player) {
      throw new Error("Player not found");
    }
    
    return player;
  },
  
  // Additional methods for Yahoo Fantasy integration
};
```

## Fantasy Team Builder Component

### FantasyPlayer Interface
```typescript
// Fantasy Player Interface for team builder
interface FantasyPlayer {
  id: number;
  name: string;
  position: string;
  team: string;
  salary: number;
  projectedPoints: number;
  photo?: string;
  stats?: {
    points: number;
    rebounds: number;
    assists: number;
    threes?: number;
    steals?: number;
    blocks?: number;
    turnovers?: number;
    fg_pct?: number;
    ft_pct?: number;
    games_played?: number;
    minutes?: number;
  };
  injury_status?: 'OK' | 'Questionable' | 'Doubtful' | 'Out' | 'IR' | '';
  matchup?: {
    opponent: string;
    date: string;
    home_away: 'home' | 'away';
    opponent_rank?: number;
  };
}
```

### FantasyTeamBuilder Component (Excerpt)
```tsx
const FantasyTeamBuilder: React.FC<FantasyTeamBuilderProps> = ({ 
  sportId = 1, // Default to basketball
  contestId,
  readOnly = false
}) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedPlayers, setSelectedPlayers] = useState<FantasyPlayer[]>([
    // Initial players
  ]);
  const [teamName, setTeamName] = useState("My WeParlay Team");
  const [activeTab, setActiveTab] = useState("build");
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [showProjections, setShowProjections] = useState(true);
  
  // Calculate team metrics
  const totalSalary = selectedPlayers.reduce((sum, player) => sum + player.salary, 0);
  const maxSalary = 50000;
  const salaryPercentage = (totalSalary / maxSalary) * 100;
  const totalProjectedPoints = selectedPlayers.reduce((sum, player) => sum + player.projectedPoints, 0);
  
  // Fetch Yahoo authentication status
  const { data: yahooStatus, isLoading: isCheckingYahoo } = useQuery({
    queryKey: ["yahoo-auth-status"],
    queryFn: () => yahooFantasyAPI.isAuthenticated(),
    enabled: isAuthenticated,
  });
  
  // Yahoo team import functionality
  const handleImportTeam = async (teamId: string) => {
    try {
      const roster = await yahooFantasyAPI.getTeamRoster(teamId);
      
      // Convert Yahoo players to our format
      const importedPlayers = roster.slice(0, 5).map(yahooPlayer => {
        // Find a matching player in our system
        const matchedPlayer = availablePlayers.find(p => 
          p.name.toLowerCase().includes(yahooPlayer.name.toLowerCase()) || 
          yahooPlayer.name.toLowerCase().includes(p.name.toLowerCase())
        );
        
        // Use matched player data or create a custom player if no match
        return matchedPlayer || {
          id: parseInt(yahooPlayer.player_id),
          name: yahooPlayer.name,
          position: yahooPlayer.position,
          team: yahooPlayer.team,
          salary: yahooPlayer.salary || 9000,
          projectedPoints: yahooPlayer.projected_points || 45.0,
          photo: yahooPlayer.photo_url,
          stats: yahooPlayer.stats,
          injury_status: yahooPlayer.injury_status,
          matchup: yahooPlayer.matchup
        };
      });
      
      setSelectedPlayers(importedPlayers);
      setActiveTab("build"); // Switch back to the builder tab
      
      toast({
        title: "Team Imported",
        description: "Your Yahoo Fantasy team has been successfully imported.",
      });
    } catch (error) {
      console.error("Error importing Yahoo team:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import team from Yahoo Fantasy.",
        variant: "destructive"
      });
    }
  };
  
  // Component UI with tabbed interface
  return (
    <Card className="w-full">
      <CardHeader className="bg-primary/10 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-primary flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            WeParlay Fantasy Team Builder
          </CardTitle>
          {yahooStatus && (
            <Badge variant="outline" className="bg-secondary text-white border-secondary">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Yahoo Fantasy Connected
            </Badge>
          )}
        </div>
        <CardDescription>
          Build your dream team and compete in WeParlay contests
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="build" value={activeTab} onValueChange={setActiveTab}>
          {/* Tab navigation */}
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="build">Team Builder</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="yahoo">Import</TabsTrigger>
            <TabsTrigger value="enter">Contests</TabsTrigger>
          </TabsList>
          
          {/* Team Builder Tab */}
          <TabsContent value="build">
            {/* Team building interface */}
          </TabsContent>
          
          {/* Stats Tab */}
          <TabsContent value="stats">
            {/* Player statistics visualization */}
          </TabsContent>
          
          {/* Yahoo Import Tab */}
          <TabsContent value="yahoo">
            {/* Yahoo Fantasy import interface */}
          </TabsContent>
          
          {/* Contests Tab */}
          <TabsContent value="enter">
            {/* Contest entry interface */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
```

## Betting Slip Integration

### Odds Interface
```typescript
export interface Odds {
  id: string;
  sportKey: string;
  sportTitle: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bookmakers: Bookmaker[];
}

export interface Bookmaker {
  key: string;
  title: string;
  lastUpdate: string;
  markets: Market[];
}

export interface Market {
  key: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number;
  point?: number;
}
```

### Betting Slip Component (Conceptual)
```tsx
const BettingSlip: React.FC = () => {
  const { user } = useAuth();
  const [selectedBets, setSelectedBets] = useState<Bet[]>([]);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betType, setBetType] = useState<'single' | 'parlay'>('single');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'BTC' | 'ETH' | 'SOL'>('USD');
  
  // Calculate potential payout based on odds and bet amount
  const calculatePotentialPayout = () => {
    if (betType === 'single') {
      // Calculate for single bets
      return selectedBets.map(bet => {
        const odds = bet.odds;
        return odds > 0 
          ? betAmount + (betAmount * (odds / 100)) 
          : betAmount + (betAmount / (Math.abs(odds) / 100));
      });
    } else {
      // Calculate for parlay
      const combinedOdds = selectedBets.reduce((total, bet) => {
        // Combine odds logic
        return total * (bet.odds > 0 
          ? 1 + (bet.odds / 100) 
          : 1 + (100 / Math.abs(bet.odds)));
      }, 1);
      
      return betAmount * combinedOdds;
    }
  };
  
  // Convert currency amounts for display
  const convertCurrency = (amount: number, currency: 'USD' | 'BTC' | 'ETH' | 'SOL') => {
    // Conversion rates would come from an API in production
    const rates = {
      BTC: 0.000023,
      ETH: 0.00035,
      SOL: 0.085
    };
    
    if (currency === 'USD') return `$${amount.toFixed(2)}`;
    
    return currency === 'BTC' 
      ? `₿${(amount * rates.BTC).toFixed(6)}` 
      : currency === 'ETH'
        ? `Ξ${(amount * rates.ETH).toFixed(5)}`
        : `◎${(amount * rates.SOL).toFixed(3)}`;
  };
  
  // Place bet function
  const placeBet = async () => {
    try {
      // API call to place bet
      const result = await apiRequest("POST", "/api/bets", {
        userId: user?.id,
        betType,
        bets: selectedBets,
        amount: betAmount,
        currency: selectedCurrency
      });
      
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <div className="betting-slip">
      {/* Betting slip UI */}
    </div>
  );
};
```

## Odds API Integration

### Odds API Service
```typescript
export class OddsApiService {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    // Get API key from environment
    this.apiKey = process.env.THE_ODDS_API_KEY || "";
    this.baseUrl = "https://api.the-odds-api.com/v4";
  }
  
  // Get odds for a specific sport
  async getOdds(sport: string, region: string = "us", markets: string = "h2h,spreads,totals"): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/sports/${sport}/odds?apiKey=${this.apiKey}&regions=${region}&markets=${markets}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error fetching odds:", error);
      throw error;
    }
  }
  
  // Get available sports
  async getSports(): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/sports?apiKey=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error fetching sports:", error);
      throw error;
    }
  }
  
  // Get scores for events
  async getScores(sport: string, daysFrom: number = 3): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/sports/${sport}/scores?apiKey=${this.apiKey}&daysFrom=${daysFrom}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error fetching scores:", error);
      throw error;
    }
  }
  
  // Get specific event data
  async getEvent(eventId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/events/${eventId}?apiKey=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  }
}
```

---

This document provides code highlights from the WeParlay.io platform. These snippets represent the core functionality and can be used as reference for future development.