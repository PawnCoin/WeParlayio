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
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, BarChart3, Clock } from "lucide-react";
import OddsDisplay from './OddsDisplay';

interface BetButtonProps {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  betType: string; // 'moneyline', 'spread', 'total'
  selection: string;
  odds: number;
  point?: number;
  isSelected: boolean;
  oddsFormat: 'american' | 'decimal' | 'fractional';
  onClick: () => void;
}

const BetButton: React.FC<BetButtonProps> = ({
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
  // Generate random statistics for the preview tooltip
  const homeWinRate = Math.floor(Math.random() * 40) + 40; // 40-80%
  const awayWinRate = Math.floor(Math.random() * 40) + 40; // 40-80%
  const headToHeadHome = Math.floor(Math.random() * 6) + 2; // 2-7 wins
  const headToHeadAway = Math.floor(Math.random() * 6) + 2; // 2-7 wins
  const popularityRate = Math.floor(Math.random() * 40) + 40; // 40-80%
  const impliedProbability = odds > 0 
    ? (100 / (odds + 100) * 100).toFixed(1) 
    : (Math.abs(odds) / (Math.abs(odds) + 100) * 100).toFixed(1);
  
  // Format for recent form (W, L, D)
  const generateForm = () => {
    const forms = ['W', 'L', 'D'];
    return Array(5).fill(0).map(() => forms[Math.floor(Math.random() * forms.length)]);
  };
  
  const homeForm = generateForm();
  const awayForm = generateForm();
  
  const formatRecentForm = (form: string[]) => {
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
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button 
          variant={isSelected ? "default" : "outline"} 
          size="sm" 
          className={`w-full text-xs ${isSelected ? 'bg-green-700 text-white hover:bg-green-800' : 'bg-background text-foreground'}`}
          onClick={onClick}
        >
          {betType === 'spread' && point && `${selection} ${point > 0 ? '+' : ''}${point} `}
          {betType === 'total' && `${selection} ${point} `}
          <OddsDisplay americanOdds={odds} format={oddsFormat} />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">
                {betType.toUpperCase()} - <OddsDisplay americanOdds={odds} format={oddsFormat} className="font-bold" />
              </CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1 bg-white text-green-800">
                <TrendingUp className="h-3 w-3" /> 
                {`${popularityRate}%`}
              </Badge>
            </div>
            <CardDescription className="text-gray-100 text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" /> {homeTeam} vs {awayTeam}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-3 pb-4 px-4">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <h4 className="text-xs text-gray-500 mb-1">HOME</h4>
                <p className="font-medium text-sm mb-1">{homeTeam}</p>
                <div className="flex">{formatRecentForm(homeForm)}</div>
              </div>
              <div>
                <h4 className="text-xs text-gray-500 mb-1">AWAY</h4>
                <p className="font-medium text-sm mb-1">{awayTeam}</p>
                <div className="flex">{formatRecentForm(awayForm)}</div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md mb-3 flex items-center text-sm">
              <BarChart3 className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-blue-800 dark:text-blue-300 text-xs">
                Expert Pick: <span className="font-bold">{homeWinRate > awayWinRate ? homeTeam : awayTeam}</span>
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1">
                  Win Rate
                </div>
                <div className="flex items-center gap-1 font-medium">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  {homeTeam}: {homeWinRate}% | {awayTeam}: {awayWinRate}%
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1">
                  H2H
                </div>
                <div className="flex items-center gap-1 font-medium">
                  {homeTeam}: {headToHeadHome} - {awayTeam}: {headToHeadAway}
                </div>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1">
                  Implied Probability
                </div>
                <div className="flex items-center gap-1 font-medium">
                  {impliedProbability}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </HoverCardContent>
    </HoverCard>
  );
};

export default BetButton;