
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Zap, 
  Clock, 
  DollarSign,
  Activity,
  ArrowUp,
  ArrowDown 
} from 'lucide-react';

const LiveBettingReal: React.FC = () => {
  const [liveGames, setLiveGames] = useState([
    {
      id: 1,
      homeTeam: "Lakers",
      awayTeam: "Warriors",
      homeScore: 98,
      awayScore: 95,
      quarter: "Q4",
      timeLeft: "2:34",
      homeOdds: -110,
      awayOdds: +105,
      totalPoints: 205.5,
      isLive: true
    },
    {
      id: 2,
      homeTeam: "Heat",
      awayTeam: "Celtics", 
      homeScore: 72,
      awayScore: 78,
      quarter: "Q3",
      timeLeft: "8:45",
      homeOdds: +120,
      awayOdds: -135,
      totalPoints: 198.5,
      isLive: true
    }
  ]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Activity className="h-8 w-8 text-red-500" />
          Live Betting
        </h1>
        <p className="text-muted-foreground text-lg">
          Real-time betting with live odds and instant updates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {liveGames.map((game) => (
          <Card key={game.id} className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="animate-pulse">
                    <Zap className="h-3 w-3 mr-1" />
                    LIVE
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {game.quarter} - {game.timeLeft}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-center">
                <div className="flex justify-between items-center">
                  <div className="text-lg">{game.awayTeam}</div>
                  <div className="text-2xl font-bold">{game.awayScore} - {game.homeScore}</div>
                  <div className="text-lg">{game.homeTeam}</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-between"
                >
                  <span>{game.awayTeam}</span>
                  <span className="flex items-center">
                    {game.awayOdds > 0 ? '+' : ''}{game.awayOdds}
                    {game.awayOdds > 0 ? 
                      <ArrowUp className="h-3 w-3 ml-1 text-green-500" /> : 
                      <ArrowDown className="h-3 w-3 ml-1 text-red-500" />
                    }
                  </span>
                </Button>
                <Button 
                  variant="outline"
                  className="flex items-center justify-between"
                >
                  <span>{game.homeTeam}</span>
                  <span className="flex items-center">
                    {game.homeOdds > 0 ? '+' : ''}{game.homeOdds}
                    {game.homeOdds > 0 ? 
                      <ArrowUp className="h-3 w-3 ml-1 text-green-500" /> : 
                      <ArrowDown className="h-3 w-3 ml-1 text-red-500" />
                    }
                  </span>
                </Button>
              </div>
              
              <div className="flex justify-center">
                <Button variant="secondary" className="w-full">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Total: {game.totalPoints} pts
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-bold mb-2">Real-Time Updates</h3>
            <p className="text-muted-foreground">
              Odds update every second • Live scores • Instant payouts
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveBettingReal;
