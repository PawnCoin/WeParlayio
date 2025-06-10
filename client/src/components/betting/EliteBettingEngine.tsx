import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  BarChart3, 
  Calculator,
  Clock,
  AlertTriangle,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface LiveOdds {
  id: string;
  event: string;
  market: string;
  selection: string;
  odds: number;
  impliedProbability: number;
  lastUpdate: string;
  movement: 'up' | 'down' | 'stable';
  volume: number;
  isSharp: boolean;
}

interface ParlayLeg {
  id: string;
  event: string;
  selection: string;
  odds: number;
  stake?: number;
}

interface ArbitrageOpportunity {
  event: string;
  bookmaker1: string;
  bookmaker2: string;
  odds1: number;
  odds2: number;
  profit: number;
  stake1: number;
  stake2: number;
  roi: number;
}

interface BettingAnalytics {
  totalBets: number;
  winRate: number;
  roi: number;
  profit: number;
  avgOdds: number;
  sharpness: number;
  bestSport: string;
  recentPerformance: Array<{
    date: string;
    result: 'win' | 'loss';
    profit: number;
  }>;
}

export default function EliteBettingEngine() {
  const [activeTab, setActiveTab] = useState('live-betting');
  const [selectedSport, setSelectedSport] = useState('all');
  const [betSize, setBetSize] = useState('100');
  const [parlayLegs, setParlayLegs] = useState<ParlayLeg[]>([]);
  const [bankrollMode, setBankrollMode] = useState('kelly');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Live odds with real-time updates
  const { data: liveOdds = [], isLoading: oddsLoading } = useQuery({
    queryKey: ['/api/elite/live-odds', selectedSport],
    refetchInterval: 1000, // 1 second for elite speed
  });

  // Professional analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<BettingAnalytics>({
    queryKey: ['/api/elite/analytics'],
    refetchInterval: 30000,
  });

  // Arbitrage opportunities
  const { data: arbitrageOpps = [], isLoading: arbLoading } = useQuery<ArbitrageOpportunity[]>({
    queryKey: ['/api/elite/arbitrage'],
    refetchInterval: 5000, // 5 seconds for arb hunting
  });

  // Kelly Criterion calculator
  const calculateKellyBet = (odds: number, winProbability: number, bankroll: number) => {
    const decimalOdds = Math.abs(odds) / 100 + 1;
    const kelly = (winProbability * decimalOdds - 1) / (decimalOdds - 1);
    return Math.max(0, Math.min(0.25, kelly)) * bankroll; // Cap at 25% of bankroll
  };

  // Place elite bet with advanced features
  const placeBetMutation = useMutation({
    mutationFn: async (betData: any) => {
      return apiRequest('POST', '/api/elite/place-bet', betData);
    },
    onSuccess: (data) => {
      toast({
        title: "Elite Bet Placed",
        description: `Bet placed with ${data.confidence}% confidence rating`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/elite/analytics'] });
    },
    onError: (error: any) => {
      toast({
        title: "Bet Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Elite Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Elite Betting Engine
          </h1>
          <p className="text-slate-400 mt-2">Professional-grade betting tools for serious bettors</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-amber-400 border-amber-400">
            <Zap className="w-3 h-3 mr-1" />
            Real-Time
          </Badge>
          <Badge variant="outline" className="text-green-400 border-green-400">
            <Target className="w-3 h-3 mr-1" />
            Pro Tools
          </Badge>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <BarChart3 className="w-5 h-5 mr-2 text-amber-400" />
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{analytics.winRate.toFixed(1)}%</div>
                <div className="text-sm text-slate-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{analytics.roi.toFixed(1)}%</div>
                <div className="text-sm text-slate-400">ROI</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">${analytics.profit.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{analytics.totalBets}</div>
                <div className="text-sm text-slate-400">Total Bets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{analytics.avgOdds > 0 ? '+' : ''}{analytics.avgOdds}</div>
                <div className="text-sm text-slate-400">Avg Odds</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{analytics.sharpness.toFixed(0)}</div>
                <div className="text-sm text-slate-400">Sharpness</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Betting Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="live-betting" className="text-white">Live In-Game</TabsTrigger>
          <TabsTrigger value="parlay-builder" className="text-white">Advanced Parlays</TabsTrigger>
          <TabsTrigger value="arbitrage" className="text-white">Arbitrage Hunter</TabsTrigger>
          <TabsTrigger value="bankroll" className="text-white">Bankroll Management</TabsTrigger>
        </TabsList>

        {/* Live In-Game Betting */}
        <TabsContent value="live-betting" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="nfl">NFL</SelectItem>
                <SelectItem value="nba">NBA</SelectItem>
                <SelectItem value="mlb">MLB</SelectItem>
                <SelectItem value="nhl">NHL</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-green-400 border-green-400">
              <Clock className="w-3 h-3 mr-1" />
              Live Updates
            </Badge>
          </div>

          <div className="grid gap-4">
            {liveOdds.map((odd: LiveOdds) => (
              <Card key={odd.id} className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-white">{odd.event}</div>
                      <div className="text-sm text-slate-400">{odd.market} - {odd.selection}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {odd.impliedProbability.toFixed(1)}% Implied
                        </Badge>
                        {odd.isSharp && (
                          <Badge variant="outline" className="text-amber-400 border-amber-400 text-xs">
                            Sharp Line
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">
                          {odd.odds > 0 ? '+' : ''}{odd.odds}
                        </span>
                        {odd.movement === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                        {odd.movement === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                      </div>
                      <div className="text-xs text-slate-400">
                        Vol: {odd.volume.toLocaleString()}
                      </div>
                      <Button 
                        size="sm" 
                        className="mt-2 bg-amber-600 hover:bg-amber-700"
                        onClick={() => placeBetMutation.mutate({
                          oddId: odd.id,
                          stake: parseFloat(betSize),
                          type: 'live'
                        })}
                      >
                        Bet ${betSize}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Advanced Parlay Builder */}
        <TabsContent value="parlay-builder" className="space-y-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Advanced Parlay Constructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parlayLegs.map((leg, index) => (
                  <div key={leg.id} className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg">
                    <span className="text-white font-medium">Leg {index + 1}:</span>
                    <span className="text-slate-300">{leg.event} - {leg.selection}</span>
                    <span className="text-amber-400 font-bold">{leg.odds > 0 ? '+' : ''}{leg.odds}</span>
                    <Button size="sm" variant="destructive" onClick={() => {
                      setParlayLegs(legs => legs.filter(l => l.id !== leg.id));
                    }}>
                      Remove
                    </Button>
                  </div>
                ))}
                
                {parlayLegs.length > 1 && (
                  <div className="border-t border-slate-600 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">
                        {parlayLegs.length}-Leg Parlay
                      </span>
                      <span className="text-2xl font-bold text-green-400">
                        +{parlayLegs.reduce((acc, leg) => acc * (Math.abs(leg.odds) / 100 + 1), 1).toFixed(0)}
                      </span>
                    </div>
                    <Button className="w-full mt-3 bg-green-600 hover:bg-green-700">
                      Place Parlay Bet
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Arbitrage Hunter */}
        <TabsContent value="arbitrage" className="space-y-4">
          <div className="grid gap-4">
            {arbitrageOpps.map((arb, index) => (
              <Card key={index} className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{arb.event}</div>
                      <div className="text-sm text-slate-400">
                        {arb.bookmaker1} vs {arb.bookmaker2}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-white">
                          Bet ${arb.stake1} @ {arb.odds1} on {arb.bookmaker1}
                        </span>
                        <span className="text-white">
                          Bet ${arb.stake2} @ {arb.odds2} on {arb.bookmaker2}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">
                        +${arb.profit.toFixed(2)}
                      </div>
                      <div className="text-sm text-green-300">
                        {arb.roi.toFixed(2)}% ROI
                      </div>
                      <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                        Execute Arb
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Bankroll Management */}
        <TabsContent value="bankroll" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-amber-400" />
                  Kelly Criterion Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Win Probability (%)</label>
                  <Input type="number" className="bg-slate-800 border-slate-600 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Odds</label>
                  <Input type="number" className="bg-slate-800 border-slate-600 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Bankroll</label>
                  <Input type="number" className="bg-slate-800 border-slate-600 text-white" />
                </div>
                <Button className="w-full bg-amber-600 hover:bg-amber-700">
                  Calculate Optimal Bet
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                  Risk Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Daily Risk Limit</span>
                  <span className="text-white font-bold">$500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Current Risk</span>
                  <span className="text-green-400 font-bold">$125</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Available Risk</span>
                  <span className="text-amber-400 font-bold">$375</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Bet Input */}
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="number"
                value={betSize}
                onChange={(e) => setBetSize(e.target.value)}
                placeholder="Bet amount"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <Select value={bankrollMode} onValueChange={setBankrollMode}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Bet Sizing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kelly">Kelly Criterion</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="percentage">% of Bankroll</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-amber-600 hover:bg-amber-700">
              Set Default
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}