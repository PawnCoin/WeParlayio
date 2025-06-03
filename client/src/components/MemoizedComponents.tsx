import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Zap } from 'lucide-react';

// Optimized bet card with React.memo for performance
interface BetCardProps {
  bet: {
    id: string;
    amount: number;
    odds: number;
    status: string;
    eventName: string;
    pick: string;
    potential: number;
  };
  onBetSelect?: (betId: string) => void;
}

export const MemoizedBetCard = memo<BetCardProps>(({ bet, onBetSelect }) => {
  const handleClick = useCallback(() => {
    onBetSelect?.(bet.id);
  }, [bet.id, onBetSelect]);

  const statusColor = useMemo(() => {
    switch (bet.status) {
      case 'won': return 'bg-green-500';
      case 'lost': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  }, [bet.status]);

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm">{bet.eventName}</h3>
          <Badge className={statusColor}>{bet.status}</Badge>
        </div>
        <div className="text-sm text-muted-foreground mb-2">Pick: {bet.pick}</div>
        <div className="flex justify-between items-center">
          <span className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            ${bet.amount}
          </span>
          <span className="text-green-600 font-medium">
            +${bet.potential}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

MemoizedBetCard.displayName = 'MemoizedBetCard';

// Optimized odds display component
interface OddsDisplayProps {
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  awayOdds: number;
  trend?: 'up' | 'down' | 'stable';
  isLive?: boolean;
}

export const MemoizedOddsDisplay = memo<OddsDisplayProps>(({
  homeTeam,
  awayTeam,
  homeOdds,
  awayOdds,
  trend = 'stable',
  isLive = false
}) => {
  const trendIcon = useMemo(() => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-500" />;
      default: return null;
    }
  }, [trend]);

  const formattedOdds = useMemo(() => ({
    home: homeOdds > 0 ? `+${homeOdds}` : homeOdds.toString(),
    away: awayOdds > 0 ? `+${awayOdds}` : awayOdds.toString()
  }), [homeOdds, awayOdds]);

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1">
        <div className="text-sm font-medium">{homeTeam} vs {awayTeam}</div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {formattedOdds.home}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {formattedOdds.away}
          </Badge>
          {trendIcon}
          {isLive && (
            <div className="flex items-center">
              <Zap className="w-3 h-3 text-red-500 mr-1" />
              <span className="text-xs text-red-500 font-medium">LIVE</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MemoizedOddsDisplay.displayName = 'MemoizedOddsDisplay';

// Optimized stats card for dashboard
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  onClick?: () => void;
}

export const MemoizedStatsCard = memo<StatsCardProps>(({
  title,
  value,
  change,
  icon,
  onClick
}) => {
  const changeDisplay = useMemo(() => {
    if (change === undefined) return null;
    
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {Math.abs(change)}%
      </div>
    );
  }, [change]);

  return (
    <Card className={onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {changeDisplay}
      </CardContent>
    </Card>
  );
});

MemoizedStatsCard.displayName = 'MemoizedStatsCard';