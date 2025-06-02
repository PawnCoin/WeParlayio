import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Users,
  MessageCircle,
  Heart,
  Share2,
  TrendingUp,
  Radio,
  Tv,
  Smartphone,
  Monitor,
  Activity
} from 'lucide-react';

interface StreamSource {
  id: string;
  name: string;
  type: 'official' | 'community' | 'highlights';
  quality: '720p' | '1080p' | '4K';
  viewers: number;
  url: string;
  isLive: boolean;
  delay: number; // seconds
}

interface LiveEvent {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  period: string;
  timeRemaining: string;
  status: 'live' | 'halftime' | 'upcoming';
  streamSources: StreamSource[];
  viewerCount: number;
  chatEnabled: boolean;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  type: 'message' | 'bet' | 'reaction';
}

export default function StreamingIntegrationHub() {
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const [selectedStream, setSelectedStream] = useState<StreamSource | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [viewerReactions, setViewerReactions] = useState<Record<string, number>>({
    '🔥': 0,
    '⚡': 0,
    '💯': 0,
    '🎯': 0
  });

  // Fetch live streaming events
  const { data: liveEvents, isLoading } = useQuery({
    queryKey: ['/api/streaming/live-events'],
    refetchInterval: 10000, // 10-second updates
  });

  // Simulate live chat updates
  useEffect(() => {
    if (!selectedEvent?.chatEnabled) return;

    const interval = setInterval(() => {
      const mockMessages = [
        'This game is insane! 🔥',
        'Lakers looking strong tonight',
        'Just placed a live bet on over 225.5',
        'Anyone else seeing this momentum shift?',
        'Stream quality is perfect 👌'
      ];
      
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        username: `User${Math.floor(Math.random() * 1000)}`,
        message: mockMessages[Math.floor(Math.random() * mockMessages.length)],
        timestamp: new Date().toISOString(),
        type: 'message'
      };

      setChatMessages(prev => [newMsg, ...prev.slice(0, 49)]); // Keep last 50 messages
    }, 3000 + Math.random() * 5000); // Random interval 3-8 seconds

    return () => clearInterval(interval);
  }, [selectedEvent]);

  // Mock streaming events
  const mockEvents: LiveEvent[] = [
    {
      id: 'stream_001',
      sport: 'NBA',
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      homeScore: 89,
      awayScore: 92,
      period: '3rd Quarter',
      timeRemaining: '6:42',
      status: 'live',
      viewerCount: 15234,
      chatEnabled: true,
      streamSources: [
        {
          id: 'src_001',
          name: 'Official NBA Stream',
          type: 'official',
          quality: '1080p',
          viewers: 12000,
          url: 'https://example.com/nba-stream',
          isLive: true,
          delay: 15
        },
        {
          id: 'src_002',
          name: 'Community HD',
          type: 'community',
          quality: '720p',
          viewers: 3234,
          url: 'https://example.com/community-stream',
          isLive: true,
          delay: 8
        }
      ]
    },
    {
      id: 'stream_002',
      sport: 'NFL',
      homeTeam: 'Cowboys',
      awayTeam: 'Eagles',
      homeScore: 21,
      awayScore: 17,
      period: '4th Quarter',
      timeRemaining: '12:15',
      status: 'live',
      viewerCount: 28456,
      chatEnabled: true,
      streamSources: [
        {
          id: 'src_003',
          name: 'ESPN Official',
          type: 'official',
          quality: '4K',
          viewers: 25000,
          url: 'https://example.com/espn-stream',
          isLive: true,
          delay: 20
        }
      ]
    }
  ];

  const events = liveEvents || mockEvents;

  const handleStreamSelect = (event: LiveEvent, stream: StreamSource) => {
    setSelectedEvent(event);
    setSelectedStream(stream);
    setIsPlaying(true);
  };

  const handleReaction = (emoji: string) => {
    setViewerReactions(prev => ({
      ...prev,
      [emoji]: prev[emoji] + 1
    }));
  };

  const sendChatMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      username: 'You',
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: 'message'
    };

    setChatMessages(prev => [message, ...prev]);
    setNewMessage('');
  };

  const formatViewers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading streaming events...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
          <Tv className="h-8 w-8 text-red-500" />
          <span>Live Streaming Hub</span>
        </h1>
        <p className="text-gray-600">Watch live sports while betting in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Video Player */}
        <div className="lg:col-span-3 space-y-4">
          {selectedEvent && selectedStream ? (
            <Card className="overflow-hidden">
              <div className="relative bg-black aspect-video">
                {/* Video Player Simulation */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="text-center text-white">
                    <div className="text-6xl font-bold mb-4">
                      {selectedEvent.awayScore} - {selectedEvent.homeScore}
                    </div>
                    <div className="text-2xl mb-2">
                      {selectedEvent.awayTeam} @ {selectedEvent.homeTeam}
                    </div>
                    <div className="text-lg text-gray-300">
                      {selectedEvent.period} - {selectedEvent.timeRemaining}
                    </div>
                  </div>
                </div>

                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <div className="w-20 h-1 bg-white/30 rounded">
                          <div 
                            className="h-full bg-white rounded"
                            style={{ width: `${isMuted ? 0 : volume}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-white text-sm">
                        <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                        <span>LIVE</span>
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          {formatViewers(selectedStream.viewers)} viewers
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {selectedStream.quality}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                      >
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Live Reactions */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  {Object.entries(viewerReactions).map(([emoji, count]) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="bg-black/50 text-white hover:bg-black/70"
                      onClick={() => handleReaction(emoji)}
                    >
                      {emoji} {count > 0 && <span className="ml-1">{count}</span>}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Stream Info */}
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedEvent.awayTeam} @ {selectedEvent.homeTeam}
                    </h3>
                    <p className="text-gray-600">
                      {selectedStream.name} • {selectedStream.quality} • {selectedStream.delay}s delay
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Follow
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Monitor className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">Select a live event to start streaming</p>
              </CardContent>
            </Card>
          )}

          {/* Stream Sources */}
          {selectedEvent && (
            <Card>
              <CardHeader>
                <CardTitle>Available Streams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedEvent.streamSources.map((stream) => (
                    <Button
                      key={stream.id}
                      variant={selectedStream?.id === stream.id ? "default" : "outline"}
                      className="p-4 h-auto justify-start"
                      onClick={() => setSelectedStream(stream)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{stream.name}</div>
                        <div className="text-sm opacity-70">
                          {stream.quality} • {formatViewers(stream.viewers)} viewers
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={stream.type === 'official' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {stream.type}
                          </Badge>
                          {stream.isLive && (
                            <Badge variant="destructive" className="text-xs">
                              <div className="w-1 h-1 bg-white rounded-full mr-1 animate-pulse"></div>
                              LIVE
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Events & Chat Sidebar */}
        <div className="space-y-4">
          {/* Live Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-red-500" />
                <span>Live Events</span>
                <Badge variant="outline">{events.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedEvent?.id === event.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleStreamSelect(event, event.streamSources[0])}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="destructive" className="text-xs">
                      {event.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {event.sport}
                    </Badge>
                  </div>
                  
                  <div className="text-sm font-medium mb-1">
                    {event.awayTeam} @ {event.homeTeam}
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{event.period}</span>
                    <span>{formatViewers(event.viewerCount)} watching</span>
                  </div>

                  <div className="flex justify-between text-lg font-bold mt-2">
                    <span>{event.awayScore}</span>
                    <span>-</span>
                    <span>{event.homeScore}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Live Chat */}
          {selectedEvent?.chatEnabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Live Chat</span>
                  <Badge variant="outline">{formatViewers(selectedEvent.viewerCount)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chat Messages */}
                <div className="h-64 overflow-y-auto space-y-2 border rounded p-2">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <span className="font-medium text-blue-600">{msg.username}:</span>
                      <span className="ml-2">{msg.message}</span>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <Button onClick={sendChatMessage}>Send</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Stream Quality Notice */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-2">
            <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Multi-Device Streaming</p>
              <p>Optimized for desktop, tablet, and mobile viewing. Switch between official and community streams for the best experience.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}