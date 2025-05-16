import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ChevronUp, ChevronDown, BarChart2, Clock, RefreshCcw, AlertTriangle, TrendingUp, Trash2, Info, Dot, PlayCircle, Video, Zap, Activity } from "lucide-react";

// Import enhanced betting components
import BettingManager from "@/pages/BettingManager";
import { BetSlipProvider, useBetSlip } from "@/contexts/BetSlipContext";
import LiveOddsUpdates from "@/components/betting/LiveOddsUpdates";

// Import WatchLive component
import WatchLive from "@/components/events/WatchLive";

// Import team logos and utils
import { 
  getTeamLogoUrl, 
  getPlayerImageUrl, 
  formatOdds, 
  calculatePayout,
  formatGameTime,
  formatGameDate,
  getLeagueInfo
} from "@/lib/sportsDataUtils";

// Bet type for Bet Slip
interface BetSelection {
  id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  betType: 'moneyline' | 'spread' | 'total';
  pick: string;
  odds: number;
  point?: number;
  sportId: number;
}

// Wrapper component to use the bet slip context
const LiveBettingContent: React.FC = () => {
  const { toast } = useToast();
  const [selectedSport, setSelectedSport] = useState<string>("basketball_nba");
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
  
  // Get bet slip methods from context
  const { addToBetSlip } = useBetSlip();
  
  // Watch Live feature state
  const [watchLiveDialog, setWatchLiveDialog] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    id: number;
    sportKey: string;
    homeTeam: string;
    awayTeam: string;
  } | null>(null);
  
  // Fetch available sports
  const { data: sports, isLoading: isLoadingSports } = useQuery({
    queryKey: ['/api/sports'],
    refetchInterval: 300000, // 5 minutes
  });
  
  // Fetch live events for selected sport
  const { 
    data: liveEvents, 
    isLoading: isLoadingLiveEvents,
    refetch: refetchLiveEvents,
    dataUpdatedAt: liveDataUpdatedAt
  } = useQuery({
    queryKey: [`/api/sports/${selectedSport}/live`],
    refetchInterval: refreshInterval,
  });
  
  // Fetch upcoming events for selected sport
  const { 
    data: upcomingEvents, 
    isLoading: isLoadingUpcomingEvents 
  } = useQuery({
    queryKey: [`/api/sports/${selectedSport}/upcoming`],
    refetchInterval: 60000, // 1 minute
  });
  
  // Mock live data for demonstration
  const mockLiveData = [
    {
      id: "live-1",
      home_team: "Boston Celtics",
      away_team: "Los Angeles Lakers",
      scores: [
        { name: "Boston Celtics", score: 89 },
        { name: "Los Angeles Lakers", score: 84 }
      ],
      time_remaining: "Q3 7:21",
      status: "in_progress",
      commence_time: new Date(new Date().getTime() - 4800000).toISOString(), // Started 80 minutes ago
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Boston Celtics", price: -155 },
                { name: "Los Angeles Lakers", price: 135 }
              ]
            },
            {
              key: "spreads",
              outcomes: [
                { name: "Boston Celtics", price: -110, point: -3.5 },
                { name: "Los Angeles Lakers", price: -110, point: 3.5 }
              ]
            },
            {
              key: "totals",
              outcomes: [
                { name: "Over", price: -110, point: 220.5 },
                { name: "Under", price: -110, point: 220.5 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "live-2",
      home_team: "Golden State Warriors",
      away_team: "Denver Nuggets",
      scores: [
        { name: "Golden State Warriors", score: 101 },
        { name: "Denver Nuggets", score: 92 }
      ],
      time_remaining: "Q4 2:45",
      status: "in_progress",
      commence_time: new Date(new Date().getTime() - 6000000).toISOString(), // Started 100 minutes ago
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Golden State Warriors", price: -220 },
                { name: "Denver Nuggets", price: 185 }
              ]
            },
            {
              key: "spreads",
              outcomes: [
                { name: "Golden State Warriors", price: -110, point: -5.5 },
                { name: "Denver Nuggets", price: -110, point: 5.5 }
              ]
            },
            {
              key: "totals",
              outcomes: [
                { name: "Over", price: -110, point: 235.5 },
                { name: "Under", price: -110, point: 235.5 }
              ]
            }
          ]
        }
      ]
    }
  ];

  // Mock upcoming data for demonstration
  const mockUpcomingData = [
    {
      id: "upcoming-1",
      home_team: "Miami Heat",
      away_team: "Phoenix Suns",
      commence_time: new Date(new Date().getTime() + 3600000).toISOString(), // Starts in 1 hour
      bookmakers: [
        {
          key: "draftkings",
          title: "DraftKings",
          last_update: new Date().toISOString(),
          markets: [
            {
              key: "h2h",
              outcomes: [
                { name: "Miami Heat", price: 165 },
                { name: "Phoenix Suns", price: -195 }
              ]
            },
            {
              key: "spreads",
              outcomes: [
                { name: "Miami Heat", price: -110, point: 4.5 },
                { name: "Phoenix Suns", price: -110, point: -4.5 }
              ]
            },
            {
              key: "totals",
              outcomes: [
                { name: "Over", price: -110, point: 218.5 },
                { name: "Under", price: -110, point: 218.5 }
              ]
            }
          ]
        }
      ]
    }
  ];
  
  // Format time remaining in game
  const formatGameTime = (event: any) => {
    if (event.time_remaining) {
      return event.time_remaining;
    }
    
    if (event.scores) {
      return "Live";
    }
    
    // Format commence time
    const gameTime = new Date(event.commence_time);
    return gameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Add bet to slip
  const addToBetSlip = (
    gameId: string, 
    homeTeam: string, 
    awayTeam: string, 
    betType: 'moneyline' | 'spread' | 'total', 
    pick: string, 
    odds: number,
    point?: number
  ) => {
    // Check if this bet is already in the slip
    const existingBetIndex = betSlip.findIndex(
      bet => bet.gameId === gameId && bet.betType === betType && bet.pick === pick
    );
    
    if (existingBetIndex >= 0) {
      // Remove if already exists
      const newBetSlip = [...betSlip];
      newBetSlip.splice(existingBetIndex, 1);
      setBetSlip(newBetSlip);
      
      toast({
        title: "Bet Removed",
        description: `${pick} ${betType} bet has been removed from your slip.`,
      });
    } else {
      // Add new bet
      const newBet: BetSelection = {
        id: `${gameId}-${betType}-${pick}`,
        gameId,
        homeTeam,
        awayTeam,
        betType,
        pick,
        odds,
        point
      };
      
      setBetSlip([...betSlip, newBet]);
      
      toast({
        title: "Bet Added",
        description: `${pick} ${betType} bet has been added to your slip.`,
      });
    }
  };
  
  // Remove bet from slip
  const removeFromBetSlip = (betId: string) => {
    setBetSlip(betSlip.filter(bet => bet.id !== betId));
  };
  
  // Clear bet slip
  const clearBetSlip = () => {
    setBetSlip([]);
    toast({
      title: "Bet Slip Cleared",
      description: "All bets have been removed from your slip.",
    });
  };
  
  // Calculate potential payout
  const calculatePotentialPayout = () => {
    const amount = parseFloat(betAmount) || 0;
    
    if (betType === 'single') {
      // Each bet calculated separately
      return betSlip.map(bet => {
        const odds = bet.odds;
        return odds > 0 
          ? amount + (amount * (odds / 100)) 
          : amount + (amount / (Math.abs(odds) / 100));
      }).reduce((sum, payout) => sum + payout, 0);
    } else {
      // Parlay - multiply all odds
      if (betSlip.length <= 1) return amount;
      
      const combinedOdds = betSlip.reduce((total, bet) => {
        // Convert American odds to decimal
        const decimalOdds = bet.odds > 0 
          ? 1 + (bet.odds / 100) 
          : 1 + (100 / Math.abs(bet.odds));
        
        return total * decimalOdds;
      }, 1);
      
      return amount * combinedOdds;
    }
  };
  
  // Format odds display
  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };
  
  // Check if bet is in slip
  const isBetInSlip = (
    gameId: string, 
    betType: 'moneyline' | 'spread' | 'total', 
    pick: string
  ) => {
    return betSlip.some(
      bet => bet.gameId === gameId && bet.betType === betType && bet.pick === pick
    );
  };
  
  // Manual refresh of live events
  const handleRefresh = () => {
    refetchLiveEvents();
    toast({
      title: "Refreshed",
      description: "Live betting data has been updated.",
    });
  };
  
  // Place bet function
  const placeBet = () => {
    if (betSlip.length === 0) {
      toast({
        title: "No Bets Selected",
        description: "Please select at least one bet to place.",
        variant: "destructive"
      });
      return;
    }
    
    if (parseFloat(betAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bet amount.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would call an API to place the bet
    toast({
      title: "Bet Placed!",
      description: `Your ${betType} bet has been placed successfully.`,
    });
    
    // Clear bet slip after successful bet
    setBetSlip([]);
    setBetAmount("10");
  };
  
  // Get status of the live event
  const getGameStatus = (event: any) => {
    if (!event.scores) return "Starting Soon";
    
    const homeScore = event.scores.find((s: any) => s.name === event.home_team)?.score || 0;
    const awayScore = event.scores.find((s: any) => s.name === event.away_team)?.score || 0;
    
    if (homeScore > awayScore) {
      return `${event.home_team} leading by ${homeScore - awayScore}`;
    } else if (awayScore > homeScore) {
      return `${event.away_team} leading by ${awayScore - homeScore}`;
    } else {
      return "Tied game";
    }
  };
  
  // Get last updated time
  const getLastUpdatedTime = () => {
    if (!liveDataUpdatedAt) return new Date().toLocaleTimeString();
    
    const date = new Date(liveDataUpdatedAt);
    return date.toLocaleTimeString();
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-foreground">Live Betting</h1>
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
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Tabs defaultValue="live">
            <TabsList className="w-full mb-2 grid grid-cols-2 bg-muted">
              <TabsTrigger value="live" className="tabs-trigger">
                <Badge variant="destructive" className="mr-2">Live</Badge> In-Play
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="tabs-trigger">
                <Clock className="h-4 w-4 mr-2" /> Upcoming
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="live">
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
                          <TableHead>Time</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Moneyline</TableHead>
                          <TableHead>Spread</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {liveEvents.map((event: any) => {
                          // Get scores if available
                          const homeScore = event.scores?.find((s: any) => s.name === event.home_team)?.score;
                          const awayScore = event.scores?.find((s: any) => s.name === event.away_team)?.score;
                          
                          // Look for bookmaker (first available one)
                          const bookmaker = event.bookmakers?.[0];
                          
                          // Extract markets
                          const moneylineMarket = bookmaker?.markets?.find((m: any) => m.key === 'h2h');
                          const spreadMarket = bookmaker?.markets?.find((m: any) => m.key === 'spreads');
                          const totalMarket = bookmaker?.markets?.find((m: any) => m.key === 'totals');
                          
                          return (
                            <TableRow key={event.id}>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center">
                                    {getTeamLogoUrl(event.home_team) ? (
                                      <img 
                                        src={getTeamLogoUrl(event.home_team)} 
                                        alt={event.home_team} 
                                        className="w-6 h-6 mr-2"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 mr-2 bg-gray-200 rounded-full"></div>
                                    )}
                                    <span className="text-foreground">{event.home_team}</span>
                                  </div>
                                  <div className="flex items-center">
                                    {getTeamLogoUrl(event.away_team) ? (
                                      <img 
                                        src={getTeamLogoUrl(event.away_team)} 
                                        alt={event.away_team} 
                                        className="w-6 h-6 mr-2"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 mr-2 bg-gray-200 rounded-full"></div>
                                    )}
                                    <span className="text-foreground">{event.away_team}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <Badge variant="outline" className="mb-1 text-xs bg-muted text-foreground">
                                    {formatGameTime(event)}
                                  </Badge>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                      {getGameStatus(event)}
                                    </span>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="flex items-center text-xs bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 h-6 px-2 ml-2"
                                      onClick={() => {
                                        setSelectedEvent({
                                          id: event.id,
                                          sportKey: selectedSport,
                                          homeTeam: event.home_team,
                                          awayTeam: event.away_team
                                        });
                                        setWatchLiveDialog(true);
                                      }}
                                    >
                                      <Video className="w-3 h-3 mr-1" />
                                      Watch
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <div className="font-bold text-foreground">{homeScore !== undefined ? homeScore : '-'}</div>
                                  <div className="font-bold text-foreground">{awayScore !== undefined ? awayScore : '-'}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {moneylineMarket ? (
                                  <div className="flex flex-col gap-1">
                                    {moneylineMarket.outcomes.map((outcome: any) => {
                                      const isSelected = isBetInSlip(event.id, 'moneyline', outcome.name);
                                      return (
                                        <Button 
                                          key={`${event.id}-moneyline-${outcome.name}`}
                                          variant={isSelected ? "default" : "outline"} 
                                          size="sm" 
                                          className={`w-full text-xs ${isSelected ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                                          onClick={() => addToBetSlip(
                                            event.id, 
                                            event.home_team, 
                                            event.away_team, 
                                            'moneyline', 
                                            outcome.name, 
                                            outcome.price
                                          )}
                                        >
                                          {formatOdds(outcome.price)}
                                        </Button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">Not available</div>
                                )}
                              </TableCell>
                              <TableCell>
                                {spreadMarket ? (
                                  <div className="flex flex-col gap-1">
                                    {spreadMarket.outcomes.map((outcome: any) => {
                                      const isSelected = isBetInSlip(event.id, 'spread', outcome.name);
                                      return (
                                        <Button 
                                          key={`${event.id}-spread-${outcome.name}`}
                                          variant={isSelected ? "default" : "outline"} 
                                          size="sm" 
                                          className={`w-full text-xs ${isSelected ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                                          onClick={() => addToBetSlip(
                                            event.id, 
                                            event.home_team, 
                                            event.away_team, 
                                            'spread', 
                                            outcome.name, 
                                            outcome.price,
                                            outcome.point
                                          )}
                                        >
                                          {outcome.point > 0 ? '+' : ''}{outcome.point} ({formatOdds(outcome.price)})
                                        </Button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">Not available</div>
                                )}
                              </TableCell>
                              <TableCell>
                                {totalMarket ? (
                                  <div className="flex flex-col gap-1">
                                    {totalMarket.outcomes.map((outcome: any) => {
                                      const isSelected = isBetInSlip(event.id, 'total', outcome.name);
                                      return (
                                        <Button 
                                          key={`${event.id}-total-${outcome.name}`}
                                          variant={isSelected ? "default" : "outline"} 
                                          size="sm" 
                                          className={`w-full text-xs ${isSelected ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                                          onClick={() => addToBetSlip(
                                            event.id, 
                                            event.home_team, 
                                            event.away_team, 
                                            'total', 
                                            outcome.name, 
                                            outcome.price,
                                            outcome.point
                                          )}
                                        >
                                          {outcome.name.toUpperCase()} {outcome.point} ({formatOdds(outcome.price)})
                                        </Button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">Not available</div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    // If no actual data, use mock data for demonstration
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-muted-foreground">Game</TableHead>
                          <TableHead className="text-muted-foreground">Time</TableHead>
                          <TableHead className="text-muted-foreground">Score</TableHead>
                          <TableHead className="text-muted-foreground">Moneyline</TableHead>
                          <TableHead className="text-muted-foreground">Spread</TableHead>
                          <TableHead className="text-muted-foreground">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockLiveData.map((event: any) => {
                          // Get scores if available
                          const homeScore = event.scores?.find((s: any) => s.name === event.home_team)?.score;
                          const awayScore = event.scores?.find((s: any) => s.name === event.away_team)?.score;
                          
                          // Look for bookmaker (first available one)
                          const bookmaker = event.bookmakers?.[0];
                          
                          // Extract markets
                          const moneylineMarket = bookmaker?.markets?.find((m: any) => m.key === 'h2h');
                          const spreadMarket = bookmaker?.markets?.find((m: any) => m.key === 'spreads');
                          const totalMarket = bookmaker?.markets?.find((m: any) => m.key === 'totals');
                          
                          return (
                            <TableRow key={event.id}>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center">
                                    {getTeamLogoUrl(event.home_team) ? (
                                      <img 
                                        src={getTeamLogoUrl(event.home_team)} 
                                        alt={event.home_team} 
                                        className="w-6 h-6 mr-2"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 mr-2 bg-gray-200 rounded-full"></div>
                                    )}
                                    <span className="text-foreground">{event.home_team}</span>
                                  </div>
                                  <div className="flex items-center">
                                    {getTeamLogoUrl(event.away_team) ? (
                                      <img 
                                        src={getTeamLogoUrl(event.away_team)} 
                                        alt={event.away_team} 
                                        className="w-6 h-6 mr-2"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 mr-2 bg-gray-200 rounded-full"></div>
                                    )}
                                    <span className="text-foreground">{event.away_team}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <Badge variant="outline" className="mb-1 text-xs bg-muted text-foreground">
                                    {event.time_remaining}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {getGameStatus(event)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <div className="font-bold text-foreground">{homeScore}</div>
                                  <div className="font-bold text-foreground">{awayScore}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {moneylineMarket && (
                                  <div className="flex flex-col gap-1">
                                    {moneylineMarket.outcomes.map((outcome: any) => {
                                      const isSelected = isBetInSlip(event.id, 'moneyline', outcome.name);
                                      return (
                                        <Button 
                                          key={`${event.id}-moneyline-${outcome.name}`}
                                          variant={isSelected ? "default" : "outline"} 
                                          size="sm" 
                                          className={`w-full text-xs ${isSelected ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                                          onClick={() => addToBetSlip(
                                            event.id, 
                                            event.home_team, 
                                            event.away_team, 
                                            'moneyline', 
                                            outcome.name, 
                                            outcome.price
                                          )}
                                        >
                                          {formatOdds(outcome.price)}
                                        </Button>
                                      );
                                    })}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {spreadMarket && (
                                  <div className="flex flex-col gap-1">
                                    {spreadMarket.outcomes.map((outcome: any) => {
                                      const isSelected = isBetInSlip(event.id, 'spread', outcome.name);
                                      return (
                                        <Button 
                                          key={`${event.id}-spread-${outcome.name}`}
                                          variant={isSelected ? "default" : "outline"} 
                                          size="sm" 
                                          className={`w-full text-xs ${isSelected ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                                          onClick={() => addToBetSlip(
                                            event.id, 
                                            event.home_team, 
                                            event.away_team, 
                                            'spread', 
                                            outcome.name, 
                                            outcome.price,
                                            outcome.point
                                          )}
                                        >
                                          {outcome.point > 0 ? '+' : ''}{outcome.point} ({formatOdds(outcome.price)})
                                        </Button>
                                      );
                                    })}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {totalMarket && (
                                  <div className="flex flex-col gap-1">
                                    {totalMarket.outcomes.map((outcome: any) => {
                                      const isSelected = isBetInSlip(event.id, 'total', outcome.name);
                                      return (
                                        <Button 
                                          key={`${event.id}-total-${outcome.name}`}
                                          variant={isSelected ? "default" : "outline"} 
                                          size="sm" 
                                          className={`w-full text-xs ${isSelected ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                                          onClick={() => addToBetSlip(
                                            event.id, 
                                            event.home_team, 
                                            event.away_team, 
                                            'total', 
                                            outcome.name, 
                                            outcome.price,
                                            outcome.point
                                          )}
                                        >
                                          {outcome.name.toUpperCase()} {outcome.point} ({formatOdds(outcome.price)})
                                        </Button>
                                      );
                                    })}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="upcoming">
              <Card className="bg-card text-card-foreground">
                <CardHeader className="py-3 px-4 bg-muted">
                  <CardTitle className="text-base font-bold flex items-center text-foreground">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    Upcoming Games
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Starting soon - place your bets now
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-0">
                  {isLoadingUpcomingEvents ? (
                    <div className="p-8">
                      <Skeleton className="h-12 w-full mb-2" />
                      <Skeleton className="h-12 w-full mb-2" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : upcomingEvents && upcomingEvents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-muted-foreground">Game</TableHead>
                          <TableHead className="text-muted-foreground">Time</TableHead>
                          <TableHead className="text-muted-foreground">Moneyline</TableHead>
                          <TableHead className="text-muted-foreground">Spread</TableHead>
                          <TableHead className="text-muted-foreground">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingEvents.map((event: any) => {
                          // Format start time
                          const startTime = new Date(event.commence_time);
                          const formattedDate = startTime.toLocaleDateString();
                          const formattedTime = startTime.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          });
                          
                          // Look for bookmaker (first available one)
                          const bookmaker = event.bookmakers?.[0];
                          
                          // Extract markets
                          const moneylineMarket = bookmaker?.markets?.find((m: any) => m.key === 'h2h');
                          const spreadMarket = bookmaker?.markets?.find((m: any) => m.key === 'spreads');
                          const totalMarket = bookmaker?.markets?.find((m: any) => m.key === 'totals');
                          
                          return (
                            <TableRow key={event.id}>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center">
                                    {getTeamLogoUrl(event.home_team) ? (
                                      <img 
                                        src={getTeamLogoUrl(event.home_team)} 
                                        alt={event.home_team} 
                                        className="w-6 h-6 mr-2"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 mr-2 bg-gray-200 rounded-full"></div>
                                    )}
                                    <span className="text-foreground">{event.home_team}</span>
                                  </div>
                                  <div className="flex items-center">
                                    {getTeamLogoUrl(event.away_team) ? (
                                      <img 
                                        src={getTeamLogoUrl(event.away_team)} 
                                        alt={event.away_team} 
                                        className="w-6 h-6 mr-2"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 mr-2 bg-gray-200 rounded-full"></div>
                                    )}
                                    <span className="text-foreground">{event.away_team}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium text-foreground">{formattedDate}</span>
                                  <span className="text-xs text-muted-foreground">{formattedTime}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {moneylineMarket ? (
                                  <div className="flex flex-col gap-1">
                                    {moneylineMarket.outcomes.map((outcome: any) => {
                                      const isSelected = isBetInSlip(event.id, 'moneyline', outcome.name);
                                      return (
                                        <Button 
                                          key={`${event.id}-moneyline-${outcome.name}`}
                                          variant={isSelected ? "default" : "outline"} 
                                          size="sm" 
                                          className={`w-full text-xs ${isSelected ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                                          onClick={() => addToBetSlip(
                                            event.id, 
                                            event.home_team, 
                                            event.away_team, 
                                            'moneyline', 
                                            outcome.name, 
                                            outcome.price
                                          )}
                                        >
                                          {formatOdds(outcome.price)}
                                        </Button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">Not available</div>
                                )}
                              </TableCell>
                              <TableCell>
                                {spreadMarket ? (
                                  <div className="flex flex-col gap-1">
                                    {spreadMarket.outcomes.map((outcome: any) => {
                                      const isSelected = isBetInSlip(event.id, 'spread', outcome.name);
                                      return (
                                        <Button 
                                          key={`${event.id}-spread-${outcome.name}`}
                                          variant={isSelected ? "default" : "outline"} 
                                          size="sm" 
                                          className={`w-full text-xs ${isSelected ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                                          onClick={() => addToBetSlip(
                                            event.id, 
                                            event.home_team, 
                                            event.away_team, 
                                            'spread', 
                                            outcome.name, 
                                            outcome.price,
                                            outcome.point
                                          )}
                                        >
                                          {outcome.point > 0 ? '+' : ''}{outcome.point} ({formatOdds(outcome.price)})
                                        </Button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">Not available</div>
                                )}
                              </TableCell>
                              <TableCell>
                                {totalMarket ? (
                                  <div className="flex flex-col gap-1">
                                    {totalMarket.outcomes.map((outcome: any) => {
                                      const isSelected = isBetInSlip(event.id, 'total', outcome.name);
                                      return (
                                        <Button 
                                          key={`${event.id}-total-${outcome.name}`}
                                          variant={isSelected ? "default" : "outline"} 
                                          size="sm" 
                                          className={`w-full text-xs ${isSelected ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                                          onClick={() => addToBetSlip(
                                            event.id, 
                                            event.home_team, 
                                            event.away_team, 
                                            'total', 
                                            outcome.name, 
                                            outcome.price,
                                            outcome.point
                                          )}
                                        >
                                          {outcome.name.toUpperCase()} {outcome.point} ({formatOdds(outcome.price)})
                                        </Button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground">Not available</div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    // If no actual data, use mock data for demonstration
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-muted-foreground">Game</TableHead>
                          <TableHead className="text-muted-foreground">Time</TableHead>
                          <TableHead className="text-muted-foreground">Moneyline</TableHead>
                          <TableHead className="text-muted-foreground">Spread</TableHead>
                          <TableHead className="text-muted-foreground">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockUpcomingData.map((event: any) => {
                          // Format start time
                          const startTime = new Date(event.commence_time);
                          const formattedDate = startTime.toLocaleDateString();
                          const formattedTime = startTime.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          });
                          
                          // Look for bookmaker (first available one)
                          const bookmaker = event.bookmakers?.[0];
                          
                          // Extract markets
                          const moneylineMarket = bookmaker?.markets?.find((m: any) => m.key === 'h2h');
                          const spreadMarket = bookmaker?.markets?.find((m: any) => m.key === 'spreads');
                          const totalMarket = bookmaker?.markets?.find((m: any) => m.key === 'totals');
                          
                          return (
                            <TableRow key={event.id}>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center">
                                    {getTeamLogoUrl(event.home_team) ? (
                                      <img 
                                        src={getTeamLogoUrl(event.home_team)} 
                                        alt={event.home_team} 
                                        className="w-6 h-6 mr-2"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 mr-2 bg-gray-200 rounded-full"></div>
                                    )}
                                    <span className="text-foreground">{event.home_team}</span>
                                  </div>
                                  <div className="flex items-center">
                                    {getTeamLogoUrl(event.away_team) ? (
                                      <img 
                                        src={getTeamLogoUrl(event.away_team)} 
                                        alt={event.away_team} 
                                        className="w-6 h-6 mr-2"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 mr-2 bg-gray-200 rounded-full"></div>
                                    )}
                                    <span className="text-foreground">{event.away_team}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium text-foreground">{formattedDate}</span>
                                  <span className="text-xs text-muted-foreground">{formattedTime}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {moneylineMarket && (
                                  <div className="flex flex-col gap-1">
                                    {moneylineMarket.outcomes.map((outcome: any) => {
                                      const isSelected = isBetInSlip(event.id, 'moneyline', outcome.name);
                                      return (
                                        <Button 
                                          key={`${event.id}-moneyline-${outcome.name}`}
                                          variant={isSelected ? "default" : "outline"} 
                                          size="sm" 
                                          className={`w-full text-xs ${isSelected ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                                          onClick={() => addToBetSlip(
                                            event.id, 
                                            event.home_team, 
                                            event.away_team, 
                                            'moneyline', 
                                            outcome.name, 
                                            outcome.price
                                          )}
                                        >
                                          {formatOdds(outcome.price)}
                                        </Button>
                                      );
                                    })}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {spreadMarket && (
                                  <div className="flex flex-col gap-1">
                                    {spreadMarket.outcomes.map((outcome: any) => {
                                      const isSelected = isBetInSlip(event.id, 'spread', outcome.name);
                                      return (
                                        <Button 
                                          key={`${event.id}-spread-${outcome.name}`}
                                          variant={isSelected ? "default" : "outline"} 
                                          size="sm" 
                                          className={`w-full text-xs ${isSelected ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                                          onClick={() => addToBetSlip(
                                            event.id, 
                                            event.home_team, 
                                            event.away_team, 
                                            'spread', 
                                            outcome.name, 
                                            outcome.price,
                                            outcome.point
                                          )}
                                        >
                                          {outcome.point > 0 ? '+' : ''}{outcome.point} ({formatOdds(outcome.price)})
                                        </Button>
                                      );
                                    })}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {totalMarket && (
                                  <div className="flex flex-col gap-1">
                                    {totalMarket.outcomes.map((outcome: any) => {
                                      const isSelected = isBetInSlip(event.id, 'total', outcome.name);
                                      return (
                                        <Button 
                                          key={`${event.id}-total-${outcome.name}`}
                                          variant={isSelected ? "default" : "outline"} 
                                          size="sm" 
                                          className={`w-full text-xs ${isSelected ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                                          onClick={() => addToBetSlip(
                                            event.id, 
                                            event.home_team, 
                                            event.away_team, 
                                            'total', 
                                            outcome.name, 
                                            outcome.price,
                                            outcome.point
                                          )}
                                        >
                                          {outcome.name.toUpperCase()} {outcome.point} ({formatOdds(outcome.price)})
                                        </Button>
                                      );
                                    })}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Game Statistics */}
          <Card className="bg-card text-card-foreground mt-4">
            <CardHeader className="py-3 px-4 bg-muted">
              <CardTitle className="text-base font-bold flex items-center text-foreground">
                <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                Live Game Statistics
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Boston Celtics vs Los Angeles Lakers - Q3 7:21
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team Stats */}
                <div>
                  <h3 className="font-medium mb-3 text-foreground">Team Statistics</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">Field Goal %</span>
                        <div className="flex gap-4">
                          <span className="w-12 text-right text-primary">48.2%</span>
                          <span className="w-12 text-right text-secondary">44.5%</span>
                        </div>
                      </div>
                      <div className="flex h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-primary" style={{ width: "52%" }}></div>
                        <div className="bg-secondary" style={{ width: "48%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">3-Point %</span>
                        <div className="flex gap-4">
                          <span className="w-12 text-right text-primary">38.9%</span>
                          <span className="w-12 text-right text-secondary">36.2%</span>
                        </div>
                      </div>
                      <div className="flex h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-primary" style={{ width: "53%" }}></div>
                        <div className="bg-secondary" style={{ width: "47%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">Rebounds</span>
                        <div className="flex gap-4">
                          <span className="w-12 text-right text-primary">42</span>
                          <span className="w-12 text-right text-secondary">38</span>
                        </div>
                      </div>
                      <div className="flex h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-primary" style={{ width: "55%" }}></div>
                        <div className="bg-secondary" style={{ width: "45%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">Assists</span>
                        <div className="flex gap-4">
                          <span className="w-12 text-right text-primary">24</span>
                          <span className="w-12 text-right text-secondary">19</span>
                        </div>
                      </div>
                      <div className="flex h-2 bg-muted rounded-full overflow-hidden">
                        <div className="bg-primary" style={{ width: "57%" }}></div>
                        <div className="bg-secondary" style={{ width: "43%" }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-8 mt-4 text-xs text-center">
                    <div>
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 bg-primary rounded-full mr-1"></div>
                        <span className="text-foreground">Boston Celtics</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 bg-secondary rounded-full mr-1"></div>
                        <span className="text-foreground">LA Lakers</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quarter by Quarter */}
                <div>
                  <h3 className="font-medium mb-3 text-foreground">Quarter by Quarter</h3>
                  <div className="border border-muted rounded-md overflow-hidden">
                    <div className="grid grid-cols-5 text-xs text-center font-medium bg-muted p-2">
                      <div className="col-span-1 text-foreground">Team</div>
                      <div className="text-foreground">Q1</div>
                      <div className="text-foreground">Q2</div>
                      <div className="text-foreground">Q3</div>
                      <div className="text-foreground">Q4</div>
                    </div>
                    
                    <div className="grid grid-cols-5 text-sm text-center p-2 border-b border-muted">
                      <div className="col-span-1 font-medium text-left text-foreground">Boston</div>
                      <div className="text-foreground">28</div>
                      <div className="text-foreground">32</div>
                      <div className="text-foreground">29</div>
                      <div className="text-foreground">-</div>
                    </div>
                    
                    <div className="grid grid-cols-5 text-sm text-center p-2">
                      <div className="col-span-1 font-medium text-left text-foreground">Lakers</div>
                      <div className="text-foreground">26</div>
                      <div className="text-foreground">30</div>
                      <div className="text-foreground">28</div>
                      <div className="text-foreground">-</div>
                    </div>
                  </div>
                  
                  <h3 className="font-medium mb-3 mt-6 text-foreground">Scoring Leaders</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-md">
                      <div className="text-sm font-medium text-foreground">Boston Celtics</div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-foreground">J. Tatum</span>
                        <span className="text-sm font-medium text-primary">28 pts</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted rounded-md">
                      <div className="text-sm font-medium text-foreground">LA Lakers</div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-foreground">L. James</span>
                        <span className="text-sm font-medium text-secondary">26 pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Bet Slip */}
        <div>
          <Card className="bg-card text-card-foreground">
            <CardHeader className="py-3 px-4 bg-muted flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">
                <div className="flex items-center text-foreground">
                  <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                  Bet Slip
                </div>
              </CardTitle>
              {betSlip.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearBetSlip}
                  className="h-8 text-xs bg-background text-foreground"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </CardHeader>
            
            <CardContent className="p-4">
              {betSlip.length === 0 ? (
                <div className="border border-dashed border-muted rounded-md p-4 mb-4 text-center text-muted-foreground text-sm">
                  Select odds to add to your bet slip
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-4">
                    <Button 
                      variant={betType === 'single' ? "default" : "outline"}
                      className={`flex-1 text-xs ${betType === 'single' ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                      onClick={() => setBetType('single')}
                    >
                      Singles
                    </Button>
                    <Button 
                      variant={betType === 'parlay' ? "default" : "outline"}
                      className={`flex-1 text-xs ${betType === 'parlay' ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                      onClick={() => setBetType('parlay')}
                      disabled={betSlip.length < 2}
                    >
                      Parlay
                    </Button>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto mb-4">
                    {betSlip.map((bet) => (
                      <div 
                        key={bet.id} 
                        className="border border-muted rounded-md p-3 mb-2 text-sm"
                      >
                        <div className="flex justify-between mb-1">
                          <div className="font-medium text-foreground">{bet.pick}</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeFromBetSlip(bet.id)}
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {bet.homeTeam} vs {bet.awayTeam}
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-foreground">
                            {bet.betType === 'moneyline' ? (
                              <span>Moneyline</span>
                            ) : bet.betType === 'spread' ? (
                              <span>Spread {bet.point > 0 ? '+' : ''}{bet.point}</span>
                            ) : (
                              <span>{bet.pick.toUpperCase()} {bet.point}</span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs bg-background text-foreground">
                            {formatOdds(bet.odds)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="betAmount" className="text-xs font-medium mb-1 block text-foreground">
                    Bet Amount ($)
                  </label>
                  <Input
                    id="betAmount"
                    type="number"
                    min="1"
                    step="1"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="text-sm bg-background text-foreground"
                  />
                </div>
                
                {betSlip.length > 0 && (
                  <div className="flex justify-between py-2 border-t border-muted">
                    <span className="text-sm font-medium text-foreground">Potential Payout:</span>
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      ${calculatePotentialPayout().toFixed(2)}
                    </span>
                  </div>
                )}
                
                <Button 
                  className="w-full bg-primary text-white" 
                  disabled={betSlip.length === 0 || parseFloat(betAmount) <= 0}
                  onClick={placeBet}
                >
                  Place Bet
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Live Betting Tips */}
          <Card className="bg-card text-card-foreground mt-4">
            <CardHeader className="py-3 px-4 bg-muted">
              <CardTitle className="text-base font-bold text-foreground">Betting Tips</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="border border-muted rounded-md p-3">
                  <div className="text-sm font-semibold mb-1 text-foreground">Momentum Shifts</div>
                  <p className="text-xs text-muted-foreground">Watch for teams gaining momentum after timeouts or big plays. Odds often adjust more slowly than the game dynamics.</p>
                </div>
                
                <div className="border border-muted rounded-md p-3">
                  <div className="text-sm font-semibold mb-1 text-foreground">Player Foul Trouble</div>
                  <p className="text-xs text-muted-foreground">Key players in foul trouble often lead to point spreads widening. Consider betting on the underdog in these situations.</p>
                </div>
                
                <div className="border border-muted rounded-md p-3">
                  <div className="text-sm font-semibold mb-1 text-foreground">Late Game Strategy</div>
                  <p className="text-xs text-muted-foreground">Teams may play conservatively to protect leads or aggressively to catch up. This affects the total over/under betting lines.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    
    </div>
    
    {/* Watch Live Dialog */}
    {selectedEvent && (
      <WatchLive
        eventId={selectedEvent.id}
        sportKey={selectedEvent.sportKey}
        homeTeam={selectedEvent.homeTeam}
        awayTeam={selectedEvent.awayTeam}
        isOpen={watchLiveDialog}
        onClose={() => setWatchLiveDialog(false)}
      />
    )}
  );
};

export default LiveBettingEnhanced;