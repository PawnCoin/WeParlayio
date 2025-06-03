import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useBetSlip } from "@/contexts/BetSlipContext";
import {
  TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, AlertCircle,
  Play, Target, Zap, Trophy, Calculator, BarChart3, Timer, Users,
  ArrowUp, ArrowDown, Lock, Unlock, Star, Crown, Flame, ShoppingCart,
  Plus, Minus, RotateCcw, Banknote, Coins, Wallet, CreditCard
} from "lucide-react";

interface BettingEvent {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: 'upcoming' | 'live' | 'completed';
  odds: {
    home: number;
    away: number;
    draw?: number;
  };
  markets: BettingMarket[];
  featured: boolean;
  liveScore?: {
    home: number;
    away: number;
    period: string;
    timeRemaining: string;
  };
}

interface BettingMarket {
  id: string;
  name: string;
  type: 'moneyline' | 'spread' | 'total' | 'prop';
  options: BettingOption[];
  description: string;
}

interface BettingOption {
  id: string;
  name: string;
  odds: number;
  line?: number; // For spreads and totals
  available: boolean;
  popular: boolean;
}

interface BetSlip {
  selections: BetSelection[];
  betType: 'single' | 'parlay' | 'system';
  totalStake: number;
  potentialPayout: number;
  totalOdds: number;
}

interface BetSelection {
  eventId: string;
  marketId: string;
  optionId: string;
  eventName: string;
  marketName: string;
  optionName: string;
  odds: number;
  line?: number;
  stake: number;
}

interface PlacedBet {
  id: string;
  userId: string;
  selections: BetSelection[];
  betType: string;
  totalStake: number;
  potentialPayout: number;
  status: 'pending' | 'won' | 'lost' | 'void' | 'cashed_out';
  placedAt: string;
  settledAt?: string;
  actualPayout?: number;
}

const CompleteBettingSystem: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { betSlip: contextBetSlip, addToBetSlip: contextAddToBetSlip, clearBetSlip } = useBetSlip();

  const [activeTab, setActiveTab] = useState('events');
  const [selectedSport, setSelectedSport] = useState('all');
  const [betSlip, setBetSlip] = useState<BetSlip>({
    selections: [],
    betType: 'single',
    totalStake: 0,
    potentialPayout: 0,
    totalOdds: 1
  });
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [quickBetAmount, setQuickBetAmount] = useState(10);

  // Fetch betting events with real-time updates
  const { data: events = [], isLoading: eventsLoading } = useQuery<BettingEvent[]>({
    queryKey: ['/api/betting/events', selectedSport],
    refetchInterval: 5000 // Real-time updates every 5 seconds
  });

  // Fetch user's betting history
  const { data: userBets = [], isLoading: betsLoading } = useQuery<PlacedBet[]>({
    queryKey: ['/api/betting/user-bets'],
    enabled: isAuthenticated
  });

  // Fetch user's account balance
  const { data: balance = 0 } = useQuery<number>({
    queryKey: ['/api/user/balance'],
    enabled: isAuthenticated
  });

  // Place bet mutation
  const placeBetMutation = useMutation({
    mutationFn: async (betData: BetSlip) => {
      const response = await fetch('/api/betting/place-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData)
      });
      if (!response.ok) throw new Error('Failed to place bet');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bet Placed Successfully!",
        description: `Your ${betSlip.betType} bet for $${betSlip.totalStake} has been placed. Potential payout: $${betSlip.potentialPayout}`,
      });
      setBetSlip({ selections: [], betType: 'single', totalStake: 0, potentialPayout: 0, totalOdds: 1 });
      setShowBetSlip(false);
      queryClient.invalidateQueries({ queryKey: ['/api/betting/user-bets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
    },
    onError: (error: any) => {
      toast({
        title: "Bet Failed",
        description: error.message || "Unable to place bet. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Add selection to bet slip - using shared context
  const addToBetSlip = (event: BettingEvent, market: BettingMarket, option: BettingOption) => {
    if (!option.available) {
      toast({
        title: "Selection Unavailable",
        description: "This betting option is currently unavailable",
        variant: "destructive",
      });
      return;
    }

    // Add to shared bet slip context so it appears in all bet slip components
    const bet = {
      eventId: event.id,
      gameTitle: `${event.homeTeam} vs ${event.awayTeam}`,
      pick: option.name,
      homeTeam: event.homeTeam,
      awayTeam: event.awayTeam,
      selection: option.name,
      odds: option.odds,
      betType: market.name,
      point: option.line,
      sport: event.sport,
      amount: quickBetAmount,
      potential: quickBetAmount * option.odds
    };

    contextAddToBetSlip(bet);

    // Also update local state for this component's bet slip
    const selection: BetSelection = {
      eventId: event.id,
      marketId: market.id,
      optionId: option.id,
      eventName: `${event.homeTeam} vs ${event.awayTeam}`,
      marketName: market.name,
      optionName: option.name,
      odds: option.odds,
      line: option.line,
      stake: quickBetAmount
    };

    setBetSlip(prev => {
      const existingIndex = prev.selections.findIndex(
        s => s.eventId === selection.eventId && s.marketId === selection.marketId
      );

      let newSelections;
      if (existingIndex >= 0) {
        newSelections = [...prev.selections];
        newSelections[existingIndex] = selection;
      } else {
        newSelections = [...prev.selections, selection];
      }

      const totalOdds = newSelections.reduce((acc, sel) => acc * sel.odds, 1);
      const totalStake = newSelections.reduce((acc, sel) => acc + sel.stake, 0);
      const potentialPayout = totalStake * totalOdds;

      return {
        ...prev,
        selections: newSelections,
        totalStake,
        potentialPayout,
        totalOdds
      };
    });

    setShowBetSlip(true);
  };

  // Remove selection from bet slip
  const removeFromBetSlip = (index: number) => {
    setBetSlip(prev => {
      const newSelections = prev.selections.filter((_, i) => i !== index);
      const totalOdds = newSelections.reduce((acc, sel) => acc * sel.odds, 1);
      const totalStake = newSelections.reduce((acc, sel) => acc + sel.stake, 0);
      const potentialPayout = totalStake * totalOdds;

      return {
        ...prev,
        selections: newSelections,
        totalStake,
        potentialPayout,
        totalOdds
      };
    });
  };

  // Update stake for a selection
  const updateStake = (index: number, newStake: number) => {
    setBetSlip(prev => {
      const newSelections = [...prev.selections];
      newSelections[index].stake = newStake;

      const totalStake = newSelections.reduce((acc, sel) => acc + sel.stake, 0);
      const totalOdds = newSelections.reduce((acc, sel) => acc * sel.odds, 1);
      const potentialPayout = totalStake * totalOdds;

      return {
        ...prev,
        selections: newSelections,
        totalStake,
        potentialPayout,
        totalOdds
      };
    });
  };

  // Place the bet
  const handlePlaceBet = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to place bets",
        variant: "destructive",
      });
      return;
    }

    if (betSlip.selections.length === 0) {
      toast({
        title: "No Selections",
        description: "Add selections to your bet slip first",
        variant: "destructive",
      });
      return;
    }

    if (betSlip.totalStake > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds for this bet",
        variant: "destructive",
      });
      return;
    }

    placeBetMutation.mutate(betSlip);
  };

  const formatOdds = (odds: number) => {
    if (odds >= 2) {
      return `+${((odds - 1) * 100).toFixed(0)}`;
    } else {
      return `-${(100 / (odds - 1)).toFixed(0)}`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'won':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Won</Badge>;
      case 'lost':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Lost</Badge>;
      case 'void':
        return <Badge variant="secondary">Void</Badge>;
      case 'cashed_out':
        return <Badge variant="outline">Cashed Out</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const sports = ['all', 'football', 'basketball', 'baseball', 'hockey', 'soccer', 'tennis'];

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Login to Start Betting</h2>
            <p className="text-muted-foreground">Access live odds and place bets on your favorite sports</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Complete Betting System</h1>
          <p className="text-muted-foreground">Professional sports betting with live odds</p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="font-semibold">${balance.toLocaleString()}</span>
            </div>
          </Card>
          <Button
            variant={showBetSlip ? "default" : "outline"}
            onClick={() => setShowBetSlip(!showBetSlip)}
            className="relative"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Bet Slip
            {betSlip.selections.length > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {betSlip.selections.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className={`${showBetSlip ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="events">Live Events</TabsTrigger>
              <TabsTrigger value="mybets">My Bets</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-4">
              {/* Sport Filter */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-2 flex-wrap">
                    {sports.map((sport) => (
                      <Button
                        key={sport}
                        variant={selectedSport === sport ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSport(sport)}
                        className="capitalize"
                      >
                        {sport}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Events List */}
              {eventsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="h-6 bg-gray-200 rounded mb-4"></div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="h-12 bg-gray-200 rounded"></div>
                            <div className="h-12 bg-gray-200 rounded"></div>
                            <div className="h-12 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <Card key={event.id} className={`${event.featured ? 'border-yellow-400' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {event.homeTeam} vs {event.awayTeam}
                              {event.featured && <Star className="h-4 w-4 inline ml-2 text-yellow-500" />}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {event.startTime}
                              <Badge variant="outline" className="capitalize">{event.sport}</Badge>
                              {event.status === 'live' && (
                                <Badge variant="destructive" className="animate-pulse">
                                  <Play className="h-3 w-3 mr-1" />
                                  LIVE
                                </Badge>
                              )}
                            </p>
                          </div>
                          {event.liveScore && (
                            <div className="text-right">
                              <div className="text-2xl font-bold">
                                {event.liveScore.home} - {event.liveScore.away}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {event.liveScore.period} • {event.liveScore.timeRemaining}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {event.markets.map((market) => (
                            <div key={market.id}>
                              <h4 className="font-semibold mb-2">{market.name}</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {market.options.map((option) => (
                                  <Button
                                    key={option.id}
                                    variant="outline"
                                    className={`h-auto p-3 flex flex-col ${!option.available ? 'opacity-50' : ''} ${option.popular ? 'border-blue-500' : ''}`}
                                    onClick={() => addToBetSlip(event, market, option)}
                                    disabled={!option.available}
                                  >
                                    <div className="font-medium">{option.name}</div>
                                    {option.line && (
                                      <div className="text-xs text-muted-foreground">
                                        {option.line > 0 ? '+' : ''}{option.line}
                                      </div>
                                    )}
                                    <div className="text-lg font-bold text-green-600">
                                      {formatOdds(option.odds)}
                                    </div>
                                    {option.popular && (
                                      <Badge size="sm" className="text-xs">Popular</Badge>
                                    )}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No events available for {selectedSport}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="mybets" className="space-y-4">
              {betsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : userBets.length > 0 ? (
                <div className="space-y-4">
                  {userBets.map((bet) => (
                    <Card key={bet.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg capitalize">{bet.betType} Bet</CardTitle>
                            <p className="text-sm text-muted-foreground">{bet.placedAt}</p>
                          </div>
                          {getStatusBadge(bet.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {bet.selections.map((selection, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div>
                                <p className="font-medium">{selection.eventName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {selection.marketName}: {selection.optionName}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">{formatOdds(selection.odds)}</div>
                                <div className="text-sm text-muted-foreground">${selection.stake}</div>
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div>
                              <p className="font-semibold">Total Stake: ${bet.totalStake}</p>
                              <p className="text-sm text-muted-foreground">
                                Potential Payout: ${bet.potentialPayout}
                              </p>
                            </div>
                            {bet.actualPayout && (
                              <div className="text-right">
                                <p className="font-bold text-lg text-green-600">
                                  ${bet.actualPayout}
                                </p>
                                <p className="text-sm text-muted-foreground">Actual Payout</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No bets placed yet</p>
                    <Button className="mt-4" onClick={() => setActiveTab('events')}>
                      Start Betting
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Win Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">78.5%</div>
                    <p className="text-sm text-muted-foreground">Last 30 days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Total Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">$2,450</div>
                    <p className="text-sm text-muted-foreground">All time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Best Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">12</div>
                    <p className="text-sm text-muted-foreground">Consecutive wins</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Bet Slip */}
        {showBetSlip && (
          <div className="xl:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Bet Slip
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowBetSlip(false)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {betSlip.selections.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Add selections to start betting</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Quick Bet Amount */}
                    <div>
                      <Label htmlFor="quick-amount">Quick Bet Amount</Label>
                      <div className="flex gap-2 mt-1">
                        {[10, 25, 50, 100].map((amount) => (
                          <Button
                            key={amount}
                            variant={quickBetAmount === amount ? "default" : "outline"}
                            size="sm"
                            onClick={() => setQuickBetAmount(amount)}
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Selections */}
                    <div className="space-y-3">
                      {betSlip.selections.map((selection, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{selection.eventName}</p>
                              <p className="text-xs text-muted-foreground">
                                {selection.marketName}: {selection.optionName}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromBetSlip(index)}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={selection.stake}
                                onChange={(e) => updateStake(index, parseFloat(e.target.value) || 0)}
                                className="w-20 h-8"
                                min="1"
                              />
                              <span className="text-sm font-bold">{formatOdds(selection.odds)}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Win: ${(selection.stake * selection.odds).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Total Stake:</span>
                        <span className="font-bold">${betSlip.totalStake.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Odds:</span>
                        <span className="font-bold">{betSlip.totalOdds.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span>Potential Payout:</span>
                        <span className="font-bold text-green-600">${betSlip.potentialPayout.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Place Bet Button */}
                    <Button
                      className="w-full"
                      onClick={handlePlaceBet}
                      disabled={placeBetMutation.isPending || betSlip.totalStake > balance}
                    >
                      {placeBetMutation.isPending ? (
                        "Placing Bet..."
                      ) : betSlip.totalStake > balance ? (
                        "Insufficient Balance"
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Place Bet - ${betSlip.totalStake.toFixed(2)}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setBetSlip({ selections: [], betType: 'single', totalStake: 0, potentialPayout: 0, totalOdds: 1 })}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteBettingSystem;