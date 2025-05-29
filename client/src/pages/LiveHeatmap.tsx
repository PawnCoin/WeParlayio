import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, TrendingUp, Zap, Target, RefreshCw, Globe } from 'lucide-react';

export default function LiveHeatmap() {
  const [selectedSport, setSelectedSport] = useState('all');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch comprehensive sports coverage with GRID integration
  const { data: coverageData, isLoading: coverageLoading } = useQuery({
    queryKey: ['/api/sports'],
    refetchInterval: refreshInterval,
  });

  // Fetch enhanced live events
  const { data: liveEvents, isLoading: liveLoading, refetch: refetchLive } = useQuery({
    queryKey: ['/api/events/live'],
    refetchInterval: refreshInterval,
  });

  // Fetch GRID live matches specifically
  const { data: gridMatches } = useQuery({
    queryKey: ['/api/grid/live-matches'],
    refetchInterval: refreshInterval,
  });

  // Auto-refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getHeatmapIntensity = (count: number, maxCount: number) => {
    const intensity = Math.min((count / maxCount) * 100, 100);
    if (intensity >= 80) return 'bg-red-500';
    if (intensity >= 60) return 'bg-orange-500';
    if (intensity >= 40) return 'bg-yellow-500';
    if (intensity >= 20) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const heatmapData = [
    { sport: 'Football (NFL)', live: 8, upcoming: 24, popularity: 95 },
    { sport: 'Basketball (NBA)', live: 12, upcoming: 18, popularity: 88 },
    { sport: 'Soccer', live: 45, upcoming: 67, popularity: 92 },
    { sport: 'Baseball (MLB)', live: 15, upcoming: 31, popularity: 75 },
    { sport: 'Hockey (NHL)', live: 6, upcoming: 14, popularity: 68 },
    { sport: 'Tennis', live: 23, upcoming: 89, popularity: 82 },
    { sport: 'Boxing/MMA', live: 3, upcoming: 8, popularity: 78 },
    { sport: 'Esports', live: 18, upcoming: 42, popularity: 85 },
  ];

  const maxLive = Math.max(...heatmapData.map(d => d.live));
  const maxUpcoming = Math.max(...heatmapData.map(d => d.upcoming));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Live Betting Heatmap
            </h1>
            <p className="text-xl text-gray-600">
              Real-time visualization of global betting activity and opportunities
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchLive();
                setLastUpdate(new Date());
              }}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Real-time stats from GRID and unified APIs */}
        {coverageData && Array.isArray(coverageData) && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium">Live Events</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {Array.isArray(liveEvents) ? liveEvents.length : 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Upcoming</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  24
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Sports</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {coverageData.length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium">API Sources</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  3
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium">Coverage</span>
                </div>
                <div className="text-sm font-bold text-purple-600">
                  Expanding
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Original Interactive Heatmap */}
      <div className="mb-8">
        <Card className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              🔥 Live Betting Heatmap
              <span className="text-orange-400">🔥</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Real-time betting activity and market movements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Time & Sport Filters */}
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex bg-slate-800 rounded-lg p-1">
                <Button variant="default" size="sm" className="bg-blue-600 text-white">1h</Button>
                <Button variant="default" size="sm" className="bg-blue-600 text-white">4h</Button>
                <Button variant="ghost" size="sm" className="text-gray-300">24h</Button>
              </div>
              <div className="flex bg-slate-800 rounded-lg p-1">
                <Button variant="default" size="sm" className="bg-blue-600 text-white">ALL</Button>
                <Button variant="ghost" size="sm" className="text-gray-300">NFL</Button>
                <Button variant="ghost" size="sm" className="text-gray-300">NBA</Button>
                <Button variant="ghost" size="sm" className="text-gray-300">SOCCER</Button>
              </div>
            </div>

            {/* Heat Scale Legend */}
            <div className="grid grid-cols-5 gap-2 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">❄️</span>
                </div>
                <div className="text-sm font-semibold">Cold</div>
                <div className="text-xs text-gray-400">0-20%</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">❄️</span>
                </div>
                <div className="text-sm font-semibold">Cool</div>
                <div className="text-xs text-gray-400">21-40%</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">🔥</span>
                </div>
                <div className="text-sm font-semibold">Warm</div>
                <div className="text-xs text-gray-400">41-60%</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">🔥</span>
                </div>
                <div className="text-sm font-semibold">Hot</div>
                <div className="text-xs text-gray-400">61-80%</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">🔥🔥🔥</span>
                </div>
                <div className="text-sm font-semibold">Blazing</div>
                <div className="text-xs text-gray-400">81-100%</div>
              </div>
            </div>

            {/* Interactive Heatmap Grid */}
            <div className="grid grid-cols-5 gap-3 max-w-6xl mx-auto">
              {/* Row 1 */}
              <Card className="bg-green-500 text-white border-none cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-semibold mb-1">NBA</div>
                  <div className="text-sm font-bold mb-1">Lakers vs Warriors</div>
                  <div className="text-xs opacity-90">❄️</div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-500 text-white border-none cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-semibold mb-1">NFL</div>
                  <div className="text-sm font-bold mb-1">Chiefs vs Bills</div>
                  <div className="text-xs opacity-90">❄️</div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-500 text-white border-none cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-semibold mb-1">Soccer</div>
                  <div className="text-sm font-bold mb-1">Barcelona vs Madrid</div>
                  <div className="text-xs opacity-90">🔥</div>
                </CardContent>
              </Card>

              <Card className="bg-orange-500 text-white border-none cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-semibold mb-1">NBA</div>
                  <div className="text-sm font-bold mb-1">Celtics vs Heat</div>
                  <div className="text-xs opacity-90">🔥</div>
                </CardContent>
              </Card>

              <Card className="bg-blue-500 text-white border-none cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-semibold mb-1">NFL</div>
                  <div className="text-sm font-bold mb-1">Cowboys vs Giants</div>
                  <div className="text-xs opacity-90">🏈</div>
                </CardContent>
              </Card>

              {/* Row 2 */}
              <Card className="bg-green-500 text-white border-none cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-semibold mb-1">Soccer</div>
                  <div className="text-sm font-bold mb-1">Liverpool vs Arsenal</div>
                  <div className="text-xs opacity-90">❄️</div>
                  <div className="text-xs font-bold mt-1">38%</div>
                </CardContent>
              </Card>

              <Card className="bg-blue-500 text-white border-none cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-semibold mb-1">NBA</div>
                  <div className="text-sm font-bold mb-1">Nuggets vs Suns</div>
                  <div className="text-xs opacity-90">🏀</div>
                  <div className="text-xs font-bold mt-1">40%</div>
                </CardContent>
              </Card>

              <Card className="bg-red-500 text-white border-none cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-semibold mb-1">NFL</div>
                  <div className="text-sm font-bold mb-1">Rams vs 49ers</div>
                  <div className="text-xs opacity-90">🔥🔥🔥</div>
                </CardContent>
              </Card>

              <Card className="bg-orange-500 text-white border-none cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-semibold mb-1">Soccer</div>
                  <div className="text-sm font-bold mb-1">PSG vs Bayern</div>
                  <div className="text-xs opacity-90">🔥🔥</div>
                </CardContent>
              </Card>

              <Card className="bg-green-500 text-white border-none cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-semibold mb-1">NBA</div>
                  <div className="text-sm font-bold mb-1">Bucks vs Nets</div>
                  <div className="text-xs opacity-90">❄️</div>
                  <div className="text-xs font-bold mt-1">10%</div>
                </CardContent>
              </Card>

              {/* Row 3 */}
              <Card className="bg-yellow-500 text-white border-none cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-semibold mb-1">NFL</div>
                  <div className="text-sm font-bold mb-1">Eagles vs Packers</div>
                  <div className="text-xs opacity-90">🔥</div>
                  <div className="text-xs font-bold mt-1">42%</div>
                </CardContent>
              </Card>

              <Card className="bg-blue-500 text-white border-none cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-semibold mb-1">Soccer</div>
                  <div className="text-sm font-bold mb-1">City vs United</div>
                  <div className="text-xs opacity-90">🏈</div>
                  <div className="text-xs font-bold mt-1">2%</div>
                </CardContent>
              </Card>

              <Card className="bg-red-500 text-white border-none cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-semibold mb-1">NBA</div>
                  <div className="text-sm font-bold mb-1">Clippers vs Kings</div>
                  <div className="text-xs opacity-90">🔥🔥🔥</div>
                  <div className="text-xs font-bold mt-1">86%</div>
                </CardContent>
              </Card>

              <Card className="bg-orange-500 text-white border-none cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-semibold mb-1">NFL</div>
                  <div className="text-sm font-bold mb-1">Ravens vs Steelers</div>
                  <div className="text-xs opacity-90">🔥</div>
                  <div className="text-xs font-bold mt-1">44%</div>
                </CardContent>
              </Card>

              <Card className="bg-orange-500 text-white border-none cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-4 text-center">
                  <div className="text-xs font-semibold mb-1">Soccer</div>
                  <div className="text-sm font-bold mb-1">Juventus vs Milan</div>
                  <div className="text-xs opacity-90">🔥🔥</div>
                  <div className="text-xs font-bold mt-1">74%</div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-400">
                Click any game card to view detailed betting options and live odds
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Original Heatmap Screenshot */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-orange-500" />
              Classic Heatmap View
            </CardTitle>
            <CardDescription>
              Traditional sports betting heatmap showing popular markets and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <img 
                src="/attached_assets/targeted_element_1748382577584.png" 
                alt="WeParlay Live Betting Heatmap"
                className="w-full h-auto rounded-lg shadow-lg border"
                style={{
                  maxHeight: '600px',
                  objectFit: 'contain'
                }}
              />
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                🔴 LIVE
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">🔥 Hot</div>
                <div className="text-sm text-gray-600">High Activity</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">⚡ Active</div>
                <div className="text-sm text-gray-600">Moderate Activity</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">❄️ Cool</div>
                <div className="text-sm text-gray-600">Low Activity</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="heatmap" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="heatmap">Activity Heatmap</TabsTrigger>
          <TabsTrigger value="live">Live Events</TabsTrigger>
          <TabsTrigger value="analytics">Market Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Global Betting Activity Heat Map</CardTitle>
                  <CardDescription>
                    Visual representation of live betting opportunities across sports
                  </CardDescription>
                </div>
                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="soccer">Soccer</SelectItem>
                    <SelectItem value="baseball">Baseball</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {heatmapData.map((sport, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="font-semibold text-lg">{sport.sport}</div>
                      <Badge variant="outline">
                        {sport.popularity}% Popular
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Live Events</span>
                        <span className="font-medium">{sport.live}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${getHeatmapIntensity(sport.live, maxLive)}`}
                          style={{ width: `${(sport.live / maxLive) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Upcoming</span>
                        <span className="font-medium">{sport.upcoming}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${getHeatmapIntensity(sport.upcoming, maxUpcoming)}`}
                          style={{ width: `${(sport.upcoming / maxUpcoming) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Events Feed</CardTitle>
              <CardDescription>
                Real-time data from {liveEvents?.sources?.length || 0} API sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {liveEvents && liveEvents.total_opportunities > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Display GRID matches if available */}
                    {gridMatches?.matches?.slice(0, 6).map((match: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {match.sport_title || 'Live'}
                            </Badge>
                            <div className="text-xs text-gray-500">
                              {match.status || 'LIVE'}
                            </div>
                          </div>
                          <div className="text-sm font-semibold mb-1">
                            {match.home_team} vs {match.away_team}
                          </div>
                          <div className="text-xs text-gray-600">
                            {match.venue || 'Live Event'}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600 mb-2">
                      {liveEvents.total_opportunities} Total Live Opportunities
                    </div>
                    <div className="flex justify-center space-x-2">
                      {liveEvents.sources?.map((source: string, index: number) => (
                        <Badge key={index} variant="secondary">{source}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No Live Events Currently
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Live events will appear here during peak sports hours
                  </p>
                  <Button variant="outline" onClick={() => refetchLive()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Analytics Dashboard</CardTitle>
              <CardDescription>
                Comprehensive market insights from multiple data sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Coverage Breakdown</h4>
                  {coverageData && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                        <span>Unified API Coverage</span>
                        <Badge className="bg-blue-600">
                          {coverageData.unified_api_coverage?.total_sports || 0} Sports
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                        <span>GRID API Coverage</span>
                        <Badge className="bg-green-600">
                          {coverageData.grid_api_coverage?.total_sports || 0} Sports
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                        <span>Combined Total</span>
                        <Badge className="bg-purple-600">
                          {coverageData.total_sports || 0} Sports
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Live Activity Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <span>Current Live Events</span>
                      <div className="text-lg font-bold text-red-600">
                        {coverageData?.total_live_matches || 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                      <span>Upcoming Events</span>
                      <div className="text-lg font-bold text-orange-600">
                        {coverageData?.total_upcoming || 0}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span>API Sources Active</span>
                      <div className="text-lg font-bold text-green-600">
                        {coverageData?.api_sources || 0}/5
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}