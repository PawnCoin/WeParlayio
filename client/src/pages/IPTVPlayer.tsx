import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Grid,
  List,
  Search,
  Star,
  Clock,
  Tv,
  Film,
  Radio,
  Users,
  Globe,
  Zap,
  Info,
  Heart,
  Share2,
  Download,
  Cast,
  RotateCcw,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack
} from 'lucide-react';

interface IPTVChannel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group: string;
  category: string;
  quality?: string;
  streamType: 'live' | 'vod' | 'series';
  language?: string;
  country?: string;
}

interface EPGProgram {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  category?: string;
  rating?: string;
}

export default function IPTVPlayer() {
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoriteChannels, setFavoriteChannels] = useState<Set<string>>(new Set());
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [xtreamConfig, setXtreamConfig] = useState({
    host: '',
    username: '',
    password: '',
    port: '80'
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch channels from M3U or Xtream Codes
  const { data: channelsData, isLoading: channelsLoading, refetch: refetchChannels } = useQuery({
    queryKey: ['/api/iptv/channels'],
    enabled: false
  });

  // Fetch EPG data for current channel
  const { data: epgData } = useQuery({
    queryKey: ['/api/iptv/epg', selectedChannel?.id],
    enabled: !!selectedChannel?.id
  });

  // Load M3U playlist mutation
  const loadM3UMutation = useMutation({
    mutationFn: async (url: string) => {
      return apiRequest('POST', '/api/iptv/load-m3u', { playlistUrl: url });
    },
    onSuccess: (data: any) => {
      toast({ title: "Playlist Loaded", description: `Loaded ${data.channels?.length || 0} channels` });
      refetchChannels();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to load M3U playlist", variant: "destructive" });
    }
  });

  // Connect to Xtream Codes mutation
  const connectXtreamMutation = useMutation({
    mutationFn: async (config: any) => {
      return apiRequest('POST', '/api/iptv/connect-xtream', config);
    },
    onSuccess: (data: any) => {
      toast({ 
        title: "Connected", 
        description: `Connected to Xtream Codes: ${data.totalChannels} channels available` 
      });
      refetchChannels();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to connect to Xtream Codes", variant: "destructive" });
    }
  });

  // Quick connect to thetv.to mutation
  const connectTheTVMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/iptv/load-thetv-credentials', {});
    },
    onSuccess: (data: any) => {
      toast({ 
        title: "TheTV.to Connected", 
        description: `Successfully loaded ${data.totalChannels || 0} channels from thetv.to` 
      });
      refetchChannels();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to connect to thetv.to service", variant: "destructive" });
    }
  });

  const channels: IPTVChannel[] = channelsData?.channels || [];
  const currentEPG: EPGProgram[] = epgData?.programs || [];

  // Filter channels based on search and category
  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         channel.group.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || channel.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(channels.map(ch => ch.category)))];

  // Video player controls
  const handlePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  }, []);

  const handleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  }, [isMuted]);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && playerContainerRef.current) {
      playerContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleChannelSelect = useCallback((channel: IPTVChannel) => {
    setSelectedChannel(channel);
    if (videoRef.current) {
      videoRef.current.src = channel.url;
      videoRef.current.load();
    }
    toast({ title: "Channel Selected", description: `Now playing: ${channel.name}` });
  }, [toast]);

  const handleToggleFavorite = useCallback((channelId: string) => {
    setFavoriteChannels(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(channelId)) {
        newFavorites.delete(channelId);
        toast({ title: "Removed", description: "Channel removed from favorites" });
      } else {
        newFavorites.add(channelId);
        toast({ title: "Added", description: "Channel added to favorites" });
      }
      return newFavorites;
    });
  }, [toast]);

  const handleLoadM3U = useCallback(() => {
    if (playlistUrl.trim()) {
      loadM3UMutation.mutate(playlistUrl.trim());
    } else {
      toast({ title: "Error", description: "Please enter a valid M3U URL", variant: "destructive" });
    }
  }, [playlistUrl, loadM3UMutation, toast]);

  const handleConnectXtream = useCallback(() => {
    if (xtreamConfig.host && xtreamConfig.username && xtreamConfig.password) {
      connectXtreamMutation.mutate(xtreamConfig);
    } else {
      toast({ title: "Error", description: "Please fill in all Xtream Codes credentials", variant: "destructive" });
    }
  }, [xtreamConfig, connectXtreamMutation, toast]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` 
                     : `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentProgram = (channelId: string): EPGProgram | null => {
    const now = new Date();
    return currentEPG.find(program => 
      program.channelId === channelId && 
      program.start <= now && 
      program.end >= now
    ) || null;
  };

  const getChannelIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sports': return <Zap className="h-4 w-4" />;
      case 'movies': return <Film className="h-4 w-4" />;
      case 'news': return <Globe className="h-4 w-4" />;
      case 'music': return <Radio className="h-4 w-4" />;
      case 'kids': return <Users className="h-4 w-4" />;
      default: return <Tv className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">WeParlay IPTV Player</h1>
            <p className="text-muted-foreground">Professional streaming platform with M3U and Xtream Codes support</p>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <Cast className="h-4 w-4 mr-2" />
            {channels.length} Channels
          </Badge>
        </div>

        <Tabs defaultValue="player" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="player">Player</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Player Tab */}
          <TabsContent value="player" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Video Player */}
              <div className="lg:col-span-3">
                <Card className="bg-black border-gray-800 overflow-hidden">
                  <div ref={playerContainerRef} className="relative aspect-video bg-black">
                    {selectedChannel ? (
                      <>
                        <video
                          ref={videoRef}
                          className="w-full h-full object-contain"
                          controls={false}
                          autoPlay
                          onLoadedData={() => setIsPlaying(true)}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                        />
                        
                        {/* Video Controls Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <div className="flex items-center justify-between text-white">
                            <div className="flex items-center space-x-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handlePlay}
                                className="text-white hover:bg-white/20"
                              >
                                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                              </Button>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={handleMute}
                                  className="text-white hover:bg-white/20"
                                >
                                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                </Button>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={volume}
                                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                  className="w-20"
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleFavorite(selectedChannel.id)}
                                className="text-white hover:bg-white/20"
                              >
                                <Heart className={`h-4 w-4 ${favoriteChannels.has(selectedChannel.id) ? 'fill-red-500 text-red-500' : ''}`} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleFullscreen}
                                className="text-white hover:bg-white/20"
                              >
                                <Maximize className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Channel Info */}
                          <div className="mt-2">
                            <h3 className="font-semibold text-white">{selectedChannel.name}</h3>
                            {getCurrentProgram(selectedChannel.id) && (
                              <p className="text-sm text-gray-300">
                                {getCurrentProgram(selectedChannel.id)?.title}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-400">
                          <Tv className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">Select a channel to start watching</p>
                          <p className="text-sm">Load a playlist or connect to Xtream Codes to get started</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* EPG/Program Guide */}
              <div>
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Program Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedChannel && currentEPG.length > 0 ? (
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {currentEPG.map((program) => (
                            <div key={program.id} className="p-2 rounded bg-muted/50">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium text-sm text-white">{program.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {formatTime((program.end.getTime() - program.start.getTime()) / 1000)}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {program.start.toLocaleTimeString()} - {program.end.toLocaleTimeString()}
                              </p>
                              {program.description && (
                                <p className="text-xs text-gray-300 mt-1 line-clamp-2">{program.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No program guide available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search channels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded border bg-background text-foreground"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Channels Grid/List */}
            {channelsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="mt-2 text-muted-foreground">Loading channels...</p>
              </div>
            ) : filteredChannels.length === 0 ? (
              <div className="text-center py-8">
                <Tv className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">No channels found</p>
                <p className="text-sm text-muted-foreground">Try loading a playlist or adjusting your search</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
                : "space-y-2"
              }>
                {filteredChannels.map((channel) => (
                  <Card 
                    key={channel.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg border-border ${
                      selectedChannel?.id === channel.id ? 'ring-2 ring-primary' : ''
                    } ${viewMode === 'list' ? 'flex items-center p-3' : 'p-4'}`}
                    onClick={() => handleChannelSelect(channel)}
                  >
                    {viewMode === 'grid' ? (
                      <div className="text-center space-y-2">
                        <div className="relative">
                          {channel.logo ? (
                            <img src={channel.logo} alt={channel.name} className="w-12 h-12 mx-auto rounded" />
                          ) : (
                            <div className="w-12 h-12 mx-auto rounded bg-muted flex items-center justify-center">
                              {getChannelIcon(channel.category)}
                            </div>
                          )}
                          {favoriteChannels.has(channel.id) && (
                            <Heart className="absolute -top-1 -right-1 h-4 w-4 text-red-500 fill-current" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-white truncate">{channel.name}</h3>
                          <p className="text-xs text-muted-foreground">{channel.group}</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {channel.quality || 'SD'}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="relative">
                          {channel.logo ? (
                            <img src={channel.logo} alt={channel.name} className="w-10 h-10 rounded" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                              {getChannelIcon(channel.category)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{channel.name}</h3>
                          <p className="text-sm text-muted-foreground">{channel.group}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{channel.quality || 'SD'}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(channel.id);
                            }}
                          >
                            <Heart className={`h-4 w-4 ${favoriteChannels.has(channel.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Playlists Tab */}
          <TabsContent value="playlists" className="space-y-6">
            {/* Quick Connect to TheTV.to */}
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Quick Connect - TheTV.to Premium
                </CardTitle>
                <p className="text-purple-100">Connect instantly with pre-configured credentials</p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => connectTheTVMutation.mutate()}
                  disabled={connectTheTVMutation.isPending}
                  className="w-full bg-white text-purple-600 hover:bg-purple-50"
                  size="lg"
                >
                  {connectTheTVMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full mr-2" />
                      Connecting to TheTV.to...
                    </>
                  ) : (
                    <>
                      <Cast className="h-4 w-4 mr-2" />
                      Connect to TheTV.to Service
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* M3U Playlist Loader */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-white">Load M3U Playlist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Enter M3U playlist URL..."
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                  />
                  <Button 
                    onClick={handleLoadM3U}
                    disabled={loadM3UMutation.isPending}
                    className="w-full"
                  >
                    {loadM3UMutation.isPending ? 'Loading...' : 'Load Playlist'}
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    Example: https://example.com/playlist.m3u8
                  </div>
                </CardContent>
              </Card>

              {/* Xtream Codes Connection */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-white">Xtream Codes API</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Server URL (e.g., http://example.com)"
                    value={xtreamConfig.host}
                    onChange={(e) => setXtreamConfig(prev => ({ ...prev, host: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Username"
                      value={xtreamConfig.username}
                      onChange={(e) => setXtreamConfig(prev => ({ ...prev, username: e.target.value }))}
                    />
                    <Input
                      placeholder="Password"
                      type="password"
                      value={xtreamConfig.password}
                      onChange={(e) => setXtreamConfig(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <Input
                    placeholder="Port (optional)"
                    value={xtreamConfig.port}
                    onChange={(e) => setXtreamConfig(prev => ({ ...prev, port: e.target.value }))}
                  />
                  <Button 
                    onClick={handleConnectXtream}
                    disabled={connectXtreamMutation.isPending}
                    className="w-full"
                  >
                    {connectXtreamMutation.isPending ? 'Connecting...' : 'Connect'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-white">Player Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white">Default Quality</label>
                    <select className="w-full mt-1 px-3 py-2 rounded border bg-background text-foreground">
                      <option value="auto">Auto</option>
                      <option value="4k">4K</option>
                      <option value="hd">HD</option>
                      <option value="sd">SD</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white">Buffer Size</label>
                    <select className="w-full mt-1 px-3 py-2 rounded border bg-background text-foreground">
                      <option value="small">Small (5s)</option>
                      <option value="medium">Medium (10s)</option>
                      <option value="large">Large (20s)</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-white">Auto-play next episode</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-white">Remember last position</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-white">Enable subtitles by default</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}