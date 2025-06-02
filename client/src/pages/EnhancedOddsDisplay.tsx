import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Star
} from 'lucide-react';

interface OddsData {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number;
        point?: number;
      }>;
    }>;
  }>;
  line_movement?: {
    direction: 'up' | 'down' | 'stable';
    previous_price: number;
    change_amount: number;
  };
}

export default function EnhancedOddsDisplay() {
  const [selectedSport, setSelectedSport] = useState('americanfootball_nfl');
  const [selectedMarket, setSelectedMarket] = useState('h2h');
  const [viewMode, setViewMode] = useState('american');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch live odds data from your premium feeds
  const { data: oddsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/odds', selectedSport],
    refetchInterval: autoRefresh ? 10000 : false, // Auto-refresh every 10 seconds
  });

  // Fetch line movement data
  const { data: lineMovement } = useQuery({
    queryKey: ['/api/line-movement', selectedSport],
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const sportOptions = [
    { value: 'americanfootball_nfl', label: 'NFL' },
    { value: 'basketball_nba', label: 'NBA' },
    { value: 'baseball_mlb', label: 'MLB' },
    { value: 'icehockey_nhl', label: 'NHL' },
    { value: 'soccer_epl', label: 'Premier League' },
    { value: 'soccer_uefa_champs_league', label: 'Champions League' }
  ];

  const marketOptions = [
    { value: 'h2h', label: 'Moneyline' },
    { value: 'spreads', label: 'Point Spread' },
    { value: 'totals', label: 'Over/Under' }
  ];

  const convertOdds = (americanOdds: number, format: string) => {
    switch (format) {
      case 'decimal':
        return americanOdds > 0 
          ? (americanOdds / 100 + 1).toFixed(2)
          : (100 / Math.abs(americanOdds) + 1).toFixed(2);
      case 'fractional':
        if (americanOdds > 0) {
          return `${americanOdds}/100`;
        } else {
          return `100/${Math.abs(americanOdds)}`;
        }
      default:
        return americanOdds > 0 ? `+${americanOdds}` : americanOdds.toString();
    }
  };

  const getLineMovementIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'down': return <ArrowDown className="h-3 w-3 text-red-500" />;
      default: return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getBestOdds = (outcomes: any[]) => {
    return outcomes.reduce((best, current) => {
      return !best || current.price > best.price ? current : best;
    }, null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading live odds...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Live Odds Center</h1>
        <p className="text-gray-600">Real-time odds with line movement tracking</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Select value={selectedSport} onValueChange={setSelectedSport}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sportOptions.map((sport) => (
              <SelectItem key={sport.value} value={sport.value}>
                {sport.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMarket} onValueChange={setSelectedMarket}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {marketOptions.map((market) => (
              <SelectItem key={market.value} value={market.value}>
                {market.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={viewMode} onValueChange={setViewMode}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="american">American (-110)</SelectItem>
            <SelectItem value="decimal">Decimal (1.91)</SelectItem>
            <SelectItem value="fractional">Fractional (10/11)</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          onClick={() => refetch()}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Auto-refresh toggle */}
      <div className="flex items-center space-x-2 mb-6">
        <input
          type="checkbox"
          id="autoRefresh"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="autoRefresh" className="text-sm">
          Auto-refresh odds (10s intervals)
        </label>
        {autoRefresh && (
          <Badge variant="outline" className="text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            LIVE
          </Badge>
        )}
      </div>

      <Tabs defaultValue="odds-board" className="space-y-6">
        <TabsList>
          <TabsTrigger value="odds-board">Odds Board</TabsTrigger>
          <TabsTrigger value="line-movement">Line Movement</TabsTrigger>
          <TabsTrigger value="best-odds">Best Odds</TabsTrigger>
        </TabsList>

        <TabsContent value="odds-board" className="space-y-4">
          {oddsData && oddsData.length > 0 ? (
            <div className="space-y-4">
              {oddsData.map((game: OddsData) => (
                <Card key={game.id} className="border-2 hover:border-blue-300 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {game.away_team} @ {game.home_team}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(game.commence_time).toLocaleDateString()}
                        </Badge>
                        {game.line_movement && (
                          <Badge variant="outline" className="flex items-center">
                            {getLineMovementIcon(game.line_movement.direction)}
                            <span className="ml-1">
                              {game.line_movement.change_amount > 0 ? '+' : ''}
                              {game.line_movement.change_amount}
                            </span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {game.bookmakers && game.bookmakers.length > 0 ? (
                      <div className="space-y-4">
                        {game.bookmakers.slice(0, 3).map((bookmaker) => {
                          const market = bookmaker.markets.find(m => m.key === selectedMarket);
                          if (!market) return null;

                          return (
                            <div key={bookmaker.key} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold">{bookmaker.title}</h4>
                                <Badge variant="secondary">{selectedMarket.toUpperCase()}</Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {market.outcomes.map((outcome) => (
                                  <Button
                                    key={outcome.name}
                                    variant="outline"
                                    className="flex flex-col items-center p-4 h-auto hover:bg-blue-50"
                                  >
                                    <span className="font-medium text-sm mb-1">
                                      {outcome.name}
                                    </span>
                                    {outcome.point && (
                                      <span className="text-xs text-gray-600 mb-1">
                                        {outcome.point > 0 ? '+' : ''}{outcome.point}
                                      </span>
                                    )}
                                    <span className="font-bold text-lg">
                                      {convertOdds(outcome.price, viewMode)}
                                    </span>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No odds available for this game
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="text-gray-500">
                  No games available for {sportOptions.find(s => s.value === selectedSport)?.label}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="line-movement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Line Movement</CardTitle>
            </CardHeader>
            <CardContent>
              {lineMovement && lineMovement.length > 0 ? (
                <div className="space-y-4">
                  {lineMovement.map((movement: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <span className="font-medium">{movement.game}</span>
                        <div className="text-sm text-gray-600">{movement.market}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getLineMovementIcon(movement.direction)}
                        <span className={`font-bold ${
                          movement.direction === 'up' ? 'text-green-600' : 
                          movement.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {movement.from} → {movement.to}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {movement.timestamp}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent line movement data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="best-odds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Best Available Odds</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {oddsData && oddsData.length > 0 ? (
                <div className="space-y-4">
                  {oddsData.slice(0, 5).map((game: OddsData) => {
                    const allOutcomes: any[] = [];
                    game.bookmakers?.forEach(bookmaker => {
                      const market = bookmaker.markets.find(m => m.key === selectedMarket);
                      if (market) {
                        market.outcomes.forEach(outcome => {
                          allOutcomes.push({
                            ...outcome,
                            bookmaker: bookmaker.title
                          });
                        });
                      }
                    });

                    // Group by outcome name and find best odds
                    const bestOddsByOutcome = allOutcomes.reduce((acc, outcome) => {
                      if (!acc[outcome.name] || outcome.price > acc[outcome.name].price) {
                        acc[outcome.name] = outcome;
                      }
                      return acc;
                    }, {});

                    return (
                      <div key={game.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">
                          {game.away_team} @ {game.home_team}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {Object.values(bestOddsByOutcome).map((outcome: any) => (
                            <div key={outcome.name} className="text-center p-3 bg-green-50 rounded border-2 border-green-200">
                              <div className="font-medium">{outcome.name}</div>
                              {outcome.point && (
                                <div className="text-sm text-gray-600">
                                  {outcome.point > 0 ? '+' : ''}{outcome.point}
                                </div>
                              )}
                              <div className="font-bold text-lg text-green-600">
                                {convertOdds(outcome.price, viewMode)}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Best at {outcome.bookmaker}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No odds comparison available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}