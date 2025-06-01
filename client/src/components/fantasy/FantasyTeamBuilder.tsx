import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import yahooFantasyAPI from "@/lib/yahooFantasyAPI";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Trash2, BarChart2, Share2, Download, Upload, RefreshCcw, AlertTriangle, Award, TrendingUp, CheckCircle2, Users, Lock, Info } from "lucide-react";
import { ESPNAssetService } from "@/lib/espnAssetService";

// Define a player type that matches the needs of the component
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

// Sample available players data
const availablePlayers: FantasyPlayer[] = [
  {
    id: 1,
    name: "Stephen Curry",
    position: "PG",
    team: "GSW",
    salary: 9800,
    projectedPoints: 48.7,
    photo: "",
    stats: {
      points: 28.5,
      rebounds: 5.2,
      assists: 6.3,
      threes: 4.5,
      steals: 1.2,
      blocks: 0.4
    },
    injury_status: 'OK',
    matchup: {
      opponent: "LAL",
      date: "2025-05-14T19:30:00Z",
      home_away: "home",
      opponent_rank: 15
    }
  },
  {
    id: 2,
    name: "Donovan Mitchell",
    position: "SG",
    team: "CLE",
    salary: 8400,
    projectedPoints: 42.1,
    photo: "",
    stats: {
      points: 27.1,
      rebounds: 4.2,
      assists: 4.9,
      threes: 3.6,
      steals: 1.8,
      blocks: 0.5
    },
    injury_status: 'Questionable',
    matchup: {
      opponent: "NYK",
      date: "2025-05-15T19:00:00Z",
      home_away: "away",
      opponent_rank: 5
    }
  },
  {
    id: 3,
    name: "Jayson Tatum",
    position: "SF",
    team: "BOS",
    salary: 10200,
    projectedPoints: 51.4,
    photo: "",
    stats: {
      points: 26.9,
      rebounds: 8.1,
      assists: 4.7,
      threes: 3.1,
      steals: 1.0,
      blocks: 0.7
    },
    injury_status: 'OK',
    matchup: {
      opponent: "MIL",
      date: "2025-05-15T20:00:00Z",
      home_away: "away",
      opponent_rank: 2
    }
  },
  {
    id: 4,
    name: "Giannis Antetokounmpo",
    position: "PF",
    team: "MIL",
    salary: 11500,
    projectedPoints: 56.8,
    photo: "",
    stats: {
      points: 29.9,
      rebounds: 11.6,
      assists: 5.8,
      threes: 0.8,
      steals: 1.1,
      blocks: 1.3
    },
    injury_status: 'OK',
    matchup: {
      opponent: "BOS",
      date: "2025-05-15T20:00:00Z",
      home_away: "home",
      opponent_rank: 1
    }
  },
  {
    id: 5,
    name: "Nikola Jokic",
    position: "C",
    team: "DEN",
    salary: 12000,
    projectedPoints: 60.2,
    photo: "",
    stats: {
      points: 26.8,
      rebounds: 13.5,
      assists: 9.0,
      threes: 1.2,
      steals: 1.4,
      blocks: 0.8
    },
    injury_status: 'OK',
    matchup: {
      opponent: "DAL",
      date: "2025-05-14T21:00:00Z",
      home_away: "home",
      opponent_rank: 6
    }
  },
  {
    id: 6,
    name: "LeBron James",
    position: "SF",
    team: "LAL",
    salary: 10500,
    projectedPoints: 52.1,
    photo: "",
    stats: {
      points: 25.7,
      rebounds: 7.4,
      assists: 7.9,
      threes: 2.2,
      steals: 1.3,
      blocks: 0.9
    },
    injury_status: 'OK',
    matchup: {
      opponent: "GSW",
      date: "2025-05-14T19:30:00Z",
      home_away: "away",
      opponent_rank: 4
    }
  },
  {
    id: 7,
    name: "Kevin Durant",
    position: "PF",
    team: "PHX",
    salary: 10300,
    projectedPoints: 49.8,
    photo: "",
    stats: {
      points: 28.3,
      rebounds: 6.6,
      assists: 5.1,
      threes: 2.0,
      steals: 0.7,
      blocks: 1.2
    }
  },
  {
    id: 8,
    name: "Joel Embiid",
    position: "C",
    team: "PHI",
    salary: 11500,
    projectedPoints: 56.2,
    photo: "",
    stats: {
      points: 30.6,
      rebounds: 11.2,
      assists: 4.2,
      threes: 1.0,
      steals: 1.0,
      blocks: 1.7
    }
  },
  {
    id: 9,
    name: "Luka Doncic",
    position: "PG",
    team: "DAL",
    salary: 11000,
    projectedPoints: 54.5,
    photo: "",
    stats: {
      points: 32.4,
      rebounds: 8.6,
      assists: 8.0,
      threes: 2.8,
      steals: 1.4,
      blocks: 0.5
    },
    matchup: {
      opponent: "DEN",
      date: "2025-05-14T21:00:00Z",
      home_away: "away",
      opponent_rank: 3
    }
  },
  {
    id: 10,
    name: "Trae Young",
    position: "PG",
    team: "ATL",
    salary: 9500,
    projectedPoints: 47.2,
    photo: "",
    stats: {
      points: 26.1,
      rebounds: 3.0,
      assists: 10.8,
      threes: 3.0,
      steals: 1.1,
      blocks: 0.2
    }
  }
];

interface FantasyTeamBuilderProps {
  sportId?: number;
  contestId?: string;
  readOnly?: boolean;
}

const FantasyTeamBuilder: React.FC<FantasyTeamBuilderProps> = ({ 
  sportId = 1, // Default to basketball
  contestId,
  readOnly = false
}) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedPlayers, setSelectedPlayers] = useState<FantasyPlayer[]>([
    availablePlayers[0],
    availablePlayers[1],
    availablePlayers[2],
    availablePlayers[3],
    availablePlayers[4]
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [sortBy, setSortBy] = useState("projected");
  const [activeTab, setActiveTab] = useState("build");
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [showProjections, setShowProjections] = useState(true);
  const [teamName, setTeamName] = useState("My WeParlay Team");
  const [selectedTeam, setSelectedTeam] = useState<string>("1"); // For Yahoo team import
  
  // Fetch Yahoo authentication status
  const { data: yahooStatus, isLoading: isCheckingYahoo } = useQuery({
    queryKey: ["yahoo-auth-status"],
    queryFn: () => yahooFantasyAPI.isAuthenticated(),
    enabled: isAuthenticated,
  });
  
  // Fetch Yahoo teams if authenticated
  const { data: yahooTeams, isLoading: isLoadingYahooTeams } = useQuery({
    queryKey: ["yahoo-teams"],
    queryFn: () => yahooFantasyAPI.getUserTeams(),
    enabled: isAuthenticated && !!yahooStatus,
  });
  
  // Calculate team metrics
  const totalSalary = selectedPlayers.reduce((sum, player) => sum + player.salary, 0);
  const maxSalary = 50000;
  const salaryPercentage = (totalSalary / maxSalary) * 100;
  const totalProjectedPoints = selectedPlayers.reduce((sum, player) => sum + player.projectedPoints, 0);
  
  // Filter and sort available players
  const filteredPlayers = availablePlayers.filter(player => {
    // Don't show already selected players
    if (selectedPlayers.some(p => p.id === player.id)) {
      return false;
    }
    
    // Apply position filter
    if (positionFilter !== "All" && player.position !== positionFilter) {
      return false;
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        player.name.toLowerCase().includes(query) ||
        player.team.toLowerCase().includes(query) ||
        player.position.toLowerCase().includes(query)
      );
    }
    
    return true;
  }).sort((a, b) => {
    // Sort based on selected criterion
    if (sortBy === "projected") {
      return b.projectedPoints - a.projectedPoints;
    } else if (sortBy === "salary") {
      return b.salary - a.salary;
    } else if (sortBy === "value") {
      // Value = projected points per $1000
      const aValue = a.projectedPoints / (a.salary / 1000);
      const bValue = b.projectedPoints / (b.salary / 1000);
      return bValue - aValue;
    }
    return 0;
  });
  
  const handleAddPlayer = (player: any) => {
    // Check if we already have 5 players
    if (selectedPlayers.length >= 5) {
      toast({
        title: "Team Full",
        description: "You can only have 5 players in your lineup. Remove a player first.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if adding this player would exceed the salary cap
    if (totalSalary + player.salary > maxSalary) {
      toast({
        title: "Salary Cap Exceeded",
        description: "Adding this player would exceed your salary cap.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedPlayers([...selectedPlayers, player]);
    toast({
      title: "Player Added",
      description: `${player.name} has been added to your team.`,
    });
  };
  
  const handleRemovePlayer = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter(player => player.id !== playerId));
    toast({
      title: "Player Removed",
      description: "Player has been removed from your team.",
    });
  };
  
  const handleOptimizeLineup = () => {
    // In a real app, this would use an algorithm to optimize the lineup based on projections and salary
    toast({
      title: "Lineup Optimized",
      description: "Your lineup has been optimized for maximum projected points.",
    });
  };
  
  // Connect to Yahoo Fantasy
  const handleYahooConnect = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to connect with Yahoo Fantasy.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await yahooFantasyAPI.authenticate(user?.id || 0);
      toast({
        title: "Yahoo Connected",
        description: "Your Yahoo Fantasy account has been successfully connected.",
      });
      
      // Switch to the Import tab
      setActiveTab("yahoo");
    } catch (error) {
      console.error("Error connecting to Yahoo Fantasy:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Yahoo Fantasy. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Import a specific team from Yahoo Fantasy
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
          salary: yahooPlayer.salary || 9000, // Use Yahoo salary if available
          projectedPoints: yahooPlayer.projected_points || 45.0,
          photo: yahooPlayer.photo_url,
          stats: yahooPlayer.stats,
          injury_status: yahooPlayer.injury_status,
          matchup: yahooPlayer.matchup
        };
      });
      
      // Set the team name based on Yahoo team
      const yahooTeam = yahooTeams?.find(t => t.team_id === teamId);
      if (yahooTeam) {
        setTeamName(`${yahooTeam.name} (Yahoo)`);
      }
      
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
        description: "Failed to import team from Yahoo Fantasy. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Import from Yahoo (either connect or import team based on authentication status)
  const handleImportFromYahoo = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to import from Yahoo Fantasy.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (!yahooStatus) {
        // If not connected to Yahoo, connect first
        await handleYahooConnect();
      } else {
        // If already connected, switch to the import tab
        setActiveTab("yahoo");
      }
    } catch (error) {
      console.error("Error with Yahoo Fantasy:", error);
      toast({
        title: "Operation Failed",
        description: "There was an issue with the Yahoo Fantasy integration.",
        variant: "destructive"
      });
    }
  };
  
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
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          Build your dream team and compete in WeParlay contests with real-time projections
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="build" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="build" className="text-xs sm:text-sm">
                <Users className="h-4 w-4 mr-1 hidden sm:inline" /> Team Builder
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-xs sm:text-sm">
                <BarChart2 className="h-4 w-4 mr-1 hidden sm:inline" /> Stats
              </TabsTrigger>
              <TabsTrigger value="yahoo" className="text-xs sm:text-sm">
                <Download className="h-4 w-4 mr-1 hidden sm:inline" /> Import
              </TabsTrigger>
              <TabsTrigger value="enter" className="text-xs sm:text-sm">
                <Award className="h-4 w-4 mr-1 hidden sm:inline" /> Contests
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* TEAM BUILDER TAB */}
          <TabsContent value="build" className="p-4 pt-2">
            {/* Team Name Input */}
            <div className="mb-4">
              <Input
                placeholder="Enter your team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="font-medium"
                disabled={readOnly}
              />
            </div>
            
            {/* Team Roster */}
            <div className="mb-4">
              <div className="flex justify-between mb-2 items-center">
                <h4 className="font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" /> Your Roster
                </h4>
                <div className="text-xs font-medium">
                  <span className={`${salaryPercentage > 95 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    Salary: ${totalSalary.toLocaleString()} / ${maxSalary.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <Progress 
                value={salaryPercentage} 
                className={`h-2 mb-3 ${
                  salaryPercentage > 95 
                    ? 'bg-red-100 dark:bg-red-900' 
                    : 'bg-secondary/20'
                }`} 
              />
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden mb-2">
                <div className="bg-gray-50 dark:bg-gray-800 p-2 text-xs grid grid-cols-12 font-medium text-gray-500 dark:text-gray-400">
                  <div className="col-span-1">POS</div>
                  <div className="col-span-4">PLAYER</div>
                  <div className="col-span-3">TEAM</div>
                  <div className="col-span-2 text-right">SALARY</div>
                  <div className="col-span-1 text-right">PROJ</div>
                  <div className="col-span-1"></div>
                </div>
                
                {selectedPlayers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No players selected. Add players from the list below.
                  </div>
                ) : (
                  selectedPlayers.map(player => (
                    <div key={player.id} className="p-2 text-sm grid grid-cols-12 items-center border-b last:border-b-0 border-gray-100 dark:border-gray-700">
                      <div className="col-span-1 font-medium">{player.position}</div>
                      <div className="col-span-4 flex items-center">
                        <Avatar className="w-6 h-6 rounded-full mr-2">
                          <AvatarImage 
                            src={ESPNAssetService.getPlayerImage(player.name, 'nba')} 
                            alt={player.name}
                            onError={(e) => {
                              // Fallback to ESPN generic player image if specific player not found
                              e.currentTarget.src = 'https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png&w=350&h=254';
                            }}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {player.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{player.name}</div>
                          {player.injury_status && player.injury_status !== 'OK' && (
                            <span className="text-xs text-red-500 font-medium">
                              {player.injury_status}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-3 text-xs text-gray-500 dark:text-gray-400">
                        {player.team}
                        {player.matchup && (
                          <span className="ml-1">
                            {player.matchup.home_away === 'home' ? 'vs' : '@'}
                            {player.matchup.opponent}
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 text-right">${player.salary.toLocaleString()}</div>
                      <div className="col-span-1 text-right font-medium text-green-600 dark:text-green-400">{player.projectedPoints}</div>
                      <div className="col-span-1 text-right">
                        {!readOnly && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                            onClick={() => handleRemovePlayer(player.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                <div className="bg-gray-50 dark:bg-gray-800 p-2 text-xs grid grid-cols-12 font-medium border-t border-gray-200 dark:border-gray-700">
                  <div className="col-span-1"></div>
                  <div className="col-span-4">TOTALS</div>
                  <div className="col-span-3"></div>
                  <div className="col-span-2 text-right">${totalSalary.toLocaleString()}</div>
                  <div className="col-span-1 text-right text-green-600 dark:text-green-400 font-bold">{totalProjectedPoints.toFixed(1)}</div>
                  <div className="col-span-1"></div>
                </div>
              </div>
              
              {salaryPercentage > 100 && (
                <div className="text-xs text-red-500 flex items-center mb-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span>Your team exceeds the salary cap of ${maxSalary.toLocaleString()}</span>
                </div>
              )}
              
              {!readOnly && (
                <div className="flex flex-col md:flex-row gap-3 mb-4 mt-3">
                  <Button 
                    className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 flex items-center justify-center"
                    onClick={handleOptimizeLineup}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Optimize Lineup
                  </Button>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1">
                          <Button 
                            variant="outline" 
                            className="w-full bg-white dark:bg-neutral-dark border border-gray-200 dark:border-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center"
                            onClick={handleImportFromYahoo}
                            disabled={readOnly}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Import from Yahoo
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {yahooStatus 
                          ? "Import your Yahoo Fantasy team roster" 
                          : "Connect your Yahoo Fantasy account to import your teams"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
            
            {!readOnly && (
              <>
                {/* Available Players */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Search className="h-4 w-4 mr-2" />
                    Available Players
                  </h4>
                  <div className="flex flex-col md:flex-row gap-2 mb-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input
                        placeholder="Search players..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={positionFilter} onValueChange={setPositionFilter}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Positions</SelectItem>
                        <SelectItem value="PG">PG</SelectItem>
                        <SelectItem value="SG">SG</SelectItem>
                        <SelectItem value="SF">SF</SelectItem>
                        <SelectItem value="PF">PF</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="projected">Projected Pts</SelectItem>
                        <SelectItem value="salary">Salary</SelectItem>
                        <SelectItem value="value">Value</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 text-xs grid grid-cols-12 font-medium text-gray-500 dark:text-gray-400">
                      <div className="col-span-1">POS</div>
                      <div className="col-span-4">PLAYER</div>
                      <div className="col-span-2">TEAM</div>
                      <div className="col-span-2 text-right">SALARY</div>
                      <div className="col-span-2 text-right">PROJ</div>
                      <div className="col-span-1 text-right">ADD</div>
                    </div>
                    
                    {filteredPlayers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No players match your filters
                      </div>
                    ) : (
                      filteredPlayers.slice(0, 6).map(player => (
                        <div key={player.id} className="p-2 text-sm grid grid-cols-12 items-center border-b last:border-b-0 border-gray-100 dark:border-gray-700">
                          <div className="col-span-1 font-medium">{player.position}</div>
                          <div className="col-span-4 flex items-center">
                            <Avatar className="w-6 h-6 rounded-full mr-2">
                              <AvatarImage 
                                src={ESPNAssetService.getPlayerImage(player.name, 'nba')} 
                                alt={player.name}
                                onError={(e) => {
                                  // Fallback to ESPN generic player image if specific player not found
                                  e.currentTarget.src = 'https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png&w=350&h=254';
                                }}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {player.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{player.name}</div>
                              {player.injury_status && player.injury_status !== 'OK' && (
                                <span className="text-xs text-red-500 font-medium">
                                  {player.injury_status}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center">
                            <img 
                              src={ESPNAssetService.getTeamLogo(player.team, 'nba')} 
                              alt={player.team}
                              className="w-4 h-4 mr-1"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{player.team}</span>
                          </div>
                          <div className="col-span-2 text-right">${player.salary.toLocaleString()}</div>
                          <div className="col-span-2 text-right font-medium text-green-600 dark:text-green-400">{player.projectedPoints}</div>
                          <div className="col-span-1 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-primary hover:text-primary/80"
                              onClick={() => handleAddPlayer(player)}
                              disabled={selectedPlayers.some(p => p.id === player.id)}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {filteredPlayers.length > 6 && (
                    <div className="mt-2 text-center">
                      <Button variant="link" className="text-primary text-sm">
                        Show More Players
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>
          
          {/* STATS TAB */}
          <TabsContent value="stats" className="p-4 pt-2">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-medium flex items-center">
                <BarChart2 className="h-4 w-4 mr-2" /> Team Statistics
              </h4>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="advanced-stats" className="text-xs">Advanced Stats</Label>
                  <Switch
                    id="advanced-stats"
                    checked={showAdvancedStats}
                    onCheckedChange={setShowAdvancedStats}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="projections" className="text-xs">Projections</Label>
                  <Switch
                    id="projections"
                    checked={showProjections}
                    onCheckedChange={setShowProjections}
                  />
                </div>
              </div>
            </div>
            
            {selectedPlayers.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="mb-2">No players selected</p>
                  <p className="text-sm">Add players to your team to see their statistics</p>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="text-xs font-medium">Player</TableHead>
                      <TableHead className="text-xs font-medium text-right">PPG</TableHead>
                      <TableHead className="text-xs font-medium text-right">RPG</TableHead>
                      <TableHead className="text-xs font-medium text-right">APG</TableHead>
                      {showAdvancedStats && (
                        <>
                          <TableHead className="text-xs font-medium text-right">3PM</TableHead>
                          <TableHead className="text-xs font-medium text-right">STL</TableHead>
                          <TableHead className="text-xs font-medium text-right">BLK</TableHead>
                        </>
                      )}
                      {showProjections && (
                        <TableHead className="text-xs font-medium text-right text-secondary">Proj</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPlayers.map(player => (
                      <TableRow key={player.id} className="border-b border-gray-100 dark:border-gray-700">
                        <TableCell className="py-2 text-sm">
                          <div className="flex items-center">
                            <Avatar className="w-6 h-6 rounded-full mr-2">
                              {player.photo ? (
                                <AvatarImage src={player.photo} alt={player.name} />
                              ) : (
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {player.name.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <div className="font-medium">{player.name}</div>
                              <div className="text-xs text-gray-500">{player.position} | {player.team}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-sm text-right">{player.stats?.points.toFixed(1)}</TableCell>
                        <TableCell className="py-2 text-sm text-right">{player.stats?.rebounds.toFixed(1)}</TableCell>
                        <TableCell className="py-2 text-sm text-right">{player.stats?.assists.toFixed(1)}</TableCell>
                        {showAdvancedStats && (
                          <>
                            <TableCell className="py-2 text-sm text-right">{player.stats?.threes?.toFixed(1) || '0.0'}</TableCell>
                            <TableCell className="py-2 text-sm text-right">{player.stats?.steals?.toFixed(1) || '0.0'}</TableCell>
                            <TableCell className="py-2 text-sm text-right">{player.stats?.blocks?.toFixed(1) || '0.0'}</TableCell>
                          </>
                        )}
                        {showProjections && (
                          <TableCell className="py-2 text-sm text-right font-medium text-secondary">
                            {player.projectedPoints.toFixed(1)}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          {/* YAHOO IMPORT TAB */}
          <TabsContent value="yahoo" className="p-4 pt-2">
            <div className="mb-4">
              <h4 className="font-medium flex items-center mb-3">
                <Download className="h-4 w-4 mr-2" /> Import from Yahoo Fantasy
              </h4>
              
              {!yahooStatus && !isCheckingYahoo ? (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">
                    <Lock className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="mb-2">Not connected to Yahoo Fantasy</p>
                    <p className="text-sm">Connect your Yahoo Fantasy account to import your teams and players</p>
                  </div>
                  
                  <Button
                    className="bg-primary text-white flex items-center mx-auto"
                    onClick={() => user && handleYahooConnect()}
                    disabled={!isAuthenticated}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Connect Yahoo Fantasy
                  </Button>
                  
                  {!isAuthenticated && (
                    <p className="text-xs text-amber-500 mt-2">
                      <AlertTriangle className="h-3 w-3 inline-block mr-1" />
                      You need to <Link href="/login"><span className="text-primary hover:underline cursor-pointer">log in</span></Link> to connect your Yahoo Fantasy account
                    </p>
                  )}
                </div>
              ) : isCheckingYahoo ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                    <div className="flex items-center text-green-700 dark:text-green-400 font-medium mb-1">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Yahoo Fantasy Connected
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      Your Yahoo Fantasy account is connected. You can now import your teams and players.
                    </p>
                  </div>
                  
                  {isLoadingYahooTeams ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : yahooTeams && yahooTeams.length > 0 ? (
                    <>
                      <div className="mb-3">
                        <Label htmlFor="yahoo-team">Select Yahoo Team</Label>
                        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                          <SelectTrigger id="yahoo-team" className="mt-1">
                            <SelectValue placeholder="Select a team" />
                          </SelectTrigger>
                          <SelectContent>
                            {yahooTeams.map(team => (
                              <SelectItem key={team.team_id} value={team.team_id}>
                                {team.name} ({team.league?.name})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectedTeam && (
                        <Button
                          className="bg-primary text-white w-full flex items-center justify-center"
                          onClick={() => handleImportTeam(selectedTeam)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Import Selected Team
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">No Yahoo Fantasy teams found</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
          
          {/* CONTESTS TAB */}
          <TabsContent value="enter" className="p-4 pt-2">
            <div className="mb-4">
              <h4 className="font-medium flex items-center mb-3">
                <Award className="h-4 w-4 mr-2" /> Available Contests
              </h4>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                {salaryPercentage > 100 ? (
                  <div className="text-red-500 mb-4">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-3" />
                    <p className="mb-2 font-medium">Salary Cap Exceeded</p>
                    <p className="text-sm">Your team exceeds the salary cap of ${maxSalary.toLocaleString()}. You need to adjust your roster before entering contests.</p>
                  </div>
                ) : selectedPlayers.length < 5 ? (
                  <div className="text-amber-500 mb-4">
                    <Info className="h-12 w-12 mx-auto mb-3" />
                    <p className="mb-2 font-medium">Incomplete Roster</p>
                    <p className="text-sm">You need to select 5 players to complete your team and enter contests.</p>
                  </div>
                ) : (
                  <>
                    <div className="text-green-600 dark:text-green-400 mb-4">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-3" />
                      <p className="mb-2 font-medium">Team Ready!</p>
                      <p className="text-sm">Your team is complete and ready to enter contests.</p>
                    </div>
                    
                    <Button
                      className="bg-secondary text-white flex items-center mx-auto"
                      onClick={() => {
                        toast({
                          title: "Team Entered",
                          description: `${teamName} has been entered into contests successfully!`,
                        });
                      }}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Enter Daily Contests
                    </Button>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 pb-4 px-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
        <div>
          <span>Projections updated: {new Date().toLocaleDateString()}</span>
        </div>
        <div>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <Share2 className="h-3 w-3 mr-1" /> Share Team
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FantasyTeamBuilder;
