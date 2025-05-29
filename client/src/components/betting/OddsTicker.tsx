
import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

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

const OddsTicker: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [oddsData, setOddsData] = useState<OddsItem[]>([]);
  const { isConnected } = useWebSocket();

  // Fetch initial odds data from real API
  useEffect(() => {
    const fetchOddsData = async () => {
      try {
        const response = await fetch('/api/odds/live-ticker');
        if (response.ok) {
          const data = await response.json();
          setOddsData(data.odds || []);
        }
      } catch (error) {
        console.error('Failed to fetch odds data:', error);
        // Don't set mock data, leave empty to show loading message
      }
    };

    fetchOddsData();
  }, []);

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
        const response = await fetch('/api/odds/live-updates');
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
    }, 5000);

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
        return 'bg-purple-900/30 text-purple-400';
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
      <footer className="bg-gray-900 py-1 overflow-hidden relative">
        {/* Connection status indicator */}
        <div className="absolute top-0 left-0 z-10 bg-gray-900 px-2 h-full flex items-center">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" 
               title="Connecting to live odds feeds..." />
        </div>

        {/* Pause/Play control */}
        <div className="flex items-center absolute top-0 right-0 z-10 bg-gray-900 px-2 h-full">
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

        <style jsx>{`
          @keyframes ticker {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          .animate-ticker {
            animation: ticker 30s linear infinite;
          }
        `}</style>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 py-1 overflow-hidden relative">
      {/* Connection status indicator */}
      <div className="absolute top-0 left-0 z-10 bg-gray-900 px-2 h-full flex items-center">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} 
             title={isConnected ? 'Live updates active' : 'Using fallback updates'} />
      </div>

      {/* Pause/Play control */}
      <div className="flex items-center absolute top-0 right-0 z-10 bg-gray-900 px-2 h-full">
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
        {/* Repeat the data twice to ensure continuous scrolling */}
        {[...oddsData, ...oddsData].map((item, index) => {
          const movement = getOddsMovement(item.currentOdds, item.previousOdds);
          return (
            <div key={`${item.id}-${index}`} className="inline-flex items-center mr-8">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${getSportColor(item.sport)}`}>
                {item.sport}
              </span>
              
              <span className="mx-2 text-gray-300 font-medium">
                {item.teams}
              </span>
              
              <span className={`font-mono font-bold flex items-center ${
                movement === 'improved' ? 'text-green-400' :
                movement === 'worsened' ? 'text-red-400' : 'text-white'
              }`}>
                {item.currentOdds.toFixed(2)}
                {renderOddsIndicator(movement)}
              </span>

              {item.bookmaker && (
                <span className="ml-1 text-xs text-gray-500">
                  {item.bookmaker}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-ticker {
          animation: ticker 120s linear infinite;
        }
      `}</style>
    </footer>
  );
};

export default OddsTicker;
