import React, { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { ArrowDownRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useLiveDataQuery } from '@/hooks/useOptimizedQuery';

interface OddsItem {
  id: string;
  sport: string;
  teams: string;
  currentOdds: number;
  previousOdds: number | null;
  timestamp: string;
  eventId?: string;
  bookmaker?: string;
}

// Memoized individual odds item component for optimal performance
const MemoizedOddsItem = memo<{ item: OddsItem }>(({ item }) => {
  const trendIcon = useMemo(() => {
    if (!item.previousOdds) return null;
    
    if (item.currentOdds > item.previousOdds) {
      return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    } else if (item.currentOdds < item.previousOdds) {
      return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    }
    return null;
  }, [item.currentOdds, item.previousOdds]);

  const formattedOdds = useMemo(() => {
    return item.currentOdds > 0 ? `+${item.currentOdds}` : item.currentOdds.toString();
  }, [item.currentOdds]);

  return (
    <div className="flex items-center space-x-4 p-2 border-r border-border/30 last:border-r-0 min-w-[200px]">
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{item.teams}</div>
        <div className="text-xs text-muted-foreground">{item.sport}</div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-mono">{formattedOdds}</span>
        {trendIcon}
      </div>
    </div>
  );
});

MemoizedOddsItem.displayName = 'MemoizedOddsItem';

const OddsTicker = memo(() => {
  const [isPaused, setIsPaused] = useState(false);
  const { isConnected } = useWebSocket();

  // Use optimized query with intelligent caching for better performance
  const { data: oddsResponse, isLoading } = useLiveDataQuery<{ odds: OddsItem[] }>('/api/odds-ticker/live-ticker', {
    enabled: !isPaused,
    refetchInterval: 45000, // Optimized from frequent polling to 45 seconds
  });

  const oddsData = useMemo(() => oddsResponse?.odds || [], [oddsResponse]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Removed redundant manual fetching - now using optimized query hook

  // Real-time odds updates via WebSocket
  useEffect(() => {
    if (!isConnected) return;

    const handleOddsUpdate = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'odds_update') {
          setOddsData(prevData => {
            const updatedData = [...prevData];
            const index = updatedData.findIndex(item => item.id === data.odds.id);

            if (index !== -1) {
              updatedData[index] = {
                ...updatedData[index],
                previousOdds: updatedData[index].currentOdds,
                currentOdds: data.odds.value,
                timestamp: new Date().toISOString()
              };
            } else {
              // Add new odds item
              updatedData.push({
                id: data.odds.id,
                sport: data.odds.sport,
                teams: data.odds.teams,
                currentOdds: data.odds.value,
                previousOdds: null,
                timestamp: new Date().toISOString(),
                eventId: data.odds.eventId,
                bookmaker: data.odds.bookmaker
              });
            }

            return updatedData.slice(0, 20); // Keep only latest 20 items
          });
        }
      } catch (error) {
        console.error('Error processing odds update:', error);
      }
    };

    // Subscribe to WebSocket odds updates
    window.addEventListener('message', handleOddsUpdate);

    return () => {
      window.removeEventListener('message', handleOddsUpdate);
    };
  }, [isConnected]);

  // Fallback polling for odds updates when WebSocket is not available
  useEffect(() => {
    if (isConnected || isPaused) return;

    const updateInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/odds/americanfootball_nfl');
        if (response.ok) {
          const updates = await response.json();
          if (updates && updates.length > 0) {
            setOddsData(prevData => 
              prevData.map(item => {
                const update = updates.find((u: any) => u.id === item.id);
                if (update) {
                  return {
                    ...item,
                    previousOdds: item.currentOdds,
                    currentOdds: update.odds,
                    timestamp: new Date().toISOString()
                  };
                }
                return item;
              })
            );
          }
        }
      } catch (error) {
        console.error('Failed to fetch odds updates:', error);
      }
    }, 30000); // Reduced from 5 seconds to 30 seconds

    return () => clearInterval(updateInterval);
  }, [isConnected, isPaused]);



  // Function to determine if odds have improved or worsened
  const getOddsMovement = (current: number, previous: number | null) => {
    if (previous === null) return 'neutral';
    return current > previous ? 'improved' : current < previous ? 'worsened' : 'neutral';
  };

  // Function to render the odds movement indicator
  const renderOddsIndicator = (movement: string) => {
    if (movement === 'improved') {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (movement === 'worsened') {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getSportColor = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'soccer':
      case 'football':
        return 'bg-green-900/30 text-green-400';
      case 'basketball':
        return 'bg-orange-900/30 text-orange-400';
      case 'tennis':
        return 'bg-gray-900/30 text-gray-400';
      case 'american football':
      case 'nfl':
        return 'bg-blue-900/30 text-blue-400';
      case 'baseball':
        return 'bg-red-900/30 text-red-400';
      case 'esports':
        return 'bg-pink-900/30 text-pink-400';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  if (oddsData.length === 0) {
    return (
      <footer className="bg-background dark:bg-background py-1 overflow-hidden relative border-t border-border">
        {/* Connection status indicator */}
        <div className="absolute top-0 left-0 z-41 bg-background dark:bg-background px-2 h-full flex items-center">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" 
               title="Connecting to live odds feeds..." />
        </div>

        {/* Pause/Play control */}
        <div className="flex items-center absolute top-0 right-0 z-41 bg-background dark:bg-background px-2 h-full">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="text-white p-1 hover:bg-gray-700 rounded transition-colors"
            aria-label={isPaused ? "Play ticker" : "Pause ticker"}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>

        <div className={`flex whitespace-nowrap ${!isPaused ? 'animate-ticker' : ''}`}>
          {/* Continuous loading messages */}
          {Array(6).fill(null).map((_, index) => (
            <div key={index} className="inline-flex items-center mr-12">
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-900/30 text-blue-400 animate-pulse">
                LIVE
              </span>
              <span className="mx-2 text-gray-300 font-medium">
                Connecting to real-time odds feeds...
              </span>
              <span className="font-mono font-bold text-yellow-400 animate-pulse">
                ⚡
              </span>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes ticker {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          .animate-ticker {
            animation: ticker 20s linear infinite;
          }
        `}</style>
      </footer>
    );
  }

  return (
    <footer className="bg-background dark:bg-background py-1 overflow-hidden relative border-t border-border z-40">
      {/* Connection status indicator */}
      <div className="absolute top-0 left-0 z-41 bg-background dark:bg-background px-2 h-full flex items-center">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} 
             title={isConnected ? 'Live updates active' : 'Using fallback updates'} />
      </div>

      {/* Pause/Play control */}
      <div className="flex items-center absolute top-0 right-0 z-41 bg-background dark:bg-background px-2 h-full">
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="text-white p-1 hover:bg-gray-700 rounded transition-colors"
          aria-label={isPaused ? "Play ticker" : "Pause ticker"}
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
      </div>

      <div 
        className={`flex whitespace-nowrap ${!isPaused ? 'animate-ticker' : ''}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Optimized render using memoized components */}
        {[...oddsData, ...oddsData].map((item, index) => (
          <MemoizedOddsItem key={`${item.id}-${index}`} item={item} />
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-ticker {
          animation: ticker 80s linear infinite;
        }
      `}</style>
    </footer>
  );
});

OddsTicker.displayName = 'OddsTicker';

export default OddsTicker;