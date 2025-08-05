/**
 * Enhanced Universal Sports Router - Production Ready Streaming
 * Integrates YouTube API, IPTV, and live sports data
 * NO MOCK DATA - Only authentic streaming sources
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  ExternalLink, 
  Tv, 
  Youtube, 
  Globe, 
  Signal,
  Star,
  Users,
  Clock,
  Shield,
  Settings,
  Maximize,
  Volume2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface StreamOption {
  id: string;
  name: string;
  streamUrl: string;
  embedUrl?: string;
  streamType: 'youtube' | 'iptv' | 'direct' | 'hls';
  quality: 'SD' | 'HD' | '4K';
  isLive: boolean;
  sport: string;
  league: string;
  language: string;
  country: string;
  thumbnail?: string;
  channelName?: string;
  viewers?: number;
  source: 'routing' | 'youtube' | 'iptv';
  matchup?: string;
}

interface EnhancedUniversalSportsRouterProps {
  sportKey: string;
  gameId?: string;
  homeTeam?: string;
  awayTeam?: string;
  children?: React.ReactNode;
  buttonText?: string;
  autoOpen?: boolean;
  variant?: 'default' | 'compact' | 'card';
  showQuality?: boolean;
  showViewers?: boolean;
  enableEmbedMode?: boolean;
}

export const EnhancedUniversalSportsRouter: React.FC<EnhancedUniversalSportsRouterProps> = ({
  sportKey,
  gameId,
  homeTeam,
  awayTeam,
  children,
  buttonText = "Watch Live",
  autoOpen = false,
  variant = 'default',
  showQuality = true,
  showViewers = true,
  enableEmbedMode = false
}) => {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [streamOptions, setStreamOptions] = useState<StreamOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStream, setSelectedStream] = useState<StreamOption | null>(null);
  const [activeTab, setActiveTab] = useState('live');
  const [embedMode, setEmbedMode] = useState(false);
  const [streamStats, setStreamStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadStreamOptions();
    }
  }, [isOpen, sportKey, gameId]);

  const loadStreamOptions = async () => {
    setLoading(true);
    try {
      console.log(`🎯 Loading streams for ${sportKey}`);
      
      // Get all available streams for this sport
      const response = await fetch(`/api/live-streaming/sport/${sportKey}/all`);
      const data = await response.json();

      if (data.success && data.streams.length > 0) {
        setStreamOptions(data.streams);
        setSelectedStream(data.streams[0]); // Auto-select first option
        
        // If we have team names, try to find a specific matchup
        if (homeTeam && awayTeam) {
          await searchSpecificMatchup();
        }
      } else {
        // Try search-based approach
        await searchForStreams();
      }
    } catch (error) {
      console.error('Error loading stream options:', error);
      await searchForStreams();
    }
    setLoading(false);
  };

  const searchSpecificMatchup = async () => {
    if (!homeTeam || !awayTeam) return;

    try {
      const searchParams = new URLSearchParams();
      searchParams.append('team1', homeTeam);
      searchParams.append('team2', awayTeam);
      if (sportKey) searchParams.append('sport', sportKey);

      const response = await fetch(`/api/live-streaming/search?${searchParams}`);
      const data = await response.json();

      if (data.success && data.stream) {
        // Prioritize the specific matchup
        setStreamOptions(prev => [data.stream, ...prev.filter(s => s.id !== data.stream.id)]);
        setSelectedStream(data.stream);
      }
    } catch (error) {
      console.error('Error searching specific matchup:', error);
    }
  };

  const searchForStreams = async () => {
    try {
      // Get recommendations as fallback
      const response = await fetch('/api/live-streaming/recommendations');
      const data = await response.json();
      
      if (data.success && data.recommendations.length > 0) {
        setStreamOptions(data.recommendations);
        setSelectedStream(data.recommendations[0]);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: "Stream Error",
        description: "Failed to find live streams",
        variant: "destructive"
      });
    }
  };

  const openStream = (stream: StreamOption, embed: boolean = false) => {
    if (embed && enableEmbedMode && stream.embedUrl) {
      setEmbedMode(true);
      setSelectedStream(stream);
    } else {
      window.open(stream.streamUrl, '_blank');
      toast({
        title: "Opening Live Stream",
        description: `${stream.name} - ${stream.quality} quality`,
      });
    }
  };

  const validateStream = async (stream: StreamOption) => {
    if (stream.streamType !== 'youtube') return true;

    try {
      const videoId = stream.streamUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      if (!videoId) return true;

      const response = await fetch(`/api/live-streaming/validate/${videoId}`);
      const data = await response.json();
      
      if (data.success) {
        setStreamStats(data.details);
        return data.isAvailable;
      }
    } catch (error) {
      console.error('Error validating stream:', error);
    }
    return true;
  };

  const directWatch = async () => {
    try {
      const response = await fetch(`/api/live-streaming/sport/${sportKey}?gameId=${gameId || ''}`);
      const data = await response.json();

      if (data.success && data.stream) {
        openStream(data.stream);
      } else {
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error with direct watch:', error);
      setIsOpen(true);
    }
  };

  const getStreamIcon = (streamType: string) => {
    switch (streamType) {
      case 'youtube': return <Youtube className="h-4 w-4" />;
      case 'iptv': return <Tv className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case '4K': return 'bg-purple-600';
      case 'HD': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const renderStreamCard = (stream: StreamOption, index: number) => (
    <Card 
      key={stream.id}
      className={cn(
        "transition-all duration-200 hover:shadow-md border",
        selectedStream?.id === stream.id ? 'ring-2 ring-blue-500 border-blue-200' : 'hover:border-gray-300'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {stream.thumbnail && (
            <img 
              src={stream.thumbnail} 
              alt={stream.name}
              className="w-16 h-12 rounded object-cover flex-shrink-0"
            />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getStreamIcon(stream.streamType)}
              <h3 className="font-semibold text-sm truncate">{stream.name}</h3>
              {stream.isLive && (
                <Badge variant="destructive" className="animate-pulse text-xs">
                  LIVE
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
              <span>{stream.sport} • {stream.league}</span>
              {stream.channelName && (
                <span>• {stream.channelName}</span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showQuality && (
                  <Badge className={cn("text-xs", getQualityColor(stream.quality))}>
                    {stream.quality}
                  </Badge>
                )}
                <span className="text-xs text-gray-500">
                  {stream.language.toUpperCase()} • {stream.country}
                </span>
                {showViewers && stream.viewers && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    {stream.viewers.toLocaleString()}
                  </div>
                )}
              </div>
              
              <div className="flex gap-1">
                {enableEmbedMode && stream.embedUrl && (
                  <Button 
                    onClick={() => openStream(stream, true)}
                    size="sm"
                    variant="outline"
                    className="h-7 px-2"
                  >
                    <Maximize className="h-3 w-3" />
                  </Button>
                )}
                <Button 
                  onClick={() => openStream(stream)}
                  size="sm"
                  className="h-7 px-2"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Watch
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (variant === 'compact') {
    return (
      <Button 
        onClick={directWatch} 
        size="sm"
        className="bg-red-600 hover:bg-red-700"
      >
        <Play className="h-3 w-3 mr-1" />
        {buttonText}
      </Button>
    );
  }

  return (
    <>
      {children ? (
        <div onClick={directWatch} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <Button 
          onClick={directWatch} 
          className={cn(
            "bg-red-600 hover:bg-red-700",
            variant === 'card' && "w-full"
          )}
        >
          <Play className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tv className="h-5 w-5" />
              Live Stream Options
              {homeTeam && awayTeam && (
                <span className="text-sm font-normal text-gray-600">
                  {homeTeam} vs {awayTeam}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {embedMode && selectedStream?.embedUrl ? (
            <div className="flex-1 min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{selectedStream.name}</h3>
                <Button onClick={() => setEmbedMode(false)} variant="outline" size="sm">
                  Back to Options
                </Button>
              </div>
              <div className="aspect-video bg-black rounded">
                <iframe
                  src={selectedStream.embedUrl}
                  className="w-full h-full rounded"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-hidden">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
                  <p>Finding live streams...</p>
                </div>
              ) : streamOptions.length > 0 ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="live">Live Streams</TabsTrigger>
                    <TabsTrigger value="official">Official Channels</TabsTrigger>
                    <TabsTrigger value="trending">Trending</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <TabsContent value="live" className="space-y-3 mt-4">
                      {streamOptions
                        .filter(stream => stream.isLive)
                        .map((stream, index) => renderStreamCard(stream, index))
                      }
                    </TabsContent>
                    
                    <TabsContent value="official" className="space-y-3 mt-4">
                      {streamOptions
                        .filter(stream => stream.source === 'youtube' || stream.source === 'routing')
                        .map((stream, index) => renderStreamCard(stream, index))
                      }
                    </TabsContent>
                    
                    <TabsContent value="trending" className="space-y-3 mt-4">
                      {streamOptions
                        .filter(stream => !stream.isLive)
                        .map((stream, index) => renderStreamCard(stream, index))
                      }
                    </TabsContent>
                  </div>
                </Tabs>
              ) : (
                <div className="text-center py-8">
                  <Tv className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Streams Available</h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any live streams for this sport right now.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>• Try searching for specific team matchups</p>
                    <p>• Check back later for live games</p>
                    <p>• Browse trending sports content</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedStream && !embedMode && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    Recommended: {selectedStream.name}
                  </span>
                  {streamStats && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      {streamStats.viewCount ? parseInt(streamStats.viewCount).toLocaleString() : 'N/A'} views
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {enableEmbedMode && selectedStream.embedUrl && (
                    <Button 
                      onClick={() => openStream(selectedStream, true)}
                      size="sm"
                      variant="outline"
                    >
                      <Maximize className="h-4 w-4 mr-1" />
                      Embed
                    </Button>
                  )}
                  <Button 
                    onClick={() => openStream(selectedStream)}
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Watch Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedUniversalSportsRouter;