import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Bitcoin, Coins, TrendingUp, Shield, Clock, CheckCircle, AlertTriangle, Calculator } from 'lucide-react';
import { useBetting } from '@/contexts/BettingContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import UniversalCurrencySelector from './UniversalCurrencySelector';

interface BetCalculation {
  stake: number;
  potentialWin: number;
  netProfit: number;
  fees: number;
  totalPayout: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface BetValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiresConfirmation: boolean;
}

export default function EnhancedBettingEngine() {
  const { betItems, selectedCurrency, clearBets } = useBetting();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [stake, setStake] = useState('');
  const [calculation, setCalculation] = useState<BetCalculation | null>(null);
  const [validation, setValidation] = useState<BetValidation | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Fetch user balances for validation
  const { data: balances } = useQuery({
    queryKey: ['/api/user/balances'],
    enabled: isAuthenticated,
  });

  // Fetch betting limits for selected currency
  const { data: bettingLimits } = useQuery({
    queryKey: ['/api/betting/limits', selectedCurrency],
    enabled: !!selectedCurrency,
  });

  // Enhanced bet placement with multi-currency support
  const placeBetMutation = useMutation({
    mutationFn: async (betData: any) => {
      setProcessingStep('Validating bet details...');
      await new Promise(resolve => setTimeout(resolve, 500));

      setProcessingStep('Processing payment...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setProcessingStep('Confirming bet placement...');
      const response = await apiRequest('POST', '/api/bets/place', betData);
      
      setProcessingStep('Bet placed successfully!');
      return response;
    },
    onSuccess: (data) => {
      clearBets();
      setStake('');
      setCalculation(null);
      setValidation(null);
      
      queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bets/history'] });
      
      toast({
        title: 'Bet Placed Successfully!',
        description: `Your ${selectedCurrency} bet has been confirmed`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Bet Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setProcessingStep('');
    }
  });

  // Calculate bet returns and fees
  const calculateBet = (stakeAmount: number, currency: string) => {
    if (!betItems.length || !stakeAmount) return null;

    // Calculate combined odds (parlay if multiple bets)
    const totalOdds = betItems.reduce((acc, item) => {
      const decimalOdds = item.odds > 0 
        ? (item.odds / 100) + 1 
        : (100 / Math.abs(item.odds)) + 1;
      return acc * decimalOdds;
    }, 1);

    // Currency-specific fee structure
    const feeRates = {
      'WEPARLAY': 0,
      'USD': 2.5,
      'BTC': 1.0,
      'ETH': 1.5,
      'SOL': 0.5,
      'USDC': 0.8
    };

    const feeRate = feeRates[currency as keyof typeof feeRates] || 2.5;
    const fees = (stakeAmount * feeRate) / 100;
    const potentialWin = stakeAmount * totalOdds;
    const netProfit = potentialWin - stakeAmount - fees;
    const totalPayout = potentialWin - fees;

    // Risk assessment
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (totalOdds > 5) riskLevel = 'medium';
    if (totalOdds > 20 || betItems.length > 5) riskLevel = 'high';

    return {
      stake: stakeAmount,
      potentialWin,
      netProfit,
      fees,
      totalPayout,
      riskLevel
    };
  };

  // Validate bet before placement
  const validateBet = (stakeAmount: number, currency: string): BetValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let requiresConfirmation = false;

    // Basic validation
    if (!betItems.length) {
      errors.push('No bets selected');
    }

    if (!stakeAmount || stakeAmount <= 0) {
      errors.push('Invalid stake amount');
    }

    // Currency-specific validation
    const userBalance = balances?.find((b: any) => b.currency === currency);
    if (userBalance && stakeAmount > userBalance.available) {
      errors.push('Insufficient balance');
    }

    // Betting limits validation
    if (bettingLimits) {
      if (stakeAmount < bettingLimits.minBet) {
        errors.push(`Minimum bet is ${bettingLimits.minBet} ${currency}`);
      }
      if (stakeAmount > bettingLimits.maxBet) {
        errors.push(`Maximum bet is ${bettingLimits.maxBet} ${currency}`);
      }
    }

    // Risk warnings
    if (calculation?.riskLevel === 'high') {
      warnings.push('This is a high-risk bet with low probability of success');
      requiresConfirmation = true;
    }

    if (betItems.length > 10) {
      warnings.push('Large parlays have very low probability of success');
      requiresConfirmation = true;
    }

    if (currency === 'USD' && stakeAmount > 1000) {
      warnings.push('Large real money bet - please confirm');
      requiresConfirmation = true;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      requiresConfirmation
    };
  };

  // Update calculations when stake or currency changes
  useEffect(() => {
    const stakeAmount = parseFloat(stake);
    if (stakeAmount && selectedCurrency) {
      const calc = calculateBet(stakeAmount, selectedCurrency);
      const valid = validateBet(stakeAmount, selectedCurrency);
      setCalculation(calc);
      setValidation(valid);
    } else {
      setCalculation(null);
      setValidation(null);
    }
  }, [stake, selectedCurrency, betItems, balances, bettingLimits]);

  const handlePlaceBet = () => {
    if (!calculation || !validation?.isValid) return;

    const betData = {
      bets: betItems,
      stake: parseFloat(stake),
      currency: selectedCurrency,
      totalOdds: calculation.potentialWin / calculation.stake,
      potentialPayout: calculation.totalPayout,
      betType: betItems.length > 1 ? 'parlay' : 'single',
      userId: user?.id
    };

    placeBetMutation.mutate(betData);
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD' || currency === 'USDC') {
      return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === 'WEPARLAY') {
      return `${amount.toLocaleString()} WP`;
    }
    return `${amount.toFixed(currency === 'BTC' ? 8 : 4)} ${currency}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Login Required</h3>
          <p className="text-muted-foreground">Please log in to place bets with any currency</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Universal Currency Selector */}
      <UniversalCurrencySelector />

      {/* Betting Slip */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Enhanced Betting Slip
          </CardTitle>
          <CardDescription>
            Place bets with any currency across all bet types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {betItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <p>Add bets to your slip to get started</p>
              <p className="text-sm">All bet types support multi-currency betting</p>
            </div>
          ) : (
            <>
              {/* Bet Items Display */}
              <div className="space-y-2">
                {betItems.map((bet, index) => (
                  <Card key={bet.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{bet.eventName}</p>
                        <p className="text-xs text-muted-foreground">
                          {bet.selection} • {bet.type}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {bet.odds > 0 ? `+${bet.odds}` : bet.odds}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>

              <Separator />

              {/* Stake Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Stake Amount ({selectedCurrency})
                </label>
                <Input
                  type="number"
                  placeholder={`Enter amount in ${selectedCurrency}`}
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  className={validation && !validation.isValid ? 'border-red-500' : ''}
                />
              </div>

              {/* Validation Errors */}
              {validation && validation.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Validation Warnings */}
              {validation && validation.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Bet Calculation */}
              {calculation && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Stake</span>
                        <span className="font-medium">
                          {formatCurrency(calculation.stake, selectedCurrency)}
                        </span>
                      </div>
                      
                      {calculation.fees > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Fees</span>
                          <span className="text-sm">
                            {formatCurrency(calculation.fees, selectedCurrency)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Potential Win</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(calculation.potentialWin, selectedCurrency)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Net Profit</span>
                        <span className="font-medium">
                          {formatCurrency(calculation.netProfit, selectedCurrency)}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total Payout</span>
                        <span className="font-bold text-lg">
                          {formatCurrency(calculation.totalPayout, selectedCurrency)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Risk Level</span>
                        <Badge 
                          variant={calculation.riskLevel === 'low' ? 'default' : 
                                  calculation.riskLevel === 'medium' ? 'secondary' : 'destructive'}
                        >
                          {calculation.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Processing Status */}
              {placeBetMutation.isPending && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin">
                        <Clock className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{processingStep}</span>
                    </div>
                    <Progress value={33} className="mt-2" />
                  </CardContent>
                </Card>
              )}

              {/* Place Bet Button */}
              <Button
                onClick={handlePlaceBet}
                disabled={!validation?.isValid || placeBetMutation.isPending}
                className="w-full"
                size="lg"
              >
                {placeBetMutation.isPending ? (
                  'Processing...'
                ) : validation?.requiresConfirmation ? (
                  'Confirm & Place Bet'
                ) : (
                  `Place Bet - ${formatCurrency(calculation?.stake || 0, selectedCurrency)}`
                )}
              </Button>

              {/* Currency-Specific Info */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>✓ All bet types supported with {selectedCurrency}</p>
                <p>✓ {selectedCurrency === 'WEPARLAY' ? 'Instant processing' : 
                      selectedCurrency === 'USD' ? 'Secure payment processing' :
                      'Blockchain-secured transactions'}</p>
                {calculation?.fees === 0 && (
                  <p>✓ No fees for {selectedCurrency} betting</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}