import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  Tv, 
  Signal,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Zap,
  TrendingUp
} from 'lucide-react';

interface LiveStream {
  id: string;
  title: string;
  description: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  period: string;
  timeRemaining: string;
  streamUrl: string;
  thumbnailUrl: string;
  viewers: number;
  quality: 'HD' | '4K' | 'SD';
  isLive: boolean;
  startTime: string;
  streamSources: StreamSource[];
  chatEnabled: boolean;
  bettingIntegrated: boolean;
}

interface StreamSource {
  id: string;
  name: string;
  url: string;
  quality: string;
  isAvailable: boolean;
  delay: number;
}

interface StreamChat {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isHighlighted: boolean;
}

const AdvancedLiveStreaming: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSource, setCurrentSource] = useState<StreamSource | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [volume, setVolume] = useState(75);

  // Fetch live streams
  const { data: streams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ['/api/streams/live'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch stream chat
  const { data: chatMessages = [] } = useQuery({
    queryKey: ['/api/streams/chat', selectedStream?.id],
    enabled: !!selectedStream?.id && selectedStream?.chatEnabled,
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  // Send chat message
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('POST', '/api/streams/chat/send', {
        streamId: selectedStream?.id,
        message,
      });
    },
    onSuccess: () => {
      setChatMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/streams/chat', selectedStream?.id] });
    },
  });

  // Track viewing analytics
  const trackView = useMutation({
    mutationFn: async (streamId: string) => {
      return apiRequest('POST', '/api/streams/track-view', { streamId });
    },
  });

  // Handle stream selection
  const handleStreamSelect = (stream: LiveStream) => {
    setSelectedStream(stream);
    if (stream.streamSources.length > 0) {
      setCurrentSource(stream.streamSources[0]);
    }
    trackView.mutate(stream.id);
  };

  // Handle play/pause
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

  // Handle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle source change
  const changeSource = (source: StreamSource) => {
    if (source.isAvailable) {
      setCurrentSource(source);
      toast({
        title: "Stream Source Changed",
        description: `Switched to ${source.name} (${source.quality})`,
      });
    }
  };

  const getQualityBadgeColor = (quality: string) => {
    switch (quality) {
      case '4K': return 'bg-purple-500 text-white';
      case 'HD': return 'bg-blue-500 text-white';
      case 'SD': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Featured Stream Player */}
      {selectedStream && (
        <Card className="overflow-hidden">
          <div className="relative bg-black">
            <video
              ref={videoRef}
              className="w-full aspect-video"
              src={currentSource?.url}
              poster={selectedStream.thumbnailUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <Volume2 className="h-4 w-4" />
                    <Progress value={volume} className="w-16 h-1" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Signal className="h-4 w-4 text-green-500" />
                    <span className="text-sm">LIVE</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getQualityBadgeColor(currentSource?.quality || 'HD')}>
                    {currentSource?.quality || 'HD'}
                  </Badge>
                  
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-4 w-4" />
                    {selectedStream.viewers.toLocaleString()}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedStream.title}</h2>
                <p className="text-muted-foreground">{selectedStream.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline">{selectedStream.sport}</Badge>
                  <div className="text-sm text-muted-foreground">
                    {selectedStream.homeTeam} {selectedStream.homeScore} - {selectedStream.awayScore} {selectedStream.awayTeam}
                  </div>
                  <div className="text-sm font-medium">
                    {selectedStream.period} • {selectedStream.timeRemaining}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Like
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {selectedStream.bettingIntegrated && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Zap className="h-4 w-4 mr-2" />
                    Quick Bet
                  </Button>
                )}
              </div>
            </div>
            
            {/* Stream Sources */}
            {selectedStream.streamSources.length > 1 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Stream Sources</h3>
                <div className="flex gap-2">
                  {selectedStream.streamSources.map((source) => (
                    <Button
                      key={source.id}
                      variant={currentSource?.id === source.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => changeSource(source)}
                      disabled={!source.isAvailable}
                      className="flex items-center gap-2"
                    >
                      <div className={`w-2 h-2 rounded-full ${source.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                      {source.name}
                      <Badge variant="secondary" className="ml-1">
                        {source.quality}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Stream Grid and Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Streams */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tv className="h-5 w-5" />
                Live Streams
                <Badge variant="secondary">{streams.length} Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {streamsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : streams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Tv className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No live streams available</p>
                  <p className="text-sm">Check back during game times!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {streams.map((stream: LiveStream) => (
                    <Card 
                      key={stream.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedStream?.id === stream.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleStreamSelect(stream)}
                    >
                      <div className="relative">
                        <img 
                          src={stream.thumbnailUrl} 
                          alt={stream.title}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <Badge className="bg-red-500 text-white">LIVE</Badge>
                          <Badge className={getQualityBadgeColor(stream.quality)}>
                            {stream.quality}
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          <Users className="h-3 w-3 inline mr-1" />
                          {stream.viewers.toLocaleString()}
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm mb-1">{stream.title}</h3>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{stream.sport}</span>
                          <span>{stream.homeScore} - {stream.awayScore}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Stream Chat */}
        {selectedStream?.chatEnabled && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {chatMessages.map((message: StreamChat) => (
                    <div 
                      key={message.id} 
                      className={`text-sm ${message.isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded' : ''}`}
                    >
                      <span className="font-medium text-primary">{message.username}:</span>
                      <span className="ml-2">{message.message}</span>
                      <div className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
                
                {isAuthenticated && (
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && chatMessage.trim()) {
                            sendMessage.mutate(chatMessage);
                          }
                        }}
                      />
                      <Button 
                        size="sm"
                        onClick={() => sendMessage.mutate(chatMessage)}
                        disabled={!chatMessage.trim() || sendMessage.isPending}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdvancedLiveStreaming;