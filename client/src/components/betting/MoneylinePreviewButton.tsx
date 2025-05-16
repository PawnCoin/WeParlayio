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
import { Info, TrendingUp, ChevronUp, ChevronDown, Clock, PieChart } from "lucide-react";
import OddsDisplay from './OddsDisplay';

interface MoneylinePreviewButtonProps {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  selection: string; // Team name
  odds: number; // Odds
  isSelected: boolean;
  oddsFormat: 'american' | 'decimal' | 'fractional';
  onClick: () => void;
}

const MoneylinePreviewButton: React.FC<MoneylinePreviewButtonProps> = ({
  eventId,
  homeTeam,
  awayTeam,
  selection,
  odds,
  isSelected,
  oddsFormat,
  onClick
}) => {
  // Check if selection is the home team
  const isHomeTeam = selection === homeTeam;
  
  // Generate random but realistic stats based on the odds
  const isUnderdog = odds > 0;
  
  // Win percentage (favor team with better odds)
  const baseWinRate = isUnderdog ? 35 : 55;
  const winRateVariance = Math.floor(Math.random() * 15);
  const winRate = baseWinRate + winRateVariance;
  
  // Generate form (W/L/D) with bias based on odds
  const generateForm = () => {
    const results = ['W', 'L', 'D'];
    const form = [];
    
    // Bias the probabilities based on underdog status
    const winProb = isUnderdog ? 0.3 : 0.6;
    const lossProb = isUnderdog ? 0.6 : 0.3;
    
    for (let i = 0; i < 5; i++) {
      const rand = Math.random();
      if (rand < winProb) form.push('W');
      else if (rand < winProb + lossProb) form.push('L');
      else form.push('D');
    }
    return form;
  };
  
  const recentForm = generateForm();
  
  // Home advantage (only if home team)
  const homeAdvantage = isHomeTeam ? Math.floor(Math.random() * 10) + 5 : 0;
  
  // Implied probability from odds
  const impliedProb = odds > 0
    ? (100 / (odds + 100) * 100).toFixed(1)
    : (Math.abs(odds) / (Math.abs(odds) + 100) * 100).toFixed(1);
  
  // Popularity percentage 
  const popularityBase = isUnderdog ? 30 : 60;
  const popularityVariance = Math.floor(Math.random() * 20);
  const popularity = popularityBase + popularityVariance;
  
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
  
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <Button 
          variant={isSelected ? "default" : "outline"} 
          size="sm" 
          className={`w-full text-xs ${isSelected ? 'bg-green-700 hover:bg-green-800 text-white' : 'bg-background hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground'}`}
          onClick={onClick}
        >
          <OddsDisplay americanOdds={odds} format={oddsFormat} />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 shadow-lg border border-green-200 dark:border-green-900">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2 pt-3 px-4 bg-gradient-to-r from-blue-700 to-green-700 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">
                MONEYLINE BET - {selection}
              </CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1 bg-white text-green-800">
                <TrendingUp className="h-3 w-3" /> 
                {`${popularity}% Popular`}
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
                <div className="flex">{formatForm(recentForm)}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                  <h5 className="text-xs text-gray-500 mb-1">IMPLIED ODDS</h5>
                  <div className="flex items-center">
                    <PieChart className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium">{impliedProb}%</span>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                  <h5 className="text-xs text-gray-500 mb-1">WIN RATE</h5>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium">{winRate}%</span>
                  </div>
                </div>
              </div>
              
              {isHomeTeam && homeAdvantage > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                  <h5 className="text-xs text-gray-500 mb-1">HOME ADVANTAGE</h5>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Home field advantage</span>
                    <span className="text-amber-700 dark:text-amber-400 font-bold">+{homeAdvantage}%</span>
                  </div>
                </div>
              )}
              
              <div className="bg-slate-50 dark:bg-slate-900/20 p-2 rounded-md">
                <h5 className="text-xs text-gray-500 mb-1">INSIGHTS</h5>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {isHomeTeam 
                    ? `${selection} has a strong ${winRate}% win rate and ${homeAdvantage > 0 ? `benefits from a ${homeAdvantage}% home field advantage` : 'will be playing at home'}.`
                    : `${selection} has a ${winRate}% win rate while playing away from home.`
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

export default MoneylinePreviewButton;