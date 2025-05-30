import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Gamepad2, 
  TrendingUp, 
  Users, 
  Zap, 
  Target, 
  Trophy,
  MessageCircle,
  Crown,
  Eye,
  Clock,
  Play,
  Pause,
  Volume2,
  Star,
  Flame,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Headphones,
  Wifi
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { reportError } from '@/utils/errorReporting';

interface LiveMatch {
  id: string;
  game: string;
  tournament: string;
  team1: { name: string; logo: string; score: number };
  team2: { name: string; logo: string; score: number };
  status: 'live' | 'upcoming' | 'finished';
  viewers: number;
  timeElapsed?: string;
  currentMap?: string;
  round?: number;
  nextObjective?: string;
  economy?: string;
  odds: {
    team1Win: number;
    team2Win: number;
    nextKill?: { team1: number; team2: number };
    nextRound?: { team1: number; team2: number };
    };
  streaming: {
    platform: string;
    url: string;
    quality: string;
  };
}

interface PlayerProp {
  id: string;
  player: string;
  team: string;
  game: string;
  prop: string;
  line: number;
  over: number;
  under: number;
  form: string;
  confidence: 'high' | 'medium' | 'low';
  recentStats: string;
}

const EsportsHub: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedGame, setSelectedGame] = useState('all');
  const [liveBets, setLiveBets] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [betAmount, setBetAmount] = useState('');
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  // Enhanced live matches data
  const mockLiveMatches: LiveMatch[] = [
    {
      id: 'lol-t1-vs-gen',
      game: 'League of Legends',
      tournament: 'LCK Spring 2025',
      team1: { name: 'T1', logo: '🏆', score: 2 },
      team2: { name: 'Gen.G', logo: '⚡', score: 1 },
      status: 'live',
      viewers: 287000,
      timeElapsed: '28:45',
      nextObjective: 'Baron spawns in 1:15',
      odds: {
        team1Win: 1.45,
        team2Win: 2.80,
        nextKill: { team1: 1.65, team2: 2.35 },
        nextRound: { team1: 1.55, team2: 2.45 }
      },
      streaming: {
        platform: 'Twitch',
        url: 'https://twitch.tv/lck',
        quality: '1080p60'
      }
    },
    {
      id: 'cs2-navi-vs-faze',
      game: 'CS2',
      tournament: 'IEM Katowice 2025',
      team1: { name: 'NAVI', logo: '🌟', score: 14 },
      team2: { name: 'FaZe', logo: '🔥', score: 11 },
      status: 'live',
      viewers: 195000,
      currentMap: 'Mirage',
      round: 26,
      economy: 'NAVI force buy, FaZe full buy',
      odds: {
        team1Win: 1.25,
        team2Win: 3.90,
        nextRound: { team1: 1.95, team2: 1.90 }
      },
      streaming: {
        platform: 'YouTube',
        url: 'https://youtube.com/watch?v=iem',
        quality: '4K'
      }
    },
    {
      id: 'val-sen-vs-fnc',
      game: 'Valorant',
      tournament: 'VCT Masters',
      team1: { name: 'Sentinels', logo: '🛡️', score: 8 },
      team2: { name: 'Fnatic', logo: '🦊', score: 4 },
      status: 'live',
      viewers: 156000,
      currentMap: 'Ascent',
      round: 13,
      odds: {
        team1Win: 1.35,
        team2Win: 3.20,
        nextRound: { team1: 1.75, team2: 2.15 }
      },
      streaming: {
        platform: 'Twitch',
        url: 'https://twitch.tv/valorant',
        quality: '1080p60'
      }
    },
    {
      id: 'dota-og-vs-spirit',
      game: 'Dota 2',
      tournament: 'The International 2025',
      team1: { name: 'OG', logo: '🌸', score: 0 },
      team2: { name: 'Team Spirit', logo: '👻', score: 1 },
      status: 'live',
      viewers: 425000,
      timeElapsed: '35:22',
      nextObjective: 'Roshan respawns in 3:45',
      odds: {
        team1Win: 2.10,
        team2Win: 1.75,
        nextKill: { team1: 2.25, team2: 1.70 }
      },
      streaming: {
        platform: 'Steam',
        url: 'https://steam.tv/dota2',
        quality: '1080p60'
      }
    }
  ];

  // Enhanced player props
  const mockPlayerProps: PlayerProp[] = [
    {
      id: 'faker-kills-lol',
      player: 'Faker',
      team: 'T1',
      game: 'League of Legends',
      prop: 'Total Kills',
      line: 4.5,
      over: -110,
      under: -110,
      form: '8.2 avg last 5 games',
      confidence: 'high',
      recentStats: '12/3/15 last game'
    },
    {
      id: 's1mple-adr-cs2',
      player: 's1mple',
      team: 'NAVI',
      game: 'CS2',
      prop: 'ADR (Average Damage)',
      line: 85.5,
      over: -115,
      under: -105,
      form: '89.4 avg on Mirage',
      confidence: 'high',
      recentStats: '92.3 ADR last 3 maps'
    },
    {
      id: 'tenz-kills-val',
      player: 'TenZ',
      team: 'Sentinels',
      game: 'Valorant',
      prop: 'Round KD Ratio',
      line: 1.2,
      over: -120,
      under: +100,
      form: '1.34 KD last 10 maps',
      confidence: 'medium',
      recentStats: '24/18/7 last map'
    },
    {
      id: 'topson-gpm-dota',
      player: 'Topson',
      team: 'OG',
      game: 'Dota 2',
      prop: 'GPM (Gold Per Minute)',
      line: 650.5,
      over: -105,
      under: -115,
      form: '680 avg as mid',
      confidence: 'high',
      recentStats: '715 GPM last game'
    }
  ];

  // Initialize with some chat messages
  useEffect(() => {
    setChatMessages([
      {
        id: 1,
        user: 'EsportsKing',
        message: 'NAVI looking incredibly strong on Mirage! 🔥',
        timestamp: new Date().toISOString(),
        type: 'chat',
        avatar: '👑'
      },
      {
        id: 2,
        user: 'CryptoBetter',
        message: 'Just hit a 3.2x on Faker kills! LFG! 💰',
        timestamp: new Date().toISOString(),
        type: 'win',
        avatar: '💎'
      },
      {
        id: 3,
        user: 'ProGamer',
        message: 'That Baron call was absolutely insane 😱',
        timestamp: new Date().toISOString(),
        type: 'chat',
        avatar: '🎮'
      },
      {
        id: 4,
        user: 'MicroMaster',
        message: 'Live betting on round winners is so addictive 🎯',
        timestamp: new Date().toISOString(),
        type: 'chat',
        avatar: '⚡'
      }
    ]);
  }, []);

  const placeMicroBet = (betType: string, odds: number, amount: string) => {
    if (!betAmount) {
      toast({
        title: "Enter bet amount",
        description: "You need to specify how much to bet",
        variant: "destructive"
      });
      return;
    }

    const newBet = {
      id: Date.now(),
      type: betType,
      odds,
      amount: parseFloat(amount),
      timestamp: new Date().toISOString(),
      status: 'pending',
      potential: parseFloat(amount) * Math.abs(odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1)
    };

    setLiveBets([...liveBets, newBet]);

    toast({
      title: "Micro-bet placed! 🎯",
      description: `${betType} bet for $${amount} at ${odds > 0 ? '+' : ''}${odds} odds`,
    });

    setBetAmount('');
  };

  const sendChatMessage = (message: string) => {
    const newMessage = {
      id: Date.now(),
      user: user?.username || 'Anonymous',
      message,
      timestamp: new Date().toISOString(),
      type: 'chat',
      avatar: '🆕'
    };

    setChatMessages([...chatMessages, newMessage]);
  };

  const watchLiveStream = (matchId: string) => {
    setSelectedMatch(matchId);
    setIsLiveStreamOpen(true);
    toast({
      title: "Opening Live Stream",
      description: "Connecting to official tournament stream...",
    });
  };

    const handleCloseLiveStream = () => {
        setIsLiveStreamOpen(false);
    };

  const filteredMatches = selectedGame === 'all' 
    ? mockLiveMatches 
    : mockLiveMatches.filter(match => 
        match.game.toLowerCase().includes(selectedGame.toLowerCase())
      );

  const totalViewers = mockLiveMatches.reduce((sum, match) => sum + match.viewers, 0);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Live Stream Modal */}
      {isLiveStreamOpen && selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Live Stream - Match {selectedMatch}</h2>
              <Button onClick={handleCloseLiveStream} variant="outline">
                Close Stream
              </Button>
            </div>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-4xl mb-2">🔴</div>
                <p>Live Stream Active</p>
                <p className="text-sm opacity-75">Match ID: {selectedMatch}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3"
          >
            <Gamepad2 className="h-10 w-10 text-purple-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-500 bg-clip-text text-transparent">
              WeParlay Esports Hub
            </h1>
            <Trophy className="h-10 w-10 text-yellow-500" />
          </motion.div>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional esports betting with live streams, micro-bets, player props, and real-time community chat
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge variant="outline" className="text-red-600 border-red-600 animate-pulse">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-ping" />
              LIVE NOW
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Eye className="h-3 w-3 mr-1" />
              {totalViewers.toLocaleString()} Watching
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Users className="h-3 w-3 mr-1" />
              1.8K Betting Live
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              <Zap className="h-3 w-3 mr-1" />
              Instant Payouts
            </Badge>
          </div>
        </div>

        {/* Live Stats Dashboard */}
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 via-blue-50 to-green-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{mockLiveMatches.length}</div>
                <div className="text-sm text-gray-600">Live Matches</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{mockPlayerProps.length}</div>
                <div className="text-sm text-gray-600">Player Props</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{totalViewers.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Viewers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">$2.4M</div>
                <div className="text-sm text-gray-600">Daily Volume</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Betting Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={selectedGame} onValueChange={setSelectedGame}>
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="all">All Games</TabsTrigger>
                <TabsTrigger value="lol">LoL</TabsTrigger>
                <TabsTrigger value="cs2">CS2</TabsTrigger>
                <TabsTrigger value="valorant">Valorant</TabsTrigger>
                <TabsTrigger value="dota">Dota 2</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedGame} className="space-y-6">
                {/* Live Matches */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Wifi className="h-5 w-5 text-green-500" />
                        Live Matches
                      </span>
                      <Badge className="bg-red-500 text-white animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
                        LIVE
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <AnimatePresence>
                      {filteredMatches.map(match => (
                        <motion.div
                          key={match.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="border rounded-xl p-6 space-y-4 bg-gradient-to-r from-gray-50 to-white hover:shadow-lg transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline">{match.game}</Badge>
                                <Badge variant="secondary" className="animate-pulse">LIVE</Badge>
                                <Button
                                  size="sm"
                                  onClick={() => watchLiveStream(match.id)}
                                  className="gap-2"
                                >
                                  <Play className="h-3 w-3" />
                                  Watch Live
                                </Button>
                              </div>
                              <h3 className="font-bold text-xl">
                                {match.team1.logo} {match.team1.name} vs {match.team2.name} {match.team2.logo}
                              </h3>
                              <p className="text-gray-600">{match.tournament}</p>
                              <div className="flex items-center gap-6 text-sm text-gray-500 mt-2">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {match.viewers.toLocaleString()} viewers
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {match.timeElapsed || `Round ${match.round}`}
                                </span>
                                {match.streaming && (
                                  <span className="flex items-center gap-1">
                                    <Headphones className="h-3 w-3" />
                                    {match.streaming.quality} on {match.streaming.platform}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-3xl font-bold mb-2">
                                {match.team1.score} - {match.team2.score}
                              </div>
                              {match.nextObjective && (
                                <p className="text-xs text-orange-600 mb-1">{match.nextObjective}</p>
                              )}
                              {match.economy && (
                                <p className="text-xs text-blue-600">{match.economy}</p>
                              )}
                              {match.currentMap && (
                                <p className="text-xs text-purple-600">Map: {match.currentMap}</p>
                              )}
                            </div>
                          </div>

                          {/* Match Winner Odds */}
                          <div className="border-t pt-4">
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                              🏆 Match Winner
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                variant="outline"
                                className="flex flex-col p-4 h-auto"
                                onClick={() => placeMicroBet(`${match.team1.name} to win`, match.odds.team1Win, betAmount)}
                              >
                                <span className="font-bold">{match.team1.name}</span>
                                <span className="text-lg text-green-600">{match.odds.team1Win}</span>
                              </Button>
                              <Button
                                variant="outline"
                                className="flex flex-col p-4 h-auto"
                                onClick={() => placeMicroBet(`${match.team2.name} to win`, match.odds.team2Win, betAmount)}
                              >
                                <span className="font-bold">{match.team2.name}</span>
                                <span className="text-lg text-green-600">{match.odds.team2Win}</span>
                              </Button>
                            </div>
                          </div>

                          {/* Micro-betting options */}
                          {(match.odds.nextKill || match.odds.nextRound) && (
                            <div className="border-t pt-4">
                              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                ⚡ Live Micro-Bets
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {match.odds.nextKill && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex flex-col p-3 h-auto border-green-200 hover:bg-green-50"
                                      onClick={() => placeMicroBet(`${match.team1.name} Next Kill`, match.odds.nextKill!.team1, betAmount)}
                                    >
                                      <span className="text-xs">Next Kill</span>
                                      <span className="font-bold">{match.team1.name}</span>
                                      <span className="text-green-600">{match.odds.nextKill.team1}</span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex flex-col p-3 h-auto border-green-200 hover:bg-green-50"
                                      onClick={() => placeMicroBet(`${match.team2.name} Next Kill`, match.odds.nextKill!.team2, betAmount)}
                                    >
                                      <span className="text-xs">Next Kill</span>
                                      <span className="font-bold">{match.team2.name}</span>
                                      <span className="text-green-600">{match.odds.nextKill.team2}</span>
                                    </Button>
                                  </>
                                )}

                                {match.odds.nextRound && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex flex-col p-3 h-auto border-blue-200 hover:bg-blue-50"
                                      onClick={() => placeMicroBet(`${match.team1.name} Next Round`, match.odds.nextRound!.team1, betAmount)}
                                    >
                                      <span className="text-xs">Next Round</span>
                                      <span className="font-bold">{match.team1.name}</span>
                                      <span className="text-blue-600">{match.odds.nextRound.team1}</span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex flex-col p-3 h-auto border-blue-200 hover:bg-blue-50"
                                      onClick={() => placeMicroBet(`${match.team2.name} Next Round`, match.odds.nextRound!.team2, betAmount)}
                                    >
                                      <span className="text-xs">Next Round</span>
                                      <span className="font-bold">{match.team2.name}</span>
                                      <span className="text-blue-600">{match.odds.nextRound.team2}</span>
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* Player Props */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        🎯 Player Performance Props
                      </span>
                      <Badge className="bg-green-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        HOT
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockPlayerProps
                      .filter(prop => selectedGame === 'all' || prop.game.toLowerCase().includes(selectedGame.toLowerCase()))
                      .map(prop => (
                      <motion.div 
                        key={prop.id} 
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-lg">{prop.player}</span>
                              <Badge variant="outline">{prop.team}</Badge>
                              <Badge variant="secondary">{prop.game}</Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-1">{prop.prop}</div>
                            <div className="text-xs text-blue-600">{prop.form}</div>
                            <div className="text-xs text-green-600">{prop.recentStats}</div>
                          </div>
                          <Badge 
                            variant={prop.confidence === 'high' ? 'default' : prop.confidence === 'medium' ? 'secondary' : 'outline'}
                            className="flex items-center gap-1"
                          >
                            {prop.confidence === 'high' && <Flame className="h-3 w-3" />}
                            {prop.confidence} confidence
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            className="flex flex-col p-4 h-auto border-green-200 hover:bg-green-50"
                            onClick={() => placeMicroBet(`${prop.player} Over ${prop.line}`, prop.over, betAmount)}
                          >
                            <span className="text-xs text-gray-500">OVER</span>
                            <span className="text-lg font-bold">{prop.line}</span>
                            <span className="text-green-600 flex items-center gap-1">
                              <ArrowUp className="h-3 w-3" />
                              {prop.over}
                            </span>
                          </Button>
                          <Button
                            variant="outline"
                            className="flex flex-col p-4 h-auto border-red-200 hover:bg-red-50"
                            onClick={() => placeMicroBet(`${prop.player} Under ${prop.line}`, prop.under, betAmount)}
                          >
                            <span className="text-xs text-gray-500">UNDER</span>
                            <span className="text-lg font-bold">{prop.line}</span>
                            <span className="text-red-600 flex items-center gap-1">
                              <ArrowDown className="h-3 w-3" />
                              {prop.under}
                            </span>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Quick Bet Amount */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Quick Bet Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Enter amount ($)"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="mb-3"
                  type="number"
                  min="1"
                />
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['10', '25', '50'].map(amount => (
                    <Button
                      key={amount}
                      size="sm"
                      variant="outline"
                      onClick={() => setBetAmount(amount)}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['100', '250', '500'].map(amount => (
                    <Button
                      key={amount}
                      size="sm"
                      variant="outline"
                      onClick={() => setBetAmount(amount)}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Live Bets Tracker */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  Your Live Bets
                  {liveBets.length > 0 && (
                    <Badge variant="secondary">{liveBets.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {liveBets.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {liveBets.slice(-8).map(bet => (
                      <motion.div 
                        key={bet.id} 
                        className="text-xs p-3 bg-gradient-to-r from-gray-50 to-white border rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="font-medium mb-1">{bet.type}</div>
                        <div className="text-gray-600 flex items-center gap-2">
                          <span>${bet.amount}</span>
                          <span>@{bet.odds > 0 ? '+' : ''}{bet.odds}</span>
                          <DollarSign className="h-3 w-3" />
                          <span className="text-green-600">${bet.potential.toFixed(2)}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {bet.status}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No live bets yet</p>
                    <p className="text-xs">Place your first micro-bet!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  Live Chat
                  <Badge variant="outline" className="text-xs">
                    {chatMessages.length + 127} online
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 h-40 overflow-y-auto mb-3 text-xs">
                  {chatMessages.map(msg => (
                    <motion.div 
                      key={msg.id} 
                      className={`p-2 rounded ${
                        msg.type === 'win' 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-gray-50'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span>{msg.avatar}</span>
                        <span className="font-bold text-blue-600">{msg.user}:</span>
                        {msg.type === 'win' && <Badge className="text-xs bg-green-500">WIN</Badge>}
                      </div>
                      <span>{msg.message}</span>
                    </motion.div>
                  ))}
                </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type message..."
                  className="text-xs"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      sendChatMessage(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button size="sm">
                  <MessageCircle className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Top Winners Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                Today's Top Winners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                {[
                  { user: 'EsportsGod', profit: '+$3,247', badge: '👑', streak: '7W' },
                  { user: 'CryptoDegen', profit: '+$2,156', badge: '💎', streak: '5W' },
                  { user: 'MicroKing', profit: '+$1,832', badge: '⚡', streak: '12W' },
                  { user: 'PropMaster', profit: '+$1,445', badge: '🎯', streak: '4W' },
                  { user: 'LiveBetLord', profit: '+$1,203', badge: '🔥', streak: '8W' }
                ].map((winner, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded border"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{winner.badge}</span>
                      <div>
                        <div className="font-medium">{winner.user}</div>
                        <div className="text-xs text-gray-500">{winner.streak} streak</div>
                      </div>
                    </div>
                    <span className="font-bold text-green-600">{winner.profit}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
};

export default EsportsHub;