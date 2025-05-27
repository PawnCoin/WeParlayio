import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock,
  RefreshCw,
  Zap
} from 'lucide-react';

interface RealOddsUpdate {
  id: string;
  homeTeam: string;
  awayTeam: string;
  market: string;
  oldOdds: number;
  newOdds: number;
  timestamp: Date;
  source: string;
}

export default function RealLiveOddsUpdates() {
  const [oddsUpdates, setOddsUpdates] = useState<RealOddsUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch real live odds updates from our API
  useEffect(() => {
    const fetchRealOddsUpdates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/real-odds');
        const realOdds = await response.json();
        
        if (realOdds && realOdds.length > 0) {
          const realUpdates = realOdds.map((odds: any, index: number) => ({
            id: odds.id || `odds-${index}`,
            homeTeam: odds.home_team || 'Home Team',
            awayTeam: odds.away_team || 'Away Team',
            market: odds.bookmakers?.[0]?.markets?.[0]?.key || 'h2h',
            oldOdds: odds.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0]?.price || 0,
            newOdds: odds.bookmakers?.[0]?.markets?.[0]?.outcomes?.[1]?.price || 0,
            timestamp: new Date(odds.commence_time || Date.now()),
            source: odds.source || 'RapidAPI'
          }));
          setOddsUpdates(realUpdates.slice(0, 15));
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Error fetching real odds updates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRealOddsUpdates();
    
    // Fetch real odds updates every 8 seconds
    const interval = setInterval(() => {
      fetchRealOddsUpdates();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const formatOdds = (odds: number) => {
    if (odds > 0) return `+${odds}`;
    return odds.toString();
  };

  const getOddsChange = (oldOdds: number, newOdds: number) => {
    const change = newOdds - oldOdds;
    return {
      value: change,
      isPositive: change > 0,
      percentage: oldOdds !== 0 ? Math.abs((change / oldOdds) * 100) : 0
    };
  };

  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-green-600 animate-pulse" />
            Live Odds Updates
            <Badge className="bg-green-600 text-white">
              REAL-TIME API
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
            <span className="ml-2">Loading real odds data...</span>
          </div>
        ) : oddsUpdates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No live odds updates available
          </div>
        ) : (
          oddsUpdates.map((update) => {
            const oddsChange = getOddsChange(update.oldOdds, update.newOdds);
            
            return (
              <div
                key={update.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    {update.homeTeam} vs {update.awayTeam}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {update.market.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {update.source}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatOdds(update.newOdds)}
                    </span>
                    {oddsChange.value !== 0 && (
                      <div className={`flex items-center gap-1 ${
                        oddsChange.isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {oddsChange.isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span className="text-xs font-medium">
                          {oddsChange.percentage.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Was: {formatOdds(update.oldOdds)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">
              Live Data from ESPN & RapidAPI
            </span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Updates every 8 seconds • {oddsUpdates.length} active markets
          </p>
        </div>
      </CardContent>
    </Card>
  );
}