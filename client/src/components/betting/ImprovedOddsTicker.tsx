import React, { memo, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, Wifi, WifiOff, AlertCircle, Loader, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import EventPreviewModal from './EventPreviewModal';
import { AssetManager } from '@/lib/assetManager';

// Types for the ticker
interface Team {
  name: string;
  logo?: string;
  abbreviation?: string;
}

interface TickerOdds {
  id: string;
  sport: string;
  teams: string;
  homeTeam: Team;
  awayTeam: Team;
  gameState: 'live' | 'upcoming' | 'final';
  odds?: {
    details: string;
    overUnder: string;
  };
  timestamp: string;
  eventId: string;
  status: string;
  hasLiveScore?: boolean;
  liveScore?: {
    homeScore: number;
    awayScore: number;
    period: string;
    timeRemaining: string;
    isBreaking: boolean;
  };
}

const SPORT_ENDPOINTS = {
    'NFL': 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
    'NBA': 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
    'MLB': 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
    'NHL': 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
    'NCAAF': 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard',
    'NCAAB': 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard',
    'WNBA': 'https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard',
    'EPL': 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
    'La Liga': 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard',
    'Serie A': 'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard',
    'Bundesliga': 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard',
    'MLS': 'https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard',
};

// Get sport colors for visual enhancement
const getSportColors = (sport: string): { primary: string; secondary: string; accent: string } => {
  const colorMap: { [key: string]: { primary: string; secondary: string; accent: string } } = {
    'NFL': { primary: 'rgb(1, 51, 105)', secondary: 'rgb(198, 12, 48)', accent: 'rgb(255, 255, 255)' },
    'NBA': { primary: 'rgb(200, 16, 46)', secondary: 'rgb(29, 66, 138)', accent: 'rgb(255, 255, 255)' },
    'MLB': { primary: 'rgb(0, 50, 120)', secondary: 'rgb(196, 8, 8)', accent: 'rgb(255, 255, 255)' },
    'NHL': { primary: 'rgb(0, 0, 0)', secondary: 'rgb(206, 17, 38)', accent: 'rgb(255, 255, 255)' },
    'NCAAF': { primary: 'rgb(0, 33, 165)', secondary: 'rgb(232, 119, 34)', accent: 'rgb(255, 255, 255)' },
    'NCAAB': { primary: 'rgb(0, 33, 165)', secondary: 'rgb(232, 119, 34)', accent: 'rgb(255, 255, 255)' },
    'WNBA': { primary: 'rgb(255, 99, 25)', secondary: 'rgb(196, 8, 8)', accent: 'rgb(255, 255, 255)' },
    'EPL': { primary: 'rgb(56, 0, 60)', secondary: 'rgb(0, 255, 135)', accent: 'rgb(255, 255, 255)' },
    'MLS': { primary: 'rgb(105, 175, 225)', secondary: 'rgb(237, 23, 36)', accent: 'rgb(255, 255, 255)' }
  };
  
  return colorMap[sport] || { primary: 'rgb(107, 114, 128)', secondary: 'rgb(156, 163, 175)', accent: 'rgb(255, 255, 255)' };
};

// Get league logo URL
const getLeagueLogoUrl = (sport: string): string => {
  const leagueLogos: { [key: string]: string } = {
    'NFL': 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
    'NBA': 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
    'MLB': 'https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png',
    'NHL': 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
    'NCAAF': 'https://a.espncdn.com/i/teamlogos/leagues/500/ncf.png',
    'NCAAB': 'https://a.espncdn.com/i/teamlogos/leagues/500/ncb.png',
    'WNBA': 'https://a.espncdn.com/i/teamlogos/leagues/500/wnba.png',
    'EPL': 'https://a.espncdn.com/i/teamlogos/soccer/500/23.png',
    'MLS': 'https://a.espncdn.com/i/teamlogos/soccer/500/mls.png'
  };
  
  return leagueLogos[sport] || 'https://a.espncdn.com/i/teamlogos/default/500/default.png';
};

const parseEspnData = (rawData: any, sport: string): TickerOdds[] => {
    const events = rawData?.events || [];
    return events.map((event: any): TickerOdds | null => {
        try {
            const competition = event.competitions[0];
            if (!competition || !competition.competitors) return null;

            const status = competition.status;
            const statusName = status.type.name;
            
            let gameState: TickerOdds['gameState'];
            if (statusName === 'STATUS_IN_PROGRESS') {
                gameState = 'live';
            } else if (statusName === 'STATUS_SCHEDULED') {
                gameState = 'upcoming';
            } else if (status.type.completed) {
                gameState = 'final';
            } else {
                return null;
            }

            const home = competition.competitors.find((c: any) => c.homeAway === 'home');
            const away = competition.competitors.find((c: any) => c.homeAway === 'away');
            if (!home || !away) return null;

            // Robust odds lookup: Prefer DraftKings, but fall back to the first available provider.
            let oddsData = (competition.odds || []).find((o: any) => o.provider.name.toLowerCase().includes('draftkings'));
            if (!oddsData && competition.odds && competition.odds.length > 0) {
                oddsData = competition.odds[0]; // Fallback to the first available provider
            }

            const homeTeam: Team = { name: home.team.displayName, logo: home.team.logo, abbreviation: home.team.abbreviation };
            const awayTeam: Team = { name: away.team.displayName, logo: away.team.logo, abbreviation: away.team.abbreviation };

            return {
                id: event.id,
                sport,
                teams: event.name,
                homeTeam,
                awayTeam,
                gameState,
                odds: oddsData ? { details: oddsData.details, overUnder: oddsData.overUnder } : undefined,
                timestamp: event.date,
                eventId: event.id,
                status: status.type.shortDetail,
                hasLiveScore: gameState === 'live' || gameState === 'final',
                liveScore: (gameState === 'live' || gameState === 'final') ? {
                    homeScore: parseInt(home.score, 10) || 0,
                    awayScore: parseInt(away.score, 10) || 0,
                    period: status.period.toString(),
                    timeRemaining: status.displayClock,
                    isBreaking: false,
                } : undefined
            };
        } catch (error) {
            console.error('Error parsing event:', event, error);
            return null;
        }
    }).filter((item: TickerOdds | null): item is TickerOdds => item !== null);
};

const LiveGameIndicator = ({ isLive }: { isLive: boolean; }) => {
  if (!isLive) return null;
  return (
    <div className="flex items-center gap-1">
      <div className={'relative flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-red-400 text-white'}>
        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
        <span>{'LIVE'}</span>
      </div>
    </div>
  );
};

const AnimatedScore = ({ homeScore, awayScore, period, timeRemaining }: {
  homeScore: number; awayScore: number; period: string; timeRemaining: string;
}) => (
    <div className="bg-black/20 rounded-lg px-3 py-2 backdrop-blur-sm">
      <div className="flex items-center justify-between text-sm font-bold text-white">
        <span className="transition-all duration-300 hover:scale-110">{homeScore}</span>
        <span className="text-xs text-gray-300 mx-2">-</span>
        <span className="transition-all duration-300 hover:scale-110">{awayScore}</span>
      </div>
      <div className="text-xs text-center text-gray-300 mt-1">
        {period} {timeRemaining && `• ${timeRemaining}`}
      </div>
    </div>
);

const FinalScore = ({ homeScore, awayScore }: { homeScore: number; awayScore: number; }) => (
    <div className="bg-gray-700/30 rounded-lg px-3 py-2 backdrop-blur-sm">
      <div className="flex items-center justify-between text-sm font-bold text-white">
        <span>{homeScore}</span>
        <span className="text-xs text-gray-400 mx-2">-</span>
        <span>{awayScore}</span>
      </div>
      <div className="text-xs text-center text-gray-400 mt-1 font-semibold">
        FINAL
      </div>
    </div>
);

const FormattedSpread = ({ odds, homeTeam, awayTeam }: { odds?: TickerOdds['odds'], homeTeam: Team, awayTeam: Team }) => {
    if (!odds?.details || odds.details.toLowerCase() === 'even') {
        return <div className="text-sm font-mono font-bold text-gray-500">N/A</div>;
    }

    const parts = odds.details.split(' ');
    if (parts.length < 2) {
        return <div className="text-sm font-mono font-bold text-green-400">{odds.details}</div>;
    }

    const teamAbbr = parts[0];
    const spreadValue = parseFloat(parts[1]);

    if (isNaN(spreadValue)) {
        return <div className="text-sm font-mono font-bold text-green-400">{odds.details}</div>;
    }

    let homeSpread: number, awaySpread: number;

    if (teamAbbr.toUpperCase() === homeTeam.abbreviation?.toUpperCase()) {
        homeSpread = spreadValue;
        awaySpread = -spreadValue;
    } else {
        awaySpread = spreadValue;
        homeSpread = -spreadValue;
    }

    const formatSpread = (spread: number) => (spread > 0 ? `+${spread.toFixed(1)}` : spread.toFixed(1));

    return (
        <div className="text-xs font-mono font-bold text-green-400 leading-tight">
            <div>{homeTeam.abbreviation}: {formatSpread(homeSpread)}</div>
            <div>{awayTeam.abbreviation}: {formatSpread(awaySpread)}</div>
        </div>
    );
};

// Enhanced team logo component
const EnhancedTeamLogo = ({ src, teamName, sport, size = "w-6 h-6" }: { 
  src: string; 
  teamName: string; 
  sport: string; 
  size?: string; 
}) => {
  const [imageError, setImageError] = useState(false);
  
  if (imageError) {
    return (
      <div className={`${size} flex items-center justify-center bg-gray-600 rounded-full text-xs font-bold text-white`}>
        {teamName.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
      </div>
    );
  }
  
  return (
    <img 
      src={src || AssetManager.getTeamLogo(teamName, sport)} 
      alt={`${teamName} logo`} 
      className={`${size} object-contain`}
      onError={() => setImageError(true)}
    />
  );
};

// Skeleton loading component
const TickerItemSkeleton = () => (
  <div className="inline-flex items-center px-3 py-2 mr-4 min-w-max">
    <div className="animate-pulse flex items-center gap-2">
      <div className="w-6 h-6 bg-gray-600 rounded"></div>
      <div className="w-16 h-4 bg-gray-600 rounded"></div>
      <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
      <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
      <div className="w-20 h-8 bg-gray-600 rounded"></div>
    </div>
  </div>
);

const TickerItem = memo(({ item, onClick }: { 
  item: TickerOdds; 
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; 
}) => {
  if (!item) return null;
  
  const { sport, homeTeam, awayTeam, gameState, liveScore, odds, timestamp, status } = item;
  const sportColors = getSportColors(sport);
  
  const homeTeamLogo = homeTeam.logo || AssetManager.getTeamLogo(homeTeam.name, sport);
  const awayTeamLogo = awayTeam.logo || AssetManager.getTeamLogo(awayTeam.name, sport);
  const leagueLogo = getLeagueLogoUrl(sport);

  const gameTime = useMemo(() => {
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: true,
      }).format(date);
    } catch { return status; }
  }, [timestamp, status]);
  
  const isLive = gameState === 'live';

  return (
    <button 
      className={`inline-flex items-center text-left px-3 py-2 mr-4 min-w-max cursor-pointer rounded-lg transition-all duration-300 border ${
        isLive ? 'border-red-500/30 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20' 
               : 'border-gray-800/50 bg-gray-800/50 hover:bg-gray-700/50'
      }`}
      onClick={onClick} aria-label={`View details for ${item.teams}`}
      style={{ background: isLive ? `linear-gradient(135deg, ${sportColors.primary}20, ${sportColors.secondary}10)` : undefined }}
    >
      <div className="flex items-center gap-2 mr-3">
        <img src={leagueLogo} alt={`${sport} logo`} className="h-6 w-auto object-contain"/>
        <LiveGameIndicator isLive={isLive} />
      </div>

      <div className="flex items-center space-x-1 mr-2">
        <EnhancedTeamLogo src={homeTeamLogo} teamName={homeTeam.name} sport={sport} size="w-6 h-6" />
        <span className="text-gray-400 text-xs">vs</span>
        <EnhancedTeamLogo src={awayTeamLogo} teamName={awayTeam.name} sport={sport} size="w-6 h-6" />
      </div>

      {gameState === 'live' && liveScore ? (
        <AnimatedScore {...liveScore} />
      ) : gameState === 'final' && liveScore ? (
        <FinalScore homeScore={liveScore.homeScore} awayScore={liveScore.awayScore} />
      ) : (
        <div className="flex items-center gap-4">
            <div className="flex flex-col">
                <div className="flex items-center gap-1 text-sm font-semibold text-white">
                    <span className="truncate max-w-[120px]" title={homeTeam.name}>{homeTeam.name}</span>
                    <span className="text-gray-400 text-xs">@</span>
                    <span className="truncate max-w-[120px]" title={awayTeam.name}>{awayTeam.name}</span>
                </div>
                 <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Clock size={12} />
                    <span>{gameTime}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-center">
                    <div className="text-xs text-gray-400 font-semibold">Spread</div>
                    <FormattedSpread odds={odds} homeTeam={homeTeam} awayTeam={awayTeam} />
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-400 font-semibold">O/U</div>
                    <div className="text-sm font-mono font-bold text-yellow-400">{odds?.overUnder || 'N/A'}</div>
                </div>
            </div>
        </div>
      )}
    </button>
  );
});
TickerItem.displayName = 'TickerItem';

const fetchScoresForScope = async (scope: string = ''): Promise<TickerOdds[]> => {
    const promises = Object.entries(SPORT_ENDPOINTS).map(([sport, url]) =>
        fetch(`${url}${scope}`)
            .then(res => res.ok ? res.json() : Promise.reject(`Failed to fetch ${sport}`))
            .then(data => parseEspnData(data, sport))
            .catch(err => { console.warn(err); return []; })
    );
    const results = await Promise.allSettled(promises);
    return results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => (result as PromiseFulfilledResult<TickerOdds[]>).value);
};

const fetchAllScores = async (): Promise<TickerOdds[]> => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const todayStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const tomorrowStr = tomorrow.toISOString().split('T')[0].replace(/-/g, '');

    const [defaultGames, todayGames, tomorrowGames] = await Promise.all([
        fetchScoresForScope(),
        fetchScoresForScope(`?dates=${todayStr}`),
        fetchScoresForScope(`?dates=${tomorrowStr}`)
    ]);
    
    const allGames = [...defaultGames, ...todayGames, ...tomorrowGames];
    
    const uniqueGames = Array.from(new Map(allGames.map(game => [game.id, game])).values());
    
    const sportOrder = ['NFL', 'NCAAF', 'NBA', 'NCAAB', 'MLB', 'NHL', 'WNBA', 'EPL', 'La Liga', 'Serie A', 'Bundesliga', 'MLS'];
    const stateOrder = { live: 1, upcoming: 2, final: 3 };

    return uniqueGames.sort((a, b) => {
        const sportIndexA = sportOrder.indexOf(a.sport);
        const sportIndexB = sportOrder.indexOf(b.sport);
        if (sportIndexA !== sportIndexB) return sportIndexA - sportIndexB;

        const orderA = stateOrder[a.gameState];
        const orderB = stateOrder[b.gameState];
        if (orderA !== orderB) return orderA - orderB;

        if (a.gameState === 'upcoming') {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        }
        if (a.gameState === 'final') {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        return 0;
    });
};

const ImprovedOddsTicker = memo(() => {
  const [selectedEvent, setSelectedEvent] = useState<TickerOdds | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: oddsData, isLoading, isError, isFetching } = useQuery<TickerOdds[]>({
    queryKey: ['espn-live-scores'],
    queryFn: fetchAllScores,
    refetchInterval: 60000,
  });
  
  const handleEventClick = (event: TickerOdds) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  if (isLoading && !oddsData) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 w-full bg-black/50 backdrop-blur-sm py-4 px-4 overflow-hidden border-t border-gray-800">
        <div className="flex whitespace-nowrap">
            {Array.from({ length: 10 }).map((_, i) => <TickerItemSkeleton key={i} />)}
        </div>
      </footer>
    );
  }
  
  if (isError) {
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm py-3 border-t border-red-900">
            <div className="flex items-center justify-center text-red-400 gap-2">
                <AlertCircle size={16} />
                <span>Failed to load live scores. Some data may be unavailable.</span>
            </div>
        </footer>
    );
  }

  const tickerItems = oddsData || [];
  const placeholderItem: TickerOdds = {
    id: 'placeholder',
    sport: 'SEARCHING',
    teams: 'Searching for live games and odds...',
    homeTeam: { name: 'Searching' },
    awayTeam: { name: 'Games' },
    gameState: 'upcoming',
    timestamp: new Date().toISOString(),
    eventId: 'placeholder',
    status: 'Searching...'
  };
  const displayItems = tickerItems.length > 0 ? tickerItems : [placeholderItem];
  const animationDuration = `${Math.max(5, displayItems.length * 2.0)}s`;

  return (
    <footer className="fixed bottom-0 left-0 right-0 w-full bg-black/50 backdrop-blur-sm py-4 overflow-hidden border-t border-gray-800 z-40">
      <style>{`
        @keyframes ticker-continuous {
          0% { transform: translateX(0); }
          100% { transform: translateX(-1550%); }
        }
        .animate-ticker-continuous {
          animation: ticker-continuous linear infinite;
          will-change: transform;
        }
      `}</style>
      {isFetching && !isLoading && (
          <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-1 text-xs text-blue-400 bg-gray-900/50 px-2 py-1 rounded-full z-20">
              <Loader size={12} className="animate-spin" />
              <span>Syncing...</span>
          </div>
      )}
      <div 
        className="flex whitespace-nowrap animate-ticker-continuous"
        style={{ animationDuration }}
      >
        {[...displayItems, ...displayItems].map((item, index) => {
            if (item.id === 'placeholder') {
                 return (
                    <div key={index} className="inline-flex items-center px-3 py-2 mr-4">
                        <span className="text-gray-400">{item.teams}</span>
                    </div>
                 )
            }
          return (
            <TickerItem 
              key={`${item.id}-${index}`} 
              item={item} 
              onClick={() => handleEventClick(item)}
            />
          );
        })}
      </div>

      {selectedEvent && (
        <EventPreviewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          event={selectedEvent}
        />
      )}
    </footer>
  );
});

ImprovedOddsTicker.displayName = 'ImprovedOddsTicker';
export default ImprovedOddsTicker;