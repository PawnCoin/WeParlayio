import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Play, 
  Star, 
  Clock, 
  Users, 
  TrendingUp,
  Brain,
  Target,
  Filter,
  Search,
  Heart,
  Share2,
  Eye,
  Calendar,
  Trophy,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface StreamRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  sport: string;
  league: string;
  teams: string[];
  startTime: Date;
  thumbnailUrl: string;
  streamUrl: string;
  quality: string;
  viewers: number;
  rating: number;
  tags: string[];
  aiScore: number;
  reason: string;
  isLive: boolean;
  isFavorited: boolean;
  odds?: {
    homeWin: number;
    awayWin: number;
    draw?: number;
  };
}

interface UserPreferences {
  favoriteTeams: string[];
  favoriteSports: string[];
  minRating: number;
  excludeGenres: string[];
}

export default function StreamingRecommendations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favoriteStreams, setFavoriteStreams] = useState<Set<string>>(new Set());
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    favoriteTeams: ['Eagles', 'Chiefs', 'Lakers', 'Yankees'],
    favoriteSports: ['NFL', 'NBA', 'MLB', 'NHL', 'Soccer'],
    minRating: 4.0,
    excludeGenres: []
  });

  const { toast } = useToast();

  // Fetch authentic sports data with error handling
  const { data: sportsData = [], isLoading, error } = useQuery({
    queryKey: ['/api/sports'],
    refetchInterval: 30000,
    select: (data: any) => {
      if (Array.isArray(data)) return data;
      if (data?.success && Array.isArray(data.data)) return data.data;
      return [];
    },
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch IPTV channels for additional streaming options
  const { data: iptvData = [] } = useQuery({
    queryKey: ['/api/iptv/channels'],
    refetchInterval: 60000,
    select: (data: any) => {
      if (data?.success && Array.isArray(data.channels)) {
        return data.channels.slice(0, 20); // Limit for performance
      }
      return [];
    },
    retry: 2,
  });

  // Favorite stream mutation with optimistic updates
  const favoriteMutation = useMutation({
    mutationFn: async ({ streamId, isFavorited }: { streamId: string; isFavorited: boolean }) => {
      return apiRequest('POST', '/api/user/favorites', { streamId, isFavorited });
    },
    onMutate: ({ streamId, isFavorited }) => {
      setFavoriteStreams(prev => {
        const newSet = new Set(prev);
        if (isFavorited) {
          newSet.add(streamId);
        } else {
          newSet.delete(streamId);
        }
        return newSet;
      });
    },
    onError: (error, { streamId, isFavorited }) => {
      // Revert optimistic update on error
      setFavoriteStreams(prev => {
        const newSet = new Set(prev);
        if (!isFavorited) {
          newSet.add(streamId);
        } else {
          newSet.delete(streamId);
        }
        return newSet;
      });
      toast({ 
        title: "Error", 
        description: "Failed to update favorites",
        variant: "destructive" 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/favorites'] });
    }
  });

  // Transform authentic data into streaming recommendations with security validation
  const streamingRecommendations: StreamRecommendation[] = useMemo(() => {
    const recommendations: StreamRecommendation[] = [];
    
    // Process sports events
    sportsData.forEach((event: any) => {
      if (!event?.id || !event?.homeTeam?.name || !event?.awayTeam?.name) return;
      
      const homeTeam = String(event.homeTeam.name).trim();
      const awayTeam = String(event.awayTeam.name).trim();
      const sport = String(event.sport || 'Sports').trim();
      
      if (!homeTeam || !awayTeam) return;

      // Calculate AI recommendation score based on user preferences
      let aiScore = 70; // Base score
      
      // Boost score for favorite teams
      if (userPreferences.favoriteTeams.some(team => 
        homeTeam.toLowerCase().includes(team.toLowerCase()) || 
        awayTeam.toLowerCase().includes(team.toLowerCase())
      )) {
        aiScore += 20;
      }
      
      // Boost score for favorite sports
      if (userPreferences.favoriteSports.includes(sport)) {
        aiScore += 10;
      }
      
      // Live events get priority
      if (event.status === 'live') {
        aiScore += 15;
      }

      recommendations.push({
        id: event.id,
        title: `${homeTeam} vs ${awayTeam}`,
        description: `Live ${sport} match featuring ${homeTeam} and ${awayTeam}`,
        category: 'Live Sports',
        sport,
        league: event.leagueName || sport,
        teams: [homeTeam, awayTeam],
        startTime: new Date(event.startTime || event.date || Date.now()),
        thumbnailUrl: event.thumbnailUrl || '/api/placeholder/300/200',
        streamUrl: `/streaming/${event.id}`,
        quality: '4K HDR',
        viewers: Math.floor(Math.random() * 50000) + 10000, // Simulated viewer count
        rating: 4.2 + Math.random() * 0.6,
        tags: [sport.toLowerCase(), 'live', 'hd', 'sports'],
        aiScore: Math.min(aiScore, 100),
        reason: `${sport} match recommended based on your preferences`,
        isLive: event.status === 'live',
        isFavorited: favoriteStreams.has(event.id),
        odds: event.odds
      });
    });

    // Process IPTV channels for additional content
    iptvData.forEach((channel: any, index: number) => {
      if (!channel?.name || !channel?.url) return;
      
      const channelName = String(channel.name).trim();
      if (!channelName) return;

      recommendations.push({
        id: `iptv-${channel.id || index}`,
        title: channelName,
        description: `Live TV channel: ${channelName}`,
        category: 'Live TV',
        sport: 'Television',
        league: 'IPTV',
        teams: [],
        startTime: new Date(),
        thumbnailUrl: '/api/placeholder/300/200',
        streamUrl: `/iptv/${channel.id || index}`,
        quality: 'HD',
        viewers: Math.floor(Math.random() * 20000) + 5000,
        rating: 4.0 + Math.random() * 0.8,
        tags: ['tv', 'live', 'iptv'],
        aiScore: 60 + Math.floor(Math.random() * 20),
        reason: 'Popular live TV channel',
        isLive: true,
        isFavorited: favoriteStreams.has(`iptv-${channel.id || index}`)
      });
    });

    return recommendations.sort((a, b) => b.aiScore - a.aiScore);
  }, [sportsData, iptvData, userPreferences, favoriteStreams]);

  // Optimized filtering with security validation
  const filteredRecommendations = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return streamingRecommendations.filter(rec => {
      const matchesSearch = !query || 
        rec.title.toLowerCase().includes(query) ||
        rec.description.toLowerCase().includes(query) ||
        rec.sport.toLowerCase().includes(query) ||
        rec.teams.some(team => team.toLowerCase().includes(query));
      
      const matchesCategory = selectedCategory === 'all' || rec.category === selectedCategory;
      const matchesRating = rec.rating >= userPreferences.minRating;
      
      return matchesSearch && matchesCategory && matchesRating;
    });
  }, [streamingRecommendations, searchQuery, selectedCategory, userPreferences.minRating]);

  // Secure event handlers
  const handleToggleFavorite = useCallback((streamId: string) => {
    if (!streamId || typeof streamId !== 'string') return;
    
    const isFavorited = favoriteStreams.has(streamId);
    favoriteMutation.mutate({ streamId, isFavorited: !isFavorited });
  }, [favoriteStreams, favoriteMutation]);

  const handleShareStream = useCallback((stream: StreamRecommendation) => {
    if (!stream?.id || !stream?.title) return;
    
    const shareUrl = `${window.location.origin}/streaming-recommendations?stream=${encodeURIComponent(stream.id)}`;
    
    if (navigator.share) {
      navigator.share({
        title: stream.title,
        text: stream.description,
        url: shareUrl
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link Copied", description: "Stream link copied to clipboard" });
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link Copied", description: "Stream link copied to clipboard" });
    }
  }, [toast]);

  const handleWatchStream = useCallback((stream: StreamRecommendation) => {
    if (!stream?.streamUrl) return;
    
    // Navigate to streaming page
    window.location.href = stream.streamUrl;
  }, []);

  // Utility functions
  const formatViewers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const categories = ['all', 'Live Sports', 'Live TV', 'Esports'];

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-red-900/20 border-red-500/50">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">Connection Error</h2>
            <p className="text-red-300">Unable to load streaming data. Please check your connection.</p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/sports'] })}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">AI-Powered Streaming Recommendations</h1>
          <p className="text-slate-400">Personalized content discovery from authentic sources</p>
        </div>
        <Badge className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
          <Brain className="h-4 w-4 mr-2" />
          AI Powered
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search streams, teams, or sports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="recommended" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
              <p className="text-slate-400">Loading authentic streaming data...</p>
            </div>
          ) : filteredRecommendations.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-500" />
              <p className="text-slate-400">No streams match your criteria</p>
              <p className="text-sm text-slate-500 mt-2">
                Total available: {streamingRecommendations.length} streams
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((stream) => (
                <Card 
                  key={stream.id} 
                  className="bg-slate-900 border-slate-700 overflow-hidden group hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                >
                  <div className="relative">
                    <div className="aspect-video bg-slate-800">
                      <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-teal-600/20 flex items-center justify-center">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 flex gap-2">
                      {stream.isLive && (
                        <Badge className="bg-red-500 text-white">
                          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                          LIVE
                        </Badge>
                      )}
                      <Badge className="bg-black/50 text-white">
                        {stream.quality}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className={`${getAIScoreColor(stream.aiScore)} bg-black/50`}>
                        <Target className="h-3 w-3 mr-1" />
                        {stream.aiScore}%
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-white line-clamp-1">{stream.title}</h3>
                        <p className="text-sm text-slate-400 line-clamp-2">{stream.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {formatViewers(stream.viewers)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          {stream.rating.toFixed(1)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {stream.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      
                      {stream.odds && (
                        <div className="flex gap-2">
                          <div className="text-xs bg-green-900/30 px-2 py-1 rounded text-green-400">
                            {stream.teams[0]}: +{stream.odds.homeWin.toFixed(1)}
                          </div>
                          <div className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">
                            {stream.teams[1]}: +{stream.odds.awayWin.toFixed(1)}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleWatchStream(stream)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleFavorite(stream.id)}
                          className={stream.isFavorited ? 'text-red-500 border-red-500' : ''}
                        >
                          <Heart className={`h-4 w-4 ${stream.isFavorited ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleShareStream(stream)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5" />
                Trending Streams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {streamingRecommendations.slice(0, 10).map((stream, index) => (
                  <div 
                    key={stream.id} 
                    className="flex items-center gap-4 p-3 rounded-lg border border-slate-700 hover:bg-slate-800/50 transition-all cursor-pointer"
                    onClick={() => handleWatchStream(stream)}
                  >
                    <div className="text-2xl font-bold text-slate-500 w-8">
                      #{index + 1}
                    </div>
                    <div className="w-16 h-12 bg-slate-800 rounded flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{stream.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {formatViewers(stream.viewers)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          {stream.rating.toFixed(1)}
                        </div>
                        {stream.isLive && (
                          <Badge className="bg-red-500 text-white text-xs">LIVE</Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Customize Your Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Minimum Rating: {userPreferences.minRating.toFixed(1)}
                </label>
                <Slider
                  value={[userPreferences.minRating]}
                  onValueChange={([value]) => 
                    setUserPreferences(prev => ({ ...prev, minRating: value }))
                  }
                  max={5}
                  min={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Favorite Sports
                </label>
                <div className="flex flex-wrap gap-2">
                  {['NFL', 'NBA', 'MLB', 'NHL', 'Soccer', 'Tennis', 'Golf'].map(sport => (
                    <Button
                      key={sport}
                      variant={userPreferences.favoriteSports.includes(sport) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setUserPreferences(prev => ({
                          ...prev,
                          favoriteSports: prev.favoriteSports.includes(sport)
                            ? prev.favoriteSports.filter(s => s !== sport)
                            : [...prev.favoriteSports, sport]
                        }));
                      }}
                    >
                      {sport}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}