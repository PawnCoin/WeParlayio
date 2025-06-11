import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface LiveGame {
  id: string;
  sport: string;
  homeTeam: { name: string; score: number; logo?: string; };
  awayTeam: { name: string; score: number; logo?: string; };
  period: string;
  timeRemaining: string;
  status: 'live' | 'halftime' | 'quarter-break';
  odds?: {
    moneyline?: { home: number; away: number; trend?: 'up' | 'down' | 'stable'; };
    spread?: { 
      home: { line: number; odds: number }; 
      away: { line: number; odds: number }; 
      trend?: 'up' | 'down' | 'stable'; 
    };
    total?: { 
      over: { line: number; odds: number }; 
      under: { line: number; odds: number }; 
      trend?: 'up' | 'down' | 'stable'; 
    };
  };
}

export default function LiveInGameBetting() {
  const [selectedBet, setSelectedBet] = useState<{
    type: string;
    selection: string;
    odds: number;
  } | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const { toast } = useToast();

  // Mock live games data with safe defaults
  const mockGames: LiveGame[] = [
    {
      id: "live-1",
      sport: "NFL",
      homeTeam: { name: "Chiefs", score: 14 },
      awayTeam: { name: "Bills", score: 10 },
      period: "Q2",
      timeRemaining: "8:42",
      status: "live",
      odds: {
        moneyline: { home: -150, away: +130, trend: "stable" },
        spread: { 
          home: { line: -3.5, odds: -110 },
          away: { line: +3.5, odds: -110 },
          trend: "up"
        },
        total: {
          over: { line: 47.5, odds: -105 },
          under: { line: 47.5, odds: -115 },
          trend: "down"
        }
      }
    },
    {
      id: "live-2", 
      sport: "NBA",
      homeTeam: { name: "Lakers", score: 52 },
      awayTeam: { name: "Warriors", score: 48 },
      period: "2nd",
      timeRemaining: "3:15",
      status: "live",
      odds: {
        moneyline: { home: +110, away: -130, trend: "stable" },
        spread: {
          home: { line: +2.5, odds: -108 },
          away: { line: -2.5, odds: -112 },
          trend: "stable"
        },
        total: {
          over: { line: 220.5, odds: -110 },
          under: { line: 220.5, odds: -110 },
          trend: "up"
        }
      }
    }
  ];

  const placeBetMutation = useMutation({
    mutationFn: async (betData: any) => {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to place bet');
      }
      
      return response.json();
    },
    onSuccess: () => {
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
    if (!selectedBet || !betAmount) return;

    const betData = {
      eventId: "live-event",
      betType: selectedBet.type,
      amount: parseFloat(betAmount),
      odds: selectedBet.odds,
      selection: selectedBet.selection,
      currency: "USD",
      totalOdds: selectedBet.odds,
      potentialPayout: parseFloat(betAmount) * (selectedBet.odds > 0 ? selectedBet.odds / 100 + 1 : 100 / Math.abs(selectedBet.odds) + 1),
      live: true
    };

    placeBetMutation.mutate(betData);
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <div className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live In-Game Betting
          <Badge variant="outline" className="ml-auto">
            {mockGames.length} Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {mockGames.map((game) => (
            <div key={game.id} className="space-y-4 p-4 border rounded-lg">
              {/* Game Status */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant={game.status === 'live' ? 'destructive' : 'secondary'}>
                    {game.status.toUpperCase()}
                  </Badge>
                  <span className="text-sm">{game.period} - {game.timeRemaining}</span>
                </div>
                <div className="text-sm font-mono">
                  {game.homeTeam.name} {game.homeTeam.score} - {game.awayTeam.score} {game.awayTeam.name}
                </div>
              </div>

              {/* Live Odds */}
              {game.odds && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Moneyline */}
                  {game.odds.moneyline && (
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Moneyline</CardTitle>
                          {getTrendIcon(game.odds.moneyline.trend)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => setSelectedBet({
                            type: 'moneyline',
                            selection: game.homeTeam.name,
                            odds: game.odds!.moneyline!.home
                          })}
                        >
                          <span>{game.homeTeam.name}</span>
                          <span>{game.odds.moneyline.home > 0 ? '+' : ''}{game.odds.moneyline.home}</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => setSelectedBet({
                            type: 'moneyline',
                            selection: game.awayTeam.name,
                            odds: game.odds!.moneyline!.away
                          })}
                        >
                          <span>{game.awayTeam.name}</span>
                          <span>{game.odds.moneyline.away > 0 ? '+' : ''}{game.odds.moneyline.away}</span>
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Spread */}
                  {game.odds.spread && (
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Spread</CardTitle>
                          {getTrendIcon(game.odds.spread.trend)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => setSelectedBet({
                            type: 'spread',
                            selection: `${game.homeTeam.name} ${game.odds!.spread!.home.line}`,
                            odds: game.odds!.spread!.home.odds
                          })}
                        >
                          <span>{game.homeTeam.name} {game.odds.spread.home.line}</span>
                          <span>{game.odds.spread.home.odds > 0 ? '+' : ''}{game.odds.spread.home.odds}</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => setSelectedBet({
                            type: 'spread',
                            selection: `${game.awayTeam.name} ${game.odds!.spread!.away.line}`,
                            odds: game.odds!.spread!.away.odds
                          })}
                        >
                          <span>{game.awayTeam.name} {game.odds.spread.away.line}</span>
                          <span>{game.odds.spread.away.odds > 0 ? '+' : ''}{game.odds.spread.away.odds}</span>
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Total */}
                  {game.odds.total && (
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Total</CardTitle>
                          {getTrendIcon(game.odds.total.trend)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => setSelectedBet({
                            type: 'total',
                            selection: `Over ${game.odds!.total!.over.line}`,
                            odds: game.odds!.total!.over.odds
                          })}
                        >
                          <span>Over {game.odds.total.over.line}</span>
                          <span>{game.odds.total.over.odds > 0 ? '+' : ''}{game.odds.total.over.odds}</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => setSelectedBet({
                            type: 'total',
                            selection: `Under ${game.odds!.total!.under.line}`,
                            odds: game.odds!.total!.under.odds
                          })}
                        >
                          <span>Under {game.odds.total.under.line}</span>
                          <span>{game.odds.total.under.odds > 0 ? '+' : ''}{game.odds.total.under.odds}</span>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Bet Slip */}
          {selectedBet && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Place Live Bet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium">{selectedBet.selection}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedBet.odds > 0 ? '+' : ''}{selectedBet.odds} 
                    ({selectedBet.type})
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bet-amount">Bet Amount</Label>
                  <Input
                    id="bet-amount"
                    type="number"
                    placeholder="Enter amount"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                  />
                </div>

                {betAmount && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Potential Payout:</span>
                      <span className="font-medium">
                        ${(parseFloat(betAmount) * (selectedBet.odds > 0 ? selectedBet.odds / 100 + 1 : 100 / Math.abs(selectedBet.odds) + 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handlePlaceBet}
                    disabled={!betAmount || placeBetMutation.isPending}
                    className="flex-1"
                  >
                    {placeBetMutation.isPending ? "Placing..." : "Place Bet"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedBet(null);
                      setBetAmount("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}