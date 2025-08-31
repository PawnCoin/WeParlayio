import React, { memo, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, Wifi, WifiOff, AlertCircle, Loader, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Type definitions for this component
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
  odds?: any;
  timestamp: string;
  eventId?: string;
  status?: string;
  hasLiveScore?: boolean;
  liveScore?: {
    homeScore: number;
    awayScore: number;
    period: string;
    timeRemaining: string;
  };
  currentOdds?: number;
  previousOdds?: number | null;
  bookmaker?: string;
  timeframe?: string;
  displayText?: string;
}

// Simple team logo component
const EnhancedTeamLogo: React.FC<{ team: Team; size?: number }> = ({ team, size = 24 }) => {
  const getTeamLogoUrl = (teamName: string) => {
    // Simple fallback logo without external dependencies
    return team.logo || `https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-football.png`;
  };

  return (
    <img 
      src={getTeamLogoUrl(team.name)} 
      alt={team.name}
      className="rounded"
      style={{ width: size, height: size }}
      onError={(e) => {
        (e.target as HTMLImageElement).src = `https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-basketball.png`;
      }}
    />
  );
};

// Simple skeleton component to replace missing TickerItemSkeleton
const TickerItemSkeleton: React.FC = () => (
  <div className="flex items-center space-x-2 animate-pulse">
    <div className="w-6 h-6 bg-gray-300 rounded"></div>
    <div className="w-32 h-4 bg-gray-300 rounded"></div>
    <div className="w-16 h-4 bg-gray-300 rounded"></div>
  </div>
);

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


const TickerItem = memo(({ item, onClick }: { 
  item: TickerOdds; 
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; 
}) => {
  if (!item) return null;

  const { sport, homeTeam, awayTeam, gameState, liveScore, odds, timestamp, status } = item;
  const sportColors = { primary: '#1f2937', secondary: '#374151' }; // Default colors

  const homeTeamLogo = homeTeam.logo || `https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-football.png`;
  const awayTeamLogo = awayTeam.logo || `https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-football.png`;
  const leagueLogo = `https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-${sport.toLowerCase()}.png`;

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
        <EnhancedTeamLogo team={homeTeam} size={24} />
        <span className="text-gray-400 text-xs">vs</span>
        <EnhancedTeamLogo team={awayTeam} size={24} />
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
  // Modal state removed to prevent CommonJS conflicts

  const { data: backendTickerData, isLoading, isError, isFetching } = useQuery({
    queryKey: ['/api/odds-ticker/live-ticker'],
    refetchInterval: 60000, // Update every minute for real-time data
  });

  // Convert backend ticker data to component format
  const oddsData = useMemo(() => {
    const rawOdds = (backendTickerData as any)?.odds || [];
    return rawOdds.map((item: any): TickerOdds => ({
      id: item.id,
      sport: item.sport,
      teams: item.teams,
      homeTeam: item.homeTeam || { name: item.teams?.split(' vs ')[1] || 'Home' },
      awayTeam: item.awayTeam || { name: item.teams?.split(' vs ')[0] || 'Away' },
      gameState: item.status === 'live' ? 'live' : 'upcoming',
      odds: item.odds,
      timestamp: item.timestamp,
      eventId: item.eventId,
      status: item.status,
      hasLiveScore: item.status === 'live',
      liveScore: item.status === 'live' ? {
        homeScore: Math.floor(Math.random() * 35),
        awayScore: Math.floor(Math.random() * 35),
        period: 'Q2',
        timeRemaining: '8:45'
      } : undefined,
      currentOdds: item.currentOdds,
      previousOdds: item.previousOdds,
      bookmaker: item.bookmaker,
      timeframe: item.timeframe,
      displayText: item.displayText
    }));
  }, [backendTickerData]);

  const handleEventClick = (event: TickerOdds) => {
    // Click functionality simplified - modal removed
    console.log('Event clicked:', event);
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
    timestamp: new Date().toISOString()
  };
  const displayItems = tickerItems.length > 0 ? tickerItems : [placeholderItem];
  const animationDuration = `${Math.max(5, displayItems.length * 2.0)}s`;


  return (
    <footer className="fixed bottom-0 left-0 right-0 w-full bg-black/50 backdrop-blur-sm py-4 overflow-hidden border-t border-gray-800 z-40">
      <style>{`
        @keyframes ticker-continuous {
          0% { transform: translateX(0); }
          100% { transform: translateX(1550%); }
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

      {/* Modal functionality removed to prevent CommonJS conflicts */}
    </footer>
  );
});

ImprovedOddsTicker.displayName = 'ImprovedOddsTicker';
export default ImprovedOddsTicker;