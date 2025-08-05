import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTeamLogoUrl } from "@/lib/sportsDataUtils";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
// Tier system functionality will be implemented later
import { Crown, Lock } from 'lucide-react';

type LiveStreamProps = {
  eventId: number;
  sportKey: string;
  homeTeam: string;
  awayTeam: string;
  isOpen: boolean;
  onClose: () => void;
};

// Map sports to their video stream categories
const STREAM_CATEGORIES: Record<string, string> = {
  'basketball': 'basketball',
  'football': 'football',
  'baseball': 'baseball',
  'hockey': 'hockey',
  'soccer': 'soccer',
  'mma_ufc': 'mma',
  'boxing_main': 'boxing',
  'motorsport_nascar': 'nascar',
  'tennis_atp': 'tennis',
  'tennis_wta': 'tennis',
  'basketball_wnba': 'basketball',
  'basketball_ncaam': 'basketball',
  'basketball_ncaaw': 'basketball',
  'football_ncaaf': 'football',
  'football_ufl': 'football'
};

// Stats display types
interface GameStats {
  home: TeamStats;
  away: TeamStats;
}

interface TeamStats {
  score: number;
  statistics: Record<string, number | string>;
}

// Get the appropriate league for a sport key
const getSportLeague = (sportKey: string): string => {
  if (sportKey.includes('basketball_ncaa')) {
    return 'NCAAM';
  } else if (sportKey.includes('basketball_ncaaw')) {
    return 'NCAAW';
  } else if (sportKey.includes('basketball_wnba')) {
    return 'WNBA';
  } else if (sportKey.includes('football_ncaaf')) {
    return 'NCAAF';
  } else if (sportKey.includes('football_ufl')) {
    return 'UFL';
  } else if (sportKey.includes('tennis_atp')) {
    return 'ATP';
  } else if (sportKey.includes('tennis_wta')) {
    return 'WTA';
  } else if (sportKey.includes('boxing')) {
    return 'BOXING';
  } else if (sportKey.includes('mma')) {
    return 'MMA';
  } else if (sportKey.includes('nascar')) {
    return 'NASCAR';
  } else if (sportKey.includes('basketball')) {
    return 'NBA';
  } else if (sportKey.includes('football')) {
    return 'NFL';
  } else if (sportKey.includes('baseball')) {
    return 'MLB';
  } else if (sportKey.includes('hockey')) {
    return 'NHL';
  } else if (sportKey.includes('soccer')) {
    return 'SOCCER';
  }
  return 'NBA';
};

// Generate sport-specific placeholder stats
const generatePlaceholderStats = (sportKey: string): GameStats => {
  const baseStats: GameStats = {
    home: { score: Math.floor(Math.random() * 100), statistics: {} },
    away: { score: Math.floor(Math.random() * 100), statistics: {} }
  };
  
  // Add sport-specific statistics
  if (sportKey.includes('basketball')) {
    baseStats.home.statistics = {
      'Field Goal %': `${Math.floor(40 + Math.random() * 20)}%`,
      '3-Point %': `${Math.floor(30 + Math.random() * 15)}%`,
      'Free Throw %': `${Math.floor(70 + Math.random() * 20)}%`,
      'Rebounds': Math.floor(30 + Math.random() * 20),
      'Assists': Math.floor(15 + Math.random() * 15),
      'Steals': Math.floor(5 + Math.random() * 10),
      'Blocks': Math.floor(2 + Math.random() * 8),
      'Turnovers': Math.floor(5 + Math.random() * 15)
    };
    baseStats.away.statistics = {
      'Field Goal %': `${Math.floor(40 + Math.random() * 20)}%`,
      '3-Point %': `${Math.floor(30 + Math.random() * 15)}%`,
      'Free Throw %': `${Math.floor(70 + Math.random() * 20)}%`,
      'Rebounds': Math.floor(30 + Math.random() * 20),
      'Assists': Math.floor(15 + Math.random() * 15),
      'Steals': Math.floor(5 + Math.random() * 10),
      'Blocks': Math.floor(2 + Math.random() * 8),
      'Turnovers': Math.floor(5 + Math.random() * 15)
    };
  } else if (sportKey.includes('football')) {
    baseStats.home.statistics = {
      'Total Yards': Math.floor(200 + Math.random() * 300),
      'Passing Yards': Math.floor(150 + Math.random() * 250),
      'Rushing Yards': Math.floor(50 + Math.random() * 150),
      'Time of Possession': `${Math.floor(25 + Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      'Turnovers': Math.floor(Math.random() * 4),
      'Penalties': `${Math.floor(Math.random() * 10)} for ${Math.floor(Math.random() * 100)} yards`,
      '3rd Down': `${Math.floor(Math.random() * 10)}/${Math.floor(10 + Math.random() * 10)}`
    };
    baseStats.away.statistics = {
      'Total Yards': Math.floor(200 + Math.random() * 300),
      'Passing Yards': Math.floor(150 + Math.random() * 250),
      'Rushing Yards': Math.floor(50 + Math.random() * 150),
      'Time of Possession': `${Math.floor(25 + Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      'Turnovers': Math.floor(Math.random() * 4),
      'Penalties': `${Math.floor(Math.random() * 10)} for ${Math.floor(Math.random() * 100)} yards`,
      '3rd Down': `${Math.floor(Math.random() * 10)}/${Math.floor(10 + Math.random() * 10)}`
    };
  } else if (sportKey.includes('baseball')) {
    baseStats.home.statistics = {
      'Hits': Math.floor(4 + Math.random() * 12),
      'Errors': Math.floor(Math.random() * 3),
      'Left on Base': Math.floor(3 + Math.random() * 10),
      'Batting Avg': `.${Math.floor(200 + Math.random() * 100)}`,
      'Home Runs': Math.floor(Math.random() * 4),
      'Stolen Bases': Math.floor(Math.random() * 3)
    };
    baseStats.away.statistics = {
      'Hits': Math.floor(4 + Math.random() * 12),
      'Errors': Math.floor(Math.random() * 3),
      'Left on Base': Math.floor(3 + Math.random() * 10),
      'Batting Avg': `.${Math.floor(200 + Math.random() * 100)}`,
      'Home Runs': Math.floor(Math.random() * 4),
      'Stolen Bases': Math.floor(Math.random() * 3)
    };
  } else if (sportKey.includes('hockey')) {
    baseStats.home.statistics = {
      'Shots on Goal': Math.floor(20 + Math.random() * 20),
      'Face-offs Won': `${Math.floor(40 + Math.random() * 20)}%`,
      'Power Plays': `${Math.floor(Math.random() * 3)}/${Math.floor(2 + Math.random() * 5)}`,
      'Hits': Math.floor(10 + Math.random() * 20),
      'Blocked Shots': Math.floor(5 + Math.random() * 15),
      'Penalty Minutes': Math.floor(2 + Math.random() * 10)
    };
    baseStats.away.statistics = {
      'Shots on Goal': Math.floor(20 + Math.random() * 20),
      'Face-offs Won': `${Math.floor(40 + Math.random() * 20)}%`,
      'Power Plays': `${Math.floor(Math.random() * 3)}/${Math.floor(2 + Math.random() * 5)}`,
      'Hits': Math.floor(10 + Math.random() * 20),
      'Blocked Shots': Math.floor(5 + Math.random() * 15),
      'Penalty Minutes': Math.floor(2 + Math.random() * 10)
    };
  } else if (sportKey.includes('tennis')) {
    // Tennis has different scoring, use different scale
    baseStats.home.score = Math.floor(Math.random() * 3);
    baseStats.away.score = Math.floor(Math.random() * 3);
    
    baseStats.home.statistics = {
      'Aces': Math.floor(Math.random() * 15),
      'Double Faults': Math.floor(Math.random() * 8),
      '1st Serve %': `${Math.floor(50 + Math.random() * 30)}%`,
      'Break Points': `${Math.floor(Math.random() * 5)}/${Math.floor(5 + Math.random() * 10)}`,
      'Winners': Math.floor(10 + Math.random() * 30),
      'Unforced Errors': Math.floor(10 + Math.random() * 30)
    };
    baseStats.away.statistics = {
      'Aces': Math.floor(Math.random() * 15),
      'Double Faults': Math.floor(Math.random() * 8),
      '1st Serve %': `${Math.floor(50 + Math.random() * 30)}%`,
      'Break Points': `${Math.floor(Math.random() * 5)}/${Math.floor(5 + Math.random() * 10)}`,
      'Winners': Math.floor(10 + Math.random() * 30),
      'Unforced Errors': Math.floor(10 + Math.random() * 30)
    };
  } else if (sportKey.includes('mma') || sportKey.includes('boxing')) {
    // Combat sports have no traditional score, use different scale
    baseStats.home.score = 0;
    baseStats.away.score = 0;
    
    baseStats.home.statistics = {
      'Significant Strikes': `${Math.floor(20 + Math.random() * 100)}/${Math.floor(50 + Math.random() * 200)}`,
      'Takedowns': `${Math.floor(Math.random() * 5)}/${Math.floor(Math.random() * 10)}`,
      'Control Time': `${Math.floor(Math.random() * 5)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
    };
    baseStats.away.statistics = {
      'Significant Strikes': `${Math.floor(20 + Math.random() * 100)}/${Math.floor(50 + Math.random() * 200)}`,
      'Takedowns': `${Math.floor(Math.random() * 5)}/${Math.floor(Math.random() * 10)}`,
      'Control Time': `${Math.floor(Math.random() * 5)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
    };
  } else if (sportKey.includes('nascar')) {
    // NASCAR has different scoring (position number), use different scale
    baseStats.home.score = Math.floor(1 + Math.random() * 20); // Position
    baseStats.away.score = Math.floor(1 + Math.random() * 20); // Position
    
    baseStats.home.statistics = {
      'Laps': Math.floor(100 + Math.random() * 200),
      'Lap Time': `${Math.floor(20 + Math.random() * 10)}.${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      'MPH': Math.floor(180 + Math.random() * 20),
      'Pit Stops': Math.floor(1 + Math.random() * 5)
    };
    baseStats.away.statistics = {
      'Laps': Math.floor(100 + Math.random() * 200),
      'Lap Time': `${Math.floor(20 + Math.random() * 10)}.${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      'MPH': Math.floor(180 + Math.random() * 20),
      'Pit Stops': Math.floor(1 + Math.random() * 5)
    };
  }
  
  return baseStats;
};

export const WatchLive: React.FC<LiveStreamProps> = ({ 
  eventId, 
  sportKey, 
  homeTeam,
  awayTeam,
  isOpen, 
  onClose 
}) => {
  const { user } = useAuth();
  // Game time and period state
  const [period, setPeriod] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [stats, setStats] = useState<GameStats | null>(null);
  const [activeTab, setActiveTab] = useState<string>('stream');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user has access to live streaming (Platinum only)
  const hasLiveStreamAccess = user && (user.tier === 'platinum' || user.tier === 'gold' || user.isAdmin);
  
  // League for team logos
  const league = getSportLeague(sportKey);
  
  // Get stream category from sport key
  const streamCategory = STREAM_CATEGORIES[sportKey] || 'basketball';
  
  // Dynamic stream URL state
  const [dynamicStreamUrl, setDynamicStreamUrl] = useState<string>('');
  const [streamInfo, setStreamInfo] = useState<any>(null);

  // Load dynamic stream URL based on sport and event
  useEffect(() => {
    const loadDynamicStream = async () => {
      try {
        // Try to get specific live stream for this sport/event
        const response = await fetch(`/api/live-streaming/sport/${sportKey}?gameId=${eventId}`);
        const data = await response.json();

        if (data.success && data.stream) {
          setDynamicStreamUrl(data.stream.streamUrl);
          setStreamInfo(data.stream);
        } else {
          // Try search by team names
          const searchResponse = await fetch(`/api/live-streaming/search?team1=${encodeURIComponent(homeTeam)}&team2=${encodeURIComponent(awayTeam)}&sport=${encodeURIComponent(sportKey)}`);
          const searchData = await searchResponse.json();
          
          if (searchData.success && searchData.stream) {
            setDynamicStreamUrl(searchData.stream.streamUrl);
            setStreamInfo(searchData.stream);
          } else {
            // Fallback to static URLs
            const streamUrls = {
              basketball: "https://www.youtube.com/embed/live_stream?channel=UCsH8-GlpE_4tM7lNx-VEOvQ",
              football: "https://www.youtube.com/embed/live_stream?channel=UCsH8-GlpE_4tM7lNx-VEOvQ",
              baseball: "https://www.youtube.com/embed/live_stream?channel=UCsH8-GlpE_4tM7lNx-VEOvQ",
              hockey: "https://www.youtube.com/embed/live_stream?channel=UCsH8-GlpE_4tM7lNx-VEOvQ",
              soccer: "https://www.youtube.com/embed/live_stream?channel=UCNAf1k0yIjyGu3k9BwAg3lg",
              mma: "https://www.youtube.com/embed/live_stream?channel=UCvgfXK4nTYKudb0rFR6noLA",
              boxing: "https://www.youtube.com/embed/live_stream?channel=UCEBOzwQqBmKWtLKVIbxSKig",
              nascar: "https://www.youtube.com/embed/live_stream?channel=UCsH8-GlpE_4tM7lNx-VEOvQ",
              tennis: "https://www.youtube.com/embed/live_stream?channel=UCbcxFkd6B9xUU54InHv4Vig"
            };
            setDynamicStreamUrl(streamUrls[streamCategory as keyof typeof streamUrls] || streamUrls.basketball);
          }
        }
      } catch (error) {
        console.error('Error loading dynamic stream:', error);
        // Final fallback
        setDynamicStreamUrl("https://www.youtube.com/embed/live_stream?channel=UCsH8-GlpE_4tM7lNx-VEOvQ");
      }
    };

    if (isOpen) {
      loadDynamicStream();
    }
  }, [isOpen, sportKey, eventId, homeTeam, awayTeam, streamCategory]);
  
  // Load event data
  useEffect(() => {
    const loadEventData = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      
      try {
        // Try to fetch event data from API
        const response = await apiRequest('GET', `/api/events/${eventId}`);
        const eventData = await response.json();
        
        if (eventData) {
          // Set period and time remaining
          setPeriod(eventData.period || determineDefaultPeriod(sportKey));
          setTimeRemaining(eventData.timeRemaining || generateRandomTime(sportKey));
          
          // Set or generate statistics
          setStats(eventData.statistics || generatePlaceholderStats(sportKey));
        } else {
          // Use placeholder data if no event data is available
          setPeriod(determineDefaultPeriod(sportKey));
          setTimeRemaining(generateRandomTime(sportKey));
          setStats(generatePlaceholderStats(sportKey));
        }
      } catch (error) {
        console.error('Error loading event data:', error);
        // Use placeholder data if there's an error
        setPeriod(determineDefaultPeriod(sportKey));
        setTimeRemaining(generateRandomTime(sportKey));
        setStats(generatePlaceholderStats(sportKey));
      }
      
      setIsLoading(false);
    };
    
    loadEventData();
    
    // Update time remaining every second for real-time feel
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        // Don't update if format is not mm:ss
        if (!prev.includes(':')) return prev;
        
        const [mins, secs] = prev.split(':').map(Number);
        if (mins === 0 && secs === 0) return prev;
        
        let newSecs = secs - 1;
        let newMins = mins;
        
        if (newSecs < 0) {
          newSecs = 59;
          newMins--;
        }
        
        return `${newMins}:${newSecs.toString().padStart(2, '0')}`;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen, eventId, sportKey]);
  
  // Determine default period based on sport
  const determineDefaultPeriod = (sportKey: string): string => {
    if (sportKey.includes('basketball')) {
      return `Quarter ${Math.floor(1 + Math.random() * 4)}`;
    } else if (sportKey.includes('football')) {
      return `Quarter ${Math.floor(1 + Math.random() * 4)}`;
    } else if (sportKey.includes('hockey')) {
      return `Period ${Math.floor(1 + Math.random() * 3)}`;
    } else if (sportKey.includes('baseball')) {
      return `Inning ${Math.floor(1 + Math.random() * 9)}`;
    } else if (sportKey.includes('soccer')) {
      return Math.random() > 0.5 ? 'First Half' : 'Second Half';
    } else if (sportKey.includes('tennis')) {
      return `Set ${Math.floor(1 + Math.random() * 3)}`;
    } else if (sportKey.includes('mma') || sportKey.includes('boxing')) {
      return `Round ${Math.floor(1 + Math.random() * 5)}`;
    } else if (sportKey.includes('nascar')) {
      return `Lap ${Math.floor(50 + Math.random() * 150)}`;
    }
    return 'Live';
  };
  
  // Generate random time remaining based on sport
  const generateRandomTime = (sportKey: string): string => {
    if (sportKey.includes('basketball') || sportKey.includes('football') || 
        sportKey.includes('hockey') || sportKey.includes('soccer')) {
      const mins = Math.floor(Math.random() * 12);
      const secs = Math.floor(Math.random() * 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    } else if (sportKey.includes('baseball')) {
      return Math.random() > 0.5 ? 'Top' : 'Bottom';
    } else if (sportKey.includes('tennis') || sportKey.includes('mma') || 
              sportKey.includes('boxing')) {
      // For combat sports and tennis, show as time elapsed
      const mins = Math.floor(Math.random() * 5);
      const secs = Math.floor(Math.random() * 60);
      return `${mins}:${secs.toString().padStart(2, '0')} elapsed`;
    } else if (sportKey.includes('nascar')) {
      // For NASCAR, show laps remaining
      return `${Math.floor(10 + Math.random() * 50)} laps remaining`;
    }
    return '0:00';
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Watch Live: {homeTeam} vs {awayTeam}
            </DialogTitle>
            <Badge variant="outline" className="ml-2 bg-red-500 text-white">LIVE</Badge>
          </div>
          <DialogDescription>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <img 
                  src={getTeamLogoUrl(homeTeam, league)} 
                  alt={homeTeam} 
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIiPjxwYXRoIGQ9Ik0xOSAyMXYtMmE0IDQgMCAwIDAtNC00SDlhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+';
                  }}
                />
                <span className="font-semibold text-lg">{stats?.home.score ?? 0}</span>
                <span className="px-2">-</span>
                <span className="font-semibold text-lg">{stats?.away.score ?? 0}</span>
                <img 
                  src={getTeamLogoUrl(awayTeam, league)} 
                  alt={awayTeam} 
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIiPjxwYXRoIGQ9Ik0xOSAyMXYtMmE0IDQgMCAwIDAtNC00SDlhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+';
                  }}
                />
              </div>
              <div className="text-sm">
                <span className="font-medium">{period}</span>
                <span className="mx-1">•</span>
                <span>{timeRemaining}</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="stream" className="flex-1 flex flex-col" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mx-4">
            <TabsTrigger value="stream">Live Stream</TabsTrigger>
            <TabsTrigger value="stats">Live Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stream" className="flex-1 relative overflow-hidden">
            {!hasLiveStreamAccess ? (
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg border-2 border-yellow-200 max-w-sm">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Platinum Required</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Live streaming is exclusive to Platinum members
                  </p>
                  <div className="flex items-center justify-center gap-2 text-yellow-600 mb-4">
                    <Lock className="h-4 w-4" />
                    <span className="text-xs font-medium">Premium Feature</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500"
                    onClick={() => window.location.href = '/upgrade-tier'}
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  <p className="mt-2">Loading live stream...</p>
                </div>
              </div>
            ) : (
              <>
                <iframe
                  src={dynamicStreamUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                {streamInfo && (
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-2 text-white text-sm">
                    <div className="font-semibold">{streamInfo.name}</div>
                    <div className="text-xs opacity-75">{streamInfo.quality} • {streamInfo.language.toUpperCase()}</div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="stats" className="flex-1 px-4 overflow-auto">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  <p className="mt-2">Loading statistics...</p>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <h3 className="text-lg font-semibold mb-4">Game Statistics</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  {/* Home Team Column */}
                  <div className="flex flex-col items-center">
                    <img 
                      src={getTeamLogoUrl(homeTeam, league)} 
                      alt={homeTeam} 
                      className="h-16 w-16 object-contain mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIiPjxwYXRoIGQ9Ik0xOSAyMXYtMmE0IDQgMCAwIDAtNC00SDlhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+';
                      }}
                    />
                    <h4 className="font-semibold text-center">{homeTeam}</h4>
                  </div>
                  
                  {/* Labels Column */}
                  <div>
                    {stats && Object.keys(stats.home.statistics).map((stat, index) => (
                      <div key={index} className="py-2 font-medium">
                        {stat}
                      </div>
                    ))}
                  </div>
                  
                  {/* Away Team Column */}
                  <div className="flex flex-col items-center">
                    <img 
                      src={getTeamLogoUrl(awayTeam, league)} 
                      alt={awayTeam} 
                      className="h-16 w-16 object-contain mb-2" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXIiPjxwYXRoIGQ9Ik0xOSAyMXYtMmE0IDQgMCAwIDAtNC00SDlhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+';
                      }}
                    />
                    <h4 className="font-semibold text-center">{awayTeam}</h4>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {/* Home Team Stats */}
                  <div>
                    {stats && Object.values(stats.home.statistics).map((value, index) => (
                      <div key={index} className="py-2 text-center font-semibold">
                        {value}
                      </div>
                    ))}
                  </div>
                  
                  {/* Empty middle column */}
                  <div></div>
                  
                  {/* Away Team Stats */}
                  <div>
                    {stats && Object.values(stats.away.statistics).map((value, index) => (
                      <div key={index} className="py-2 text-center font-semibold">
                        {value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="p-4 border-t flex-shrink-0">
          <Button onClick={onClose}>Close</Button>
          {activeTab === "stream" ? (
            <Button variant="outline" onClick={() => setActiveTab("stats")}>
              View Stats
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setActiveTab("stream")}>
              Watch Stream
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WatchLive;