import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBetSlip } from '@/contexts/BetSlipContext';
import { Play, Clock, TrendingUp, Zap } from 'lucide-react';

const LiveBettingEnhanced: React.FC = () => {
  const { addBet } = useBetSlip();
  const [selectedSport, setSelectedSport] = useState<string>('all');

  // Fetch live events
  const { data: liveEvents, isLoading } = useQuery({
    queryKey: ['/api/events/live'],
    refetchInterval: 5000, // Update every 5 seconds for live data
  });

  // Fetch sports for filtering
  const { data: sports } = useQuery({
    queryKey: ['/api/sports'],
  });

  const handleBet = (event: any, type: string, selection: string, odds: number) => {
    addBet({
      id: `${event.id}-${type}-${selection}`,
      eventId: event.id,
      gameTitle: `${event.awayTeam || 'Away'} vs ${event.homeTeam || 'Home'}`,
      betType: type,
      selection,
      odds,
      amount: 0,
      potential: 0,
      sport: event.sport_title || 'Live Event',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading live events...</p>
        </div>
      </div>
    );
  }

  const filteredEvents = Array.isArray(liveEvents) ? liveEvents.filter((event: any) => 
    selectedSport === 'all' || event.sport_key === selectedSport
  ) : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <h1 className="text-3xl font-bold">Live Betting</h1>
        </div>
        <Badge variant="secondary" className="animate-pulse">
          {filteredEvents.length} Live Games
        </Badge>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Live Now
          </TabsTrigger>
          <TabsTrigger value="in-play" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            In-Play
          </TabsTrigger>
          <TabsTrigger value="quick-bets" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Quick Bets
          </TabsTrigger>
          <TabsTrigger value="props" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Live Props
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event: any, index: number) => (
                <Card key={event.id || index} className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {event.awayTeam || 'Away Team'} vs {event.homeTeam || 'Home Team'}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{event.sport_title || 'Live Event'}</Badge>
                          <Badge variant="secondary" className="animate-pulse">LIVE</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Quarter 2</p>
                        <p className="font-mono text-lg">14:23</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {/* Money Line */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Money Line</h4>
                        <div className="space-y-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between"
                            onClick={() => handleBet(event, 'moneyline', event.awayTeam || 'Away', -110)}
                          >
                            <span>{event.awayTeam || 'Away'}</span>
                            <span className="font-mono">-110</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between"
                            onClick={() => handleBet(event, 'moneyline', event.homeTeam || 'Home', +120)}
                          >
                            <span>{event.homeTeam || 'Home'}</span>
                            <span className="font-mono">+120</span>
                          </Button>
                        </div>
                      </div>

                      {/* Spread */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Spread</h4>
                        <div className="space-y-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between"
                            onClick={() => handleBet(event, 'spread', `${event.awayTeam || 'Away'} +3.5`, -110)}
                          >
                            <span>+3.5</span>
                            <span className="font-mono">-110</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between"
                            onClick={() => handleBet(event, 'spread', `${event.homeTeam || 'Home'} -3.5`, -110)}
                          >
                            <span>-3.5</span>
                            <span className="font-mono">-110</span>
                          </Button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Total</h4>
                        <div className="space-y-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between"
                            onClick={() => handleBet(event, 'total', 'Over 47.5', -110)}
                          >
                            <span>O 47.5</span>
                            <span className="font-mono">-110</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between"
                            onClick={() => handleBet(event, 'total', 'Under 47.5', -110)}
                          >
                            <span>U 47.5</span>
                            <span className="font-mono">-110</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Live Games</h3>
                  <p className="text-gray-600">Check back when games are in progress</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="in-play" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Hot In-Play Bets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium">Next Touchdown</p>
                    <p className="text-sm text-gray-600">Chiefs vs Bills</p>
                  </div>
                  <Button size="sm" onClick={() => handleBet({id: 'live-1'}, 'prop', 'Chiefs TD', +150)}>
                    +150
                  </Button>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Next 3-Pointer</p>
                    <p className="text-sm text-gray-600">Lakers vs Warriors</p>
                  </div>
                  <Button size="sm" onClick={() => handleBet({id: 'live-2'}, 'prop', 'Lakers 3PT', +200)}>
                    +200
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Home Teams Covering</span>
                    <span className="font-mono">67%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overs Hitting</span>
                    <span className="font-mono">52%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Favorites Winning</span>
                    <span className="font-mono">71%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quick-bets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-20 text-lg"
              onClick={() => handleBet({id: 'quick-1'}, 'quick', 'Next Score Over 7.5', +110)}
            >
              Next Score Over 7.5 (+110)
            </Button>
            <Button 
              variant="outline" 
              className="h-20 text-lg"
              onClick={() => handleBet({id: 'quick-2'}, 'quick', 'Touchdown This Drive', +140)}
            >
              Touchdown This Drive (+140)
            </Button>
            <Button 
              variant="outline" 
              className="h-20 text-lg"
              onClick={() => handleBet({id: 'quick-3'}, 'quick', 'Field Goal Next', +180)}
            >
              Field Goal Next (+180)
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="props" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Player Props - Live</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Mahomes Next Pass Complete</span>
                  <Button size="sm" onClick={() => handleBet({id: 'prop-1'}, 'prop', 'Mahomes Complete', -130)}>
                    -130
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span>LeBron Next Shot Made</span>
                  <Button size="sm" onClick={() => handleBet({id: 'prop-2'}, 'prop', 'LeBron Makes Shot', +110)}>
                    +110
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Props - Live</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Next Team to Score</span>
                  <Button size="sm" onClick={() => handleBet({id: 'team-1'}, 'prop', 'Chiefs Score Next', +100)}>
                    +100
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Drive Results in Points</span>
                  <Button size="sm" onClick={() => handleBet({id: 'team-2'}, 'prop', 'Drive = Points', -150)}>
                    -150
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveBettingEnhanced;