import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface OddsData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  awayOdds: number;
  lastUpdate: string;
  trend: 'up' | 'down' | 'stable';
  sport: string;
}

interface OptimizedOddsTickerProps {
  oddsData: OddsData[];
  isLoading: boolean;
  onOddsSelect?: (odds: OddsData) => void;
}

// Optimized individual odds item with React.memo
const OddsItem = memo<{ odds: OddsData; onSelect?: (odds: OddsData) => void }>(({ odds, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect?.(odds);
  }, [odds, onSelect]);

  const trendDisplay = useMemo(() => {
    switch (odds.trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" aria-label="Trending up" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" aria-label="Trending down" />;
      default:
        return <div className="w-3 h-3" />;
    }
  }, [odds.trend]);

  const oddsFormatted = useMemo(() => ({
    home: odds.homeOdds > 0 ? `+${odds.homeOdds}` : odds.homeOdds.toString(),
    away: odds.awayOdds > 0 ? `+${odds.awayOdds}` : odds.awayOdds.toString()
  }), [odds.homeOdds, odds.awayOdds]);

  return (
    <div 
      className="flex items-center justify-between p-3 border-r border-border/30 last:border-r-0 min-w-[220px] hover:bg-accent/20 transition-colors cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="flex flex-col space-y-1">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {odds.sport}
        </div>
        <div className="text-sm font-semibold text-foreground">
          {odds.homeTeam} vs {odds.awayTeam}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-2 py-0.5 font-mono">
            {oddsFormatted.home}
          </Badge>
          <Badge variant="outline" className="text-xs px-2 py-0.5 font-mono">
            {oddsFormatted.away}
          </Badge>
          {trendDisplay}
        </div>
      </div>
    </div>
  );
});

OddsItem.displayName = 'OddsItem';

// Loading skeleton component
const LoadingSkeleton = memo(() => (
  <div className="flex items-center justify-center py-6 px-4">
    <div className="flex items-center space-x-2">
      <Zap className="w-4 h-4 text-primary animate-pulse" />
      <span className="text-sm text-muted-foreground animate-pulse">
        Loading live odds...
      </span>
    </div>
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Empty state component
const EmptyState = memo(() => (
  <div className="flex items-center justify-center py-6 px-4 text-sm text-muted-foreground">
    No live odds available at this time
  </div>
));

EmptyState.displayName = 'EmptyState';

// Main optimized odds ticker component
const OptimizedOddsTicker = memo<OptimizedOddsTickerProps>(({ 
  oddsData, 
  isLoading, 
  onOddsSelect 
}) => {
  const renderedContent = useMemo(() => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    if (!oddsData || oddsData.length === 0) {
      return <EmptyState />;
    }

    return oddsData.map((odds) => (
      <OddsItem 
        key={`${odds.id}-${odds.lastUpdate}`} 
        odds={odds} 
        onSelect={onOddsSelect}
      />
    ));
  }, [oddsData, isLoading, onOddsSelect]);

  return (
    <Card className="w-full bg-background/80 backdrop-blur-sm border-border/50 shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="flex items-stretch min-h-[80px]">
            {renderedContent}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedOddsTicker.displayName = 'OptimizedOddsTicker';

export default OptimizedOddsTicker;
export type { OddsData };