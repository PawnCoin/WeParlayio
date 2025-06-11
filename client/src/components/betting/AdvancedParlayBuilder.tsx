import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  AlertTriangle, 
  Calculator, 
  Target,
  Zap,
  Crown,
  X
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface Selection {
  id: string;
  eventId: string;
  type: 'moneyline' | 'spread' | 'total' | 'prop';
  selection: string;
  odds: number;
  line?: number;
  team?: string;
  player?: string;
  description: string;
  league: string;
  gameTime: string;
  correlationRisk?: 'high' | 'medium' | 'low';
}

interface ParlayData {
  id: string;
  selections: Selection[];
  totalOdds: number;
  legs: number;
  risk: 'high' | 'medium' | 'low';
  boost: number;
  maxPayout: number;
  expectedValue?: number;
  winProbability?: number;
}

interface AvailableBet {
  id: string;
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  gameTime: string;
  bets: {
    moneyline?: { home: number; away: number };
    spread?: { home: { line: number; odds: number }; away: { line: number; odds: number } };
    total?: { over: { line: number; odds: number }; under: { line: number; odds: number } };
    props?: Array<{ id: string; description: string; odds: number; line?: number }>;
  };
}

export default function AdvancedParlayBuilder() {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [betAmount, setBetAmount] = useState<string>("");
  const [includeBoosts, setIncludeBoosts] = useState(true);
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [activeTab, setActiveTab] = useState("builder");
  const { toast } = useToast();

  // Fetch available bets for parlay building
  const { data: availableBets, isLoading } = useQuery({
    queryKey: ['/api/sports'],
    refetchInterval: 30000,
  });

  // Build parlay calculation
  const { data: parlayData, refetch: calculateParlay } = useQuery({
    queryKey: ['/api/parlay/build', selections],
    enabled: selections.length >= 2,
    queryFn: async () => {
      const response = await fetch('/api/parlay/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selections })
      });
      if (!response.ok) throw new Error('Failed to build parlay');
      return response.json();
    }
  });

  // Place parlay bet mutation
  const placeParlayMutation = useMutation({
    mutationFn: async (parlayBet: any) => {
      const response = await fetch('/api/user/place-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'dev-user-001'
        },
        body: JSON.stringify(parlayBet)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to place parlay');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Parlay Placed!",
        description: `${selections.length}-leg parlay placed for $${betAmount}`,
      });
      setSelections([]);
      setBetAmount("");
      queryClient.invalidateQueries({ queryKey: ['/api/user/bets'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Parlay Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addSelection = (bet: any, betType: string, selection: any) => {
    const newSelection: Selection = {
      id: `${bet.id}-${betType}-${Date.now()}`,
      eventId: bet.id,
      type: betType as any,
      selection: selection.description || `${selection.team || selection.side}`,
      odds: selection.odds,
      line: selection.line,
      team: selection.team,
      player: selection.player,
      description: `${bet.homeTeam} vs ${bet.awayTeam} - ${selection.description || selection.side}`,
      league: bet.league,
      gameTime: bet.gameTime,
      correlationRisk: calculateCorrelationRisk(selections, bet.id, betType)
    };

    // Check for same-game correlations
    const sameGameSelections = selections.filter(s => s.eventId === bet.id);
    if (sameGameSelections.length > 0) {
      toast({
        title: "Same Game Correlation Detected",
        description: "These bets may be correlated. Consider the increased risk.",
        variant: "destructive",
      });
    }

    setSelections([...selections, newSelection]);
  };

  const removeSelection = (selectionId: string) => {
    setSelections(selections.filter(s => s.id !== selectionId));
  };

  const calculateCorrelationRisk = (currentSelections: Selection[], eventId: string, betType: string): 'high' | 'medium' | 'low' => {
    const sameGameCount = currentSelections.filter(s => s.eventId === eventId).length;
    if (sameGameCount >= 2) return 'high';
    if (sameGameCount === 1) return 'medium';
    return 'low';
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const calculatePotentialPayout = () => {
    if (!betAmount || !parlayData) return 0;
    const amount = parseFloat(betAmount);
    const odds = parlayData.totalOdds;
    return amount * (odds > 0 ? odds / 100 + 1 : 100 / Math.abs(odds) + 1);
  };

  const handlePlaceParlay = () => {
    if (!betAmount || selections.length < 2) return;

    const parlayBet = {
      eventId: 'parlay',
      betType: 'parlay',
      amount: parseFloat(betAmount),
      selections: selections.map(s => s.selection),
      currency: "USD",
      totalOdds: parlayData?.totalOdds || 0,
      potentialPayout: calculatePotentialPayout(),
      parlayData: {
        legs: selections.length,
        selections,
        boost: parlayData?.boost || 0
      }
    };

    placeParlayMutation.mutate(parlayBet);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Calculator className="h-6 w-6 animate-spin mr-2" />
        <span>Loading available bets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-blue-500" />
        <h2 className="text-2xl font-bold">Advanced Parlay Builder</h2>
        <Badge variant="secondary">Professional Tools</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Parlay Builder</TabsTrigger>
          <TabsTrigger value="suggestions">Smart Suggestions</TabsTrigger>
          <TabsTrigger value="calculator">Risk Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Available Bets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Available Bets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {availableBets?.slice(0, 10).map((bet: AvailableBet) => (
                  <div key={bet.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{bet.homeTeam} vs {bet.awayTeam}</h4>
                        <p className="text-sm text-muted-foreground">{bet.league} • {bet.gameTime}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Moneyline */}
                      {bet.bets.moneyline && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addSelection(bet, 'moneyline', {
                              side: bet.homeTeam,
                              odds: bet.bets.moneyline!.home,
                              description: `${bet.homeTeam} ML`
                            })}
                          >
                            {bet.homeTeam} {formatOdds(bet.bets.moneyline.home)}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addSelection(bet, 'moneyline', {
                              side: bet.awayTeam,
                              odds: bet.bets.moneyline!.away,
                              description: `${bet.awayTeam} ML`
                            })}
                          >
                            {bet.awayTeam} {formatOdds(bet.bets.moneyline.away)}
                          </Button>
                        </div>
                      )}

                      {/* Spread */}
                      {bet.bets.spread && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addSelection(bet, 'spread', {
                              side: `${bet.homeTeam} ${bet.bets.spread!.home.line}`,
                              odds: bet.bets.spread!.home.odds,
                              line: bet.bets.spread!.home.line,
                              description: `${bet.homeTeam} ${bet.bets.spread!.home.line}`
                            })}
                          >
                            {bet.homeTeam} {bet.bets.spread.home.line > 0 ? '+' : ''}{bet.bets.spread.home.line}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addSelection(bet, 'spread', {
                              side: `${bet.awayTeam} ${bet.bets.spread!.away.line}`,
                              odds: bet.bets.spread!.away.odds,
                              line: bet.bets.spread!.away.line,
                              description: `${bet.awayTeam} ${bet.bets.spread!.away.line}`
                            })}
                          >
                            {bet.awayTeam} {bet.bets.spread.away.line > 0 ? '+' : ''}{bet.bets.spread.away.line}
                          </Button>
                        </div>
                      )}

                      {/* Total */}
                      {bet.bets.total && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addSelection(bet, 'total', {
                              side: 'Over',
                              odds: bet.bets.total!.over.odds,
                              line: bet.bets.total!.over.line,
                              description: `Over ${bet.bets.total!.over.line}`
                            })}
                          >
                            Over {bet.bets.total.over.line}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addSelection(bet, 'total', {
                              side: 'Under',
                              odds: bet.bets.total!.under.odds,
                              line: bet.bets.total!.under.line,
                              description: `Under ${bet.bets.total!.under.line}`
                            })}
                          >
                            Under {bet.bets.total.under.line}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Parlay Slip */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Parlay Slip
                  {selections.length > 0 && (
                    <Badge variant="default">{selections.length} legs</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Add 2+ selections to build a parlay</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selections.map((selection, index) => (
                        <div key={selection.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                Leg {index + 1}
                              </Badge>
                              {selection.correlationRisk === 'high' && (
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                            <p className="font-medium text-sm">{selection.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {selection.league} • {formatOdds(selection.odds)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSelection(selection.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {parlayData && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Parlay Odds:</span>
                          <span className="text-lg font-bold">
                            {formatOdds(parlayData.totalOdds)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span>Risk Level:</span>
                          <Badge variant={parlayData.risk === 'high' ? 'destructive' : parlayData.risk === 'medium' ? 'secondary' : 'default'}>
                            {parlayData.risk.toUpperCase()}
                          </Badge>
                        </div>

                        {parlayData.boost > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1">
                              <Zap className="h-4 w-4 text-yellow-500" />
                              Parlay Boost:
                            </span>
                            <span className="text-green-500 font-semibold">+{parlayData.boost}%</span>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="parlay-amount">Bet Amount ($)</Label>
                          <Input
                            id="parlay-amount"
                            type="number"
                            placeholder="Enter amount"
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            min="1"
                            step="0.01"
                          />
                        </div>

                        {betAmount && (
                          <div className="p-3 bg-muted rounded-lg space-y-2">
                            <div className="flex justify-between">
                              <span>Potential Payout:</span>
                              <span className="font-bold text-green-600">
                                ${calculatePotentialPayout().toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Potential Profit:</span>
                              <span className="font-bold">
                                ${(calculatePotentialPayout() - parseFloat(betAmount || '0')).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}

                        <Button 
                          onClick={handlePlaceParlay}
                          disabled={!betAmount || placeParlayMutation.isPending}
                          className="w-full"
                          size="lg"
                        >
                          {placeParlayMutation.isPending ? 'Placing Parlay...' : `Place ${selections.length}-Leg Parlay`}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Smart Parlay Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Popular Same-Game Parlay</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Chiefs ML + Over 54.5 + Mahomes 2+ TD
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">+650 odds</Badge>
                    <Button size="sm">Add to Slip</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Value Parlay</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    3 underdogs with positive expected value
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">+1250 odds</Badge>
                    <Button size="sm">Add to Slip</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Conservative Parlay</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    4 heavy favorites for safer returns
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">+280 odds</Badge>
                    <Button size="sm">Add to Slip</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Parlay Risk Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Risk Tolerance</Label>
                  <div className="flex gap-2">
                    {(['conservative', 'moderate', 'aggressive'] as const).map((level) => (
                      <Button
                        key={level}
                        variant={riskTolerance === level ? 'default' : 'outline'}
                        onClick={() => setRiskTolerance(level)}
                        className="capitalize"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-boosts"
                    checked={includeBoosts}
                    onCheckedChange={setIncludeBoosts}
                  />
                  <Label htmlFor="include-boosts">Include parlay boosts</Label>
                </div>

                {selections.length >= 2 && parlayData && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold">Risk Analysis</h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Win Probability:</span>
                        <div className="font-semibold">
                          {Math.max(5, Math.round((1 / (selections.length * 2.5)) * 100))}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expected Value:</span>
                        <div className={`font-semibold ${parlayData.risk === 'high' ? 'text-red-500' : 'text-green-500'}`}>
                          {parlayData.risk === 'high' ? '-5.2%' : '+2.8%'}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Correlation Risk:</span>
                        <div className={`font-semibold ${getRiskColor(parlayData.risk)}`}>
                          {parlayData.risk.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Payout:</span>
                        <div className="font-semibold">
                          ${parlayData.maxPayout.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {parlayData.risk === 'high' && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-red-800">High Risk Detected</p>
                          <p className="text-red-700">
                            Multiple selections from the same game may be correlated, reducing your actual win probability.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}