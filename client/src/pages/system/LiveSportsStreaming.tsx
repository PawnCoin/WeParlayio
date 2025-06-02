import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Tv, Wifi, WifiOff, Star } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface StreamChannel {
  id: string;
  name: string;
  streamUrl: string;
  category: string;
  quality: string;
  language: string;
  logo?: string;
  isLive: boolean;
  viewers?: number;
}

interface StreamingStatus {
  available: boolean;
  totalChannels: number;
  activeStreams: number;
  serverStatus: string;
}

const LiveSportsStreaming: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [currentStream, setCurrentStream] = useState<StreamChannel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userTier, setUserTier] = useState('bronze'); // bronze, silver, gold, diamond
  
  // Fetch streaming status
  const { data: streamingStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/streaming/status'],
    refetchInterval: 30000,
  });

  // Fetch available channels
  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ['/api/streaming/channels'],
    refetchInterval: 60000,
  });

  // Fetch user's subscription tier
  const { data: userProfile } = useQuery({
    queryKey: ['/api/user/profile'],
  });

  // Stream playback mutation
  const playStreamMutation = useMutation({
    mutationFn: async (streamData: { channelId: string; tier: string }) => {
      return apiRequest('POST', '/api/streaming/play', streamData);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Stream Started",
          description: data.message || "Stream is now playing",
        });
      } else {
        toast({
          title: "Stream Error",
          description: data.message || "Failed to start stream",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Connection Error",
        description: "Unable to connect to streaming service",
        variant: "destructive",
      });
    }
  });

  // Favorite channel mutation
  const favoriteMutation = useMutation({
    mutationFn: async (channelId: string) => {
      return apiRequest('POST', '/api/streaming/favorite', { channelId });
    },
    onSuccess: () => {
      toast({
        title: "Added to Favorites",
        description: "Channel added to your favorites list",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/streaming/channels'] });
    }
  });

  useEffect(() => {
    if (userProfile?.tier) {
      setUserTier(userProfile.tier);
    }
  }, [userProfile]);

  const handleStreamPlay = async (channel: StreamChannel) => {
    if (userTier === 'bronze' && channel.category === 'premium') {
      toast({
        title: "Upgrade Required",
        description: "This stream requires Silver tier or higher",
        variant: "destructive",
      });
      return;
    }

    setCurrentStream(channel);
    
    try {
      await playStreamMutation.mutateAsync({
        channelId: channel.id,
        tier: userTier
      });
      
      if (videoRef.current) {
        videoRef.current.src = channel.streamUrl;
        videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Stream playback error:', error);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleAddToFavorites = (channelId: string) => {
    favoriteMutation.mutate(channelId);
  };

  const filteredChannels = channels.filter((channel: StreamChannel) => {
    const matchesCategory = selectedCategory === 'all' || channel.category === selectedCategory;
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', 'sports', 'esports', 'premium', 'international'];

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'diamond': return 'bg-purple-500';
      case 'gold': return 'bg-yellow-500';
      case 'silver': return 'bg-gray-400';
      default: return 'bg-orange-600';
    }
  };

  const canAccessStream = (channel: StreamChannel) => {
    if (channel.category === 'premium' && userTier === 'bronze') return false;
    if (channel.category === 'vip' && !['gold', 'diamond'].includes(userTier)) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Sports Streaming</h1>
              <p className="text-gray-600 dark:text-gray-400">Watch live sports and esports streams</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={`${getTierBadgeColor(userTier)} text-white`}>
                {userTier.toUpperCase()} TIER
              </Badge>
              {streamingStatus?.available ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm font-medium">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm font-medium">Offline</span>
                </div>
              )}
            </div>
          </div>

          {/* Streaming Stats */}
          {streamingStatus && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{streamingStatus.totalChannels}</div>
                  <div className="text-sm text-gray-600">Total Channels</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{streamingStatus.activeStreams}</div>
                  <div className="text-sm text-gray-600">Active Streams</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{streamingStatus.serverStatus}</div>
                  <div className="text-sm text-gray-600">Server Status</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tv className="h-5 w-5" />
                  {currentStream ? currentStream.name : 'Select a Channel'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    className="w-full h-64 lg:h-96"
                    controls={false}
                    onLoadedData={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                  />
                  
                  {!currentStream && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Tv className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Select a channel to start streaming</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Controls */}
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlayPause}
                      disabled={!currentStream}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMuteToggle}
                        disabled={!currentStream}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                        className="w-20"
                        disabled={!currentStream}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={!currentStream}>
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={!currentStream}>
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Current Stream Info */}
                {currentStream && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{currentStream.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {currentStream.category} • {currentStream.quality} • {currentStream.language}
                        </p>
                      </div>
                      <Badge variant={currentStream.isLive ? "default" : "secondary"}>
                        {currentStream.isLive ? "LIVE" : "OFFLINE"}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Channel List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Available Channels</CardTitle>
                
                {/* Search and Filter */}
                <div className="space-y-3">
                  <Input
                    placeholder="Search channels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {channelsLoading ? (
                    <div className="p-4 text-center">Loading channels...</div>
                  ) : filteredChannels.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No channels found</div>
                  ) : (
                    filteredChannels.map((channel: StreamChannel) => (
                      <div
                        key={channel.id}
                        className={`p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                          currentStream?.id === channel.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => canAccessStream(channel) && handleStreamPlay(channel)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-medium ${!canAccessStream(channel) ? 'text-gray-400' : ''}`}>
                                {channel.name}
                              </h4>
                              {channel.isLive && (
                                <Badge variant="destructive" className="text-xs">LIVE</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {channel.category} • {channel.quality}
                            </p>
                            {channel.viewers && (
                              <p className="text-xs text-gray-400">{channel.viewers} viewers</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!canAccessStream(channel) && (
                              <Badge variant="outline" className="text-xs">
                                {channel.category === 'premium' ? 'SILVER+' : 'GOLD+'}
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToFavorites(channel.id);
                              }}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSportsStreaming;