import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Bitcoin, Coins, TrendingUp, Target, Trophy, Users, Clock, CheckCircle } from 'lucide-react';
import { useBetting } from '@/contexts/BettingContext';
import EnhancedBettingEngine from '@/components/betting/EnhancedBettingEngine';
import { TeamMentionEnhancer } from '@/components/TeamMentionEnhancer';

interface BetType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  supportedCurrencies: string[];
  minOdds: number;
  maxOdds: number;
  examples: string[];
}

interface SportEvent {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  moneylineOdds: { home: number; away: number };
  spreadOdds: { home: number; away: number; spread: number };
  totalOdds: { over: number; under: number; total: number };
}

export default function MultiCurrencyBetting() {
  const { selectedCurrency, addBet } = useBetting();
  const [selectedBetType, setSelectedBetType] = useState<string>('all');

  // Fetch live events for betting
  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/events/multi-currency'],
    staleTime: 30 * 1000,
  });

  // All supported bet types with full currency support
  const betTypes: BetType[] = [
    {
      id: 'moneyline',
      name: 'Moneyline Bets',
      description: 'Bet on which team will win the game outright',
      icon: <Target className="h-5 w-5 text-green-500" />,
      supportedCurrencies: ['USD', 'WEPARLAY', 'BTC', 'ETH', 'SOL', 'USDC'],
      minOdds: -1000,
      maxOdds: 5000,
      examples: ['Lakers to beat Warriors', 'Chiefs to win vs Bills']
    },
    {
      id: 'spread',
      name: 'Point Spreads',
      description: 'Bet on the margin of victory with handicap lines',
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
      supportedCurrencies: ['USD', 'WEPARLAY', 'BTC', 'ETH', 'SOL', 'USDC'],
      minOdds: -150,
      maxOdds: 150,
      examples: ['Lakers -5.5 points', 'Chiefs +3 points']
    },
    {
      id: 'totals',
      name: 'Over/Under Totals',
      description: 'Bet on whether the total score will be over or under a set number',
      icon: <Trophy className="h-5 w-5 text-purple-500" />,
      supportedCurrencies: ['USD', 'WEPARLAY', 'BTC', 'ETH', 'SOL', 'USDC'],
      minOdds: -120,
      maxOdds: 120,
      examples: ['Over 225.5 points', 'Under 47.5 points']
    },
    {
      id: 'props',
      name: 'Player Props',
      description: 'Bet on individual player statistics and performances',
      icon: <Users className="h-5 w-5 text-orange-500" />,
      supportedCurrencies: ['USD', 'WEPARLAY', 'BTC', 'ETH', 'SOL', 'USDC'],
      minOdds: -200,
      maxOdds: 1000,
      examples: ['LeBron 25+ points', 'Mahomes 2+ TDs']
    },
    {
      id: 'parlays',
      name: 'Parlay Combinations',
      description: 'Combine multiple bets for higher payouts',
      icon: <Clock className="h-5 w-5 text-red-500" />,
      supportedCurrencies: ['USD', 'WEPARLAY', 'BTC', 'ETH', 'SOL', 'USDC'],
      minOdds: 200,
      maxOdds: 50000,
      examples: ['3-team parlay', '10-team mega parlay']
    },
    {
      id: 'live',
      name: 'Live In-Game Betting',
      description: 'Bet on games while they are in progress',
      icon: <CheckCircle className="h-5 w-5 text-cyan-500" />,
      supportedCurrencies: ['USD', 'WEPARLAY', 'BTC', 'ETH', 'SOL', 'USDC'],
      minOdds: -500,
      maxOdds: 2000,
      examples: ['Next team to score', 'Quarter winner']
    }
  ];

  const handleAddBet = (event: SportEvent, betType: string, selection: string, odds: number) => {
    const bet = {
      id: `${event.id}-${betType}-${selection}-${Date.now()}`,
      type: betType,
      eventName: `${event.homeTeam} vs ${event.awayTeam}`,
      selection: selection,
      opponent: betType === 'moneyline' ? (selection === event.homeTeam ? event.awayTeam : event.homeTeam) : '',
      odds: odds,
      timestamp: new Date().toISOString(),
      sport: event.sport
    };

    addBet(bet);
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'USD': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'WEPARLAY': return <Coins className="h-4 w-4 text-blue-500" />;
      case 'BTC': case 'ETH': case 'SOL': return <Bitcoin className="h-4 w-4 text-orange-500" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Multi-Currency Betting Platform</h1>
        <p className="text-xl text-muted-foreground">
          Bet with real money, crypto, or WeParlay Cash across ALL bet types
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {['USD', 'WEPARLAY', 'BTC', 'ETH', 'SOL', 'USDC'].map((currency) => (
            <Badge key={currency} variant="outline" className="flex items-center gap-1">
              {getCurrencyIcon(currency)}
              {currency}
            </Badge>
          ))}
        </div>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          All currency restrictions have been removed. You can now use any supported currency for any bet type throughout the platform.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="bet-types" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bet-types">Supported Bet Types</TabsTrigger>
          <TabsTrigger value="live-events">Live Events</TabsTrigger>
          <TabsTrigger value="betting-engine">Enhanced Betting</TabsTrigger>
        </TabsList>

        <TabsContent value="bet-types" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {betTypes.map((betType) => (
              <Card key={betType.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {betType.icon}
                    {betType.name}
                  </CardTitle>
                  <CardDescription>{betType.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Supported Currencies:</p>
                      <div className="flex flex-wrap gap-1">
                        {betType.supportedCurrencies.map((currency) => (
                          <Badge key={currency} variant="secondary" className="text-xs">
                            {currency}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Examples:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {betType.examples.map((example, index) => (
                          <li key={index}>• {example}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Min Odds:</span>
                        <div className="font-medium">{formatOdds(betType.minOdds)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Odds:</span>
                        <div className="font-medium">{formatOdds(betType.maxOdds)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live-events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Betting Events</CardTitle>
              <CardDescription>
                All events support betting with any currency - USD, WeParlay Cash, or Cryptocurrency
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading events...</div>
              ) : events?.length > 0 ? (
                <div className="space-y-4">
                  {events.slice(0, 5).map((event: SportEvent) => (
                    <Card key={event.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <TeamMentionEnhancer>
                              {`${event.homeTeam} vs ${event.awayTeam}`}
                            </TeamMentionEnhancer>
                            <p className="text-sm text-muted-foreground">
                              {event.sport} • {new Date(event.startTime).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="outline">{selectedCurrency}</Badge>
                        </div>

                        <Separator />

                        {/* Moneyline Bets */}
                        <div>
                          <p className="text-sm font-medium mb-2">Moneyline (All Currencies)</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddBet(event, 'moneyline', event.homeTeam, event.moneylineOdds.home)}
                            >
                              {event.homeTeam} {formatOdds(event.moneylineOdds.home)}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddBet(event, 'moneyline', event.awayTeam, event.moneylineOdds.away)}
                            >
                              {event.awayTeam} {formatOdds(event.moneylineOdds.away)}
                            </Button>
                          </div>
                        </div>

                        {/* Spread Bets */}
                        <div>
                          <p className="text-sm font-medium mb-2">Point Spread (All Currencies)</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddBet(event, 'spread', `${event.homeTeam} ${event.spreadOdds.spread}`, event.spreadOdds.home)}
                            >
                              {event.homeTeam} {event.spreadOdds.spread} {formatOdds(event.spreadOdds.home)}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddBet(event, 'spread', `${event.awayTeam} +${Math.abs(event.spreadOdds.spread)}`, event.spreadOdds.away)}
                            >
                              {event.awayTeam} +{Math.abs(event.spreadOdds.spread)} {formatOdds(event.spreadOdds.away)}
                            </Button>
                          </div>
                        </div>

                        {/* Totals */}
                        <div>
                          <p className="text-sm font-medium mb-2">Over/Under Total (All Currencies)</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddBet(event, 'total', `Over ${event.totalOdds.total}`, event.totalOdds.over)}
                            >
                              Over {event.totalOdds.total} {formatOdds(event.totalOdds.over)}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddBet(event, 'total', `Under ${event.totalOdds.total}`, event.totalOdds.under)}
                            >
                              Under {event.totalOdds.total} {formatOdds(event.totalOdds.under)}
                            </Button>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          ✓ Supports all currencies: USD, WeParlay Cash, BTC, ETH, SOL, USDC
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4" />
                  <p>No live events available</p>
                  <p className="text-sm">Check back soon for betting opportunities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="betting-engine" className="space-y-6">
          <EnhancedBettingEngine />
        </TabsContent>
      </Tabs>

      {/* Feature Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Currency Platform Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">All bet types support all currencies</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Real-time currency conversion</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Instant crypto transactions</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Secure USD payment processing</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">WeParlay Cash for practice</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Cross-currency portfolio tracking</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}