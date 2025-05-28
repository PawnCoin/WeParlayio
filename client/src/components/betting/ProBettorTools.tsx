
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, Zap, AlertTriangle } from 'lucide-react';

interface OddsMovement {
  bookmaker: string;
  previous: number;
  current: number;
  change: number;
  timestamp: Date;
}

interface ArbitrageOpportunity {
  event: string;
  bookmaker1: string;
  odds1: number;
  bookmaker2: string;
  odds2: number;
  profit: number;
  timeRemaining: number;
}

const ProBettorTools: React.FC = () => {
  const [oddsMovements, setOddsMovements] = useState<OddsMovement[]>([]);
  const [arbOpportunities, setArbOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [steamMoves, setSteamMoves] = useState<any[]>([]);

  useEffect(() => {
    // Simulate real-time odds movements
    const interval = setInterval(() => {
      const mockMovement: OddsMovement = {
        bookmaker: ['DraftKings', 'FanDuel', 'BetMGM', 'Caesars'][Math.floor(Math.random() * 4)],
        previous: -110,
        current: -115 + Math.random() * 10,
        change: (Math.random() - 0.5) * 20,
        timestamp: new Date()
      };
      
      setOddsMovements(prev => [mockMovement, ...prev.slice(0, 9)]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Sharp Money Tracker */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Target className="h-5 w-5 mr-2 text-red-500" />
            Sharp Money Alerts
            <Badge variant="destructive" className="ml-2">LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {steamMoves.length === 0 ? (
              <div className="p-4 border border-dashed rounded-lg text-center text-gray-500">
                <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <p className="text-sm">Monitoring for sharp money movements...</p>
              </div>
            ) : (
              steamMoves.map((move, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{move.event}</span>
                    <Badge variant="destructive">STEAM MOVE</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {move.side} moved from {move.from} to {move.to} ({move.change})
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Arbitrage Opportunities */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Arbitrage Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((arb) => (
              <div key={arb} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Lakers vs Warriors</span>
                  <Badge variant="default" className="bg-green-600">+2.3% profit</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">DraftKings:</span>
                    <span className="ml-1 font-medium">+145</span>
                  </div>
                  <div>
                    <span className="text-gray-600">FanDuel:</span>
                    <span className="ml-1 font-medium">-160</span>
                  </div>
                </div>
                <Button size="sm" className="mt-2 w-full bg-green-600 hover:bg-green-700">
                  Calculate Stakes
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Odds Movements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            Live Odds Movements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {oddsMovements.map((movement, index) => (
              <div key={index} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <span className="font-medium text-sm">{movement.bookmaker}</span>
                  <p className="text-xs text-gray-500">
                    {movement.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <span className="text-sm mr-2">{movement.current.toFixed(0)}</span>
                    {movement.change > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <span className={`text-xs ${movement.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {movement.change > 0 ? '+' : ''}{movement.change.toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CLV Tracker */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            Closing Line Value (CLV)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <div className="text-2xl font-bold text-green-600">+4.2%</div>
            <p className="text-sm text-gray-600">Average CLV Last 30 Days</p>
            <Button variant="outline" size="sm" className="mt-2">
              View Detailed Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProBettorTools;
