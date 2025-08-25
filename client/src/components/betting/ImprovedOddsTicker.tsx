import { memo, useState, useEffect, useMemo } from 'react';
import { Play, Pause, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Team logo mapping for popular teams
const getTeamLogo = (teamName: string): string => {
  const logoMap: { [key: string]: string } = {
    // NFL
    'Chiefs': '🏈', 'Cowboys': '⭐', 'Packers': '🧀', 'Patriots': '🦅',
    'Steelers': '⚫', '49ers': '🔴', 'Eagles': '🦅', 'Giants': '🔵',
    'Bills': '🦬', 'Rams': '🐏', 'Bengals': '🐅', 'Dolphins': '🐬',
    // NBA
    'Lakers': '💜', 'Warriors': '⚡', 'Bulls': '🐂', 'Heat': '🔥',
    'Celtics': '🍀', 'Knicks': '🗽', 'Spurs': '⚫', 'Nets': '🕷️',
    // MLB
    'Yankees': '🏟️', 'Dodgers': '💙', 'Red Sox': '❤️', 'BaseballGiants': '🧡',
    'Cubs': '🐻', 'Cardinals': '🐦', 'Astros': '⭐', 'Mets': '🟠',
    // Soccer
    'Manchester': '⚽', 'Liverpool': '🔴', 'Barcelona': '💙', 'Real': '👑',
    'Arsenal': '🔴', 'Chelsea': '💙', 'United': '🔴', 'City': '💙',
    // Combat Sports
    'Jones': '🥊', 'Crawford': '🥊', 'Canelo': '🥊', 'Adesanya': '🥊',
    'Djokovic': '🎾', 'Alcaraz': '🎾', 'Swiatek': '🎾', 'Sabalenka': '🎾',
    // Esports
    'FaZe': '🎮', 'G2': '🎮', 'T1': '🎮', 'SEN': '🎮', 'TSM': '🎮',
    'Cloud9': '☁️', '100T': '💯', 'Gen.G': '🎮'
  };
  
  for (const [team, logo] of Object.entries(logoMap)) {
    if (teamName.includes(team)) return logo;
  }
  
  // Default sport logos based on team name patterns
  if (teamName.includes('vs')) {
    if (teamName.includes('CS2') || teamName.includes('LoL') || teamName.includes('Valorant')) return '🎮';
    if (teamName.includes('UFC') || teamName.includes('Boxing')) return '🥊';
    if (teamName.includes('ATP') || teamName.includes('WTA')) return '🎾';
    if (teamName.includes('PGA') || teamName.includes('LPGA')) return '⛳';
    return '⚔️';
  }
  
  return '🏆'; // Default logo
};

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
  // Add safety check for undefined/null teams
  if (!teams || typeof teams !== 'string') {
    return {
      favorite: 'Team A',
      underdog: 'Team B', 
      favOdds: currentOdds || -110,
      underdogOdds: '+110'
    };
  }

  const teamsParts = teams.split(' vs ');
  if (teamsParts.length < 2) {
    return {
      favorite: teams,
      underdog: 'TBD',
      favOdds: currentOdds || -110,
      underdogOdds: '+110'
    };
  }

  const [team1, team2] = teamsParts;
  
  // In American odds: negative = favorite (better chance), positive = underdog
  const isFavorite = currentOdds < 0;
  const favorite = isFavorite ? team1 : team2;
  const underdog = isFavorite ? team2 : team1;
  
  // Create realistic odds pair
  const favOdds = isFavorite ? currentOdds : -(Math.abs(currentOdds) + 20);
  const underdogOdds = isFavorite ? (Math.abs(currentOdds) + 15) : Math.abs(currentOdds);
  
  return {
    favorite: favorite?.split(' ').slice(-1)[0] || 'Team',
    underdog: underdog?.split(' ').slice(-1)[0] || 'Team',
    favOdds,
    underdogOdds: `+${underdogOdds}`
  };
};

const TickerItem = memo(({ item }: { item: TickerOdds }) => {
  // Add safety check for item data
  if (!item) return null;
  
  const gameData = formatGameDisplay(item.teams, item.currentOdds);
  
  const getSportColor = (sport: string) => {
    const colors: Record<string, string> = {
      'NBA': 'bg-orange-600 text-white',
      'NFL': 'bg-green-600 text-white', 
      'MLB': 'bg-blue-600 text-white',
      'NHL': 'bg-red-600 text-white',
      'Soccer': 'bg-emerald-600 text-white',
      'WNBA': 'bg-orange-500 text-white',
      'Boxing': 'bg-red-700 text-white',
      'UFC': 'bg-red-800 text-white',
      'ATP': 'bg-yellow-600 text-white',
      'WTA': 'bg-pink-600 text-white',
      'PGA': 'bg-green-700 text-white',
      'LPGA': 'bg-green-500 text-white',
      'Esports': 'bg-purple-600 text-white',
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
      <span className="text-2xl mr-2">{getTeamLogo(item.teams)}</span>
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

  const oddsData = useMemo(() => (oddsResponse as any)?.odds || [], [oddsResponse]);

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
          animation: ticker 30s linear infinite;
        }
      `}</style>
    </footer>
  );
});

ImprovedOddsTicker.displayName = 'ImprovedOddsTicker';

export default ImprovedOddsTicker;