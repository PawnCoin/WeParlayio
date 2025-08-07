
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Clock, X, DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface Bet {
  id: string;
  eventId: string;
  betType: string;
  pick: string;
  selection: string;
  odds: number;
  amount: number;
  potentialPayout: number;
  currency: string;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  createdAt: string;
  settledAt?: string;
  gameInfo?: {
    homeTeam: string;
    awayTeam: string;
    startTime: string;
  };
  point?: string;
  sport?: string;
}

const MyBets: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');

  // Fetch authentic betting data from database
  const { data: betsResponse, isLoading: betsLoading, error: betsError } = useQuery({
    queryKey: ['/api/bets/user'],
    enabled: isAuthenticated,
  });

  const bets = betsResponse?.bets || [];

  const filteredBets = bets.filter(bet => 
    selectedFilter === 'all' || bet.status === selectedFilter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won': return <Trophy className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'lost': return <X className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const calculateStats = () => {
    const totalBets = bets.length;
    const wonBets = bets.filter(b => b.status === 'won').length;
    const totalWagered = bets.reduce((sum, bet) => sum + bet.amount, 0);
    const totalWinnings = bets.filter(b => b.status === 'won').reduce((sum, bet) => sum + bet.potentialPayout, 0);
    const pendingBets = bets.filter(b => b.status === 'pending').length;
    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    const profit = totalWinnings - totalWagered;
    
    return {
      totalBets,
      wonBets,
      totalWagered,
      totalWinnings,
      pendingBets,
      winRate,
      profit
    };
  };

  const stats = calculateStats();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Please log in to view your bets</h2>
            <Button onClick={() => window.location.href = '/login'}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">My Bets</h1>
            <p className="text-blue-300">Track your betting history and performance</p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/live-betting'} className="text-white border-white hover:bg-white hover:text-black">
            Place New Bet
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Total Wagered</span>
              </div>
              <p className="text-2xl font-bold text-white">${stats.totalWagered.toFixed(2)}</p>
            </CardContent>
          </Card>
        
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-blue-300">Total Winnings</span>
              </div>
              <p className="text-2xl font-bold text-white">${stats.totalWinnings.toFixed(2)}</p>
            </CardContent>
          </Card>
        
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-blue-300">Win Rate</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-blue-300">Total Bets</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalBets}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-blue-300">Pending</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.pendingBets}</p>
            </CardContent>
          </Card>
        </div>

        {/* Bet History */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Bet History</CardTitle>
            <CardDescription className="text-blue-300">View and track all your betting activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as any)}>
              <TabsList className="grid w-full grid-cols-4 bg-slate-700">
                <TabsTrigger value="all" className="text-white data-[state=active]:bg-blue-600">All Bets</TabsTrigger>
                <TabsTrigger value="pending" className="text-white data-[state=active]:bg-blue-600">Pending</TabsTrigger>
                <TabsTrigger value="won" className="text-white data-[state=active]:bg-blue-600">Won</TabsTrigger>
                <TabsTrigger value="lost" className="text-white data-[state=active]:bg-blue-600">Lost</TabsTrigger>
              </TabsList>
            
            <TabsContent value={selectedFilter} className="mt-6">
              <div className="space-y-4">
                {betsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-blue-300">Loading your bets...</p>
                  </div>
                ) : filteredBets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-blue-300">No bets found for this filter.</p>
                    {selectedFilter === 'all' && (
                      <Button 
                        onClick={() => window.location.href = '/live-betting'} 
                        className="mt-4"
                      >
                        Place Your First Bet
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredBets.map((bet) => (
                    <Card key={bet.id} className="bg-slate-700/50 border-slate-600 hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusIcon(bet.status)}
                              <h3 className="font-semibold text-white">
                                {bet.gameInfo ? `${bet.gameInfo.awayTeam} @ ${bet.gameInfo.homeTeam}` : `Event ${bet.eventId}`}
                              </h3>
                              {getStatusBadge(bet.status)}
                            </div>
                            
                            <div className="space-y-1 text-sm text-blue-300">
                              <p>Type: <span className="text-white">{bet.betType.replace('_', ' ').toUpperCase()}</span></p>
                              <p>Pick: <span className="text-white">{bet.pick || bet.selection}</span></p>
                              {bet.point && <p>Point: <span className="text-white">{bet.point}</span></p>}
                              <p>Placed: <span className="text-white">{new Date(bet.createdAt).toLocaleDateString()}</span></p>
                              {bet.settledAt && (
                                <p>Settled: <span className="text-white">{new Date(bet.settledAt).toLocaleDateString()}</span></p>
                              )}
                              {bet.gameInfo?.startTime && (
                                <p>Game Time: <span className="text-white">{new Date(bet.gameInfo.startTime).toLocaleString()}</span></p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-white">Wager: ${bet.amount}</p>
                            <p className="text-sm text-blue-300">Odds: {bet.odds > 0 ? `+${bet.odds}` : bet.odds}</p>
                            <p className="text-sm text-blue-400">Potential: ${bet.potentialPayout.toFixed(2)}</p>
                            <p className="text-xs text-blue-200">{bet.currency.replace('_', ' ').toUpperCase()}</p>
                            {bet.status === 'won' && (
                              <p className="font-semibold text-green-400 mt-1">
                                Won: ${bet.potentialPayout.toFixed(2)}
                              </p>
                            )}
                            {bet.status === 'lost' && (
                              <p className="font-semibold text-red-400 mt-1">
                                Lost: ${bet.amount}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyBets;
