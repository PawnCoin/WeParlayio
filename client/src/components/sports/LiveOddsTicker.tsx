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
      <CardContent className="p-0">
        <div className="flex items-center h-16 relative">
          <div className="absolute left-0 top-0 h-full flex items-center bg-gradient-to-r from-slate-900 to-transparent z-10 px-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold whitespace-nowrap">LIVE ODDS</span>
            </div>
          </div>

          <div className="flex whitespace-wrap animate-ticker-infinite pl-32">
            {/* Duplicate the data for seamless infinite scroll */}
            {[...oddsData, ...oddsData].map((odds, index) => (
              <div key={`${odds.gameId}-${index}`} className="inline-flex items-center mx-8 space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold">{odds.homeTeam} vs {odds.awayTeam}</span>
                  <span className="text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded">
                    {odds.sport}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {getMovementIcon(odds.movement)}
                    <span className={`text-sm font-mono ${getMovementColor(odds.movement)}`}>
                      {formatOdds(odds.homeOdds)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Away: {formatOdds(odds.awayOdds)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes ticker-infinite {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-ticker-infinite {
            animation: ticker-infinite 60s linear infinite;
          }
        `}</style>
      </CardContent>
    </Card>
  );
};

export default LiveOddsTicker;