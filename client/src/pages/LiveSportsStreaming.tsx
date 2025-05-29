import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Eye, Users, Wifi, Timer, Share2, Star, X, ArrowLeft, TrendingUp, Crown, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionTier, canUserAccess } from '../../../shared/tierSystem';


// Types for live streaming
interface LiveStream {
  id: string;
  title: string;
  sport: string;
  league: string;
  homeTeam: {
    name: string;
    logo: string;
    score: number;
  };
  awayTeam: {
    name: string;
    logo: string;
    score: number;
  };
  status: 'live' | 'upcoming' | 'completed';
  viewers: number;
  streamUrl: string;
  thumbnailUrl: string;
  startTime: string;
  period: string;
  timeRemaining: string;
  odds: {
    homeWin: number;
    awayWin: number;
    draw?: number;
  };
  isEsport: boolean;
}

interface SportCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const LiveSportsStreaming: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bettingSlipOpen, setBettingSlipOpen] = useState(false);
  const [liveBets, setLiveBets] = useState<any[]>([]);

  // Check if user has access to live streaming (Platinum only)
  const hasLiveStreamAccess = user?.tier && canUserAccess(user.tier as SubscriptionTier, 'liveStreamingAccess');

  // Fetch live streams from your unified sports API
  const { data: liveStreams = [], isLoading } = useQuery({
    queryKey: ['/api/live-streams', selectedSport],
    refetchInterval: 10000, // Update every 10 seconds
  });

  // Fetch sports categories
  const { data: sportsCategories = [] } = useQuery({
    queryKey: ['/api/sports-categories'],
  });

  // Mock data for development (replace with real API data)
  const mockStreams: LiveStream[] = [
    {
      id: 'nfl-1',
      title: 'Kansas City Chiefs vs Buffalo Bills',
      sport: 'football',
      league: 'NFL',
      homeTeam: {
        name: 'Kansas City Chiefs',
        logo: 'https://logos-world.net/wp-content/uploads/2020/06/Kansas-City-Chiefs-Logo.png',
        score: 28
      },
      awayTeam: {
        name: 'Buffalo Bills',
        logo: 'https://logos-world.net/wp-content/uploads/2020/06/Buffalo-Bills-Logo.png',
        score: 24
      },
      status: 'live',
      viewers: 485000,
      streamUrl: 'https://www.youtube.com/watch?v=live_nfl_stream',
      thumbnailUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80',
      startTime: new Date().toISOString(),
      period: '4th Quarter',
      timeRemaining: '03:45',
      odds: {
        homeWin: 1.85,
        awayWin: 1.95
      },
      isEsport: false
    },
    {
      id: 'nba-1',
      title: 'Los Angeles Lakers vs Boston Celtics',
      sport: 'basketball',
      league: 'NBA',
      homeTeam: {
        name: 'Los Angeles Lakers',
        logo: 'https://logos-world.net/wp-content/uploads/2020/05/Los-Angeles-Lakers-Logo.png',
        score: 112
      },
      awayTeam: {
        name: 'Boston Celtics',
        logo: 'https://logos-world.net/wp-content/uploads/2020/06/Boston-Celtics-Logo.png',
        score: 108
      },
      status: 'live',
      viewers: 324000,
      streamUrl: 'https://www.youtube.com/watch?v=live_nba_stream',
      thumbnailUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
      startTime: new Date().toISOString(),
      period: '4th Quarter',
      timeRemaining: '02:18',
      odds: {
        homeWin: 1.75,
        awayWin: 2.10
      },
      isEsport: false
    },
    {
      id: 'esports-1',
      title: 'T1 vs Gen.G - LCK Finals',
      sport: 'esports',
      league: 'LCK',
      homeTeam: {
        name: 'T1',
        logo: 'https://am-a.akamaihd.net/image?resize=72:72&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1592594612171_T1-01-FullonDark.png',
        score: 2
      },
      awayTeam: {
        name: 'Gen.G',
        logo: 'https://am-a.akamaihd.net/image?resize=72:72&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FGenG-01-FullonDark.png',
        score: 1
      },
      status: 'live',
      viewers: 892000,
      streamUrl: 'https://www.twitch.tv/lck',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
      startTime: new Date().toISOString(),
      period: 'Game 4',
      timeRemaining: '28:45',
      odds: {
        homeWin: 1.45,
        awayWin: 2.75
      },
      isEsport: true
    }
  ];

  const mockCategories: SportCategory[] = [
    { id: 'all', name: 'All Sports', icon: '🎯', count: mockStreams.length },
    { id: 'football', name: 'NFL', icon: '🏈', count: 1 },
    { id: 'basketball', name: 'NBA', icon: '🏀', count: 1 },
    { id: 'soccer', name: 'Soccer', icon: '⚽', count: 0 },
    { id: 'esports', name: 'Esports', icon: '🎮', count: 1 },
    { id: 'hockey', name: 'NHL', icon: '🏒', count: 0 },
    { id: 'baseball', name: 'MLB', icon: '⚾', count: 0 }
  ];

  // Filter streams based on selected sport and search
  const filteredStreams = mockStreams.filter(stream => {
    const matchesSport = selectedSport === 'all' || stream.sport === selectedSport;
    const matchesSearch = stream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stream.homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stream.awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSport && matchesSearch;
  });

  const placeLiveBet = (streamId: string, betType: string, odds: number, amount: number) => {
    const newBet = {
      id: Date.now(),
      streamId,
      betType,
      odds,
      amount,
      potentialWin: amount * odds,
      timestamp: new Date().toISOString()
    };

    setLiveBets([...liveBets, newBet]);
    toast({
      title: "Live Bet Placed! 🎯",
      description: `${betType} bet for $${amount} placed successfully`,
    });
  };

  const StreamCard = ({ stream }: { stream: LiveStream }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
      onClick={() => setSelectedStream(stream)}
    >
      <div className="relative">
        <img 
          src={stream.thumbnailUrl} 
          alt={stream.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Live badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge className="bg-red-600 text-white animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
            LIVE
          </Badge>
          {stream.isEsport && (
            <Badge className="bg-purple-600 text-white">ESPORTS</Badge>
          )}
        </div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-green-600 rounded-full p-4 transform group-hover:scale-110 transition-transform">
            <PlayCircle className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Viewer count */}
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="bg-black/50 border-gray-600 text-white">
            <Eye className="h-3 w-3 mr-1" />
            {stream.viewers.toLocaleString()}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">{stream.league}</Badge>
          <div className="flex items-center text-xs text-gray-400">
            <Timer className="h-3 w-3 mr-1" />
            {stream.period} • {stream.timeRemaining}
          </div>
        </div>

        <h3 className="text-white font-bold text-lg mb-3 line-clamp-2">{stream.title}</h3>

        {/* Teams and scores */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img src={stream.homeTeam.logo} alt={stream.homeTeam.name} className="w-8 h-8 rounded-full mr-2" />
            <div>
              <p className="text-white font-medium text-sm">{stream.homeTeam.name}</p>
              <p className="text-2xl font-bold text-green-400">{stream.homeTeam.score}</p>
            </div>
          </div>

          <div className="text-center">
            <span className="text-gray-400 text-sm">VS</span>
          </div>

          <div className="flex items-center">
            <div className="text-right">
              <p className="text-white font-medium text-sm">{stream.awayTeam.name}</p>
              <p className="text-2xl font-bold text-green-400">{stream.awayTeam.score}</p>
            </div>
            <img src={stream.awayTeam.logo} alt={stream.awayTeam.name} className="w-8 h-8 rounded-full ml-2" />
          </div>
        </div>

        {/* Live betting odds */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-gray-800 hover:bg-green-800 border-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              placeLiveBet(stream.id, `${stream.homeTeam.name} Win`, stream.odds.homeWin, 10);
            }}
          >
            Home {stream.odds.homeWin}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-gray-800 hover:bg-green-800 border-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              placeLiveBet(stream.id, `${stream.awayTeam.name} Win`, stream.odds.awayWin, 10);
            }}
          >
            Away {stream.odds.awayWin}
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const VideoPlayer = ({ stream }: { stream: LiveStream }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Player header */}
      <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedStream(null)}
            className="mr-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-white font-bold">{stream.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-red-600 text-white text-xs">LIVE</Badge>
              <span className="text-gray-400 text-sm">{stream.league} • {stream.period}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-white border-gray-600">
            <Eye className="h-3 w-3 mr-1" />
            {stream.viewers.toLocaleString()} watching
          </Badge>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Star className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedStream(null)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Player content */}
      <div className="flex-1 flex">
        {/* Video player */}
        <div className="flex-1 bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📺</div>
            <p className="text-white text-xl font-bold">{stream.title}</p>
            <p className="text-gray-400">Live Stream Active</p>
            <p className="text-sm text-gray-500 mt-2">Stream URL: {stream.streamUrl}</p>
            
            {/* Mock video player interface */}
            <div className="mt-8 p-6 bg-gray-900 rounded-lg inline-block">
              <p className="text-green-400 font-bold text-lg">
                {stream.homeTeam.name} {stream.homeTeam.score} - {stream.awayTeam.score} {stream.awayTeam.name}
              </p>
              <p className="text-gray-400 text-sm mt-2">{stream.period} • {stream.timeRemaining}</p>
            </div>
          </div>
        </div>

        {/* Sidebar with live betting */}
        <div className="w-80 bg-gray-900 overflow-y-auto">
          <div className="p-4">
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="text-white font-bold mb-3">Live Betting</h3>
              
              <div className="space-y-2 mb-4">
                <Button
                  className="w-full justify-between bg-gray-700 hover:bg-green-800"
                  onClick={() => placeLiveBet(stream.id, `${stream.homeTeam.name} Win`, stream.odds.homeWin, 25)}
                >
                  <span>{stream.homeTeam.name}</span>
                  <span className="font-bold text-green-400">{stream.odds.homeWin}</span>
                </Button>
                {stream.odds.draw && (
                  <Button
                    className="w-full justify-between bg-gray-700 hover:bg-green-800"
                    onClick={() => placeLiveBet(stream.id, 'Draw', stream.odds.draw, 25)}
                  >
                    <span>Draw</span>
                    <span className="font-bold text-green-400">{stream.odds.draw}</span>
                  </Button>
                )}
                <Button
                  className="w-full justify-between bg-gray-700 hover:bg-green-800"
                  onClick={() => placeLiveBet(stream.id, `${stream.awayTeam.name} Win`, stream.odds.awayWin, 25)}
                >
                  <span>{stream.awayTeam.name}</span>
                  <span className="font-bold text-green-400">{stream.odds.awayWin}</span>
                </Button>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setBettingSlipOpen(true)}
              >
                View Betting Slip ({liveBets.length})
              </Button>
            </div>

            {/* Live stats */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-bold mb-3">Live Stats</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>65%</span>
                    <span>Possession</span>
                    <span>35%</span>
                  </div>
                  <div className="flex h-2 bg-gray-700 rounded overflow-hidden">
                    <div className="bg-blue-500" style={{ width: '65%' }}></div>
                    <div className="bg-red-500" style={{ width: '35%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Wifi className="h-10 w-10 text-red-500 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Live Sports Streaming
            </h1>
            <PlayCircle className="h-10 w-10 text-green-500" />
          </motion.div>
          
          <p className="text-xl text-gray-300 mb-6">
            Watch live sports and bet in real-time with the ultimate streaming experience
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge className="bg-red-600 text-white animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
              {filteredStreams.length} LIVE NOW
            </Badge>
            <Badge variant="outline" className="border-green-600 text-green-600">
              <Users className="h-3 w-3 mr-1" />
              {mockStreams.reduce((sum, stream) => sum + stream.viewers, 0).toLocaleString()} Total Viewers
            </Badge>
            <Badge variant="outline" className="border-blue-600 text-blue-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Real-Time Betting
            </Badge>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search live streams, teams, or leagues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          <Button
            onClick={() => setBettingSlipOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Betting Slip ({liveBets.length})
          </Button>
        </div>

        {/* Sport categories */}
        <Tabs value={selectedSport} onValueChange={setSelectedSport} className="mb-8">
          <TabsList className="grid grid-cols-7 w-full bg-gray-800">
            {mockCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-2 data-[state=active]:bg-green-600"
              >
                <span>{category.icon}</span>
                <span className="hidden md:inline">{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Live streams grid */}
        {!hasLiveStreamAccess ? (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border-2 border-yellow-200 max-w-md mx-auto"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-4">
                  <Crown className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Platinum Exclusive</h3>
              <p className="text-gray-600 mb-4">
                Live sports streaming is available exclusively for Platinum members. 
                Upgrade now to watch live games while betting in real-time!
              </p>
              <div className="flex items-center justify-center gap-2 text-yellow-600 mb-4">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">Premium Feature</span>
              </div>
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                Upgrade to Platinum
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {filteredStreams.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">No Live Streams Found</h3>
            <p className="text-gray-500">Check back later or try a different sport category</p>
          </div>
        )}
      </div>

      {/* Video player modal */}
      <AnimatePresence>
        {selectedStream && <VideoPlayer stream={selectedStream} />}
      </AnimatePresence>

      {/* Live betting modal */}
      {bettingSlipOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg">Live Bets ({liveBets.length})</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBettingSlipOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {liveBets.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No live bets placed yet</p>
            ) : (
              <div className="space-y-3 mb-4">
                {liveBets.map(bet => (
                  <div key={bet.id} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium text-sm">{bet.betType}</p>
                        <p className="text-gray-400 text-xs">Odds: {bet.odds}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">${bet.amount}</p>
                        <p className="text-gray-400 text-xs">Win: ${bet.potentialWin.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {liveBets.length > 0 && (
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => {
                  toast({
                    title: "Bets Placed Successfully!",
                    description: `${liveBets.length} live bets have been placed`,
                  });
                  setLiveBets([]);
                  setBettingSlipOpen(false);
                }}
              >
                Place All Bets (${liveBets.reduce((sum, bet) => sum + bet.amount, 0)})
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSportsStreaming;