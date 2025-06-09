import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface OddsMovement {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  awayOdds: number;
  movement: 'up' | 'down' | 'none';
  sport: string;
}

interface LiveOddsTickerProps {
  oddsData: OddsMovement[];
}

const LiveOddsTicker: React.FC<LiveOddsTickerProps> = ({ oddsData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (oddsData.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % oddsData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [oddsData.length]);

  if (!oddsData.length) {
    return (
      <Card className="bg-gradient-to-r from-slate-900 to-gray-900 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <span className="text-gray-400">Loading live odds...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentOdds = oddsData[currentIndex];

  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const getMovementIcon = (movement: string) => {
    switch (movement) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMovementColor = (movement: string) => {
    switch (movement) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-slate-900 to-gray-900 text-white overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-yellow-400 text-yellow-400">
              LIVE ODDS
            </Badge>
            
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-300">{currentOdds.sport}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-400">{currentOdds.awayTeam}</div>
              <div className={`text-lg font-bold ${getMovementColor(currentOdds.movement)}`}>
                {formatOdds(currentOdds.awayOdds)}
                {getMovementIcon(currentOdds.movement)}
              </div>
            </div>

            <div className="text-gray-500 text-lg">vs</div>

            <div className="text-center">
              <div className="text-sm text-gray-400">{currentOdds.homeTeam}</div>
              <div className={`text-lg font-bold ${getMovementColor(currentOdds.movement)}`}>
                {formatOdds(currentOdds.homeOdds)}
                {getMovementIcon(currentOdds.movement)}
              </div>
            </div>
          </div>

          <div className="flex gap-1">
            {oddsData.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-yellow-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveOddsTicker;