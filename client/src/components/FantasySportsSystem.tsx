import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy,
  Users,
  DollarSign,
  Clock,
  Star,
  Plus,
  Minus,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

interface Player {
  id: number;
  name: string;
  team: string;
  position: string;
  salary: number;
  projection: number;
  value: number;
}

interface Contest {
  id: number;
  name: string;
  sport: string;
  entryFee: number;
  prizePool: number;
  maxEntries: number;
  currentEntries: number;
  salaryCapFactor: number;
  positions: string[];
  timeLeft: string;
}

export const FantasySportsSystem: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [remainingSalary, setRemainingSalary] = useState(50000);

  // Fetch available fantasy contests
  const { data: contests } = useQuery({
    queryKey: ["/api/fantasy/contests"],
    refetchInterval: 30000, // Update every 30 seconds
  });

  // Mock players data - replace with real ESPN/API data
  const availablePlayers: Player[] = [
    {
      id: 1,
      name: "LeBron James",
      team: "LAL",
      position: "SF",
      salary: 12000,
      projection: 52.5,
      value: 4.4
    },
    {
      id: 2,
      name: "Stephen Curry",
      team: "GSW", 
      position: "PG",
      salary: 11500,
      projection: 48.2,
      value: 4.2
    },
    {
      id: 3,
      name: "Giannis Antetokounmpo",
      team: "MIL",
      position: "PF",
      salary: 11800,
      projection: 55.1,
      value: 4.7
    },
    {
      id: 4,
      name: "Kevin Durant",
      team: "PHX",
      position: "SF",
      salary: 11200,
      projection: 46.8,
      value: 4.2
    },
    {
      id: 5,
      name: "Jayson Tatum",
      team: "BOS",
      position: "SF",
      salary: 10800,
      projection: 44.5,
      value: 4.1
    }
  ];

  const addPlayer = (player: Player) => {
    if (selectedPlayers.length >= 8) {
      toast({
        title: "Lineup Full",
        description: "Maximum 8 players allowed",
        variant: "destructive"
      });
      return;
    }

    if (remainingSalary < player.salary) {
      toast({
        title: "Insufficient Salary",
        description: `Need $${player.salary - remainingSalary} more`,
        variant: "destructive"
      });
      return;
    }

    setSelectedPlayers([...selectedPlayers, player]);
    setRemainingSalary(remainingSalary - player.salary);
    
    toast({
      title: "Player Added! ⭐",
      description: `${player.name} added to lineup`,
    });
  };

  const removePlayer = (playerId: number) => {
    const player = selectedPlayers.find(p => p.id === playerId);
    if (player) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
      setRemainingSalary(remainingSalary + player.salary);
      
      toast({
        title: "Player Removed",
        description: `${player.name} removed from lineup`,
      });
    }
  };

  const enterContest = async () => {
    if (selectedPlayers.length < 8) {
      toast({
        title: "Incomplete Lineup",
        description: "Need 8 players to enter contest",
        variant: "destructive"
      });
      return;
    }

    if (!selectedContest) {
      toast({
        title: "No Contest Selected",
        description: "Please select a contest first",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/fantasy/enter', {
        contestId: selectedContest.id,
        lineup: selectedPlayers.map(p => p.id),
        entryFee: selectedContest.entryFee
      });

      toast({
        title: "Contest Entered! 🏆",
        description: `Entered ${selectedContest.name} with your lineup`,
      });

      // Reset lineup
      setSelectedPlayers([]);
      setRemainingSalary(50000);
    } catch (error: any) {
      toast({
        title: "Entry Failed",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const totalProjection = selectedPlayers.reduce((sum, player) => sum + player.projection, 0);
  const salaryUsed = 50000 - remainingSalary;
  const salaryPercentage = (salaryUsed / 50000) * 100;

  return (
    <div className="space-y-6">
      {/* Contest Selection */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-600" />
            Fantasy Contests
            <Badge variant="outline">{contests?.length || 0} Available</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contests?.slice(0, 3).map((contest: Contest) => (
            <Card 
              key={contest.id} 
              className={`cursor-pointer border transition-all ${
                selectedContest?.id === contest.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
              onClick={() => setSelectedContest(contest)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{contest.name}</h4>
                    <Badge className="bg-green-600 text-white">
                      {contest.sport.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-500" />
                      <span>${contest.entryFee}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3 text-yellow-500" />
                      <span>${contest.prizePool.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-blue-500" />
                      <span>{contest.currentEntries}/{contest.maxEntries}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-orange-500" />
                      <span>2h 15m</span>
                    </div>
                  </div>
                  
                  <Progress 
                    value={(contest.currentEntries / contest.maxEntries) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          )) || (
            <div className="text-center py-8 text-muted-foreground">
              Loading fantasy contests...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lineup Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Pool */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Available Players
              <Badge variant="outline">NBA</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availablePlayers.map((player) => (
              <Card key={player.id} className="border border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{player.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {player.position}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {player.team}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Salary: ${player.salary.toLocaleString()}</span>
                        <span>Proj: {player.projection}</span>
                        <span>Value: {player.value}x</span>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => addPlayer(player)}
                      disabled={selectedPlayers.some(p => p.id === player.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Current Lineup */}
        <Card className="sticky top-4 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              My Lineup
              <Badge variant="outline">{selectedPlayers.length}/8</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Salary Cap */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Salary Used:</span>
                <span className="font-medium">
                  ${salaryUsed.toLocaleString()} / $50,000
                </span>
              </div>
              <Progress value={salaryPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Remaining: ${remainingSalary.toLocaleString()}
              </div>
            </div>

            {/* Projected Points */}
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Projected Points:</span>
                <span className="text-lg font-bold text-purple-600">
                  {totalProjection.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Selected Players */}
            <div className="space-y-2">
              {selectedPlayers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Add players to build your lineup
                </div>
              ) : (
                selectedPlayers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{player.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {player.position} • ${player.salary.toLocaleString()}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePlayer(player.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Enter Contest Button */}
            <Button 
              onClick={enterContest}
              disabled={selectedPlayers.length < 8 || !selectedContest}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {selectedContest ? (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Enter ${selectedContest.entryFee} Contest
                </>
              ) : (
                'Select Contest First'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};