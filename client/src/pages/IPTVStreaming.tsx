import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  Tv, 
  Radio,
  Calendar,
  Clock,
  Users,
  Star,
  Zap
} from 'lucide-react';

interface IPTVChannel {
  id: string;
  name: string;
  category: string;
  logo: string;
  streamUrl: string;
  quality: string;
  isLive: boolean;
}

interface StreamData {
  channelId: string;
  streamUrl: string;
  headers: {
    'User-Agent': string;
    'Referer': string;
  };
  quality: string;
  format: string;
  authenticated: boolean;
}

interface EPGProgram {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: string;
  live: boolean;
}

interface EPGData {
  channelId: string;
  programs: EPGProgram[];
}

export default function IPTVStreaming() {
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const { data: channels = [], isLoading: channelsLoading } = useQuery<IPTVChannel[]>({
    queryKey: ['/api/iptv/channels'],
  });

  const { data: epgData = [] } = useQuery<EPGData[]>({
    queryKey: ['/api/iptv/epg'],
  });

  const { data: streamData, isLoading: streamLoading } = useQuery<StreamData>({
    queryKey: ['/api/iptv/stream', selectedChannel?.id],
    enabled: !!selectedChannel,
  });

  useEffect(() => {
    if (streamData && videoRef.current && selectedChannel) {
      const video = videoRef.current;
      video.src = streamData.streamUrl;
      
      // Set headers for authenticated streaming
      if (streamData.headers) {
        // Note: In a real implementation, headers would be set at the server level
        // or through a proxy due to CORS restrictions
        console.log('Stream headers:', streamData.headers);
      }
      
      video.load();
      
      if (isPlaying) {
        video.play().catch(error => {
          console.error('Auto-play failed:', error);
          toast({
            title: "Playback Notice",
            description: "Click play to start the stream. Some browsers block auto-play.",
          });
        });
      }
    }
  }, [streamData, selectedChannel, isPlaying, toast]);

  const handleChannelSelect = (channel: IPTVChannel) => {
    setSelectedChannel(channel);
    setIsPlaying(true);
    
    toast({
      title: "Loading Stream",
      description: `Loading ${channel.name} in ${channel.quality} quality...`,
    });
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
      setVolume(newVolume);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const categories = ['all', ...Array.from(new Set(channels.map(ch => ch.category)))];
  const filteredChannels = selectedCategory === 'all' 
    ? channels 
    : channels.filter(ch => ch.category === selectedCategory);

  const getCurrentProgram = (channelId: string) => {
    const channelEPG = epgData.find(epg => epg.channelId === channelId);
    if (!channelEPG) return null;
    
    const now = new Date();
    return channelEPG.programs.find(program => {
      const start = new Date(program.startTime);
      const end = new Date(program.endTime);
      return now >= start && now <= end;
    });
  };

  if (channelsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-blue-300">Loading IPTV channels...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Live Sports Streaming</h1>
            <p className="text-blue-300">Premium IPTV channels with live sports coverage</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-2 bg-green-600 text-white">
              <Zap className="w-4 h-4" />
              Live Service
            </Badge>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-600">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="text-white">
                    {category === 'all' ? 'All Channels' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Channel List */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Tv className="w-5 h-5" />
                  Channels ({filteredChannels.length})
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {filteredChannels.map((channel) => {
                  const currentProgram = getCurrentProgram(channel.id);
                  const isSelected = selectedChannel?.id === channel.id;
                  
                  return (
                    <div
                      key={channel.id}
                      onClick={() => handleChannelSelect(channel)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-400' 
                          : 'bg-slate-700/50 hover:bg-slate-600/50 border-slate-600'
                      } border`}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={channel.logo} 
                          alt={channel.name}
                          className="w-8 h-8 rounded object-contain bg-white p-1"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-sm truncate">
                            {channel.name}
                          </div>
                          
                          {channel.isLive && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-red-400 text-xs font-medium">LIVE</span>
                            </div>
                          )}
                          
                          {currentProgram && (
                            <div className="text-blue-300 text-xs truncate mt-1">
                              {currentProgram.title}
                            </div>
                          )}
                          
                          <Badge variant="outline" size="sm" className="mt-1 text-xs">
                            {channel.quality}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {selectedChannel ? (
                    <>
                      {streamLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                          <div className="text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                            <p className="text-white text-sm">Loading stream...</p>
                          </div>
                        </div>
                      )}
                      
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        controls={false}
                        autoPlay={false}
                        muted={isMuted}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onLoadStart={() => console.log('Stream loading started')}
                        onCanPlay={() => console.log('Stream ready to play')}
                        onError={(e) => {
                          console.error('Video error:', e);
                          toast({
                            title: "Stream Error",
                            description: "Unable to load stream. Please try another channel.",
                            variant: "destructive",
                          });
                        }}
                      />
                      
                      {/* Custom Video Controls */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={togglePlayPause}
                              className="text-white hover:bg-white/20"
                            >
                              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleMute}
                              className="text-white hover:bg-white/20"
                            >
                              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </Button>
                            
                            <Input
                              type="range"
                              min="0"
                              max="100"
                              value={volume}
                              onChange={(e) => handleVolumeChange(Number(e.target.value))}
                              className="w-20 h-2 bg-white/20 accent-blue-500"
                            />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-white/20"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleFullscreen}
                              className="text-white hover:bg-white/20"
                            >
                              <Maximize className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Channel Info Overlay */}
                        <div className="mt-2">
                          <div className="text-white font-semibold">{selectedChannel.name}</div>
                          {getCurrentProgram(selectedChannel.id) && (
                            <div className="text-blue-300 text-sm">
                              Now: {getCurrentProgram(selectedChannel.id)?.title}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <Tv className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-white text-lg mb-2">Select a channel to start streaming</p>
                        <p className="text-slate-400">Choose from our premium sports channels</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Program Guide */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Program Guide
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {selectedChannel ? (
                  <>
                    {epgData
                      .filter(epg => epg.channelId === selectedChannel.id)
                      .map(channelEPG => 
                        channelEPG.programs.map(program => {
                          const isLive = program.live;
                          const startTime = new Date(program.startTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          });
                          const endTime = new Date(program.endTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          });
                          
                          return (
                            <div
                              key={program.id}
                              className={`p-3 rounded-lg border ${
                                isLive 
                                  ? 'bg-red-600/20 border-red-500 text-red-100' 
                                  : 'bg-slate-700/50 border-slate-600 text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{startTime} - {endTime}</span>
                                {isLive && (
                                  <Badge variant="destructive" size="sm">LIVE</Badge>
                                )}
                              </div>
                              
                              <div className="font-medium text-sm mb-1">
                                {program.title}
                              </div>
                              
                              <Badge variant="outline" size="sm">
                                {program.category}
                              </Badge>
                            </div>
                          );
                        })
                      )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Radio className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Select a channel to view program guide</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{channels.length}</div>
              <div className="text-blue-300 text-sm">Available Channels</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {channels.filter(ch => ch.isLive).length}
              </div>
              <div className="text-red-400 text-sm">Live Now</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">HD</div>
              <div className="text-green-400 text-sm">Quality</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">24/7</div>
              <div className="text-blue-300 text-sm">Availability</div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}