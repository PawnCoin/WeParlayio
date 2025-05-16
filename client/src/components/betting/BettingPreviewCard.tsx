import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, PieChart, Clock } from "lucide-react";
import OddsDisplay from './OddsDisplay';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface BettingPreviewCardProps {
  children: React.ReactNode;
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  betType: 'moneyline' | 'spread' | 'total';
  selection: string;
  odds: number;
  point?: number;
  oddsFormat: 'american' | 'decimal' | 'fractional';
  className?: string;
}

// Generate random statistics for display
const generateStats = (selection: string, homeTeam: string, odds: number) => {
  const isHomeTeam = selection === homeTeam;
  const isUnderdog = odds > 0;
  
  // Win rate (40-80%)
  const winRate = Math.floor(Math.random() * 40) + 40;
  
  // Recent form (W, L, D)
  const generateForm = () => {
    const forms = ['W', 'L', 'D'];
    const form = [];
    for (let i = 0; i < 5; i++) {
      // Bias based on underdog status
      const winProb = isUnderdog ? 0.3 : 0.6;
      const lossProb = isUnderdog ? 0.6 : 0.3;
      const rand = Math.random();
      if (rand < winProb) form.push('W');
      else if (rand < winProb + lossProb) form.push('L');
      else form.push('D');
    }
    return form;
  };
  
  // Home advantage (only for home team)
  const homeAdvantage = isHomeTeam ? Math.floor(Math.random() * 10) + 5 : 0;
  
  // Implied probability based on odds
  const impliedProb = odds > 0
    ? (100 / (odds + 100) * 100).toFixed(1)
    : (Math.abs(odds) / (Math.abs(odds) + 100) * 100).toFixed(1);
  
  // Popularity percentage
  const popularity = Math.floor(Math.random() * 40) + 40;
  
  return {
    winRate,
    recentForm: generateForm(),
    homeAdvantage,
    impliedProbability: impliedProb,
    popularity
  };
};

const BettingPreviewCard: React.FC<BettingPreviewCardProps> = ({
  children,
  eventId,
  homeTeam,
  awayTeam,
  betType,
  selection,
  odds,
  point,
  oddsFormat,
  className
}) => {
  const isHomeTeam = selection === homeTeam;
  const stats = generateStats(selection, homeTeam, odds);
  
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
  
  // Format bet display based on type
  const formatBetDisplay = () => {
    if (betType === 'moneyline') {
      return `${selection} ML`;
    } else if (betType === 'spread' && point !== undefined) {
      return `${selection} ${point > 0 ? '+' : ''}${point}`;
    } else if (betType === 'total' && point !== undefined) {
      return `${selection} ${point}`;
    }
    return selection;
  };
  
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 shadow-lg border border-green-200 dark:border-green-900">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2 pt-3 px-4 bg-gradient-to-r from-blue-700 to-green-700 text-white rounded-t-lg">
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
              
              {isHomeTeam && stats.homeAdvantage > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                  <h5 className="text-xs text-gray-500 mb-1">HOME ADVANTAGE</h5>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Home field advantage</span>
                    <span className="text-amber-700 dark:text-amber-400 font-bold">+{stats.homeAdvantage}%</span>
                  </div>
                </div>
              )}
              
              <div className="bg-slate-50 dark:bg-slate-900/20 p-2 rounded-md">
                <h5 className="text-xs text-gray-500 mb-1">INSIGHTS</h5>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {isHomeTeam 
                    ? `${selection} has a strong ${stats.winRate}% win rate and ${stats.homeAdvantage > 0 ? `benefits from a ${stats.homeAdvantage}% home field advantage` : 'will be playing at home'}.`
                    : `${selection} has a ${stats.winRate}% win rate while playing away from home.`
                  }
                </p>
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

export default BettingPreviewCard;