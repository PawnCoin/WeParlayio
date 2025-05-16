import React from 'react';
import { Button } from "@/components/ui/button";
import OddsDisplay from './OddsDisplay';
import BetPreviewTooltip from './BetPreviewTooltip';
import { formatGameTime } from "@/lib/sportsDataUtils";

interface MoneylineButtonProps {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  outcomeName: string;
  outcomePrice: number;
  isSelected: boolean;
  oddsFormat: 'american' | 'decimal' | 'fractional';
  commenceTime: string;
  onSelect: (
    eventId: string, 
    homeTeam: string, 
    awayTeam: string, 
    betType: string, 
    outcomeName: string, 
    outcomePrice: number
  ) => void;
}

const MoneylineButton: React.FC<MoneylineButtonProps> = ({
  eventId,
  homeTeam,
  awayTeam,
  outcomeName,
  outcomePrice,
  isSelected,
  oddsFormat,
  commenceTime,
  onSelect
}) => {
  const isHomeTeam = outcomeName === homeTeam;
  
  // Generate mock team statistics
  const homeTeamStats = {
    name: homeTeam,
    recentForm: ['W', 'W', 'L', 'D', 'W'],
    winPercentage: 65,
    headToHeadWins: 3,
  };
  
  const awayTeamStats = {
    name: awayTeam,
    recentForm: ['L', 'W', 'W', 'L', 'D'],
    winPercentage: 55,
    headToHeadWins: 2,
  };
  
  return (
    <BetPreviewTooltip
      odds={outcomePrice}
      oddsFormat={oddsFormat}
      betType="Moneyline"
      homeTeam={homeTeamStats}
      awayTeam={awayTeamStats}
      matchTime={formatGameTime(commenceTime)}
      popularityPercentage={isHomeTeam ? 65 : 35}
      expertPick={isHomeTeam ? 'home' : 'away'}
      recentTrend={isHomeTeam ? 'up' : 'neutral'}
    >
      <Button 
        variant={isSelected ? "default" : "outline"} 
        size="sm" 
        className={`w-full text-xs ${isSelected ? 'bg-green-700 text-white' : 'bg-background text-foreground'}`}
        onClick={() => onSelect(
          eventId, 
          homeTeam, 
          awayTeam, 
          'moneyline', 
          outcomeName, 
          outcomePrice
        )}
      >
        <OddsDisplay americanOdds={outcomePrice} format={oddsFormat} />
      </Button>
    </BetPreviewTooltip>
  );
};

export default MoneylineButton;