import { memo, useState, useEffect, useMemo } from 'react';
import { Play, Pause, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface TickerOdds {
  id: string;
  sport: string;
  teams: string;
  currentOdds: number;
  previousOdds: number | null;
  timestamp: string;
  eventId?: string;
  bookmaker?: string;
  status?: string;
}

// Helper function to format game as favorite vs underdog with +/- odds
const formatGameDisplay = (teams: string, currentOdds: number) => {
  const [team1, team2] = teams.split(' vs ');
  
  // In American odds: negative = favorite (better chance), positive = underdog
  const isFavorite = currentOdds < 0;
  const favorite = isFavorite ? team1 : team2;
  const underdog = isFavorite ? team2 : team1;
  
  // Create realistic odds pair
  const favOdds = isFavorite ? currentOdds : -(Math.abs(currentOdds) + 20);
  const underdogOdds = isFavorite ? (Math.abs(currentOdds) + 15) : Math.abs(currentOdds);
  
  return {
    favorite: favorite.split(' ').slice(-1)[0], // Last word (team name)
    underdog: underdog.split(' ').slice(-1)[0], // Last word (team name)
    favOdds,
    underdogOdds: `+${underdogOdds}`
  };
};

const TickerItem = memo(({ item }: { item: TickerOdds }) => {
  const gameData = formatGameDisplay(item.teams, item.currentOdds);
  
  const getSportColor = (sport: string) => {
    const colors: Record<string, string> = {
      'NBA': 'bg-orange-600 text-white',
      'NFL': 'bg-green-600 text-white', 
      'MLB': 'bg-blue-600 text-white',
      'NHL': 'bg-red-600 text-white',
      'Soccer': 'bg-emerald-600 text-white',
      'WNBA': 'bg-orange-500 text-white',
    };
    return colors[sport] || 'bg-gray-500 text-white';
  };

  const trendIcon = useMemo(() => {
    if (item.previousOdds === null) return null;
    
    const isImproved = item.currentOdds > (item.previousOdds || 0);
    return isImproved ? 
      <TrendingUp className="h-3 w-3 text-green-400 ml-1" /> : 
      <TrendingDown className="h-3 w-3 text-red-400 ml-1" />;
  }, [item.currentOdds, item.previousOdds]);

  return (
    <div className="inline-flex items-center mr-8 px-2 py-1 min-w-max">
      <span className={`px-2 py-0.5 text-xs font-bold rounded mr-3 ${getSportColor(item.sport)}`}>
        {item.sport}
      </span>
      
      <div className="flex items-center space-x-2">
        <span className="text-white font-semibold text-sm">
          {gameData.favorite}
        </span>
        <span className="text-green-400 font-mono font-bold">
          {gameData.favOdds}
        </span>
        <span className="text-gray-400">vs</span>
        <span className="text-white font-semibold text-sm">
          {gameData.underdog}
        </span>
        <span className="text-yellow-400 font-mono font-bold">
          {gameData.underdogOdds}
        </span>
        {trendIcon}
      </div>
    </div>
  );
});

TickerItem.displayName = 'TickerItem';

const ImprovedOddsTicker = memo(() => {
  const [isPaused, setIsPaused] = useState(false);

  // Fetch live ticker data
  const { data: oddsResponse } = useQuery({
    queryKey: ['/api/odds-ticker/live-ticker'],
    refetchInterval: 30000, // Update every 30 seconds
  });

  const oddsData = useMemo(() => oddsResponse?.odds || [], [oddsResponse]);

  if (oddsData.length === 0) {
    return (
      <footer className="bg-black py-2 overflow-hidden relative border-t border-gray-800">
        <div className="absolute top-0 right-0 z-10 px-2 h-full flex items-center">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="text-white p-1 hover:bg-gray-700 rounded"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>

        <div className={`flex whitespace-nowrap ${!isPaused ? 'animate-ticker' : ''}`}>
          {Array(3).fill(null).map((_, index) => (
            <div key={index} className="inline-flex items-center mr-12">
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-600 text-white">
                LIVE
              </span>
              <span className="mx-3 text-white font-medium">
                Loading live odds...
              </span>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes ticker {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-ticker {
            animation: ticker 20s linear infinite;
          }
        `}</style>
      </footer>
    );
  }

  return (
    <footer className="bg-black py-2 overflow-hidden relative border-t border-gray-800">
      <div className="absolute top-0 right-0 z-10 px-2 h-full flex items-center">
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="text-white p-1 hover:bg-gray-700 rounded"
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
      </div>

      <div 
        className={`flex whitespace-nowrap ${!isPaused ? 'animate-ticker' : ''}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Duplicate the data for continuous scrolling */}
        {[...oddsData, ...oddsData].map((item, index) => (
          <TickerItem key={`${item.id}-${index}`} item={item} />
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker {
          animation: ticker 60s linear infinite;
        }
      `}</style>
    </footer>
  );
});

ImprovedOddsTicker.displayName = 'ImprovedOddsTicker';

export default ImprovedOddsTicker;