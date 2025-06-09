import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { getLeagueLogo } from '@/utils/sportsLogosSimple';

// Helper function to format game time
const formatGameTime = (dateString: string) => {
  if (!dateString) return 'TBD';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  } catch {
    return 'TBD';
  }
};

// Professional leagues configuration
const PROFESSIONAL_LEAGUES = [
  { name: 'NFL', key: 'americanfootball_nfl', displayName: 'NFL (American Football)' },
  { name: 'NBA', key: 'basketball_nba', displayName: 'NBA (Basketball)' },
  { name: 'MLB', key: 'baseball_mlb', displayName: 'MLB (Baseball)' },
  { name: 'NHL', key: 'icehockey_nhl', displayName: 'NHL (Ice Hockey)' },
  { name: 'MLS', key: 'soccer_usa_mls', displayName: 'MLS (Soccer)' },
  { name: 'Premier League', key: 'soccer_epl', displayName: 'Premier League (Soccer)' },
  { name: 'NCAA Football', key: 'americanfootball_ncaaf', displayName: 'NCAA Football' },
  { name: 'NCAA Basketball', key: 'basketball_ncaab', displayName: 'NCAA Basketball' },
  { name: 'UFC', key: 'mma_ufc', displayName: 'UFC (MMA)' },
  { name: 'Boxing', key: 'boxing_main', displayName: 'Boxing' },
  { name: 'NASCAR', key: 'motorsport_nascar', displayName: 'NASCAR (Motorsport)' },
  { name: 'Tennis', key: 'tennis_atp', displayName: 'ATP (Tennis)' },
];

type BetType = 'moneyline' | 'spread' | 'total' | 'player-props' | 'team-props' | 'parlays';

const BettingDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(PROFESSIONAL_LEAGUES.map(league => league.key));
  const [betTypes, setBetTypes] = useState<BetType[]>(['moneyline', 'spread', 'total']);
  const [betSlip, setBetSlip] = useState<any[]>([]);

  // Mock user tier for demonstration
  const userTier = user?.tier || 'Bronze';

  // Fetch live events from priority API system (same as odds page)
  const { data: liveEventsResponse, isLoading: isLoadingLive, error: liveError } = useQuery({
    queryKey: ['/api/odds'],
    refetchInterval: 30000,
  });

  // Extract authentic data from priority API response
  const liveEvents: any[] = liveEventsResponse?.success ? liveEventsResponse.data : (liveEventsResponse?.data || liveEventsResponse || []);

  // Use same data for upcoming events since they're from the same authentic source
  const upcomingEvents = liveEvents;
  const isLoadingUpcoming = isLoadingLive;

  // Helper to safely get team name from real API data
  const getTeamName = (event: any, isHome: boolean = true) => {
    if (!event) return isHome ? 'Home Team' : 'Away Team';
    
    if (isHome) {
      return event.homeTeam || event.home_team || event.homeTeamName || 'Home Team';
    } else {
      return event.awayTeam || event.away_team || event.awayTeamName || 'Away Team';
    }
  };

  // Helper to get sport name by key
  const getSportName = (sportKey: string) => {
    const league = PROFESSIONAL_LEAGUES.find(l => l.key === sportKey);
    return league ? league.displayName : (sportKey || 'Live Event');
  };

  // Handle adding a bet to the bet slip
  const handleAddBet = (event: any, betType: string, selection: string, odds: number, point?: number) => {
    if (!event) return;
    
    const newBet = {
      id: `${event.id}-${betType}-${selection}`,
      eventId: event.id,
      gameTitle: `${getTeamName(event, false)} vs ${getTeamName(event, true)}`,
      betType,
      selection,
      odds,
      point,
      amount: 0,
      potential: 0,
      sport: event.sport_title || getSportName(event.sport_key) || 'Live Event',
    };
    
    setBetSlip(prev => [...prev, newBet]);
  };

  // Toggle league selection
  const toggleLeague = (leagueKey: string) => {
    if (selectedLeagues.includes(leagueKey)) {
      setSelectedLeagues(selectedLeagues.filter(key => key !== leagueKey));
    } else {
      setSelectedLeagues([...selectedLeagues, leagueKey]);
    }
  };

  // Toggle bet type selection
  const toggleBetType = (type: BetType) => {
    if (betTypes.includes(type)) {
      setBetTypes(betTypes.filter(t => t !== type));
    } else {
      setBetTypes([...betTypes, type]);
    }
  };

  // Process and filter events - handle real API response structure
  // upcomingEvents already declared above from authentic data
  
  const filteredLiveEvents = Array.isArray(liveEvents) ? liveEvents.filter((event: any) => {
    if (selectedLeagues.length === 0) return true;
    return selectedLeagues.includes(event.sport_key);
  }) : [];
  
  const filteredUpcomingEvents = Array.isArray(upcomingEvents) ? upcomingEvents.filter((event: any) => {
    if (selectedLeagues.length === 0) return true;
    // Map real sport names to our league keys
    const sportMapping: any = {
      'NBA Basketball': 'basketball_nba',
      'NFL Football': 'americanfootball_nfl',
      'MLB Baseball': 'baseball_mlb',
      'NHL Hockey': 'icehockey_nhl'
    };
    const mappedSport = sportMapping[event.sport] || event.sport_key || event.sport;
    return selectedLeagues.includes(mappedSport);
  }) : [];

  // Sort leagues alphabetically for display
  const sortedLeagues = [...PROFESSIONAL_LEAGUES].sort((a, b) => a.displayName.localeCompare(b.displayName));

  return (
    <div className="container px-4 max-w-7xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Professional Sports Betting Dashboard</h1>
      
      {(isLoadingLive || isLoadingUpcoming) && (
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading betting data...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bet Slip Summary */}
      {betSlip.length > 0 && (
        <div className="mb-6">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">Bet Slip ({betSlip.length} selections)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {betSlip.map((bet) => (
                  <div key={bet.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm">{bet.gameTitle} - {bet.selection}</span>
                    <span className="text-sm font-medium">{bet.odds > 0 ? '+' : ''}{bet.odds}</span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full mt-4" 
                onClick={() => setBetSlip([])}
              >
                Clear Bet Slip
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* League Filter */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Sports Leagues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sortedLeagues.map((league) => (
                <Button
                  key={league.key}
                  variant={selectedLeagues.includes(league.key) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleLeague(league.key)}
                  className="flex items-center gap-2"
                >
                  <img
                    src={getLeagueLogo(league.key)}
                    alt={`${league.name} logo`}
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  {league.displayName}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bet Type Filter */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Bet Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(['moneyline', 'spread', 'total', 'player-props', 'team-props', 'parlays'] as BetType[]).map((type) => (
                <Button
                  key={type}
                  variant={betTypes.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleBetType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Events */}
      {filteredLiveEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🔴 Live Games</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLiveEvents.map((event: any) => (
              <Card key={event.id} className="border-red-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="destructive">LIVE</Badge>
                    <span className="text-sm text-gray-500">{getSportName(event.sport_key)}</span>
                  </div>
                  <CardTitle className="text-lg">
                    {getTeamName(event, false)} vs {getTeamName(event, true)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {betTypes.includes('moneyline') && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleAddBet(event, 'moneyline', getTeamName(event, false), +120)}
                        >
                          {getTeamName(event, false).slice(0, 3)} +120
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleAddBet(event, 'moneyline', getTeamName(event, true), -140)}
                        >
                          {getTeamName(event, true).slice(0, 3)} -140
                        </Button>
                      </>
                    )}
                    {betTypes.includes('spread') && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleAddBet(event, 'spread', getTeamName(event, false), -110, +3.5)}
                        >
                          {getTeamName(event, false).slice(0, 3)} +3.5
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleAddBet(event, 'spread', getTeamName(event, true), -110, -3.5)}
                        >
                          {getTeamName(event, true).slice(0, 3)} -3.5
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {filteredUpcomingEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">📅 Upcoming Games</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUpcomingEvents.slice(0, 12).map((event: any) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {formatGameTime(event.startTime || event.commence_time)}
                    </Badge>
                    <span className="text-sm text-gray-500">{getSportName(event.sport_key || event.sport)}</span>
                  </div>
                  <CardTitle className="text-lg">
                    {getTeamName(event, false)} vs {getTeamName(event, true)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {betTypes.includes('moneyline') && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleAddBet(event, 'moneyline', getTeamName(event, false), +110)}
                        >
                          {getTeamName(event, false).slice(0, 3)} +110
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleAddBet(event, 'moneyline', getTeamName(event, true), -130)}
                        >
                          {getTeamName(event, true).slice(0, 3)} -130
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredLiveEvents.length === 0 && filteredUpcomingEvents.length === 0 && !isLoadingLive && !isLoadingUpcoming && (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">No events available</h3>
            <p className="text-gray-500 mb-4">
              Try selecting different leagues or check back later for more games.
            </p>
            <Button onClick={() => setSelectedLeagues(PROFESSIONAL_LEAGUES.map(l => l.key))}>
              Show All Leagues
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BettingDashboard;