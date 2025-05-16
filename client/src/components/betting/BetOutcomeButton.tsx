import React from 'react';
import { Button } from "@/components/ui/button";
import OddsDisplay from './OddsDisplay';
import BetPreviewTooltip from './BetPreviewTooltip';

interface BetOutcomeButtonProps {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  betType: string;
  outcomeName: string;
  outcomePrice: number;
  selected: boolean;
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

const BetOutcomeButton: React.FC<BetOutcomeButtonProps> = ({
  eventId,
  homeTeam,
  awayTeam,
  betType,
  outcomeName,
  outcomePrice,
  selected,
  oddsFormat,
  commenceTime,
  onSelect
}) => {
  // Generate some mock statistics for the tooltip based on team names
  // In a real implementation, this would come from API data
  const generateMockTeamStats = (teamName: string, isHomeTeam: boolean) => {
    const randomWinPercentage = Math.floor(40 + Math.random() * 35); // 40-75%
    const forms = ['W', 'L', 'W', 'L', 'W', 'L', 'D', 'W'];
    // Create a random form with 5 results
    const recentForm = Array(5).fill(0).map(() => forms[Math.floor(Math.random() * forms.length)]);
    
    return {
      name: teamName,
      recentForm,
      winPercentage: isHomeTeam ? randomWinPercentage + 5 : randomWinPercentage, // Home team gets slight boost
      headToHeadWins: Math.floor(1 + Math.random() * 5), // 1-5 wins
    };
  };

  const homeTeamStats = generateMockTeamStats(homeTeam, true);
  const awayTeamStats = generateMockTeamStats(awayTeam, false);

  // Determine if this is a popular pick (just for demo purposes)
  const isPopularPick = outcomeName === homeTeam ? 
    homeTeamStats.winPercentage > awayTeamStats.winPercentage : 
    awayTeamStats.winPercentage > homeTeamStats.winPercentage;
  
  const popularityPercentage = isPopularPick ? 60 + Math.floor(Math.random() * 30) : 30 + Math.floor(Math.random() * 30);

  return (
    <BetPreviewTooltip
      odds={outcomePrice}
      oddsFormat={oddsFormat}
      betType={betType}
      homeTeam={homeTeamStats}
      awayTeam={awayTeamStats}
      matchTime={commenceTime}
      popularityPercentage={popularityPercentage}
      expertPick={homeTeamStats.winPercentage > awayTeamStats.winPercentage ? 'home' : 'away'}
      recentTrend={isPopularPick ? 'up' : 'neutral'}
    >
      <Button 
        key={`${eventId}-${betType.toLowerCase()}-${outcomeName}`}
        variant={selected ? "default" : "outline"} 
        size="sm" 
        className={`w-full text-xs ${selected ? 'bg-green-700 text-white' : 'bg-background text-foreground'}`}
        onClick={() => onSelect(eventId, homeTeam, awayTeam, betType, outcomeName, outcomePrice)}
      >
        <OddsDisplay americanOdds={outcomePrice} format={oddsFormat} />
      </Button>
    </BetPreviewTooltip>
  );
};

export default BetOutcomeButton;