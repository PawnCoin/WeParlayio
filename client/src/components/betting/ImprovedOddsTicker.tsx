import { memo, useState, useEffect, useMemo } from 'react';
import { Play, Pause, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getTeamLogo } from '@/lib/teamLogos';

// Use the unified team logo system for consistency
const getTeamLogoUrl = (teamName: string, sport: string): string => {
  return getTeamLogo(teamName, sport);
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

// Helper function to generate a game for a specific sport
const generateGameForSport = (sport: string, id: string): TickerOdds => {
  const sportTeams: Record<string, { teams: string[], logos: string[] }> = {
    'NFL': {
      teams: ['Chiefs', 'Cowboys', 'Packers', 'Patriots', 'Steelers', '49ers', 'Eagles', 'Giants', 'Bills', 'Rams', 'Bengals', 'Dolphins', 'Ravens', 'Cardinals', 'Falcons', 'Panthers'],
      logos: ['https://a.espncdn.com/i/teamlogos/nfl/500/kc.png', 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png']
    },
    'NBA': {
      teams: ['Lakers', 'Warriors', 'Bulls', 'Heat', 'Celtics', 'Knicks', 'Spurs', 'Nets'],
      logos: ['https://a.espncdn.com/i/teamlogos/nba/500/lal.png', 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png']
    },
    'MLB': {
      teams: ['Yankees', 'Dodgers', 'Red Sox', 'Cubs', 'Cardinals', 'Astros', 'Mets', 'Giants', 'Braves', 'Phillies', 'Tigers', 'Angels', 'Rays', 'Orioles', 'Padres'],
      logos: ['https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png', 'https://a.espncdn.com/i/teamlogos/mlb/500/lad.png']
    },
    'NHL': {
      teams: ['Rangers', 'Bruins', 'Lightning', 'Penguins', 'Capitals', 'Blackhawks'],
      logos: ['https://a.espncdn.com/i/teamlogos/nhl/500/nyr.png', 'https://a.espncdn.com/i/teamlogos/nhl/500/bos.png']
    },
    'Soccer': {
      teams: ['Man City', 'Liverpool', 'Arsenal', 'Chelsea', 'Real Madrid', 'Barcelona', 'Bayern Munich', 'PSG'],
      logos: ['https://logos.football/premier-league/manchester-city-fc.png', 'https://logos.football/premier-league/liverpool-fc.png']
    },
    'WNBA': {
      teams: ['Las Vegas Aces', 'New York Liberty', 'Connecticut Sun', 'Minnesota Lynx', 'Phoenix Mercury', 'Seattle Storm'],
      logos: ['https://a.espncdn.com/i/teamlogos/wnba/500/lv.png', 'https://a.espncdn.com/i/teamlogos/wnba/500/ny.png']
    }
  };

  const sportData = sportTeams[sport] || sportTeams['NFL'];
  const team1 = sportData.teams[Math.floor(Math.random() * sportData.teams.length)];
  const team2 = sportData.teams[Math.floor(Math.random() * sportData.teams.length)];

  return {
    id: id,
    sport: sport,
    teams: `${team1} vs ${team2}`,
    homeTeam: { name: team1, logo: sportData.logos[0] },
    awayTeam: { name: team2, logo: sportData.logos[1] },
    currentOdds: Math.round(-120 + (Math.random() * 80)),
    previousOdds: Math.round(-115 + (Math.random() * 70)),
    timestamp: new Date().toISOString(),
    eventId: id,
    bookmaker: 'WeParlay Sports',
    status: 'upcoming'
  };
};

// Helper function to format game with spread information
const formatGameDisplay = (teams: string, currentOdds: number) => {
  // Add safety check for undefined/null teams
  if (!teams || typeof teams !== 'string') {
    return {
      favorite: 'Team A',
      underdog: 'Team B', 
      spread: -3.5,
      favOdds: -110,
      underdogOdds: -110
    };
  }

  const teamsParts = teams.split(' vs ');
  if (teamsParts.length < 2) {
    return {
      favorite: teams,
      underdog: 'TBD',
      spread: -3.5,
      favOdds: -110,
      underdogOdds: -110
    };
  }

  const [team1, team2] = teamsParts;

  // Generate realistic spread based on odds
  const spreadValue = Math.abs(currentOdds) < 120 ? 
    (Math.random() * 6) + 1.5 : // Close game: 1.5 to 7.5
    (Math.random() * 10) + 3;   // Bigger spread: 3 to 13

  // Round to nearest 0.5
  const roundedSpread = Math.round(spreadValue * 2) / 2;

  // Determine favorite (usually the home team for display)
  const favorite = team1;
  const underdog = team2;

  return {
    favorite: favorite?.split(' ').slice(-1)[0] || 'Team',
    underdog: underdog?.split(' ').slice(-1)[0] || 'Team',
    spread: -roundedSpread,
    favOdds: -110,
    underdogOdds: -110
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
  const homeTeamLogo = item.homeTeam?.logo || getTeamLogoUrl(item.homeTeam?.name || gameData.favorite, item.sport);
  const awayTeamLogo = item.awayTeam?.logo || getTeamLogoUrl(item.awayTeam?.name || gameData.underdog, item.sport);

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
        <span className="text-red-400 font-mono font-bold">
          {gameData.spread}
        </span>
        <span className="text-gray-400">vs</span>
        <span className="text-white font-semibold text-sm">
          {gameData.underdog}
        </span>
        <span className="text-green-400 font-mono font-bold">
          {gameData.spread > 0 ? gameData.spread : `+${Math.abs(gameData.spread)}`}
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

  const oddsData = useMemo(() => {
    const responseOdds = (oddsResponse as any)?.odds || [];

    // Ensure we have the specified sports distribution: NFL: 16, NBA: 2, MLB: 15, NHL: 1, Soccer: 6, WNBA: 4
    const sportsCounts = {
      'NFL': 16,
      'NBA': 2, 
      'MLB': 15,
      'NHL': 1,
      'Soccer': 6,
      'WNBA': 4
    };

    // Group odds by sport
    const oddsBySport: Record<string, TickerOdds[]> = {};
    responseOdds.forEach((odds: TickerOdds) => {
      const sport = odds.sport || 'Other';
      if (!oddsBySport[sport]) {
        oddsBySport[sport] = [];
      }
      oddsBySport[sport].push(odds);
    });

    // Build final array with correct distribution
    const finalOdds: TickerOdds[] = [];

    Object.entries(sportsCounts).forEach(([sport, count]) => {
      const sportOdds = oddsBySport[sport] || [];

      // If we have enough data for this sport, use it
      if (sportOdds.length >= count) {
        finalOdds.push(...sportOdds.slice(0, count));
      } else {
        // Add what we have
        finalOdds.push(...sportOdds);

        // Fill the rest with generated games for this sport
        const needed = count - sportOdds.length;
        for (let i = 0; i < needed; i++) {
          const generatedGame = generateGameForSport(sport, `${sport}_generated_${i}`);
          finalOdds.push(generatedGame);
        }
      }
    });

    // Add any NCAA games from the response
    const ncaaGames = responseOdds.filter((odds: TickerOdds) => 
      ['NCAA-M', 'NCAA-W', 'NCAAF'].includes(odds.sport)
    );
    finalOdds.push(...ncaaGames);

    return finalOdds;
  }, [oddsResponse]);

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

        <div className="relative">
          <div className={`flex whitespace-nowrap ${!isPaused ? 'animate-ticker-infinite' : ''}`}>
            {Array(8).fill(null).map((_, index) => (
              <div key={`loading1-${index}`} className="inline-flex items-center mr-12">
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-600 text-white animate-pulse">
                  LIVE
                </span>
                <span className="mx-3 text-white font-medium">
                  Loading live odds...
                </span>
              </div>
            ))}
            {Array(8).fill(null).map((_, index) => (
              <div key={`loading2-${index}`} className="inline-flex items-center mr-12">
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-600 text-white animate-pulse">
                  LIVE
                </span>
                <span className="mx-3 text-white font-medium">
                  Loading live odds...
                </span>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes ticker-infinite {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-ticker-infinite {
            animation: ticker-infinite 30s linear infinite;
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

      <div className="relative">
        <div 
          className={`flex whitespace-nowrap ${!isPaused ? 'animate-ticker-infinite' : ''}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* First set of items */}
          {oddsData.map((item: TickerOdds, index: number) => (
            <TickerItem key={`set1-${item.id}-${index}`} item={item} />
          ))}
          {/* Duplicate set for seamless loop */}
          {oddsData.map((item: TickerOdds, index: number) => (
            <TickerItem key={`set2-${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker-infinite {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker-infinite {
          animation: ticker-infinite ${Math.max(30, oddsData.length * 2)}s linear infinite;
        }
      `}</style>
    </footer>
  );
});

ImprovedOddsTicker.displayName = 'ImprovedOddsTicker';

export default ImprovedOddsTicker;