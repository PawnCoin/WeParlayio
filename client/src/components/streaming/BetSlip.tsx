import { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target } from 'lucide-react';
import { BetSlip as BetSlipType } from './types';

interface BetSlipProps {
  readonly betSlip: BetSlipType | null;
  readonly userBalance: number;
  readonly betAmount: number;
  readonly onBetAmountChange: (amount: number) => void;
  readonly onConfirmBet: () => void;
  readonly className?: string;
}

const BetSlip = memo(({ 
  betSlip, 
  userBalance, 
  betAmount, 
  onBetAmountChange, 
  onConfirmBet,
  className = '' 
}: BetSlipProps) => {
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = Math.max(0, Math.min(userBalance, Number(e.target.value)));
    onBetAmountChange(newAmount);
  }, [userBalance, onBetAmountChange]);

  const formatBetType = useCallback((betType: string): string => {
    return betType.replace('_', ' ').toUpperCase();
  }, []);

  const isValidBet = betAmount > 0 && betAmount <= userBalance && betSlip !== null;

  if (!betSlip) {
    return (
      <Card className={`bg-gray-900 border-gray-800 sticky top-4 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Bet Slip</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
              <Target className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">Your bet slip is empty</h3>
            <p className="text-gray-400 text-sm">Click on odds to add bets to your slip</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gray-900 border-gray-800 sticky top-4 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Bet Slip</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400">
              Balance: <span className="text-green-400">${userBalance.toFixed(2)}</span>
            </p>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-sm font-medium text-white">{formatBetType(betSlip.betType)}</p>
            <p className="text-xs text-gray-400">Odds: +{betSlip.odds.toFixed(1)}</p>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-300">Stake:</span>
              <span className="text-sm font-bold text-white">${betSlip.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Potential Win:</span>
              <span className="text-sm font-bold text-green-400">${betSlip.potentialWin.toFixed(2)}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Bet Amount ($)
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={handleAmountChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-colors"
              min="1"
              max={userBalance}
              step="0.01"
            />
            {betAmount > userBalance && (
              <p className="text-red-400 text-xs mt-1">Insufficient balance</p>
            )}
          </div>
          
          <Button 
            onClick={onConfirmBet}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            disabled={!isValidBet}
          >
            {!isValidBet ? 'Enter Valid Amount' : 'Confirm Bet'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

BetSlip.displayName = 'BetSlip';

export default BetSlip;