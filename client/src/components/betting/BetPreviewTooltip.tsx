import React from 'react';
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Clock, Percent, Info, Users, ChevronUp, ChevronDown } from 'lucide-react';

interface BetPreviewTooltipProps {
  children: React.ReactNode;
  betType: string;
  homeTeam: {
    name: string;
    record?: string;
    logo?: string;
    winProbability?: number;
    currentForm?: string; // e.g. "W,W,L,W,L"
    recentPerformance?: number; // 1-10 to show on progress
  };
  awayTeam: {
    name: string;
    record?: string;
    logo?: string;
    winProbability?: number;
    currentForm?: string; // e.g. "W,W,L,W,L"
    recentPerformance?: number; // 1-10 to show on progress
  };
  odds: number;
  matchTime: string;
  recentTrend?: 'up' | 'down' | null;
  publicBettingPercentage?: number;
  injuryUpdates?: string[];
  point?: number;
  className?: string;
}

// Helper function to convert American odds to probability
const oddsToImpliedProbability = (americanOdds: number): number => {
  if (americanOdds > 0) {
    return 100 / (americanOdds + 100) * 100;
  } else {
    return -americanOdds / (-americanOdds + 100) * 100;
  }
};

// Helper to format American odds for display
const formatOdds = (odds: number): string => {
  return odds > 0 ? `+${odds}` : odds.toString();
};

// Helper to render current form (W/L/D) with colors
const renderCurrentForm = (form: string) => {
  if (!form) return null;
  
  return (
    <div className="flex space-x-1 mt-1">
      {form.split(',').map((result, index) => {
        let bgColor = 'bg-gray-200';
        let textColor = 'text-gray-700';
        
        if (result === 'W') {
          bgColor = 'bg-green-100';
          textColor = 'text-green-700';
        } else if (result === 'L') {
          bgColor = 'bg-red-100';
          textColor = 'text-red-700';
        } else if (result === 'D') {
          bgColor = 'bg-blue-100';
          textColor = 'text-blue-700';
        }
        
        return (
          <span 
            key={index} 
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${bgColor} ${textColor}`}
          >
            {result}
          </span>
        );
      })}
    </div>
  );
};

export const BetPreviewTooltip: React.FC<BetPreviewTooltipProps> = ({
  children,
  betType,
  homeTeam,
  awayTeam,
  odds,
  matchTime,
  recentTrend,
  publicBettingPercentage,
  injuryUpdates,
  point,
  className = '',
}) => {
  // Calculate implied probabilities
  const impliedProbability = oddsToImpliedProbability(odds);
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className={`cursor-pointer ${className}`}>
          {children}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">
                {betType} {point ? `(${point > 0 ? '+' : ''}${point})` : ''} - <span className="font-bold">{formatOdds(odds)}</span>
              </CardTitle>
              {recentTrend && (
                <Badge variant={recentTrend === 'up' ? 'default' : 'secondary'} className="flex items-center gap-1">
                  {recentTrend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
                  {recentTrend === 'up' ? 'Trending' : 'Declining'}
                </Badge>
              )}
            </div>
            <CardDescription className="text-gray-100 text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" /> {matchTime}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-3 pb-4 px-4">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <h4 className="text-xs text-gray-500 mb-1">HOME</h4>
                <p className="font-medium text-sm mb-1">{homeTeam.name}</p>
                {homeTeam.record && (
                  <p className="text-xs text-gray-500">{homeTeam.record}</p>
                )}
                {homeTeam.currentForm && renderCurrentForm(homeTeam.currentForm)}
                {homeTeam.recentPerformance && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-500">Recent Form</span>
                      <span className="font-medium">{homeTeam.recentPerformance}/10</span>
                    </div>
                    <Progress 
                      value={homeTeam.recentPerformance * 10}
                      className="h-1.5"
                    />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-xs text-gray-500 mb-1">AWAY</h4>
                <p className="font-medium text-sm mb-1">{awayTeam.name}</p>
                {awayTeam.record && (
                  <p className="text-xs text-gray-500">{awayTeam.record}</p>
                )}
                {awayTeam.currentForm && renderCurrentForm(awayTeam.currentForm)}
                {awayTeam.recentPerformance && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-500">Recent Form</span>
                      <span className="font-medium">{awayTeam.recentPerformance}/10</span>
                    </div>
                    <Progress 
                      value={awayTeam.recentPerformance * 10}
                      className="h-1.5"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <Separator className="my-3" />
            
            <div className="space-y-2">
              {publicBettingPercentage !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-gray-500" />
                    <span className="text-gray-700">Public Betting</span>
                  </div>
                  <span className="font-medium">{publicBettingPercentage}%</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Percent className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-gray-700">Implied Probability</span>
                </div>
                <span className="font-medium">{impliedProbability.toFixed(1)}%</span>
              </div>
            </div>
            
            {injuryUpdates && injuryUpdates.length > 0 && (
              <>
                <Separator className="my-3" />
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                    <Info className="h-3 w-3" /> Key Injury Updates
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {injuryUpdates.map((update, index) => (
                      <li key={index} className="flex">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 mr-1.5"></span>
                        {update}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </HoverCardContent>
    </HoverCard>
  );
};

// Helper function to format odds in different systems
export const OddsDisplay = ({ 
  americanOdds, 
  format = 'american',
  className = '' 
}: { 
  americanOdds: number, 
  format?: 'american' | 'decimal' | 'fractional',
  className?: string 
}) => {
  const getOddsDisplay = () => {
    if (format === 'american') {
      return americanOdds > 0 ? `+${americanOdds}` : americanOdds;
    } else if (format === 'decimal') {
      if (americanOdds > 0) {
        return (americanOdds / 100 + 1).toFixed(2);
      } else {
        return (100 / Math.abs(americanOdds) + 1).toFixed(2);
      }
    } else if (format === 'fractional') {
      if (americanOdds > 0) {
        return `${americanOdds}/100`;
      } else {
        return `100/${Math.abs(americanOdds)}`;
      }
    }
    return americanOdds;
  };

  return (
    <span className={className}>{getOddsDisplay()}</span>
  );
};

export default BetPreviewTooltip;