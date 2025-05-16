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
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, TrendingUp, BarChart3, Clock, Percent } from "lucide-react";
import OddsDisplay from './OddsDisplay';

interface BetStatistic {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  tooltip?: string;
}

export interface TeamStats {
  name: string;
  recentForm: string[]; // Array of W, L, D for recent games
  winPercentage: number;
  averagePoints?: number;
  homeAdvantage?: number; // For home team only, percentage advantage
  headToHeadWins?: number;
}

interface BetPreviewProps {
  children: React.ReactNode;
  odds: number;
  oddsFormat?: 'american' | 'decimal' | 'fractional';
  betType: string;
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  matchTime: string;
  popularityPercentage?: number; // How popular this bet is among users
  expertPick?: 'home' | 'away' | 'draw';
  recentTrend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const BetPreviewTooltip: React.FC<BetPreviewProps> = ({
  children,
  odds,
  oddsFormat = 'american',
  betType,
  homeTeam,
  awayTeam,
  matchTime,
  popularityPercentage,
  expertPick,
  recentTrend,
  className
}) => {
  // Format team recent form (W, L, D)
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

  // Calculate implied probability from odds
  const calculateImpliedProbability = (americanOdds: number): number => {
    if (americanOdds > 0) {
      return 100 / (americanOdds + 100) * 100;
    } else {
      return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100) * 100;
    }
  };

  const impliedProbability = calculateImpliedProbability(odds);

  // Generate various statistics to show in the tooltip
  const generateStatistics = (): BetStatistic[] => {
    return [
      {
        label: 'Win %', 
        value: homeTeam.winPercentage > awayTeam.winPercentage 
          ? `${homeTeam.name} (${homeTeam.winPercentage}%)` 
          : `${awayTeam.name} (${awayTeam.winPercentage}%)`,
        trend: homeTeam.winPercentage > awayTeam.winPercentage ? 'up' : 'down',
        tooltip: 'Overall win percentage this season'
      },
      {
        label: 'H2H Advantage', 
        value: (homeTeam?.headToHeadWins || 0) > (awayTeam?.headToHeadWins || 0) 
          ? `${homeTeam.name} (${homeTeam?.headToHeadWins || 0} wins)` 
          : `${awayTeam.name} (${awayTeam?.headToHeadWins || 0} wins)`,
        tooltip: 'Head-to-head advantage between these teams'
      },
      {
        label: 'Implied Prob.', 
        value: `${impliedProbability.toFixed(1)}%`,
        tooltip: 'Implied probability based on current odds'
      },
      {
        label: 'Popular Pick', 
        value: popularityPercentage ? `${popularityPercentage}% of bettors` : 'N/A',
        trend: popularityPercentage && popularityPercentage > 60 ? 'up' : 'neutral',
        tooltip: 'Percentage of WeParlay users betting on this outcome'
      }
    ];
  };

  const statistics = generateStatistics();

  const getExpertPickLabel = () => {
    if (!expertPick) return null;
    return expertPick === 'home' ? homeTeam.name : 
           expertPick === 'away' ? awayTeam.name : 'Draw';
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className={`cursor-pointer ${className}`}>
          {children}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">
                {betType} - <OddsDisplay americanOdds={odds} format={oddsFormat} className="font-bold" />
              </CardTitle>
              {recentTrend && (
                <Badge variant={recentTrend === 'up' ? 'default' : 'secondary'} className="flex items-center gap-1">
                  {recentTrend === 'up' && <TrendingUp className="h-3 w-3" />}
                  {recentTrend === 'up' ? 'Trending' : 'Stable'}
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
                <div className="flex">{formatRecentForm(homeTeam.recentForm)}</div>
              </div>
              <div>
                <h4 className="text-xs text-gray-500 mb-1">AWAY</h4>
                <p className="font-medium text-sm mb-1">{awayTeam.name}</p>
                <div className="flex">{formatRecentForm(awayTeam.recentForm)}</div>
              </div>
            </div>

            {expertPick && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md mb-3 flex items-center text-sm">
                <BarChart3 className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-blue-800 dark:text-blue-300 text-xs">
                  Expert Pick: <span className="font-bold">{getExpertPickLabel()}</span>
                </span>
              </div>
            )}

            <div className="space-y-2">
              {statistics.map((stat, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1">
                    {stat.label}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">
                          {stat.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                    {stat.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 transform rotate-180" />}
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </HoverCardContent>
    </HoverCard>
  );
};

export default BetPreviewTooltip;