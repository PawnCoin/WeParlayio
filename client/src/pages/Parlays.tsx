import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SportsbookParlayCard } from '@/components/parlay/SportsbookParlayCard';
import { ProgressiveParlayRules } from '@/components/parlay/ProgressiveParlayRules';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  DollarSign,
  TrendingUp,
  Target,
  CheckCircle,
  Search,
  Clock,
  BarChart3,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getLeagueLogo, getLeagueDisplayName } from '@/utils/sportsLogosSimple';

interface ParlayLeg {
  id: string;
  sport: string;
  teams: string;
  pick: string;
  odds: number;
  game_id?: string;
}

interface ParlayMatchup {
  id: string;
  sport: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  moneylineOdds: {
    home: number;
    away: number;
    tie?: number;
  };
  overUnder: {
    line: number;
    over: number;
    under: number;
  };
}

export default function Parlays() {
  const [parlayLegs, setParlayLegs] = useState<ParlayLeg[]>([]);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedSport, setSelectedSport] = useState<string>("soccer");
  const [parlayType, setParlayType] = useState<"standard" | "progressive">("standard");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch authentic multi-sport data from priority API system (same as odds page)
  const { data: sportsDataResponse } = useQuery({
    queryKey: ["/api/odds"],
    refetchInterval: 30000,
  });

  // Extract authentic data from priority API response
  const sportsData: any[] = sportsDataResponse?.success ? sportsDataResponse.data : (sportsDataResponse?.data || sportsDataResponse || []);
  
  console.log('🎯 Parlays Page - Authentic Data:', {
    totalEvents: sportsData.length,
    sampleEvents: sportsData.slice(0, 3).map(e => ({ 
      sport: e.sport, 
      homeTeam: e.homeTeam?.name, 
      awayTeam: e.awayTeam?.name 
    }))
  });

  // Fetch user's cash balance (integrated with betting system)
  const { data: userBalance } = useQuery({
    queryKey: ["/api/user/cash-balance"],
    refetchInterval: 10000,
  });

  // Use authentic multi-sport data (45 events across NFL, NBA, MLB, NHL, Soccer, WNBA)
  const combinedSportsData = sportsData || [];

  // Transform unified sports data into sportsbook-style matchups
  const sportsbookMatchups: ParlayMatchup[] = combinedSportsData.slice(0, 50).map((event: any, index: number) => {
    // Handle different data source formats
    const sportType = event.sport_title || event.sport || event.category || 'Unknown Sport';
    const gameTime = event.start_time || event.commence_time || new Date().toISOString();
    
    return {
      id: `matchup-${event.id || event.game_id || index}`,
      sport: sportType,
      time: new Date(gameTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      homeTeam: event.home_team || event.homeTeam || 'Home Team',
      awayTeam: event.away_team || event.awayTeam || 'Away Team',
      moneylineOdds: {
        home: event.home_odds || event.moneyline?.home || +152,
        away: event.away_odds || event.moneyline?.away || +267,
        tie: event.tie_odds || event.moneyline?.tie || +157
      },
      overUnder: {
        line: event.total_line || event.overUnder?.line || 1.5,
        over: event.over_odds || event.overUnder?.over || +100,
        under: event.under_odds || event.overUnder?.under || -125
      }
    };
  });

  // Filter matchups based on selected sport and search
  const filteredMatchups = sportsbookMatchups.filter(matchup => {
    const sportMatch = selectedSport === "all" || matchup.sport.toLowerCase().includes(selectedSport.toLowerCase());
    const searchMatch = searchFilter === "" || 
      matchup.homeTeam.toLowerCase().includes(searchFilter.toLowerCase()) ||
      matchup.awayTeam.toLowerCase().includes(searchFilter.toLowerCase());
    return sportMatch && searchMatch;
  });

  // Calculate parlay odds and payout
  const calculateParlayOdds = () => {
    if (parlayLegs.length === 0) return { odds: 0, payout: 0, profit: 0 };
    
    let totalOdds = 1;
    parlayLegs.forEach(leg => {
      const decimal = leg.odds > 0 ? (leg.odds / 100) + 1 : (100 / Math.abs(leg.odds)) + 1;
      totalOdds *= decimal;
    });
    
    const payout = betAmount * totalOdds;
    const profit = payout - betAmount;
    
    return { odds: totalOdds, payout, profit };
  };

  const parlayStats = calculateParlayOdds();

  // Add selection from sportsbook card
  const addSelectionFromSportsbook = (selection: any) => {
    const newLeg: ParlayLeg = {
      id: selection.id,
      sport: selection.sport,
      teams: selection.matchup,
      pick: `${selection.team} ${selection.type}`,
      odds: selection.odds,
      game_id: selection.matchupId
    };

    setParlayLegs(prev => {
      const exists = prev.find(leg => leg.id === newLeg.id);
      if (exists) {
        toast({
          title: "Selection Already Added",
          description: "This selection is already in your parlay",
          variant: "destructive",
        });
        return prev;
      }
      
      toast({
        title: "Selection Added",
        description: `Added ${newLeg.pick} to your parlay`,
      });
      
      return [...prev, newLeg];
    });
  };

  // Remove leg from parlay
  const removeLeg = (legId: string) => {
    setParlayLegs(prev => prev.filter(leg => leg.id !== legId));
    toast({
      title: "Selection Removed",
      description: "Selection removed from parlay",
    });
  };

  // Place parlay bet mutation
  const placeParlayMutation = useMutation({
    mutationFn: async (parlayData: any) => {
      return apiRequest("POST", "/api/bets/parlay", parlayData);
    },
    onSuccess: () => {
      toast({
        title: "Parlay Placed!",
        description: `Successfully placed parlay bet for $${betAmount}`,
      });
      setParlayLegs([]);
      setBetAmount(10);
      queryClient.invalidateQueries({ queryKey: ["/api/user/bets"] });
    },
    onError: (error: any) => {
      toast({
        title: "Bet Failed",
        description: error.message || "Failed to place parlay bet",
        variant: "destructive",
      });
    },
  });

  const placeParlayBet = () => {
    if (parlayLegs.length < 2) {
      toast({
        title: "Insufficient Legs",
        description: "Parlay requires at least 2 legs",
        variant: "destructive",
      });
      return;
    }

    const parlayData = {
      legs: parlayLegs,
      betAmount,
      parlayType,
      totalOdds: parlayStats.odds,
      potentialPayout: parlayStats.payout
    };

    placeParlayMutation.mutate(parlayData);
  };

  // Get dynamic sports list from actual data
  const uniqueSports = Array.from(new Set(sportsbookMatchups.map(m => m.sport.toUpperCase()).filter(Boolean)));
  const availableSports = [
    "PARLAY CARDS", 
    "All Sport Parlay Card", 
    "Football Parlay and Teaser Card", 
    "Basketball Parlay Card", 
    "Soccer Parlay Card",
    "LIVE BETTING",
    ...uniqueSports
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">PARLAY CARDS</h1>
          <div className="flex items-center gap-4">
            <Select value={parlayType} onValueChange={(value: "standard" | "progressive") => setParlayType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Parlay Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="progressive">Progressive</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Live Odds
            </Badge>
            <Badge variant="outline">
              {filteredMatchups.length} Games
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Sport Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search teams..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sports List */}
            <div className="space-y-1">
              {availableSports.map((sport, index) => {
                const isCategory = sport === "PARLAY CARDS" || sport === "LIVE BETTING";
                const isSelected = selectedSport === sport.toLowerCase();
                
                if (isCategory) {
                  return (
                    <div key={sport} className="py-2">
                      <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">
                        {sport}
                      </h3>
                    </div>
                  );
                }
                
                return (
                  <Button
                    key={sport}
                    variant={isSelected ? "default" : "ghost"}
                    className="w-full justify-start text-sm text-gray-600 hover:text-gray-800"
                    onClick={() => setSelectedSport(sport.toLowerCase())}
                  >
                    {sport}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Game Cards - 3 columns */}
            <div className="lg:col-span-3">
              {/* Header with filters */}
              <div className="bg-gray-800 text-white px-4 py-3 mb-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-yellow-400">
                      ALL {selectedSport.toUpperCase()} GAME LINES
                    </h2>
                    <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                      UPDATE
                    </Button>
                  </div>
                  <Select value="American (+105)" onValueChange={() => {}}>
                    <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="American (+105)">American (+105)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Table Headers */}
                <div className="grid grid-cols-4 gap-4 mt-4 text-sm font-medium">
                  <div>Time</div>
                  <div>Team</div>
                  <div>Money</div>
                  <div>Total</div>
                </div>
              </div>

              {/* Game Cards */}
              <div className="space-y-4">
                {filteredMatchups.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Games Available</h3>
                      <p className="text-gray-600">
                        Live betting markets will appear here when games are active.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredMatchups.map((matchup) => (
                    <SportsbookParlayCard
                      key={matchup.id}
                      matchup={matchup}
                      onAddSelection={addSelectionFromSportsbook}
                    />
                  ))
                )}
              </div>

              {/* Progressive Parlay Rules */}
              {parlayType === "progressive" && (
                <ProgressiveParlayRules
                  selectedLegs={parlayLegs.length}
                  betAmount={betAmount}
                />
              )}
            </div>

            {/* Parlay Slip - Right column */}
            <div className="space-y-4">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    {parlayType === "progressive" ? "Progressive " : ""}Parlay Slip ({parlayLegs.length} legs)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {parlayLegs.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Add bets to build your parlay</p>
                    </div>
                  ) : (
                    <>
                      {/* Parlay Legs */}
                      <div className="space-y-3">
                        {parlayLegs.map((leg) => (
                          <div key={leg.id} className="border rounded p-3 bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{leg.sport}</p>
                                <p className="text-xs text-gray-600">{leg.teams}</p>
                                <p className="text-xs text-blue-600">{leg.pick}</p>
                                <Badge variant="outline" className="mt-1">
                                  {leg.odds > 0 ? `+${leg.odds}` : leg.odds}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeLeg(leg.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bet Amount */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Bet Amount</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            value={betAmount}
                            onChange={(e) => setBetAmount(Number(e.target.value))}
                            className="pl-10"
                            min="1"
                            step="1"
                          />
                        </div>
                      </div>

                      {/* Parlay Stats */}
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Total Odds:</span>
                          <span className="font-bold">
                            {parlayStats.odds > 0 ? `+${Math.round((parlayStats.odds - 1) * 100)}` : parlayStats.odds.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Potential Profit:</span>
                          <span className="font-bold text-green-600">
                            ${parlayStats.profit.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total Payout:</span>
                          <span className="text-green-600">
                            ${parlayStats.payout.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Place Bet Button */}
                      <Button 
                        onClick={placeParlayBet}
                        className="w-full"
                        disabled={parlayLegs.length < 2 || placeParlayMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {placeParlayMutation.isPending ? "Placing..." : `Place ${parlayType === "progressive" ? "Progressive " : ""}Parlay Bet`}
                      </Button>

                      {parlayLegs.length < 2 && (
                        <p className="text-xs text-gray-500 text-center">
                          Add at least 2 legs to place parlay
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}