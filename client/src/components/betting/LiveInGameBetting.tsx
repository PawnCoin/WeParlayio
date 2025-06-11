import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface LiveGame {
  id: string;
  sport: string;
  homeTeam: {
    name: string;
    score: number;
    logo?: string;
  };
  awayTeam: {
    name: string;
    score: number;
    logo?: string;
  };
  period: string;
  timeRemaining: string;
  status: 'live' | 'halftime' | 'quarter-break';
  odds: {
    moneyline: {
      home: number;
      away: number;
      trend: 'up' | 'down' | 'stable';
    };
    spread: {
      home: { line: number; odds: number };
      away: { line: number; odds: number };
      trend: 'up' | 'down' | 'stable';
    };
    total: {
      over: { line: number; odds: number };
      under: { line: number; odds: number };
      trend: 'up' | 'down' | 'stable';
    };
  };
  nextScoring: {
    probability: number;
    team: 'home' | 'away';
  };
  momentum: {
    team: 'home' | 'away';
    strength: number;
  };
}

interface PropBet {
  id: string;
  category: string;
  description: string;
  odds: number;
  line?: number;
  player?: string;
  team?: string;
}

export default function LiveInGameBetting() {
  const [selectedGame, setSelectedGame] = useState<LiveGame | null>(null);
  const [betAmount, setBetAmount] = useState<string>("");
  const [selectedBet, setSelectedBet] = useState<any>(null);
  const { toast } = useToast();

  // Fetch live games with real-time updates
  const { data: liveGames, isLoading } = useQuery({
    queryKey: ['/api/live-games'],
    refetchInterval: 2000, // Update every 2 seconds
  });

  // Fetch prop bets for selected game
  const { data: propBets } = useQuery({
    queryKey: ['/api/prop-bets', selectedGame?.id],
    enabled: !!selectedGame,
    refetchInterval: 5000,
  });

  // Place live bet mutation
  const placeBetMutation = useMutation({
    mutationFn: async (betData: any) => {
      const response = await fetch('/api/user/place-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'dev-user-001'
        },
        body: JSON.stringify(betData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to place bet');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Live Bet Placed!",
        description: `Bet placed successfully for $${betAmount}`,
      });
      setBetAmount("");
      setSelectedBet(null);
      queryClient.invalidateQueries({ queryKey: ['/api/user/bets'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Bet Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePlaceBet = () => {
    if (!selectedBet || !betAmount || !selectedGame) return;

    const betData = {
      eventId: selectedGame.id,
      betType: selectedBet.type,
      amount: parseFloat(betAmount),
      odds: selectedBet.odds,
      selection: selectedBet.selection,
      currency: "USD",
      totalOdds: selectedBet.odds,
      potentialPayout: parseFloat(betAmount) * (selectedBet.odds > 0 ? selectedBet.odds / 100 + 1 : 100 / Math.abs(selectedBet.odds) + 1),
      live: true,
      gameState: {
        period: selectedGame.period,
        timeRemaining: selectedGame.timeRemaining,
        homeScore: selectedGame.homeTeam.score,
        awayScore: selectedGame.awayTeam.score
      }
    };

    placeBetMutation.mutate(betData);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <div className="h-3 w-3" />;
    }
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Activity className="h-6 w-6 animate-spin mr-2" />
        <span>Loading live games...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-red-500 animate-pulse" />
        <h2 className="text-2xl font-bold">Live In-Game Betting</h2>
        <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
      </div>

      {/* Live Games Grid */}
      <div className="grid gap-4">
        {liveGames?.map((game: LiveGame) => (
          <Card 
            key={game.id} 
            className={`cursor-pointer transition-all ${selectedGame?.id === game.id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedGame(game)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{game.sport}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={game.status === 'live' ? 'destructive' : 'secondary'}>
                    {game.status.toUpperCase()}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {game.period} - {game.timeRemaining}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 items-center">
                {/* Away Team */}
                <div className="text-center">
                  <div className="font-semibold">{game.awayTeam.name}</div>
                  <div className="text-2xl font-bold">{game.awayTeam.score}</div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  VS
                </div>

                {/* Home Team */}
                <div className="text-center">
                  <div className="font-semibold">{game.homeTeam.name}</div>
                  <div className="text-2xl font-bold">{game.homeTeam.score}</div>
                </div>
              </div>

              {/* Live Odds */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-muted rounded">
                  <div className="flex items-center justify-center gap-1">
                    <span>ML</span>
                    {getTrendIcon(game.odds.moneyline.trend)}
                  </div>
                  <div>{formatOdds(game.odds.moneyline.away)} / {formatOdds(game.odds.moneyline.home)}</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="flex items-center justify-center gap-1">
                    <span>Spread</span>
                    {getTrendIcon(game.odds.spread.trend)}
                  </div>
                  <div>{game.odds.spread.away.line > 0 ? '+' : ''}{game.odds.spread.away.line}</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="flex items-center justify-center gap-1">
                    <span>Total</span>
                    {getTrendIcon(game.odds.total.trend)}
                  </div>
                  <div>O/U {game.odds.total.over.line}</div>
                </div>
              </div>

              {/* Game Momentum */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span>Momentum:</span>
                  <Badge variant={game.momentum.team === 'home' ? 'default' : 'secondary'} className="text-xs">
                    {game.momentum.team === 'home' ? game.homeTeam.name : game.awayTeam.name}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <span>Next Score:</span>
                  <span className="font-semibold">{game.nextScoring.probability}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Betting Interface */}
      {selectedGame && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-500" />
              Live Betting - {selectedGame.homeTeam.name} vs {selectedGame.awayTeam.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="main">Main Lines</TabsTrigger>
                <TabsTrigger value="props">Player Props</TabsTrigger>
                <TabsTrigger value="team">Team Props</TabsTrigger>
                <TabsTrigger value="special">Specials</TabsTrigger>
              </TabsList>

              <TabsContent value="main" className="space-y-4">
                <div className="grid gap-4">
                  {/* Moneyline */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      Moneyline
                      {getTrendIcon(selectedGame.odds.moneyline.trend)}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={selectedBet?.type === 'moneyline' && selectedBet?.selection === 'away' ? 'default' : 'outline'}
                        onClick={() => setSelectedBet({
                          type: 'moneyline',
                          selection: 'away',
                          odds: selectedGame.odds.moneyline.away,
                          team: selectedGame.awayTeam.name
                        })}
                        className="h-16 flex flex-col"
                      >
                        <span className="font-semibold">{selectedGame.awayTeam.name}</span>
                        <span className="text-lg">{formatOdds(selectedGame.odds.moneyline.away)}</span>
                      </Button>
                      <Button
                        variant={selectedBet?.type === 'moneyline' && selectedBet?.selection === 'home' ? 'default' : 'outline'}
                        onClick={() => setSelectedBet({
                          type: 'moneyline',
                          selection: 'home',
                          odds: selectedGame.odds.moneyline.home,
                          team: selectedGame.homeTeam.name
                        })}
                        className="h-16 flex flex-col"
                      >
                        <span className="font-semibold">{selectedGame.homeTeam.name}</span>
                        <span className="text-lg">{formatOdds(selectedGame.odds.moneyline.home)}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Spread */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      Point Spread
                      {getTrendIcon(selectedGame.odds.spread.trend)}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={selectedBet?.type === 'spread' && selectedBet?.selection === 'away' ? 'default' : 'outline'}
                        onClick={() => setSelectedBet({
                          type: 'spread',
                          selection: 'away',
                          odds: selectedGame.odds.spread.away.odds,
                          line: selectedGame.odds.spread.away.line,
                          team: selectedGame.awayTeam.name
                        })}
                        className="h-16 flex flex-col"
                      >
                        <span className="font-semibold">{selectedGame.awayTeam.name}</span>
                        <span className="text-lg">
                          {selectedGame.odds.spread.away.line > 0 ? '+' : ''}{selectedGame.odds.spread.away.line} ({formatOdds(selectedGame.odds.spread.away.odds)})
                        </span>
                      </Button>
                      <Button
                        variant={selectedBet?.type === 'spread' && selectedBet?.selection === 'home' ? 'default' : 'outline'}
                        onClick={() => setSelectedBet({
                          type: 'spread',
                          selection: 'home',
                          odds: selectedGame.odds.spread.home.odds,
                          line: selectedGame.odds.spread.home.line,
                          team: selectedGame.homeTeam.name
                        })}
                        className="h-16 flex flex-col"
                      >
                        <span className="font-semibold">{selectedGame.homeTeam.name}</span>
                        <span className="text-lg">
                          {selectedGame.odds.spread.home.line > 0 ? '+' : ''}{selectedGame.odds.spread.home.line} ({formatOdds(selectedGame.odds.spread.home.odds)})
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      Total Points
                      {getTrendIcon(selectedGame.odds.total.trend)}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={selectedBet?.type === 'total' && selectedBet?.selection === 'over' ? 'default' : 'outline'}
                        onClick={() => setSelectedBet({
                          type: 'total',
                          selection: 'over',
                          odds: selectedGame.odds.total.over.odds,
                          line: selectedGame.odds.total.over.line
                        })}
                        className="h-16 flex flex-col"
                      >
                        <span className="font-semibold">Over</span>
                        <span className="text-lg">{selectedGame.odds.total.over.line} ({formatOdds(selectedGame.odds.total.over.odds)})</span>
                      </Button>
                      <Button
                        variant={selectedBet?.type === 'total' && selectedBet?.selection === 'under' ? 'default' : 'outline'}
                        onClick={() => setSelectedBet({
                          type: 'total',
                          selection: 'under',
                          odds: selectedGame.odds.total.under.odds,
                          line: selectedGame.odds.total.under.line
                        })}
                        className="h-16 flex flex-col"
                      >
                        <span className="font-semibold">Under</span>
                        <span className="text-lg">{selectedGame.odds.total.under.line} ({formatOdds(selectedGame.odds.total.under.odds)})</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="props" className="space-y-4">
                <div className="grid gap-2">
                  {propBets?.filter((bet: PropBet) => bet.category === 'player').map((bet: PropBet) => (
                    <Button
                      key={bet.id}
                      variant={selectedBet?.id === bet.id ? 'default' : 'outline'}
                      onClick={() => setSelectedBet({
                        id: bet.id,
                        type: 'prop',
                        selection: bet.description,
                        odds: bet.odds,
                        line: bet.line,
                        player: bet.player
                      })}
                      className="h-12 justify-between"
                    >
                      <span>{bet.description}</span>
                      <span>{formatOdds(bet.odds)}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                <div className="grid gap-2">
                  {propBets?.filter((bet: PropBet) => bet.category === 'team').map((bet: PropBet) => (
                    <Button
                      key={bet.id}
                      variant={selectedBet?.id === bet.id ? 'default' : 'outline'}
                      onClick={() => setSelectedBet({
                        id: bet.id,
                        type: 'prop',
                        selection: bet.description,
                        odds: bet.odds,
                        line: bet.line,
                        team: bet.team
                      })}
                      className="h-12 justify-between"
                    >
                      <span>{bet.description}</span>
                      <span>{formatOdds(bet.odds)}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="special" className="space-y-4">
                <div className="grid gap-2">
                  {propBets?.filter((bet: PropBet) => bet.category === 'special').map((bet: PropBet) => (
                    <Button
                      key={bet.id}
                      variant={selectedBet?.id === bet.id ? 'default' : 'outline'}
                      onClick={() => setSelectedBet({
                        id: bet.id,
                        type: 'prop',
                        selection: bet.description,
                        odds: bet.odds,
                        line: bet.line
                      })}
                      className="h-12 justify-between"
                    >
                      <span>{bet.description}</span>
                      <span>{formatOdds(bet.odds)}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Bet Slip */}
            {selectedBet && (
              <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Place Live Bet
                </h4>
                <div className="space-y-3">
                  <div className="text-sm">
                    <strong>Selection:</strong> {selectedBet.selection}
                    {selectedBet.line && <span> ({selectedBet.line > 0 ? '+' : ''}{selectedBet.line})</span>}
                  </div>
                  <div className="text-sm">
                    <strong>Odds:</strong> {formatOdds(selectedBet.odds)}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bet-amount">Bet Amount ($)</Label>
                    <Input
                      id="bet-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      min="1"
                      step="0.01"
                    />
                  </div>
                  {betAmount && (
                    <div className="text-sm">
                      <strong>Potential Payout:</strong> ${(
                        parseFloat(betAmount) * (selectedBet.odds > 0 ? selectedBet.odds / 100 + 1 : 100 / Math.abs(selectedBet.odds) + 1)
                      ).toFixed(2)}
                    </div>
                  )}
                  <Button 
                    onClick={handlePlaceBet}
                    disabled={!betAmount || placeBetMutation.isPending}
                    className="w-full"
                  >
                    {placeBetMutation.isPending ? 'Placing Bet...' : 'Place Live Bet'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}