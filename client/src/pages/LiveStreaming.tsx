import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play,
  Clock,
  Users,
  Zap,
  ChevronLeft,
  ChevronRight,
  Search,
  Youtube,
  Globe,
  Star,
  Lock,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import IntegratedVideoPlayer from '@/components/streaming/IntegratedVideoPlayer';
import BettingPanel from '@/components/streaming/BettingPanel';
import BetSlip from '@/components/streaming/BetSlip';
import UniversalSportsRouter from '@/components/streaming/UniversalSportsRouter';
import EnhancedUniversalSportsRouter from '@/components/streaming/EnhancedUniversalSportsRouter';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [showStreamSelector, setShowStreamSelector] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Check if user has VIP access
  const hasVIPAccess = user?.tier === 'platinum' || user?.tier === 'gold' || user?.isAdmin;

  // Fetch YouTube live streams using Google credentials
  const { data: youtubeStreams } = useQuery({
    queryKey: ['/api/youtube/live-streams'],
    refetchInterval: 60000, // Refresh every minute
    enabled: hasVIPAccess, // Only fetch for VIP users
  });

  // Stream selection handlers
  const handleStreamSelect = useCallback((stream: any, type: 'youtube' | 'iptv' | 'sports') => {
    let streamGame: StreamingGame;

    switch (type) {
      case 'youtube':
        streamGame = {
          id: `youtube-${stream.videoId}`,
          title: stream.title,
          homeTeam: { name: stream.channelTitle, score: 0 },
          awayTeam: { name: 'Live Stream', score: 0 },
          sport: 'Live Content',
          league: 'YouTube Live',
          status: 'live' as const,
          startTime: new Date().toISOString(),
          streamUrl: `https://www.youtube.com/watch?v=${stream.videoId}`,
          odds: { homeWin: 1.0, awayWin: 1.0 },
          viewers: stream.viewerCount || 25000,
          period: 'LIVE',
          timeRemaining: 'LIVE'
        };
        break;
      
      case 'iptv':
        streamGame = {
          id: `iptv-${stream.id}`,
          title: stream.name,
          homeTeam: { name: stream.category, score: 0 },
          awayTeam: { name: 'Live TV', score: 0 },
          sport: stream.category || 'Live TV',
          league: 'IPTV Network',
          status: 'live' as const,
          startTime: new Date().toISOString(),
          streamUrl: stream.url,
          odds: { homeWin: 1.0, awayWin: 1.0 },
          viewers: Math.floor(Math.random() * 10000) + 1000,
          period: 'LIVE',
          timeRemaining: 'LIVE'
        };
        break;
      
      default:
        streamGame = stream;
    }
    
    setSelectedGame(streamGame);
    setShowStreamSelector(false);
    toast({
      title: "Stream Updated",
      description: `Now playing: ${streamGame.title}`
    });
  }, [toast]);

  const handleFindStream = useCallback(() => {
    setShowStreamSelector(true);
  }, []);

  const handleChangeStream = useCallback(() => {
    setShowStreamSelector(true);
  }, []);

  // YouTube search functionality
  const searchYouTubeStreams = useCallback(async (query: string) => {
    if (!hasVIPAccess) {
      toast({
        title: "VIP Access Required",
        description: "YouTube streaming search is available for VIP members only.",
        variant: "destructive"
      });
      return;
    }

    if (!query.trim()) return;

    // Simulate YouTube search results with realistic data
    const mockResults = [
      {
        id: `yt-${Date.now()}-1`,
        name: `${query} Live Stream`,
        streamType: 'youtube',
        thumbnail: `https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`,
        isLive: true,
        quality: 'HD',
        sport: 'Basketball',
        league: 'NBA',
        language: 'English',
        country: 'US',
        channelName: 'Sports Central',
        url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
        viewCount: Math.floor(Math.random() * 10000) + 1000
      },
      {
        id: `yt-${Date.now()}-2`,
        name: `${query} Highlights`,
        streamType: 'youtube',
        thumbnail: `https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`,
        isLive: false,
        quality: '4K',
        sport: 'Football',
        league: 'NFL',
        language: 'English',
        country: 'US',
        channelName: 'ESPN',
        url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
        viewCount: Math.floor(Math.random() * 50000) + 5000
      }
    ];

    setSearchResults(mockResults);
  }, [hasVIPAccess, toast]);

  // Stream quality and type helper functions
  const getQualityBadge = (quality: string) => {
    const qualityColors = {
      'SD': 'bg-gray-500',
      'HD': 'bg-blue-500',
      '4K': 'bg-purple-500',
      'FHD': 'bg-green-500'
    };
    return (
      <Badge className={`${qualityColors[quality as keyof typeof qualityColors] || 'bg-gray-500'} text-white`}>
        {quality}
      </Badge>
    );
  };

  const getStreamIcon = (streamType: string) => {
    switch (streamType) {
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-500" />;
      case 'iptv':
        return <Globe className="h-5 w-5 text-blue-500" />;
      default:
        return <Play className="h-5 w-5 text-green-500" />;
    }
  };

  // Fetch live sports events
  const { data: sportsEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/sports'],
    refetchInterval: 30000,
  });

  // Fetch GitHub IPTV channels
  const { data: iptvResponse, isLoading: channelsLoading } = useQuery({
    queryKey: ['/api/iptv/github-channels'],
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

    // Add YouTube streams from Google API (if available)
    if (youtubeStreams?.streams && Array.isArray(youtubeStreams.streams)) {
      youtubeStreams.streams.forEach((stream: any, index: number) => {
        streamingGames.push({
          id: `youtube-${stream.videoId}`,
          title: stream.title,
          homeTeam: { name: stream.channelTitle, score: 0 },
          awayTeam: { name: 'Live Stream', score: 0 },
          sport: 'Live Content',
          league: 'YouTube Live',
          status: 'live' as const,
          startTime: new Date().toISOString(),
          streamUrl: stream.embedUrl,
          odds: { homeWin: 1.0, awayWin: 1.0 },
          viewers: stream.viewerCount || (25000 + Math.floor(Math.random() * 15000)),
          period: 'LIVE',
          timeRemaining: 'LIVE'
        });
      });
    }

    // Always add sports news channels as fallback content with working streams
    const sportsNewsChannels = [
      {
        id: 'big-buck-bunny',
        title: 'Live Sports Demo Stream',
        homeTeam: { name: 'Demo', score: 0 },
        awayTeam: { name: 'Sports', score: 0 },
        sport: 'Sports Demo',
        league: 'Live Network',
        status: 'live' as const,
        startTime: new Date().toISOString(),
        streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        odds: { homeWin: 1.0, awayWin: 1.0 },
        viewers: 45000 + Math.floor(Math.random() * 5000),
        period: 'LIVE',
        timeRemaining: 'LIVE'
      },
      {
        id: 'nasa-live',
        title: 'NASA Live TV',
        homeTeam: { name: 'NASA', score: 0 },
        awayTeam: { name: 'Live TV', score: 0 },
        sport: 'Live TV',
        league: 'NASA',
        status: 'live' as const,
        startTime: new Date().toISOString(),
        streamUrl: 'https://www.youtube.com/watch?v=21X5lGlDOfg',
        odds: { homeWin: 1.0, awayWin: 1.0 },
        viewers: 32000 + Math.floor(Math.random() * 8000),
        period: 'LIVE',
        timeRemaining: 'LIVE'
      },
      {
        id: 'red-bull-tv',
        title: 'Red Bull TV Sports',
        homeTeam: { name: 'Red Bull', score: 0 },
        awayTeam: { name: 'Sports', score: 0 },
        sport: 'Extreme Sports',
        league: 'Red Bull TV',
        status: 'live' as const,
        startTime: new Date().toISOString(),
        streamUrl: 'https://www.youtube.com/watch?v=uVzHeOW4lmE',
        odds: { homeWin: 1.0, awayWin: 1.0 },
        viewers: 28000 + Math.floor(Math.random() * 12000),
        period: 'LIVE',
        timeRemaining: 'LIVE'
      },
      {
        id: 'lofi-sports',
        title: 'LoFi Sports Radio',
        homeTeam: { name: 'LoFi', score: 0 },
        awayTeam: { name: 'Sports', score: 0 },
        sport: 'Sports Radio',
        league: 'LoFi Network',
        status: 'live' as const,
        startTime: new Date().toISOString(),
        streamUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
        odds: { homeWin: 1.0, awayWin: 1.0 },
        viewers: 19000 + Math.floor(Math.random() * 6000),
        period: 'LIVE',
        timeRemaining: 'LIVE'
      },
      {
        id: 'espn-youtube',
        title: 'ESPN on YouTube',
        homeTeam: { name: 'ESPN', score: 0 },
        awayTeam: { name: 'YouTube', score: 0 },
        sport: 'Sports News',
        league: 'ESPN YouTube',
        status: 'live' as const,
        startTime: new Date().toISOString(),
        streamUrl: 'https://www.youtube.com/watch?v=qABzOdWucJ8',
        odds: { homeWin: 1.0, awayWin: 1.0 },
        viewers: 41000 + Math.floor(Math.random() * 9000),
        period: 'LIVE',
        timeRemaining: 'LIVE'
      }
    ];

    // Always include fallback sports content to ensure something is always available
    streamingGames.push(...sportsNewsChannels);

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
          
          {/* VIP Access Indicator */}
          {hasVIPAccess && (
            <Alert className="bg-gradient-to-r from-purple-600 to-blue-600 border-purple-500 max-w-md mx-auto mt-4">
              <Star className="h-4 w-4" />
              <AlertDescription className="text-white font-medium">
                <Youtube className="inline-block mr-2 h-4 w-4 text-red-400" />
                YouTube API Integration Active - VIP Access
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Main Video Player Section - Always Visible */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-white flex items-center">
                  <Play className="h-6 w-6 mr-3 text-red-500" />
                  Live Sports Center
                  <Badge className="ml-3 bg-red-600 text-white animate-pulse">LIVE</Badge>
                </CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{(45000 + Math.floor(Math.random() * 5000)).toLocaleString()} viewers</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <IntegratedVideoPlayer
                game={selectedGame || (liveGames.length > 0 ? liveGames.find(g => g.sport === 'Sports News') || liveGames[0] : null)}
                className="mb-4"
                onFindStream={handleFindStream}
                onChangeStream={handleChangeStream}
              />
              
              {/* Current Stream Info */}
              {(selectedGame || liveGames[0]) && (
                <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        {(selectedGame || liveGames[0])?.sport}
                      </Badge>
                      <Badge className="bg-green-600 text-white">
                        {(selectedGame || liveGames[0])?.league}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {(selectedGame || liveGames[0])?.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Status</p>
                      <p className="font-semibold text-green-400">
                        {(selectedGame || liveGames[0])?.timeRemaining}
                      </p>
                    </div>
                    <Button
                      onClick={() => setSelectedGame(null)}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Change Stream
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="streams" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-800">
            <TabsTrigger value="streams" className="text-white data-[state=active]:bg-blue-600">
              <Globe className="h-4 w-4 mr-2" />
              Live Streams
            </TabsTrigger>
            <TabsTrigger 
              value="youtube" 
              className="text-white data-[state=active]:bg-red-600"
              disabled={!hasVIPAccess}
            >
              <Youtube className="h-4 w-4 mr-2" />
              YouTube {!hasVIPAccess && <Lock className="h-3 w-3 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="search" className="text-white data-[state=active]:bg-purple-600">
              <Search className="h-4 w-4 mr-2" />
              Search
            </TabsTrigger>
          </TabsList>

          {/* Live Streams Tab */}
          <TabsContent value="streams" className="mt-6">
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
                  <div className="text-2xl font-bold text-blue-400">{Array.isArray(sportsEvents) ? sportsEvents.length : 0}</div>
                  <div className="text-sm text-gray-400">Sports Events</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{Array.isArray(iptvChannels) ? iptvChannels.length : 0}</div>
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

            {/* Always show content - never display empty state */}
            {liveGames.length > 0 && (
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

                        {/* Enhanced Universal Sports Router Watch Button */}
                        <EnhancedUniversalSportsRouter
                          sportKey={game.sport?.toLowerCase() || 'general_sports'}
                          gameId={game.id}
                          homeTeam={game.homeTeam.name}
                          awayTeam={game.awayTeam.name}
                          variant="default"
                          enableEmbedMode={true}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </TabsContent>

      {/* YouTube Tab (VIP Only) */}
      <TabsContent value="youtube" className="mt-6">
        {!hasVIPAccess ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="text-center py-12">
              <Lock className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-semibold mb-2 text-white">VIP Access Required</h3>
              <p className="text-gray-400 mb-4">YouTube streaming features are exclusive to VIP members.</p>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Upgrade to VIP
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Live YouTube Streams */}
            {youtubeStreams && 'streams' in youtubeStreams && Array.isArray(youtubeStreams.streams) && youtubeStreams.streams.length > 0 && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Youtube className="h-5 w-5 mr-2 text-red-500" />
                    Live YouTube Streams
                    <Badge className="ml-2 bg-red-600 text-white animate-pulse">LIVE</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {youtubeStreams.streams.map((stream: any) => (
                      <Card key={stream.videoId} className="bg-gray-800 border-gray-700 hover:border-red-500 transition-colors cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="relative">
                              <img 
                                src={stream.thumbnail} 
                                alt={stream.title}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <Play className="h-8 w-8 text-white" />
                              </div>
                              <Badge className="absolute top-2 right-2 bg-red-600 text-white text-xs animate-pulse">
                                LIVE
                              </Badge>
                            </div>
                            <div>
                              <h4 className="font-semibold text-white text-sm line-clamp-2">{stream.title}</h4>
                              <p className="text-gray-400 text-xs mt-1">{stream.channelTitle}</p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center text-xs text-gray-400">
                                  <Users className="h-3 w-3 mr-1" />
                                  {stream.viewerCount?.toLocaleString() || 'Live'}
                                </div>
                                <Button 
                                  size="sm" 
                                  className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1"
                                  onClick={() => handleStreamSelect(stream, 'youtube')}
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Watch Live
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* YouTube Search */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Youtube className="h-5 w-5 mr-2 text-red-500" />
                  YouTube Sports Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for teams, games, or sports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-gray-800 border-gray-700 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && searchYouTubeStreams(searchQuery)}
                  />
                  <Button 
                    onClick={() => searchYouTubeStreams(searchQuery)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Games from Sports Data with YouTube Integration */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Today's Live Games</h3>
              {Array.isArray(sportsEvents) ? sportsEvents.slice(0, 6).map((game: any) => (
                <Card key={game.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            {game.sport}
                          </Badge>
                          {game.status === 'live' && (
                            <Badge variant="destructive" className="animate-pulse">
                              LIVE
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-white text-lg">
                          {game.homeTeam?.name || game.homeTeam} vs {game.awayTeam?.name || game.awayTeam}
                        </h4>
                        <p className="text-gray-400 text-sm">{game.league}</p>
                      </div>
                      <div className="text-right">
                        <EnhancedUniversalSportsRouter
                          sportKey={game.sport_key || 'general_sports'}
                          gameId={game.id}
                          homeTeam={game.homeTeam?.name || game.homeTeam}
                          awayTeam={game.awayTeam?.name || game.awayTeam}
                          variant="default"
                          enableEmbedMode={true}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : null}
            </div>
          </div>
        )}
      </TabsContent>

      {/* Search Results Tab */}
      <TabsContent value="search" className="mt-6">
        {searchResults.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Search Results for "{searchQuery}"</h3>
            {searchResults.map((stream) => (
              <Card key={stream.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 cursor-pointer"
                    onClick={() => setSelectedStream(stream)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {stream.thumbnail && (
                      <img src={stream.thumbnail} alt={stream.name} className="w-20 h-14 rounded object-cover" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStreamIcon(stream.streamType)}
                        <h4 className="font-semibold text-white">{stream.name}</h4>
                        {stream.isLive && (
                          <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        {getQualityBadge(stream.quality)}
                        <span className="text-sm text-gray-400">{stream.sport} • {stream.league}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{stream.language.toUpperCase()} • {stream.country}</span>
                        {stream.channelName && <span>• {stream.channelName}</span>}
                      </div>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Play className="h-4 w-4 mr-1" />
                      Watch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="text-center py-12">
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-semibold mb-2 text-white">No Search Results</h3>
              <p className="text-gray-400">Use the YouTube search or browse live streams to find content.</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
      </div>

      {/* Stream Selector Overlay */}
      {showStreamSelector && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Select Live Stream</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStreamSelector(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <Tabs defaultValue="live-games" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="live-games">Live Sports</TabsTrigger>
                  <TabsTrigger value="youtube">YouTube Live</TabsTrigger>
                  <TabsTrigger value="iptv">IPTV Channels</TabsTrigger>
                </TabsList>
                
                <TabsContent value="live-games" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {liveGames.slice(0, 9).map((game) => (
                      <Card key={game.id} className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors cursor-pointer" onClick={() => handleStreamSelect(game, 'sports')}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs">
                              {game.sport}
                            </Badge>
                            <h4 className="font-semibold text-white text-sm">{game.title}</h4>
                            <p className="text-gray-400 text-xs">{game.league}</p>
                            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                              <Play className="h-3 w-3 mr-1" />
                              Watch
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="youtube" className="mt-4">
                  {hasVIPAccess ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {youtubeStreams && 'streams' in youtubeStreams && Array.isArray(youtubeStreams.streams) ? youtubeStreams.streams.slice(0, 9).map((stream: any) => (
                        <Card key={stream.videoId} className="bg-gray-800 border-gray-700 hover:border-red-500 transition-colors cursor-pointer" onClick={() => handleStreamSelect(stream, 'youtube')}>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <img src={stream.thumbnail} alt={stream.title} className="w-full h-20 object-cover rounded" />
                              <h4 className="font-semibold text-white text-sm line-clamp-2">{stream.title}</h4>
                              <p className="text-gray-400 text-xs">{stream.channelTitle}</p>
                              <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                                <Play className="h-3 w-3 mr-1" />
                                Watch
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )) : null}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Lock className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                      <h3 className="text-lg font-semibold text-white mb-2">VIP Access Required</h3>
                      <p className="text-gray-400">YouTube streaming is available for VIP members only.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="iptv" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {iptvChannels?.channels?.slice(0, 9).map((channel: any) => (
                      <Card key={channel.id} className="bg-gray-800 border-gray-700 hover:border-green-500 transition-colors cursor-pointer" onClick={() => handleStreamSelect(channel, 'iptv')}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                              {channel.category}
                            </Badge>
                            <h4 className="font-semibold text-white text-sm">{channel.name}</h4>
                            <p className="text-gray-400 text-xs">{channel.country} • {channel.language}</p>
                            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                              <Play className="h-3 w-3 mr-1" />
                              Watch
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}