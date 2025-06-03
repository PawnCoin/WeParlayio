import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, TrendingUp } from 'lucide-react';
import { AssetManager } from '@/lib/assetManager';
import { useBetting } from '@/hooks/use-betting';

interface GameCardProps {
  game: {
    id: string | number;
    homeTeam: {
      id: number;
      name: string;
      logo: string;
      record?: string;
      location?: string;
    };
    awayTeam: {
      id: number;
      name: string;
      logo: string;
      record?: string;
      location?: string;
    };
    startTime: string;
    status: string;
    homeScore?: number;
    awayScore?: number;
    period?: string;
    timeRemaining?: string;
    sportName?: string;
    odds?: any;
  };
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [selectedBet, setSelectedBet] = useState<string | null>(null);
  const { addBet } = useBetting();

  const formatOdds = (odds: number): string => {
    if (odds > 0) return `+${odds}`;
    return odds.toString();
  };

  const handleBetSelect = (betType: string, team: string, odds: number) => {
    const teamName = team || 'unknown';
    const betId = `${game.id}-${betType}-${teamName.toLowerCase()}`;

    const bet = {
      id: betId,
      gameId: game.id,
      betType,
      team,
      odds,
      sport: game.sportName || 'Unknown Sport',
    };
    addBet(bet);
    setSelectedBet(betId);
  };

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        {/* Header with sport icon and live indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img
              src={AssetManager.getSportIcon(game.sportName || 'default')}
              alt={game.sportName}
              className="w-5 h-5 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 uppercase font-medium">
              {game.sportName}
            </span>
          </div>
          {game.status === 'Live' && (
            <Badge variant="destructive" className="animate-pulse">
              LIVE
            </Badge>
          )}
        </div>

        {/* Teams and logos */}
        <div className="space-y-3">
          {/* Away team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={AssetManager.getTeamLogo(game.awayTeam.name, game.sportName)}
                alt={game.awayTeam.name}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.src = AssetManager.getSportIcon(game.sportName || 'default');
                }}
              />
              <div className="flex flex-col">
                <span className="font-medium text-sm">{game.awayTeam.name}</span>
                {game.status === 'Live' && game.awayScore !== undefined && (
                  <span className="text-xl font-bold">{game.awayScore}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div
                className="bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-md cursor-pointer transition-colors"
                onClick={() => handleBetSelect('moneyline', game.awayTeam.name, game.odds?.away)}
              >
                <span className="font-medium text-primary">{formatOdds(game.odds?.away)}</span>
              </div>
            </div>
          </div>

          {/* Home team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={AssetManager.getTeamLogo(game.homeTeam.name, game.sportName)}
                alt={game.homeTeam.name}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.src = AssetManager.getSportIcon(game.sportName || 'default');
                }}
              />
              <div className="flex flex-col">
                <span className="font-medium text-sm">{game.homeTeam.name}</span>
                {game.status === 'Live' && game.homeScore !== undefined && (
                  <span className="text-xl font-bold">{game.homeScore}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div
                className="bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-md cursor-pointer transition-colors"
                onClick={() => handleBetSelect('moneyline', game.homeTeam.name, game.odds?.home)}
              >
                <span className="font-medium text-primary">{formatOdds(game.odds?.home)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game info footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{game.startTime}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>1.2k</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>65%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCard;