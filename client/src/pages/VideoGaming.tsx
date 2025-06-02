import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Gamepad2, Trophy, TrendingUp, Users, Zap, Star, Play } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Game {
  id: string;
  name: string;
  category: string;
  platform: string;
  image: string;
  isLive: boolean;
  viewers: number;
  upcomingMatches: number;
}

interface Match {
  id: string;
  gameId: string;
  team1: string;
  team2: string;
  startTime: string;
  odds: {
    team1: number;
    team2: number;
  };
  prize: number;
  tournament: string;
  status: 'upcoming' | 'live' | 'completed';
}

interface GameBet {
  id: string;
  matchId: string;
  team: string;
  amount: number;
  odds: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  totalWins: number;
  winPercentage: number;
  totalEarnings: number;
}

const VideoGaming: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [betAmount, setBetAmount] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch popular games
  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['/api/gaming/games'],
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch live matches
  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['/api/gaming/matches', selectedGame],
    refetchInterval: 30000,
  });

  // Fetch user bets
  const { data: userBets = [], isLoading: betsLoading } = useQuery({
    queryKey: ['/api/gaming/my-bets'],
    refetchInterval: 60000,
  });

  // Fetch leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['/api/gaming/leaderboard'],
    refetchInterval: 300000,
  });

  // Place bet mutation
  const placeBetMutation = useMutation({
    mutationFn: async (betData: {
      matchId: string;
      team: string;
      amount: number;
    }) => {
      return apiRequest('POST', '/api/gaming/place-bet', betData);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Bet Placed Successfully",
          description: `Your bet of $${betAmount} on ${selectedTeam} has been placed`,
        });
        setBetAmount('');
        setSelectedTeam('');
        setSelectedMatch(null);
        queryClient.invalidateQueries({ queryKey: ['/api/gaming/my-bets'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
      } else {
        toast({
          title: "Bet Failed",
          description: data.message || "Unable to place bet",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handlePlaceBet = () => {
    if (!selectedMatch || !selectedTeam || !betAmount) {
      toast({
        title: "Missing Information",
        description: "Please select a team and enter a bet amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }

    placeBetMutation.mutate({
      matchId: selectedMatch.id,
      team: selectedTeam,
      amount
    });
  };

  const filteredGames = games.filter((game: Game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMatches = matches.filter((match: Match) =>
    selectedGame === 'all' || match.gameId === selectedGame
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getBetStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'text-green-600';
      case 'lost': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Gamepad2 className="h-8 w-8 text-purple-600" />
                Video Gaming Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Bet on esports matches and tournaments</p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{games.length}</div>
                <div className="text-sm text-gray-600">Games</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{matches.filter((m: Match) => m.status === 'live').length}</div>
                <div className="text-sm text-gray-600">Live Matches</div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            
            <Select value={selectedGame} onValueChange={setSelectedGame}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Filter by game" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                {games.map((game: Game) => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="matches">Live Matches</TabsTrigger>
            <TabsTrigger value="games">Popular Games</TabsTrigger>
            <TabsTrigger value="mybets">My Bets</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Live Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Matches List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Live & Upcoming Matches
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {matchesLoading ? (
                      <div className="text-center py-8">Loading matches...</div>
                    ) : filteredMatches.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No matches found</div>
                    ) : (
                      filteredMatches.map((match: Match) => (
                        <div
                          key={match.id}
                          className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                            selectedMatch?.id === match.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''
                          }`}
                          onClick={() => setSelectedMatch(match)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`${getStatusColor(match.status)} text-white`}>
                                  {match.status.toUpperCase()}
                                </Badge>
                                <span className="text-sm text-gray-600">{match.tournament}</span>
                              </div>
                              
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-center">
                                  <div className="font-semibold">{match.team1}</div>
                                  <div className="text-sm text-purple-600">+{match.odds.team1}</div>
                                </div>
                                
                                <div className="text-center px-4">
                                  <div className="text-lg font-bold">VS</div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(match.startTime).toLocaleTimeString()}
                                  </div>
                                </div>
                                
                                <div className="text-center">
                                  <div className="font-semibold">{match.team2}</div>
                                  <div className="text-sm text-purple-600">+{match.odds.team2}</div>
                                </div>
                              </div>
                              
                              <div className="text-sm text-gray-600">
                                Prize Pool: ${match.prize.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Bet Panel */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Place Bet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedMatch ? (
                      <>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-sm font-medium mb-1">{selectedMatch.tournament}</div>
                          <div className="text-lg font-bold">
                            {selectedMatch.team1} vs {selectedMatch.team2}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Select Team</label>
                          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose team to bet on" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={selectedMatch.team1}>
                                {selectedMatch.team1} (+{selectedMatch.odds.team1})
                              </SelectItem>
                              <SelectItem value={selectedMatch.team2}>
                                {selectedMatch.team2} (+{selectedMatch.odds.team2})
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Bet Amount ($)</label>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            min="1"
                            step="0.01"
                          />
                        </div>

                        {selectedTeam && betAmount && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-sm">Potential Payout:</div>
                            <div className="text-xl font-bold text-blue-600">
                              ${(parseFloat(betAmount) * (selectedTeam === selectedMatch.team1 ? selectedMatch.odds.team1 : selectedMatch.odds.team2)).toFixed(2)}
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handlePlaceBet}
                          disabled={placeBetMutation.isPending || !selectedTeam || !betAmount}
                          className="w-full"
                        >
                          {placeBetMutation.isPending ? 'Placing Bet...' : 'Place Bet'}
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Select a match to place a bet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Popular Games Tab */}
          <TabsContent value="games" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gamesLoading ? (
                <div className="col-span-full text-center py-8">Loading games...</div>
              ) : (
                filteredGames.map((game: Game) => (
                  <Card key={game.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{game.name}</CardTitle>
                        {game.isLive && (
                          <Badge className="bg-red-500 text-white">
                            <Play className="h-3 w-3 mr-1" />
                            LIVE
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Platform:</span>
                          <span className="font-medium">{game.platform}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{game.category}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Viewers:</span>
                          <span className="font-medium text-purple-600">{game.viewers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Upcoming Matches:</span>
                          <span className="font-medium">{game.upcomingMatches}</span>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-4"
                          onClick={() => setSelectedGame(game.id)}
                        >
                          View Matches
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* My Bets Tab */}
          <TabsContent value="mybets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Gaming Bets</CardTitle>
              </CardHeader>
              <CardContent>
                {betsLoading ? (
                  <div className="text-center py-8">Loading your bets...</div>
                ) : userBets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No bets placed yet</div>
                ) : (
                  <div className="space-y-4">
                    {userBets.map((bet: GameBet) => (
                      <div key={bet.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{bet.team}</div>
                            <div className="text-sm text-gray-600">
                              Bet: ${bet.amount} • Odds: +{bet.odds}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(bet.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${getBetStatusColor(bet.status)}`}>
                              {bet.status.toUpperCase()}
                            </div>
                            {bet.status === 'won' && (
                              <div className="text-sm text-green-600">
                                +${(bet.amount * bet.odds).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Gaming Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboardLoading ? (
                  <div className="text-center py-8">Loading leaderboard...</div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.map((entry: LeaderboardEntry) => (
                      <div key={entry.rank} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            entry.rank === 1 ? 'bg-yellow-500 text-white' :
                            entry.rank === 2 ? 'bg-gray-400 text-white' :
                            entry.rank === 3 ? 'bg-orange-500 text-white' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {entry.rank}
                          </div>
                          <div>
                            <div className="font-semibold">{entry.username}</div>
                            <div className="text-sm text-gray-600">
                              {entry.totalWins} wins • {entry.winPercentage}% win rate
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            ${entry.totalEarnings.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Total Earnings</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VideoGaming;