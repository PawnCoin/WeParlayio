import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from 'lucide-react';
import TeamLogo from './TeamLogo';

interface EnhancedGameCardProps {
  game: {
    id: string;
    home_team: string;
    away_team: string;
    sport_key: string;
    commence_time: string;
    status?: string;
    bookmakers?: Array<{
      markets: Array<{
        outcomes: Array<{
          name: string;
          price: number;
        }>;
      }>;
    }>;
  };
  onClick?: () => void;
  className?: string;
}

export default function EnhancedGameCard({ game, onClick, className = '' }: EnhancedGameCardProps) {
  const sportMapping: { [key: string]: string } = {
    'americanfootball_nfl': 'nfl',
    'basketball_nba': 'nba',
    'baseball_mlb': 'mlb',
    'icehockey_nhl': 'nhl'
  };

  const sport = sportMapping[game.sport_key] || 'nfl';
  const gameTime = new Date(game.commence_time);
  const isLive = game.status?.includes('Live') || game.status?.includes('In Progress');
  
  // Extract team abbreviations from team names
  const getTeamAbbr = (teamName: string) => {
    const abbrevMap: { [key: string]: string } = {
      'Kansas City Chiefs': 'KC',
      'Buffalo Bills': 'BUF',
      'Los Angeles Rams': 'LAR',
      'Tampa Bay Buccaneers': 'TB',
      'Dallas Cowboys': 'DAL',
      'Green Bay Packers': 'GB',
      'San Francisco 49ers': 'SF',
      'New England Patriots': 'NE',
      'Pittsburgh Steelers': 'PIT',
      'Baltimore Ravens': 'BAL'
    };
    return abbrevMap[teamName] || teamName.split(' ').pop()?.slice(0, 3).toUpperCase() || 'TBD';
  };

  const homeAbbr = getTeamAbbr(game.home_team);
  const awayAbbr = getTeamAbbr(game.away_team);
  
  const odds = game.bookmakers?.[0]?.markets?.[0]?.outcomes;

  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500 ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isLive && (
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {sport.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            {isLive ? 'Live Now' : gameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <TeamLogo 
                teamAbbreviation={awayAbbr}
                sport={sport}
                size="md"
                showName={false}
              />
              <span className="font-semibold text-sm">{game.away_team}</span>
            </div>
            <div className="flex items-center gap-3">
              <TeamLogo 
                teamAbbreviation={homeAbbr}
                sport={sport}
                size="md"
                showName={false}
              />
              <span className="font-semibold text-sm">{game.home_team}</span>
            </div>
          </div>

          {odds && (
            <div className="flex flex-col gap-2 text-right">
              {odds.map((outcome, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className="min-w-[60px] justify-center font-mono text-xs"
                  >
                    {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
                  </Badge>
                  <TrendingUp className="w-3 h-3 text-green-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">
          {gameTime.toLocaleDateString()} • Tap to bet
        </div>
      </CardContent>
    </Card>
  );
}