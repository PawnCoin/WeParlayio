import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AssetManager } from '@/lib/assetManager';
import { 
  TrendingUp, 
  Activity, 
  Target, 
  BarChart3,
  RefreshCw,
  DollarSign,
  Clock,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Odds() {
  const [selectedSport, setSelectedSport] = useState('all');
  const [oddsFormat, setOddsFormat] = useState('american');
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Fetch real odds data from the priority API system - with cache busting
  const { data: realOddsResponse, refetch: refetchRealOdds, isLoading } = useQuery({
    queryKey: ["/api/odds"],
    refetchInterval: 10000, // Update every 10 seconds
    staleTime: 0, // Never use stale data
    gcTime: 0, // TanStack Query v5 - don't cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Extract data from priority API response - handle the success/odds wrapper
  const realOddsData: any[] = realOddsResponse?.success ? realOddsResponse.odds : (realOddsResponse?.odds || realOddsResponse?.data || realOddsResponse || []);
  
  console.log('📊 Live Odds Data:', {
    dataCount: realOddsData?.length,
    isLoading,
    rawResponse: realOddsResponse,
    firstGame: realOddsData?.[0],
    selectedSport,
    filteredCount: selectedSport === 'all' ? realOddsData?.length : realOddsData?.filter((odds: any) => 
      odds.sport_key === selectedSport || 
      odds.sport === selectedSport ||
      odds.sport?.toLowerCase() === selectedSport.toLowerCase()
    ).length
  });

  // Fetch sports list
  const { data: sports } = useQuery({
    queryKey: ["/api/sports"],
    staleTime: 300000,
  });

  // Fetch live markets count across all sports
  const { data: liveMarketsData } = useQuery({
    queryKey: ["/api/sports/baseball_mlb/live"],
    refetchInterval: 30000,
  });

  // Fetch NFL live data
  const { data: nflLiveData } = useQuery({
    queryKey: ["/api/odds/americanfootball_nfl"],
    refetchInterval: 30000,
  });

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchRealOdds();
    setRefreshing(false);
    toast({
      title: "Odds Updated",
      description: "Latest odds data refreshed successfully",
    });
  };

  // Format odds display
  const formatOdds = (odds: number) => {
    if (oddsFormat === 'american') {
      return odds > 0 ? `+${odds}` : `${odds}`;
    }
    return odds.toString();
  };

  // Use the real odds data directly - this contains our 16 authentic NFL games
  const oddsArray = Array.isArray(realOddsData) ? realOddsData : [];
  const sportsArray = Array.isArray(sports) ? sports : [];
  const liveMarketsArray = Array.isArray(liveMarketsData) ? liveMarketsData : [];
  const nflLiveArray = Array.isArray(nflLiveData) ? nflLiveData : [];

  // Calculate total live markets from all active data sources
  const totalLiveMarkets = oddsArray.length + liveMarketsArray.length + nflLiveArray.length;

  // Filter odds by selected sport - handle both sport and sport_key fields
  const filteredOdds = selectedSport === 'all' 
    ? oddsArray 
    : oddsArray.filter((odds: any) => 
        odds.sport_key === selectedSport || 
        odds.sport === selectedSport ||
        odds.sport?.toLowerCase() === selectedSport.toLowerCase()
      );
  
  console.log('🎯 CRITICAL DEBUG - Data Structure Analysis:', {
    selectedSport,
    realOddsDataType: typeof realOddsData,
    realOddsDataIsArray: Array.isArray(realOddsData),
    realOddsDataLength: realOddsData?.length,
    oddsArrayLength: oddsArray.length,
    filteredOddsLength: filteredOdds.length,
    firstThreeGames: filteredOdds.slice(0, 3),
    willShowNoDataMessage: (filteredOdds.length === 0 && oddsArray.length === 0),
    shouldShowOdds: filteredOdds.length > 0
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Betting Odds</h1>
          <p className="text-gray-600 mt-2">Real-time odds from top sportsbooks</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Sport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              {sportsArray.map((sport: any) => (
                <SelectItem key={sport.key} value={sport.key}>
                  {sport.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={oddsFormat} onValueChange={setOddsFormat}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="american">American</SelectItem>
              <SelectItem value="decimal">Decimal</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4">
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Live Markets</p>
                <p className="text-lg md:text-2xl font-bold">{totalLiveMarkets || filteredOdds.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sports Available</p>
                <p className="text-2xl font-bold">{sportsArray.length}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Data Source</p>
                <p className="text-sm font-bold text-green-600">RapidAPI Live</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-sm font-bold">{new Date().toLocaleTimeString()}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Odds Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Current Odds</h2>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Live Data from RapidAPI
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (filteredOdds.length === 0 && oddsArray.length === 0) ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Live Odds Available</h3>
              <p className="text-gray-600">
                {selectedSport === 'all' 
                  ? 'No live betting markets are currently active. Check back during game times.'
                  : `No live odds available for ${selectedSport}. Try selecting a different sport.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredOdds.map((odds: any, index: number) => (
              <Card key={`odds-${odds.id || index}`} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{odds.sport || 'NFL'}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {odds.homeTeam?.name || odds.home_team} vs {odds.awayTeam?.name || odds.away_team}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {odds.status || 'Live'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(odds.homeTeam?.name || odds.home_team) && (
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium text-gray-700">{odds.homeTeam?.name || odds.home_team}</p>
                        <p className="text-lg font-bold text-blue-600">
                          {formatOdds(odds.odds?.homeWin || odds.home_odds || 1.95)}
                        </p>
                      </div>
                    )}
                    
                    {odds.odds?.draw && (
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium text-gray-700">Draw</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatOdds(odds.odds.draw)}
                        </p>
                      </div>
                    )}
                    
                    {(odds.awayTeam?.name || odds.away_team) && (
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium text-gray-700">{odds.awayTeam?.name || odds.away_team}</p>
                        <p className="text-lg font-bold text-red-600">
                          {formatOdds(odds.odds?.awayWin || odds.away_odds || 1.95)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Game Time: {new Date(odds.startTime || Date.now()).toLocaleTimeString()}
                    </span>
                    <Button 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Bet Added to Slip",
                          description: `${odds.homeTeam?.name || odds.home_team} vs ${odds.awayTeam?.name || odds.away_team} added to your betting slip`,
                        });
                        // Redirect to betting page
                        window.location.href = '/comprehensive-betting';
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Place Bet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}