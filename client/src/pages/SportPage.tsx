import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import sportsBetAPI, { Sport, Event, Odds } from '@/lib/sportsBetAPI';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BetPreviewTooltip from "@/components/betting/BetPreviewTooltip";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, TrendingUp, BarChart2 } from 'lucide-react';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { formatGameTime, formatGameDate } from '@/lib/sportsDataUtils';

const SportPage = () => {
  const { sportKey } = useParams();
  const { addToBetSlip } = useBetSlip();
  const [activeTab, setActiveTab] = useState('live');

  // Get sports data
  const { data: sports } = useQuery({
    queryKey: ['/api/sports'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get current sport
  const currentSport = sports && Array.isArray(sports) ? 
    sports.find((sport: Sport) => sport.key === sportKey) : undefined;

  // Get live events for this sport
  const { data: liveEvents, isLoading: isLoadingLiveEvents } = useQuery({
    queryKey: ['/api/events/live', sportKey],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get upcoming events for this sport
  const { data: upcomingEvents, isLoading: isLoadingUpcomingEvents } = useQuery({
    queryKey: ['/api/events/upcoming', sportKey],
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  // Get odds for this sport
  const { data: odds, isLoading: isLoadingOdds } = useQuery({
    queryKey: ['/api/odds', sportKey],
    enabled: !!sportKey,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter events to match the current sport
  const filteredLiveEvents = liveEvents && Array.isArray(liveEvents) ? 
    liveEvents.filter((event: Event) => {
      // If we're looking at a specific sport, filter by it
      if (currentSport) {
        return event.sportId === currentSport.id;
      }
      return true;
    }) : [];

  const filteredUpcomingEvents = upcomingEvents && Array.isArray(upcomingEvents) ?
    upcomingEvents.filter((event: Event) => {
      // If we're looking at a specific sport, filter by it
      if (currentSport) {
        return event.sportId === currentSport.id;
      }
      return true;
    }) : [];

  // Helper function to get odds for an event
  const getOddsForEvent = (eventId: number) => {
    if (!odds || !Array.isArray(odds)) return null;
    return odds.find((odd: Odds) => odd.id === eventId.toString());
  };

  // Get team name helper function based on sport
  const getTeamName = (teamId: number): string => {
    // Basketball (NBA) team names
    if (sportKey === 'basketball') {
      switch (teamId) {
        case 1: return "Lakers";
        case 2: return "Celtics";
        case 3: return "Warriors";
        case 4: return "Bucks";
        case 5: return "Heat";
        case 6: return "Bulls";
        case 7: return "Nets";
        case 8: return "Clippers";
        case 9: return "Suns";
        case 10: return "76ers";
        default: return `Team ${teamId}`;
      }
    }
    // Football (NFL) team names
    else if (sportKey === 'football') {
      switch (teamId) {
        case 1: return "Chiefs";
        case 2: return "Eagles";
        case 3: return "49ers";
        case 4: return "Cowboys";
        case 5: return "Bills";
        case 6: return "Ravens";
        case 7: return "Bengals";
        case 8: return "Packers";
        case 9: return "Lions";
        case 10: return "Steelers";
        default: return `Team ${teamId}`;
      }
    }
    // Baseball (MLB) team names
    else if (sportKey === 'baseball') {
      switch (teamId) {
        case 1: return "Yankees";
        case 2: return "Red Sox";
        case 3: return "Dodgers";
        case 4: return "Cubs";
        case 5: return "Braves";
        case 6: return "Astros";
        case 7: return "Phillies";
        case 8: return "Giants";
        case 9: return "Padres";
        case 10: return "Blue Jays";
        default: return `Team ${teamId}`;
      }
    }
    // Hockey (NHL) team names
    else if (sportKey === 'hockey') {
      switch (teamId) {
        case 1: return "Maple Leafs";
        case 2: return "Bruins";
        case 3: return "Rangers";
        case 4: return "Oilers";
        case 5: return "Avalanche";
        case 6: return "Golden Knights";
        case 7: return "Capitals";
        case 8: return "Lightning";
        case 9: return "Panthers";
        case 10: return "Stars";
        default: return `Team ${teamId}`;
      }
    }
    // Soccer (MLS) team names
    else if (sportKey === 'soccer') {
      switch (teamId) {
        case 1: return "Inter Miami";
        case 2: return "LAFC";
        case 3: return "LA Galaxy";
        case 4: return "Atlanta United";
        case 5: return "Sounders";
        case 6: return "NYCFC";
        case 7: return "Columbus";
        case 8: return "Toronto FC";
        case 9: return "Austin FC";
        case 10: return "Orlando City";
        default: return `Team ${teamId}`;
      }
    }
    // Default fallback
    return `Team ${teamId}`;
  };

  // Helper function to add bet to slip
  const handleAddBet = (
    event: Event,
    type: string,
    selection: string,
    odds: number,
    point?: number
  ) => {
    // Get team names
    const homeTeam = event.homeTeamId ? getTeamName(event.homeTeamId) : 'Home Team';
    const awayTeam = event.awayTeamId ? getTeamName(event.awayTeamId) : 'Away Team';

    addToBetSlip({
      pick: selection,
      homeTeam,
      awayTeam,
      odds,
      betType: type,
      point,
      sportId: event.sportId
    });
  };

  return (
    <div className="container px-4 py-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{currentSport?.name || sportKey}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Live and upcoming events
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="live" className="text-sm">
            Live Events
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="text-sm">
            Upcoming Events
          </TabsTrigger>
          <TabsTrigger value="results" className="text-sm">
            Results
          </TabsTrigger>
        </TabsList>

        {/* Live Events Tab */}
        <TabsContent value="live">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <span className="h-3 w-3 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                Live {currentSport?.name || ''} Games
              </CardTitle>
              <CardDescription>
                Real-time scores and betting opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLiveEvents ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : filteredLiveEvents && filteredLiveEvents.length > 0 ? (
                <div className="space-y-6">
                  {filteredLiveEvents.map((event: Event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <div className="flex items-center">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-2">LIVE</Badge>
                            <span className="text-xs text-gray-500">{event.period || 'In Progress'} • {event.timeRemaining || '00:00'}</span>
                          </div>
                          <h3 className="font-medium mt-1">
                            {getTeamName(event.homeTeamId)} vs {getTeamName(event.awayTeamId)}
                          </h3>
                        </div>
                        <div className="text-xl font-bold">
                          {event.homeScore} - {event.awayScore}
                        </div>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500">Money Line</div>
                          <div className="grid grid-cols-2 gap-2">
                            <BetPreviewTooltip
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
                              recentTrend="up"
                              publicBettingPercentage={65}
                              injuryUpdates={[
                                `${getTeamName(event.homeTeamId)}: Anthony Davis (Questionable)`,
                                `${getTeamName(event.awayTeamId)}: Jaylen Brown (Day-to-Day)`
                              ]}
                            >
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => handleAddBet(event, 'moneyline', getTeamName(event.homeTeamId), -110)}
                              >
                                {getTeamName(event.homeTeamId).slice(0, 3)} -110
                              </Button>
                            </BetPreviewTooltip>
                            
                            <BetPreviewTooltip
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
                              recentTrend="up"
                              publicBettingPercentage={35}
                              injuryUpdates={[
                                `${getTeamName(event.homeTeamId)}: Anthony Davis (Questionable)`,
                                `${getTeamName(event.awayTeamId)}: Jaylen Brown (Day-to-Day)`
                              ]}
                            >
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => handleAddBet(event, 'moneyline', getTeamName(event.awayTeamId), +120)}
                              >
                                {getTeamName(event.awayTeamId).slice(0, 3)} +120
                              </Button>
                            </BetPreviewTooltip>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500">Spread</div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'spread', getTeamName(event.homeTeamId), -110, -5.5)}
                            >
                              {getTeamName(event.homeTeamId).slice(0, 3)} -5.5
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'spread', getTeamName(event.awayTeamId), -110, +5.5)}
                            >
                              {getTeamName(event.awayTeamId).slice(0, 3)} +5.5
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500">Total</div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'total', 'Over', -110, 220.5)}
                            >
                              O 220.5 (-110)
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'total', 'Under', -110, 220.5)}
                            >
                              U 220.5 (-110)
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/30 p-6 text-center rounded-lg">
                  <p className="text-muted-foreground">No live {currentSport?.name || sportKey} events at the moment. Check back later!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upcoming Events Tab */}
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming {currentSport?.name || ''} Games
              </CardTitle>
              <CardDescription>
                Upcoming matches and betting odds
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUpcomingEvents ? (
                <div className="space-y-4">
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </div>
              ) : filteredUpcomingEvents && filteredUpcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {filteredUpcomingEvents.map((event: Event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {new Date(event.startTime).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short', 
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <h3 className="font-medium mt-1">
                            {getTeamName(event.homeTeamId)} vs {getTeamName(event.awayTeamId)}
                          </h3>
                        </div>
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500">Money Line</div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'moneyline', getTeamName(event.homeTeamId), -130)}
                            >
                              {getTeamName(event.homeTeamId).slice(0, 3)} -130
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'moneyline', getTeamName(event.awayTeamId), +110)}
                            >
                              {getTeamName(event.awayTeamId).slice(0, 3)} +110
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500">Spread</div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'spread', getTeamName(event.homeTeamId), -110, -6.5)}
                            >
                              {getTeamName(event.homeTeamId).slice(0, 3)} -6.5
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'spread', getTeamName(event.awayTeamId), -110, +6.5)}
                            >
                              {getTeamName(event.awayTeamId).slice(0, 3)} +6.5
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500">Total</div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'total', 'Over', -110, 219.5)}
                            >
                              O 219.5
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'total', 'Under', -110, 219.5)}
                            >
                              U 219.5
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/30 p-6 text-center rounded-lg">
                  <p className="text-muted-foreground">No upcoming {currentSport?.name || sportKey} events scheduled at the moment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Results Tab */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BarChart2 className="h-4 w-4 mr-2" />
                {currentSport?.name || ''} Results
              </CardTitle>
              <CardDescription>
                Recent game results and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-6 text-center rounded-lg">
                <p className="text-muted-foreground">
                  Results feature coming soon. Check back for updates!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SportPage;