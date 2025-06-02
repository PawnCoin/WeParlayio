import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  Radio, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Target,
  Zap,
  Play,
  Activity,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

interface LiveGame {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  period: string;
  timeRemaining: string;
  status: 'live' | 'halftime' | 'quarter_break';
  momentum: 'home' | 'away' | 'neutral';
  lastPlay: string;
  odds: {
    moneyline: { home: number; away: number; };
    spread: { home: number; away: number; line: number; };
    total: { over: number; under: number; points: number; };
  };
}

interface LiveBet {
  id: string;
  gameId: string;
  type: string;
  selection: string;
  odds: number;
  stake: number;
  status: 'pending' | 'placed' | 'won' | 'lost';
  timestamp: string;
}

export default function LiveBettingExperience() {
  const [selectedGame, setSelectedGame] = useState<LiveGame | null>(null);
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [quickStake, setQuickStake] = useState(25);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch live games with real-time updates
  const { data: liveGames, isLoading } = useQuery({
    queryKey: ['/api/live-games'],
    refetchInterval: autoRefresh ? 3000 : false, // 3-second updates for live games
  });

  // Fetch live odds updates
  const { data: liveOdds } = useQuery({
    queryKey: ['/api/live-odds', selectedGame?.id],
    enabled: !!selectedGame,
    refetchInterval: 2000, // 2-second odds updates
  });

  // Simulate live game updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // This would normally come from WebSocket or real-time API
      console.log('Live data refresh...');
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const placeLiveBet = (type: string, selection: string, odds: number) => {
    const newBet: LiveBet = {
      id: Date.now().toString(),
      gameId: selectedGame?.id || '',
      type,
      selection,
      odds,
      stake: quickStake,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    setLiveBets([newBet, ...liveBets]);
    
    // Simulate bet processing
    setTimeout(() => {
      setLiveBets(prev => prev.map(bet => 
        bet.id === newBet.id ? { ...bet, status: 'placed' } : bet
      ));
    }, 1000);
  };

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'home': return 'text-blue-600';
      case 'away': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getOddsMovement = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return null;
  };

  // Mock live games data
  const mockLiveGames: LiveGame[] = [
    {
      id: 'live_001',
      sport: 'NBA',
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      homeScore: 78,
      awayScore: 82,
      period: '3rd Quarter',
      timeRemaining: '8:24',
      status: 'live',
      momentum: 'away',
      lastPlay: 'Curry 3-pointer from 28 feet',
      odds: {
        moneyline: { home: 120, away: -140 },
        spread: { home: -2.5, away: 2.5, line: -110 },
        total: { over: -105, under: -115, points: 225.5 }
      }
    },
    {
      id: 'live_002',
      sport: 'NFL',
      homeTeam: 'Cowboys',
      awayTeam: 'Eagles',
      homeScore: 14,
      awayScore: 10,
      period: '2nd Quarter',
      timeRemaining: '3:45',
      status: 'live',
      momentum: 'home',
      lastPlay: 'Elliott 15-yard rushing touchdown',
      odds: {
        moneyline: { home: -110, away: -110 },
        spread: { home: -3.5, away: 3.5, line: -110 },
        total: { over: -110, under: -110, points: 47.5 }
      }
    }
  ];

  const games = liveGames || mockLiveGames;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center space-x-2">
          <Activity className="h-5 w-5 animate-pulse" />
          <span>Loading live games...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
              <Radio className="h-8 w-8 text-red-500 animate-pulse" />
              <span>Live Betting</span>
            </h1>
            <p className="text-gray-600">Real-time betting on live games</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="autoRefresh" className="text-sm">
                Auto-refresh
              </label>
              {autoRefresh && (
                <Badge variant="outline" className="text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                  LIVE
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Games List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Live Games</span>
                <Badge variant="outline">{games.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {games.map((game) => (
                  <div 
                    key={game.id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedGame?.id === game.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedGame(game)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="animate-pulse">
                          {game.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{game.sport}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {game.period} - {game.timeRemaining}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-center">
                        <p className="font-semibold">{game.awayTeam}</p>
                        <p className="text-2xl font-bold">{game.awayScore}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">@</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="font-semibold">{game.homeTeam}</p>
                        <p className="text-2xl font-bold">{game.homeScore}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <div className={`text-sm font-medium ${getMomentumColor(game.momentum)}`}>
                          <Activity className="h-3 w-3 inline mr-1" />
                          {game.lastPlay}
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Betting Panel */}
        <div className="space-y-4">
          {selectedGame ? (
            <>
              {/* Quick Betting */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span>Quick Bet</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Quick Stake</label>
                      <Select value={quickStake.toString()} onValueChange={(value) => setQuickStake(Number(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">$10</SelectItem>
                          <SelectItem value="25">$25</SelectItem>
                          <SelectItem value="50">$50</SelectItem>
                          <SelectItem value="100">$100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Moneyline</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="p-3 h-auto"
                          onClick={() => placeLiveBet('moneyline', selectedGame.homeTeam, selectedGame.odds.moneyline.home)}
                        >
                          <div className="text-center">
                            <div className="font-medium text-sm">{selectedGame.homeTeam}</div>
                            <div className="font-bold">
                              {selectedGame.odds.moneyline.home > 0 ? '+' : ''}{selectedGame.odds.moneyline.home}
                            </div>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="p-3 h-auto"
                          onClick={() => placeLiveBet('moneyline', selectedGame.awayTeam, selectedGame.odds.moneyline.away)}
                        >
                          <div className="text-center">
                            <div className="font-medium text-sm">{selectedGame.awayTeam}</div>
                            <div className="font-bold">
                              {selectedGame.odds.moneyline.away > 0 ? '+' : ''}{selectedGame.odds.moneyline.away}
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Point Spread</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="p-3 h-auto"
                          onClick={() => placeLiveBet('spread', `${selectedGame.homeTeam} ${selectedGame.odds.spread.home}`, -110)}
                        >
                          <div className="text-center">
                            <div className="font-medium text-sm">{selectedGame.homeTeam}</div>
                            <div className="text-xs">{selectedGame.odds.spread.home > 0 ? '+' : ''}{selectedGame.odds.spread.home}</div>
                            <div className="font-bold">-110</div>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="p-3 h-auto"
                          onClick={() => placeLiveBet('spread', `${selectedGame.awayTeam} ${selectedGame.odds.spread.away}`, -110)}
                        >
                          <div className="text-center">
                            <div className="font-medium text-sm">{selectedGame.awayTeam}</div>
                            <div className="text-xs">{selectedGame.odds.spread.away > 0 ? '+' : ''}{selectedGame.odds.spread.away}</div>
                            <div className="font-bold">-110</div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Total Points</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="p-3 h-auto"
                          onClick={() => placeLiveBet('total', `Over ${selectedGame.odds.total.points}`, selectedGame.odds.total.over)}
                        >
                          <div className="text-center">
                            <div className="font-medium text-sm">Over</div>
                            <div className="text-xs">{selectedGame.odds.total.points}</div>
                            <div className="font-bold">{selectedGame.odds.total.over}</div>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="p-3 h-auto"
                          onClick={() => placeLiveBet('total', `Under ${selectedGame.odds.total.points}`, selectedGame.odds.total.under)}
                        >
                          <div className="text-center">
                            <div className="font-medium text-sm">Under</div>
                            <div className="text-xs">{selectedGame.odds.total.points}</div>
                            <div className="font-bold">{selectedGame.odds.total.under}</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Bets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Your Live Bets</span>
                    {liveBets.length > 0 && (
                      <Badge variant="outline">{liveBets.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {liveBets.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No live bets placed</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {liveBets.map((bet) => (
                        <div key={bet.id} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{bet.selection}</span>
                            <Badge 
                              variant={
                                bet.status === 'won' ? 'default' :
                                bet.status === 'lost' ? 'destructive' :
                                bet.status === 'placed' ? 'secondary' : 'outline'
                              }
                            >
                              {bet.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>${bet.stake} @ {bet.odds > 0 ? '+' : ''}{bet.odds}</span>
                            <span>To win: ${((bet.stake * Math.abs(bet.odds)) / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Select a live game to start betting</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Warning Notice */}
      <Card className="mt-6 border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Live Betting Notice</p>
              <p>Odds change rapidly during live games. Bets are subject to acceptance at the time of placement. Monitor your wagers carefully and bet responsibly.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}