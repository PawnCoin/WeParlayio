import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  AlertCircle, 
  Zap, 
  Calculator,
  DollarSign,
  RefreshCw,
  Target,
  Timer
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ArbitrageOpportunity {
  id: string;
  event: string;
  type: 'moneyline' | 'spread' | 'total';
  book1: {
    name: string;
    side: string;
    odds: number;
  };
  book2: {
    name: string;
    side: string;
    odds: number;
  };
  profit: number; // Percentage profit
  stake1: number;
  stake2: number;
  totalStake: number;
  guarantee: number;
  timeRemaining?: string;
}

interface OddsComparison {
  event: string;
  type: string;
  books: Array<{
    name: string;
    odds: number;
    line?: number;
    lastUpdated: string;
  }>;
  bestOdds: {
    book: string;
    odds: number;
  };
  worstOdds: {
    book: string;
    odds: number;
  };
  spread: number;
}

export default function ArbitrageDetector() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<ArbitrageOpportunity | null>(null);
  const [totalStake, setTotalStake] = useState<string>("1000");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch arbitrage opportunities
  const { data: opportunities, isLoading, refetch } = useQuery({
    queryKey: ['/api/arbitrage/opportunities'],
    refetchInterval: autoRefresh ? 5000 : false, // Refresh every 5 seconds
  });

  // Fetch real-time odds comparison
  const { data: oddsComparison } = useQuery({
    queryKey: ['/api/odds/comparison'],
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
        refetch();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetch]);

  const calculateStakes = (opportunity: ArbitrageOpportunity, stake: number) => {
    const odds1 = opportunity.book1.odds;
    const odds2 = opportunity.book2.odds;
    
    // Convert to decimal odds
    const decimal1 = odds1 > 0 ? (odds1 / 100) + 1 : (100 / Math.abs(odds1)) + 1;
    const decimal2 = odds2 > 0 ? (odds2 / 100) + 1 : (100 / Math.abs(odds2)) + 1;
    
    // Calculate stakes for guaranteed profit
    const stake1 = stake / (1 + (decimal1 / decimal2));
    const stake2 = stake - stake1;
    
    const payout1 = stake1 * decimal1;
    const payout2 = stake2 * decimal2;
    const profit = Math.min(payout1, payout2) - stake;
    
    return {
      stake1: Math.round(stake1 * 100) / 100,
      stake2: Math.round(stake2 * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      profitPercentage: Math.round((profit / stake) * 10000) / 100
    };
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const getTimeColor = (timeRemaining?: string) => {
    if (!timeRemaining) return 'text-muted-foreground';
    const minutes = parseInt(timeRemaining.split('m')[0]);
    if (minutes < 5) return 'text-red-500';
    if (minutes < 15) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Scanning for arbitrage opportunities...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-500" />
          <h2 className="text-2xl font-bold">Arbitrage Detector</h2>
          <Badge variant="secondary">Professional Tools</Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Arbitrage Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Live Arbitrage Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {opportunities && opportunities.length > 0 ? (
              opportunities.map((opportunity: ArbitrageOpportunity) => (
                <div 
                  key={opportunity.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedOpportunity?.id === opportunity.id ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedOpportunity(opportunity)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{opportunity.event}</h4>
                      <p className="text-sm text-muted-foreground capitalize">{opportunity.type}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="bg-green-600">
                        {opportunity.profit}% profit
                      </Badge>
                      {opportunity.timeRemaining && (
                        <p className={`text-xs mt-1 ${getTimeColor(opportunity.timeRemaining)}`}>
                          {opportunity.timeRemaining} remaining
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="font-semibold text-sm">{opportunity.book1.name}</p>
                      <p className="text-sm">{opportunity.book1.side}</p>
                      <p className="font-bold">{formatOdds(opportunity.book1.odds)}</p>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <p className="font-semibold text-sm">{opportunity.book2.name}</p>
                      <p className="text-sm">{opportunity.book2.side}</p>
                      <p className="font-bold">{formatOdds(opportunity.book2.odds)}</p>
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <p className="text-xs text-muted-foreground">
                      Guaranteed profit: ${opportunity.guarantee.toFixed(2)} on ${opportunity.totalStake} stake
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No arbitrage opportunities detected</p>
                <p className="text-sm">Opportunities appear when odds differ significantly across books</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Arbitrage Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Arbitrage Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedOpportunity ? (
              <>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="total-stake">Total Stake ($)</Label>
                    <Input
                      id="total-stake"
                      type="number"
                      value={totalStake}
                      onChange={(e) => setTotalStake(e.target.value)}
                      placeholder="1000"
                      min="1"
                    />
                  </div>

                  {totalStake && (
                    <div className="space-y-4">
                      <Separator />
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold">Betting Distribution</h4>
                        
                        {(() => {
                          const stakes = calculateStakes(selectedOpportunity, parseFloat(totalStake));
                          return (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <p className="font-semibold text-sm">{selectedOpportunity.book1.name}</p>
                                  <p className="text-sm text-muted-foreground">{selectedOpportunity.book1.side}</p>
                                  <p className="font-bold text-lg">${stakes.stake1}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatOdds(selectedOpportunity.book1.odds)}
                                  </p>
                                </div>
                                
                                <div className="p-3 bg-red-50 rounded-lg">
                                  <p className="font-semibold text-sm">{selectedOpportunity.book2.name}</p>
                                  <p className="text-sm text-muted-foreground">{selectedOpportunity.book2.side}</p>
                                  <p className="font-bold text-lg">${stakes.stake2}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatOdds(selectedOpportunity.book2.odds)}
                                  </p>
                                </div>
                              </div>

                              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold">Guaranteed Profit:</span>
                                  <span className="text-green-600 font-bold text-lg">
                                    ${stakes.profit} ({stakes.profitPercentage}%)
                                  </span>
                                </div>
                                <p className="text-sm text-green-700 mt-1">
                                  Profit regardless of outcome
                                </p>
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Total Investment:</span>
                                  <span className="font-semibold">${totalStake}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Minimum Payout:</span>
                                  <span className="font-semibold">
                                    ${(parseFloat(totalStake) + stakes.profit).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>ROI:</span>
                                  <span className="font-semibold text-green-600">
                                    {stakes.profitPercentage}%
                                  </span>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      <Button className="w-full" size="lg">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Execute Arbitrage
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an arbitrage opportunity to calculate stakes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Real-time Odds Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Real-Time Odds Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {oddsComparison?.map((comparison: OddsComparison, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="font-semibold">{comparison.event}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{comparison.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Spread: {comparison.spread}%</p>
                    <Badge variant={comparison.spread > 3 ? 'default' : 'secondary'}>
                      {comparison.spread > 3 ? 'High variance' : 'Low variance'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {comparison.books.map((book, bookIndex) => (
                    <div 
                      key={bookIndex}
                      className={`p-2 rounded text-center ${
                        book.name === comparison.bestOdds.book 
                          ? 'bg-green-50 border border-green-200' 
                          : book.name === comparison.worstOdds.book
                          ? 'bg-red-50 border border-red-200'
                          : 'bg-muted/50'
                      }`}
                    >
                      <p className="font-semibold text-sm">{book.name}</p>
                      <p className="font-bold">{formatOdds(book.odds)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(book.lastUpdated).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Loading odds comparison data...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}