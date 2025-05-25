import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  Trophy, TrendingUp, Target, Search, Zap, Clock, 
  DollarSign, Users, Globe, Flame, Star, Activity,
  Football, Basketball, BaseballIcon as Baseball, 
  Swords, Crown, Gamepad2
} from "lucide-react";

export default function UnifiedSports() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');

  // Fetch unified sports API status
  const { data: apiStatus } = useQuery({
    queryKey: ['/api/unified-sports/status'],
    refetchInterval: 30000
  });

  // Fetch live games across all sports
  const { data: liveGames } = useQuery({
    queryKey: ['/api/unified-sports/live'],
    refetchInterval: 15000
  });

  // Fetch upcoming games
  const { data: upcomingGames } = useQuery({
    queryKey: ['/api/unified-sports/upcoming/24'],
    refetchInterval: 60000
  });

  // Fetch popular betting markets
  const { data: popularMarkets } = useQuery({
    queryKey: ['/api/unified-sports/markets/popular'],
    refetchInterval: 30000
  });

  // Fetch American sports
  const { data: americanSports } = useQuery({
    queryKey: ['/api/unified-sports/sports/american'],
    refetchInterval: 300000 // 5 minutes
  });

  // Fetch international sports
  const { data: internationalSports } = useQuery({
    queryKey: ['/api/unified-sports/sports/international'],
    refetchInterval: 300000
  });

  // Fetch combat sports
  const { data: combatSports } = useQuery({
    queryKey: ['/api/unified-sports/sports/combat'],
    refetchInterval: 300000
  });

  const getSportIcon = (sport: string) => {
    const sportLower = sport.toLowerCase();
    if (sportLower.includes('football') || sportLower.includes('nfl')) return <Football className="h-5 w-5" />;
    if (sportLower.includes('basketball') || sportLower.includes('nba')) return <Basketball className="h-5 w-5" />;
    if (sportLower.includes('baseball') || sportLower.includes('mlb')) return <Baseball className="h-5 w-5" />;
    if (sportLower.includes('soccer') || sportLower.includes('epl')) return <Globe className="h-5 w-5" />;
    if (sportLower.includes('tennis')) return <Trophy className="h-5 w-5" />;
    if (sportLower.includes('mma') || sportLower.includes('boxing')) return <Swords className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  const formatOdds = (odds: number) => {
    if (odds > 0) return `+${odds}`;
    return odds.toString();
  };

  const placeBet = (gameEvent: string, betType: string, odds: number) => {
    toast({
      title: "Bet Placed Successfully!",
      description: `${betType} on ${gameEvent} at ${formatOdds(odds)}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🌟 Unified Sports Betting Hub
            </h1>
            <p className="text-muted-foreground mt-2">
              Every sport, every league, best odds from multiple sources
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams, sports, events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Live Betting
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming Games
            </TabsTrigger>
            <TabsTrigger value="american" className="flex items-center gap-2">
              <Football className="h-4 w-4" />
              American Sports
            </TabsTrigger>
            <TabsTrigger value="international" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              International
            </TabsTrigger>
            <TabsTrigger value="combat" className="flex items-center gap-2">
              <Swords className="h-4 w-4" />
              Combat Sports
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              API Status
            </TabsTrigger>
          </TabsList>

          {/* Live Betting Tab */}
          <TabsContent value="live" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Live Games */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-red-500" />
                    Live Games - Bet Now
                  </CardTitle>
                  <CardDescription>Real-time betting on active games</CardDescription>
                </CardHeader>
                <CardContent>
                  {liveGames && liveGames.length > 0 ? (
                    <div className="space-y-4">
                      {liveGames.slice(0, 6).map((game: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-orange-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-red-600 border-red-200 animate-pulse">
                                🔴 LIVE
                              </Badge>
                              {getSportIcon(game.sport)}
                              <span className="font-semibold">{game.event}</span>
                            </div>
                            <Badge variant="secondary">{game.sport}</Badge>
                          </div>
                          
                          {game.odds && game.odds.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {game.odds[0].moneyline?.map((odd: number, i: number) => (
                                <Button
                                  key={i}
                                  size="sm"
                                  variant="outline"
                                  className="hover:bg-green-50 hover:border-green-200"
                                  onClick={() => placeBet(game.event, `${game.teams[i]} Win`, odd)}
                                >
                                  <span className="text-xs">{game.teams[i]}</span>
                                  <span className="font-bold ml-1">{formatOdds(odd)}</span>
                                </Button>
                              ))}
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                                onClick={() => placeBet(game.event, "Live Bet", 0)}
                              >
                                <Target className="h-3 w-3 mr-1" />
                                More Bets
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Flame className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No Live Games</p>
                      <p>Check back soon for live betting action!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Popular Markets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Popular Markets
                  </CardTitle>
                  <CardDescription>Trending bets right now</CardDescription>
                </CardHeader>
                <CardContent>
                  {popularMarkets && popularMarkets.length > 0 ? (
                    <div className="space-y-3">
                      {popularMarkets.slice(0, 5).map((market: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getSportIcon(market.sport)}
                              <span className="font-medium text-sm">{market.event}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {market.sport}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {new Date(market.startTime).toLocaleDateString()} {new Date(market.startTime).toLocaleTimeString()}
                          </div>
                          <Button size="sm" className="w-full" variant="outline">
                            <DollarSign className="h-3 w-3 mr-1" />
                            View Odds
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Loading popular markets...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Upcoming Games Tab */}
          <TabsContent value="upcoming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Upcoming Games - Next 24 Hours
                </CardTitle>
                <CardDescription>Place your bets before the action starts</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingGames && upcomingGames.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingGames.slice(0, 9).map((game: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-3">
                          {getSportIcon(game.sport)}
                          <Badge variant="secondary">{game.sport}</Badge>
                        </div>
                        
                        <h4 className="font-semibold mb-2">{game.event}</h4>
                        
                        <div className="text-sm text-muted-foreground mb-3">
                          📅 {new Date(game.startTime).toLocaleDateString()}
                          <br />
                          ⏰ {new Date(game.startTime).toLocaleTimeString()}
                        </div>

                        {game.odds && game.odds.length > 0 && game.odds[0].moneyline && (
                          <div className="space-y-2">
                            {game.teams.map((team: string, i: number) => (
                              <Button
                                key={i}
                                size="sm"
                                variant="outline"
                                className="w-full justify-between hover:bg-blue-50"
                                onClick={() => placeBet(game.event, `${team} Win`, game.odds[0].moneyline[i])}
                              >
                                <span>{team}</span>
                                <span className="font-bold">{formatOdds(game.odds[0].moneyline[i])}</span>
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        <Button size="sm" className="w-full mt-2" variant="default">
                          <Target className="h-3 w-3 mr-1" />
                          More Markets
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Loading Upcoming Games</p>
                    <p>Fetching the latest odds from multiple sources...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* American Sports Tab */}
          <TabsContent value="american" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {americanSports && americanSports.map((sportData: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getSportIcon(sportData.sport)}
                      {sportData.sport.toUpperCase()}
                    </CardTitle>
                    <CardDescription>{sportData.games?.length || 0} games available</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sportData.games && sportData.games.length > 0 ? (
                      <div className="space-y-3">
                        {sportData.games.slice(0, 3).map((game: any, gameIndex: number) => (
                          <div key={gameIndex} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{game.event}</span>
                              {game.live && <Badge variant="destructive">LIVE</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {new Date(game.startTime).toLocaleDateString()}
                            </div>
                            <Button size="sm" className="w-full">
                              <DollarSign className="h-3 w-3 mr-1" />
                              View Odds
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Loading {sportData.sport} games...
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* International Sports Tab */}
          <TabsContent value="international" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {internationalSports && internationalSports.map((sportData: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getSportIcon(sportData.sport)}
                      {sportData.sport.replace('_', ' ').toUpperCase()}
                    </CardTitle>
                    <CardDescription>{sportData.games?.length || 0} games available</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sportData.games && sportData.games.length > 0 ? (
                      <div className="space-y-3">
                        {sportData.games.slice(0, 3).map((game: any, gameIndex: number) => (
                          <div key={gameIndex} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{game.event}</span>
                              {game.live && <Badge variant="destructive">LIVE</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {new Date(game.startTime).toLocaleDateString()}
                            </div>
                            <Button size="sm" className="w-full">
                              <Globe className="h-3 w-3 mr-1" />
                              View International Odds
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Loading {sportData.sport} games...
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Combat Sports Tab */}
          <TabsContent value="combat" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {combatSports && combatSports.map((sportData: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Swords className="h-5 w-5 text-red-500" />
                      {sportData.sport.replace('_', ' ').toUpperCase()}
                    </CardTitle>
                    <CardDescription>{sportData.games?.length || 0} fights available</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sportData.games && sportData.games.length > 0 ? (
                      <div className="space-y-3">
                        {sportData.games.slice(0, 3).map((fight: any, fightIndex: number) => (
                          <div key={fightIndex} className="p-3 border rounded-lg bg-gradient-to-r from-red-50 to-orange-50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{fight.event}</span>
                              {fight.live && <Badge variant="destructive">LIVE</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {new Date(fight.startTime).toLocaleDateString()}
                            </div>
                            <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                              <Swords className="h-3 w-3 mr-1" />
                              Fight Odds
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Loading {sportData.sport} fights...
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* API Status Tab */}
          <TabsContent value="status" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  Unified Sports API Status
                </CardTitle>
                <CardDescription>Real-time status of all connected sports data sources</CardDescription>
              </CardHeader>
              <CardContent>
                {apiStatus ? (
                  <div className="space-y-6">
                    
                    {/* API Sources */}
                    <div>
                      <h4 className="font-medium mb-3">Connected Data Sources</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {apiStatus.sources?.map((source: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{source.name}</span>
                              <Badge variant={source.available ? "default" : "secondary"}>
                                {source.available ? "🟢 Active" : "🔴 Inactive"}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p>Sports: {source.sports}</p>
                              <p>Rate Limit: {source.rateLimit}ms</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* System Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{apiStatus.total_sports_covered}</div>
                        <div className="text-sm text-muted-foreground">Sports Covered</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{apiStatus.cache_size}</div>
                        <div className="text-sm text-muted-foreground">Cached Requests</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">{apiStatus.sources?.length}</div>
                        <div className="text-sm text-muted-foreground">Data Sources</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Loading API status...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}