import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import EnhancedBetTooltip from "@/components/betting/EnhancedBetTooltip";
import RealTimeOddsVisualization from '@/components/betting/RealTimeOddsVisualization';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { Clock, Calendar, Filter, TrendingUp, RefreshCw, AlertTriangle } from 'lucide-react';
import { formatGameTime, formatGameDate } from '@/lib/sportsDataUtils';

const PROFESSIONAL_LEAGUES = [
  { name: 'NFL', key: 'football_nfl', displayName: 'NFL (Football)' },
  { name: 'NBA', key: 'basketball_nba', displayName: 'NBA (Basketball)' },
  { name: 'MLB', key: 'baseball_mlb', displayName: 'MLB (Baseball)' },
  { name: 'NHL', key: 'hockey_nhl', displayName: 'NHL (Hockey)' },
  { name: 'MLS', key: 'soccer_mls', displayName: 'MLS (Soccer)' },
  { name: 'UFC', key: 'mma_ufc', displayName: 'UFC (MMA)' },
  { name: 'Boxing', key: 'boxing_main', displayName: 'Boxing' },
  { name: 'NASCAR', key: 'motorsport_nascar', displayName: 'NASCAR (Motorsport)' },
  { name: 'Tennis', key: 'tennis_atp', displayName: 'ATP (Tennis)' },
];

type BetType = 'moneyline' | 'spread' | 'total' | 'player-props' | 'team-props' | 'parlays';

const BettingDashboard: React.FC = () => {
  const { addBet } = useBetSlip();
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(PROFESSIONAL_LEAGUES.map(league => league.key));
  const [betTypes, setBetTypes] = useState<BetType[]>(['moneyline', 'spread', 'total', 'player-props', 'team-props']);
  const [timeFrame, setTimeFrame] = useState<'today' | 'tomorrow' | 'this-week'>('today');
  
  // Fetch sports data
  const { data: sports, isLoading: isLoadingSports, error: sportsError } = useQuery({
    queryKey: ['/api/sports'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Handle sports error
  useEffect(() => {
    if (sportsError) {
      console.error('Sports data fetch error:', sportsError);
    }
  }, [sportsError]);
  
  // Fetch upcoming events for all selected leagues
  const { data: upcomingEventsData, isLoading: isLoadingEvents, error: eventsError } = useQuery({
    queryKey: ['/api/unified-sports/upcoming-events'],
    refetchInterval: 60000, // Refresh every minute
  });
  
  // Fetch live events
  const { data: liveEvents, isLoading: isLoadingLive, error: liveError } = useQuery({
    queryKey: ['/api/events/live'],
    refetchInterval: 10000, // Refresh every 10 seconds for live data
  });

  // Handle live events error
  useEffect(() => {
    if (liveError) {
      console.error('Live events fetch error:', liveError);
    }
  }, [liveError]);
  
  // Process real upcoming events data from unified endpoint
  const upcomingEvents = upcomingEventsData?.events || [];
  
  // Filter events based on selected leagues
  const filteredLiveEvents = Array.isArray(liveEvents) ? liveEvents.filter((event: any) => {
    if (selectedLeagues.length === 0) return true; // Show all if none selected
    return selectedLeagues.includes(event.sport_key);
  }) : [];
  
  const filteredUpcomingEvents = Array.isArray(upcomingEvents) ? upcomingEvents.filter((event: any) => {
    if (selectedLeagues.length === 0) return true; // Show all if none selected
    return selectedLeagues.includes(event.sport_key || event.sport);
  }) : [];
  
  // Helper to get team name - now uses real data from events
  const getTeamName = (event: any, isHome: boolean = true) => {
    if (isHome) {
      return event.homeTeam || event.home_team || 'Home Team';
    } else {
      return event.awayTeam || event.away_team || 'Away Team';
    }
  };
  
  // Helper to get sport name by key
  const getSportName = (sportKey: string) => {
    const league = PROFESSIONAL_LEAGUES.find(l => l.key === sportKey);
    return league ? league.displayName : (sportKey || 'Live Event');
  };
  
  // Handle adding a bet to the bet slip
  const handleAddBet = (event: any, betType: string, selection: string, odds: number, point?: number) => {
    addBet({
      id: `${event.id}-${betType}-${selection}`,
      eventId: event.id,
      gameTitle: `${event.away_team || event.awayTeam || 'Away'} vs ${event.home_team || event.homeTeam || 'Home'}`,
      betType,
      selection,
      odds,
      point,
      amount: 0,
      potential: 0,
      sport: event.sport_title || 'Live Event',
    });
  };
  
  // Toggle league selection
  const toggleLeague = (leagueKey: string) => {
    if (selectedLeagues.includes(leagueKey)) {
      setSelectedLeagues(selectedLeagues.filter(key => key !== leagueKey));
    } else {
      setSelectedLeagues([...selectedLeagues, leagueKey]);
    }
  };
  
  // Toggle bet type selection
  const toggleBetType = (type: BetType) => {
    if (betTypes.includes(type)) {
      setBetTypes(betTypes.filter(t => t !== type));
    } else {
      setBetTypes([...betTypes, type]);
    }
  };
  
  // Sort leagues alphabetically for display
  const sortedLeagues = [...PROFESSIONAL_LEAGUES].sort((a, b) => a.displayName.localeCompare(b.displayName));
  
  return (
    <div className="container px-4 max-w-7xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Professional Sports Betting Dashboard</h1>
      
      {isLoadingSports && (
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading sports data...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {sportsError && (
        <div className="mb-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>Error loading sports data. Please try refreshing the page.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Professional Leagues</h3>
                  <div className="space-y-2">
                    {sortedLeagues.map((league) => (
                      <div key={league.key} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`league-${league.key}`} 
                          checked={selectedLeagues.includes(league.key)}
                          onCheckedChange={() => toggleLeague(league.key)}
                        />
                        <Label htmlFor={`league-${league.key}`} className="text-sm cursor-pointer">
                          {league.displayName}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-3">Bet Types</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bet-moneyline" 
                        checked={betTypes.includes('moneyline')}
                        onCheckedChange={() => toggleBetType('moneyline')}
                      />
                      <Label htmlFor="bet-moneyline" className="text-sm cursor-pointer">Money Line</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bet-spread" 
                        checked={betTypes.includes('spread')}
                        onCheckedChange={() => toggleBetType('spread')}
                      />
                      <Label htmlFor="bet-spread" className="text-sm cursor-pointer">Spread</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bet-total" 
                        checked={betTypes.includes('total')}
                        onCheckedChange={() => toggleBetType('total')}
                      />
                      <Label htmlFor="bet-total" className="text-sm cursor-pointer">Total (Over/Under)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bet-player-props" 
                        checked={betTypes.includes('player-props')}
                        onCheckedChange={() => toggleBetType('player-props')}
                      />
                      <Label htmlFor="bet-player-props" className="text-sm cursor-pointer">Player Props</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bet-team-props" 
                        checked={betTypes.includes('team-props')}
                        onCheckedChange={() => toggleBetType('team-props')}
                      />
                      <Label htmlFor="bet-team-props" className="text-sm cursor-pointer">Team Props</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bet-parlays" 
                        checked={betTypes.includes('parlays')}
                        onCheckedChange={() => toggleBetType('parlays')}
                      />
                      <Label htmlFor="bet-parlays" className="text-sm cursor-pointer">Parlays</Label>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-3">Time Frame</h3>
                  <Select value={timeFrame} onValueChange={(value: any) => setTimeFrame(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select time frame" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button className="w-full" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Odds
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Tabs defaultValue="live">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="live" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Live Events
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming Events
              </TabsTrigger>
              <TabsTrigger value="odds-viz" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Real-Time Odds
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="live">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Live Professional Sports
                  </CardTitle>
                  <CardDescription>
                    Currently in-progress games with live betting options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingLive ? (
                    <div className="flex justify-center py-8">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                    </div>
                  ) : liveError ? (
                    <div className="bg-red-50 p-6 text-center rounded-lg border border-red-200">
                      <div className="flex items-center justify-center text-red-600 mb-2">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        <span className="font-medium">Error Loading Live Events</span>
                      </div>
                      <p className="text-red-700 text-sm">
                        Unable to fetch live events data. Please check your connection and try again.
                      </p>
                    </div>
                  ) : filteredLiveEvents.length > 0 ? (
                    <div className="space-y-6">
                      {filteredLiveEvents.map((event: any) => {
                        const sportKey = sports?.find((sport: any) => sport.id === event.sportId)?.key;
                        return (
                          <div key={event.id} className="border rounded-lg p-4 overflow-hidden">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <Badge variant="outline" className="mb-1">
                                  {getSportName(sportKey)}
                                </Badge>
                                <h3 className="text-lg font-semibold">
                                  {getTeamName(event.awayTeamId)} @ {getTeamName(event.homeTeamId)}
                                </h3>
                                <div className="text-sm text-muted-foreground">
                                  {event.status} • {event.period} • {event.timeRemaining}
                                </div>
                              </div>
                              <div className="text-xl font-bold">
                                {event.homeScore} - {event.awayScore}
                              </div>
                            </div>
                            
                            <Separator className="my-3" />
                            
                            <div className="grid grid-cols-3 gap-3 mt-4">
                              {betTypes.includes('moneyline') && (
                                <div className="space-y-2">
                                  <div className="text-xs text-gray-500">Money Line</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Money Line"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18",
                                        currentForm: "W,W,L,W,W",
                                        recentPerformance: 8
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24",
                                        currentForm: "L,W,W,L,W",
                                        recentPerformance: 6
                                      }}
                                      odds={-110}
                                      matchTime="Live Now"
                                      selection={getTeamName(event.homeTeamId)}
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(event, 'moneyline', getTeamName(event.homeTeamId), -110)}
                                      >
                                        {getTeamName(event.homeTeamId).slice(0, 3)} -110
                                      </Button>
                                    </EnhancedBetTooltip>
                                    
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Money Line"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18",
                                        currentForm: "W,W,L,W,W",
                                        recentPerformance: 8
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24",
                                        currentForm: "L,W,W,L,W",
                                        recentPerformance: 6
                                      }}
                                      odds={120}
                                      matchTime="Live Now"
                                      selection={getTeamName(event.awayTeamId)}
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(event, 'moneyline', getTeamName(event.awayTeamId), +120)}
                                      >
                                        {getTeamName(event.awayTeamId).slice(0, 3)} +120
                                      </Button>
                                    </EnhancedBetTooltip>
                                  </div>
                                </div>
                              )}
                              
                              {betTypes.includes('spread') && (
                                <div className="space-y-2">
                                  <div className="text-xs text-gray-500">Spread</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Spread"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18",
                                        currentForm: "W,W,L,W,W",
                                        recentPerformance: 8
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24",
                                        currentForm: "L,W,W,L,W",
                                        recentPerformance: 6
                                      }}
                                      odds={-110}
                                      point={-5.5}
                                      matchTime="Live Now"
                                      selection={getTeamName(event.homeTeamId)}
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(event, 'spread', getTeamName(event.homeTeamId), -110, -5.5)}
                                      >
                                        {getTeamName(event.homeTeamId).slice(0, 3)} -5.5
                                      </Button>
                                    </EnhancedBetTooltip>
                                    
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Spread"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18",
                                        currentForm: "W,W,L,W,W",
                                        recentPerformance: 8
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24",
                                        currentForm: "L,W,W,L,W",
                                        recentPerformance: 6
                                      }}
                                      odds={-110}
                                      point={5.5}
                                      matchTime="Live Now"
                                      selection={getTeamName(event.awayTeamId)}
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(event, 'spread', getTeamName(event.awayTeamId), -110, +5.5)}
                                      >
                                        {getTeamName(event.awayTeamId).slice(0, 3)} +5.5
                                      </Button>
                                    </EnhancedBetTooltip>
                                  </div>
                                </div>
                              )}
                              
                              {betTypes.includes('total') && (
                                <div className="space-y-2">
                                  <div className="text-xs text-gray-500">Total</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Total"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18",
                                        currentForm: "W,W,L,W,W",
                                        recentPerformance: 8
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24",
                                        currentForm: "L,W,W,L,W",
                                        recentPerformance: 6
                                      }}
                                      odds={-110}
                                      point={220.5}
                                      matchTime="Live Now"
                                      selection="Over"
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(event, 'total', 'Over', -110, 220.5)}
                                      >
                                        O 220.5 (-110)
                                      </Button>
                                    </EnhancedBetTooltip>
                                    
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Total"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18",
                                        currentForm: "W,W,L,W,W",
                                        recentPerformance: 8
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24",
                                        currentForm: "L,W,W,L,W",
                                        recentPerformance: 6
                                      }}
                                      odds={-110}
                                      point={220.5}
                                      matchTime="Live Now"
                                      selection="Under"
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(event, 'total', 'Under', -110, 220.5)}
                                      >
                                        U 220.5 (-110)
                                      </Button>
                                    </EnhancedBetTooltip>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {(betTypes.includes('player-props') || betTypes.includes('team-props')) && (
                              <>
                                <Separator className="my-3" />
                                
                                <div className="grid grid-cols-2 gap-4">
                                  {betTypes.includes('player-props') && (
                                    <div className="space-y-2">
                                      <div className="text-xs text-gray-500">Popular Player Props</div>
                                      <div className="grid gap-2">
                                        <EnhancedBetTooltip
                                          eventId={event.id.toString()}
                                          sportKey={sportKey}
                                          betType="Player Prop"
                                          homeTeam={{
                                            name: getTeamName(event.homeTeamId),
                                            record: "42-18"
                                          }}
                                          awayTeam={{
                                            name: getTeamName(event.awayTeamId),
                                            record: "36-24"
                                          }}
                                          odds={-115}
                                          point={24.5}
                                          matchTime="Live Now"
                                          selection={`${getTeamName(event.homeTeamId).split(' ').pop()} Points`}
                                        >
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full"
                                            onClick={() => handleAddBet(
                                              event, 
                                              'player-prop', 
                                              `${getTeamName(event.homeTeamId).split(' ').pop()} Points Over 24.5`, 
                                              -115,
                                              24.5
                                            )}
                                          >
                                            {getTeamName(event.homeTeamId).split(' ').pop()} Pts O 24.5 (-115)
                                          </Button>
                                        </EnhancedBetTooltip>
                                        
                                        <EnhancedBetTooltip
                                          eventId={event.id.toString()}
                                          sportKey={sportKey}
                                          betType="Player Prop"
                                          homeTeam={{
                                            name: getTeamName(event.homeTeamId),
                                            record: "42-18"
                                          }}
                                          awayTeam={{
                                            name: getTeamName(event.awayTeamId),
                                            record: "36-24"
                                          }}
                                          odds={+105}
                                          point={7.5}
                                          matchTime="Live Now"
                                          selection={`${getTeamName(event.awayTeamId).split(' ').pop()} Rebounds`}
                                        >
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full"
                                            onClick={() => handleAddBet(
                                              event, 
                                              'player-prop', 
                                              `${getTeamName(event.awayTeamId).split(' ').pop()} Rebounds Over 7.5`, 
                                              +105,
                                              7.5
                                            )}
                                          >
                                            {getTeamName(event.awayTeamId).split(' ').pop()} Reb O 7.5 (+105)
                                          </Button>
                                        </EnhancedBetTooltip>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {betTypes.includes('team-props') && (
                                    <div className="space-y-2">
                                      <div className="text-xs text-gray-500">Popular Team Props</div>
                                      <div className="grid gap-2">
                                        <EnhancedBetTooltip
                                          eventId={event.id.toString()}
                                          sportKey={sportKey}
                                          betType="Team Prop"
                                          homeTeam={{
                                            name: getTeamName(event.homeTeamId),
                                            record: "42-18"
                                          }}
                                          awayTeam={{
                                            name: getTeamName(event.awayTeamId),
                                            record: "36-24"
                                          }}
                                          odds={-110}
                                          point={110.5}
                                          matchTime="Live Now"
                                          selection={`${getTeamName(event.homeTeamId)} Team Total`}
                                        >
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full"
                                            onClick={() => handleAddBet(
                                              event, 
                                              'team-prop', 
                                              `${getTeamName(event.homeTeamId)} Team Total Over 110.5`, 
                                              -110,
                                              110.5
                                            )}
                                          >
                                            {getTeamName(event.homeTeamId)} Total O 110.5 (-110)
                                          </Button>
                                        </EnhancedBetTooltip>
                                        
                                        <EnhancedBetTooltip
                                          eventId={event.id.toString()}
                                          sportKey={sportKey}
                                          betType="Team Prop"
                                          homeTeam={{
                                            name: getTeamName(event.homeTeamId),
                                            record: "42-18"
                                          }}
                                          awayTeam={{
                                            name: getTeamName(event.awayTeamId),
                                            record: "36-24"
                                          }}
                                          odds={+100}
                                          point={55.5}
                                          matchTime="Live Now"
                                          selection={`${getTeamName(event.awayTeamId)} 1H Total`}
                                        >
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full"
                                            onClick={() => handleAddBet(
                                              event, 
                                              'team-prop', 
                                              `${getTeamName(event.awayTeamId)} 1st Half Total Under 55.5`, 
                                              +100,
                                              55.5
                                            )}
                                          >
                                            {getTeamName(event.awayTeamId)} 1H U 55.5 (+100)
                                          </Button>
                                        </EnhancedBetTooltip>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                            
                            {betTypes.includes('parlays') && (
                              <>
                                <Separator className="my-3" />
                                
                                <div className="space-y-2">
                                  <div className="text-xs text-gray-500">Popular Parlays</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Parlay"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18"
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24"
                                      }}
                                      odds={+575}
                                      matchTime="Live Now"
                                      selection="Same Game Parlay"
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(
                                          event, 
                                          'parlay', 
                                          `SGP: ${getTeamName(event.homeTeamId)} -5.5 & O 220.5 & ${getTeamName(event.homeTeamId).split(' ').pop()} O 24.5 Pts`, 
                                          +575
                                        )}
                                      >
                                        SGP: {getTeamName(event.homeTeamId)}-5.5, O220.5 (+575)
                                      </Button>
                                    </EnhancedBetTooltip>
                                    
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Parlay"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18"
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24"
                                      }}
                                      odds={+650}
                                      matchTime="Live Now"
                                      selection="Same Game Parlay"
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(
                                          event, 
                                          'parlay', 
                                          `SGP: ${getTeamName(event.awayTeamId)} +5.5 & U 220.5 & ${getTeamName(event.awayTeamId).split(' ').pop()} O 21.5 Pts`, 
                                          +650
                                        )}
                                      >
                                        SGP: {getTeamName(event.awayTeamId)}+5.5, U220.5 (+650)
                                      </Button>
                                    </EnhancedBetTooltip>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-muted/30 p-6 text-center rounded-lg">
                      <p className="text-muted-foreground">No live professional sports events at the moment. Check back later!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Professional Sports
                  </CardTitle>
                  <CardDescription>
                    Upcoming games with pre-game betting options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingEvents ? (
                    <div className="flex justify-center py-8">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                    </div>
                  ) : filteredUpcomingEvents.length > 0 ? (
                    <div className="space-y-6">
                      {filteredUpcomingEvents.map((event: any) => {
                        const sportKey = sports?.find((sport: any) => sport.id === event.sportId)?.key;
                        return (
                          <div key={event.id} className="border rounded-lg p-4 overflow-hidden">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <Badge variant="outline" className="mb-1">
                                  {getSportName(sportKey)}
                                </Badge>
                                <h3 className="text-lg font-semibold">
                                  {getTeamName(event.awayTeamId)} @ {getTeamName(event.homeTeamId)}
                                </h3>
                                <div className="text-sm text-muted-foreground">
                                  {formatGameDate(event.startTime)} • {formatGameTime(event.startTime)}
                                </div>
                              </div>
                              <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                            
                            <Separator className="my-3" />
                            
                            <div className="grid grid-cols-3 gap-3 mt-4">
                              {betTypes.includes('moneyline') && (
                                <div className="space-y-2">
                                  <div className="text-xs text-gray-500">Money Line</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Money Line"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18",
                                        currentForm: "W,W,L,W,W",
                                        recentPerformance: 8
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24",
                                        currentForm: "L,W,W,L,W",
                                        recentPerformance: 6
                                      }}
                                      odds={-125}
                                      matchTime={formatGameTime(event.startTime)}
                                      selection={getTeamName(event.homeTeamId)}
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(event, 'moneyline', getTeamName(event.homeTeamId), -125)}
                                      >
                                        {getTeamName(event.homeTeamId).slice(0, 3)} -125
                                      </Button>
                                    </EnhancedBetTooltip>
                                    
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Money Line"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18",
                                        currentForm: "W,W,L,W,W",
                                        recentPerformance: 8
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24",
                                        currentForm: "L,W,W,L,W",
                                        recentPerformance: 6
                                      }}
                                      odds={+105}
                                      matchTime={formatGameTime(event.startTime)}
                                      selection={getTeamName(event.awayTeamId)}
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(event, 'moneyline', getTeamName(event.awayTeamId), +105)}
                                      >
                                        {getTeamName(event.awayTeamId).slice(0, 3)} +105
                                      </Button>
                                    </EnhancedBetTooltip>
                                  </div>
                                </div>
                              )}
                              
                              {betTypes.includes('spread') && (
                                <div className="space-y-2">
                                  <div className="text-xs text-gray-500">Spread</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Spread"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18",
                                        currentForm: "W,W,L,W,W",
                                        recentPerformance: 8
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24",
                                        currentForm: "L,W,W,L,W",
                                        recentPerformance: 6
                                      }}
                                      odds={-110}
                                      point={-4}
                                      matchTime={formatGameTime(event.startTime)}
                                      selection={getTeamName(event.homeTeamId)}
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(event, 'spread', getTeamName(event.homeTeamId), -110, -4)}
                                      >
                                        {getTeamName(event.homeTeamId).slice(0, 3)} -4
                                      </Button>
                                    </EnhancedBetTooltip>
                                    
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Spread"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18",
                                        currentForm: "W,W,L,W,W",
                                        recentPerformance: 8
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24",
                                        currentForm: "L,W,W,L,W",
                                        recentPerformance: 6
                                      }}
                                      odds={-110}
                                      point={4}
                                      matchTime={formatGameTime(event.startTime)}
                                      selection={getTeamName(event.awayTeamId)}
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(event, 'spread', getTeamName(event.awayTeamId), -110, +4)}
                                      >
                                        {getTeamName(event.awayTeamId).slice(0, 3)} +4
                                      </Button>
                                    </EnhancedBetTooltip>
                                  </div>
                                </div>
                              )}
                              
                              {betTypes.includes('total') && (
                                <div className="space-y-2">
                                  <div className="text-xs text-gray-500">Total</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Total"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18",
                                        currentForm: "W,W,L,W,W",
                                        recentPerformance: 8
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24",
                                        currentForm: "L,W,W,L,W",
                                        recentPerformance: 6
                                      }}
                                      odds={-110}
                                      point={223.5}
                                      matchTime={formatGameTime(event.startTime)}
                                      selection="Over"
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(event, 'total', 'Over', -110, 223.5)}
                                      >
                                        O 223.5 (-110)
                                      </Button>
                                    </EnhancedBetTooltip>
                                    
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Total"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18",
                                        currentForm: "W,W,L,W,W",
                                        recentPerformance: 8
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24",
                                        currentForm: "L,W,W,L,W",
                                        recentPerformance: 6
                                      }}
                                      odds={-110}
                                      point={223.5}
                                      matchTime={formatGameTime(event.startTime)}
                                      selection="Under"
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(event, 'total', 'Under', -110, 223.5)}
                                      >
                                        U 223.5 (-110)
                                      </Button>
                                    </EnhancedBetTooltip>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {(betTypes.includes('player-props') || betTypes.includes('team-props')) && (
                              <>
                                <Separator className="my-3" />
                                
                                <div className="grid grid-cols-2 gap-4">
                                  {betTypes.includes('player-props') && (
                                    <div className="space-y-2">
                                      <div className="text-xs text-gray-500">Popular Player Props</div>
                                      <div className="grid gap-2">
                                        <EnhancedBetTooltip
                                          eventId={event.id.toString()}
                                          sportKey={sportKey}
                                          betType="Player Prop"
                                          homeTeam={{
                                            name: getTeamName(event.homeTeamId),
                                            record: "42-18"
                                          }}
                                          awayTeam={{
                                            name: getTeamName(event.awayTeamId),
                                            record: "36-24"
                                          }}
                                          odds={-110}
                                          point={26.5}
                                          matchTime={formatGameTime(event.startTime)}
                                          selection={`${getTeamName(event.homeTeamId).split(' ').pop()} Points`}
                                        >
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full"
                                            onClick={() => handleAddBet(
                                              event, 
                                              'player-prop', 
                                              `${getTeamName(event.homeTeamId).split(' ').pop()} Points Over 26.5`, 
                                              -110,
                                              26.5
                                            )}
                                          >
                                            {getTeamName(event.homeTeamId).split(' ').pop()} Pts O 26.5 (-110)
                                          </Button>
                                        </EnhancedBetTooltip>
                                        
                                        <EnhancedBetTooltip
                                          eventId={event.id.toString()}
                                          sportKey={sportKey}
                                          betType="Player Prop"
                                          homeTeam={{
                                            name: getTeamName(event.homeTeamId),
                                            record: "42-18"
                                          }}
                                          awayTeam={{
                                            name: getTeamName(event.awayTeamId),
                                            record: "36-24"
                                          }}
                                          odds={+100}
                                          point={8.5}
                                          matchTime={formatGameTime(event.startTime)}
                                          selection={`${getTeamName(event.awayTeamId).split(' ').pop()} Rebounds`}
                                        >
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full"
                                            onClick={() => handleAddBet(
                                              event, 
                                              'player-prop', 
                                              `${getTeamName(event.awayTeamId).split(' ').pop()} Rebounds Over 8.5`, 
                                              +100,
                                              8.5
                                            )}
                                          >
                                            {getTeamName(event.awayTeamId).split(' ').pop()} Reb O 8.5 (+100)
                                          </Button>
                                        </EnhancedBetTooltip>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {betTypes.includes('team-props') && (
                                    <div className="space-y-2">
                                      <div className="text-xs text-gray-500">Popular Team Props</div>
                                      <div className="grid gap-2">
                                        <EnhancedBetTooltip
                                          eventId={event.id.toString()}
                                          sportKey={sportKey}
                                          betType="Team Prop"
                                          homeTeam={{
                                            name: getTeamName(event.homeTeamId),
                                            record: "42-18"
                                          }}
                                          awayTeam={{
                                            name: getTeamName(event.awayTeamId),
                                            record: "36-24"
                                          }}
                                          odds={-110}
                                          point={115.5}
                                          matchTime={formatGameTime(event.startTime)}
                                          selection={`${getTeamName(event.homeTeamId)} Team Total`}
                                        >
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full"
                                            onClick={() => handleAddBet(
                                              event, 
                                              'team-prop', 
                                              `${getTeamName(event.homeTeamId)} Team Total Over 115.5`, 
                                              -110,
                                              115.5
                                            )}
                                          >
                                            {getTeamName(event.homeTeamId)} Total O 115.5 (-110)
                                          </Button>
                                        </EnhancedBetTooltip>
                                        
                                        <EnhancedBetTooltip
                                          eventId={event.id.toString()}
                                          sportKey={sportKey}
                                          betType="Team Prop"
                                          homeTeam={{
                                            name: getTeamName(event.homeTeamId),
                                            record: "42-18"
                                          }}
                                          awayTeam={{
                                            name: getTeamName(event.awayTeamId),
                                            record: "36-24"
                                          }}
                                          odds={-105}
                                          point={52.5}
                                          matchTime={formatGameTime(event.startTime)}
                                          selection={`${getTeamName(event.awayTeamId)} 1H Total`}
                                        >
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full"
                                            onClick={() => handleAddBet(
                                              event, 
                                              'team-prop', 
                                              `${getTeamName(event.awayTeamId)} 1st Half Total Under 52.5`, 
                                              -105,
                                              52.5
                                            )}
                                          >
                                            {getTeamName(event.awayTeamId)} 1H U 52.5 (-105)
                                          </Button>
                                        </EnhancedBetTooltip>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                            
                            {betTypes.includes('parlays') && (
                              <>
                                <Separator className="my-3" />
                                
                                <div className="space-y-2">
                                  <div className="text-xs text-gray-500">Popular Parlays</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Parlay"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18"
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24"
                                      }}
                                      odds={+600}
                                      matchTime={formatGameTime(event.startTime)}
                                      selection="Same Game Parlay"
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(
                                          event, 
                                          'parlay', 
                                          `SGP: ${getTeamName(event.homeTeamId)} -4 & O 223.5 & ${getTeamName(event.homeTeamId).split(' ').pop()} O 26.5 Pts`, 
                                          +600
                                        )}
                                      >
                                        SGP: {getTeamName(event.homeTeamId)}-4, O223.5 (+600)
                                      </Button>
                                    </EnhancedBetTooltip>
                                    
                                    <EnhancedBetTooltip
                                      eventId={event.id.toString()}
                                      sportKey={sportKey}
                                      betType="Parlay"
                                      homeTeam={{
                                        name: getTeamName(event.homeTeamId),
                                        record: "42-18"
                                      }}
                                      awayTeam={{
                                        name: getTeamName(event.awayTeamId),
                                        record: "36-24"
                                      }}
                                      odds={+700}
                                      matchTime={formatGameTime(event.startTime)}
                                      selection="Same Game Parlay"
                                    >
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => handleAddBet(
                                          event, 
                                          'parlay', 
                                          `SGP: ${getTeamName(event.awayTeamId)} +4 & U 223.5 & ${getTeamName(event.awayTeamId).split(' ').pop()} O 22.5 Pts`, 
                                          +700
                                        )}
                                      >
                                        SGP: {getTeamName(event.awayTeamId)}+4, U223.5 (+700)
                                      </Button>
                                    </EnhancedBetTooltip>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-muted/30 p-6 text-center rounded-lg">
                      <p className="text-muted-foreground">No upcoming professional sports events at the moment. Check back later!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="odds-viz">
              <RealTimeOddsVisualization />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BettingDashboard;