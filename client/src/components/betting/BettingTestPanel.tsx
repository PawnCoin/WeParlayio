import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { DollarSign, Plus, RefreshCw } from 'lucide-react';

export const BettingTestPanel: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user balances
  const { data: balancesData, isLoading: balancesLoading } = useQuery({
    queryKey: ['/api/user/balances'],
    refetchInterval: 5000,
  });

  // Fetch user bets
  const { data: userBetsData, isLoading: betsLoading } = useQuery({
    queryKey: ['/api/bets/user'],
    refetchInterval: 5000,
  });

  const balances = balancesData?.balances || {};
  const userBets = userBetsData?.bets || [];

  // Add balance mutation
  const addBalanceMutation = useMutation({
    mutationFn: async (data: { currency: string; amount: number }) => {
      return apiRequest('/api/user/add-balance', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Balance Added',
        description: `Added $${data.amount} to ${data.currency.replace('_', ' ')}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add balance',
        variant: 'destructive'
      });
    }
  });

  const handleAddBalance = (currency: string, amount: number) => {
    addBalanceMutation.mutate({ currency, amount });
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });
    queryClient.invalidateQueries({ queryKey: ['/api/bets/user'] });
  };

  return (
    <div className="space-y-4">
      {/* Test Controls */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-400" />
              Betting Test Panel
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={balancesLoading}
              className="border-slate-600 hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Balances */}
          <div>
            <h3 className="text-white font-medium mb-2">Current Balances</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-slate-800 p-3 rounded-lg">
                <p className="text-slate-400 text-xs">WeParlay Cash</p>
                <p className="text-amber-400 font-bold">${balances.weparlay_cash?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <p className="text-slate-400 text-xs">Real Money</p>
                <p className="text-green-400 font-bold">${balances.real_money?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <p className="text-slate-400 text-xs">Crypto</p>
                <p className="text-blue-400 font-bold">${balances.crypto?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <p className="text-slate-400 text-xs">Default</p>
                <p className="text-purple-400 font-bold">${balances.default?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          {/* Add Balance Controls */}
          <div>
            <h3 className="text-white font-medium mb-2">Add Test Balance</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddBalance('weparlay_cash', 100)}
                disabled={addBalanceMutation.isPending}
                className="border-amber-600 text-amber-400 hover:bg-amber-900/20"
              >
                <Plus className="h-4 w-4 mr-1" />
                +$100 WeParlay
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddBalance('real_money', 50)}
                disabled={addBalanceMutation.isPending}
                className="border-green-600 text-green-400 hover:bg-green-900/20"
              >
                <Plus className="h-4 w-4 mr-1" />
                +$50 Real Money
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddBalance('crypto', 25)}
                disabled={addBalanceMutation.isPending}
                className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
              >
                <Plus className="h-4 w-4 mr-1" />
                +$25 Crypto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddBalance('default', 75)}
                disabled={addBalanceMutation.isPending}
                className="border-purple-600 text-purple-400 hover:bg-purple-900/20"
              >
                <Plus className="h-4 w-4 mr-1" />
                +$75 Default
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Bets History */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Bet History ({userBets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {betsLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-slate-400">Loading bets...</span>
            </div>
          ) : userBets.length === 0 ? (
            <p className="text-slate-400 text-center py-4">No bets placed yet. Add some bets to see them here!</p>
          ) : (
            <div className="space-y-3">
              {userBets.slice(0, 10).map((bet: any, index: number) => (
                <div key={bet.id || index} className="bg-slate-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {bet.betType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {bet.currency?.replace('_', ' ') || 'USD'}
                      </Badge>
                      <Badge 
                        variant={bet.status === 'pending' ? 'secondary' : bet.status === 'won' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {bet.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-medium">${bet.amount}</p>
                      <p className="text-slate-400 text-xs">Potential: ${bet.potentialPayout?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm">{bet.selection}</p>
                      <p className="text-slate-400 text-xs">
                        {bet.odds > 0 ? '+' : ''}{bet.odds}
                        {bet.point && ` (${bet.point > 0 ? '+' : ''}${bet.point})`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">
                        {bet.placedAt ? new Date(bet.placedAt).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BettingTestPanel;