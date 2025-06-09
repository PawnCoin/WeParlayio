import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Hls from 'hls.js';
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
  Zap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { allSportsApiClient, type AllSportsGame } from '@/services/allSportsApiClient';

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
  const [showPlayButton, setShowPlayButton] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const { data: rawLiveGames = [], isLoading } = useQuery<LiveGame[]>({
    queryKey: ['/api/live-games'],
    refetchInterval: 30000,
  });

  // Normalize games data to ensure all required properties exist
  const liveGames = rawLiveGames.map(game => ({
    ...game,
    homeTeam: {
      name: game.homeTeam?.name || 'Home Team',
      score: game.homeTeam?.score || 0,
      logo: game.homeTeam?.logo || ''
    },
    awayTeam: {
      name: game.awayTeam?.name || 'Away Team', 
      score: game.awayTeam?.score || 0,
      logo: game.awayTeam?.logo || ''
    },
    odds: game.odds || {
      homeWin: 2.1,
      awayWin: 1.8,
      draw: 3.2
    },
    viewers: game.viewers || Math.floor(Math.random() * 5000) + 1000,
    period: game.period || 'LIVE',
    timeRemaining: game.timeRemaining || 'LIVE'
  }));

  const { data: userBalance = 0 } = useQuery<number>({
    queryKey: ['/api/user/cash-balance'],
    refetchInterval: 10000,
  });

  const { data: upcomingEvents = [] } = useQuery<any[]>({
    queryKey: ['/api/events/upcoming'],
    refetchInterval: 60000,
  });

  const handleGameSelect = (game: LiveGame) => {
    setSelectedGame(game);
    setIsPlaying(true);
  };

  const handleBetPlace = (gameId: string, betType: string, odds: number) => {
    const potentialWin = betAmount * (odds / 100);
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
        body: JSON.stringify(betSlip),
      });

      if (response.ok) {
        toast({
          title: "Bet Placed Successfully",
          description: `$${betSlip.amount} bet placed on ${betSlip.betType}`,
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
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 280;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (liveGames.length > 0 && !selectedGame) {
      setSelectedGame(liveGames[0]);
    }
  }, [liveGames, selectedGame]);

  // Initialize HLS.js when selected game changes
  useEffect(() => {
    if (selectedGame && selectedGame.streamUrl && videoRef.current) {
      const video = videoRef.current;
      
      // Clear any existing source
      video.src = '';
      
      // Add video event listeners
      const handleLoadedData = () => {
        console.log('Video data loaded, ready to play');
      };
      
      const handleCanPlay = () => {
        console.log('Video can start playing');
      };
      
      const handlePlay = () => {
        setIsPlaying(true);
        console.log('Video started playing');
      };
      
      const handlePause = () => {
        setIsPlaying(false);
        console.log('Video paused');
      };
      
      const handleError = (e: Event) => {
        console.error('Video element error:', e);
      };
      
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('error', handleError);
      
      // For thetv.to streams, try direct playback first
      if (selectedGame.streamUrl.includes('/api/stream-proxy')) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: false,
            lowLatencyMode: false,
            debug: true,
            maxLoadingDelay: 4,
            maxBufferLength: 30,
            maxBufferSize: 60 * 1000 * 1000,
            xhrSetup: (xhr, url) => {
              xhr.withCredentials = false;
              xhr.timeout = 30000;
            }
          });
          
          hls.loadSource(selectedGame.streamUrl);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('Manifest parsed, ready to play');
            setShowPlayButton(true);
          });

          hls.on(Hls.Events.LEVEL_LOADED, () => {
            console.log('Level loaded, video should be ready');
            setShowPlayButton(true);
          });

          hls.on(Hls.Events.FRAG_LOADED, () => {
            console.log('Fragment loaded, content available');
            setShowPlayButton(true);
          });
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('Network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  // Cannot recover, fallback to direct video
                  console.log('Fatal error, falling back to direct video');
                  hls.destroy();
                  video.src = selectedGame.streamUrl;
                  break;
              }
            }
          });
          
          return () => {
            hls.destroy();
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('error', handleError);
          };
        } else {
          // Native HLS support or direct video
          video.src = selectedGame.streamUrl;
        }
      } else {
        // Regular video streams
        video.src = selectedGame.streamUrl;
      }
      
      return () => {
        // Cleanup event listeners
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('error', handleError);
      };
    }
  }, [selectedGame]);

  const handlePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        await video.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Video play/pause error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Live Sports Streaming</h1>
          <p className="text-gray-400">Watch live games and place bets in real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Video Player - Takes 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-0">
                {selectedGame ? (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    {/* Video Element */}
                    {selectedGame.streamUrl ? (
                      selectedGame.streamUrl.includes('youtube.com') ? (
                        <iframe
                          className="w-full h-full"
                          src={selectedGame.streamUrl.replace('watch?v=', 'embed/').replace('youtube.com', 'youtube-nocookie.com')}
                          title={selectedGame.title}
                          frameBorder="0"
                          allowFullScreen
                          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        />
                      ) : selectedGame.streamUrl.includes('twitch.tv') ? (
                        <iframe
                          className="w-full h-full"
                          src={selectedGame.streamUrl.replace('twitch.tv/', 'player.twitch.tv/?channel=').replace('https://', 'https://player.twitch.tv/?channel=')}
                          title={selectedGame.title}
                          frameBorder="0"
                          allowFullScreen
                          allow="accelerometer; autoplay; encrypted-media; fullscreen"
                        />
                      ) : selectedGame.streamUrl.includes('.m3u8') || selectedGame.streamUrl.includes('thetv.to') ? (
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          controls
                          muted={isMuted}
                          playsInline
                          crossOrigin="anonymous"
                          onError={(e) => {
                            console.error('M3U8 stream error:', e);
                          }}
                        >
                          <source src={selectedGame.streamUrl} type="application/x-mpegURL" />
                          <source src={selectedGame.streamUrl} type="application/vnd.apple.mpegurl" />
                          Your browser does not support HLS streaming.
                        </video>
                      ) : (
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          controls
                          muted={isMuted}
                          playsInline
                          crossOrigin="anonymous"
                          onError={(e) => {
                            console.error('Video stream error:', e);
                          }}
                        >
                          <source src={selectedGame.streamUrl} type="video/mp4" />
                          <source src={selectedGame.streamUrl} type="video/webm" />
                          <source src={selectedGame.streamUrl} type="video/ogg" />
                          Your browser does not support the video tag.
                        </video>
                      )
                    ) : (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <div className="text-center">
                          <Play className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                          <p className="text-white text-lg font-semibold">{selectedGame.title}</p>
                          <p className="text-gray-400">Stream loading...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Viewer Count Overlay */}
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
                        <div className="flex items-center space-x-2 text-white">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">{selectedGame.viewers?.toLocaleString() || '0'} viewers</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Game Info Overlay */}
                    <div className="absolute top-4 left-4 right-4">
                      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{selectedGame.title}</h3>
                            <p className="text-sm text-gray-300">{selectedGame.leagueName || 'Live Sports'}</p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-red-600 hover:bg-red-700">
                              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                              LIVE
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <p className="text-sm font-medium">{selectedGame.homeTeam.name}</p>
                              <p className="text-2xl font-bold">{selectedGame.homeTeam.score}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-400">VS</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium">{selectedGame.awayTeam.name}</p>
                              <p className="text-2xl font-bold">{selectedGame.awayTeam.score}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-gray-300">{selectedGame.period || 'LIVE'}</p>
                            <p className="text-sm text-gray-300">{selectedGame.timeRemaining || 'LIVE'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">Select a game to start watching</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Betting Panel */}
            {selectedGame && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Live Betting</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-16 border-green-600 hover:bg-green-600/20"
                      onClick={() => handleBetPlace(selectedGame.id, 'home_win', selectedGame.odds?.homeWin || 2.1)}
                    >
                      <div className="text-center">
                        <p className="text-sm">{selectedGame.homeTeam.name} Win</p>
                        <p className="text-lg font-bold">+{selectedGame.odds?.homeWin || 2.1}</p>
                      </div>
                    </Button>
                    
                    {selectedGame.odds?.draw && (
                      <Button
                        variant="outline"
                        className="h-16 border-gray-600 hover:bg-gray-600/20"
                        onClick={() => handleBetPlace(selectedGame.id, 'draw', selectedGame.odds?.draw || 3.2)}
                      >
                        <div className="text-center">
                          <p className="text-sm">Draw</p>
                          <p className="text-lg font-bold">+{selectedGame.odds?.draw || 3.2}</p>
                        </div>
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      className="h-16 border-green-600 hover:bg-green-600/20"
                      onClick={() => handleBetPlace(selectedGame.id, 'away_win', selectedGame.odds?.awayWin || 1.8)}
                    >
                      <div className="text-center">
                        <p className="text-sm">{selectedGame.awayTeam.name} Win</p>
                        <p className="text-lg font-bold">+{selectedGame.odds?.awayWin || 1.8}</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Games Carousel at Bottom */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Live Games</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => scrollCarousel('left')}
                      className="text-gray-400 hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => scrollCarousel('right')}
                      className="text-gray-400 hover:text-white"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex space-x-4 overflow-x-auto pb-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-64 h-32 bg-gray-800 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div 
                    ref={carouselRef}
                    className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {liveGames.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => handleGameSelect(game)}
                        className={`flex-shrink-0 w-64 p-3 rounded-lg border transition-colors ${
                          selectedGame?.id === game.id
                            ? 'border-blue-600 bg-blue-600/20'
                            : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                        }`}
                      >
                        <div className="text-left">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="text-xs bg-red-600">
                              <div className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></div>
                              LIVE
                            </Badge>
                            <div className="flex items-center text-xs text-gray-400">
                              <Users className="h-3 w-3 mr-1" />
                              {game.viewers?.toLocaleString() || '0'}
                            </div>
                          </div>
                          
                          <p className="text-sm font-medium truncate">{game.title}</p>
                          <p className="text-xs text-gray-400 mb-2">{game.league}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs">
                              <span>{game.homeTeam.name} {game.homeTeam.score}</span>
                              <span className="text-gray-500">-</span>
                              <span>{game.awayTeam.score} {game.awayTeam.name}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {game.period}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                    
                    {liveGames.length === 0 && (
                      <div className="flex-shrink-0 w-full text-center py-8">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                        <p className="text-gray-400">No live games available</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Bet Slip */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Bet Slip</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {betSlip ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Balance: <span className="text-green-400">${userBalance.toFixed(2)}</span></p>
                    </div>
                    
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <p className="text-sm font-medium text-white">{betSlip.betType.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-xs text-gray-400">Odds: +{betSlip.odds}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-sm text-gray-300">Stake:</span>
                        <span className="text-sm font-bold text-white">${betSlip.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-300">Potential Win:</span>
                        <span className="text-sm font-bold text-green-400">${betSlip.potentialWin.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Bet Amount ($)</label>
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => {
                          const newAmount = Number(e.target.value);
                          setBetAmount(newAmount);
                          if (betSlip) {
                            setBetSlip({
                              ...betSlip,
                              amount: newAmount,
                              potentialWin: newAmount * (betSlip.odds / 100)
                            });
                          }
                        }}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                        min="1"
                        max={userBalance}
                      />
                    </div>
                    
                    <Button 
                      onClick={confirmBet}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={betAmount > userBalance || betAmount < 1}
                    >
                      Confirm Bet
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                      <Target className="h-8 w-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Your bet slip is empty</h3>
                    <p className="text-gray-400 text-sm">Click on odds to add bets to your slip</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Live Events Section */}
        <div className="mt-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Upcoming Live Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents && upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingEvents.slice(0, 6).map((event: any, index: number) => (
                    <div key={event.id || index} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs">
                          {event.sport_title || event.sport || 'Sports'}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {event.commence_time ? new Date(event.commence_time).toLocaleDateString() : 'TBD'}
                        </span>
                      </div>
                      
                      <h4 className="font-medium text-sm mb-2 line-clamp-2">
                        {event.home_team && event.away_team ? 
                          `${event.home_team} vs ${event.away_team}` : 
                          event.title || 'Upcoming Event'
                        }
                      </h4>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>
                          {event.commence_time ? 
                            new Date(event.commence_time).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : 'Time TBD'
                          }
                        </span>
                        {event.bookmakers && event.bookmakers.length > 0 && (
                          <span className="text-green-400">
                            Odds Available
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">Loading upcoming events...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}