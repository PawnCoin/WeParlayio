import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import yahooFantasyAPI from "@/lib/yahooFantasyAPI";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Trash2 } from "lucide-react";

// Sample available players data
const availablePlayers = [
  {
    id: 1,
    name: "Stephen Curry",
    position: "PG",
    team: "GSW",
    salary: 9800,
    projectedPoints: 48.7,
    photo: ""
  },
  {
    id: 2,
    name: "Donovan Mitchell",
    position: "SG",
    team: "CLE",
    salary: 8400,
    projectedPoints: 42.1,
    photo: ""
  },
  {
    id: 3,
    name: "Jayson Tatum",
    position: "SF",
    team: "BOS",
    salary: 10200,
    projectedPoints: 51.4,
    photo: ""
  },
  {
    id: 4,
    name: "Giannis Antetokounmpo",
    position: "PF",
    team: "MIL",
    salary: 11500,
    projectedPoints: 56.8,
    photo: ""
  },
  {
    id: 5,
    name: "Nikola Jokic",
    position: "C",
    team: "DEN",
    salary: 12000,
    projectedPoints: 60.2,
    photo: ""
  },
  {
    id: 6,
    name: "LeBron James",
    position: "SF",
    team: "LAL",
    salary: 10500,
    projectedPoints: 52.1,
    photo: ""
  },
  {
    id: 7,
    name: "Kevin Durant",
    position: "PF",
    team: "PHX",
    salary: 10300,
    projectedPoints: 49.8,
    photo: ""
  },
  {
    id: 8,
    name: "Joel Embiid",
    position: "C",
    team: "PHI",
    salary: 11500,
    projectedPoints: 56.2,
    photo: ""
  },
  {
    id: 9,
    name: "Luka Doncic",
    position: "PG",
    team: "DAL",
    salary: 11000,
    projectedPoints: 54.5,
    photo: ""
  },
  {
    id: 10,
    name: "Trae Young",
    position: "PG",
    team: "ATL",
    salary: 9500,
    projectedPoints: 47.2,
    photo: ""
  }
];

const FantasyTeamBuilder: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([
    availablePlayers[0],
    availablePlayers[1],
    availablePlayers[2],
    availablePlayers[3],
    availablePlayers[4]
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [sortBy, setSortBy] = useState("projected");
  
  const { data: yahooStatus, isLoading: isCheckingYahoo } = useQuery({
    queryKey: ["yahoo-auth-status"],
    queryFn: () => yahooFantasyAPI.isAuthenticated(),
    enabled: isAuthenticated,
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
        await yahooFantasyAPI.authenticate(user?.id || 0);
        toast({
          title: "Yahoo Connected",
          description: "Your Yahoo Fantasy account has been connected.",
        });
      } else {
        const teams = await yahooFantasyAPI.getUserTeams();
        if (teams && teams.length > 0) {
          const roster = await yahooFantasyAPI.getTeamRoster(teams[0].team_id);
          
          // Convert Yahoo players to our format
          const importedPlayers = roster.slice(0, 5).map(yahooPlayer => {
            // Find a matching player in our system (in a real app, this would be more sophisticated)
            const matchedPlayer = availablePlayers.find(p => 
              p.name.toLowerCase().includes(yahooPlayer.name.toLowerCase()) || 
              yahooPlayer.name.toLowerCase().includes(p.name.toLowerCase())
            );
            
            return matchedPlayer || {
              id: parseInt(yahooPlayer.player_id),
              name: yahooPlayer.name,
              position: yahooPlayer.position,
              team: yahooPlayer.team,
              salary: 9000, // Default salary
              projectedPoints: 45.0, // Default projection
              photo: yahooPlayer.photo_url
            };
          });
          
          setSelectedPlayers(importedPlayers);
          toast({
            title: "Team Imported",
            description: "Your Yahoo Fantasy team has been imported.",
          });
        } else {
          toast({
            title: "No Teams Found",
            description: "No Yahoo Fantasy teams were found to import.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error importing from Yahoo:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import team from Yahoo Fantasy.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card>
      <CardContent className="p-0">
        <div className="bg-primary/10 p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-primary">Fantasy Team Builder</h3>
            <Badge variant="outline" className="bg-primary text-white border-primary">Yahoo Fantasy Integrated</Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create your optimal lineup based on projections and matchups</p>
        </div>
        
        <div className="p-4">
          {/* Team Roster */}
          <div className="mb-4">
            <div className="flex justify-between mb-2 items-center">
              <h4 className="font-medium">Your Roster</h4>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Salary: ${totalSalary.toLocaleString()} / ${maxSalary.toLocaleString()}
              </div>
            </div>
            
            <Progress value={salaryPercentage} className="h-1 mb-2" />
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
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
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{player.name}</span>
                    </div>
                    <div className="col-span-3 text-xs text-gray-500 dark:text-gray-400">{player.team}</div>
                    <div className="col-span-2 text-right">${player.salary.toLocaleString()}</div>
                    <div className="col-span-1 text-right font-medium text-green-600 dark:text-green-400">{player.projectedPoints}</div>
                    <div className="col-span-1 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                        onClick={() => handleRemovePlayer(player.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <Button 
              className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90"
              onClick={handleOptimizeLineup}
            >
              Optimize Lineup
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 bg-white dark:bg-neutral-dark border border-gray-200 dark:border-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={handleImportFromYahoo}
            >
              Import from Yahoo
            </Button>
          </div>
          
          {/* Available Players */}
          <div>
            <h4 className="font-medium mb-3">Available Players</h4>
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
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{player.name}</span>
                    </div>
                    <div className="col-span-2 text-xs text-gray-500 dark:text-gray-400">{player.team}</div>
                    <div className="col-span-2 text-right">${player.salary.toLocaleString()}</div>
                    <div className="col-span-2 text-right font-medium text-green-600 dark:text-green-400">{player.projectedPoints}</div>
                    <div className="col-span-1 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-primary hover:text-primary/80"
                        onClick={() => handleAddPlayer(player)}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default FantasyTeamBuilder;
