import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, TrendingUp, TrendingDown, DollarSign, Clock, Target, RefreshCw, Zap, Activity } from 'lucide-react';
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
  const [selectedSport, setSelectedSport] = useState('all');
  const [oddsFormat, setOddsFormat] = useState('american');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { betSlip, addToBetSlip, updateBet, removeFromBetSlip, clearBetSlip } = useBetSlip();

  // Get live odds from the unified sports endpoint
  const { data: sportsDataResponse, isLoading: sportsLoading } = useQuery({
    queryKey: ['/api/unified-sports/upcoming-events'],
    refetchInterval: isAutoRefresh ? 30000 : false, // Auto-refresh every 30 seconds
  });

  // Get additional data from odds ticker for real-time updates
  const { data: oddsTickerResponse, isLoading: tickerLoading } = useQuery({
    queryKey: ['/api/odds-ticker/live-ticker'],
    refetchInterval: isAutoRefresh ? 15000 : false, // More frequent for live ticker
  });

  const sportsEvents = sportsDataResponse?.data || [];
  const tickerOdds = oddsTickerResponse?.odds || [];
  
  // Combine and process live odds data
  const liveOdds = sportsEvents.map((event: any) => {
    // Find matching ticker odds for real-time updates
    const tickerMatch = tickerOdds.find((ticker: any) => ticker.id === event.id);
    
    return {
      eventId: event.id,
      sport: event.sport,
      homeTeam: event.homeTeam?.name || event.homeTeam,
      awayTeam: event.awayTeam?.name || event.awayTeam,
      startTime: event.startTime,
      status: new Date(event.startTime) <= new Date() ? 'live' : 'upcoming',
      odds: {
        spread: {
          home: -3.5,
          away: 3.5,
          homeOdds: -110,
          awayOdds: -110
        },
        moneyline: {
          home: event.odds?.homeWin ? (event.odds.homeWin > 2 ? Math.round((event.odds.homeWin - 1) * 100) : -Math.round(100 / (event.odds.homeWin - 1))) : -150,
          away: event.odds?.awayWin ? (event.odds.awayWin > 2 ? Math.round((event.odds.awayWin - 1) * 100) : -Math.round(100 / (event.odds.awayWin - 1))) : 130
        },
        total: {
          over: 45.5,
          under: 45.5,
          overOdds: -110,
          underOdds: -110
        }
      },
      lastUpdate: new Date().toISOString()
    };
  });

  const isLoading = sportsLoading || tickerLoading;

  // Filter by sport
  const filteredOdds = selectedSport === 'all' ? liveOdds : 
                       liveOdds.filter(game => game.sport.toLowerCase().includes(selectedSport.toLowerCase()));

  // Handle empty or invalid data gracefully
  if (!isLoading && (!filteredOdds || filteredOdds.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-white mb-4">Live Betting Odds</h1>
            <p className="text-blue-300 mb-8">No games available for the selected sport</p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setSelectedSport('all')}>Show All Sports</Button>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/unified-sports/upcoming-events'] })} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }



  const handleAddToBetSlip = (eventId: string, betType: string, selection: string, odds: number) => {
    const gameInfo = filteredOdds.find(game => game.eventId === eventId);
    if (!gameInfo) return;

    // Check if game has started (betting closes at game start)
    const gameStartTime = new Date(gameInfo.startTime);
    const now = new Date();
    
    if (now >= gameStartTime) {
      toast({
        title: 'Betting Closed',
        description: `Betting is closed for this game. Game started at ${gameStartTime.toLocaleTimeString()}`,
        variant: 'destructive'
      });
      return;
    }
    
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
      startTime: gameInfo.startTime,
      gameInfo: {
        homeTeam: gameInfo.homeTeam,
        awayTeam: gameInfo.awayTeam,
        startTime: gameInfo.startTime
      }
    };
    
    addToBetSlip(betData);
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const isSelected = (eventId: string, betType: string) => {
    return betSlip?.some(bet => bet.eventId === eventId && bet.betType === betType) || false;
  };

  const formatOddsForDisplay = (odds: number) => {
    if (oddsFormat === 'decimal') {
      return (odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1).toFixed(2);
    }
    if (oddsFormat === 'fractional') {
      if (odds > 0) {
        return `${odds}/100`;
      } else {
        return `100/${Math.abs(odds)}`;
      }
    }
    return formatOdds(odds); // American format
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
        
        {/* Enhanced Header with Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Live Betting Odds</h1>
              <p className="text-blue-300">Real-time odds from top sportsbooks</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all" className="text-white">All Sports</SelectItem>
                  <SelectItem value="nfl" className="text-white">American</SelectItem>
                  <SelectItem value="nba" className="text-white">Basketball</SelectItem>
                  <SelectItem value="mlb" className="text-white">Baseball</SelectItem>
                  <SelectItem value="nhl" className="text-white">Hockey</SelectItem>
                  <SelectItem value="soccer" className="text-white">Soccer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={oddsFormat} onValueChange={setOddsFormat}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="American" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="american" className="text-white">American</SelectItem>
                  <SelectItem value="decimal" className="text-white">Decimal</SelectItem>
                  <SelectItem value="fractional" className="text-white">Fractional</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant={isAutoRefresh ? "default" : "outline"}
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-300 mb-1">Live Markets</p>
                    <p className="text-2xl font-bold text-white">{filteredOdds.length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-300 mb-1">Sports Available</p>
                    <p className="text-2xl font-bold text-white">{new Set(liveOdds.map(g => g.sport)).size}</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-300 mb-1">Data Source</p>
                    <p className="text-lg font-bold text-white">RapidAPI Live</p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-300 mb-1">Last Updated</p>
                    <p className="text-lg font-bold text-white">{new Date().toLocaleTimeString()}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Live Games */}
          <div className="lg:col-span-2 space-y-4">
            {filteredOdds.map((game: LiveOdds) => (
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
                          `${game.awayTeam} ${game.odds?.spread?.away > 0 ? '+' : ''}${game.odds?.spread?.away?.toFixed(1) || '+3.5'}`, 
                          game.odds?.spread?.awayOdds || -110
                        )}
                        className="flex justify-between p-3 h-auto"
                      >
                        <span>{game.awayTeam} {game.odds?.spread?.away > 0 ? '+' : ''}{game.odds?.spread?.away?.toFixed(1) || '+3.5'}</span>
                        <span className="font-bold">{formatOddsForDisplay(game.odds?.spread?.awayOdds || -110)}</span>
                      </Button>
                      
                      <Button
                        variant={isSelected(game.eventId, 'spread_home') ? "default" : "outline"}
                        onClick={() => handleAddToBetSlip(
                          game.eventId, 
                          'spread_home', 
                          `${game.homeTeam} ${game.odds?.spread?.home > 0 ? '+' : ''}${game.odds?.spread?.home?.toFixed(1) || '-3.5'}`, 
                          game.odds?.spread?.homeOdds || -110
                        )}
                        className="flex justify-between p-3 h-auto"
                      >
                        <span>{game.homeTeam} {game.odds?.spread?.home > 0 ? '+' : ''}{game.odds?.spread?.home?.toFixed(1) || '-3.5'}</span>
                        <span className="font-bold">{formatOddsForDisplay(game.odds?.spread?.homeOdds || -110)}</span>
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