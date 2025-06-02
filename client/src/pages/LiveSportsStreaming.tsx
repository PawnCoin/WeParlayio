import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import LiveStreamPlayer from '@/components/streaming/LiveStreamPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Play, Calendar, Trophy, Zap, Star, Crown, Gem } from 'lucide-react';

interface StreamEvent {
  id: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  streamUrl?: string;
  quality: string;
  viewerCount: number;
  isLive: boolean;
  startTime: string;
  sport: string;
}

export default function LiveSportsStreaming() {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<StreamEvent | null>(null);
  const [activeTab, setActiveTab] = useState('sports');

  // Check TVApp2 status
  const { data: streamingStatus } = useQuery({
    queryKey: ['/api/streaming/status']
  });

  // Fetch live sports streams from M3U playlist
  const { data: sportsStreamsData, isLoading: sportsLoading } = useQuery({
    queryKey: ['/api/streaming/sports-channels'],
    enabled: streamingStatus?.available
  });

  // Fetch live esports streams  
  const { data: esportsStreams, isLoading: esportsLoading } = useQuery({
    queryKey: ['/api/streaming/search?q=esports'],
    enabled: streamingStatus?.available
  });

  // Transform M3U data to StreamEvent format
  const sportsStreams = sportsStreamsData?.channels?.map((channel: any) => ({
    id: channel.eventId,
    title: channel.title,
    homeTeam: channel.homeTeam || 'Live',
    awayTeam: channel.awayTeam || 'Sports',
    league: channel.league,
    streamUrl: channel.sources?.[0]?.url,
    quality: channel.sources?.[0]?.quality || 'HD',
    viewerCount: channel.sources?.[0]?.viewers || 1000,
    isLive: channel.sources?.[0]?.isLive || true,
    startTime: channel.startTime,
    sport: channel.sportType
  })) || [];

  // Get user tier and determine stream access
  const userTier = user?.tier || 'bronze';
  const isPreviewMode = ['bronze', 'silver'].includes(userTier.toLowerCase());

  const getQualityForTier = (tier: string): string => {
    switch (tier.toLowerCase()) {
      case 'diamond': return '4K';
      case 'platinum': return 'HD';
      case 'gold': return 'HD';
      default: return 'SD';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'diamond': return <Gem className="h-4 w-4" />;
      case 'platinum': return <Crown className="h-4 w-4" />;
      case 'gold': return <Star className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const handleUpgrade = () => {
    // Navigate to upgrade page
    window.location.href = '/upgrade';
  };

  const EventCard = ({ event }: { event: StreamEvent }) => (
    <Card 
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => setSelectedEvent(event)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant={event.isLive ? 'destructive' : 'secondary'}>
            {event.isLive ? '🔴 LIVE' : '📅 Upcoming'}
          </Badge>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{event.sport}</Badge>
            <Badge variant="outline">{event.quality}</Badge>
          </div>
        </div>
        <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
        <p className="text-gray-600 mb-2">{event.homeTeam} vs {event.awayTeam}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{event.league}</span>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Play className="h-3 w-3" />
            {event.viewerCount.toLocaleString()} viewers
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!streamingStatus?.available) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Live Sports Streaming
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-xl font-semibold mb-2">Streaming Service Initializing</h3>
            <p className="text-gray-600 mb-4">
              We're setting up your premium streaming experience with authentic IPTV coverage.
            </p>
            <div className="text-sm text-gray-500">
              Using demonstration data until streaming service is configured.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {selectedEvent ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setSelectedEvent(null)}
            >
              ← Back to Events
            </Button>
            <div className="flex items-center gap-2">
              {getTierIcon(userTier)}
              <span className="font-medium">{userTier.toUpperCase()} Tier</span>
            </div>
          </div>
          
          <LiveStreamPlayer
            streamUrl={selectedEvent.streamUrl}
            gameTitle={selectedEvent.title}
            homeTeam={selectedEvent.homeTeam}
            awayTeam={selectedEvent.awayTeam}
            league={selectedEvent.league}
            viewerCount={selectedEvent.viewerCount}
            isLive={selectedEvent.isLive}
            eventId={selectedEvent.id}
            userTier={userTier}
            previewMode={isPreviewMode}
            previewDuration={30}
            quality={getQualityForTier(userTier)}
            onUpgradeClick={handleUpgrade}
          />
          
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">League</h4>
                  <p className="text-gray-600">{selectedEvent.league}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Quality</h4>
                  <Badge variant="outline">{getQualityForTier(userTier)}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Viewers</h4>
                  <p className="text-gray-600">{selectedEvent.viewerCount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Live Sports Streaming</h1>
            <p className="text-gray-600">Watch live sports with authentic IPTV coverage</p>
          </div>

          {/* Tier Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTierIcon(userTier)}
                  <span className="font-semibold">{userTier.toUpperCase()} Tier</span>
                  <Badge variant="outline">{getQualityForTier(userTier)} Quality</Badge>
                </div>
                {isPreviewMode && (
                  <Button onClick={handleUpgrade} size="sm">
                    Upgrade for Unlimited Access
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sports" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Sports
              </TabsTrigger>
              <TabsTrigger value="esports" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Esports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sports" className="space-y-4">
              {sportsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : sportsStreams?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sportsStreams.map((event: StreamEvent) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No live sports streams available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="esports" className="space-y-4">
              {esportsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : esportsStreams?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {esportsStreams.map((event: StreamEvent) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No live esports streams available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}