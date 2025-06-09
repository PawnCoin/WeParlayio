import { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import { StreamingGame, BetType } from './types';

interface BettingPanelProps {
  readonly game: StreamingGame;
  readonly onPlaceBet: (gameId: string, betType: BetType, odds: number) => void;
  readonly className?: string;
}

const BettingPanel = memo(({ game, onPlaceBet, className = '' }: BettingPanelProps) => {
  const handleBetClick = useCallback((betType: BetType, odds: number) => {
    onPlaceBet(game.id, betType, odds);
  }, [game.id, onPlaceBet]);

  const formatOdds = useCallback((odds: number): string => {
    return `+${odds.toFixed(1)}`;
  }, []);

  return (
    <Card className={`bg-gray-900 border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Live Betting</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-16 border-green-600 hover:bg-green-600/20 transition-colors"
            onClick={() => handleBetClick('home_win', game.odds.homeWin)}
          >
            <div className="text-center">
              <p className="text-sm font-medium">{game.homeTeam.name} Win</p>
              <p className="text-lg font-bold">{formatOdds(game.odds.homeWin)}</p>
            </div>
          </Button>
          
          {game.odds.draw && (
            <Button
              variant="outline"
              className="h-16 border-gray-600 hover:bg-gray-600/20 transition-colors"
              onClick={() => handleBetClick('draw', game.odds.draw!)}
            >
              <div className="text-center">
                <p className="text-sm font-medium">Draw</p>
                <p className="text-lg font-bold">{formatOdds(game.odds.draw!)}</p>
              </div>
            </Button>
          )}
          
          <Button
            variant="outline"
            className="h-16 border-green-600 hover:bg-green-600/20 transition-colors"
            onClick={() => handleBetClick('away_win', game.odds.awayWin)}
          >
            <div className="text-center">
              <p className="text-sm font-medium">{game.awayTeam.name} Win</p>
              <p className="text-lg font-bold">{formatOdds(game.odds.awayWin)}</p>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

BettingPanel.displayName = 'BettingPanel';

export default BettingPanel;