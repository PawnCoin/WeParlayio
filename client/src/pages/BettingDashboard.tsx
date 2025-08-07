import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { Target, DollarSign, TrendingUp } from 'lucide-react';
import UnifiedBetSlip from '@/components/betting/UnifiedBetSlip';

// Simple format game time
const formatGameTime = (dateString: string) => {
  if (!dateString) return 'TBD';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  } catch {
    return 'TBD';
  }
};

// Simple format odds
const formatOdds = (odds: number) => {
  if (!odds && odds !== 0) return '0';
  return odds > 0 ? `+${odds}` : `${odds}`;
};

const BettingDashboard: React.FC = () => {
  const { user } = useAuth();
  const { betSlip, addBet, updateBet, removeFromBetSlip, clearBetSlip } = useBetSlip();

  // Get upcoming events
  const { data: upcomingEvents, isLoading } = useQuery({
    queryKey: ['/api/unified-sports/upcoming-events'],
    refetchInterval: 30000,
  });

  const rawEvents = (upcomingEvents as any)?.data || [];
  
  // Sort events to show variety across sports instead of all NFL first
  const events = React.useMemo(() => {
    if (!rawEvents.length) return [];
    
    // Group by sport first
    const groupedBySport: { [key: string]: any[] } = {};
    rawEvents.forEach((event: any) => {
      const sport = event.sport || event.league || 'Unknown';
      if (!groupedBySport[sport]) groupedBySport[sport] = [];
      groupedBySport[sport].push(event);
    });
    
    // Create a mixed array by taking events from each sport in round-robin fashion
    const sportKeys = Object.keys(groupedBySport);
    const mixedEvents: any[] = [];
    let maxLength = Math.max(...Object.values(groupedBySport).map((arr: any[]) => arr.length));
    
    for (let i = 0; i < maxLength; i++) {
      for (const sport of sportKeys) {
        if (groupedBySport[sport] && groupedBySport[sport][i]) {
          mixedEvents.push(groupedBySport[sport][i]);
        }
      }
    }
    
    return mixedEvents;
  }, [rawEvents]);
  
  // Debug: Log API data to see what's being returned
  React.useEffect(() => {
    if (events.length > 0) {
      console.log('🎯 Total events received:', events.length);
      console.log('🎯 Mixed events (first 12):', events.slice(0, 12).map(e => ({
        sport: e.sport,
        homeTeam: e.homeTeam?.name,
        awayTeam: e.awayTeam?.name
      })));
      
      // Count by sport
      const sportCounts: { [key: string]: number } = {};
      events.forEach((event: any) => {
        const sport = event.sport || event.league || 'Unknown';
        sportCounts[sport] = (sportCounts[sport] || 0) + 1;
      });
      console.log('🎯 Sports breakdown:', sportCounts);
    }
  }, [events]);
  
  // Use user object from auth context for balance data
  const balances = {
    weparlay_cash: user?.weparlayCashBalance || user?.balance || 1000000,
    real_money: user?.cashBalance || 0,
    crypto: 0
  };

  // Helper to get team names safely
  const getTeamName = (event: any, isHome: boolean = true) => {
    if (!event) return isHome ? 'Home' : 'Away';
    
    if (isHome) {
      const homeTeam = event.homeTeam || event.home_team;
      return typeof homeTeam === 'string' ? homeTeam : homeTeam?.name || 'Home';
    } else {
      const awayTeam = event.awayTeam || event.away_team;
      return typeof awayTeam === 'string' ? awayTeam : awayTeam?.name || 'Away';
    }
  };

  // Add bet to slip - Fixed to match other slips functionality
  const handleAddBet = (event: any, betType: string, selection: string, odds: number) => {
    if (!event) {
      console.warn('🚨 handleAddBet: No event provided');
      return;
    }
    
    const homeTeamName = getTeamName(event, true);
    const awayTeamName = getTeamName(event, false);
    
    const newBet = {
      id: `${event.id || event.eventId || Date.now()}-${betType}-${selection.replace(/\s+/g, '-')}-${Date.now()}`,
      eventId: String(event.id || event.eventId || `event-${Date.now()}`),
      betType,
      selection,
      homeTeam: homeTeamName,
      awayTeam: awayTeamName,
      odds: Number(odds) || -110,
      sport: event.sport || event.league || 'Football',
      amount: 0,
      potential: 0,
      gameTitle: `${awayTeamName} @ ${homeTeamName}`,
      pick: selection,
      date: event.date || event.startTime || new Date().toISOString()
    };
    
    console.log('🎯 Adding bet to slip:', newBet);
    addBet(newBet);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Betting Dashboard</h1>
          <p className="text-slate-400">Place your bets on upcoming games across all sports</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Games - Takes 2/3 of the width */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-400" />
                  Upcoming Games ({events.length})
                </CardTitle>
                <p className="text-slate-400 text-sm">All sports available for betting</p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-slate-400">Loading games...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.slice(0, 12).map((event: any, index: number) => (
                      <div key={event.id || index} className="bg-slate-800 p-4 rounded-lg">
                        {/* Game Info */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {event.sport || event.league || 'NFL'}
                              </Badge>
                              <span className="text-slate-400 text-xs">
                                {formatGameTime(event.date || event.startTime)}
                              </span>
                            </div>
                            <p className="text-white font-medium">
                              {getTeamName(event, false)} @ {getTeamName(event, true)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Simple Betting Options */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 hover:bg-slate-700"
                            onClick={() => handleAddBet(event, 'moneyline', getTeamName(event, false), event.odds?.awayWin || -110)}
                          >
                            {getTeamName(event, false)} {formatOdds(event.odds?.awayWin || -110)}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 hover:bg-slate-700"
                            onClick={() => handleAddBet(event, 'moneyline', getTeamName(event, true), event.odds?.homeWin || -110)}
                          >
                            {getTeamName(event, true)} {formatOdds(event.odds?.homeWin || -110)}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bet Slip - Takes 1/3 of the width */}
          <div className="space-y-4">
            <UnifiedBetSlip
              betSlip={betSlip.map(bet => ({
                ...bet,
                eventId: bet.eventId || 'unknown',
                gameInfo: {
                  homeTeam: bet.homeTeam || 'Home',
                  awayTeam: bet.awayTeam || 'Away',
                  startTime: bet.date
                }
              }))}
              balances={balances}
              onUpdateBet={(betId, amount) => {
                // Calculate potential winnings based on American odds
                const bet = betSlip.find(b => b.id === betId);
                if (bet) {
                  let potential = 0;
                  if (bet.odds > 0) {
                    potential = amount * (bet.odds / 100);
                  } else {
                    potential = amount * (100 / Math.abs(bet.odds));
                  }
                  
                  // Update the existing bet with new amount and potential
                  updateBet(betId, {
                    amount: amount,
                    potential: potential + amount // Include original bet amount
                  });
                }
              }}
              onRemoveBet={removeFromBetSlip}
              onClearAll={clearBetSlip}
            />
            
            {/* User Stats */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">WeParlay Cash:</span>
                  <span className="text-green-400">${balances.weparlay_cash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Bets:</span>
                  <span className="text-white">{betSlip.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingDashboard;