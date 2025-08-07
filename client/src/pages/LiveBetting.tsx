import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, TrendingUp, TrendingDown, DollarSign, Clock, Target } from 'lucide-react';
import { useBetSlip } from '@/contexts/BetSlipContext';
import UnifiedBetSlip from '@/components/betting/UnifiedBetSlip';
import { useAuth } from '@/hooks/useAuth';

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



export default function LiveBetting() {
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { betSlip, addToBetSlip, updateBet, removeFromBetSlip, clearBetSlip } = useBetSlip();

  const { data: liveOddsResponse, isLoading } = useQuery({
    queryKey: ['/api/odds/americanfootball_nfl'],
    refetchInterval: isAutoRefresh ? 60000 : false, // Auto-refresh every 60 seconds
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



  const handleAddToBetSlip = (eventId: string, betType: string, selection: string, odds: number) => {
    const gameInfo = liveOdds.find(game => game.eventId === eventId);
    if (!gameInfo) return;
    
    const betData = {
      id: `${eventId}-${betType}-${selection.replace(/\s+/g, '-')}-${Date.now()}`,
      eventId,
      betType,
      selection,
      homeTeam: gameInfo.homeTeam,
      awayTeam: gameInfo.awayTeam,
      odds,
      sport: gameInfo.sport || 'NFL',
      amount: 0,
      potential: 0,
      gameTitle: `${gameInfo.awayTeam} @ ${gameInfo.homeTeam}`,
      pick: selection,
      date: gameInfo.startTime || new Date().toISOString()
    };
    
    addToBetSlip(betData);
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const isSelected = (eventId: string, betType: string) => {
    return betSlip?.some(bet => bet.eventId === eventId && bet.betType === betType) || false;
  };



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
                        onClick={() => handleAddToBetSlip(
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
                        onClick={() => handleAddToBetSlip(
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
                        onClick={() => handleAddToBetSlip(
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
                        onClick={() => handleAddToBetSlip(
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
                        onClick={() => handleAddToBetSlip(
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
                        onClick={() => handleAddToBetSlip(
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

          {/* Unified Bet Slip */}
          <div>
            <UnifiedBetSlip 
              betSlip={betSlip || []}
              onUpdateBet={updateBet}
              onRemoveBet={removeFromBetSlip}
              onClearAll={clearBetSlip}
              balances={{
                weparlay_cash: user?.weplayTokenBalance || user?.weparlayCashBalance || user?.balance || 1000000,
                real_money: user?.cashBalance || 0,
                crypto: 0
              }}
            />
          </div>
          
        </div>
      </div>
    </div>
  );
}