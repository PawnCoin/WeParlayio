import { memo, useState, useEffect, useMemo } from 'react';
import { Play, Pause, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Real team logo URLs using reliable sports logo services
const getTeamLogoUrl = (teamName: string, sport: string): string => {
  // ESPN Logo CDN - reliable source for team logos
  const cleanTeamName = teamName.trim();
  
  // NFL team logo mappings
  const nflLogos: { [key: string]: string } = {
    'Chiefs': 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png',
    'Cowboys': 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png',
    'Packers': 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
    'Patriots': 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
    'Steelers': 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png',
    '49ers': 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png',
    'Eagles': 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png',
    'Giants': 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png',
    'Bills': 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png',
    'Rams': 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png',
    'Bengals': 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png',
    'Dolphins': 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png'
  };
  
  // NBA team logo mappings
  const nbaLogos: { [key: string]: string } = {
    'Lakers': 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
    'Warriors': 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png',
    'Bulls': 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    'Heat': 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
    'Celtics': 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    'Knicks': 'https://a.espncdn.com/i/teamlogos/nba/500/nyk.png',
    'Spurs': 'https://a.espncdn.com/i/teamlogos/nba/500/sa.png',
    'Nets': 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png'
  };
  
  // MLB team logo mappings
  const mlbLogos: { [key: string]: string } = {
    'Yankees': 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png',
    'Dodgers': 'https://a.espncdn.com/i/teamlogos/mlb/500/lad.png',
    'Red Sox': 'https://a.espncdn.com/i/teamlogos/mlb/500/bos.png',
    'Cubs': 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    'Cardinals': 'https://a.espncdn.com/i/teamlogos/mlb/500/stl.png',
    'Astros': 'https://a.espncdn.com/i/teamlogos/mlb/500/hou.png',
    'Mets': 'https://a.espncdn.com/i/teamlogos/mlb/500/nym.png'
  };
  
  // Check sport-specific logos
  if (sport === 'NFL') {
    for (const [team, url] of Object.entries(nflLogos)) {
      if (cleanTeamName.includes(team)) return url;
    }
  } else if (sport === 'NBA') {
    for (const [team, url] of Object.entries(nbaLogos)) {
      if (cleanTeamName.includes(team)) return url;
    }
  } else if (sport === 'MLB') {
    for (const [team, url] of Object.entries(mlbLogos)) {
      if (cleanTeamName.includes(team)) return url;
    }
  }
  
  // Fallback to generic sport logo
  const sportLogos: { [key: string]: string } = {
    'NFL': 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
    'NBA': 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png', 
    'MLB': 'https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png',
    'NHL': 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
    'Soccer': 'https://a.espncdn.com/i/teamlogos/soccer/500/generic.png'
  };
  
  return sportLogos[sport] || 'https://a.espncdn.com/i/teamlogos/default/500/default.png';
};

interface TickerOdds {
  id: string;
  sport: string;
  teams: string;
  homeTeam?: { name: string; logo?: string };
  awayTeam?: { name: string; logo?: string };
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

  // Get team logos from API data or fallback to service
  const homeTeamLogo = item.homeTeam?.logo || getTeamLogoUrl(gameData.favorite, item.sport);
  const awayTeamLogo = item.awayTeam?.logo || getTeamLogoUrl(gameData.underdog, item.sport);
  
  return (
    <div className="inline-flex items-center mr-8 px-2 py-1 min-w-max">
      <div className="flex items-center space-x-1 mr-2">
        <img 
          src={homeTeamLogo} 
          alt={gameData.favorite} 
          className="w-6 h-6 rounded-sm object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getTeamLogoUrl(gameData.favorite, item.sport);
          }}
        />
        <span className="text-gray-400 text-xs">vs</span>
        <img 
          src={awayTeamLogo} 
          alt={gameData.underdog} 
          className="w-6 h-6 rounded-sm object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getTeamLogoUrl(gameData.underdog, item.sport);
          }}
        />
      </div>
      
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