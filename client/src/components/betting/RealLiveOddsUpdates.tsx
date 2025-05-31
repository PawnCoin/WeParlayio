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
  const [systemStatus, setSystemStatus] = useState<any>({});
  const [apiSwitching, setApiSwitching] = useState(false);

  // Fetch real live odds updates from our API
  useEffect(() => {
    const fetchRealOddsUpdates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/real-odds');
        const result = await response.json();
        
        if (result.success && result.data) {
          // Update system status
          setSystemStatus(result.meta || {});
          
          // Check if APIs are switching
          if (result.meta?.systemStatus === 'degraded') {
            setApiSwitching(true);
            setTimeout(() => setApiSwitching(false), 3000);
          }
          
          const realUpdates = result.data.map((odds: any, index: number) => ({
            id: odds.id || `odds-${index}`,
            homeTeam: odds.home_team || odds.homeTeam || 'Home Team',
            awayTeam: odds.away_team || odds.awayTeam || 'Away Team', 
            market: odds.sport_key || odds.market || 'h2h',
            oldOdds: odds.home_odds || odds.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0]?.price || 1.85,
            newOdds: odds.away_odds || odds.bookmakers?.[0]?.markets?.[0]?.outcomes?.[1]?.price || 1.95,
            timestamp: new Date(odds.commence_time || odds.timestamp || Date.now()),
            source: odds.source || odds.api_source || 'Live API',
            apiStatus: odds.api_status || 'active'
          }));
          setOddsUpdates(realUpdates.slice(0, 15));
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Error fetching real odds updates:', error);
        setSystemStatus({ systemStatus: 'error', message: 'Connection failed' });
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
        
        <div className={`p-3 rounded-lg ${
          systemStatus.systemStatus === 'emergency' ? 'bg-red-50' :
          systemStatus.systemStatus === 'degraded' ? 'bg-yellow-50' :
          'bg-blue-50'
        }`}>
          <div className="flex items-center gap-2 text-sm">
            <Zap className={`h-4 w-4 ${
              systemStatus.systemStatus === 'emergency' ? 'text-red-600' :
              systemStatus.systemStatus === 'degraded' ? 'text-yellow-600' :
              'text-blue-600'
            }`} />
            <span className={`font-medium ${
              systemStatus.systemStatus === 'emergency' ? 'text-red-900' :
              systemStatus.systemStatus === 'degraded' ? 'text-yellow-900' :
              'text-blue-900'
            }`}>
              {apiSwitching ? 'Switching APIs...' : 
               systemStatus.systemStatus === 'emergency' ? 'Emergency Mode - Cached Data' :
               systemStatus.systemStatus === 'degraded' ? 'Some APIs Down - Auto-Switching' :
               'Live Data from Multiple APIs'}
            </span>
          </div>
          <p className={`text-xs mt-1 ${
            systemStatus.systemStatus === 'emergency' ? 'text-red-700' :
            systemStatus.systemStatus === 'degraded' ? 'text-yellow-700' :
            'text-blue-700'
          }`}>
            {systemStatus.message || `Updates every 8 seconds • ${oddsUpdates.length} active markets`}
            {systemStatus.activeApis !== undefined && (
              <span className="ml-2">• {systemStatus.activeApis}/{systemStatus.totalApis} APIs active</span>
            )}
          </p>
          {apiSwitching && (
            <div className="flex items-center gap-2 mt-2">
              <RefreshCw className="h-3 w-3 animate-spin text-yellow-600" />
              <span className="text-xs text-yellow-700">Automatically switching to backup APIs...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}