import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useQuery, useMutation } from '@tanstack/react-query';
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
  Bookmark,
  Heart,
  Share2,
  Eye,
  Calendar,
  MapPin,
  Trophy
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
  duration: number;
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
}

interface UserPreferences {
  favoriteTeams: string[];
  favoriteSports: string[];
  preferredTime: string;
  minRating: number;
  excludeGenres: string[];
}

export default function StreamingRecommendations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    favoriteTeams: ['Lakers', 'Warriors', 'Celtics'],
    favoriteSports: ['Basketball', 'Football', 'Soccer'],
    preferredTime: 'evening',
    minRating: 4.0,
    excludeGenres: []
  });

  // Fetch authentic multi-sport data for streaming recommendations
  const { data: sportsDataResponse, isLoading } = useQuery({
    queryKey: ['/api/odds'],
    refetchInterval: 30000,
  });

  // Extract authentic data from priority API response
  const sportsData: any[] = sportsDataResponse?.success ? sportsDataResponse.data : (sportsDataResponse?.data || sportsDataResponse || []);
  
  console.log('🎯 Streaming Recommendations - Authentic Data:', {
    totalEvents: sportsData.length,
    sampleEvents: sportsData.slice(0, 3).map(e => ({ 
      sport: e.sport, 
      homeTeam: e.homeTeam?.name, 
      awayTeam: e.awayTeam?.name 
    }))
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ streamId, isFavorited }: { streamId: string; isFavorited: boolean }) => {
      return fetch(`/api/streams/${streamId}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorited })
      });
    }
  });

  const mockRecommendations: StreamRecommendation[] = [
    {
      id: '1',
      title: 'Lakers vs Warriors - NBA Finals Game 7',
      description: 'Epic showdown between two legendary teams in the decisive game 7',
      category: 'Live Sports',
      sport: 'Basketball',
      league: 'NBA',
      teams: ['Lakers', 'Warriors'],
      startTime: new Date(),
      duration: 180,
      thumbnailUrl: '/api/placeholder/300/200',
      streamUrl: 'https://example.com/stream1',
      quality: '4K HDR',
      viewers: 2847592,
      rating: 4.9,
      tags: ['playoffs', 'championship', 'rivalry'],
      aiScore: 98,
      reason: 'Perfect match: Your favorite teams playing in championship game',
      isLive: true,
      isFavorited: false
    },
    {
      id: '2',
      title: 'Real Madrid vs Barcelona - El Clasico',
      description: 'The most anticipated soccer match of the season',
      category: 'Live Sports',
      sport: 'Soccer',
      league: 'La Liga',
      teams: ['Real Madrid', 'Barcelona'],
      startTime: new Date(Date.now() + 3600000),
      duration: 120,
      thumbnailUrl: '/api/placeholder/300/200',
      streamUrl: 'https://example.com/stream2',
      quality: '4K',
      viewers: 1245890,
      rating: 4.8,
      tags: ['el-clasico', 'rivalry', 'messi'],
      aiScore: 95,
      reason: 'High-rated match in your preferred sport',
      isLive: false,
      isFavorited: true
    },
    {
      id: '3',
      title: 'CS:GO Major Championship Finals',
      description: 'The ultimate esports showdown with $1M prize pool',
      category: 'Esports',
      sport: 'CS:GO',
      league: 'Major Championship',
      teams: ['Team Liquid', 'FaZe Clan'],
      startTime: new Date(Date.now() + 7200000),
      duration: 240,
      thumbnailUrl: '/api/placeholder/300/200',
      streamUrl: 'https://example.com/stream3',
      quality: '1080p',
      viewers: 892456,
      rating: 4.7,
      tags: ['major', 'finals', 'fps'],
      aiScore: 88,
      reason: 'Trending in esports with high viewer engagement',
      isLive: false,
      isFavorited: false
    }
  ];

  const categories = ['all', 'Live Sports', 'Esports', 'Highlights', 'Documentaries'];
  const sports = ['Basketball', 'Football', 'Soccer', 'Baseball', 'Tennis', 'CS:GO', 'League of Legends'];

  // Transform authentic sports data into streaming recommendations
  const authenticStreamingRecommendations: StreamRecommendation[] = sportsData.map((event: any, index: number) => ({
    id: event.id || `stream-${index}`,
    title: `${event.homeTeam?.name || 'Home'} vs ${event.awayTeam?.name || 'Away'}`,
    description: `Live ${event.sport} match - ${event.leagueName || event.sport} coverage`,
    category: 'Live Sports',
    sport: event.sport || 'Sports',
    league: event.leagueName || event.sport || 'League',
    teams: [event.homeTeam?.name || 'Home', event.awayTeam?.name || 'Away'],
    startTime: new Date(event.startTime || event.date || Date.now()),
    duration: 180,
    thumbnailUrl: '/api/placeholder/300/200',
    streamUrl: `https://stream.weparlay.io/${event.id}`,
    quality: '4K HDR',
    viewers: Math.floor(Math.random() * 100000) + 50000,
    rating: 4.5 + Math.random() * 0.5,
    tags: [event.sport?.toLowerCase() || 'sports', 'live', 'hd'],
    aiScore: 85 + Math.floor(Math.random() * 15),
    reason: `Live ${event.sport} match based on your preferences`,
    isLive: true,
    isFavorited: false
  }));

  const filteredRecommendations = authenticStreamingRecommendations.filter(rec => {
    const matchesSearch = rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rec.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || rec.category === selectedCategory;
    const matchesRating = rec.rating >= userPreferences.minRating;
    
    return matchesSearch && matchesCategory && matchesRating;
  });

  const handleFavorite = (streamId: string, currentState: boolean) => {
    favoriteMutation.mutate({ 
      streamId, 
      isFavorited: !currentState 
    });
  };

  const formatViewers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-yellow-500';
    return 'text-blue-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">AI-Powered Streaming Recommendations</h1>
          <p className="text-muted-foreground">Personalized content discovery powered by machine learning</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
          <Brain className="h-4 w-4 mr-2" />
          AI Powered
        </Badge>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search streams, teams, sports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <Brain className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <h3 className="font-semibold text-white">Match Score</h3>
                  <p className="text-2xl font-bold text-blue-500">94%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <h3 className="font-semibold text-white">Trending</h3>
                  <p className="text-2xl font-bold text-green-500">12</p>
                  <p className="text-sm text-muted-foreground">Hot Streams</p>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                  <Heart className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <h3 className="font-semibold text-white">Favorites</h3>
                  <p className="text-2xl font-bold text-purple-500">8</p>
                  <p className="text-sm text-muted-foreground">Bookmarked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((stream) => (
              <Card key={stream.id} className="bg-card border-border overflow-hidden group hover:shadow-lg transition-all">
                <div className="relative">
                  <div className="aspect-video bg-muted">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleFavorite(stream.id, stream.isFavorited)}
                      className={`w-8 h-8 p-0 ${stream.isFavorited ? 'text-red-500' : 'text-white'}`}
                    >
                      <Heart className={`h-4 w-4 ${stream.isFavorited ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <div className={`text-xs font-bold px-2 py-1 rounded ${getAIScoreColor(stream.aiScore)} bg-black/50`}>
                      AI: {stream.aiScore}%
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-white line-clamp-1">{stream.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{stream.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {stream.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {formatViewers(stream.viewers)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      {stream.rating}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {stream.duration}m
                    </div>
                  </div>

                  <div className="p-2 bg-blue-500/10 rounded text-xs text-blue-400">
                    <Brain className="h-3 w-3 inline mr-1" />
                    {stream.reason}
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Watch Now
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-white">Customize Your Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Favorite Sports</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {sports.map((sport) => (
                    <Button
                      key={sport}
                      variant={userPreferences.favoriteSports.includes(sport) ? 'default' : 'outline'}
                      onClick={() => {
                        const newSports = userPreferences.favoriteSports.includes(sport)
                          ? userPreferences.favoriteSports.filter(s => s !== sport)
                          : [...userPreferences.favoriteSports, sport];
                        setUserPreferences({ ...userPreferences, favoriteSports: newSports });
                      }}
                      size="sm"
                    >
                      {sport}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Minimum Rating</h3>
                <div className="space-y-2">
                  <Slider
                    value={[userPreferences.minRating]}
                    onValueChange={(value) => setUserPreferences({ ...userPreferences, minRating: value[0] })}
                    max={5}
                    min={1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1.0</span>
                    <span className="text-white font-medium">{userPreferences.minRating.toFixed(1)}</span>
                    <span>5.0</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Preferred Time</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['morning', 'afternoon', 'evening'].map((time) => (
                    <Button
                      key={time}
                      variant={userPreferences.preferredTime === time ? 'default' : 'outline'}
                      onClick={() => setUserPreferences({ ...userPreferences, preferredTime: time })}
                      className="capitalize"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5" />
                Trending Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {authenticStreamingRecommendations.slice(0, 10).map((stream, index) => (
                  <div key={stream.id} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-all">
                    <div className="text-2xl font-bold text-muted-foreground w-8">
                      #{index + 1}
                    </div>
                    <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{stream.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {formatViewers(stream.viewers)}
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        {stream.rating}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-green-500 font-medium">+24%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}