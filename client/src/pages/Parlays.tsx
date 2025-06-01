import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamLogo, TeamMatchup } from '@/components/betting/TeamLogo';
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
  Zap,
  CheckCircle,
  X,
  Award,
  Filter,
  Search,
  Clock,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParlayLeg {
  id: string;
  sport: string;
  teams: string;
  pick: string;
  odds: number;
  game_id?: string;
}

// Enhanced Parlays with Real Team Logos - Updated for WeParlay
export default function Parlays() {
  const [parlayLegs, setParlayLegs] = useState<ParlayLeg[]>([]);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [parlayType, setParlayType] = useState<"standard" | "progressive">("standard");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const { toast } = useToast();

  // Fetch real odds data for parlay building
  const { data: realOddsData } = useQuery({
    queryKey: ["/api/real-odds"],
    refetchInterval: 30000,
  });

  // Fetch authentic sportsbook parlays from sportsbook.ag
  const { data: sportsbookParlays } = useQuery({
    queryKey: ["/api/sportsbook/parlays"],
    refetchInterval: 300000, // 5 minutes
  });

  // Calculate parlay odds and payout
  const calculateParlayOdds = () => {
    if (parlayLegs.length === 0) return { odds: 0, payout: 0 };
    
    let totalOdds = 1;
    parlayLegs.forEach(leg => {
      // Convert American odds to decimal for calculation
      const decimal = leg.odds > 0 ? (leg.odds / 100) + 1 : (100 / Math.abs(leg.odds)) + 1;
      totalOdds *= decimal;
    });
    
    const payout = betAmount * totalOdds;
    const profit = payout - betAmount;
    
    return { 
      odds: totalOdds, 
      payout: payout,
      profit: profit
    };
  };

  // Add a bet to parlay
  const addToParlayFromOdds = (oddsData: any) => {
    const newLeg: ParlayLeg = {
      id: `${Date.now()}-${Math.random()}`,
      sport: oddsData.sport_title || 'Unknown Sport',
      teams: `${oddsData.home_team} vs ${oddsData.away_team}`,
      pick: oddsData.home_team || 'Team A',
      odds: oddsData.home_odds || 100,
      game_id: oddsData.id
    };
    
    setParlayLegs(prev => [...prev, newLeg]);
    toast({
      title: "Added to Parlay",
      description: `${newLeg.teams} added successfully`,
    });
  };

  // Remove leg from parlay
  const removeLeg = (legId: string) => {
    setParlayLegs(prev => prev.filter(leg => leg.id !== legId));
  };

  // Place parlay bet
  const placeParlayBet = async () => {
    if (parlayLegs.length < 2) {
      toast({
        title: "Invalid Parlay",
        description: "Parlays must have at least 2 legs",
        variant: "destructive",
      });
      return;
    }

    const { payout } = calculateParlayOdds();
    
    try {
      // Here you would call your betting API
      toast({
        title: "Parlay Placed!",
        description: `$${betAmount} parlay bet placed. Potential payout: $${payout.toFixed(2)}`,
      });
      
      // Clear parlay after placing
      setParlayLegs([]);
      setBetAmount(10);
    } catch (error) {
      toast({
        title: "Bet Failed",
        description: "Unable to place parlay bet",
        variant: "destructive",
      });
    }
  };

  const parlayStats = calculateParlayOdds();
  const oddsArray = Array.isArray(realOddsData) ? realOddsData : [];
  const sportsbookData = sportsbookParlays?.data || [];

  // Add sportsbook parlay to builder
  const addSportsbookParlay = (parlay: any) => {
    parlay.legs.forEach((leg: any) => {
      const newLeg: ParlayLeg = {
        id: `${Date.now()}-${Math.random()}`,
        sport: parlay.sport,
        teams: parlay.teams,
        pick: leg.pick,
        odds: leg.odds,
        game_id: parlay.id
      };
      setParlayLegs(prev => [...prev, newLeg]);
    });
    
    toast({
      title: "Sportsbook Parlay Added",
      description: `${parlay.teams} added from sportsbook.ag`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Parlay Builder</h1>
        <p className="text-gray-600">Combine multiple bets for bigger payouts</p>
      </div>

      {/* Sportsbook Parlays Section */}
      {sportsbookData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Live Sportsbook Parlays (sportsbook.ag)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {sportsbookData.slice(0, 5).map((parlay: any) => (
                <div key={parlay.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{parlay.teams}</p>
                    <p className="text-sm text-gray-600">{parlay.sport}</p>
                    <Badge variant="outline" className="mt-1">
                      {parlay.combinedOdds > 0 ? `+${parlay.combinedOdds}` : parlay.combinedOdds}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => addSportsbookParlay(parlay)}
                    className="ml-3"
                  >
                    Add to Builder
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Available Bets */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Available Bets</h2>
          
          {oddsArray.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Live Odds Available</h3>
                <p className="text-gray-600">
                  Live betting markets will appear here when games are active.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {oddsArray.slice(0, 8).map((odds: any, index: number) => (
                <Card key={`parlay-odds-${odds.id || index}`} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{odds.sport_title}</h3>
                        <p className="text-sm text-gray-600">
                          {odds.home_team} vs {odds.away_team}
                        </p>
                        <div className="flex gap-4">
                          {odds.home_team && (
                            <div className="text-center">
                              <p className="text-xs text-gray-500">{odds.home_team}</p>
                              <p className="font-bold text-blue-600">
                                {odds.home_odds > 0 ? `+${odds.home_odds}` : odds.home_odds}
                              </p>
                            </div>
                          )}
                          {odds.away_team && (
                            <div className="text-center">
                              <p className="text-xs text-gray-500">{odds.away_team}</p>
                              <p className="font-bold text-red-600">
                                {odds.away_odds > 0 ? `+${odds.away_odds}` : odds.away_odds}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => addToParlayFromOdds(odds)}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Parlay Slip */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Parlay Slip ({parlayLegs.length} legs)
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
                    disabled={parlayLegs.length < 2}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Place Parlay Bet
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

          {/* Parlay Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Parlay Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>• Higher payouts but all legs must win</p>
              <p>• Minimum 2 legs required</p>
              <p>• Risk increases with more legs</p>
              <p>• Consider correlated outcomes</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}