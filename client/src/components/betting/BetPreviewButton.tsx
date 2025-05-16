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
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, PieChart, Clock } from "lucide-react";
import OddsDisplay from './OddsDisplay';

interface BetPreviewButtonProps {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  betType: 'moneyline' | 'spread' | 'total';
  selection: string;
  odds: number;
  point?: number;
  isSelected: boolean;
  oddsFormat: 'american' | 'decimal' | 'fractional';
  onClick: () => void;
}

const BetPreviewButton: React.FC<BetPreviewButtonProps> = ({
  eventId,
  homeTeam,
  awayTeam,
  betType,
  selection,
  odds,
  point,
  isSelected,
  oddsFormat,
  onClick
}) => {
  // Generate stats based on the bet type and odds
  const isHomeTeam = selection === homeTeam;
  const isUnderdog = odds > 0;
  
  // Win percentage (favor team with better odds)
  const winRate = Math.floor(Math.random() * 40) + 40; // 40-80%
  
  // Recent form (W, L, D)
  const generateForm = () => {
    const results = ['W', 'L', 'D'];
    const form = [];
    for (let i = 0; i < 5; i++) {
      const rand = Math.random();
      if (rand < 0.5) form.push('W');
      else if (rand < 0.8) form.push('L');
      else form.push('D');
    }
    return form;
  };
  
  const recentForm = generateForm();
  
  // Implied probability from odds
  const impliedProb = odds > 0
    ? (100 / (odds + 100) * 100).toFixed(1)
    : (Math.abs(odds) / (Math.abs(odds) + 100) * 100).toFixed(1);
  
  // Popularity percentage (random)
  const popularity = Math.floor(Math.random() * 40) + 40; // 40-80%
  
  // Format for recent form display (W, L, D)
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
          {betType === 'spread' && point !== undefined ? (
            `${selection} ${point > 0 ? '+' : ''}${point}`
          ) : betType === 'total' && point !== undefined ? (
            `${selection} ${point}`
          ) : (
            <OddsDisplay americanOdds={odds} format={oddsFormat} />
          )}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 shadow-lg border border-green-200 dark:border-green-900">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2 pt-3 px-4 bg-gradient-to-r from-blue-700 to-green-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">
                {betType.toUpperCase()} BET - {selection}
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
              
              {isHomeTeam && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                  <h5 className="text-xs text-gray-500 mb-1">HOME ADVANTAGE</h5>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Home field advantage</span>
                    <span className="text-amber-700 dark:text-amber-400 font-bold">+10%</span>
                  </div>
                </div>
              )}
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

export default BetPreviewButton;