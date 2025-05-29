
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
  event: string;
  type: 'moneyline' | 'spread' | 'over_under' | 'parlay';
  amount: number;
  odds: string;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  placedAt: string;
  settledAt?: string;
  payout?: number;
  selections: Array<{
    team: string;
    market: string;
    odds: string;
  }>;
}

const MyBets: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'won' | 'lost'>('all');

  // Mock bet data - replace with real API call
  const mockBets: Bet[] = [
    {
      id: '1',
      event: 'Lakers vs Warriors',
      type: 'moneyline',
      amount: 50,
      odds: '+125',
      status: 'won',
      placedAt: '2024-01-20T14:30:00Z',
      settledAt: '2024-01-20T22:15:00Z',
      payout: 112.50,
      selections: [{ team: 'Lakers', market: 'Moneyline', odds: '+125' }]
    },
    {
      id: '2',
      event: 'Celtics vs Heat',
      type: 'spread',
      amount: 25,
      odds: '-110',
      status: 'pending',
      placedAt: '2024-01-21T10:15:00Z',
      selections: [{ team: 'Celtics', market: 'Spread -3.5', odds: '-110' }]
    },
    {
      id: '3',
      event: 'Cowboys vs Giants | Chiefs vs Raiders',
      type: 'parlay',
      amount: 100,
      odds: '+280',
      status: 'lost',
      placedAt: '2024-01-19T16:45:00Z',
      settledAt: '2024-01-21T21:30:00Z',
      selections: [
        { team: 'Cowboys', market: 'Moneyline', odds: '-150' },
        { team: 'Chiefs', market: 'Spread -7', odds: '-110' }
      ]
    }
  ];

  const { data: bets = mockBets } = useQuery({
    queryKey: ['user-bets', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user?.id}/bets`);
      if (!response.ok) return mockBets;
      return response.json();
    },
    enabled: isAuthenticated && !!user?.id,
  });

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
    const stats = {
      totalBets: bets.length,
      wonBets: bets.filter(b => b.status === 'won').length,
      totalWagered: bets.reduce((sum, bet) => sum + bet.amount, 0),
      totalWinnings: bets.filter(b => b.status === 'won').reduce((sum, bet) => sum + (bet.payout || 0), 0),
      pendingBets: bets.filter(b => b.status === 'pending').length
    };
    
    stats.winRate = stats.totalBets > 0 ? (stats.wonBets / stats.totalBets) * 100 : 0;
    stats.profit = stats.totalWinnings - stats.totalWagered;
    
    return stats;
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Bets</h1>
        <Button variant="outline" onClick={() => window.location.href = '/comprehensive-betting'}>
          Place New Bet
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Wagered</span>
            </div>
            <p className="text-2xl font-bold">${stats.totalWagered}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total Winnings</span>
            </div>
            <p className="text-2xl font-bold">${stats.totalWinnings}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Win Rate</span>
            </div>
            <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Total Bets</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalBets}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold">{stats.pendingBets}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bet History */}
      <Card>
        <CardHeader>
          <CardTitle>Bet History</CardTitle>
          <CardDescription>View and track all your betting activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Bets</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="won">Won</TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedFilter} className="mt-6">
              <div className="space-y-4">
                {filteredBets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No bets found for this filter.</p>
                  </div>
                ) : (
                  filteredBets.map((bet) => (
                    <Card key={bet.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusIcon(bet.status)}
                              <h3 className="font-semibold">{bet.event}</h3>
                              {getStatusBadge(bet.status)}
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>Type: {bet.type.replace('_', ' ').toUpperCase()}</p>
                              <p>Placed: {new Date(bet.placedAt).toLocaleDateString()}</p>
                              {bet.settledAt && (
                                <p>Settled: {new Date(bet.settledAt).toLocaleDateString()}</p>
                              )}
                            </div>
                            
                            <div className="mt-3 space-y-1">
                              {bet.selections.map((selection, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">{selection.team}</span> - {selection.market} ({selection.odds})
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold">Wager: ${bet.amount}</p>
                            <p className="text-sm text-gray-600">Odds: {bet.odds}</p>
                            {bet.payout && (
                              <p className="font-semibold text-green-600 mt-1">
                                Payout: ${bet.payout}
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
  );
};

export default MyBets;
