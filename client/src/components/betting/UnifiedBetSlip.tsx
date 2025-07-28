import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  CreditCard, 
  X,
  DollarSign
} from 'lucide-react';
import { useBetSlip } from '@/contexts/BetSlipContext';
import CryptoBetSlip from './CryptoBetSlip';
import PawnCoinIntegration from '@/components/crypto/PawnCoinIntegration';

interface Bet {
  id: string;
  eventId: string;
  selection: string;
  odds: number;
  betType: string;
  gameInfo: string;
}

interface UnifiedBetSlipProps {
  bets?: Bet[];
  onRemoveBet?: (betId: string) => void;
  onClearAll?: () => void;
}

export default function UnifiedBetSlip({ bets: propBets, onRemoveBet: propOnRemoveBet, onClearAll: propOnClearAll }: UnifiedBetSlipProps = {}) {
  // Use BetSlip context if props are not provided
  const betSlipContext = useBetSlip?.() || {} as any;
  const { bets: contextBets = [], removeBet, clearBetSlip } = betSlipContext;
  
  // Use props if provided, otherwise fall back to context
  const bets = propBets || contextBets || [];
  const onRemoveBet = propOnRemoveBet || removeBet || (() => {});
  const onClearAll = propOnClearAll || clearBetSlip || (() => {});
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'fiat' | 'pawncoin'>('crypto');

  if (!bets || bets.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Wallet className="h-5 w-5 mr-2 text-blue-400" />
            Bet Slip
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-slate-400 mb-4">Add bets to your slip to get started</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Wallet className="h-4 w-4" />
              <span>Crypto Betting</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <CreditCard className="h-4 w-4" />
              <span>Traditional Betting</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-white">
            <Wallet className="h-5 w-5 mr-2 text-blue-400" />
            Bet Slip ({bets.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-slate-400 hover:text-white"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'crypto' | 'fiat' | 'pawncoin')}>
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="crypto" className="text-white data-[state=active]:bg-blue-600">
              <Wallet className="h-4 w-4 mr-2" />
              Crypto
            </TabsTrigger>
            <TabsTrigger value="pawncoin" className="text-white data-[state=active]:bg-amber-600">
              <DollarSign className="h-4 w-4 mr-2" />
              Pawn Coin
            </TabsTrigger>
            <TabsTrigger value="fiat" className="text-white data-[state=active]:bg-green-600">
              <CreditCard className="h-4 w-4 mr-2" />
              Traditional
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crypto" className="mt-4">
            <div className="mt-[-16px]">
              <CryptoBetSlip 
                bets={bets as any}
                onRemoveBet={onRemoveBet}
                onClearAll={onClearAll}
              />
            </div>
          </TabsContent>

          <TabsContent value="pawncoin" className="mt-4">
            <div className="mt-[-16px]">
              <PawnCoinIntegration 
                betAmount={bets.reduce((total, bet) => total + 50, 0)}
                eventId={bets[0]?.eventId}
                selection={bets[0]?.selection}
                odds={bets[0]?.odds}
                onBetPlaced={(amount, transactionHash) => {
                  console.log('Pawn Coin bet placed:', { amount, transactionHash });
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="fiat" className="mt-4">
            <div className="space-y-4">
              {/* Traditional Bet Slip Content */}
              <div className="space-y-3">
                {bets.map((bet) => (
                  <div key={bet.id} className="p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{bet.selection}</p>
                        <p className="text-slate-400 text-xs">{(bet as any).gameInfo || `${bet.betType} Bet`}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                            {bet.odds > 0 ? `+${bet.odds}` : bet.odds}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">{bet.betType}</Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveBet(bet.id)}
                        className="text-slate-400 hover:text-red-400 p-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-orange-950/30 border border-orange-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-orange-400" />
                  <span className="text-orange-300 text-sm">
                    Traditional betting with USD coming soon
                  </span>
                </div>
                <p className="text-orange-400/80 text-xs mt-1">
                  For now, use crypto betting for the complete experience
                </p>
              </div>

              <Button
                onClick={() => setPaymentMethod('crypto')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Switch to Crypto Betting
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}