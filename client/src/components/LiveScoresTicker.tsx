import React, { memo, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, Wifi, WifiOff, AlertCircle, Loader, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { TickerOdds, Team } from '../types/ticker';
// Create a simple sport logo mapping
const SPORT_LOGOS: Record<string, string> = {
  'NFL': '🏈', 'NCAAF': '🏈', 'NBA': '🏀', 'NCAAB': '🏀',
  'MLB': '⚾', 'NHL': '🏒', 'WNBA': '🏀', 'MLS': '⚽',
  'EPL': '⚽', 'La Liga': '⚽', 'Serie A': '⚽', 'Bundesliga': '⚽'
};

// Transform our API data to ticker format
const transformApiDataToTicker = (apiData: any[]): TickerOdds[] => {
  return apiData.map((game): TickerOdds => {
    // Parse team names from "Team A vs Team B" format
    const teamNames = game.teams.split(' vs ');
    const homeTeamName = teamNames[1] || 'Home Team';
    const awayTeamName = teamNames[0] || 'Away Team';
    
    return {
      id: game.eventId,
      sport: game.sport.toUpperCase(),
      teams: game.teams,
      homeTeam: { name: homeTeamName, abbreviation: homeTeamName.split(' ').pop() },
      awayTeam: { name: awayTeamName, abbreviation: awayTeamName.split(' ').pop() },
      gameState: game.period && game.period !== 'Pre-Game' ? 'live' : 'upcoming',
      timestamp: game.lastUpdate,
      eventId: game.eventId,
      status: game.period || 'Scheduled',
      hasLiveScore: game.homeScore !== undefined && game.awayScore !== undefined,
      liveScore: game.homeScore !== undefined ? {
        homeScore: game.homeScore,
        awayScore: game.awayScore,
        period: game.period || '1st',
        timeRemaining: game.timeRemaining || '0:00',
        isBreaking: game.isBreaking || false
      } : undefined
    };
  });
};

const LiveGameIndicator = ({ isLive }: { isLive: boolean }) => {
  if (!isLive) return null;
  return (
    <div className="flex items-center gap-1">
      <div className="relative flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-red-400 text-white">
        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
        <span>LIVE</span>
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

const FinalScore = ({ homeScore, awayScore }: { homeScore: number; awayScore: number }) => (
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

const EnhancedTeamLogo = ({ src, teamName, sport, size = "w-6 h-6" }: {
  src?: string; teamName: string; sport: string; size?: string;
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const logoSrc = src;
  
  if (imageFailed || !logoSrc) {
    // Fallback to initials
    const initials = teamName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
    return (
      <div className={`${size} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold`}>
        {initials}
      </div>
    );
  }

  return (
    <img 
      src={logoSrc} 
      alt={`${teamName} logo`} 
      className={`${size} object-contain rounded`}
      onError={() => setImageFailed(true)}
    />
  );
};

const TickerItem = memo(({ item, onClick }: { 
  item: TickerOdds; 
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; 
}) => {
  if (!item) return null;
  
  const { sport, homeTeam, awayTeam, gameState, liveScore, timestamp, status } = item;
  const sportLogo = SPORT_LOGOS[sport] || '🏆';

  const gameTime = useMemo(() => {
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: true,
      }).format(date);
    } catch { 
      return status; 
    }
  }, [timestamp, status]);
  
  const isLive = gameState === 'live';
  const isFinal = gameState === 'final';

  return (
    <button 
      className={`inline-flex items-center text-left px-3 py-2 mr-4 min-w-max cursor-pointer rounded-lg transition-all duration-300 border ${
        isLive ? 'border-red-500/30 bg-gradient-to-r from-red-500/10 to-red-400/5 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20' 
               : 'border-gray-800/50 bg-gray-800/50 hover:bg-gray-700/50'
      }`}
      onClick={onClick} 
      aria-label={`View details for ${item.teams}`}
    >
      <div className="flex items-center gap-2 mr-3">
        <img src={sportLogo} alt={`${sport} logo`} className="h-6 w-auto object-contain"/>
        <LiveGameIndicator isLive={isLive} />
      </div>

      <div className="flex items-center space-x-1 mr-2">
        <EnhancedTeamLogo teamName={homeTeam.name} sport={sport} size="w-6 h-6" />
        <span className="text-gray-400 text-xs">vs</span>
        <EnhancedTeamLogo teamName={awayTeam.name} sport={sport} size="w-6 h-6" />
      </div>

      {isLive && liveScore ? (
        <AnimatedScore {...liveScore} />
      ) : isFinal && liveScore ? (
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
        </div>
      )}
    </button>
  );
});
TickerItem.displayName = 'TickerItem';

const LiveScoresTicker = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch live scores using our existing API
  const { data: liveScores = [], isLoading, isError } = useQuery({
    queryKey: ['/api/events/live-scores'],
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  });

  // Ensure liveScores is an array
  const scoresArray = Array.isArray(liveScores) ? liveScores : [];

  // Transform data to ticker format
  const tickerData = useMemo(() => {
    if (!scoresArray?.length) return [];
    return transformApiDataToTicker(scoresArray);
  }, [scoresArray]);

  // Auto-scroll animation
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused || tickerData.length === 0) return;

    const scroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
    };

    const interval = setInterval(scroll, 50);
    return () => clearInterval(interval);
  }, [isPaused, tickerData.length]);

  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Loader className="w-5 h-5 animate-spin text-blue-400" />
          <span className="text-sm font-semibold text-gray-300">Loading Live Scores...</span>
        </div>
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-700/50 rounded-lg px-4 py-2 animate-pulse">
              <div className="h-4 w-32 bg-gray-600/50 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || tickerData.length === 0) {
    return (
      <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <span className="text-sm text-gray-300">No live games available</span>
        </div>
      </div>
    );
  }

  const liveGamesCount = tickerData.filter(game => game.gameState === 'live').length;

  return (
    <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-white">LIVE SCORES</span>
          <span className="text-xs text-gray-400">({tickerData.length} games)</span>
          {liveGamesCount > 0 && (
            <span className="text-xs text-red-400 font-semibold">
              {liveGamesCount} LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Wifi size={12} />
          <span>ESPN API</span>
        </div>
      </div>

      {/* Scrolling Ticker */}
      <div 
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          ref={scrollRef}
          className="flex items-center py-3 px-2 overflow-x-auto"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {/* Duplicate the items for seamless loop */}
          {[...tickerData, ...tickerData].map((item, index) => (
            <TickerItem 
              key={`${item.id}-${index}`} 
              item={item}
              onClick={() => console.log('Game clicked:', item.teams)}
            />
          ))}
        </div>
        
        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute top-2 right-2 bg-black/50 rounded px-2 py-1 text-xs text-white">
            Paused
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveScoresTicker;