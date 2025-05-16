import React from 'react';
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, BarChart3, Clock, ArrowUpRight, ArrowDownRight, PieChart } from "lucide-react";
import OddsDisplay from './OddsDisplay';

interface EnhancedButtonProps {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  betType: 'moneyline' | 'spread' | 'total';
  selection: string;
  odds: number;
  point?: number;
  isSelected: boolean;
  oddsFormat: 'american' | 'decimal' | 'fractional';
  className?: string;
  onClick: () => void;
}

// Generate simulated betting statistics for the tooltip
const generateStatistics = (selection: string, homeTeam: string, awayTeam: string, odds: number) => {
  const isHome = selection === homeTeam;
  const selectedTeam = isHome ? homeTeam : selection === awayTeam ? awayTeam : selection;
  
  // Generate random stats based on odds (higher odds = higher chance of underdog statistics)
  const isUnderdog = odds > 0;
  
  // Win percentage (favor team with better odds)
  const baseWinRate = isUnderdog ? 35 : 55;
  const winRateVariance = Math.floor(Math.random() * 15);
  const winRate = baseWinRate + winRateVariance;
  
  // Recent form (more wins for favorites, more losses for underdogs)
  const generateForm = () => {
    const results = ['W', 'L', 'D'];
    const form = [];
    for (let i = 0; i < 5; i++) {
      // Weight the probabilities based on underdog status
      const winProb = isUnderdog ? 0.3 : 0.6;
      const lossProb = isUnderdog ? 0.6 : 0.3;
      
      const rand = Math.random();
      if (rand < winProb) form.push('W');
      else if (rand < winProb + lossProb) form.push('L');
      else form.push('D');
    }
    return form;
  };
  
  // Head to head record (favor the favorites)
  const h2hBase = isUnderdog ? 2 : 5;
  const h2hVariance = Math.floor(Math.random() * 3);
  const h2hWins = h2hBase + h2hVariance;
  const h2hLosses = 10 - h2hWins;
  
  // Implied probability from odds
  const impliedProb = odds > 0
    ? (100 / (odds + 100) * 100).toFixed(1)
    : (Math.abs(odds) / (Math.abs(odds) + 100) * 100).toFixed(1);
  
  // Popularity percentage (underdogs often less popular)
  const popularityBase = isUnderdog ? 30 : 60;
  const popularityVariance = Math.floor(Math.random() * 20);
  const popularity = popularityBase + popularityVariance;
  
  // Injury impact (random for now)
  const injuryImpact = Math.floor(Math.random() * 30) + 10;
  
  return {
    team: selectedTeam,
    winRate,
    recentForm: generateForm(),
    h2h: { wins: h2hWins, losses: h2hLosses },
    impliedProbability: impliedProb,
    popularity,
    injuryImpact
  };
};

const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  eventId,
  homeTeam,
  awayTeam,
  betType,
  selection,
  odds,
  point,
  isSelected,
  oddsFormat,
  className = "",
  onClick
}) => {
  // Generate stats for the tooltip
  const stats = generateStatistics(selection, homeTeam, awayTeam, odds);
  
  // Format the recent form display
  const formatForm = (form: string[]) => {
    return form.map((result, index) => {
      const bgColor = 
        result === 'W' ? 'bg-green-500' : 
        result === 'L' ? 'bg-red-500' : 'bg-gray-500';
      
      return (
        <span 
          key={index} 
          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold ${bgColor} mx-0.5`}
        >
          {result}
        </span>
      );
    });
  };
  
  // Determine the display text
  let displayText = '';
  if (betType === 'spread' && point !== undefined) {
    displayText = `${selection} ${point > 0 ? '+' : ''}${point}`;
  } else if (betType === 'total' && point !== undefined) {
    displayText = `${selection} ${point}`;
  } else {
    // We'll render the OddsDisplay component directly
    displayText = '';
  }
  
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <Button 
          variant={isSelected ? "default" : "outline"} 
          size="sm" 
          className={`w-full text-xs ${isSelected ? 'bg-green-700 hover:bg-green-800 text-white' : 'bg-background hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground'} ${className}`}
          onClick={onClick}
        >
          {displayText || <OddsDisplay americanOdds={odds} format={oddsFormat} />}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 shadow-lg border border-green-200 dark:border-green-900">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">
                {betType.toUpperCase()} BET - {selection}
              </CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1 bg-white text-green-800">
                <TrendingUp className="h-3 w-3" /> 
                {`${stats.popularity}% Popular`}
              </Badge>
            </div>
            <CardDescription className="text-gray-100 text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" /> {homeTeam} vs {awayTeam}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-3 pb-2 px-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-xs text-gray-500 uppercase mb-1">Recent Form</h4>
                <div className="flex">{formatForm(stats.recentForm)}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                  <h5 className="text-xs text-gray-500 mb-1">IMPLIED ODDS</h5>
                  <div className="flex items-center">
                    <PieChart className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium">{stats.impliedProbability}%</span>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                  <h5 className="text-xs text-gray-500 mb-1">WIN RATE</h5>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium">{stats.winRate}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                <h5 className="text-xs text-gray-500 mb-1">HEAD-TO-HEAD</h5>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{stats.team}</span>
                  <span className="text-amber-700 dark:text-amber-400 font-bold">{stats.h2h.wins}-{stats.h2h.losses}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-4 py-2 text-xs text-gray-500 border-t bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              <span>Odds: <OddsDisplay americanOdds={odds} format={oddsFormat} /></span>
            </div>
          </CardFooter>
        </Card>
      </HoverCardContent>
    </HoverCard>
  );
};

export default EnhancedButton;