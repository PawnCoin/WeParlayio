import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Trophy, TrendingDown, ArrowLeft, Check } from 'lucide-react';

interface BetSettlementPanelProps {
  userBets: any[];
}

export const BetSettlementPanel: React.FC<BetSettlementPanelProps> = ({ userBets }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBetId, setSelectedBetId] = useState<string>('');
  const [settlementResult, setSettlementResult] = useState<'won' | 'lost' | 'push' | 'cancelled'>('won');

  // Settlement mutation
  const settleBetMutation = useMutation({
    mutationFn: async (data: { betId: string; result: string }) => {
      return apiRequest(`/api/bets/${data.betId}/settle`, {
        method: 'POST',
        body: JSON.stringify({ result: data.result }),
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Bet Settled',
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bets/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });
      setSelectedBetId('');
    },
    onError: (error: any) => {
      toast({
        title: 'Settlement Failed',
        description: error.message || 'Failed to settle bet',
        variant: 'destructive'
      });
    }
  });

  const handleSettlement = () => {
    if (!selectedBetId) {
      toast({
        title: 'No Bet Selected',
        description: 'Please select a bet to settle',
        variant: 'destructive'
      });
      return;
    }

    settleBetMutation.mutate({ betId: selectedBetId, result: settlementResult });
  };

  const pendingBets = userBets.filter(bet => bet.status === 'pending');

  if (pendingBets.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Check className="h-5 w-5 mr-2 text-green-400" />
            Bet Settlement (Admin)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-center py-4">No pending bets to settle</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
          Bet Settlement (Admin Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bet Selection */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">Select Bet to Settle</label>
          <Select value={selectedBetId} onValueChange={setSelectedBetId}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Choose a pending bet..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {pendingBets.map((bet) => (
                <SelectItem key={bet.id} value={bet.id.toString()} className="text-white hover:bg-slate-700">
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{bet.selection}</span>
                    <span className="ml-2 text-amber-400">${bet.amount}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Settlement Result */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">Settlement Result</label>
          <Select value={settlementResult} onValueChange={(value: any) => setSettlementResult(value)}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="won" className="text-green-400 hover:bg-slate-700">
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  Won - Full Payout
                </div>
              </SelectItem>
              <SelectItem value="lost" className="text-red-400 hover:bg-slate-700">
                <div className="flex items-center">
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Lost - No Payout
                </div>
              </SelectItem>
              <SelectItem value="push" className="text-yellow-400 hover:bg-slate-700">
                <div className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Push - Refund Bet
                </div>
              </SelectItem>
              <SelectItem value="cancelled" className="text-gray-400 hover:bg-slate-700">
                <div className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancelled - Refund Bet
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selected Bet Details */}
        {selectedBetId && (
          <div className="bg-slate-800 p-3 rounded-lg">
            {(() => {
              const selectedBet = pendingBets.find(bet => bet.id.toString() === selectedBetId);
              if (!selectedBet) return null;
              
              return (
                <div>
                  <h3 className="text-white font-medium mb-2">Bet Details</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Selection:</span>
                      <span className="text-white">{selectedBet.selection}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bet Amount:</span>
                      <span className="text-white">${selectedBet.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Potential Payout:</span>
                      <span className="text-green-400">${selectedBet.potentialPayout?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Currency:</span>
                      <span className="text-white">{selectedBet.currency?.replace('_', ' ') || 'USD'}</span>
                    </div>
                  </div>
                  
                  {/* Settlement Preview */}
                  <div className="mt-3 p-2 bg-slate-700 rounded">
                    <h4 className="text-white text-xs font-medium mb-1">Settlement Preview:</h4>
                    <div className="text-xs">
                      {settlementResult === 'won' && (
                        <span className="text-green-400">
                          User will receive: ${selectedBet.potentialPayout?.toFixed(2)} (full payout)
                        </span>
                      )}
                      {settlementResult === 'lost' && (
                        <span className="text-red-400">
                          User will receive: $0.00 (bet lost)
                        </span>
                      )}
                      {(settlementResult === 'push' || settlementResult === 'cancelled') && (
                        <span className="text-yellow-400">
                          User will receive: ${selectedBet.amount} (refund)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Settlement Button */}
        <Button 
          onClick={handleSettlement}
          disabled={!selectedBetId || settleBetMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {settleBetMutation.isPending ? 'Settling...' : `Settle as ${settlementResult.toUpperCase()}`}
        </Button>

        <p className="text-slate-400 text-xs text-center">
          Admin only feature. In production, settlements would be automated based on real game results.
        </p>
      </CardContent>
    </Card>
  );
};

export default BetSettlementPanel;