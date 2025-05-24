import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Target,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveBet {
  id: string;
  eventName: string;
  selection: string;
  amount: number;
  odds: number;
  potentialPayout: number;
  status: 'live' | 'won' | 'lost' | 'pending';
  currentScore?: {
    home: number;
    away: number;
  };
  timeRemaining?: string;
  winProbability?: number;
  cashoutValue?: number;
}

const LiveBetTracker: React.FC = () => {
  const { user } = useAuth();
  const [animatingBets, setAnimatingBets] = useState<Set<string>>(new Set());

  const { data: liveBets, isLoading } = useQuery({
    queryKey: ['/api/bets/live'],
    refetchInterval: 5000, // Update every 5 seconds
    enabled: !!user
  });

  const handleCashout = async (betId: string) => {
    setAnimatingBets(prev => new Set([...prev, betId]));
    
    try {
      // Implement cashout logic
      console.log('Cashing out bet:', betId);
      
      // Remove animation after completion
      setTimeout(() => {
        setAnimatingBets(prev => {
          const newSet = new Set(prev);
          newSet.delete(betId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Cashout failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'lost':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'live':
        return <Zap className="h-5 w-5 text-yellow-500 animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'bg-green-500';
      case 'lost': return 'bg-red-500';
      case 'live': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Live Bet Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!liveBets || liveBets.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Live Bet Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active bets to track</p>
            <p className="text-sm">Place a bet to see live tracking here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Live Bet Tracker
          <Badge variant="secondary">{liveBets.length} Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence>
            {liveBets.map((bet: LiveBet) => (
              <motion.div
                key={bet.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: animatingBets.has(bet.id) ? 1.02 : 1
                }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Card className={`border-l-4 ${getStatusColor(bet.status)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(bet.status)}
                          <h4 className="font-semibold">{bet.eventName}</h4>
                          <Badge variant="outline">{bet.selection}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Bet Amount</p>
                            <p className="font-medium flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {bet.amount}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Potential Payout</p>
                            <p className="font-medium text-green-600 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {bet.potentialPayout}
                            </p>
                          </div>
                        </div>

                        {bet.status === 'live' && (
                          <div className="mt-3 space-y-2">
                            {bet.currentScore && (
                              <div className="flex items-center gap-4 text-sm">
                                <span>Score: {bet.currentScore.home} - {bet.currentScore.away}</span>
                                {bet.timeRemaining && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {bet.timeRemaining}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {bet.winProbability && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>Win Probability</span>
                                  <span className="font-medium">{bet.winProbability}%</span>
                                </div>
                                <Progress value={bet.winProbability} className="h-2" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {bet.status === 'live' && bet.cashoutValue && (
                        <div className="ml-4 text-right">
                          <p className="text-sm text-muted-foreground mb-1">Cashout</p>
                          <p className="font-semibold text-orange-600 mb-2">
                            ${bet.cashoutValue}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCashout(bet.id)}
                            disabled={animatingBets.has(bet.id)}
                            className="text-orange-600 border-orange-600 hover:bg-orange-50"
                          >
                            {animatingBets.has(bet.id) ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <AlertCircle className="h-4 w-4" />
                              </motion.div>
                            ) : (
                              'Cashout'
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Animated status change overlay */}
                <AnimatePresence>
                  {animatingBets.has(bet.id) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-orange-500/10 rounded-lg border-2 border-orange-500 flex items-center justify-center"
                    >
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1.1 }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Processing Cashout...
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveBetTracker;