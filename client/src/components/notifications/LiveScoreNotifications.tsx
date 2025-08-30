import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Bell, Trophy, Zap, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface LiveScoreUpdate {
  eventId: string;
  sport: string;
  teams: string;
  homeScore: number;
  awayScore: number;
  period: string;
  timeRemaining: string;
  lastUpdate: string;
  isBreaking?: boolean;
}

interface NotificationPreferences {
  enableLiveScores: boolean;
  enableOddsChanges: boolean;
  enableGameResults: boolean;
  sports: string[];
}

const LiveScoreNotifications = () => {
  const { toast } = useToast();
  const lastKnownScoresRef = useRef<Map<string, string>>(new Map());
  const [preferences] = useState<NotificationPreferences>({
    enableLiveScores: true,
    enableOddsChanges: false, // Disabled to prevent spam
    enableGameResults: true,
    sports: ['NFL', 'NBA', 'MLB', 'NHL', 'Soccer', 'Boxing', 'UFC', 'Esports']
  });

  // Fetch live scores every 30 seconds
  const { data: liveScores } = useQuery({
    queryKey: ['/api/events/live-scores'],
    refetchInterval: 30000, // 30 seconds for live updates
    enabled: preferences.enableLiveScores
  });

  // Mock live score updates
  const mockLiveUpdates: LiveScoreUpdate[] = [
    {
      eventId: 'nfl_chiefs_bills',
      sport: 'NFL',
      teams: 'Chiefs vs Bills',
      homeScore: 21,
      awayScore: 17,
      period: 'Q3',
      timeRemaining: '8:45',
      lastUpdate: new Date().toISOString(),
      isBreaking: true
    },
    {
      eventId: 'nba_lakers_warriors',
      sport: 'NBA',
      teams: 'Lakers vs Warriors',
      homeScore: 89,
      awayScore: 92,
      period: '4th',
      timeRemaining: '3:21',
      lastUpdate: new Date().toISOString()
    }
  ];

  const scores = (liveScores as LiveScoreUpdate[]) || mockLiveUpdates;

  const handleScoreUpdate = useCallback((scores: LiveScoreUpdate[]) => {
    if (!scores || scores.length === 0) return;

    scores.forEach((score) => {
      // Check if this is a real score change
      const currentScoreKey = `${score.homeScore}-${score.awayScore}`;
      const lastKnownScore = lastKnownScoresRef.current.get(score.eventId);
      
      // Only show notification if score actually changed (not on first load)
      if (lastKnownScore && lastKnownScore !== currentScoreKey && preferences.sports.includes(score.sport)) {
        
        // Show breaking news style notification for major score changes
        if (score.isBreaking) {
          toast({
            title: (
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>BREAKING: Live Score Update</span>
                <Badge className="bg-red-600 text-white text-xs">LIVE</Badge>
              </div>
            ),
            description: (
              <div className="space-y-2">
                <div className="font-semibold text-white">
                  {score.teams} - {score.period} {score.timeRemaining}
                </div>
                <div className="text-lg font-bold">
                  <span className="text-green-400">{score.homeScore}</span>
                  <span className="text-gray-400 mx-2">-</span>
                  <span className="text-yellow-400">{score.awayScore}</span>
                </div>
                <div className="text-xs text-gray-400">
                  Updated just now • {score.sport}
                </div>
              </div>
            ),
            duration: 8000,
            className: "border-red-600 bg-red-900/90"
          });
        } else {
          // Regular score update notification
          toast({
            title: (
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-blue-500" />
                <span>Score Update</span>
              </div>
            ),
            description: (
              <div className="space-y-1">
                <div className="font-semibold">{score.teams}</div>
                <div className="text-sm">
                  <span className="text-green-400">{score.homeScore}</span>
                  <span className="text-gray-400"> - </span>
                  <span className="text-yellow-400">{score.awayScore}</span>
                  <span className="text-gray-400 ml-2">• {score.period} {score.timeRemaining}</span>
                </div>
              </div>
            ),
            duration: 5000,
            className: "border-blue-600 bg-blue-900/90"
          });
        }

      }
      
      // Always update the last known score for this event (silently for first load)
      lastKnownScoresRef.current.set(score.eventId, currentScoreKey);
    });
  }, [toast, preferences]);

  useEffect(() => {
    handleScoreUpdate(scores);
  }, [scores, handleScoreUpdate]);

  // Show odds change notifications (disabled by default)
  useEffect(() => {
    if (!preferences.enableOddsChanges) return;

    const interval = setInterval(() => {
      // Only show very significant odds changes
      if (Math.random() > 0.98) {
        const sportsOptions = ['NFL', 'NBA', 'MLB', 'Boxing', 'UFC', 'Tennis'];
        const randomSport = sportsOptions[Math.floor(Math.random() * sportsOptions.length)];
        
        if (preferences.sports.includes(randomSport)) {
          const change = Math.random() > 0.5 ? 'increased' : 'decreased';
          const amount = (Math.random() * 15 + 5).toFixed(1);
          
          toast({
            title: (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Odds Alert</span>
              </div>
            ),
            description: (
              <div className="space-y-1">
                <div className="font-semibold">Chiefs vs Bills</div>
                <div className="text-sm text-green-400">
                  Spread odds {change} by {amount} points
                </div>
                <div className="text-xs text-gray-400">
                  New line: Chiefs -2.5 (-108)
                </div>
              </div>
            ),
            duration: 4000,
            className: "border-green-600 bg-green-900/90"
          });
        }
      }
    }, 300000); // Check every 5 minutes instead

    return () => clearInterval(interval);
  }, [toast, preferences]);

  return null; // This is a service component, no UI
};

export default LiveScoreNotifications;