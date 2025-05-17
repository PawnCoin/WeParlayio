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
  const filteredLiveEvents = liveEvents?.filter((event: Event) => {
    // If we're looking at a specific sport, filter by it
    if (currentSport) {
      return event.sportId === currentSport.id;
    }
    return true;
  });

  const filteredUpcomingEvents = upcomingEvents?.filter((event: Event) => {
    // If we're looking at a specific sport, filter by it
    if (currentSport) {
      return event.sportId === currentSport.id;
    }
    return true;
  });

  // Helper function to get odds for an event
  const getOddsForEvent = (eventId: number) => {
    if (!odds) return null;
    return odds.find((odd: Odds) => odd.id === eventId.toString());
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
    const homeTeam = event.homeTeamId ? `Team ${event.homeTeamId}` : 'Home';
    const awayTeam = event.awayTeamId ? `Team ${event.awayTeamId}` : 'Away';

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
              ) : filteredLiveEvents?.length > 0 ? (
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
                            Team {event.homeTeamId} vs Team {event.awayTeamId}
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'moneyline', `Team ${event.homeTeamId}`, -110)}
                            >
                              Home -110
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'moneyline', `Team ${event.awayTeamId}`, +120)}
                            >
                              Away +120
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
                              onClick={() => handleAddBet(event, 'spread', `Team ${event.homeTeamId}`, -110, -5.5)}
                            >
                              -5.5 (-110)
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'spread', `Team ${event.awayTeamId}`, -110, +5.5)}
                            >
                              +5.5 (-110)
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
              ) : filteredUpcomingEvents?.length > 0 ? (
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
                            Team {event.homeTeamId} vs Team {event.awayTeamId}
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
                              onClick={() => handleAddBet(event, 'moneyline', `Team ${event.homeTeamId}`, -130)}
                            >
                              Home -130
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'moneyline', `Team ${event.awayTeamId}`, +110)}
                            >
                              Away +110
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
                              onClick={() => handleAddBet(event, 'spread', `Team ${event.homeTeamId}`, -110, -6.5)}
                            >
                              -6.5 (-110)
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'spread', `Team ${event.awayTeamId}`, -110, +6.5)}
                            >
                              +6.5 (-110)
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
                              O 219.5 (-110)
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleAddBet(event, 'total', 'Under', -110, 219.5)}
                            >
                              U 219.5 (-110)
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