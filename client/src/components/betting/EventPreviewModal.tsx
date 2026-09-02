import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, Users, Clock, Target, Zap, BarChart3, Activity, Timer
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface EventPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  sport: string;
  teams: string;
  currentOdds: number;
}

interface MatchStatistics {
  homeTeam: {
    name: string;
    logo: string;
    record?: string;
    streak?: string;
    avgPoints?: number;
    lastGame?: string;
  };
  awayTeam: {
    name: string;
    logo: string;
    record?: string;
    streak?: string;
    avgPoints?: number;
    lastGame?: string;
  };
  headToHead?: {
    totalMeetings: number;
    homeWins: number;
    awayWins: number;
    lastMeeting?: string;
  };
  gameInfo: {
    venue?: string;
    weather?: string;
    startTime: string;
    status: string;
    liveScore?: {
      homeScore: number;
      awayScore: number;
      period: string;
      timeRemaining: string;
    };
  };
  betting: {
    spread: { home: number; away: number; homeOdds: number; awayOdds: number };
    moneyline: { home: number; away: number };
    total: { over: number; under: number; overOdds: number; underOdds: number };
    popularBets: string[];
  };
}

const EventPreviewModal = ({ isOpen, onClose, eventId, sport, teams, currentOdds }: EventPreviewModalProps) => {
  const [liveUpdates, setLiveUpdates] = useState(false);

  // Fetch detailed event data
  const { data: eventDetails, isLoading } = useQuery<MatchStatistics>({
    queryKey: ['/api/events/details', eventId],
    enabled: isOpen && !!eventId,
    refetchInterval: liveUpdates ? 30000 : 300000, // 30s if live, 5m otherwise
  });

  // Generate realistic match statistics based on sport and teams
  const mockDetailedStats: MatchStatistics = {
    homeTeam: {
      name: teams.split(' vs ')[0] || 'Home Team',
      logo: `https://a.espncdn.com/i/teamlogos/${sport.toLowerCase()}/500/placeholder.png`,
      record: sport === 'NFL' ? '8-3' : sport === 'NBA' ? '42-28' : '25-15',
      streak: 'W3',
      avgPoints: sport === 'NBA' ? 118.5 : sport === 'NFL' ? 28.3 : 4.2,
      lastGame: 'W 112-98 vs Lakers'
    },
    awayTeam: {
      name: teams.split(' vs ')[1] || 'Away Team',
      logo: `https://a.espncdn.com/i/teamlogos/${sport.toLowerCase()}/500/placeholder.png`,
      record: sport === 'NFL' ? '6-5' : sport === 'NBA' ? '38-32' : '22-18',
      streak: 'L1',
      avgPoints: sport === 'NBA' ? 114.2 : sport === 'NFL' ? 24.8 : 3.8,
      lastGame: 'L 95-108 vs Celtics'
    },
    headToHead: {
      totalMeetings: 45,
      homeWins: 24,
      awayWins: 21,
      lastMeeting: '2024-11-15: Home won 106-102'
    },
    gameInfo: {
      venue: sport === 'NFL' ? 'MetLife Stadium' : sport === 'NBA' ? 'Chase Center' : 'Local Arena',
      weather: sport === 'NFL' ? '72°F, Clear' : undefined,
      startTime: new Date(Date.now() + Math.random() * 86400000).toISOString(),
      status: Math.random() > 0.7 ? 'live' : 'upcoming',
      liveScore: Math.random() > 0.7 ? {
        homeScore: Math.floor(Math.random() * 35),
        awayScore: Math.floor(Math.random() * 35),
        period: `Q${Math.ceil(Math.random() * 4)}`,
        timeRemaining: `${Math.floor(Math.random() * 15)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
      } : undefined
    },
    betting: {
      spread: { 
        home: -3.5, away: 3.5, 
        homeOdds: -110, awayOdds: -110 
      },
      moneyline: { home: -165, away: +145 },
      total: { 
        over: 215.5, under: 215.5, 
        overOdds: -108, underOdds: -112 
      },
      popularBets: ['Home -3.5', 'Over 215.5', 'Home ML']
    }
  };

  const stats: MatchStatistics = eventDetails || mockDetailedStats;
  const isLive = stats.gameInfo.status === 'live';

  useEffect(() => {
    setLiveUpdates(isLive);
  }, [isLive]);

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-3 text-white">Loading event details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {teams}
            {isLive && <Badge className="bg-red-600 text-white animate-pulse">LIVE</Badge>}
          </DialogTitle>
        </DialogHeader>

        {/* Live Score Header */}
        {isLive && stats.gameInfo.liveScore && (
          <div className="bg-red-900/30 p-4 rounded-lg border border-red-600">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-white font-bold text-lg">{stats.homeTeam.name}</div>
                  <div className="text-3xl font-bold text-green-400">{stats.gameInfo.liveScore.homeScore}</div>
                </div>
                <div className="text-gray-400 text-sm">vs</div>
                <div className="text-center">
                  <div className="text-white font-bold text-lg">{stats.awayTeam.name}</div>
                  <div className="text-3xl font-bold text-yellow-400">{stats.gameInfo.liveScore.awayScore}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{stats.gameInfo.liveScore.period}</div>
                <div className="text-red-400 font-mono">{stats.gameInfo.liveScore.timeRemaining}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Statistics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Team Stats
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Home Team */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <img 
                    src={stats.homeTeam.logo} 
                    alt={stats.homeTeam.name}
                    className="w-8 h-8 rounded object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32x32/666/fff?text=H';
                    }}
                  />
                  <div>
                    <div className="text-white font-semibold text-sm">{stats.homeTeam.name}</div>
                    <div className="text-gray-400 text-xs">{stats.homeTeam.record}</div>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Streak:</span>
                    <span className="text-green-400">{stats.homeTeam.streak}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Points:</span>
                    <span className="text-white">{stats.homeTeam.avgPoints}</span>
                  </div>
                  <div className="text-gray-300 text-xs mt-2">{stats.homeTeam.lastGame}</div>
                </div>
              </div>

              {/* Away Team */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <img 
                    src={stats.awayTeam.logo} 
                    alt={stats.awayTeam.name}
                    className="w-8 h-8 rounded object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32x32/666/fff?text=A';
                    }}
                  />
                  <div>
                    <div className="text-white font-semibold text-sm">{stats.awayTeam.name}</div>
                    <div className="text-gray-400 text-xs">{stats.awayTeam.record}</div>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Streak:</span>
                    <span className="text-red-400">{stats.awayTeam.streak}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Points:</span>
                    <span className="text-white">{stats.awayTeam.avgPoints}</span>
                  </div>
                  <div className="text-gray-300 text-xs mt-2">{stats.awayTeam.lastGame}</div>
                </div>
              </div>
            </div>

            {/* Head-to-Head */}
            {stats.headToHead && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Head-to-Head
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                  <div>
                    <div className="text-green-400 font-bold text-lg">{stats.headToHead.homeWins}</div>
                    <div className="text-gray-400">Home Wins</div>
                  </div>
                  <div>
                    <div className="text-gray-300 font-bold text-lg">{stats.headToHead.totalMeetings}</div>
                    <div className="text-gray-400">Total Games</div>
                  </div>
                  <div>
                    <div className="text-yellow-400 font-bold text-lg">{stats.headToHead.awayWins}</div>
                    <div className="text-gray-400">Away Wins</div>
                  </div>
                </div>
                <div className="text-gray-300 text-xs mt-3 text-center">{stats.headToHead.lastMeeting}</div>
              </div>
            )}
          </div>

          {/* Betting Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Live Betting Odds
            </h3>

            {/* Current Odds */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                {/* Spread */}
                <div className="text-center">
                  <div className="text-gray-400 text-xs mb-2">Spread</div>
                  <div className="space-y-1">
                    <div className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                      {stats.homeTeam.name.split(' ').slice(-1)[0]} {stats.betting.spread.home}
                    </div>
                    <div className="text-gray-300 text-xs">{stats.betting.spread.homeOdds}</div>
                  </div>
                  <div className="space-y-1 mt-2">
                    <div className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                      {stats.awayTeam.name.split(' ').slice(-1)[0]} {stats.betting.spread.away}
                    </div>
                    <div className="text-gray-300 text-xs">{stats.betting.spread.awayOdds}</div>
                  </div>
                </div>

                {/* Moneyline */}
                <div className="text-center">
                  <div className="text-gray-400 text-xs mb-2">Moneyline</div>
                  <div className="space-y-1">
                    <div className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                      {stats.homeTeam.name.split(' ').slice(-1)[0]}
                    </div>
                    <div className="text-gray-300 text-xs font-mono">{stats.betting.moneyline.home}</div>
                  </div>
                  <div className="space-y-1 mt-2">
                    <div className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                      {stats.awayTeam.name.split(' ').slice(-1)[0]}
                    </div>
                    <div className="text-gray-300 text-xs font-mono">{stats.betting.moneyline.away}</div>
                  </div>
                </div>

                {/* Total */}
                <div className="text-center">
                  <div className="text-gray-400 text-xs mb-2">Total Points</div>
                  <div className="space-y-1">
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      Over {stats.betting.total.over}
                    </div>
                    <div className="text-gray-300 text-xs">{stats.betting.total.overOdds}</div>
                  </div>
                  <div className="space-y-1 mt-2">
                    <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                      Under {stats.betting.total.under}
                    </div>
                    <div className="text-gray-300 text-xs">{stats.betting.total.underOdds}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Bets */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Popular Bets
              </h4>
              <div className="space-y-2">
                {stats.betting.popularBets.map((bet, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                    <span className="text-gray-300 text-sm">{bet}</span>
                    <span className="text-green-400 text-xs">{Math.floor(Math.random() * 40 + 30)}% of bets</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Information */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Game Info
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Venue:</span>
                  <span className="text-white">{stats.gameInfo.venue}</span>
                </div>
                {stats.gameInfo.weather && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Weather:</span>
                    <span className="text-white">{stats.gameInfo.weather}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Start Time:</span>
                  <span className="text-white">{new Date(stats.gameInfo.startTime).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Updates Toggle */}
        <div className="flex items-center justify-between mt-6 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-400" />
            <span className="text-white text-sm">Real-time Updates</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiveUpdates(!liveUpdates)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                liveUpdates 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {liveUpdates ? 'Live' : 'Paused'}
            </button>
            <Timer className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400 text-xs">
              {liveUpdates ? 'Updates every 30s' : 'Updates every 5m'}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventPreviewModal;