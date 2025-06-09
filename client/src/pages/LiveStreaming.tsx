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

  // Fetch live sports events
  const { data: sportsEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/sports'],
    refetchInterval: 30000,
  });

  // Fetch IPTV channels
  const { data: iptvResponse, isLoading: channelsLoading } = useQuery({
    queryKey: ['/api/iptv/channels'],
    refetchInterval: 60000,
  });

  const iptvChannels = iptvResponse?.channels || iptvResponse || [];

  const isLoading = eventsLoading || channelsLoading;

  const { data: userBalance = 0 } = useQuery<number>({
    queryKey: ['/api/user/cash-balance'],
    refetchInterval: 10000,
  });

  // Convert sports events and IPTV channels to StreamingGame format
  const liveGames = useMemo((): StreamingGame[] => {
    const streamingGames: StreamingGame[] = [];

    // Convert sports events to streaming games
    if (Array.isArray(sportsEvents)) {
      sportsEvents.forEach((event: any) => {
        streamingGames.push({
          id: event.id || `event-${Date.now()}-${Math.random()}`,
          title: `${event.homeTeam?.name || 'Home'} vs ${event.awayTeam?.name || 'Away'}`,
          homeTeam: {
            name: event.homeTeam?.name || 'Home Team',
            score: event.homeTeam?.score || 0,
            logo: event.homeTeam?.logo
          },
          awayTeam: {
            name: event.awayTeam?.name || 'Away Team', 
            score: event.awayTeam?.score || 0,
            logo: event.awayTeam?.logo
          },
          sport: event.sport || 'Sports',
          league: event.league || 'Professional League',
          status: event.status === 'in_progress' ? 'live' : 'upcoming',
          startTime: event.startTime || new Date().toISOString(),
          streamUrl: `https://thetv.to:443/live/${event.sport?.toLowerCase()}/stream.m3u8`,
          odds: {
            homeWin: event.odds?.homeWin || 2.1,
            awayWin: event.odds?.awayWin || 1.8,
            draw: event.odds?.draw || 3.2
          },
          viewers: Math.floor(Math.random() * 50000) + 1000,
          period: event.status === 'in_progress' ? 'LIVE' : 'Upcoming',
          timeRemaining: event.status === 'in_progress' ? 'LIVE' : 'Starting Soon'
        });
      });
    }

    // Add IPTV channels as streaming options
    if (Array.isArray(iptvChannels)) {
      iptvChannels.slice(0, 20).forEach((channel: any) => {
        streamingGames.push({
          id: `iptv-${channel.id || Math.random()}`,
          title: channel.name || 'Live Channel',
          homeTeam: { name: 'Live Sports', score: 0 },
          awayTeam: { name: 'Broadcasting', score: 0 },
          sport: channel.category || 'Sports',
          league: 'Live TV',
          status: 'live',
          startTime: new Date().toISOString(),
          streamUrl: channel.url || `https://thetv.to:443/live/${channel.id}/stream.m3u8`,
          odds: { homeWin: 1.5, awayWin: 2.5 },
          viewers: Math.floor(Math.random() * 10000) + 500,
          period: 'LIVE',
          timeRemaining: 'LIVE'
        });
      });
    }

    return streamingGames;
  }, [sportsEvents, iptvChannels]);

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
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{sportsEvents?.length || 0}</div>
                  <div className="text-sm text-gray-400">Sports Events</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{iptvChannels?.length || 0}</div>
                  <div className="text-sm text-gray-400">Live Channels</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{liveGames.length}</div>
                  <div className="text-sm text-gray-400">Total Streams</div>
                </CardContent>
              </Card>
            </div>

            {liveGames.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                    <Play className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Loading Streaming Content</h3>
                  <p className="text-gray-400">Connecting to live sports and IPTV channels...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    ESPN API: {sportsEvents?.length || 0} events | IPTV: {iptvChannels?.length || 0} channels
                  </p>
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