import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";
import { useBetSlip } from '@/contexts/BetSlipContext';

interface OddsData {
  timestamp: number;
  moneyline: { home: number; away: number };
  spread: { home: number; away: number; points: number };
  total: { over: number; under: number; points: number };
}

interface SparkLineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

const SparkLine: React.FC<SparkLineProps> = ({ 
  data, 
  width = 100, 
  height = 30, 
  color = '#3b82f6' 
}) => {
  if (!data || data.length < 2) return <div style={{ width, height }} />;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const trend = data[data.length - 1] > data[0] ? 'up' : 'down';
  const strokeColor = trend === 'up' ? '#10b981' : '#ef4444';

  return (
    <div className="flex items-center gap-2">
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          className="drop-shadow-sm"
        />
        {/* Add dots for recent data points */}
        {data.slice(-3).map((value, index) => {
          const x = ((data.length - 3 + index) / (data.length - 1)) * width;
          const y = height - ((value - min) / range) * height;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={strokeColor}
              className="opacity-70"
            />
          );
        })}
      </svg>
      {trend === 'up' ? (
        <TrendingUp className="h-4 w-4 text-green-500" />
      ) : (
        <TrendingDown className="h-4 w-4 text-red-500" />
      )}
    </div>
  );
};

const RealTimeOddsVisualization: React.FC = () => {
  const { addBet } = useBetSlip();
  const [oddsHistory, setOddsHistory] = useState<{ [eventId: string]: OddsData[] }>({});

  // Fetch live events with real-time updates
  const { data: liveEvents } = useQuery({
    queryKey: ['/api/events/live'],
    refetchInterval: 5000, // Update every 5 seconds for real-time feel
  });

  // Simulate real-time odds movement (in production, this would come from your odds API)
  useEffect(() => {
    const interval = setInterval(() => {
      if (liveEvents && Array.isArray(liveEvents)) {
        setOddsHistory(prev => {
          const newHistory = { ...prev };
          
          liveEvents.forEach((event: any) => {
            if (!newHistory[event.id]) {
              newHistory[event.id] = [];
            }
            
            // Simulate odds movement with realistic fluctuations
            const lastOdds = newHistory[event.id][newHistory[event.id].length - 1];
            const baseMoneylineHome = -110;
            const baseMoneylineAway = +105;
            const baseSpreadPoints = -3.5;
            const baseTotalPoints = 47.5;
            
            const newOdds: OddsData = {
              timestamp: Date.now(),
              moneyline: {
                home: lastOdds ? lastOdds.moneyline.home + (Math.random() - 0.5) * 10 : baseMoneylineHome,
                away: lastOdds ? lastOdds.moneyline.away + (Math.random() - 0.5) * 10 : baseMoneylineAway,
              },
              spread: {
                home: lastOdds ? lastOdds.spread.home + (Math.random() - 0.5) * 5 : -110,
                away: lastOdds ? lastOdds.spread.away + (Math.random() - 0.5) * 5 : -110,
                points: lastOdds ? lastOdds.spread.points + (Math.random() - 0.5) * 0.5 : baseSpreadPoints,
              },
              total: {
                over: lastOdds ? lastOdds.total.over + (Math.random() - 0.5) * 5 : -110,
                under: lastOdds ? lastOdds.total.under + (Math.random() - 0.5) * 5 : -110,
                points: lastOdds ? lastOdds.total.points + (Math.random() - 0.5) * 0.5 : baseTotalPoints,
              },
            };
            
            newHistory[event.id].push(newOdds);
            
            // Keep only last 20 data points for visualization
            if (newHistory[event.id].length > 20) {
              newHistory[event.id] = newHistory[event.id].slice(-20);
            }
          });
          
          return newHistory;
        });
      }
    }, 3000); // Update odds every 3 seconds

    return () => clearInterval(interval);
  }, [liveEvents]);

  const placeBet = (event: any, betType: string, selection: string, odds: number, point?: number) => {
    addBet({
      id: `${event.id}-${betType}-${selection}-${Date.now()}`,
      eventId: event.id,
      gameTitle: `${event.away_team || 'Away'} vs ${event.home_team || 'Home'}`,
      betType,
      selection,
      odds,
      point,
      amount: 0,
      potential: 0,
      sport: event.sport_title || 'Live Event',
    });
  };

  if (!liveEvents || !Array.isArray(liveEvents)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Real-Time Odds Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p>Loading live odds data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Real-Time Odds Visualization
            <Badge variant="secondary" className="ml-auto">
              <Zap className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {liveEvents.slice(0, 3).map((event: any) => {
        const eventOdds = oddsHistory[event.id] || [];
        const currentOdds = eventOdds[eventOdds.length - 1];
        
        if (!currentOdds) return null;

        const moneylineHistory = eventOdds.map(o => o.moneyline.home);
        const spreadHistory = eventOdds.map(o => o.spread.points);
        const totalHistory = eventOdds.map(o => o.total.points);

        return (
          <Card key={event.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">
                    {event.away_team || 'Away Team'} @ {event.home_team || 'Home Team'}
                  </h3>
                  <p className="text-sm text-gray-600">{event.sport_title}</p>
                </div>
                <Badge variant="outline">
                  {eventOdds.length} Updates
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Moneyline with Spark Line */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Moneyline Trend</span>
                    <SparkLine data={moneylineHistory} width={80} height={25} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => placeBet(event, 'moneyline', event.away_team || 'Away', currentOdds.moneyline.away)}
                      className="text-xs"
                    >
                      {event.away_team || 'Away'} {currentOdds.moneyline.away > 0 ? '+' : ''}{Math.round(currentOdds.moneyline.away)}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => placeBet(event, 'moneyline', event.home_team || 'Home', currentOdds.moneyline.home)}
                      className="text-xs"
                    >
                      {event.home_team || 'Home'} {currentOdds.moneyline.home > 0 ? '+' : ''}{Math.round(currentOdds.moneyline.home)}
                    </Button>
                  </div>
                </div>

                {/* Spread with Spark Line */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Spread Movement</span>
                    <SparkLine data={spreadHistory} width={80} height={25} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => placeBet(event, 'spread', `${event.away_team || 'Away'} ${currentOdds.spread.points > 0 ? '+' : ''}${currentOdds.spread.points.toFixed(1)}`, currentOdds.spread.away, currentOdds.spread.points)}
                      className="text-xs"
                    >
                      {currentOdds.spread.points > 0 ? '+' : ''}{currentOdds.spread.points.toFixed(1)} ({Math.round(currentOdds.spread.away)})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => placeBet(event, 'spread', `${event.home_team || 'Home'} ${-currentOdds.spread.points > 0 ? '+' : ''}${(-currentOdds.spread.points).toFixed(1)}`, currentOdds.spread.home, -currentOdds.spread.points)}
                      className="text-xs"
                    >
                      {-currentOdds.spread.points > 0 ? '+' : ''}{(-currentOdds.spread.points).toFixed(1)} ({Math.round(currentOdds.spread.home)})
                    </Button>
                  </div>
                </div>

                {/* Total with Spark Line */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Trend</span>
                    <SparkLine data={totalHistory} width={80} height={25} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => placeBet(event, 'total', `Over ${currentOdds.total.points.toFixed(1)}`, currentOdds.total.over, currentOdds.total.points)}
                      className="text-xs"
                    >
                      O {currentOdds.total.points.toFixed(1)} ({Math.round(currentOdds.total.over)})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => placeBet(event, 'total', `Under ${currentOdds.total.points.toFixed(1)}`, currentOdds.total.under, currentOdds.total.points)}
                      className="text-xs"
                    >
                      U {currentOdds.total.points.toFixed(1)} ({Math.round(currentOdds.total.under)})
                    </Button>
                  </div>
                </div>
              </div>

              {/* Real-time update indicator */}
              <div className="flex items-center justify-center pt-2 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Last updated: {new Date(currentOdds.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RealTimeOddsVisualization;