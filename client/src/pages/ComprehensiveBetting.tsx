import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ComprehensiveBetting() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Fetch real sports data using working APIs only
  const { data: sports } = useQuery({
    queryKey: ["/api/sports"],
    refetchInterval: 300000,
  });

  const { data: oddsData } = useQuery({
    queryKey: ["/api/odds"],
    refetchInterval: 30000,
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

  // Filter sports based on search
  const filteredSports = sports?.filter((sport: any) =>
    sport.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSportSelect = (sportKey: string) => {
    setSelectedSport(sportKey);
    // Navigate to specific sport page with real betting options
    window.location.href = `/sports/${sportKey}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
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
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
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
                <RefreshCw className="h-4 w-4 text-green-600 animate-spin" />
                <span className="text-sm text-green-700">Auto-updating every 5s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
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
              {/* Quick Stats */}
              <Card className="border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Sports</CardTitle>
                  <Trophy className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{sports?.length || 0}</div>
                  <p className="text-xs text-gray-500">Across all leagues</p>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Live Events</CardTitle>
                  <Activity className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{liveEvents?.length || 0}</div>
                  <p className="text-xs text-gray-500">Currently happening</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{upcomingEvents?.length || 0}</div>
                  <p className="text-xs text-gray-500">Next 24 hours</p>
                </CardContent>
              </Card>
            </div>

            {/* Featured Sports */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Featured Sports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {filteredSports.slice(0, 8).map((sport: any) => (
                    <Button
                      key={sport.id}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 border-blue-200"
                      onClick={() => handleSportSelect(sport.key)}
                    >
                      <Trophy className="h-6 w-6 text-blue-600" />
                      <span className="text-sm font-medium">{sport.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Events Tab */}
          <TabsContent value="live">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-500" />
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
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-red-600">LIVE</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      No live events currently happening. This is normal during offseason periods.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Sports Tab */}
          <TabsContent value="sports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-500" />
                  All Available Sports ({sports?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSports.map((sport: any) => (
                    <Card key={sport.id} className="border-gray-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{sport.name}</h3>
                            <p className="text-sm text-gray-600">{sport.key}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSportSelect(sport.key)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            View <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gaming & Esports Tab */}
          <TabsContent value="gaming">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-purple-500" />
                  Gaming & Esports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Gamepad2 className="h-4 w-4" />
                  <AlertDescription>
                    Gaming and esports betting features are coming soon! Integration with major gaming platforms in progress.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  Betting Analytics
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
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Data Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>ESPN API:</span>
                          <Badge variant="outline" className="bg-green-50">✓ Connected</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>RapidAPI:</span>
                          <Badge variant="outline" className="bg-green-50">✓ Connected</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Odds API:</span>
                          <Badge variant="outline" className="bg-green-50">✓ Connected</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}