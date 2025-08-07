import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useBetSlip } from '@/contexts/BetSlipContext';
import { getLeagueLogo } from '@/utils/sportsLogosSimple';
import UnifiedBetSlip from '@/components/betting/UnifiedBetSlip';
import BettingTestPanel from '@/components/betting/BettingTestPanel';
import BetSettlementPanel from '@/components/betting/BetSettlementPanel';
import { DollarSign, TrendingUp, Trophy, Clock, Target } from 'lucide-react';

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

// Helper function to format odds to 2 decimal places
const formatOdds = (odds: number) => {
  if (!odds && odds !== 0) return '0';
  return Number(odds).toFixed(2).replace(/\.?0+$/, '');
};

// Professional leagues configuration
const PROFESSIONAL_LEAGUES = [
  { name: 'NFL', key: 'americanfootball_nfl', displayName: 'NFL (American Football)' },
  { name: 'NBA', key: 'basketball_nba', displayName: 'NBA (Basketball)' },
  { name: 'MLB', key: 'baseball_mlb', displayName: 'MLB (Baseball)' },
  { name: 'NHL', key: 'icehockey_nhl', displayName: 'NHL (Ice Hockey)' },
  { name: 'MLS', key: 'soccer_usa_mls', displayName: 'MLS (Soccer)' },
];

interface BetSlipItem {
  id: string;
  eventId: string;
  betType: string;
  selection: string;
  odds: number;
  amount: number;
  potential: number;
  point?: number;
  sport: string;
  gameInfo?: {
    homeTeam: string;
    awayTeam: string;
    startTime?: string;
  };
}

const BettingDashboard: React.FC = () => {
  const { user } = useAuth();
  const { betSlip: contextBetSlip, bets: contextBets, addBet, removeFromBetSlip, clearBetSlip } = useBetSlip();
  const [localBetSlip, setLocalBetSlip] = useState<BetSlipItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<'weparlay_cash' | 'real_money' | 'crypto'>('weparlay_cash');
  const [activeSlipType, setActiveSlipType] = useState<'traditional' | 'crypto'>('traditional');

  // Use ONLY the context bet slip for perfect synchronization between left and right
  const betSlip = contextBetSlip.map(bet => ({
    id: bet.id,
    eventId: bet.eventId || '',
    betType: bet.betType,
    selection: bet.selection || bet.pick || '',
    odds: bet.odds,
    amount: bet.amount || 0,
    potential: bet.potential || 0,
    point: bet.point,
    sport: bet.sport || '',
    gameInfo: {
      homeTeam: bet.homeTeam || '',
      awayTeam: bet.awayTeam || '',
      startTime: ''
    }
  } as BetSlipItem));

  // Fetch live odds data from unified sports API
  const { data: oddsResponse, isLoading: isLoadingOdds } = useQuery({
    queryKey: ['/api/unified-sports/upcoming-events'],
    refetchInterval: 30000,
  });

  // Fetch user bets history
  const { data: userBetsData } = useQuery({
    queryKey: ['/api/bets/user'],
  });

  // Fetch user balances
  const { data: balancesData } = useQuery({
    queryKey: ['/api/user/balances'],
    refetchInterval: 10000,
  });

  // Extract authentic events data from unified sports API
  const oddsData: any[] = (oddsResponse as any)?.success ? (oddsResponse as any).data : (oddsResponse as any)?.data || [];
  const userBets = (userBetsData as any)?.bets || [];
  const balances = (balancesData as any)?.balances || {};

  // Helper to safely get team name from real API data
  const getTeamName = (event: any, isHome: boolean = true) => {
    if (!event) return isHome ? 'Home Team' : 'Away Team';
    
    if (isHome) {
      return event.homeTeam || event.home_team || event.homeTeamName || 'Home Team';
    } else {
      return event.awayTeam || event.away_team || event.awayTeamName || 'Away Team';
    }
  };

  // Handle adding a bet to the bet slip - use context to sync both slips
  const handleAddBet = (event: any, betType: string, selection: string, odds: number, point?: number) => {
    if (!event) return;
    
    const newBet = {
      id: `${event.eventId || event.id}-${betType}-${selection}-${Date.now()}`,
      eventId: event.eventId || event.id,
      betType,
      selection,
      homeTeam: getTeamName(event, true),
      awayTeam: getTeamName(event, false),
      odds,
      point,
      sport: event.sport || 'American Football',
      amount: 0,
      potential: 0,
      gameTitle: `${getTeamName(event, false)} vs ${getTeamName(event, true)}`,
      pick: selection
    };
    
    // Add to context (this will update the left bet slip)
    addBet(newBet);
  };

  // Remove bet from slip - only use context for perfect sync
  const handleRemoveBet = (betId: string) => {
    removeFromBetSlip(betId);
  };

  // Clear all bets - only use context for perfect sync  
  const handleClearAll = () => {
    clearBetSlip();
  };

  // Update bet amount and calculate potential payout - only use context for perfect sync
  const handleUpdateBet = (betId: string, amount: number) => {
    const contextBet = contextBetSlip.find(bet => bet.id === betId);
    if (contextBet) {
      const odds = contextBet.odds || 1;
      const potential = amount * (odds > 0 ? odds / 100 + 1 : 100 / Math.abs(odds) + 1);
      const updatedBet = { ...contextBet, amount, potential };
      
      // Remove old bet and add updated one
      removeFromBetSlip(betId);
      addBet(updatedBet);
    }
  };

  // Calculate user stats
  const totalPendingBets = userBets.filter((bet: any) => bet.status === 'pending').length;
  const totalWinnings = userBets
    .filter((bet: any) => bet.status === 'won')
    .reduce((sum: number, bet: any) => sum + (bet.potentialPayout || 0), 0);
  const winRate = userBets.length > 0 
    ? (userBets.filter((bet: any) => bet.status === 'won').length / userBets.length * 100).toFixed(1)
    : '0.0';

  return (
    <div className="container px-4 max-w-7xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Betting Dashboard</h1>
      
      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">WeParlay Cash</p>
                <p className="text-2xl font-bold text-amber-500">${balances.weparlay_cash?.toFixed(2) || '0.00'}</p>
              </div>
              <DollarSign className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Winnings</p>
                <p className="text-2xl font-bold text-green-500">${totalWinnings.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-blue-500">{winRate}%</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending Bets</p>
                <p className="text-2xl font-bold text-orange-500">{totalPendingBets}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Odds Section */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-400" />
                Live Betting Odds
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOdds ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-slate-400">Loading odds...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {oddsData.slice(0, 8).map((event: any, index: number) => (
                    <div key={event.eventId || index} className="bg-slate-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {event.sport || 'Football'}
                            </Badge>
                            <span className="text-slate-400 text-xs">
                              {formatGameTime(event.startTime || event.commence_time)}
                            </span>
                          </div>
                          <p className="text-white font-medium">
                            {getTeamName(event, false)} @ {getTeamName(event, true)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Betting Options */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* Moneyline */}
                        {event.odds?.moneyline && (
                          <div className="space-y-1">
                            <p className="text-slate-400 text-xs text-center">Moneyline</p>
                            <div className="grid grid-cols-2 gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 border-slate-600 hover:bg-slate-700"
                                onClick={() => handleAddBet(event, 'moneyline', getTeamName(event, false), event.odds.moneyline.away)}
                              >
                                {getTeamName(event, false).slice(0, 3)} {event.odds.moneyline.away > 0 ? '+' : ''}{formatOdds(event.odds.moneyline.away)}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 border-slate-600 hover:bg-slate-700"
                                onClick={() => handleAddBet(event, 'moneyline', getTeamName(event, true), event.odds.moneyline.home)}
                              >
                                {getTeamName(event, true).slice(0, 3)} {event.odds.moneyline.home > 0 ? '+' : ''}{formatOdds(event.odds.moneyline.home)}
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {/* Spread */}
                        {event.odds?.spread && (
                          <div className="space-y-1">
                            <p className="text-slate-400 text-xs text-center">Spread</p>
                            <div className="grid grid-cols-2 gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 border-slate-600 hover:bg-slate-700"
                                onClick={() => handleAddBet(event, 'spread', `${getTeamName(event, false)} ${event.odds.spread.away > 0 ? '+' : ''}${event.odds.spread.away}`, event.odds.spread.awayOdds, event.odds.spread.away)}
                              >
                                {event.odds.spread.away > 0 ? '+' : ''}{formatOdds(event.odds.spread.away)} ({event.odds.spread.awayOdds > 0 ? '+' : ''}{formatOdds(event.odds.spread.awayOdds)})
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 border-slate-600 hover:bg-slate-700"
                                onClick={() => handleAddBet(event, 'spread', `${getTeamName(event, true)} ${event.odds.spread.home > 0 ? '+' : ''}${event.odds.spread.home}`, event.odds.spread.homeOdds, event.odds.spread.home)}
                              >
                                {event.odds.spread.home > 0 ? '+' : ''}{formatOdds(event.odds.spread.home)} ({event.odds.spread.homeOdds > 0 ? '+' : ''}{formatOdds(event.odds.spread.homeOdds)})
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {/* Total */}
                        {event.odds?.total && (
                          <div className="space-y-1">
                            <p className="text-slate-400 text-xs text-center">Total</p>
                            <div className="grid grid-cols-2 gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 border-slate-600 hover:bg-slate-700"
                                onClick={() => handleAddBet(event, 'total', `Over ${event.odds.total.over}`, event.odds.total.overOdds, event.odds.total.over)}
                              >
                                O {formatOdds(event.odds.total.over)} ({event.odds.total.overOdds > 0 ? '+' : ''}{formatOdds(event.odds.total.overOdds)})
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 border-slate-600 hover:bg-slate-700"
                                onClick={() => handleAddBet(event, 'total', `Under ${event.odds.total.under}`, event.odds.total.underOdds, event.odds.total.under)}
                              >
                                U {formatOdds(event.odds.total.under)} ({event.odds.total.underOdds > 0 ? '+' : ''}{formatOdds(event.odds.total.underOdds)})
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Bet Slip with Currency Selection */}
        <div className="lg:col-span-1 space-y-4">
          <UnifiedBetSlip
            betSlip={betSlip}
            balances={balances}
            onUpdateBet={handleUpdateBet}
            onRemoveBet={handleRemoveBet}
            onClearAll={handleClearAll}
          />
          
          {/* Test Panel for Development */}
          <BettingTestPanel />
          
          {/* Admin Settlement Panel */}
          <BetSettlementPanel userBets={userBets} />
        </div>
      </div>

      {/* Recent Bets */}
      {userBets.length > 0 && (
        <div className="mt-6">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Bets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userBets.slice(0, 5).map((bet: any, index: number) => (
                  <div key={bet.id || index} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{bet.selection}</p>
                      <p className="text-slate-400 text-xs">{bet.betType} • {bet.odds > 0 ? '+' : ''}{bet.odds}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm">${bet.amount}</p>
                      <Badge 
                        variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {bet.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BettingDashboard;