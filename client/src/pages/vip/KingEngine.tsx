import { useState } from "react";
import { KingVipTool } from "@/kingEngine/KingVipTool";
import { useTodayGames } from "@/hooks/useTodayGames";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Crown, Brain, Sparkles, TrendingUp, Target, ArrowLeft, Shield, DollarSign, Trash2, CheckCircle, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

interface ParlayLeg {
  id: string;
  sport: string;
  team: string;
  opponent: string;
  spread: number;
  odds: number;
  edgeScore: number;
  type: string;
}

export default function KingEngine() {
  const { games, loading, error } = useTodayGames();
  const [parlayLegs, setParlayLegs] = useState<ParlayLeg[]>([]);
  const [betAmount, setBetAmount] = useState<number>(10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToParlay = (leg: ParlayLeg) => {
    setParlayLegs(prev => {
      const exists = prev.find(l => l.id === leg.id);
      if (exists) {
        toast({ title: "Already Added", description: `${leg.team} is already in your parlay`, variant: "destructive" });
        return prev;
      }
      const sameGame = prev.find(l => l.team === leg.opponent || l.opponent === leg.team);
      if (sameGame) {
        toast({ title: "Same Game Conflict", description: "You can't pick both sides of the same game", variant: "destructive" });
        return prev;
      }
      toast({ title: "Added to Parlay", description: `${leg.team} (Edge: ${leg.edgeScore.toFixed(1)}) added` });
      return [...prev, leg];
    });
  };

  const removeLeg = (legId: string) => {
    setParlayLegs(prev => prev.filter(l => l.id !== legId));
  };

  const clearParlay = () => {
    setParlayLegs([]);
  };

  const calculateParlayOdds = () => {
    if (parlayLegs.length === 0) return { decimal: 0, american: 0, payout: 0, profit: 0 };
    let totalDecimal = 1;
    parlayLegs.forEach(leg => {
      const decimal = leg.odds > 0 ? (leg.odds / 100) + 1 : (100 / Math.abs(leg.odds)) + 1;
      totalDecimal *= decimal;
    });
    const payout = betAmount * totalDecimal;
    const profit = payout - betAmount;
    let american = 0;
    if (totalDecimal > 1) {
      american = totalDecimal >= 2 ? Math.round((totalDecimal - 1) * 100) : Math.round(-100 / (totalDecimal - 1));
    }
    if (!isFinite(american)) american = 0;
    return { decimal: totalDecimal, american, payout, profit };
  };

  const parlayStats = calculateParlayOdds();

  const placeParlayMutation = useMutation({
    mutationFn: async (parlayData: any) => {
      return apiRequest("POST", "/api/bets/parlay", parlayData);
    },
    onSuccess: () => {
      toast({ title: "Parlay Placed!", description: `Successfully placed ${parlayLegs.length}-leg parlay for $${betAmount}` });
      setParlayLegs([]);
      setBetAmount(10);
      queryClient.invalidateQueries({ queryKey: ["/api/user/bets"] });
    },
    onError: (error: any) => {
      toast({ title: "Bet Failed", description: error.message || "Failed to place parlay bet", variant: "destructive" });
    },
  });

  const placeParlayBet = () => {
    if (parlayLegs.length < 2) {
      toast({ title: "Need More Picks", description: "Add at least 2 picks to build a parlay", variant: "destructive" });
      return;
    }
    placeParlayMutation.mutate({
      legs: parlayLegs,
      betAmount,
      totalOdds: parlayStats.decimal,
      potentialPayout: parlayStats.payout,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-yellow-500/10 to-transparent blur-3xl" />

        <div className="relative container mx-auto px-4 py-8">
          <Link href="/vip">
            <Button variant="ghost" className="text-gray-400 hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to VIP Dashboard
            </Button>
          </Link>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 blur-xl opacity-60 animate-pulse" />
                <div className="relative bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-5 rounded-2xl shadow-2xl">
                  <Crown className="w-12 h-12 text-black" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent mb-3">
              King VIP Engine
            </h1>

            <div className="flex items-center justify-center gap-3 mb-4">
              <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold px-4 py-2">
                <Sparkles className="w-4 h-4 mr-1" />
                FLAGSHIP PARLAY BUILDER
              </Badge>
              <Badge variant="outline" className="border-amber-400/50 text-amber-300 px-4 py-2">
                <Brain className="w-4 h-4 mr-1" />
                26-Point Analysis
              </Badge>
            </div>

            <p className="text-xl text-amber-200/70 max-w-2xl mx-auto mb-6">
              AI-powered parlay builder with edge scoring. Pick your plays from analyzed games
              or use auto-generated optimal parlays. Build, customize, and place — all in one.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-black/40 border border-amber-500/20 rounded-full px-4 py-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Risk-Adjusted Sizing</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-amber-500/20 rounded-full px-4 py-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">Smart Parlay Builder</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-amber-500/20 rounded-full px-4 py-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">No Duplicate Teams</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 border border-amber-500/20 rounded-full px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-gray-300">Live Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Card className="bg-gray-800/50 border-amber-500/30">
              <CardContent className="flex items-center gap-4 p-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-400 blur-lg opacity-30 animate-pulse" />
                  <Loader2 className="w-8 h-8 animate-spin text-amber-400 relative" />
                </div>
                <div>
                  <p className="text-amber-200 font-semibold">Loading King Engine...</p>
                  <p className="text-gray-400 text-sm">Fetching live odds and game data</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <Card className="bg-red-900/20 border-red-500/50 max-w-md">
              <CardContent className="flex items-center gap-4 p-8">
                <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-300 font-semibold">Error Loading Games</p>
                  <p className="text-red-400/70 text-sm">{error.message}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {games.length > 0 && (
              <div className="flex items-center justify-center mb-6">
                <Badge variant="outline" className="border-green-500/50 text-green-400 px-4 py-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" />
                  {games.length} Live Games Loaded
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <KingVipTool games={games} onAddToParlay={addToParlay} />
              </div>

              <div className="xl:col-span-1">
                <div className="sticky top-4 space-y-4">
                  <Card className="bg-gradient-to-br from-amber-900/30 to-gray-900 border-amber-500/40 shadow-xl shadow-amber-500/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-amber-200">
                        <Calculator className="w-5 h-5 text-amber-400" />
                        Parlay Slip
                        {parlayLegs.length > 0 && (
                          <Badge className="ml-auto bg-amber-500/20 text-amber-300 border-amber-500/50">
                            {parlayLegs.length} {parlayLegs.length === 1 ? 'leg' : 'legs'}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {parlayLegs.length === 0 ? (
                        <div className="text-center py-8">
                          <Target className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                          <p className="text-gray-400 text-sm mb-1">Your parlay slip is empty</p>
                          <p className="text-gray-500 text-xs">Click the + button next to any pick below to add it here</p>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                            {parlayLegs.map((leg) => (
                              <div key={leg.id} className="bg-black/40 border border-gray-700/50 rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="secondary" className="text-xs shrink-0">{leg.sport}</Badge>
                                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 text-xs shrink-0">
                                        Edge: {leg.edgeScore.toFixed(1)}
                                      </Badge>
                                    </div>
                                    <p className="text-white text-sm font-medium truncate">{leg.team}</p>
                                    <p className="text-gray-400 text-xs truncate">vs {leg.opponent}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-blue-400 text-xs font-mono">
                                        {leg.spread > 0 ? "+" : ""}{leg.spread}
                                      </span>
                                      <span className="text-gray-600 text-xs">@</span>
                                      <span className="text-gray-300 text-xs">{leg.odds}</span>
                                    </div>
                                  </div>
                                  <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0 h-7 w-7 p-0" onClick={() => removeLeg(leg.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm text-gray-400">Bet Amount</label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-400" />
                              <Input
                                type="number"
                                value={betAmount}
                                onChange={(e) => setBetAmount(Number(e.target.value))}
                                className="pl-10 bg-black/40 border-gray-700 text-white"
                                min="1"
                                step="5"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 pt-3 border-t border-gray-700/50">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Combined Odds:</span>
                              <span className="font-bold text-amber-300">
                                {parlayStats.american > 0 ? `+${parlayStats.american}` : parlayStats.american}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Potential Profit:</span>
                              <span className="font-bold text-green-400">${parlayStats.profit.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-1">
                              <span className="text-gray-300">Total Payout:</span>
                              <span className="text-green-400">${parlayStats.payout.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2">
                            <Button
                              onClick={placeParlayBet}
                              className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 hover:from-amber-500 hover:via-yellow-600 hover:to-orange-600 text-black font-bold py-3 shadow-lg shadow-amber-500/30"
                              disabled={parlayLegs.length < 2 || placeParlayMutation.isPending}
                            >
                              <Crown className="w-4 h-4 mr-2" />
                              {placeParlayMutation.isPending ? "Placing..." : `Place ${parlayLegs.length}-Leg Parlay`}
                            </Button>
                            {parlayLegs.length < 2 && (
                              <p className="text-xs text-gray-500 text-center">Add at least 2 picks to place</p>
                            )}
                            <Button variant="ghost" size="sm" className="w-full text-gray-500 hover:text-red-400" onClick={clearParlay}>
                              Clear All
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
