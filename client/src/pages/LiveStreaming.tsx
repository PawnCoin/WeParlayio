import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, Eye, Clock, Filter, Search, Globe, Star, Gamepad2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import StreamPreview from '@/components/streaming/StreamPreview';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuth } from '@/hooks/useAuth';

interface StreamData {
  id: string;
  title: string;
  game?: string;
  sport?: string;
  streamer: string;
  thumbnailUrl: string;
  viewerCount: number;
  isLive: boolean;
  language: string;
  quality: 'SD' | 'HD' | '4K';
  streamUrl: string;
  platform: 'twitch' | 'youtube' | 'facebook' | 'kick';
  category: 'esports' | 'sports' | 'general';
  tags: string[];
  startTime?: string;
}

export default function LiveStreaming() {
  const { user } = useAuth();
  const [selectedStream, setSelectedStream] = useState<StreamData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'sports' | 'esports'>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'twitch' | 'youtube'>('all');

  // Fetch live sports streams
  const { data: sportsStreams, isLoading: sportsLoading } = useQuery({
    queryKey: ['/api/streaming/live/sports'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch live esports streams
  const { data: esportsStreams, isLoading: esportsLoading } = useQuery({
    queryKey: ['/api/streaming/live/esports'],
    refetchInterval: 30000,
  });

  // Fetch top streams
  const { data: topStreams, isLoading: topLoading } = useQuery({
    queryKey: ['/api/streaming/top'],
    refetchInterval: 30000,
  });

  // Search streams
  const { data: searchResults } = useQuery({
    queryKey: ['/api/streaming/search', searchQuery],
    enabled: searchQuery.length > 2,
  });

  // Combine all streams
  const allStreams: StreamData[] = [
    ...(sportsStreams?.streams || []),
    ...(esportsStreams?.streams || []),
    ...(topStreams?.streams || [])
  ];

  // Filter streams based on selections
  const filteredStreams = (searchQuery.length > 2 ? searchResults?.streams || [] : allStreams)
    .filter(stream => {
      if (selectedCategory !== 'all' && stream.category !== selectedCategory) return false;
      if (selectedPlatform !== 'all' && stream.platform !== selectedPlatform) return false;
      return true;
    });

  const formatViewerCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitch': return 'bg-purple-500';
      case 'youtube': return 'bg-red-500';
      case 'facebook': return 'bg-blue-500';
      case 'kick': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'esports': return <Gamepad2 className="h-4 w-4" />;
      case 'sports': return <Trophy className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Live Sports & Esports Streaming
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Watch live sports and esports events from around the world
              </p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Badge variant="secondary" className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {allStreams.length} Live Streams
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search streams, games, or streamers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              <Button
                variant={selectedCategory === 'sports' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('sports')}
                className="flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                Sports
              </Button>
              <Button
                variant={selectedCategory === 'esports' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('esports')}
                className="flex items-center gap-2"
              >
                <Gamepad2 className="h-4 w-4" />
                Esports
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant={selectedPlatform === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform('all')}
              >
                All Platforms
              </Button>
              <Button
                variant={selectedPlatform === 'twitch' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform('twitch')}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                Twitch
              </Button>
              <Button
                variant={selectedPlatform === 'youtube' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform('youtube')}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                YouTube
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Streams */}
        {topStreams?.streams && topStreams.streams.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Streams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topStreams.streams.slice(0, 3).map((stream) => (
                <Card key={stream.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="relative">
                    <img
                      src={stream.thumbnailUrl}
                      alt={stream.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={`${getPlatformColor(stream.platform)} text-white`}>
                        {stream.platform.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {formatViewerCount(stream.viewerCount)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      {getCategoryIcon(stream.category)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {stream.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {stream.streamer}
                        </p>
                        {stream.game && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {stream.game}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedStream(stream)}
                      className="w-full mt-2"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch Stream
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stream Categories */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Streams ({filteredStreams.length})</TabsTrigger>
            <TabsTrigger value="sports">Sports ({filteredStreams.filter(s => s.category === 'sports').length})</TabsTrigger>
            <TabsTrigger value="esports">Esports ({filteredStreams.filter(s => s.category === 'esports').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <StreamGrid streams={filteredStreams} onSelectStream={setSelectedStream} />
          </TabsContent>

          <TabsContent value="sports" className="space-y-6">
            <StreamGrid 
              streams={filteredStreams.filter(s => s.category === 'sports')} 
              onSelectStream={setSelectedStream} 
            />
          </TabsContent>

          <TabsContent value="esports" className="space-y-6">
            <StreamGrid 
              streams={filteredStreams.filter(s => s.category === 'esports')} 
              onSelectStream={setSelectedStream} 
            />
          </TabsContent>
        </Tabs>

        {/* Loading States */}
        {(sportsLoading || esportsLoading || topLoading) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Stream Preview Modal */}
      <AnimatePresence>
        {selectedStream && (
          <StreamPreview
            stream={selectedStream}
            userTier={user?.tier || 'bronze'}
            onClose={() => setSelectedStream(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StreamGrid({ streams, onSelectStream }: { 
  streams: StreamData[]; 
  onSelectStream: (stream: StreamData) => void; 
}) {
  if (streams.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <Play className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No streams found
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitch': return 'bg-purple-500';
      case 'youtube': return 'bg-red-500';
      case 'facebook': return 'bg-blue-500';
      case 'kick': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'esports': return <Gamepad2 className="h-4 w-4" />;
      case 'sports': return <Trophy className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  const formatViewerCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {streams.map((stream) => (
        <motion.div
          key={stream.id}
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
            <div className="relative">
              <img
                src={stream.thumbnailUrl}
                alt={stream.title}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://picsum.photos/400/225';
                }}
              />
              <div className="absolute top-2 left-2">
                <Badge className={`${getPlatformColor(stream.platform)} text-white`}>
                  {stream.platform.toUpperCase()}
                </Badge>
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </Badge>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                <Users className="h-3 w-3" />
                {formatViewerCount(stream.viewerCount)}
              </div>
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getCategoryIcon(stream.category)}
                  {stream.category}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                {stream.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {stream.streamer}
              </p>
              {stream.game && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {stream.game}
                </p>
              )}
              <Button
                onClick={() => onSelectStream(stream)}
                className="w-full"
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Watch Stream
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}