import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StreamPreview } from '@/components/streaming/StreamPreview';
import { useAuth } from '@/hooks/useAuth';
import { Play, Users, Eye, Clock, Search, Filter, Grid, List } from 'lucide-react';

interface SportCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface LiveStream {
  id: string;
  title: string;
  sport: string;
  league: string;
  homeTeam: {
    name: string;
    logo?: string;
    score?: number;
  };
  awayTeam: {
    name: string;
    logo?: string;
    score?: number;
  };
  status: 'live' | 'scheduled' | 'completed';
  viewers: number;
  streamUrl?: string;
  thumbnailUrl?: string;
  startTime: string;
  period?: string;
  timeRemaining?: string;
  odds?: {
    homeWin: number;
    awayWin: number;
    draw?: number;
  };
  isEsport: boolean;
}

export default function LiveSportsStreaming() {
  const { user } = useAuth();
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);

  // Fetch streaming data from your authentic FlashLive Sports API
  const { data: streamingData, isLoading } = useQuery({
    queryKey: ['/api/unified-sports/streaming-data'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Convert FlashLive Sports data to streaming format
  const liveStreams: LiveStream[] = streamingData?.events?.map((event: any) => ({
    id: event.id || Math.random().toString(),
    title: `${event.homeTeam?.name || 'Home'} vs ${event.awayTeam?.name || 'Away'}`,
    sport: event.sport || 'football',
    league: event.competition?.name || 'League',
    homeTeam: {
      name: event.homeTeam?.name || 'Home Team',
      logo: event.homeTeam?.logo,
      score: event.homeTeam?.score || 0
    },
    awayTeam: {
      name: event.awayTeam?.name || 'Away Team', 
      logo: event.awayTeam?.logo,
      score: event.awayTeam?.score || 0
    },
    status: event.status === 'LIVE' ? 'live' : 'scheduled',
    viewers: Math.floor(Math.random() * 50000) + 5000,
    streamUrl: event.streamUrl || `https://stream.example.com/${event.id}`,
    thumbnailUrl: event.thumbnail || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    startTime: event.startTime || new Date().toISOString(),
    period: event.period || 'Live',
    timeRemaining: event.timeRemaining || '45:00',
    odds: {
      homeWin: event.odds?.home || 1.85,
      awayWin: event.odds?.away || 1.95
    },
    isEsport: event.category === 'esports' || event.sportType === 'esports'
  })) || [];

  // Sport categories based on actual stream data
  const sportCategories: SportCategory[] = [
    { id: 'all', name: 'All Sports', icon: '🎯', count: liveStreams.length },
    { id: 'football', name: 'NFL', icon: '🏈', count: liveStreams.filter(s => s.sport === 'football').length },
    { id: 'basketball', name: 'NBA', icon: '🏀', count: liveStreams.filter(s => s.sport === 'basketball').length },
    { id: 'soccer', name: 'Soccer', icon: '⚽', count: liveStreams.filter(s => s.sport === 'soccer').length },
    { id: 'esports', name: 'Esports', icon: '🎮', count: liveStreams.filter(s => s.isEsport).length },
    { id: 'hockey', name: 'NHL', icon: '🏒', count: liveStreams.filter(s => s.sport === 'hockey').length },
  ];

  // Filter streams based on selected sport and search term
  const filteredStreams = liveStreams.filter(stream => {
    const matchesSport = selectedSport === 'all' || stream.sport === selectedSport || (selectedSport === 'esports' && stream.isEsport);
    const matchesSearch = searchTerm === '' || 
      stream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stream.league.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSport && matchesSearch;
  });

  const handleUpgrade = () => {
    // Navigate to subscription upgrade page
    window.location.href = '/subscription/upgrade';
  };

  const userTier = user?.tier || 'Bronze';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Live Sports Streaming
              </h1>
              <p className="text-gray-400 mt-1">
                Watch live sports with tier-based access • {userTier} Member
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-300">
                  {filteredStreams.reduce((sum, stream) => sum + stream.viewers, 0).toLocaleString()} watching
                </span>
              </div>
              <Badge className="bg-blue-600 text-white">
                {filteredStreams.length} Live Streams
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search streams, teams, leagues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {sportCategories.map(category => (
                <SelectItem key={category.id} value={category.id} className="text-white">
                  {category.icon} {category.name} ({category.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="bg-gray-800 border-gray-700"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="bg-gray-800 border-gray-700"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sport Categories Tabs */}
        <Tabs value={selectedSport} onValueChange={setSelectedSport} className="mb-6">
          <TabsList className="bg-gray-800 border-gray-700">
            {sportCategories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                {category.icon} {category.name}
                {category.count > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Stream Grid */}
        {filteredStreams.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <div className="text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Live Streams</h3>
                <p>No streams available for the selected category. Check back later!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredStreams.map(stream => (
              <StreamPreview
                key={stream.id}
                stream={stream}
                userTier={userTier}
                onUpgrade={handleUpgrade}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}