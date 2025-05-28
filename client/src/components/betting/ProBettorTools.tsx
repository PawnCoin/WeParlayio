
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Target, Zap, AlertTriangle, DollarSign, BarChart3, Activity } from 'lucide-react';

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

  // Fetch real-time arbitrage opportunities
  const { data: arbitrageData } = useQuery({
    queryKey: ['/api/arbitrage/opportunities'],
    refetchInterval: 2000, // 2 second updates
  });

  // Fetch CLV stats
  const { data: clvData } = useQuery({
    queryKey: ['/api/clv/user-stats'],
    refetchInterval: 30000, // 30 second updates
  });

  // Fetch sharp money alerts
  const { data: sharpMoney } = useQuery({
    queryKey: ['/api/sharp-money/alerts'],
    refetchInterval: 5000, // 5 second updates
  });

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
            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
            Arbitrage Opportunities
            <Badge variant="destructive" className="ml-2">LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {arbitrageData?.length === 0 ? (
              <div className="p-4 border border-dashed rounded-lg text-center text-gray-500">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-sm">No arbitrage opportunities detected</p>
              </div>
            ) : (
              arbitrageData?.slice(0, 3).map((arb: any, index: number) => (
                <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{arb.event}</span>
                    <Badge variant="default" className="bg-green-600">+{arb.profit.toFixed(1)}% profit</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {arb.legs?.map((leg: any, legIndex: number) => (
                      <div key={legIndex}>
                        <span className="text-gray-600">{leg.book}:</span>
                        <span className="ml-1 font-medium">{leg.odds > 0 ? '+' : ''}{leg.odds}</span>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" className="mt-2 w-full bg-green-600 hover:bg-green-700">
                    Calculate Stakes (${arb.stakes?.stake1.toFixed(0)} / ${arb.stakes?.stake2.toFixed(0)})
                  </Button>
                </div>
              ))
            )}
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
            <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
            Closing Line Value (CLV)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className={`text-2xl font-bold ${clvData?.averageCLV >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {clvData?.averageCLV >= 0 ? '+' : ''}{clvData?.averageCLV || 0}%
              </div>
              <p className="text-sm text-gray-600">Average CLV (All Time)</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-bold text-lg">{clvData?.totalBets || 0}</div>
                <div className="text-gray-600">Total Bets</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-bold text-lg">{clvData?.positiveCLVRate || 0}%</div>
                <div className="text-gray-600">+CLV Rate</div>
              </div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-sm text-gray-600">Last 30 Days</div>
              <div className={`text-lg font-bold ${clvData?.lastThirtyDays?.averageCLV >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {clvData?.lastThirtyDays?.averageCLV >= 0 ? '+' : ''}{clvData?.lastThirtyDays?.averageCLV || 0}%
              </div>
            </div>
            
            <Button variant="outline" size="sm" className="w-full">
              View Detailed CLV Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProBettorTools;
