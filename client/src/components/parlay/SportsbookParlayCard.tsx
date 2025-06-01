import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, TrendingUp } from 'lucide-react';

interface ParlayMatchup {
  id: string;
  sport: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  moneylineOdds: {
    home: number;
    away: number;
    tie?: number;
  };
  overUnder: {
    line: number;
    over: number;
    under: number;
  };
}

interface SportsbookParlayCardProps {
  matchup: ParlayMatchup;
  onAddSelection: (selection: any) => void;
}

export const SportsbookParlayCard: React.FC<SportsbookParlayCardProps> = ({
  matchup,
  onAddSelection
}) => {
  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const addSelection = (type: string, team: string, odds: number, line?: number) => {
    onAddSelection({
      id: `${matchup.id}-${type}-${team}`,
      matchupId: matchup.id,
      sport: matchup.sport,
      matchup: `${matchup.awayTeam} @ ${matchup.homeTeam}`,
      type,
      team,
      odds,
      line,
      time: matchup.time
    });
  };

  return (
    <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{matchup.time}</span>
          </div>
          <Badge variant="secondary" className="bg-gray-700 text-gray-200">
            {matchup.sport}
          </Badge>
        </div>

        {/* Teams and Odds */}
        <div className="p-4 space-y-3">
          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="font-semibold text-gray-800 flex-1">
              {matchup.awayTeam}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400 min-w-[60px]"
                onClick={() => addSelection('moneyline', matchup.awayTeam, matchup.moneylineOdds.away)}
              >
                {formatOdds(matchup.moneylineOdds.away)}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400 min-w-[60px] text-xs"
                onClick={() => addSelection('over', `O ${matchup.overUnder.line}`, matchup.overUnder.over, matchup.overUnder.line)}
              >
                O {matchup.overUnder.line}<br/>
                <span className="text-xs">({formatOdds(matchup.overUnder.over)})</span>
              </Button>
            </div>
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="font-semibold text-gray-800 flex-1">
              {matchup.homeTeam}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400 min-w-[60px]"
                onClick={() => addSelection('moneyline', matchup.homeTeam, matchup.moneylineOdds.home)}
              >
                {formatOdds(matchup.moneylineOdds.home)}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400 min-w-[60px] text-xs"
                onClick={() => addSelection('under', `U ${matchup.overUnder.line}`, matchup.overUnder.under, matchup.overUnder.line)}
              >
                U {matchup.overUnder.line}<br/>
                <span className="text-xs">({formatOdds(matchup.overUnder.under)})</span>
              </Button>
            </div>
          </div>

          {/* Tie Option (if available) */}
          {matchup.moneylineOdds.tie && (
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-600 flex-1">
                TIE
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400 min-w-[60px]"
                  onClick={() => addSelection('tie', 'TIE', matchup.moneylineOdds.tie!)}
                >
                  {formatOdds(matchup.moneylineOdds.tie)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* More Options Button */}
        <div className="px-4 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-gray-800 text-white hover:bg-gray-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            MORE
            <Badge className="ml-2 bg-yellow-500 text-black">2</Badge>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};