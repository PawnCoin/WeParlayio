import { KingVipTool } from "@/kingEngine/KingVipTool";
import { useTodayGames } from "@/hooks/useTodayGames";
import { Loader2, AlertCircle, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function VipKingPage() {
  const { games, loading, error } = useTodayGames();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="flex items-center gap-3 p-6">
            <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
            <span className="text-gray-300">Loading King card...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="bg-red-900/20 border-red-500/50">
          <CardContent className="flex items-center gap-3 p-6">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <span className="text-red-300">Error loading games: {error.message}</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Crown className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              King VIP Engine (Live)
            </h1>
          </div>
          <p className="text-gray-400">
            Real-time odds and edge scoring from live sports data.
          </p>
          {games.length > 0 && (
            <p className="text-sm text-green-400 mt-2">
              {games.length} games loaded
            </p>
          )}
        </div>
        <KingVipTool games={games} />
      </div>
    </div>
  );
}