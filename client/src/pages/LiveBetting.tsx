import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, TrendingUp, TrendingDown, DollarSign, Clock, Target } from 'lucide-react';

interface LiveOdds {
  eventId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  odds: {
    spread: { home: number; away: number; homeOdds: number; awayOdds: number };
    moneyline: { home: number; away: number };
    total: { over: number; under: number; overOdds: number; underOdds: number };
  };
  lastUpdate: string;
  status: 'live' | 'upcoming';
  period?: string;
  timeRemaining?: string;
  score?: { home: number; away: number };
  startTime?: string;
}

interface BetSlip {
  eventId: string;
  betType: string;
  selection: string;
  odds: number;
  amount: number;
}

export default function LiveBetting() {
  const [selectedBets, setSelectedBets] = useState<BetSlip[]>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: liveOddsResponse, isLoading } = useQuery({
    queryKey: ['/api/odds/americanfootball_nfl'],
    refetchInterval: isAutoRefresh ? 5000 : false, // Auto-refresh every 5 seconds
  });

  const liveOdds = liveOddsResponse?.odds || [];

  // Handle empty or invalid data gracefully
  if (!isLoading && (!liveOdds || liveOdds.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">Live Betting</h1>
            <p className="text-blue-300 mb-8">No live games available right now</p>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </div>
      </div>
    );
  }

  const placeBetMutation = useMutation({
    mutationFn: async (betData: any) => {
      const response = await fetch('/api/betting/place-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData),
      });
      if (!response.ok) throw new Error('Failed to place bet');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bet Placed Successfully!",
        description: `Your bet has been placed. Potential payout: $${data.bet.potentialPayout.toFixed(2)}`,
      });
      setSelectedBets([]);
      queryClient.invalidateQueries({ queryKey: ['/api/user/analytics'] });
    },
    onError: (error: any) => {
      toast({
        title: "Bet Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToBetSlip = (eventId: string, betType: string, selection: string, odds: number) => {
    const existingBet = selectedBets.find(bet => bet.eventId === eventId && bet.betType === betType);
    
    if (existingBet) {
      setSelectedBets(prev => prev.filter(bet => !(bet.eventId === eventId && bet.betType === betType)));
    } else {
      setSelectedBets(prev => [...prev, { eventId, betType, selection, odds, amount: 10 }]);
    }
  };

  const updateBetAmount = (index: number, amount: number) => {
    setSelectedBets(prev => prev.map((bet, i) => i === index ? { ...bet, amount } : bet));
  };

  const placeBets = () => {
    selectedBets.forEach(bet => {
      placeBetMutation.mutate(bet);
    });
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const isSelected = (eventId: string, betType: string) => {
    return selectedBets.some(bet => bet.eventId === eventId && bet.betType === betType);
  };

  const totalPotentialPayout = selectedBets.reduce((sum, bet) => {
    const decimalOdds = bet.odds > 0 ? (bet.odds / 100) + 1 : (100 / Math.abs(bet.odds)) + 1;
    return sum + (bet.amount * decimalOdds);
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-blue-300">Loading live odds...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Live Betting</h1>
            <p className="text-blue-300">Real-time odds with instant betting</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant={isAutoRefresh ? "default" : "outline"}
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className="flex items-center gap-2"
            >
              {isAutoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              Auto Refresh
            </Button>
            
            <Badge variant="secondary" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Live Games */}
          <div className="lg:col-span-2 space-y-4">
            {liveOdds.map((game: LiveOdds) => (
              <Card key={game.eventId} className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={game.status === 'live' ? 'destructive' : 'secondary'}>
                        {game.status === 'live' ? 'LIVE' : 'UPCOMING'}
                      </Badge>
                      <CardTitle className="text-white text-lg">
                        {game.awayTeam} @ {game.homeTeam}
                      </CardTitle>
                    </div>
                    
                    {game.status === 'live' && (
                      <div className="text-right text-sm text-blue-300">
                        <div>{game.period} - {game.timeRemaining}</div>
                        <div className="font-bold text-white">
                          {game.awayTeam}: {game.score?.away} | {game.homeTeam}: {game.score?.home}
                        </div>
                      </div>
                    )}
                    
                    {game.status === 'upcoming' && (
                      <div className="text-right text-sm text-blue-300">
                        Starts: {new Date(game.startTime!).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  
                  {/* Spread Betting */}
                  <div>
                    <Label className="text-blue-300 mb-2 block">Point Spread</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={isSelected(game.eventId, 'spread_away') ? "default" : "outline"}
                        onClick={() => addToBetSlip(
                          game.eventId, 
                          'spread_away', 
                          `${game.awayTeam} ${game.odds?.spread?.away || 0}`, 
                          game.odds?.spread?.awayOdds || -110
                        )}
                        className="flex justify-between p-3 h-auto"
                      >
                        <span>{game.awayTeam} {formatOdds(game.odds?.spread?.away || 0)}</span>
                        <span className="font-bold">{formatOdds(game.odds?.spread?.awayOdds || -110)}</span>
                      </Button>
                      
                      <Button
                        variant={isSelected(game.eventId, 'spread_home') ? "default" : "outline"}
                        onClick={() => addToBetSlip(
                          game.eventId, 
                          'spread_home', 
                          `${game.homeTeam} ${game.odds?.spread?.home || 0}`, 
                          game.odds?.spread?.homeOdds || -110
                        )}
                        className="flex justify-between p-3 h-auto"
                      >
                        <span>{game.homeTeam} {formatOdds(game.odds?.spread?.home || 0)}</span>
                        <span className="font-bold">{formatOdds(game.odds?.spread?.homeOdds || -110)}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Moneyline */}
                  <div>
                    <Label className="text-blue-300 mb-2 block">Moneyline</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={isSelected(game.eventId, 'moneyline_away') ? "default" : "outline"}
                        onClick={() => addToBetSlip(
                          game.eventId, 
                          'moneyline_away', 
                          `${game.awayTeam} Win`, 
                          game.odds?.moneyline?.away || 100
                        )}
                        className="flex justify-between p-3 h-auto"
                      >
                        <span>{game.awayTeam}</span>
                        <span className="font-bold">{formatOdds(game.odds?.moneyline?.away || 100)}</span>
                      </Button>
                      
                      <Button
                        variant={isSelected(game.eventId, 'moneyline_home') ? "default" : "outline"}
                        onClick={() => addToBetSlip(
                          game.eventId, 
                          'moneyline_home', 
                          `${game.homeTeam} Win`, 
                          game.odds?.moneyline?.home || -120
                        )}
                        className="flex justify-between p-3 h-auto"
                      >
                        <span>{game.homeTeam}</span>
                        <span className="font-bold">{formatOdds(game.odds?.moneyline?.home || -120)}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Total (Over/Under) */}
                  <div>
                    <Label className="text-blue-300 mb-2 block">Total Points</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={isSelected(game.eventId, 'total_over') ? "default" : "outline"}
                        onClick={() => addToBetSlip(
                          game.eventId, 
                          'total_over', 
                          `Over ${game.odds?.total?.over || 50}`, 
                          game.odds?.total?.overOdds || -110
                        )}
                        className="flex justify-between p-3 h-auto"
                      >
                        <span>Over {game.odds?.total?.over || 50}</span>
                        <span className="font-bold">{formatOdds(game.odds?.total?.overOdds || -110)}</span>
                      </Button>
                      
                      <Button
                        variant={isSelected(game.eventId, 'total_under') ? "default" : "outline"}
                        onClick={() => addToBetSlip(
                          game.eventId, 
                          'total_under', 
                          `Under ${game.odds?.total?.under || 50}`, 
                          game.odds?.total?.underOdds || -110
                        )}
                        className="flex justify-between p-3 h-auto"
                      >
                        <span>Under {game.odds?.total?.under || 50}</span>
                        <span className="font-bold">{formatOdds(game.odds?.total?.underOdds || -110)}</span>
                      </Button>
                    </div>
                  </div>
                  
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bet Slip */}
          <div>
            <Card className="bg-slate-800/50 border-slate-700 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Bet Slip ({selectedBets.length})
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {selectedBets.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    Select bets to add to your slip
                  </p>
                ) : (
                  <>
                    {selectedBets.map((bet, index) => (
                      <div key={`${bet.eventId}-${bet.betType}`} className="p-3 bg-slate-700/50 rounded-lg">
                        <div className="text-sm text-blue-300 mb-1">{bet.selection}</div>
                        <div className="text-white font-medium mb-2">
                          Odds: {formatOdds(bet.odds)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-slate-300">Amount:</Label>
                          <Input
                            type="number"
                            value={bet.amount}
                            onChange={(e) => updateBetAmount(index, Number(e.target.value))}
                            className="flex-1 h-8 bg-slate-600 border-slate-500"
                            min="1"
                          />
                        </div>
                        
                        <div className="text-xs text-green-400 mt-1">
                          Potential payout: ${((bet.odds > 0 ? (bet.odds / 100) + 1 : (100 / Math.abs(bet.odds)) + 1) * bet.amount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-slate-600 pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300">Total Wager:</span>
                        <span className="text-white font-medium">
                          ${selectedBets.reduce((sum, bet) => sum + bet.amount, 0).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm mb-4">
                        <span className="text-slate-300">Potential Payout:</span>
                        <span className="text-green-400 font-bold">
                          ${totalPotentialPayout.toFixed(2)}
                        </span>
                      </div>
                      
                      <Button 
                        onClick={placeBets}
                        disabled={placeBetMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {placeBetMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            Placing Bets...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Place All Bets
                          </div>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </div>
  );
}