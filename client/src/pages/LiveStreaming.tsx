import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  DollarSign,
  Target,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface BetSlip {
  gameId: string;
  betType: string;
  odds: number;
  amount: number;
  potentialWin: number;
}

export default function LiveStreaming() {
  const [selectedGame, setSelectedGame] = useState<LiveGame | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [betSlip, setBetSlip] = useState<BetSlip | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: liveGames = [], isLoading } = useQuery<LiveGame[]>({
    queryKey: ['/api/live-games'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: userBalance = 0 } = useQuery<number>({
    queryKey: ['/api/user/cash-balance'],
    refetchInterval: 10000,
  });

  const handleGameSelect = (game: LiveGame) => {
    setSelectedGame(game);
    setIsPlaying(true);
  };

  const handleBetPlace = (gameId: string, betType: string, odds: number) => {
    const potentialWin = betAmount * odds;
    setBetSlip({
      gameId,
      betType,
      odds,
      amount: betAmount,
      potentialWin
    });
  };

  const confirmBet = async () => {
    if (!betSlip) return;

    try {
      const response = await fetch('/api/bets/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: betSlip.gameId,
          betType: betSlip.betType,
          amount: betSlip.amount,
          odds: betSlip.odds
        }),
      });

      if (response.ok) {
        toast({
          title: "Bet Placed Successfully!",
          description: `$${betSlip.amount} bet placed. Potential win: $${betSlip.potentialWin.toFixed(2)}`,
        });
        setBetSlip(null);
      } else {
        throw new Error('Failed to place bet');
      }
    } catch (error) {
      toast({
        title: "Bet Failed",
        description: "Unable to place bet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Live Sports Streaming</h1>
          <p className="text-gray-300">Watch live games and place bets in real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Live Games Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-red-500" />
                  Live Games
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-700 rounded-lg p-3 animate-pulse">
                        <div className="h-4 bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 bg-gray-600 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  liveGames.map((game) => (
                    <Card 
                      key={game.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedGame?.id === game.id 
                          ? 'bg-blue-600 border-blue-500' 
                          : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      }`}
                      onClick={() => handleGameSelect(game)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={game.status === 'live' ? 'destructive' : 'secondary'}>
                            {game.status === 'live' ? 'LIVE' : game.status.toUpperCase()}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-400">
                            <Users className="w-3 h-3 mr-1" />
                            {game.viewers?.toLocaleString() || '0'}
                          </div>
                        </div>
                        
                        <div className="text-sm font-medium text-white mb-1">
                          {game.homeTeam.name} vs {game.awayTeam.name}
                        </div>
                        
                        {game.status === 'live' && (
                          <div className="flex justify-between text-xs text-gray-300">
                            <span>{game.homeTeam.score} - {game.awayTeam.score}</span>
                            <span>{game.period} • {game.timeRemaining}</span>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-400 mt-1">
                          {game.league} • {game.sport}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedGame ? (
              <div className="space-y-6">
                {/* Video Player */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-0">
                    <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      {/* Actual Video Stream */}
                      {selectedGame.streamUrl ? (
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted={isMuted}
                          controls={false}
                          onLoadStart={() => setIsPlaying(true)}
                          onError={(e) => {
                            console.error('Video stream error:', e);
                            toast({
                              title: "Stream Error",
                              description: "Unable to load video stream. Trying backup source...",
                              variant: "destructive",
                            });
                          }}
                        >
                          <source src={selectedGame.streamUrl} type="application/x-mpegURL" />
                          <source src={selectedGame.streamUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                          <div className="text-center">
                            <Play className="w-16 h-16 text-white mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">
                              {selectedGame.homeTeam.name} vs {selectedGame.awayTeam.name}
                            </h3>
                            <p className="text-gray-400">{selectedGame.league} • {selectedGame.sport}</p>
                            <p className="text-red-400 mt-2">Stream loading...</p>
                            {selectedGame.status === 'live' && (
                              <div className="mt-4 space-y-2">
                                <div className="text-2xl font-bold text-white">
                                  {selectedGame.homeTeam.score} - {selectedGame.awayTeam.score}
                                </div>
                                <div className="text-sm text-gray-300">
                                  {selectedGame.period} • {selectedGame.timeRemaining}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Video Controls */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="text-white hover:bg-white/20"
                            >
                              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsMuted(!isMuted)}
                              className="text-white hover:bg-white/20"
                            >
                              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className="flex items-center text-white text-sm">
                              <Users className="w-4 h-4 mr-1" />
                              {selectedGame.viewers?.toLocaleString() || '0'} viewers
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleFullscreen}
                              className="text-white hover:bg-white/20"
                            >
                              <Maximize className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Betting Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Live Odds */}
                  <div className="lg:col-span-2">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Target className="w-5 h-5 mr-2 text-green-500" />
                          Live Betting Odds
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Home Team Win */}
                          <Button
                            className="h-20 bg-blue-600 hover:bg-blue-700 text-white flex flex-col justify-center"
                            onClick={() => handleBetPlace(selectedGame.id, 'home_win', selectedGame.odds.homeWin)}
                          >
                            <div className="text-sm font-medium">{selectedGame.homeTeam.name}</div>
                            <div className="text-lg font-bold">+{selectedGame.odds.homeWin}</div>
                            <div className="text-xs opacity-80">Win</div>
                          </Button>

                          {/* Draw (if applicable) */}
                          {selectedGame.odds.draw && (
                            <Button
                              className="h-20 bg-gray-600 hover:bg-gray-700 text-white flex flex-col justify-center"
                              onClick={() => handleBetPlace(selectedGame.id, 'draw', selectedGame.odds.draw!)}
                            >
                              <div className="text-sm font-medium">Draw</div>
                              <div className="text-lg font-bold">+{selectedGame.odds.draw}</div>
                              <div className="text-xs opacity-80">Tie</div>
                            </Button>
                          )}

                          {/* Away Team Win */}
                          <Button
                            className="h-20 bg-red-600 hover:bg-red-700 text-white flex flex-col justify-center"
                            onClick={() => handleBetPlace(selectedGame.id, 'away_win', selectedGame.odds.awayWin)}
                          >
                            <div className="text-sm font-medium">{selectedGame.awayTeam.name}</div>
                            <div className="text-lg font-bold">+{selectedGame.odds.awayWin}</div>
                            <div className="text-xs opacity-80">Win</div>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Bet Slip */}
                  <div className="lg:col-span-1">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <DollarSign className="w-5 h-5 mr-2 text-yellow-500" />
                          Bet Slip
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-sm text-gray-300">
                          Balance: <span className="text-green-400 font-semibold">${userBalance.toFixed(2)}</span>
                        </div>

                        {betSlip ? (
                          <div className="space-y-4">
                            <div className="bg-gray-700 rounded-lg p-3">
                              <div className="text-sm text-white mb-2">{betSlip.betType.replace('_', ' ').toUpperCase()}</div>
                              <div className="text-xs text-gray-400 mb-2">Odds: +{betSlip.odds}</div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-300">Stake:</span>
                                  <span className="text-white">${betSlip.amount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-300">Potential Win:</span>
                                  <span className="text-green-400 font-semibold">${betSlip.potentialWin.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm text-gray-300">Bet Amount ($)</label>
                              <input
                                type="number"
                                value={betAmount}
                                onChange={(e) => setBetAmount(Number(e.target.value))}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                min="1"
                                max={userBalance}
                              />
                            </div>

                            <Button
                              onClick={confirmBet}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                              disabled={betAmount > userBalance || betAmount < 1}
                            >
                              Confirm Bet
                            </Button>

                            <Button
                              onClick={() => setBetSlip(null)}
                              variant="outline"
                              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              Clear Slip
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 py-8">
                            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Select odds to place a bet</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Select a Live Game</h3>
                    <p className="text-gray-400">Choose a game from the sidebar to start watching and betting</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}