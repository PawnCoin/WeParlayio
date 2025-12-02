import { KingVipTool } from "@/kingEngine/KingVipTool";
import { useTodayGames } from "@/hooks/useTodayGames";
import { Loader2, AlertCircle, Crown, Brain, Sparkles, TrendingUp, Target, ArrowLeft, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import TierGuard from "@/components/access/TierGuard";

export default function KingEngine() {
  const { games, loading, error } = useTodayGames();

  return (
    <TierGuard requiredTier="vip" feature="King VIP Engine">
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
        {/* Premium Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-yellow-500/10 to-transparent blur-3xl" />
          
          <div className="relative container mx-auto px-4 py-8">
            {/* Back Navigation */}
            <Link href="/vip">
              <Button variant="ghost" className="text-gray-400 hover:text-white mb-6" data-testid="button-back-vip">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to VIP Dashboard
              </Button>
            </Link>

            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 blur-xl opacity-60 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-5 rounded-2xl shadow-2xl">
                    <Crown className="w-12 h-12 text-black" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3 mb-3">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                  King VIP Engine
                </h1>
              </div>
              
              <div className="flex items-center justify-center gap-3 mb-4">
                <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold px-4 py-2">
                  <Sparkles className="w-4 h-4 mr-1" />
                  FLAGSHIP FEATURE
                </Badge>
                <Badge variant="outline" className="border-amber-400/50 text-amber-300 px-4 py-2">
                  <Brain className="w-4 h-4 mr-1" />
                  26-Point Analysis
                </Badge>
              </div>
              
              <p className="text-xl text-amber-200/70 max-w-2xl mx-auto mb-6">
                Advanced AI-powered betting intelligence with proprietary edge scoring, 
                smart bankroll management, and automated parlay generation.
              </p>

              {/* Feature Pills */}
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

        {/* Main Content */}
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
            <div className="max-w-6xl mx-auto">
              {/* Game Count Badge */}
              {games.length > 0 && (
                <div className="flex items-center justify-center mb-6">
                  <Badge variant="outline" className="border-green-500/50 text-green-400 px-4 py-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" />
                    {games.length} Live Games Loaded
                  </Badge>
                </div>
              )}
              
              {/* King VIP Tool */}
              <KingVipTool games={games} />
            </div>
          )}
        </div>
      </div>
    </TierGuard>
  );
}
