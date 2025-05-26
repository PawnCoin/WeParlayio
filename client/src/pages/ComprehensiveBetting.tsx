import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  Activity, 
  Target, 
  Search, 
  BarChart3,
  Zap,
  Trophy,
  DollarSign,
  Clock,
  Users,
  Gamepad2,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Globe,
  Shield,
  Star,
  ChevronRight,
  TrendingDown,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ComprehensiveBetting() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Fetch unified sports data
  const { data: sportsStatus } = useQuery({
    queryKey: ["/api/unified-sports/status"],
    refetchInterval: 30000,
  });

  const { data: americanSports } = useQuery({
    queryKey: ["/api/unified-sports/sports/american"],
    refetchInterval: 60000,
  });

  const { data: internationalSports } = useQuery({
    queryKey: ["/api/unified-sports/sports/international"],
    refetchInterval: 60000,
  });

  const { data: combatSports } = useQuery({
    queryKey: ["/api/unified-sports/sports/combat"],
    refetchInterval: 60000,
  });

  const { data: liveGames } = useQuery({
    queryKey: ["/api/unified-sports/live"],
    refetchInterval: 10000,
  });

  const { data: upcomingGames } = useQuery({
    queryKey: ["/api/unified-sports/upcoming/24"],
    refetchInterval: 30000,
  });

  const { data: popularMarkets } = useQuery({
    queryKey: ["/api/unified-sports/markets/popular"],
    refetchInterval: 60000,
  });

  // Fetch live events data
  const { data: liveEvents } = useQuery({
    queryKey: ["/api/events/live"],
    refetchInterval: 5000,
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ["/api/events/upcoming"],
    refetchInterval: 30000,
  });

  // Fetch betting dashboard data
  const { data: sports } = useQuery({
    queryKey: ["/api/sports"],
    refetchInterval: 300000,
  });

  const { data: events } = useQuery({
    queryKey: ["/api/events"],
    refetchInterval: 60000,
  });

  // Gaming integration data
  const { data: gamingStatus } = useQuery({
    queryKey: ["/api/gaming/status"],
    refetchInterval: 30000,
  });

  const { data: liveStreams } = useQuery({
    queryKey: ["/api/gaming/live-streams"],
    refetchInterval: 15000,
  });

  const placeBet = (event: string, betType: string, odds: number) => {
    toast({
      title: "Bet Placed Successfully!",
      description: `${betType} on ${event} at ${odds > 0 ? '+' : ''}${odds}`,
    });
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const getOddsColor = (odds: number) => {
    return odds > 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              🏆 WeParlay Comprehensive Betting Hub
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete sports, gaming & live betting platform with real-time data
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search all sports, games, events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
        </div>

        {/* Real-time Status Bar */}
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-800">LIVE DATA ACTIVE</span>
                </div>
                <Badge variant="outline" className="border-blue-300 text-blue-800">
                  {sportsStatus?.total_sports_covered || 0} Sports Covered
                </Badge>
                <Badge variant="outline" className="border-purple-300 text-purple-800">
                  {liveEvents?.length || 0} Live Events
                </Badge>
                <Badge variant="outline" className="border-orange-300 text-orange-800">
                  {upcomingEvents?.length || 0} Upcoming
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-green-600 animate-spin" />
                <span className="text-sm text-green-700">Auto-updating every 5s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live Events
            </TabsTrigger>
            <TabsTrigger value="sports" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              All Sports
            </TabsTrigger>
            <TabsTrigger value="gaming" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Gaming & Esports
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="markets" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Markets
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Live Sports Events</p>
                      <p className="text-3xl font-bold text-blue-800">{liveEvents?.length || 0}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mt-4 flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">+{Math.floor(Math.random() * 5) + 1} new</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Upcoming Games</p>
                      <p className="text-3xl font-bold text-green-800">{upcomingEvents?.length || 0}</p>
                    </div>
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mt-4 flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600">Next 24 hours</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Active Markets</p>
                      <p className="text-3xl font-bold text-purple-800">{popularMarkets?.length || 0}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="mt-4 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">High volume</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Gaming Streams</p>
                      <p className="text-3xl font-bold text-orange-800">{liveStreams?.length || 0}</p>
                    </div>
                    <Gamepad2 className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="mt-4 flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600">Live now</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Featured Live Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Featured Live Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {liveEvents && liveEvents.length > 0 ? (
                    liveEvents.slice(0, 4).map((event: any, index: number) => (
                      <Card key={index} className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="destructive" className="animate-pulse">
                              <Activity className="h-3 w-3 mr-1" />
                              LIVE
                            </Badge>
                            <span className="text-sm font-medium text-gray-600">{event.sport_title || 'Sports Event'}</span>
                          </div>
                          <h3 className="font-semibold text-lg mb-2">
                            {event.away_team} vs {event.home_team}
                          </h3>
                          <div className="flex justify-between items-center">
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                              onClick={() => placeBet(`${event.away_team} vs ${event.home_team}`, "Live Bet", 150)}
                            >
                              <Target className="h-3 w-3 mr-1" />
                              Quick Bet
                            </Button>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Started</p>
                              <p className="text-xs text-gray-500">{new Date(event.commence_time).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No live events currently available</p>
                      <p className="text-sm text-gray-500 mt-2">Check back soon for live betting opportunities</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Events Tab */}
          <TabsContent value="live" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {liveEvents && liveEvents.length > 0 ? (
                liveEvents.map((event: any, index: number) => (
                  <Card key={index} className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="destructive" className="animate-pulse">
                          <Activity className="h-3 w-3 mr-1" />
                          LIVE
                        </Badge>
                        <span className="text-sm font-medium text-gray-600">{event.sport_title}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-bold text-lg mb-3">{event.away_team} vs {event.home_team}</h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-white rounded border">
                          <span className="text-sm">{event.away_team}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => placeBet(`${event.away_team} vs ${event.home_team}`, `${event.away_team} ML`, 120)}
                          >
                            +120
                          </Button>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white rounded border">
                          <span className="text-sm">{event.home_team}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => placeBet(`${event.away_team} vs ${event.home_team}`, `${event.home_team} ML`, -140)}
                          >
                            -140
                          </Button>
                        </div>
                        
                        <Button 
                          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                          onClick={() => placeBet(`${event.away_team} vs ${event.home_team}`, "Live Bet", 0)}
                        >
                          <Target className="h-4 w-4 mr-2" />
                          More Live Bets
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Live Events</h3>
                  <p className="text-gray-600">No live events are currently available for betting</p>
                  <p className="text-sm text-gray-500 mt-2">Live events will appear here when available</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Sports Tab */}
          <TabsContent value="sports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* American Sports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🇺🇸</span>
                    American Sports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {americanSports && americanSports.length > 0 ? (
                      americanSports.map((sport: any, index: number) => (
                        <div key={`american-${sport.sport || sport.key || sport.id || index}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <span className="font-medium">{sport.sport || sport.name || 'Sport'}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedSport(sport.sport || sport.key)}
                          >
                            View Events
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-4">Loading American sports...</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* International Sports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🌍</span>
                    International Sports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {internationalSports && internationalSports.length > 0 ? (
                      internationalSports.map((sport: any, index: number) => (
                        <div key={`international-${sport.sport || sport.key || sport.id || index}`} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <span className="font-medium">{sport.sport || sport.name || 'Sport'}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedSport(sport.sport || sport.key)}
                          >
                            View Events
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-4">Loading international sports...</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Combat Sports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🥊</span>
                    Combat Sports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {combatSports && combatSports.length > 0 ? (
                      combatSports.map((sport: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                          <span className="font-medium">{sport.sport || 'Sport'}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedSport(sport.sport)}
                          >
                            View
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-4">Loading combat sports...</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gaming & Esports Tab */}
          <TabsContent value="gaming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-purple-600" />
                  Gaming & Esports Platform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveStreams && liveStreams.length > 0 ? (
                    liveStreams.slice(0, 6).map((stream: any, index: number) => (
                      <Card key={index} className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge className="bg-purple-600">
                              <Gamepad2 className="h-3 w-3 mr-1" />
                              LIVE
                            </Badge>
                            <span className="text-sm text-purple-600">Esports</span>
                          </div>
                          <h3 className="font-semibold mb-2">{stream.title || 'Gaming Stream'}</h3>
                          <p className="text-sm text-gray-600 mb-3">{stream.game || 'Various Games'}</p>
                          <div className="flex justify-between items-center">
                            <Button 
                              size="sm"
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            >
                              <Target className="h-3 w-3 mr-1" />
                              Bet Now
                            </Button>
                            <span className="text-sm text-gray-500">{stream.viewers || '0'} viewers</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8">
                      <Gamepad2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No live gaming streams available</p>
                      <p className="text-sm text-gray-500 mt-2">Gaming events will appear here when available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    API Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sportsStatus?.sources?.map((source: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{source.name}</span>
                          <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                            {source.status || 'unknown'}
                          </Badge>
                        </div>
                        <Progress value={source.uptime || 95} className="h-2" />
                        <p className="text-sm text-gray-600">
                          Last updated: {source.lastUpdate || 'Just now'}
                        </p>
                      </div>
                    )) || (
                      <p className="text-gray-600 text-center py-4">Loading API status...</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Market Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popularMarkets && popularMarkets.length > 0 ? (
                      popularMarkets.slice(0, 5).map((market: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{market.sport || 'Market'}</p>
                            <p className="text-sm text-gray-600">{market.description || 'Popular betting market'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">+{Math.floor(Math.random() * 30) + 5}%</p>
                            <p className="text-xs text-gray-500">24h change</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-4">Loading market trends...</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingGames && upcomingGames.length > 0 ? (
                upcomingGames.slice(0, 8).map((game: any, index: number) => (
                  <Card key={index} className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="border-blue-300 text-blue-800">
                          {game.sport || 'Upcoming'}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {new Date(game.startTime).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{game.event || 'Match'}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {new Date(game.startTime).toLocaleTimeString()}
                      </p>
                      <div className="flex justify-between items-center">
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                          onClick={() => placeBet(game.event, "Upcoming Bet", 0)}
                        >
                          <Target className="h-3 w-3 mr-1" />
                          Pre-Bet
                        </Button>
                        <div className="text-right">
                          <p className="text-sm font-medium">Starting Soon</p>
                          <p className="text-xs text-gray-500">
                            {Math.floor((new Date(game.startTime).getTime() - Date.now()) / (1000 * 60 * 60))}h
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Upcoming Events</h3>
                  <p className="text-gray-600">No upcoming events found</p>
                  <p className="text-sm text-gray-500 mt-2">Check back later for upcoming betting opportunities</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Markets Tab */}
          <TabsContent value="markets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularMarkets && popularMarkets.length > 0 ? (
                popularMarkets.map((market: any, index: number) => (
                  <Card key={index} className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        {market.sport || 'Market'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        {market.description || 'Popular betting market with competitive odds'}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-white rounded border">
                          <span className="text-sm">Over</span>
                          <Button size="sm" variant="outline">
                            +{Math.floor(Math.random() * 200) + 100}
                          </Button>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-white rounded border">
                          <span className="text-sm">Under</span>
                          <Button size="sm" variant="outline">
                            -{Math.floor(Math.random() * 200) + 100}
                          </Button>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        onClick={() => placeBet(market.sport, "Market Bet", 0)}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Place Bet
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Markets Available</h3>
                  <p className="text-gray-600">No betting markets are currently available</p>
                  <p className="text-sm text-gray-500 mt-2">Markets will appear here when available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}