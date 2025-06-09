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

  const iptvChannels = (iptvResponse as any)?.channels || [];

  const isLoading = eventsLoading || channelsLoading;

  const { data: userBalance = 0 } = useQuery<number>({
    queryKey: ['/api/user/cash-balance'],
    refetchInterval: 10000,
  });

  // Convert sports events and IPTV channels to StreamingGame format
  const liveGames = useMemo((): StreamingGame[] => {
    const streamingGames: StreamingGame[] = [];

    // Convert sports events to streaming games (ESPN API data)
    if (Array.isArray(sportsEvents) && sportsEvents.length > 0) {
      sportsEvents.forEach((event: any) => {
        streamingGames.push({
          id: event.id || `event-${Math.random()}`,
          title: `${event.homeTeam?.name || event.competitors?.[0]?.name || 'Home'} vs ${event.awayTeam?.name || event.competitors?.[1]?.name || 'Away'}`,
          homeTeam: {
            name: event.homeTeam?.name || event.competitors?.[0]?.name || 'Home Team',
            score: event.homeTeam?.score || event.competitors?.[0]?.score || 0,
            logo: event.homeTeam?.logo || event.competitors?.[0]?.logo
          },
          awayTeam: {
            name: event.awayTeam?.name || event.competitors?.[1]?.name || 'Away Team', 
            score: event.awayTeam?.score || event.competitors?.[1]?.score || 0,
            logo: event.awayTeam?.logo || event.competitors?.[1]?.logo
          },
          sport: event.sport || event.league?.name || 'Sports',
          league: event.league || event.competition?.name || 'Professional League',
          status: event.status === 'in_progress' || event.status === 'STATUS_IN_PROGRESS' ? 'live' : 'upcoming',
          startTime: event.startTime || event.date || new Date().toISOString(),
          streamUrl: `https://thetv.to:443/live/${(event.sport || 'sports').toLowerCase()}/stream.m3u8`,
          odds: {
            homeWin: 2.1 + Math.random() * 0.5,
            awayWin: 1.8 + Math.random() * 0.5,
            draw: 3.2 + Math.random() * 0.8
          },
          viewers: Math.floor(Math.random() * 50000) + 1000,
          period: event.status === 'in_progress' || event.status === 'STATUS_IN_PROGRESS' ? 'LIVE' : 'Upcoming',
          timeRemaining: event.status === 'in_progress' || event.status === 'STATUS_IN_PROGRESS' ? 'LIVE' : 'Starting Soon'
        });
      });
    }

    // Add IPTV channels from the endpoint
    if (Array.isArray(iptvChannels) && iptvChannels.length > 0) {
      iptvChannels.slice(0, 10).forEach((channel: any) => {
        streamingGames.push({
          id: `iptv-${channel.id || Math.random()}`,
          title: channel.name || 'Live Sports Channel',
          homeTeam: { name: 'Live TV', score: 0 },
          awayTeam: { name: channel.category || 'Sports', score: 0 },
          sport: channel.category || 'Sports',
          league: 'IPTV Network',
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
                    className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                    onClick={() => handleGameSelect(game)}
                  >
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-slate-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Live indicator for live games */}
                    {game.status === 'live' && (
                      <div className="absolute top-2 right-2 flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">LIVE</span>
                      </div>
                    )}

                    <CardHeader className="pb-3 relative z-10">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={getStatusBadgeVariant(game.status) as any}
                          className="shadow-md font-semibold"
                        >
                          {getStatusText(game.status)}
                        </Badge>
                        <div className="flex items-center space-x-2 text-gray-300 bg-gray-800/50 px-2 py-1 rounded-full">
                          <Users className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-medium">{game.viewers.toLocaleString()}</span>
                        </div>
                      </div>
                      <CardTitle className="text-white group-hover:text-blue-300 transition-colors text-lg font-bold">
                        {game.title}
                      </CardTitle>
                      <div className="text-sm text-blue-400 font-medium">{game.sport} • {game.league}</div>
                    </CardHeader>
                    
                    <CardContent className="relative z-10">
                      <div className="space-y-4">
                        {/* Teams and Score with enhanced styling */}
                        <div className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                          <div className="text-center flex-1">
                            <p className="text-sm font-bold text-blue-300 mb-1">{game.homeTeam.name}</p>
                            <p className="text-3xl font-black text-white">{game.homeTeam.score}</p>
                          </div>
                          <div className="text-center px-4">
                            <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                              VS
                            </div>
                          </div>
                          <div className="text-center flex-1">
                            <p className="text-sm font-bold text-slate-300 mb-1">{game.awayTeam.name}</p>
                            <p className="text-3xl font-black text-white">{game.awayTeam.score}</p>
                          </div>
                        </div>

                        {/* Game Info with enhanced styling */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1 text-gray-300 bg-gray-700/30 px-2 py-1 rounded">
                            <Clock className="h-4 w-4 text-yellow-400" />
                            <span className="font-medium">{game.period}</span>
                          </div>
                          <div className="text-center">
                            <span className="text-gray-300 font-medium">{game.timeRemaining}</span>
                          </div>
                        </div>

                        {/* Enhanced Quick Odds */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-700/30 rounded-lg p-2 hover:bg-green-800/20 transition-colors cursor-pointer">
                            <p className="text-xs text-green-300 font-medium mb-1">{game.homeTeam.name}</p>
                            <p className="text-lg font-bold text-green-400">+{game.odds.homeWin.toFixed(1)}</p>
                          </div>
                          <div className="text-center bg-gradient-to-br from-slate-900/30 to-slate-800/30 border border-slate-700/30 rounded-lg p-2 hover:bg-slate-800/20 transition-colors cursor-pointer">
                            <p className="text-xs text-slate-300 font-medium mb-1">{game.awayTeam.name}</p>
                            <p className="text-lg font-bold text-slate-400">+{game.odds.awayWin.toFixed(1)}</p>
                          </div>
                        </div>

                        {/* Enhanced Watch Button */}
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 group-hover:from-blue-400 group-hover:to-teal-400 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                          <Play className="h-4 w-4 mr-2" />
                          {game.status === 'live' ? 'Watch Live' : 'Watch Stream'}
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