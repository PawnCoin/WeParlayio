
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  Sparkles,
  Globe,
  Shield,
  Star,
  ChevronRight,
  RefreshCw,
  Play,
  Eye,
  TrendingDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBetting } from "@/contexts/BettingContext";
import { useAuth } from "@/hooks/useAuth";

export default function ComprehensiveBetting() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { addToBetSlip } = useBetting();
  const { user, isAuthenticated } = useAuth();

  // Fetch real sports data using working APIs only with error handling
  const { data: sports, refetch: refetchSports, error: sportsError } = useQuery({
    queryKey: ["/api/sports"],
    refetchInterval: 300000,
    retry: 3,
    retryDelay: 1000,
    onError: (error) => console.log('Sports API error (handled):', error),
  });

  const { data: oddsData, refetch: refetchOdds, error: oddsError } = useQuery({
    queryKey: ["/api/odds"],
    refetchInterval: 30000,
    retry: 2,
    retryDelay: 2000,
    onError: (error) => console.log('Odds API error (handled):', error),
  });

  // Fetch live events data with error handling
  const { data: liveEvents, refetch: refetchLive, error: liveError } = useQuery({
    queryKey: ["/api/events/live"],
    refetchInterval: 5000,
    retry: 1,
    retryDelay: 3000,
    onError: (error) => console.log('Live events error (handled):', error),
  });

  const { data: upcomingEventsData, refetch: refetchUpcoming, error: upcomingError } = useQuery({
    queryKey: ["/api/unified-sports/upcoming-events"],
    refetchInterval: 30000,
    retry: 2,
    retryDelay: 2000,
    onError: (error) => console.log('Upcoming events error (handled):', error),
  });

  // Process upcoming events from unified endpoint
  const upcomingEvents = upcomingEventsData?.events || [];

  // Filter sports based on search
  const filteredSports = sports?.filter((sport: any) =>
    sport?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSportSelect = (sportKey: string) => {
    setSelectedSport(sportKey);
    toast({
      title: "Loading Sport",
      description: `Opening ${sportKey} betting options...`,
      duration: 2000,
    });
    // Navigate to specific sport page with real betting options
    window.location.href = `/sports/${sportKey}`;
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchSports(),
        refetchOdds(),
        refetchLive(),
        refetchUpcoming()
      ]);
      toast({
        title: "Data Refreshed",
        description: "All betting data has been updated successfully",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh data. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewLiveEvent = (event: any) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to view live events",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    toast({
      title: "Opening Live Event",
      description: `Loading ${event.title || event.name}...`,
      duration: 2000,
    });
    
    // Navigate to live betting page for this event
    window.location.href = `/live-betting?event=${event.id}`;
  };

  const handleQuickBet = (event: any, betType: string = 'moneyline') => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to place bets",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const betData = {
      id: `${event.id}-${betType}`,
      eventId: event.id,
      eventName: event.title || event.name,
      betType: betType,
      odds: event.odds || 1.85,
      sport: event.sport_key || 'general',
      stake: 0,
      potentialWin: 0
    };

    addToBetSlip(betData);
    
    toast({
      title: "Added to Bet Slip",
      description: `${event.title || event.name} (${betType}) added to your bet slip`,
      duration: 3000,
    });
  };

  const handleNavigateToGaming = () => {
    toast({
      title: "Loading Gaming Hub",
      description: "Opening gaming and esports betting...",
      duration: 2000,
    });
    window.location.href = "/video-gaming";
  };

  const handleNavigateToAnalytics = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to access advanced analytics",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    toast({
      title: "Loading Analytics",
      description: "Opening advanced betting analytics...",
      duration: 2000,
    });
    window.location.href = "/betting-academy";
  };

  const handleViewUpcomingEvent = (event: any) => {
    toast({
      title: "Event Details",
      description: `Loading details for ${event.home_team} vs ${event.away_team || 'TBD'}`,
      duration: 2000,
    });
    window.location.href = `/events/${event.id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              WeParlay Betting Dashboard
            </h1>
            <Sparkles className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your comprehensive sports betting command center with real-time data from top global sources
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search sports, leagues, or events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-blue-200 focus:border-blue-400"
            />
          </div>
        </div>

        {/* Real-time Status Bar */}
        <Card className="border-green-700 bg-gradient-to-r from-slate-800 to-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-800">LIVE DATA ACTIVE</span>
                </div>
                <Badge variant="outline" className="border-blue-300 text-blue-800">
                  {sports?.length || 0} Sports Available
                </Badge>
                <Badge variant="outline" className="border-purple-300 text-purple-800">
                  {liveEvents?.length || 0} Live Events
                </Badge>
                <Badge variant="outline" className="border-orange-300 text-orange-800">
                  {upcomingEvents?.length || 0} Upcoming
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshData}
                  disabled={refreshing}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                <span className="text-sm text-green-700">Auto-updating every 5s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
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
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Stats with functional buttons */}
              <Card className="border-blue-700 bg-slate-800 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("sports")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Available Sports</CardTitle>
                  <Trophy className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{sports?.length || 0}</div>
                  <p className="text-xs text-slate-400">Click to view all sports</p>
                </CardContent>
              </Card>

              <Card className="border-green-700 bg-slate-800 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("live")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Live Events</CardTitle>
                  <Activity className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{liveEvents?.length || 0}</div>
                  <p className="text-xs text-slate-400">Click to view live events</p>
                </CardContent>
              </Card>

              <Card className="border-orange-700 bg-slate-800 cursor-pointer hover:shadow-lg transition-shadow" onClick={handleNavigateToAnalytics}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">Upcoming Events</CardTitle>
                  <Clock className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-400">{upcomingEvents?.length || 0}</div>
                  <p className="text-xs text-slate-400">Click for analytics</p>
                </CardContent>
              </Card>
            </div>

            {/* Featured Sports with functional buttons */}
            <Card className="mt-6 bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-200">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Featured Sports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {filteredSports.slice(0, 8).map((sport: any) => (
                    <Button
                      key={sport.id}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-slate-700 border-slate-600 bg-slate-800 text-slate-200 transition-all duration-200"
                      onClick={() => handleSportSelect(sport.key)}
                    >
                      <Trophy className="h-6 w-6 text-blue-400" />
                      <span className="text-sm font-medium">{sport.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Button
                onClick={() => window.location.href = '/live-betting-enhanced'}
                className="h-16 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Live Betting
              </Button>
              
              <Button
                onClick={() => window.location.href = '/tournaments'}
                variant="outline"
                className="h-16 border-2 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Crown className="h-5 w-5 mr-2" />
                Join Tournaments
              </Button>
              
              <Button
                onClick={handleNavigateToGaming}
                variant="outline"
                className="h-16 border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Gamepad2 className="h-5 w-5 mr-2" />
                Gaming Hub
              </Button>
            </div>
          </TabsContent>

          {/* Live Events Tab with functional buttons */}
          <TabsContent value="live">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-200">
                  <Activity className="h-5 w-5 text-red-400" />
                  Live Events ({liveEvents?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {liveEvents && liveEvents.length > 0 ? (
                  <div className="space-y-4">
                    {liveEvents.map((event: any, index: number) => (
                      <Card key={index} className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{event.title || event.name}</h3>
                              <p className="text-sm text-gray-600">{event.sport_key}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-red-600">LIVE</span>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewLiveEvent(event)}
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Watch
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleQuickBet(event)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  Bet
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Alert>
                      <AlertDescription>
                        No live events currently happening. This is normal during offseason periods.
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={() => setActiveTab("sports")}
                      className="mt-4"
                      variant="outline"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Browse All Sports
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Sports Tab with functional buttons */}
          <TabsContent value="sports">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-200">
                  <Trophy className="h-5 w-5 text-blue-400" />
                  All Available Sports ({filteredSports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSports.map((sport: any) => (
                    <Card key={sport.id} className="border-gray-200 hover:border-blue-300 transition-colors group">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{sport.name}</h3>
                            <p className="text-sm text-gray-600">{sport.key}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                toast({
                                  title: "Sport Info",
                                  description: `${sport.name} - View detailed statistics and information`,
                                  duration: 2000,
                                });
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSportSelect(sport.key)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <ChevronRight className="h-4 w-4 ml-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gaming & Esports Tab with functional buttons */}
          <TabsContent value="gaming">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-200">
                  <Gamepad2 className="h-5 w-5 text-purple-400" />
                  Gaming & Esports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Gamepad2 className="h-5 w-5" />
                        Esports Hub
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Professional esports betting with live tournaments and matches
                      </p>
                      <Button 
                        onClick={() => window.location.href = '/esports-hub'}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Enter Esports Hub
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Video Gaming
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Bet on gaming achievements, speedruns, and more
                      </p>
                      <Button 
                        onClick={handleNavigateToGaming}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Gaming Bets
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <Gamepad2 className="h-4 w-4" />
                  <AlertDescription>
                    Gaming and esports betting features are fully integrated! Click the buttons above to start betting.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab with functional buttons */}
          <TabsContent value="analytics">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-200">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  Betting Analytics & Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Platform Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>API Sources Connected:</span>
                          <Badge variant="outline" className="bg-green-50">Active</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Real-time Data:</span>
                          <Badge variant="outline" className="bg-green-50">✓ Enabled</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Odds Updates:</span>
                          <Badge variant="outline" className="bg-blue-50">Every 30s</Badge>
                        </div>
                      </div>
                      <Button 
                        onClick={() => window.location.href = '/page-status-checker'}
                        className="w-full mt-4" 
                        variant="outline"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        System Health Check
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Advanced Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button 
                          onClick={handleNavigateToAnalytics}
                          className="w-full" 
                          variant="outline"
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Betting Academy
                        </Button>
                        <Button 
                          onClick={() => window.location.href = '/my-bets'}
                          className="w-full" 
                          variant="outline"
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          My Betting Stats
                        </Button>
                        <Button 
                          onClick={() => window.location.href = '/live-heatmap'}
                          className="w-full" 
                          variant="outline"
                        >
                          <TrendingDown className="h-4 w-4 mr-2" />
                          Live Heatmap
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Upcoming Events Section */}
                {upcomingEvents && upcomingEvents.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        Upcoming Events Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upcomingEvents.slice(0, 4).map((event: any, index: number) => (
                          <Card key={index} className="border-orange-200 bg-orange-50">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{event.home_team}</h4>
                                  <p className="text-sm text-gray-600">vs {event.away_team || 'TBD'}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleViewUpcomingEvent(event)}
                                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleQuickBet(event)}
                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                  >
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Pre-Bet
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
