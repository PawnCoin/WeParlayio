import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, TrendingUp } from 'lucide-react';
import { AssetManager } from '@/lib/assetManager';

interface GameCardProps {
  homeTeam: string;
  awayTeam: string;
  homeOdds: string;
  awayOdds: string;
  gameTime: string;
  sport: string;
  league?: string;
  isLive?: boolean;
  homeScore?: number;
  awayScore?: number;
}

const GameCard: React.FC<GameCardProps> = ({
  homeTeam,
  awayTeam,
  homeOdds,
  awayOdds,
  gameTime,
  sport,
  league = 'nba',
  isLive = false,
  homeScore,
  awayScore
}) => {
  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        {/* Header with sport icon and live indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img 
              src={AssetManager.getSportIcon(sport)} 
              alt={sport} 
              className="w-5 h-5 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 uppercase font-medium">
              {league}
            </span>
          </div>
          {isLive && (
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
                src={AssetManager.getTeamLogo(awayTeam, league)} 
                alt={awayTeam} 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.src = AssetManager.getSportIcon(sport);
                }}
              />
              <div className="flex flex-col">
                <span className="font-medium text-sm">{awayTeam}</span>
                {isLive && awayScore !== undefined && (
                  <span className="text-xl font-bold">{awayScore}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-md cursor-pointer transition-colors">
                <span className="font-medium text-primary">{awayOdds}</span>
              </div>
            </div>
          </div>

          {/* Home team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={AssetManager.getTeamLogo(homeTeam, league)} 
                alt={homeTeam} 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.src = AssetManager.getSportIcon(sport);
                }}
              />
              <div className="flex flex-col">
                <span className="font-medium text-sm">{homeTeam}</span>
                {isLive && homeScore !== undefined && (
                  <span className="text-xl font-bold">{homeScore}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-md cursor-pointer transition-colors">
                <span className="font-medium text-primary">{homeOdds}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game info footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{gameTime}</span>
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