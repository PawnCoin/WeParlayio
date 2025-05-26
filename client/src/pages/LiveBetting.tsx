import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  Zap,
  RefreshCw,
  Play,
  Pause,
  Users,
  Target,
  Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import OddsPredictionWidget from "@/components/OddsPredictionWidget";

export default function LiveBetting() {
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Fetch live events data with real-time updates
  const { data: liveEvents, refetch: refetchLive } = useQuery({
    queryKey: ["/api/events/live"],
    refetchInterval: 5000, // Update every 5 seconds for live data
  });

  // Fetch live odds for active events
  const { data: liveOdds } = useQuery({
    queryKey: ["/api/odds/live"],
    refetchInterval: 3000, // Update every 3 seconds for odds
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchLive();
    setRefreshing(false);
    toast({
      title: "Live Data Refreshed",
      description: "All live betting options updated",
    });
  };

  const placeLiveBet = (eventId: string, betType: string, odds: number) => {
    toast({
      title: "Live Bet Placed",
      description: `${betType} bet placed for event ${eventId}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Zap className="h-8 w-8 text-red-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Live Betting
            </h1>
            <Activity className="h-8 w-8 text-red-500 animate-pulse" />
          </div>
          <p className="text-lg text-gray-600">
            Real-time betting on live sports events with instant odds updates
          </p>
        </div>

        {/* Live Status & Controls */}
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-red-800">LIVE BETTING ACTIVE</span>
                </div>
                <Badge variant="outline" className="border-red-300 text-red-800">
                  {liveEvents?.length || 0} Live Events
                </Badge>
                <Badge variant="outline" className="border-orange-300 text-orange-800">
                  Real-time Odds
                </Badge>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-red-600 hover:bg-red-700"
              >
                {refreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh Live Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Events Section */}
        {liveEvents && liveEvents.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Play className="h-6 w-6 text-red-500" />
              Live Events ({liveEvents.length})
            </h2>
            
            <div className="grid gap-6">
              {liveEvents.map((event: any, index: number) => (
                <Card key={event.id || index} className="border-red-200 bg-red-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          {event.title || `${event.home_team} vs ${event.away_team}`}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.sport_title || event.sport_key}
                        </p>
                      </div>
                      <Badge variant="destructive">LIVE</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Team Information */}
                      <div className="space-y-2">
                        <h4 className="font-semibold">Teams</h4>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span>{event.home_team}</span>
                            <span className="font-mono">{event.scores?.[0]?.score || "0"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{event.away_team}</span>
                            <span className="font-mono">{event.scores?.[1]?.score || "0"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Live Betting Options */}
                      <div className="space-y-2">
                        <h4 className="font-semibold">Live Bets</h4>
                        <div className="space-y-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => placeLiveBet(event.id, "Home Win", -110)}
                          >
                            {event.home_team} Win (-110)
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => placeLiveBet(event.id, "Away Win", +120)}
                          >
                            {event.away_team} Win (+120)
                          </Button>
                        </div>
                      </div>

                      {/* Event Status */}
                      <div className="space-y-2">
                        <h4 className="font-semibold">Status</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Live Now</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Active Betting</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            <span>Odds Updating</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              No live events currently happening. Live betting will appear here when real sporting events are in progress.
              This is normal during offseason periods.
            </AlertDescription>
          </Alert>
        )}

        {/* Live Betting Features */}
        <Card>
          <CardHeader>
            <CardTitle>Live Betting Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <Zap className="h-8 w-8 text-red-500 mx-auto" />
                <h3 className="font-semibold">Instant Bets</h3>
                <p className="text-sm text-gray-600">Place bets instantly on live events with real-time odds</p>
              </div>
              <div className="text-center space-y-2">
                <Activity className="h-8 w-8 text-orange-500 mx-auto" />
                <h3 className="font-semibold">Live Updates</h3>
                <p className="text-sm text-gray-600">Odds and scores update in real-time during games</p>
              </div>
              <div className="text-center space-y-2">
                <Brain className="h-8 w-8 text-blue-500 mx-auto" />
                <h3 className="font-semibold">AI Predictions</h3>
                <p className="text-sm text-gray-600">Advanced algorithms predict odds movements and market trends</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Odds Prediction Demo */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Real-time Odds Prediction Algorithm
              <Badge variant="outline" className="ml-auto">
                <Zap className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  Experience our advanced AI prediction engine! Try it with upcoming NFL games or any live sporting event.
                </AlertDescription>
              </Alert>
              
              {/* Sample prediction widget for demonstration */}
              <OddsPredictionWidget
                eventId="demo-nfl-game-2025"
                sport="americanfootball_nfl"
                homeTeam="Kansas City Chiefs"
                awayTeam="Buffalo Bills"
                currentOdds={{
                  home: -120,
                  away: +110,
                  total: 48.5
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Continue with existing content */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <Target className="h-8 w-8 text-green-500 mx-auto" />
                <h3 className="font-semibold">Smart Betting</h3>
                <p className="text-sm text-gray-600">Advanced betting options based on live game situations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}