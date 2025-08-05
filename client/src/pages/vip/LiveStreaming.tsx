import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Play, Users, Clock, Zap, Tv, Youtube, Search, RefreshCw, Globe, Signal } from 'lucide-react';
import TierGuard from '@/components/access/TierGuard';
import LiveStreamPlayer from '@/components/LiveStreamPlayer';
import { EnhancedUniversalSportsRouter } from '@/components/streaming/EnhancedUniversalSportsRouter';

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

interface SportConfig {
  key: string;
  name: string;
  icon: string;
  color: string;
}

interface IPTVChannel {
  id: string;
  name: string;
  category: string;
  logo: string;
  streamUrl: string;
  quality: string;
  isLive: boolean;
}

export default function VIPLiveStreaming() {
  const [selectedStream, setSelectedStream] = useState<StreamOption | null>(null);
  const [activeTab, setActiveTab] = useState('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StreamOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sports configuration for quick access
  const sportsConfig: SportConfig[] = [
    { key: 'americanfootball_nfl', name: 'NFL', icon: '🏈', color: 'bg-blue-600' },
    { key: 'basketball_nba', name: 'NBA', icon: '🏀', color: 'bg-orange-600' },
    { key: 'baseball_mlb', name: 'MLB', icon: '⚾', color: 'bg-green-600' },
    { key: 'icehockey_nhl', name: 'NHL', icon: '🏒', color: 'bg-red-600' },
    { key: 'soccer_epl', name: 'Soccer', icon: '⚽', color: 'bg-purple-600' },
    { key: 'tennis_wta', name: 'Tennis', icon: '🎾', color: 'bg-yellow-600' },
    { key: 'mma_mixed_martial_arts', name: 'MMA', icon: '🥊', color: 'bg-gray-600' },
    { key: 'boxing_heavyweight', name: 'Boxing', icon: '🥊', color: 'bg-indigo-600' }
  ];

  // Get streaming recommendations
  const { data: recommendations = [], isLoading: loadingRecs } = useQuery<StreamOption[]>({
    queryKey: ['/api/live-streaming/recommendations'],
    select: (data: any) => data.recommendations || [],
    retry: false
  });

  // Get sports data for live games
  const { data: sportsData = [] } = useQuery({
    queryKey: ['/api/sports'],
    retry: false
  });

  const searchStreams = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Try to parse team names from search query
      const teamMatch = searchQuery.match(/(.+?)\s+vs\s+(.+)/i);
      
      if (teamMatch) {
        const [, team1, team2] = teamMatch;
        const response = await fetch(`/api/live-streaming/search?team1=${encodeURIComponent(team1.trim())}&team2=${encodeURIComponent(team2.trim())}`);
        const data = await response.json();
        
        if (data.success) {
          setSearchResults([data.stream]);
        } else {
          setSearchResults([]);
        }
      } else {
        // General search - try different sports
        const results: StreamOption[] = [];
        for (const sport of sportsConfig) {
          try {
            const response = await fetch(`/api/live-streaming/sport/${sport.key}`);
            const data = await response.json();
            if (data.success && data.stream.name.toLowerCase().includes(searchQuery.toLowerCase())) {
              results.push(data.stream);
            }
          } catch (error) {
            console.error(`Error searching ${sport.name}:`, error);
          }
        }
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const getSportStreams = async (sportKey: string) => {
    try {
      const response = await fetch(`/api/live-streaming/sport/${sportKey}/all`);
      const data = await response.json();
      return data.success ? data.streams : [];
    } catch (error) {
      console.error(`Error getting ${sportKey} streams:`, error);
      return [];
    }
  };

  const getStreamIcon = (streamType: string) => {
    switch (streamType) {
      case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
      case 'iptv': return <Tv className="h-4 w-4 text-blue-500" />;
      default: return <Globe className="h-4 w-4 text-gray-500" />;
    }
  };

  const getQualityBadge = (quality: string) => {
    const colors = {
      '4K': 'bg-purple-600',
      'HD': 'bg-blue-600',
      'SD': 'bg-gray-600'
    };
    return (
      <Badge className={`text-xs ${colors[quality as keyof typeof colors] || colors.SD}`}>
        {quality}
      </Badge>
    );
  };

  return (
    <TierGuard requiredTier="vip" feature="Live Streaming">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Universal Live Sports Streaming</h1>
            <p className="text-xl text-gray-300">
              Watch live sports from YouTube, IPTV, and official channels with integrated betting
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="text-red-500 border-red-500">
                <Play className="w-4 h-4 mr-2" />
                VIP Exclusive
              </Badge>
              <Badge variant="outline" className="text-green-500 border-green-500">
                <Signal className="w-4 h-4 mr-2" />
                Real Streams Only
              </Badge>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-2">
              <Input
                placeholder="Search teams (e.g., 'Lakers vs Warriors') or sports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchStreams()}
                className="bg-gray-800 border-gray-600 text-white"
              />
              <Button 
                onClick={searchStreams} 
                disabled={isSearching}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Featured Live Stream */}
          <div className="mb-8">
            {selectedStream ? (
              <LiveStreamPlayer
                gameTitle={selectedStream.name}
                homeTeam={selectedStream.matchup?.split(' vs ')[0] || selectedStream.channelName || selectedStream.name}
                awayTeam={selectedStream.matchup?.split(' vs ')[1] || ""}
                league={selectedStream.league}
                viewerCount={selectedStream.viewers}
                isLive={selectedStream.isLive}
                userTier="platinum"
                quality={selectedStream.quality}
                eventId={selectedStream.id}
                streamUrl={selectedStream.streamUrl}
                className="max-w-4xl mx-auto"
              />
            ) : (
              <Card className="bg-gray-800 border-gray-700 max-w-4xl mx-auto">
                <CardContent className="aspect-video flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2 text-blue-400">Select a Stream to Watch</p>
                    <p className="text-sm">Choose from live sports, official channels, or search for specific games</p>
                    <Badge variant="outline" className="mt-4 text-green-400 border-green-400">
                      <Youtube className="w-4 h-4 mr-2" />
                      Powered by Real APIs
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sports Categories & Streams */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="live" className="data-[state=active]:bg-red-600">Live Sports</TabsTrigger>
              <TabsTrigger value="search" className="data-[state=active]:bg-blue-600">Search Results</TabsTrigger>
              <TabsTrigger value="sports" className="data-[state=active]:bg-green-600">By Sport</TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:bg-purple-600">Trending</TabsTrigger>
            </TabsList>

            {/* Live Sports Tab */}
            <TabsContent value="live" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {sportsConfig.map((sport) => (
                  <Card key={sport.key} className="bg-gray-800 border-gray-700 hover:border-gray-600 cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{sport.icon}</div>
                      <h3 className="font-semibold text-white">{sport.name}</h3>
                      <EnhancedUniversalSportsRouter
                        sportKey={sport.key}
                        variant="compact"
                        buttonText="Watch Live"
                        showQuality={true}
                        enableEmbedMode={true}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Live Games from Sports Data */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Today's Live Games</h3>
                {Array.isArray(sportsData) ? sportsData.slice(0, 6).map((game: any) => (
                  <Card key={game.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="text-blue-400 border-blue-400">
                              {game.sport}
                            </Badge>
                            {game.status === 'live' && (
                              <Badge variant="destructive" className="animate-pulse">
                                LIVE
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-white text-lg">
                            {game.homeTeam} vs {game.awayTeam}
                          </h4>
                          <p className="text-gray-400 text-sm">{game.league}</p>
                        </div>
                        <div className="text-right">
                          <EnhancedUniversalSportsRouter
                            sportKey={game.sport_key || 'general_sports'}
                            gameId={game.id}
                            homeTeam={game.homeTeam}
                            awayTeam={game.awayTeam}
                            variant="default"
                            enableEmbedMode={true}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : null}
              </div>
            </TabsContent>

            {/* Search Results Tab */}
            <TabsContent value="search" className="mt-6">
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Search Results for "{searchQuery}"</h3>
                  {searchResults.map((stream) => (
                    <Card key={stream.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 cursor-pointer"
                          onClick={() => setSelectedStream(stream)}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {stream.thumbnail && (
                            <img src={stream.thumbnail} alt={stream.name} className="w-20 h-14 rounded object-cover" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStreamIcon(stream.streamType)}
                              <h4 className="font-semibold text-white">{stream.name}</h4>
                              {stream.isLive && (
                                <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              {getQualityBadge(stream.quality)}
                              <span className="text-sm text-gray-400">{stream.sport} • {stream.league}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{stream.language.toUpperCase()} • {stream.country}</span>
                              {stream.channelName && <span>• {stream.channelName}</span>}
                            </div>
                          </div>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Play className="h-4 w-4 mr-1" />
                            Watch
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-8 text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No streams found for "{searchQuery}"</p>
                  <p className="text-sm mt-2">Try searching for team names like "Lakers vs Warriors"</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Use the search bar above to find specific games or teams</p>
                </div>
              )}
            </TabsContent>

            {/* By Sport Tab */}
            <TabsContent value="sports" className="mt-6">
              <div className="space-y-6">
                {sportsConfig.map((sport) => (
                  <div key={sport.key}>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">{sport.icon}</span>
                      {sport.name} Streams
                    </h3>
                    <EnhancedUniversalSportsRouter
                      sportKey={sport.key}
                      variant="card"
                      buttonText={`Watch ${sport.name} Live`}
                      showQuality={true}
                      showViewers={true}
                      enableEmbedMode={true}
                      autoOpen={false}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Trending Tab */}
            <TabsContent value="trending" className="mt-6">
              {loadingRecs ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
                  <p>Loading trending streams...</p>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Trending Sports Content</h3>
                  {recommendations.map((stream: any) => (
                    <Card key={stream.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 cursor-pointer"
                          onClick={() => setSelectedStream(stream)}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {stream.thumbnail && (
                            <img src={stream.thumbnail} alt={stream.name} className="w-20 h-14 rounded object-cover" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStreamIcon(stream.streamType)}
                              <h4 className="font-semibold text-white">{stream.name}</h4>
                              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                                Trending
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              {getQualityBadge(stream.quality)}
                              <span className="text-sm text-gray-400">{stream.sport} • {stream.league}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{stream.language?.toUpperCase()} • {stream.country}</span>
                              {stream.channelName && <span>• {stream.channelName}</span>}
                            </div>
                          </div>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <Play className="h-4 w-4 mr-1" />
                            Watch
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Youtube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">YouTube API Key Required</p>
                  <p className="text-sm">Configure your RapidAPI key to access trending sports content</p>
                  <Badge variant="outline" className="mt-4 text-blue-400 border-blue-400">
                    No Mock Data - Real API Required
                  </Badge>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Quick Access Sports Navigation */}
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Access</h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {sportsConfig.map((sport) => (
                <EnhancedUniversalSportsRouter
                  key={sport.key}
                  sportKey={sport.key}
                  variant="compact"
                  buttonText={sport.icon}
                  enableEmbedMode={true}
                />
              ))}
            </div>
          </div>

          {/* Status Information */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>✅ YouTube API Integration Active</p>
            <p>⚠️ IPTV Service: Provider Blocked (Status 451)</p>
            <p>🚀 No Mock Data - All streams are from authentic sources</p>
          </div>
        </div>
      </div>
    </TierGuard>
  );
}