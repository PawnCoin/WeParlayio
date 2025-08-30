import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ChevronUp, ChevronDown, Clock, RefreshCcw, AlertTriangle, Dot, PlayCircle } from "lucide-react";

// Import for bet slip management - using the working betting context
import { useBetting } from "@/contexts/BettingContext";

// Import WatchLive component
import WatchLive from "@/components/events/WatchLive";

// Import team logos and utils
import { getTeamLogo } from '@/lib/teamLogos';
import { 
  formatOdds, 
  formatGameTime,
  formatGameDate,
  getLeagueInfo
} from "@/lib/sportsDataUtils";

const LiveBettingContent: React.FC = () => {
  const { toast } = useToast();
  const [selectedSport, setSelectedSport] = useState<string>("basketball_nba");
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
  
  // Watch Live feature state
  const [watchLiveDialog, setWatchLiveDialog] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    league: string;
  } | null>(null);
  
  // Get bet slip methods from context - using working betting context
  const { addBet } = useBetting();
  
  // Fetch sports data
  const { 
    data: sportsData, 
    isLoading: isLoadingSports 
  } = useQuery({
    queryKey: ['/api/sports'],
    refetchOnWindowFocus: false
  });
  
  // Fetch live events data with refresh interval
  const { 
    data: liveEventsData, 
    isLoading: isLoadingLiveEvents,
    refetch: refetchLiveEvents,
    dataUpdatedAt: liveDataUpdatedAt
  } = useQuery({
    queryKey: ['/api/odds', selectedSport, 'live'],
    refetchInterval: refreshInterval,
    refetchOnWindowFocus: false
  });
  
  // Fetch upcoming events data
  const { 
    data: upcomingEventsData, 
    isLoading: isLoadingUpcomingEvents,
    refetch: refetchUpcomingEvents
  } = useQuery({
    queryKey: ['/api/odds', selectedSport, 'upcoming'],
    refetchOnWindowFocus: false
  });
  
  // Convert data to arrays if needed
  const sports = Array.isArray(sportsData) ? sportsData : [];
  const liveEvents = Array.isArray(liveEventsData) ? liveEventsData : [];
  const upcomingEvents = Array.isArray(upcomingEventsData) ? upcomingEventsData : [];
  
  // Format time remaining in game
  const formatGameTimeRemaining = (event: any) => {
    if (event.time_remaining) {
      return event.time_remaining;
    }
    
    if (event.scores) {
      return "Live";
    }
    
    // Format commence time
    const gameTime = new Date(event.commence_time);
    return formatGameTime(gameTime);
  };
  
  // Function to add a selection to the bet slip
  const handleAddToBetSlip = (
    gameId: string,
    homeTeam: string,
    awayTeam: string,
    betType: 'moneyline' | 'spread' | 'total',
    pick: string,
    odds: number,
    point?: number
  ) => {
    // Create the bet object in the format that works with BettingContext
    const newBet = {
      id: `${gameId}-${betType}-${pick}-${Date.now()}`,
      type: 'Sports',
      eventName: `${awayTeam} vs ${homeTeam}`,
      selection: pick,
      opponent: betType === 'moneyline' ? (pick === homeTeam ? awayTeam : homeTeam) : 'Market',
      odds: odds,
      timestamp: new Date().toISOString(),
      status: 'pending' as const
    };
    
    // Use the context method to add to slip
    addBet(newBet);
  };
  
  // Helper to convert sport key to sportId
  const getSportId = (sportKey: string): number => {
    const sportMap: Record<string, number> = {
      'basketball_nba': 1,
      'basketball_ncaab': 1,
      'basketball_euroleague': 1,
      'football_nfl': 2,
      'football_ncaaf': 2,
      'baseball_mlb': 3,
      'hockey_nhl': 4,
      'soccer_epl': 5,
      'soccer_mls': 5,
      'tennis_atp': 6,
      'tennis_wta': 6,
      'mma_ufc': 7,
      'boxing': 8,
      'nascar': 9,
      'golf_pga': 10
    };
    
    return sportMap[sportKey] || 1; // Default to basketball if not found
  };
  
  // Manually refresh data
  const handleRefresh = () => {
    refetchLiveEvents();
    refetchUpcomingEvents();
    
    toast({
      title: "Data Refreshed",
      description: "The latest odds and game information has been loaded.",
    });
  };
  
  // Format the score for display
  const formatScore = (score: number | null | undefined) => {
    return score !== null && score !== undefined ? score : '-';
  };
  
  // Watch live handler
  const handleWatchLive = (event: any) => {
    toast({
      title: "Opening Live Stream",
      description: `Loading ${event.home_team} vs ${event.away_team}...`,
      duration: 2000,
    });
    window.location.href = '/live-sports-streaming';
  };
  
  // Get the last updated time
  const getLastUpdatedTime = () => {
    const date = new Date(liveDataUpdatedAt);
    return date.toLocaleTimeString();
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-[180px] bg-background text-foreground">
              <SelectValue placeholder="Select Sport" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingSports ? (
                <SelectItem value="loading" disabled>Loading sports...</SelectItem>
              ) : (
                sports && sports.length > 0 ? 
                sports.map((sport: any) => (
                  <SelectItem key={sport.key} value={sport.key}>
                    {sport.title}
                  </SelectItem>
                )) : (
                  // Fallback options if no sports data is available
                  <>
                    <SelectItem value="basketball_nba">NBA</SelectItem>
                    <SelectItem value="basketball_ncaab">NCAAB</SelectItem>
                    <SelectItem value="football_nfl">NFL</SelectItem>
                    <SelectItem value="baseball_mlb">MLB</SelectItem>
                    <SelectItem value="icehockey_nhl">NHL</SelectItem>
                  </>
                )
              )}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="flex items-center gap-1 bg-background text-foreground"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <div className="flex items-center text-xs">
          <Select 
            value={refreshInterval.toString()} 
            onValueChange={(v) => setRefreshInterval(parseInt(v))}
          >
            <SelectTrigger className="h-8 text-xs w-[150px] bg-background text-foreground">
              <SelectValue placeholder="Refresh Rate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10000">Refresh: 10s</SelectItem>
              <SelectItem value="30000">Refresh: 30s</SelectItem>
              <SelectItem value="60000">Refresh: 1m</SelectItem>
              <SelectItem value="300000">Refresh: 5m</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card className="bg-card text-card-foreground">
        <CardHeader className="py-3 px-4 bg-muted flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center text-foreground">
              <Dot className="h-5 w-5 text-green-500 animate-pulse" />
              Live Games
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Last updated: {getLastUpdatedTime()}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoadingLiveEvents ? (
            <div className="p-8">
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : liveEvents && liveEvents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Game</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Time</TableHead>
                  <TableHead className="text-right">Moneyline</TableHead>
                  <TableHead className="text-right">Spread</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Watch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveEvents.map((event: any) => {
                  // Extract data from the event
                  const homeTeam = event.home_team;
                  const awayTeam = event.away_team;
                  const homeScore = event.scores?.home;
                  const awayScore = event.scores?.away;
                  const timeRemaining = formatGameTimeRemaining(event);
                  
                  // Find bookmaker with odds
                  const bookmaker = event.bookmakers && event.bookmakers.length > 0 ? event.bookmakers[0] : null;
                  
                  // Extract markets and odds if available
                  const moneylineMarket = bookmaker?.markets?.find((m: any) => m.key === 'h2h');
                  const spreadMarket = bookmaker?.markets?.find((m: any) => m.key === 'spreads');
                  const totalMarket = bookmaker?.markets?.find((m: any) => m.key === 'totals');
                  
                  // Get odds for each team
                  const homeMoneyline = moneylineMarket?.outcomes?.find((o: any) => o.name === homeTeam)?.price;
                  const awayMoneyline = moneylineMarket?.outcomes?.find((o: any) => o.name === awayTeam)?.price;
                  
                  const homeSpread = spreadMarket?.outcomes?.find((o: any) => o.name === homeTeam);
                  const awaySpread = spreadMarket?.outcomes?.find((o: any) => o.name === awayTeam);
                  
                  const overTotal = totalMarket?.outcomes?.find((o: any) => o.name === 'Over');
                  const underTotal = totalMarket?.outcomes?.find((o: any) => o.name === 'Under');
                  
                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center">
                              <img 
                                src={getTeamLogo(homeTeam)} 
                                alt={homeTeam}
                                className="w-5 h-5 mr-2"
                              />
                              {homeTeam}
                            </div>
                            <div className="flex items-center">
                              <img 
                                src={getTeamLogo(awayTeam)} 
                                alt={awayTeam}
                                className="w-5 h-5 mr-2"
                              />
                              {awayTeam}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <div className="flex flex-col">
                          <span className="text-foreground">{formatScore(homeScore)}</span>
                          <span className="text-foreground">{formatScore(awayScore)}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-background text-foreground">
                          {timeRemaining}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex flex-col space-y-1">
                          {homeMoneyline !== undefined ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleAddToBetSlip(
                                event.id,
                                homeTeam,
                                awayTeam,
                                'moneyline',
                                homeTeam,
                                homeMoneyline
                              )}
                              className="justify-end px-2 py-0 h-7 hover:bg-muted"
                            >
                              <span className="font-mono">
                                {formatOdds(homeMoneyline)}
                              </span>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground px-2">-</span>
                          )}
                          
                          {awayMoneyline !== undefined ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleAddToBetSlip(
                                event.id,
                                homeTeam,
                                awayTeam,
                                'moneyline',
                                awayTeam,
                                awayMoneyline
                              )}
                              className="justify-end px-2 py-0 h-7 hover:bg-muted"
                            >
                              <span className="font-mono">
                                {formatOdds(awayMoneyline)}
                              </span>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground px-2">-</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex flex-col space-y-1">
                          {homeSpread?.point !== undefined ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleAddToBetSlip(
                                event.id,
                                homeTeam,
                                awayTeam,
                                'spread',
                                `${homeTeam} ${homeSpread.point > 0 ? '+' : ''}${homeSpread.point}`,
                                homeSpread.price,
                                homeSpread.point
                              )}
                              className="justify-end px-2 py-0 h-7 hover:bg-muted"
                            >
                              <span className="text-xs mr-1">
                                {homeSpread.point > 0 ? '+' : ''}{homeSpread.point}
                              </span>
                              <span className="font-mono">
                                {formatOdds(homeSpread.price)}
                              </span>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground px-2">-</span>
                          )}
                          
                          {awaySpread?.point !== undefined ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleAddToBetSlip(
                                event.id,
                                homeTeam,
                                awayTeam,
                                'spread',
                                `${awayTeam} ${awaySpread.point > 0 ? '+' : ''}${awaySpread.point}`,
                                awaySpread.price,
                                awaySpread.point
                              )}
                              className="justify-end px-2 py-0 h-7 hover:bg-muted"
                            >
                              <span className="text-xs mr-1">
                                {awaySpread.point > 0 ? '+' : ''}{awaySpread.point}
                              </span>
                              <span className="font-mono">
                                {formatOdds(awaySpread.price)}
                              </span>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground px-2">-</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex flex-col space-y-1">
                          {overTotal?.point !== undefined ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleAddToBetSlip(
                                event.id,
                                homeTeam,
                                awayTeam,
                                'total',
                                `Over ${overTotal.point}`,
                                overTotal.price,
                                overTotal.point
                              )}
                              className="justify-end px-2 py-0 h-7 hover:bg-muted"
                            >
                              <span className="text-xs mr-1">
                                O {overTotal.point}
                              </span>
                              <span className="font-mono">
                                {formatOdds(overTotal.price)}
                              </span>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground px-2">-</span>
                          )}
                          
                          {underTotal?.point !== undefined ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleAddToBetSlip(
                                event.id,
                                homeTeam,
                                awayTeam,
                                'total',
                                `Under ${underTotal.point}`,
                                underTotal.price,
                                underTotal.point
                              )}
                              className="justify-end px-2 py-0 h-7 hover:bg-muted"
                            >
                              <span className="text-xs mr-1">
                                U {underTotal.point}
                              </span>
                              <span className="font-mono">
                                {formatOdds(underTotal.price)}
                              </span>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground px-2">-</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleWatchLive(event)}
                          className="w-8 h-8 p-0"
                        >
                          <PlayCircle className="h-4 w-4 text-primary" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">No Live Games</h3>
              <p className="text-muted-foreground mb-2">There are no live games available right now for this sport.</p>
              <p className="text-sm text-muted-foreground">
                Check back later or select a different sport category.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Watch Live Dialog */}
      {watchLiveDialog && selectedEvent && (
        <WatchLive
          isOpen={watchLiveDialog}
          onClose={() => setWatchLiveDialog(false)}
          eventId={Number(selectedEvent.id)}
          sportKey={selectedEvent.sport || 'basketball'}
          homeTeam={selectedEvent.homeTeam}
          awayTeam={selectedEvent.awayTeam}
        />
      )}
    </div>
  );
};

export default LiveBettingContent;