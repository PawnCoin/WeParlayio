import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play,
  Users,
  Zap,
  Settings,
  Youtube,
  Tv,
  ArrowLeft,
  Crown,
  Star,
  Gem
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import AdvancedLiveStreamPlayer from '@/components/streaming/AdvancedLiveStreamPlayer';
import ReactPlayerVideoPlayer from '@/components/streaming/ReactPlayerVideoPlayer';
import UnifiedIPTVModule from '@/components/streaming/UnifiedIPTVModule';

interface AdvancedLiveStreamingProps {
  onBackToBasic?: () => void;
}

export default function AdvancedLiveStreaming({ onBackToBasic }: AdvancedLiveStreamingProps) {
  const [activeTab, setActiveTab] = useState('premium');
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [showFullscreenPlayer, setShowFullscreenPlayer] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Check user tier for access control
  const hasVIPAccess = user?.tier === 'platinum' || user?.tier === 'gold' || user?.isAdmin;
  const hasPremiumAccess = user?.tier === 'diamond' || user?.tier === 'platinum' || user?.isAdmin;

  // Fetch live sports data
  const { data: sportsEvents } = useQuery({
    queryKey: ['/api/sports'],
    refetchInterval: 30000,
  });

  // Fetch YouTube streams for VIP users
  const { data: youtubeStreams } = useQuery({
    queryKey: ['/api/youtube/live-streams'],
    enabled: hasVIPAccess,
    refetchInterval: 60000,
  }) as { data?: { streams?: any[] } };

  // Convert sports events to advanced format
  const premiumStreams = sportsEvents?.slice(0, 6).map((event: any) => ({
    id: event.id,
    title: `${event.homeTeam.name} vs ${event.awayTeam.name}`,
    homeTeam: event.homeTeam.name,
    awayTeam: event.awayTeam.name,
    league: event.sport,
    quality: user?.tier === 'diamond' ? '4K' : user?.tier === 'platinum' ? 'HD' : 'SD',
    streamUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
    viewerCount: Math.floor(Math.random() * 50000) + 10000,
    isLive: true,
    previewMode: !hasVIPAccess,
    userTier: user?.tier || 'bronze'
  })) || [];

  const handleSelectGame = useCallback((game: any) => {
    if (!hasVIPAccess && activeTab !== 'iptv') {
      toast({
        title: "VIP Access Required",
        description: "Premium streaming requires VIP membership.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedGame(game);
    setShowFullscreenPlayer(true);
  }, [hasVIPAccess, activeTab, toast]);

  const handleClosePlayer = useCallback(() => {
    setShowFullscreenPlayer(false);
    setSelectedGame(null);
  }, []);

  const handleUpgradeClick = useCallback(() => {
    window.location.href = '/upgrade-tier';
  }, []);

  if (showFullscreenPlayer && selectedGame) {
    return (
      <ReactPlayerVideoPlayer
        game={selectedGame}
        onClose={handleClosePlayer}
        onBackToList={handleClosePlayer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {onBackToBasic && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onBackToBasic}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Basic Mode
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Advanced Streaming
              </h1>
              <p className="text-gray-400 mt-1">Premium quality sports streaming experience</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`
                ${user?.tier === 'diamond' ? 'border-purple-500 text-purple-400' : ''}
                ${user?.tier === 'platinum' ? 'border-blue-500 text-blue-400' : ''}
                ${user?.tier === 'gold' ? 'border-yellow-500 text-yellow-400' : ''}
                border-gray-600 text-gray-400
              `}
            >
              {user?.tier === 'diamond' && <Gem className="h-3 w-3 mr-1" />}
              {user?.tier === 'platinum' && <Crown className="h-3 w-3 mr-1" />}
              {user?.tier === 'gold' && <Star className="h-3 w-3 mr-1" />}
              {user?.tier?.toUpperCase() || 'FREE'}
            </Badge>
          </div>
        </div>

        {/* Streaming Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900">
            <TabsTrigger value="premium" className="data-[state=active]:bg-purple-600">
              <Crown className="h-4 w-4 mr-2" />
              Premium Streams
            </TabsTrigger>
            <TabsTrigger value="youtube" className="data-[state=active]:bg-red-600">
              <Youtube className="h-4 w-4 mr-2" />
              YouTube Live
            </TabsTrigger>
            <TabsTrigger value="iptv" className="data-[state=active]:bg-blue-600">
              <Tv className="h-4 w-4 mr-2" />
              IPTV Channels
            </TabsTrigger>
          </TabsList>

          {/* Premium Streams Tab */}
          <TabsContent value="premium" className="mt-6">
            {!hasPremiumAccess ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="text-center py-12">
                  <Crown className="h-16 w-16 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-xl font-semibold mb-2">Premium Access Required</h3>
                  <p className="text-gray-400 mb-6">Unlock HD/4K streaming and exclusive content</p>
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={handleUpgradeClick}
                  >
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {premiumStreams.map((stream) => (
                  <AdvancedLiveStreamPlayer
                    key={stream.id}
                    streamUrl={stream.streamUrl}
                    gameTitle={stream.title}
                    homeTeam={stream.homeTeam}
                    awayTeam={stream.awayTeam}
                    league={stream.league}
                    viewerCount={stream.viewerCount}
                    isLive={stream.isLive}
                    quality={stream.quality}
                    userTier={stream.userTier}
                    previewMode={stream.previewMode}
                    onUpgradeClick={handleUpgradeClick}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => handleSelectGame(stream)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* YouTube Live Tab */}
          <TabsContent value="youtube" className="mt-6">
            {!hasVIPAccess ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="text-center py-12">
                  <Youtube className="h-16 w-16 mx-auto mb-4 text-red-400" />
                  <h3 className="text-xl font-semibold mb-2">VIP Access Required</h3>
                  <p className="text-gray-400 mb-6">Access live YouTube streams and sports content</p>
                  <Button 
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                    onClick={handleUpgradeClick}
                  >
                    Upgrade to VIP
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {youtubeStreams?.streams?.slice(0, 6).map((stream: any) => (
                  <Card key={stream.videoId} className="bg-gray-900 border-gray-800 hover:border-red-500 transition-colors cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="relative">
                          <img 
                            src={stream.thumbnail} 
                            alt={stream.title}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                          <Badge className="absolute top-2 right-2 bg-red-600 text-white text-xs animate-pulse">
                            LIVE
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-sm line-clamp-2">{stream.title}</h4>
                          <p className="text-gray-400 text-xs mt-1">{stream.channelTitle}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center text-xs text-gray-400">
                              <Users className="h-3 w-3 mr-1" />
                              {stream.viewerCount?.toLocaleString() || 'Live'}
                            </div>
                            <Button 
                              size="sm" 
                              className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1"
                              onClick={() => handleSelectGame({
                                id: stream.videoId,
                                title: stream.title,
                                homeTeam: { name: stream.channelTitle, score: 0 },
                                awayTeam: { name: 'Live Stream', score: 0 },
                                league: 'YouTube Live',
                                streamUrl: `https://www.youtube.com/watch?v=${stream.videoId}`,
                                viewers: stream.viewerCount || 25000,
                                period: 'LIVE',
                                timeRemaining: 'LIVE',
                                status: 'live'
                              })}
                            >
                              Watch
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) || (
                  <div className="col-span-full">
                    <Alert>
                      <AlertDescription>
                        No live YouTube streams available at the moment.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* IPTV Tab */}
          <TabsContent value="iptv" className="mt-6">
            <UnifiedIPTVModule />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}