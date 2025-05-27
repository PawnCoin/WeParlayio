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
import { ChevronUp, ChevronDown, BarChart2, Clock, RefreshCcw, AlertTriangle, TrendingUp, Trash2, Info, Dot, DollarSign } from "lucide-react";
import BetResultAnimation from "@/components/betting/BetResultAnimation";
import BetConfetti from "@/components/betting/BetConfetti";

// Import team logo and player image utilities
import { getTeamLogo, getPlayerImage } from "@/lib/teamLogos";

// Import crypto components
import BetSlipCrypto from "@/components/betting/BetSlipCrypto";
import WalletConnect from "@/components/crypto/WalletConnect";
import { useOnboardingContext } from "@/components/onboarding/OnboardingProvider";
import ImprovedBetSlip from "@/components/betting/ImprovedBetSlip";

// Import odds display component
import OddsDisplay from "@/components/betting/OddsDisplay";
import BetPreviewTooltip, { TeamStats } from "@/components/betting/BetPreviewTooltip";
import BetOutcomeButton from "@/components/betting/BetOutcomeButton";
import MoneylineButton from "@/components/betting/MoneylineButton";
import BetButton from "@/components/betting/BetButton";
import EnhancedButton from "@/components/betting/EnhancedButton";
import MoneylinePreviewButton from "@/components/betting/MoneylinePreviewButton";
import BettingPreviewCard from "@/components/betting/BettingPreviewCard";
import BetPreviewButton from "@/components/betting/BetPreviewButton";

// Import the sportsDataUtils for dynamic logos and player images
import { 
  formatOdds, 
  calculatePayout,
  formatGameTime,
  formatGameDate,
  getLeagueInfo,
  americanToDecimal,
  americanToFractional
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
}

// Main LiveBetting component
const LiveBettingReal: React.FC = () => {
  const { toast } = useToast();
  const [selectedSport, setSelectedSport] = useState<string>("basketball_nba");
  const [betSlip, setBetSlip] = useState<BetSelection[]>([]);
  const [betAmount, setBetAmount] = useState<string>("10");
  const [betType, setBetType] = useState<'single' | 'parlay'>('single');
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [oddsFormat, setOddsFormat] = useState<'american' | 'decimal' | 'fractional'>('american');
  
  // Fetch available sports
  const { data: sports, isLoading: isLoadingSports } = useQuery({
    queryKey: ['/api/sports'],
    refetchInterval: 300000, // 5 minutes
  });
  
  // Fetch live events for selected sport
  const { 
    data: liveEventsData, 
    isLoading: isLoadingLiveEvents,
    refetch: refetchLiveEvents,
    dataUpdatedAt: liveDataUpdatedAt
  } = useQuery({
    queryKey: [`/api/sports/${selectedSport}/live`],
    refetchInterval: refreshInterval,
  });
  
  // Fetch upcoming events for selected sport
  const { 
    data: upcomingEventsData, 
    isLoading: isLoadingUpcomingEvents 
  } = useQuery({
    queryKey: [`/api/sports/${selectedSport}/upcoming`],
    refetchInterval: 60000, // 1 minute
  });
  
  // Ensure the data is an array, even if empty
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
  const calculateTotalPayout = () => {
    const amount = parseFloat(betAmount) || 0;
    
    if (betType === 'single') {
      // Each bet calculated separately
      return betSlip.map(bet => {
        return calculatePayout(bet.odds, amount);
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
  
  // State for bet result animation and confetti
  const [showBetResult, setShowBetResult] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [betResult, setBetResult] = useState<{
    isWin: boolean;
    amount: number;
    odds: number;
    betType: string;
    selection: string;
    event?: string;
    payout?: number;
  } | null>(null);

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
    
    // Randomly determine if the bet was a win (for demo purposes)
    const isWin = Math.random() > 0.4; // 60% chance of winning for demo
    
    // Calculate payout for the winning bet
    const calculatedPayout = calculateTotalPayout();
    
    // Prepare bet result for animation
    if (betSlip.length > 0) {
      const firstBet = betSlip[0];
      setBetResult({
        isWin,
        amount: parseFloat(betAmount),
        odds: firstBet.odds,
        betType: betType === 'single' ? 'Single' : 'Parlay',
        selection: firstBet.pick,
        event: `${firstBet.homeTeam} vs ${firstBet.awayTeam}`,
        payout: isWin ? calculatedPayout : 0
      });
      
      // Show confetti celebration for wins
      if (isWin) {
        setShowConfetti(true);
      } else {
        // For losses, just show the regular result animation
        setTimeout(() => {
          setShowBetResult(true);
        }, 1000);
      }
    }
    
    // Clear bet slip after successful bet
    setBetSlip([]);
    setBetAmount("10");
  };
  
  // Connect Crypto Wallet - this function is now replaced by CryptoWalletConnect component
  const handleWalletConnection = (address: string, type: string) => {
    toast({
      title: "Wallet Connected",
      description: `Your ${type} wallet is now connected. You can bet with crypto!`,
    });
    
    setSelectedCurrency(type === "metamask" || type === "coinbase" ? "ETH" : 
                        type === "phantom" ? "SOL" : "BTC");
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
  
  // Helper function to format odds based on selected format
  const displayOdds = (americanOdds: number): string => {
    switch (oddsFormat) {
      case 'decimal':
        return americanToDecimal(americanOdds).toFixed(2);
      case 'fractional':
        return americanToFractional(americanOdds);
      case 'american':
      default:
        return formatOdds(americanOdds);
    }
  };
  
  // Get the league's display name from the selected sport
  const leagueInfo = getLeagueInfo(selectedSport);
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-foreground">Live Betting</h1>
        <div className="flex gap-2">
          <div className="flex items-center mr-2">
            <span className="text-sm mr-2 text-foreground font-medium">Odds Format:</span>
            <Select value={oddsFormat} onValueChange={(value: 'american' | 'decimal' | 'fractional') => setOddsFormat(value)}>
              <SelectTrigger className="w-[110px] h-9 text-sm bg-background text-foreground">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="american">American</SelectItem>
                <SelectItem value="decimal">Decimal</SelectItem>
                <SelectItem value="fractional">Fractional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-[180px] bg-background text-foreground">
              <SelectValue placeholder="Select Sport" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingSports ? (
                <SelectItem value="loading" disabled>Loading sports...</SelectItem>
              ) : (
                <>
                  <SelectItem value="basketball_nba">NBA</SelectItem>
                  <SelectItem value="basketball_ncaab">NCAAB</SelectItem>
                  <SelectItem value="football_nfl">NFL</SelectItem>
                  <SelectItem value="baseball_mlb">MLB</SelectItem>
                  <SelectItem value="icehockey_nhl">NHL</SelectItem>
                  <SelectItem value="soccer_epl">Premier League</SelectItem>
                  <SelectItem value="boxing_main">Boxing</SelectItem>
                  <SelectItem value="mma_ufc">UFC</SelectItem>
                  <SelectItem value="motorsport_nascar">NASCAR</SelectItem>
                  <SelectItem value="tennis_atp">Tennis (ATP)</SelectItem>
                  <SelectItem value="tennis_wta">Tennis (WTA)</SelectItem>
                </>
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
                      Live {leagueInfo.name} Games
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
                  ) : liveEvents.length > 0 ? (
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
                                    <img 
                                      src={getTeamLogo(event.home_team, leagueInfo.name)} 
                                      alt={event.home_team} 
                                      className="w-6 h-6 mr-2"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).onerror = null;
                                        (e.target as HTMLImageElement).src = 'https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-basketball.png';
                                      }}
                                    />
                                    <span className="text-foreground">{event.home_team}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <img 
                                      src={getTeamLogo(event.away_team, leagueInfo.name)} 
                                      alt={event.away_team} 
                                      className="w-6 h-6 mr-2"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).onerror = null;
                                        (e.target as HTMLImageElement).src = 'https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-basketball.png';
                                      }}
                                    />
                                    <span className="text-foreground">{event.away_team}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <Badge variant="outline" className="mb-1 text-xs bg-muted text-foreground">
                                    {formatGameTimeRemaining(event)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {getGameStatus(event)}
                                  </span>
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
                    <div className="p-8 text-center">
                      <Info className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400 mb-2">No live games at the moment</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Check back later or view upcoming games
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="upcoming">
              <Card className="bg-card text-card-foreground">
                <CardHeader className="py-3 px-4 bg-muted">
                  <CardTitle className="text-base font-bold flex items-center text-foreground">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    Upcoming {leagueInfo.name} Games
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
                  ) : upcomingEvents.length > 0 ? (
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
                          const formattedDate = formatGameDate(startTime);
                          const formattedTime = formatGameTime(startTime);
                          
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
                                    <img 
                                      src={getTeamLogo(event.home_team, leagueInfo.name)} 
                                      alt={event.home_team} 
                                      className="w-6 h-6 mr-2"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).onerror = null;
                                        (e.target as HTMLImageElement).src = 'https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-basketball.png';
                                      }}
                                    />
                                    <span className="text-foreground">{event.home_team}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <img 
                                      src={getTeamLogo(event.away_team, leagueInfo.name)} 
                                      alt={event.away_team} 
                                      className="w-6 h-6 mr-2"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).onerror = null;
                                        (e.target as HTMLImageElement).src = 'https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-basketball.png';
                                      }}
                                    />
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
                                            outcome.point ? outcome.point : 0
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
                    <div className="p-8 text-center">
                      <Info className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400 mb-2">No upcoming games found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Check back later or try another sport
                      </p>
                    </div>
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
                {liveEvents.length > 0 ? `${liveEvents[0].home_team} vs ${liveEvents[0].away_team}` : "No live games"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4">
              {liveEvents.length > 0 ? (
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
                          <span className="text-foreground">{liveEvents[0].home_team}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 bg-secondary rounded-full mr-1"></div>
                          <span className="text-foreground">{liveEvents[0].away_team}</span>
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
                        <div className="col-span-1 font-medium text-left text-foreground">{liveEvents[0].home_team.split(' ').pop()}</div>
                        <div className="text-foreground">28</div>
                        <div className="text-foreground">32</div>
                        <div className="text-foreground">29</div>
                        <div className="text-foreground">-</div>
                      </div>
                      
                      <div className="grid grid-cols-5 text-sm text-center p-2">
                        <div className="col-span-1 font-medium text-left text-foreground">{liveEvents[0].away_team.split(' ').pop()}</div>
                        <div className="text-foreground">26</div>
                        <div className="text-foreground">30</div>
                        <div className="text-foreground">28</div>
                        <div className="text-foreground">-</div>
                      </div>
                    </div>
                    
                    <h3 className="font-medium mb-3 mt-6 text-foreground">Scoring Leaders</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded-md">
                        <div className="text-sm font-medium text-foreground">{liveEvents[0].home_team}</div>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-foreground">J. Tatum</span>
                          <span className="text-sm font-medium text-primary">28 pts</span>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-muted rounded-md">
                        <div className="text-sm font-medium text-foreground">{liveEvents[0].away_team}</div>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-foreground">L. James</span>
                          <span className="text-sm font-medium text-secondary">26 pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <Info className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No live games available</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Live statistics will appear here when games are in progress
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Bet Slip with Crypto Support */}
        <div>
          <Card className="bg-card text-card-foreground">
            <CardHeader className="py-3 px-4 bg-muted flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">
                <div className="flex items-center text-black dark:text-white">
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
              {/* Use our new BetSlipCrypto component */}
              <BetSlipCrypto 
                bets={betSlip}
                odds={betType === 'parlay' ? 
                    betSlip.reduce((total, bet) => {
                      const decimalOdds = bet.odds > 0 
                        ? 1 + (bet.odds / 100) 
                        : 1 + (100 / Math.abs(bet.odds));
                      return total * decimalOdds;
                    }, 1)
                  : betSlip.length === 1 ? 
                    (betSlip[0].odds > 0 
                      ? 1 + (betSlip[0].odds / 100) 
                      : 1 + (100 / Math.abs(betSlip[0].odds)))
                  : 0
                }
                onClearBets={clearBetSlip}
                onPlaceBet={(betData) => {
                  toast({
                    title: "Crypto Bet Placed!",
                    description: `Your ${betData.isParlay ? 'parlay' : 'single'} bet of ${betData.amount} ${betData.cryptoSymbol} has been placed successfully.`,
                  });
                  
                  // Clear bet slip after successful bet
                  setBetSlip([]);
                }}
              />
              
              {/* Enhanced Betting Interface */}
              {betSlip.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 mb-3 flex items-center">
                    <Info className="h-3 w-3 mr-1" />
                    Enhanced betting with all currencies
                  </div>
                  
                  <ImprovedBetSlip
                    betSlip={betSlip}
                    onRemoveBet={removeFromBetSlip}
                    onClearBetSlip={clearBetSlip}
                    onPlaceBet={(amount, type, boostEnabled) => {
                      // Update state for compatibility with existing code
                      setBetAmount(amount);
                      setBetType(type as 'single' | 'parlay');
                      
                      // Apply odds boost if enabled
                      if (boostEnabled) {
                        toast({
                          title: "WePlay Token Boost Applied",
                          description: "5% odds boost applied to your bet for using WePlay Token!",
                        });
                      }
                      
                      // Call existing place bet function
                      placeBet();
                    }}
                  />
                </div>
              )}
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
      
      {/* Bet Result Animation */}
      {showBetResult && betResult && (
        <BetResultAnimation
          isWin={betResult.isWin}
          amount={betResult.amount}
          odds={betResult.odds}
          betType={betResult.betType}
          selection={betResult.selection}
          event={betResult.event}
          onClose={() => setShowBetResult(false)}
        />
      )}
      
      {/* Bet Confetti Celebration */}
      {showConfetti && betResult && (
        <BetConfetti
          isWin={betResult.isWin}
          amount={betResult.payout || 0}
          duration={5000}
          onComplete={() => {
            setShowConfetti(false);
            // Show the regular bet result animation after confetti
            setTimeout(() => {
              setShowBetResult(true);
            }, 500);
          }}
        />
      )}
    </div>
  );
};

export default LiveBettingReal;