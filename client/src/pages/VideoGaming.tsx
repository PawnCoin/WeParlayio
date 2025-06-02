import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Settings, 
  TrendingUp, 
  BarChart2,
  Sparkles,
  Plus,
  Clock,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface GameBet {
  id: string;
  gameName: string;
  description: string;
  amount: number;
  odds: number;
  createdBy: string;
  status: 'open' | 'matched' | 'settled';
  createdAt: string;
  players?: string[];
}

interface LeaderboardPlayer {
  rank: number;
  name: string;
  winRate: string;
  profit: string;
  game: string;
  level: number;
}

const VideoGaming: React.FC = () => {
  const { toast } = useToast();
  const [selectedGame, setSelectedGame] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [betDescription, setBetDescription] = useState('');
  const [customOdds, setCustomOdds] = useState('');

  // Fetch active game bets
  const { data: gameBets = [], isLoading: betsLoading } = useQuery({
    queryKey: ['/api/gaming/bets']
  });

  // Fetch leaderboard data
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['/api/gaming/leaderboard']
  });

  // Create new game bet mutation
  const createBetMutation = useMutation({
    mutationFn: async (betData: any) => {
      return await apiRequest('POST', '/api/gaming/create-bet', betData);
    },
    onSuccess: () => {
      toast({
        title: "Bet Created",
        description: "Your game bet has been created successfully!",
      });
      // Reset form
      setSelectedGame('');
      setBetAmount('');
      setBetDescription('');
      setCustomOdds('');
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['/api/gaming/bets'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create bet",
        variant: "destructive",
      });
    }
  });

  // Join bet mutation
  const joinBetMutation = useMutation({
    mutationFn: async (betId: string) => {
      return await apiRequest('POST', `/api/gaming/join-bet/${betId}`);
    },
    onSuccess: () => {
      toast({
        title: "Bet Joined",
        description: "You've successfully joined the bet!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gaming/bets'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join bet",
        variant: "destructive",
      });
    }
  });

  const handleCreateBet = () => {
    if (!selectedGame || !betAmount || !betDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createBetMutation.mutate({
      gameName: selectedGame,
      description: betDescription,
      amount: parseFloat(betAmount),
      odds: customOdds ? parseFloat(customOdds) : 2.0
    });
  };

  const popularGames = [
    'League of Legends',
    'Counter-Strike 2',
    'Valorant',
    'Dota 2',
    'Fortnite',
    'Call of Duty',
    'Apex Legends',
    'Overwatch 2',
    'Rocket League',
    'FIFA 24'
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Gamepad2 className="mr-2 h-8 w-8" />
            Video Game Betting
          </h1>
          <p className="text-muted-foreground">
            Create custom bets on any game, any matchup
          </p>
        </div>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="create" className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Create Bet
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> Active Bets
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-1">
            <Trophy className="h-4 w-4" /> Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                Create New Game Bet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="game-select">Select Game</Label>
                    <Select value={selectedGame} onValueChange={setSelectedGame}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a game" />
                      </SelectTrigger>
                      <SelectContent>
                        {popularGames.map((game) => (
                          <SelectItem key={game} value={game}>
                            {game}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bet-amount">Bet Amount (WeParlay Cash)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="bet-amount"
                        type="number"
                        placeholder="0.00"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="custom-odds">Custom Odds (Optional)</Label>
                    <Input
                      id="custom-odds"
                      type="number"
                      step="0.1"
                      placeholder="2.0"
                      value={customOdds}
                      onChange={(e) => setCustomOdds(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bet-description">Bet Description</Label>
                    <Textarea
                      id="bet-description"
                      placeholder="Describe your bet (e.g., 'I'll win the next ranked match' or 'My team will get first blood')"
                      value={betDescription}
                      onChange={(e) => setBetDescription(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Bet Preview</h4>
                    <p className="text-sm text-muted-foreground mb-1">
                      Game: {selectedGame || 'Not selected'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      Amount: {betAmount ? `$${betAmount}` : '$0.00'} WeParlay Cash
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Potential Win: {betAmount && customOdds 
                        ? `$${(parseFloat(betAmount) * parseFloat(customOdds)).toFixed(2)}` 
                        : '$0.00'}
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCreateBet}
                disabled={createBetMutation.isPending}
                className="w-full"
              >
                {createBetMutation.isPending ? 'Creating...' : 'Create Bet'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Active Game Bets</h2>
              <Badge variant="outline">{gameBets.length} Active</Badge>
            </div>

            {betsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : gameBets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gameBets.map((bet: GameBet) => (
                  <Card key={bet.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{bet.gameName}</Badge>
                        <Badge variant={bet.status === 'open' ? 'default' : 'outline'}>
                          {bet.status}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold mb-2 line-clamp-2">{bet.description}</h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="font-medium">${bet.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Odds:</span>
                          <span className="font-medium">{bet.odds}x</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Creator:</span>
                          <span className="font-medium">{bet.createdBy}</span>
                        </div>
                      </div>

                      {bet.status === 'open' && (
                        <Button 
                          onClick={() => joinBetMutation.mutate(bet.id)}
                          disabled={joinBetMutation.isPending}
                          className="w-full"
                          size="sm"
                        >
                          Join Bet
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Gamepad2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No active game bets available</p>
                  <p className="text-sm text-gray-500 mt-2">Create the first bet to get started!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <div className="bg-card rounded-lg shadow border border-muted p-6">
            <div className="flex items-center mb-6">
              <Trophy className="h-6 w-6 mr-3 text-yellow-500" />
              <h2 className="text-2xl font-bold">Video Game Betting Leaderboard</h2>
            </div>

            {leaderboardLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-muted">
                      <th className="py-3 px-2 text-left">Rank</th>
                      <th className="py-3 px-2 text-left">Player</th>
                      <th className="py-3 px-2 text-left">Win Rate</th>
                      <th className="py-3 px-2 text-left">Profit</th>
                      <th className="py-3 px-2 text-left">Top Game</th>
                      <th className="py-3 px-2 text-left">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.length > 0 ? leaderboard.map((player: LeaderboardPlayer, index: number) => (
                      <tr key={index} className="border-b border-muted">
                        <td className="py-4 px-2">
                          {player.rank === 1 ? (
                            <div className="flex items-center">
                              <span className="text-yellow-500 font-bold">{player.rank}</span>
                              <Sparkles className="h-4 w-4 ml-1 text-yellow-500" />
                            </div>
                          ) : (
                            <span className={player.rank <= 3 ? "font-bold" : ""}>{player.rank}</span>
                          )}
                        </td>
                        <td className="py-4 px-2">{player.name}</td>
                        <td className="py-4 px-2 text-green-500">{player.winRate}</td>
                        <td className="py-4 px-2 text-green-500">{player.profit}</td>
                        <td className="py-4 px-2">{player.game}</td>
                        <td className="py-4 px-2">
                          <div className="flex items-center">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                              Lvl {player.level}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      // Fallback data when API returns empty
                      [
                        { rank: 1, name: "ProGamer123", winRate: "68%", profit: "+$12,450", game: "League of Legends", level: 42 },
                        { rank: 2, name: "CryptoKing", winRate: "62%", profit: "+$10,820", game: "CS:GO", level: 38 },
                        { rank: 3, name: "GameQueen", winRate: "59%", profit: "+$8,740", game: "Valorant", level: 35 },
                        { rank: 4, name: "Ninja2099", winRate: "57%", profit: "+$7,320", game: "Fortnite", level: 33 },
                        { rank: 5, name: "BetMaster", winRate: "55%", profit: "+$6,450", game: "Dota 2", level: 29 },
                      ].map((player, index) => (
                        <tr key={index} className="border-b border-muted">
                          <td className="py-4 px-2">
                            {player.rank === 1 ? (
                              <div className="flex items-center">
                                <span className="text-yellow-500 font-bold">{player.rank}</span>
                                <Sparkles className="h-4 w-4 ml-1 text-yellow-500" />
                              </div>
                            ) : (
                              <span className={player.rank <= 3 ? "font-bold" : ""}>{player.rank}</span>
                            )}
                          </td>
                          <td className="py-4 px-2">{player.name}</td>
                          <td className="py-4 px-2 text-green-500">{player.winRate}</td>
                          <td className="py-4 px-2 text-green-500">{player.profit}</td>
                          <td className="py-4 px-2">{player.game}</td>
                          <td className="py-4 px-2">
                            <div className="flex items-center">
                              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                                Lvl {player.level}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="font-bold">Most Popular Games</h3>
                </div>
                <ol className="space-y-2">
                  <li className="flex justify-between">
                    <span>League of Legends</span>
                    <span className="text-muted-foreground">32% of bets</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Counter-Strike 2</span>
                    <span className="text-muted-foreground">24% of bets</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Valorant</span>
                    <span className="text-muted-foreground">18% of bets</span>
                  </li>
                </ol>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <BarChart2 className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="font-bold">Biggest Wins</h3>
                </div>
                <ol className="space-y-2">
                  <li className="flex justify-between">
                    <span>CryptoKing</span>
                    <span className="text-green-500">+$3,200 in one bet</span>
                  </li>
                  <li className="flex justify-between">
                    <span>ProGamer123</span>
                    <span className="text-green-500">+$2,840 in one bet</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Ninja2099</span>
                    <span className="text-green-500">+$2,150 in one bet</span>
                  </li>
                </ol>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="font-bold">Your Stats</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Win Rate:</span>
                    <span className="text-green-500">52%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Bets:</span>
                    <span>24</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rank:</span>
                    <span>#156</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">View Detailed Stats</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoGaming;