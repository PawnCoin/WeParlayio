import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play,
  Clock,
  Users,
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VideoPlayer from '@/components/streaming/VideoPlayer';
import BettingPanel from '@/components/streaming/BettingPanel';
import BetSlip from '@/components/streaming/BetSlip';
import { StreamingGame, BetSlip as BetSlipType, BetType } from '@/components/streaming/types';

// Legacy LiveGame interface for compatibility
interface LiveGame {
  id: string;
  title: string;
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
  sport: string;
  league: string;
  status: 'live' | 'upcoming' | 'finished';
  startTime: string;
  streamUrl: string;
  odds: {
    homeWin: number;
    awayWin: number;
    draw?: number;
  };
  viewers: number;
  period: string;
  timeRemaining: string;
}

export default function LiveStreaming() {
  const [selectedGame, setSelectedGame] = useState<StreamingGame | null>(null);
  const [betSlip, setBetSlip] = useState<BetSlipType | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const { toast } = useToast();

  const { data: rawLiveGames = [], isLoading } = useQuery<LiveGame[]>({
    queryKey: ['/api/live-games'],
    refetchInterval: 30000,
  });

  const { data: userBalance = 0 } = useQuery<number>({
    queryKey: ['/api/user/cash-balance'],
    refetchInterval: 10000,
  });

  // Convert legacy LiveGame data to StreamingGame format
  const liveGames = useMemo((): StreamingGame[] => 
    rawLiveGames.map(game => ({
      id: game.id,
      title: game.title,
      homeTeam: {
        name: game.homeTeam?.name || 'Home Team',
        score: game.homeTeam?.score || 0,
        logo: game.homeTeam?.logo
      },
      awayTeam: {
        name: game.awayTeam?.name || 'Away Team',
        score: game.awayTeam?.score || 0,
        logo: game.awayTeam?.logo
      },
      sport: game.sport,
      league: game.league,
      status: game.status,
      startTime: game.startTime,
      streamUrl: game.streamUrl,
      odds: {
        homeWin: game.odds?.homeWin || 2.1,
        awayWin: game.odds?.awayWin || 1.8,
        draw: game.odds?.draw
      },
      viewers: game.viewers || 1000,
      period: game.period || 'LIVE',
      timeRemaining: game.timeRemaining || 'LIVE'
    })), [rawLiveGames]);

  const handleGameSelect = useCallback((game: StreamingGame) => {
    setSelectedGame(game);
  }, []);

  const handlePlaceBet = useCallback((gameId: string, betType: BetType, odds: number) => {
    const potentialWin = betAmount * odds;
    setBetSlip({
      gameId,
      betType,
      odds,
      amount: betAmount,
      potentialWin
    });
  }, [betAmount]);

  const handleConfirmBet = useCallback(() => {
    if (!betSlip) return;

    toast({
      title: "Bet Placed!",
      description: `You placed a $${betSlip.amount} bet on ${betSlip.betType.replace('_', ' ')} with potential win of $${betSlip.potentialWin.toFixed(2)}`,
    });

    setBetSlip(null);
  }, [betSlip, toast]);

  const getStatusBadgeVariant = useCallback((status: string) => {
    switch (status) {
      case 'live':
        return 'destructive';
      case 'upcoming':
        return 'secondary';
      case 'finished':
        return 'outline';
      default:
        return 'default';
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'live':
        return 'LIVE';
      case 'upcoming':
        return 'UPCOMING';
      case 'finished':
        return 'FINISHED';
      default:
        return status.toUpperCase();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 animate-pulse"></div>
            <h3 className="text-lg font-semibold mb-2 text-white">Loading Live Streams</h3>
            <p className="text-gray-400">Fetching authentic live sports data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            <Zap className="inline-block mr-2 h-8 w-8" />
            Live Sports Streaming
          </h1>
          <p className="text-gray-300 text-lg">Watch live sports and place real-time bets</p>
        </div>

        {selectedGame ? (
          // Selected Game View
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-3">
              <VideoPlayer 
                game={selectedGame} 
                className="mb-6" 
              />
              
              {/* Betting Panel */}
              <BettingPanel
                game={selectedGame}
                onPlaceBet={handlePlaceBet}
              />
            </div>

            {/* Bet Slip */}
            <div className="lg:col-span-1">
              <BetSlip
                betSlip={betSlip}
                userBalance={userBalance}
                betAmount={betAmount}
                onBetAmountChange={setBetAmount}
                onConfirmBet={handleConfirmBet}
              />
              
              {/* Back to Games Button */}
              <Button
                onClick={() => setSelectedGame(null)}
                className="w-full mt-4 bg-gray-700 hover:bg-gray-600"
              >
                Back to Games
              </Button>
            </div>
          </div>
        ) : (
          // Games List View
          <div className="space-y-6">
            {liveGames.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                    <Play className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">No Live Games Available</h3>
                  <p className="text-gray-400">Check back later for live sports streams</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveGames.map((game) => (
                  <Card 
                    key={game.id} 
                    className="bg-gray-900 border-gray-800 hover:border-blue-600 transition-colors cursor-pointer group"
                    onClick={() => handleGameSelect(game)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={getStatusBadgeVariant(game.status) as any}>
                          {getStatusText(game.status)}
                        </Badge>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">{game.viewers.toLocaleString()}</span>
                        </div>
                      </div>
                      <CardTitle className="text-white group-hover:text-blue-400 transition-colors">
                        {game.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        {/* Teams and Score */}
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <p className="text-sm font-medium text-white">{game.homeTeam.name}</p>
                            <p className="text-2xl font-bold text-white">{game.homeTeam.score}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400">VS</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-white">{game.awayTeam.name}</p>
                            <p className="text-2xl font-bold text-white">{game.awayTeam.score}</p>
                          </div>
                        </div>

                        {/* Game Info */}
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>{game.league}</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{game.period} - {game.timeRemaining}</span>
                          </div>
                        </div>

                        {/* Quick Odds */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center bg-gray-800 rounded p-2">
                            <p className="text-xs text-gray-400">{game.homeTeam.name} Win</p>
                            <p className="text-sm font-bold text-green-400">+{game.odds.homeWin.toFixed(1)}</p>
                          </div>
                          <div className="text-center bg-gray-800 rounded p-2">
                            <p className="text-xs text-gray-400">{game.awayTeam.name} Win</p>
                            <p className="text-sm font-bold text-green-400">+{game.odds.awayWin.toFixed(1)}</p>
                          </div>
                        </div>

                        {/* Watch Button */}
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 group-hover:bg-blue-500 transition-colors">
                          <Play className="h-4 w-4 mr-2" />
                          Watch Live
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}