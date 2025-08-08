import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Tv, 
  Search, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Settings,
  Crown,
  Signal,
  Globe,
  Star
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { canUserAccess } from '../../../shared/tierSystem';

interface IPTVChannel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group: string;
  category: string;
  quality?: string;
  language?: string;
  country?: string;
  isVip?: boolean;
}

interface StreamQuality {
  label: string;
  url: string;
  resolution: string;
}

const EnhancedIPTVPlayer: React.FC = () => {
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<IPTVChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [availableQualities, setAvailableQualities] = useState<StreamQuality[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user has VIP access for premium channels
  const hasVipAccess = useMemo(() => {
    if (!user) return false;
    return canUserAccess(user.tier as any, 'liveStreamingAccess') || user.isAdmin;
  }, [user]);

  // Fetch IPTV channels from backend
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('GET', '/api/iptv/channels') as any;
        
        if (response.success) {
          const channelsData = response.channels.map((channel: any) => ({
            ...channel,
            id: channel.id || `${channel.name}-${Math.random()}`,
            category: channel.category || 'General',
            isVip: channel.group?.toLowerCase().includes('premium') || 
                   channel.name?.toLowerCase().includes('premium') ||
                   channel.category?.toLowerCase().includes('premium')
          }));
          
          setChannels(channelsData);
          setConnectionStatus('connected');
        } else {
          // Fallback to demo channels if API fails
          setChannels(getDemoChannels());
          setConnectionStatus('disconnected');
        }
      } catch (error) {
        console.error('Error fetching IPTV channels:', error);
        setChannels(getDemoChannels());
        setConnectionStatus('disconnected');
        toast({
          title: 'Connection Warning',
          description: 'Using demo channels. Live streaming may be limited.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [toast]);

  // Demo channels for fallback
  const getDemoChannels = (): IPTVChannel[] => [
    {
      id: 'cbs-sports-hq',
      name: 'CBS Sports HQ',
      url: 'https://cbssports-linear.cbsaavideo.com/out/v1/cc15e3c4f8434251b6dffe8138b86ae0/master.m3u8',
      group: 'US Sports',
      category: 'Sports',
      quality: 'HD',
      country: 'US',
      logo: 'https://logos-world.net/wp-content/uploads/2020/06/CBS-Sports-Logo.png'
    },
    {
      id: 'stadium',
      name: 'Stadium',
      url: 'https://stadiumlivein-i.akamaihd.net/hls/live/522512/mux_4/master.m3u8',
      group: 'US Sports',
      category: 'Sports',
      quality: 'HD',
      country: 'US',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Stadium_%28sports_network%29_logo.svg'
    },
    {
      id: 'fox-sports-1',
      name: 'Fox Sports 1',
      url: 'https://fox-foxsportsone-samsungus.amagi.tv/playlist.m3u8',
      group: 'Premium Sports',
      category: 'Sports',
      quality: 'HD',
      country: 'US',
      isVip: true,
      logo: 'https://logos-world.net/wp-content/uploads/2020/06/Fox-Sports-Logo.png'
    },
    {
      id: 'tennis-channel',
      name: 'Tennis Channel',
      url: 'https://tennischannel-int-samsungau.amagi.tv/playlist720_p.m3u8',
      group: 'Premium Sports',
      category: 'Tennis',
      quality: 'HD',
      country: 'International',
      isVip: true,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Tennis_Channel_logo.svg'
    }
  ];

  // Filter channels based on search and category
  useEffect(() => {
    let filtered = channels;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(channel => channel.category === selectedCategory);
    }

    // Filter VIP channels based on user access
    if (!hasVipAccess) {
      filtered = filtered.filter(channel => !channel.isVip);
    }

    setFilteredChannels(filtered);
  }, [channels, searchQuery, selectedCategory, hasVipAccess]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...Array.from(new Set(channels.map(c => c.category)))];
    return cats;
  }, [channels]);

  // Select channel and start playing
  const handleChannelSelect = useCallback((channel: IPTVChannel) => {
    if (channel.isVip && !hasVipAccess) {
      toast({
        title: 'VIP Access Required',
        description: 'This premium channel requires Silver tier or higher',
        variant: 'destructive'
      });
      return;
    }

    setSelectedChannel(channel);
    setIsPlaying(true);
    setConnectionStatus('connecting');
    
    // Simulate quality detection
    setTimeout(() => {
      setAvailableQualities([
        { label: 'Auto', url: channel.url, resolution: 'auto' },
        { label: 'HD', url: channel.url, resolution: '720p' },
        { label: 'SD', url: channel.url, resolution: '480p' }
      ]);
      setConnectionStatus('connected');
    }, 1000);
  }, [hasVipAccess, toast]);

  // Handle play/pause
  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Handle volume toggle
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading IPTV channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Tv className="mr-2 h-6 w-6" />
            Enhanced IPTV Player
          </h2>
          <Badge 
            variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
            className="flex items-center"
          >
            <Signal className="w-3 h-3 mr-1" />
            {connectionStatus === 'connected' ? 'Live' : 'Limited Mode'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {filteredChannels.length} channels
          </Badge>
          {hasVipAccess && (
            <Badge className="bg-yellow-500 text-black">
              <Crown className="w-3 h-3 mr-1" />
              VIP Access
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel List */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Channel Guide</CardTitle>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search channels..."
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </CardHeader>
            
            <CardContent className="p-0 max-h-96 overflow-y-auto">
              {filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => handleChannelSelect(channel)}
                  className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors ${
                    selectedChannel?.id === channel.id ? 'bg-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {channel.logo ? (
                        <img src={channel.logo} alt={channel.name} className="w-8 h-8 rounded" />
                      ) : (
                        <Tv className="w-8 h-8 text-gray-400" />
                      )}
                      <div>
                        <p className="text-white font-medium flex items-center">
                          {channel.name}
                          {channel.isVip && (
                            <Crown className="w-3 h-3 ml-1 text-yellow-400" />
                          )}
                        </p>
                        <p className="text-gray-400 text-sm">{channel.group}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {channel.quality || 'SD'}
                      </Badge>
                      {channel.country && (
                        <p className="text-gray-400 text-xs flex items-center mt-1">
                          <Globe className="w-3 h-3 mr-1" />
                          {channel.country}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-0">
              {selectedChannel ? (
                <div className="relative">
                  {/* Video placeholder - In production, integrate with react-player or video.js */}
                  <div className="aspect-video bg-black flex items-center justify-center relative">
                    {connectionStatus === 'connecting' ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-white">Connecting to stream...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Play className="h-16 w-16 text-white mb-4" />
                        <p className="text-white text-lg font-semibold">{selectedChannel.name}</p>
                        <p className="text-gray-400">M3U8 Stream Ready</p>
                        <p className="text-gray-500 text-sm mt-2">{selectedChannel.url}</p>
                      </div>
                    )}
                    
                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={togglePlayPause}
                            className="text-white hover:bg-white/20"
                          >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={toggleMute}
                            className="text-white hover:bg-white/20"
                          >
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <select
                            value={selectedQuality}
                            onChange={(e) => setSelectedQuality(e.target.value)}
                            className="bg-black/50 text-white text-sm px-2 py-1 rounded"
                          >
                            {availableQualities.map(quality => (
                              <option key={quality.label} value={quality.label}>
                                {quality.label} {quality.resolution !== 'auto' && `(${quality.resolution})`}
                              </option>
                            ))}
                          </select>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={toggleFullscreen}
                            className="text-white hover:bg-white/20"
                          >
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stream Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{selectedChannel.name}</h3>
                        <p className="text-gray-400">{selectedChannel.group} • {selectedChannel.category}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedChannel.isVip && (
                          <Badge className="bg-yellow-500 text-black">
                            <Star className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                        <Badge variant="outline">
                          M3U8 Stream
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <Tv className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Select a channel to start streaming</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {hasVipAccess ? 'Access to all premium channels' : 'Upgrade to VIP for premium channels'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats and Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <Tv className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-white font-semibold">{channels.length} Total Channels</p>
            <p className="text-gray-400 text-sm">M3U8 Streams Available</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <Crown className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-white font-semibold">{channels.filter(c => c.isVip).length} Premium Channels</p>
            <p className="text-gray-400 text-sm">VIP Access Required</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <Signal className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-white font-semibold">HD Quality</p>
            <p className="text-gray-400 text-sm">Adaptive Streaming</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedIPTVPlayer;