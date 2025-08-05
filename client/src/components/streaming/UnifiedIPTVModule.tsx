import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Settings, Tv, Radio, Calendar, Clock, Users, Zap
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
  headers: { 'User-Agent': string; 'Referer': string };
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

export default function UnifiedIPTVModule() {
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Use our existing IPTV endpoints
  const { data: channels = [] } = useQuery<IPTVChannel[]>({ 
    queryKey: ['/api/iptv/github-channels'],
    select: (data: any) => {
      if (data?.channels) {
        return data.channels.map((channel: any) => ({
          id: channel.id || Math.random().toString(),
          name: channel.name || 'Unknown Channel',
          category: channel.category || 'Sports',
          logo: channel.logo || '/api/placeholder/32/32',
          streamUrl: channel.url || channel.streamUrl || '',
          quality: 'HD',
          isLive: true
        }));
      }
      return [];
    }
  });

  const { data: epgData = [] } = useQuery<EPGData[]>({ 
    queryKey: ['/api/iptv/epg'],
    enabled: false // Disable for now since we don't have EPG endpoint yet
  });

  const { data: streamData } = useQuery<StreamData>({
    queryKey: ['/api/iptv/stream', selectedChannel?.id],
    enabled: !!selectedChannel,
    select: (data: any) => ({
      channelId: selectedChannel?.id || '',
      streamUrl: selectedChannel?.streamUrl || '',
      headers: { 'User-Agent': 'WeParlay-Player', 'Referer': 'https://weparlay.io' },
      quality: 'HD',
      format: 'HLS',
      authenticated: true
    })
  });

  useEffect(() => {
    if (streamData && videoRef.current && selectedChannel) {
      const video = videoRef.current;
      video.src = streamData.streamUrl;
      video.load();
      if (isPlaying) {
        video.play().catch(err => {
          console.error('Playback error:', err);
          toast({ 
            title: 'Playback Failed', 
            description: 'Click Play to resume stream.',
            variant: 'destructive'
          });
        });
      }
    }
  }, [streamData, selectedChannel, isPlaying, toast]);

  useEffect(() => {
    if (videoRef.current) setIsMuted(videoRef.current.muted);
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Play error:', err);
          toast({ 
            title: 'Playback Error', 
            description: 'Failed to start playback',
            variant: 'destructive'
          });
        });
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v / 100;
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

  const categories = ['all', ...Array.from(new Set(channels.map(c => c.category)))];
  const filteredChannels = selectedCategory === 'all' ? channels : channels.filter(c => c.category === selectedCategory);

  const getCurrentProgram = (channelId: string) => {
    const now = new Date();
    const channelEPG = epgData.find(e => e.channelId === channelId);
    return channelEPG?.programs.find(p => new Date(p.startTime) <= now && new Date(p.endTime) >= now) || null;
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">WeParlay IPTV</h1>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Channel List */}
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {filteredChannels.map(channel => (
            <Card 
              key={channel.id} 
              onClick={() => {
                setSelectedChannel(channel);
                setIsPlaying(true);
                toast({ 
                  title: 'Loading...', 
                  description: `Now playing ${channel.name}` 
                });
              }} 
              className={`p-3 cursor-pointer transition-all hover:scale-105 ${
                selectedChannel?.id === channel.id 
                  ? 'bg-blue-700 border-blue-500' 
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
              }`}
            >
              <div className="flex gap-3 items-center">
                <img 
                  src={channel.logo} 
                  alt={channel.name} 
                  className="w-8 h-8 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/32/32';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{channel.name}</div>
                  <div className="text-sm text-blue-300 truncate">
                    {getCurrentProgram(channel.id)?.title || 'Live Sports'}
                  </div>
                </div>
                {channel.isLive && <Badge className="bg-red-500 animate-pulse">LIVE</Badge>}
              </div>
            </Card>
          ))}
        </div>

        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card className="bg-black border border-gray-700">
            <CardContent className="relative aspect-video p-0">
              {selectedChannel ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted={isMuted}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={togglePlay} className="text-white hover:bg-white/20">
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20">
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <input 
                          type="range" 
                          min={0} 
                          max={100} 
                          value={volume} 
                          onChange={handleVolumeChange}
                          className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                          <Maximize className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Channel Info Overlay */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <img 
                          src={selectedChannel.logo} 
                          alt={selectedChannel.name}
                          className="w-6 h-6 rounded"
                        />
                        <span className="text-white font-semibold">{selectedChannel.name}</span>
                        <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-center text-gray-400">
                  <div>
                    <Tv className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-xl font-semibold mb-2">Select a Channel</p>
                    <p className="text-sm">Choose from {channels.length} live channels</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Program Guide */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5" /> 
                Program Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[420px] overflow-y-auto">
              {selectedChannel ? (
                epgData.find(e => e.channelId === selectedChannel.id)?.programs.map(p => (
                  <div key={p.id} className={`p-2 rounded transition-colors ${p.live ? 'bg-red-500/20 border border-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(p.startTime).toLocaleTimeString()} - {new Date(p.endTime).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="font-semibold text-white">{p.title}</div>
                    <div className="text-xs text-blue-300">{p.category}</div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-sm text-gray-400">Live Sports Content</p>
                    <p className="text-xs text-gray-500 mt-1">Real-time streaming available</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-sm text-gray-400">Select a channel to view program guide</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}