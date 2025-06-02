import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  Target, 
  Plus,
  X,
  Calculator,
  TrendingUp,
  Layers,
  Zap,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from 'lucide-react';

interface ParlayLeg {
  id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  market: string;
  selection: string;
  odds: number;
  point?: number;
  sport: string;
}

interface ParlayCalculation {
  totalOdds: number;
  americanOdds: number;
  impliedProbability: number;
  potentialPayout: number;
  profit: number;
}

export default function AdvancedParlayBuilder() {
  const [parlayLegs, setParlayLegs] = useState<ParlayLeg[]>([]);
  const [stake, setStake] = useState(25);
  const [selectedSport, setSelectedSport] = useState('all');
  const [parlayType, setParlayType] = useState('standard');

  // Fetch available games for parlay building
  const { data: availableGames, isLoading } = useQuery({
    queryKey: ['/api/parlay-games', selectedSport],
    refetchInterval: 30000,
  });

  // Calculate parlay odds and payouts
  const calculateParlay = (): ParlayCalculation => {
    if (parlayLegs.length === 0) {
      return {
        totalOdds: 1,
        americanOdds: 0,
        impliedProbability: 0,
        potentialPayout: 0,
        profit: 0
      };
    }

    // Convert American odds to decimal and multiply
    const decimalOdds = parlayLegs.map(leg => {
      if (leg.odds > 0) {
        return (leg.odds / 100) + 1;
      } else {
        return (100 / Math.abs(leg.odds)) + 1;
      }
    });

    const totalDecimalOdds = decimalOdds.reduce((acc, odds) => acc * odds, 1);
    
    // Convert back to American odds
    const americanOdds = totalDecimalOdds >= 2 
      ? Math.round((totalDecimalOdds - 1) * 100)
      : Math.round(-100 / (totalDecimalOdds - 1));

    const impliedProbability = (1 / totalDecimalOdds) * 100;
    const potentialPayout = stake * totalDecimalOdds;
    const profit = potentialPayout - stake;

    return {
      totalOdds: totalDecimalOdds,
      americanOdds,
      impliedProbability,
      potentialPayout,
      profit
    };
  };

  const addLegToParlay = (leg: ParlayLeg) => {
    // Check if this game/market combination already exists
    const exists = parlayLegs.some(existing => 
      existing.gameId === leg.gameId && existing.market === leg.market
    );

    if (exists) {
      // Replace existing leg for this game/market
      setParlayLegs(parlayLegs.map(existing => 
        existing.gameId === leg.gameId && existing.market === leg.market ? leg : existing
      ));
    } else {
      setParlayLegs([...parlayLegs, leg]);
    }
  };

  const removeLegFromParlay = (legId: string) => {
    setParlayLegs(parlayLegs.filter(leg => leg.id !== legId));
  };

  const clearParlay = () => {
    setParlayLegs([]);
  };

  const parlayCalculation = calculateParlay();

  // Mock available games data
  const mockGames = [
    {
      id: 'game_001',
      sport: 'NFL',
      homeTeam: 'Cowboys',
      awayTeam: 'Eagles',
      startTime: '2024-06-02T20:00:00Z',
      markets: {
        moneyline: { home: -120, away: 100 },
        spread: { home: -3.5, away: 3.5, odds: -110 },
        total: { over: -110, under: -110, points: 47.5 }
      }
    },
    {
      id: 'game_002',
      sport: 'NBA',
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      startTime: '2024-06-02T22:00:00Z',
      markets: {
        moneyline: { home: 110, away: -130 },
        spread: { home: 2.5, away: -2.5, odds: -110 },
        total: { over: -105, under: -115, points: 225.5 }
      }
    },
    {
      id: 'game_003',
      sport: 'MLB',
      homeTeam: 'Yankees',
      awayTeam: 'Red Sox',
      startTime: '2024-06-02T19:00:00Z',
      markets: {
        moneyline: { home: -140, away: 120 },
        runline: { home: -1.5, away: 1.5, odds: -110 },
        total: { over: -110, under: -110, points: 9.5 }
      }
    }
  ];

  const games = availableGames || mockGames;

  const getParlayRisk = () => {
    if (parlayLegs.length <= 2) return { level: 'low', color: 'text-green-600' };
    if (parlayLegs.length <= 4) return { level: 'medium', color: 'text-yellow-600' };
    return { level: 'high', color: 'text-red-600' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading parlay builder...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
          <Layers className="h-8 w-8 text-purple-500" />
          <span>Advanced Parlay Builder</span>
        </h1>
        <p className="text-gray-600">Build complex parlays with real-time odds calculation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Games */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="nfl">NFL</SelectItem>
                    <SelectItem value="nba">NBA</SelectItem>
                    <SelectItem value="mlb">MLB</SelectItem>
                    <SelectItem value="nhl">NHL</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={parlayType} onValueChange={setParlayType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Parlay</SelectItem>
                    <SelectItem value="round-robin">Round Robin</SelectItem>
                    <SelectItem value="teaser">Teaser</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Same Game Parlay
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Games List */}
          <div className="space-y-4">
            {games.map((game: any) => (
              <Card key={game.id} className="border-2 hover:border-purple-300 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {game.awayTeam} @ {game.homeTeam}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{game.sport}</Badge>
                      <span className="text-sm text-gray-600">
                        {new Date(game.startTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="moneyline" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="moneyline">Moneyline</TabsTrigger>
                      <TabsTrigger value="spread">Spread</TabsTrigger>
                      <TabsTrigger value="total">Total</TabsTrigger>
                    </TabsList>

                    <TabsContent value="moneyline" className="space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="p-3 h-auto hover:bg-purple-50"
                          onClick={() => addLegToParlay({
                            id: `${game.id}_ml_home`,
                            gameId: game.id,
                            homeTeam: game.homeTeam,
                            awayTeam: game.awayTeam,
                            market: 'moneyline',
                            selection: game.homeTeam,
                            odds: game.markets.moneyline.home,
                            sport: game.sport
                          })}
                        >
                          <div className="text-center">
                            <div className="font-medium text-sm">{game.homeTeam}</div>
                            <div className="font-bold">
                              {game.markets.moneyline.home > 0 ? '+' : ''}
                              {game.markets.moneyline.home}
                            </div>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="p-3 h-auto hover:bg-purple-50"
                          onClick={() => addLegToParlay({
                            id: `${game.id}_ml_away`,
                            gameId: game.id,
                            homeTeam: game.homeTeam,
                            awayTeam: game.awayTeam,
                            market: 'moneyline',
                            selection: game.awayTeam,
                            odds: game.markets.moneyline.away,
                            sport: game.sport
                          })}
                        >
                          <div className="text-center">
                            <div className="font-medium text-sm">{game.awayTeam}</div>
                            <div className="font-bold">
                              {game.markets.moneyline.away > 0 ? '+' : ''}
                              {game.markets.moneyline.away}
                            </div>
                          </div>
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="spread" className="space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="p-3 h-auto hover:bg-purple-50"
                          onClick={() => addLegToParlay({
                            id: `${game.id}_spread_home`,
                            gameId: game.id,
                            homeTeam: game.homeTeam,
                            awayTeam: game.awayTeam,
                            market: 'spread',
                            selection: `${game.homeTeam} ${game.markets.spread.home}`,
                            odds: game.markets.spread.odds,
                            point: game.markets.spread.home,
                            sport: game.sport
                          })}
                        >
                          <div className="text-center">
                            <div className="font-medium text-sm">{game.homeTeam}</div>
                            <div className="text-xs">
                              {game.markets.spread.home > 0 ? '+' : ''}{game.markets.spread.home}
                            </div>
                            <div className="font-bold">{game.markets.spread.odds}</div>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="p-3 h-auto hover:bg-purple-50"
                          onClick={() => addLegToParlay({
                            id: `${game.id}_spread_away`,
                            gameId: game.id,
                            homeTeam: game.homeTeam,
                            awayTeam: game.awayTeam,
                            market: 'spread',
                            selection: `${game.awayTeam} ${game.markets.spread.away}`,
                            odds: game.markets.spread.odds,
                            point: game.markets.spread.away,
                            sport: game.sport
                          })}
                        >
                          <div className="text-center">
                            <div className="font-medium text-sm">{game.awayTeam}</div>
                            <div className="text-xs">
                              {game.markets.spread.away > 0 ? '+' : ''}{game.markets.spread.away}
                            </div>
                            <div className="font-bold">{game.markets.spread.odds}</div>
                          </div>
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="total" className="space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="p-3 h-auto hover:bg-purple-50"
                          onClick={() => addLegToParlay({
                            id: `${game.id}_over`,
                            gameId: game.id,
                            homeTeam: game.homeTeam,
                            awayTeam: game.awayTeam,
                            market: 'total',
                            selection: `Over ${game.markets.total.points}`,
                            odds: game.markets.total.over,
                            point: game.markets.total.points,
                            sport: game.sport
                          })}
                        >
                          <div className="text-center">
                            <div className="font-medium text-sm">Over</div>
                            <div className="text-xs">{game.markets.total.points}</div>
                            <div className="font-bold">{game.markets.total.over}</div>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="p-3 h-auto hover:bg-purple-50"
                          onClick={() => addLegToParlay({
                            id: `${game.id}_under`,
                            gameId: game.id,
                            homeTeam: game.homeTeam,
                            awayTeam: game.awayTeam,
                            market: 'total',
                            selection: `Under ${game.markets.total.points}`,
                            odds: game.markets.total.under,
                            point: game.markets.total.points,
                            sport: game.sport
                          })}
                        >
                          <div className="text-center">
                            <div className="font-medium text-sm">Under</div>
                            <div className="text-xs">{game.markets.total.points}</div>
                            <div className="font-bold">{game.markets.total.under}</div>
                          </div>
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Parlay Builder */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Parlay Builder</span>
                </CardTitle>
                {parlayLegs.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearParlay}
                    className="text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {parlayLegs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Layers className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Add selections to build your parlay</p>
                  <p className="text-sm">Minimum 2 legs required</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Parlay Legs */}
                  <div className="space-y-2">
                    {parlayLegs.map((leg, index) => (
                      <div key={leg.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              Leg {index + 1}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {leg.sport}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLegFromParlay(leg.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">{leg.awayTeam} @ {leg.homeTeam}</p>
                          <p className="text-gray-600">{leg.selection}</p>
                          <p className="font-bold">
                            {leg.odds > 0 ? '+' : ''}{leg.odds}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stake Input */}
                  <div>
                    <Label htmlFor="stake">Stake Amount</Label>
                    <Input
                      id="stake"
                      type="number"
                      value={stake}
                      onChange={(e) => setStake(Number(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>

                  {/* Parlay Calculation */}
                  <div className="border rounded p-4 bg-gray-50">
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <Calculator className="h-4 w-4" />
                      <span>Parlay Calculation</span>
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Legs:</span>
                        <span className="font-medium">{parlayLegs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Combined Odds:</span>
                        <span className="font-medium">
                          {parlayCalculation.americanOdds > 0 ? '+' : ''}
                          {parlayCalculation.americanOdds}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Implied Probability:</span>
                        <span className="font-medium">
                          {parlayCalculation.impliedProbability.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stake:</span>
                        <span className="font-medium">{formatCurrency(stake)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Potential Payout:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(parlayCalculation.potentialPayout)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(parlayCalculation.profit)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div className={`border rounded p-3 ${getParlayRisk().level === 'high' ? 'border-red-200 bg-red-50' : getParlayRisk().level === 'medium' ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {getParlayRisk().level === 'high' ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : getParlayRisk().level === 'medium' ? (
                        <TrendingUp className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className={`font-medium text-sm ${getParlayRisk().color}`}>
                        {getParlayRisk().level.charAt(0).toUpperCase() + getParlayRisk().level.slice(1)} Risk Parlay
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {getParlayRisk().level === 'high' 
                        ? 'High-risk parlay with 5+ legs. Consider smaller parlays for better chances.'
                        : getParlayRisk().level === 'medium'
                        ? 'Medium-risk parlay. Good balance of risk and reward.'
                        : 'Low-risk parlay with good winning probability.'
                      }
                    </p>
                  </div>

                  {/* Place Bet Button */}
                  <Button 
                    className="w-full" 
                    disabled={parlayLegs.length < 2}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Place Parlay Bet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Parlay Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Today's Parlays:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>This Week's Win Rate:</span>
                <span className="font-medium text-green-600">65%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Biggest Payout:</span>
                <span className="font-medium">$1,250</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average Legs:</span>
                <span className="font-medium">3.2</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}