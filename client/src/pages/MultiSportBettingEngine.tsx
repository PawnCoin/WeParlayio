import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  Football, 
  Basketball,
  Baseball,
  Trophy,
  Target,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Gamepad2
} from 'lucide-react';

interface BetType {
  id: string;
  name: string;
  description: string;
  markets: string[];
}

interface SportConfig {
  key: string;
  name: string;
  icon: React.ReactNode;
  betTypes: BetType[];
  seasons: string[];
}

export default function MultiSportBettingEngine() {
  const [selectedSport, setSelectedSport] = useState('americanfootball_nfl');
  const [selectedBetType, setSelectedBetType] = useState('moneyline');
  const [filterBy, setFilterBy] = useState('all');

  const sportsConfig: SportConfig[] = [
    {
      key: 'americanfootball_nfl',
      name: 'NFL',
      icon: <Football className="h-5 w-5" />,
      betTypes: [
        {
          id: 'moneyline',
          name: 'Moneyline',
          description: 'Bet on which team will win the game',
          markets: ['h2h']
        },
        {
          id: 'spread',
          name: 'Point Spread',
          description: 'Bet on the margin of victory',
          markets: ['spreads']
        },
        {
          id: 'totals',
          name: 'Over/Under',
          description: 'Bet on total points scored',
          markets: ['totals']
        },
        {
          id: 'props',
          name: 'Player Props',
          description: 'Individual player performance bets',
          markets: ['player_props']
        }
      ],
      seasons: ['Regular Season', 'Playoffs', 'Super Bowl']
    },
    {
      key: 'basketball_nba',
      name: 'NBA',
      icon: <Basketball className="h-5 w-5" />,
      betTypes: [
        {
          id: 'moneyline',
          name: 'Moneyline',
          description: 'Bet on which team will win',
          markets: ['h2h']
        },
        {
          id: 'spread',
          name: 'Point Spread',
          description: 'Bet on the margin of victory',
          markets: ['spreads']
        },
        {
          id: 'totals',
          name: 'Over/Under',
          description: 'Bet on total points scored',
          markets: ['totals']
        },
        {
          id: 'quarters',
          name: 'Quarter Betting',
          description: 'Bet on individual quarters',
          markets: ['quarters']
        }
      ],
      seasons: ['Regular Season', 'Playoffs', 'Finals']
    },
    {
      key: 'baseball_mlb',
      name: 'MLB',
      icon: <Baseball className="h-5 w-5" />,
      betTypes: [
        {
          id: 'moneyline',
          name: 'Moneyline',
          description: 'Bet on which team will win',
          markets: ['h2h']
        },
        {
          id: 'runline',
          name: 'Run Line',
          description: 'Baseball spread betting',
          markets: ['spreads']
        },
        {
          id: 'totals',
          name: 'Over/Under',
          description: 'Bet on total runs scored',
          markets: ['totals']
        },
        {
          id: 'innings',
          name: 'Inning Betting',
          description: 'Bet on specific innings',
          markets: ['innings']
        }
      ],
      seasons: ['Regular Season', 'Playoffs', 'World Series']
    },
    {
      key: 'icehockey_nhl',
      name: 'NHL',
      icon: <Trophy className="h-5 w-5" />,
      betTypes: [
        {
          id: 'moneyline',
          name: 'Moneyline',
          description: 'Bet on which team will win',
          markets: ['h2h']
        },
        {
          id: 'puckline',
          name: 'Puck Line',
          description: 'Hockey spread betting',
          markets: ['spreads']
        },
        {
          id: 'totals',
          name: 'Over/Under',
          description: 'Bet on total goals scored',
          markets: ['totals']
        },
        {
          id: 'periods',
          name: 'Period Betting',
          description: 'Bet on individual periods',
          markets: ['periods']
        }
      ],
      seasons: ['Regular Season', 'Playoffs', 'Stanley Cup']
    },
    {
      key: 'soccer_epl',
      name: 'Premier League',
      icon: <Target className="h-5 w-5" />,
      betTypes: [
        {
          id: 'fulltime',
          name: '1X2 (Full Time)',
          description: 'Home win, Draw, or Away win',
          markets: ['h2h']
        },
        {
          id: 'goals',
          name: 'Over/Under Goals',
          description: 'Bet on total goals scored',
          markets: ['totals']
        },
        {
          id: 'btts',
          name: 'Both Teams to Score',
          description: 'Both teams score at least one goal',
          markets: ['btts']
        },
        {
          id: 'handicap',
          name: 'Asian Handicap',
          description: 'Handicap betting with draws eliminated',
          markets: ['handicap']
        }
      ],
      seasons: ['2024-25 Season', 'Premier League']
    }
  ];

  // Get current sport configuration
  const currentSport = sportsConfig.find(sport => sport.key === selectedSport);
  
  // Fetch games for selected sport
  const { data: gamesData, isLoading } = useQuery({
    queryKey: ['/api/odds', selectedSport],
    refetchInterval: 15000,
  });

  // Fetch league standings
  const { data: standingsData } = useQuery({
    queryKey: ['/api/standings', selectedSport],
  });

  // Filter games based on selected criteria
  const filteredGames = gamesData?.filter((game: any) => {
    if (filterBy === 'live') return game.status === 'live';
    if (filterBy === 'today') {
      const today = new Date().toDateString();
      return new Date(game.commence_time).toDateString() === today;
    }
    return true;
  }) || [];

  const getBetTypeMarkets = (betTypeId: string) => {
    return currentSport?.betTypes.find(bt => bt.id === betTypeId)?.markets || [];
  };

  const formatGameTime = (commenceTime: string) => {
    const date = new Date(commenceTime);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 0) return 'LIVE';
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString();
  };

  const getSportIcon = (sportKey: string) => {
    const sport = sportsConfig.find(s => s.key === sportKey);
    return sport?.icon || <Gamepad2 className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading betting markets...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Multi-Sport Betting Engine</h1>
        <p className="text-gray-600">Professional betting across all major sports</p>
      </div>

      {/* Sport Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {sportsConfig.map((sport) => (
          <Button
            key={sport.key}
            variant={selectedSport === sport.key ? 'default' : 'outline'}
            className="flex items-center space-x-2 h-16"
            onClick={() => setSelectedSport(sport.key)}
          >
            {sport.icon}
            <span>{sport.name}</span>
          </Button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select value={selectedBetType} onValueChange={setSelectedBetType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currentSport?.betTypes.map((betType) => (
              <SelectItem key={betType.id} value={betType.id}>
                {betType.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Games</SelectItem>
            <SelectItem value="live">Live Games</SelectItem>
            <SelectItem value="today">Today's Games</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{filteredGames.length} Games</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Live Updates</span>
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="betting-board" className="space-y-6">
        <TabsList>
          <TabsTrigger value="betting-board">Betting Board</TabsTrigger>
          <TabsTrigger value="live-games">Live Games</TabsTrigger>
          <TabsTrigger value="standings">League Standings</TabsTrigger>
        </TabsList>

        <TabsContent value="betting-board" className="space-y-4">
          {/* Current Bet Type Info */}
          {currentSport && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  {getSportIcon(selectedSport)}
                  <div>
                    <h3 className="font-semibold">{currentSport.name} - {currentSport.betTypes.find(bt => bt.id === selectedBetType)?.name}</h3>
                    <p className="text-sm text-gray-600">
                      {currentSport.betTypes.find(bt => bt.id === selectedBetType)?.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Games List */}
          <div className="space-y-4">
            {filteredGames.length > 0 ? (
              filteredGames.map((game: any) => (
                <Card key={game.id} className="border-2 hover:border-blue-300 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {game.away_team} @ {game.home_team}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={game.status === 'live' ? 'destructive' : 'outline'}>
                          {formatGameTime(game.commence_time)}
                        </Badge>
                        {getSportIcon(selectedSport)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {game.bookmakers && game.bookmakers.length > 0 ? (
                      <div className="space-y-4">
                        {game.bookmakers.slice(0, 2).map((bookmaker: any) => {
                          const relevantMarkets = getBetTypeMarkets(selectedBetType);
                          const market = bookmaker.markets.find((m: any) => 
                            relevantMarkets.includes(m.key)
                          );
                          
                          if (!market) return null;

                          return (
                            <div key={bookmaker.key} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold">{bookmaker.title}</h4>
                                <Badge variant="secondary">{market.key.toUpperCase()}</Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {market.outcomes.map((outcome: any) => (
                                  <Button
                                    key={outcome.name}
                                    variant="outline"
                                    className="flex flex-col items-center p-4 h-auto hover:bg-green-50 hover:border-green-300"
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
                                      {outcome.price > 0 ? `+${outcome.price}` : outcome.price}
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
                        No betting markets available for this game
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <div className="text-gray-500">
                    No games available for the selected filters
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="live-games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span>Live Games</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredGames.filter((game: any) => game.status === 'live').length > 0 ? (
                <div className="space-y-4">
                  {filteredGames
                    .filter((game: any) => game.status === 'live')
                    .map((game: any) => (
                      <div key={game.id} className="flex items-center justify-between p-4 border rounded bg-red-50 border-red-200">
                        <div>
                          <h4 className="font-semibold">{game.away_team} @ {game.home_team}</h4>
                          <p className="text-sm text-gray-600">Live betting available</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="destructive">LIVE</Badge>
                          <Button size="sm">View Live Odds</Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No live games currently available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{currentSport?.name} Standings</CardTitle>
            </CardHeader>
            <CardContent>
              {standingsData ? (
                <div className="space-y-2">
                  {standingsData.map((team: any, index: number) => (
                    <div key={team.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-lg w-8">{index + 1}</span>
                        <span className="font-medium">{team.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {team.wins}-{team.losses}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Standings data not available for this sport
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Games</p>
                <p className="text-2xl font-bold">{filteredGames.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Live Games</p>
                <p className="text-2xl font-bold">
                  {filteredGames.filter((game: any) => game.status === 'live').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Bet Types</p>
                <p className="text-2xl font-bold">{currentSport?.betTypes.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Active Markets</p>
                <p className="text-2xl font-bold">
                  {filteredGames.reduce((acc: number, game: any) => {
                    return acc + (game.bookmakers?.length || 0);
                  }, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}