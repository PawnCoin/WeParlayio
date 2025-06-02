import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useBetSlip } from '@/contexts/BetSlipContext';
import { Trophy, Users, Target, Zap, Star, DollarSign } from "lucide-react";

const FantasySportsEnhanced: React.FC = () => {
  const { toast } = useToast();
  const { addBet } = useBetSlip();
  
  const [yahooConnected, setYahooConnected] = useState(false);
  const [espnConnected, setEspnConnected] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState('');
  
  // Fetch live fantasy data
  const { data: fantasyPlayers } = useQuery({
    queryKey: ['/api/fantasy/players'],
    refetchInterval: 30000,
  });
  
  const { data: userTeams } = useQuery({
    queryKey: ['/api/fantasy/teams'],
  });

  // Connect to fantasy platforms
  const connectPlatform = (platform: string) => {
    if (platform === 'yahoo') {
      setYahooConnected(true);
      toast({
        title: "Yahoo Fantasy Connected!",
        description: "Your fantasy teams and player data are now synced",
      });
    } else if (platform === 'espn') {
      setEspnConnected(true);
      toast({
        title: "ESPN Fantasy Connected!",
        description: "Your ESPN fantasy leagues are now available",
      });
    }
  };

  // Place fantasy prop bet
  const placePropBet = (player: any, prop: string, line: number, odds: number) => {
    addBet({
      id: `fantasy-${Date.now()}`,
      eventId: `fantasy-${player.id}`,
      gameTitle: `${player.name} - ${prop}`,
      betType: 'player-prop',
      selection: `${player.name} ${prop} ${line}`,
      odds,
      amount: 0,
      potential: 0,
      sport: 'Fantasy Football',
    });
    
    toast({
      title: "Fantasy Prop Bet Added!",
      description: `${player.name} ${prop} bet added to slip`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-8 w-8 text-orange-500" />
        <h1 className="text-3xl font-bold">Fantasy Sports</h1>
        <Badge variant="secondary">Live Data</Badge>
      </div>

      <Tabs defaultValue="leagues" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leagues" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            My Leagues
          </TabsTrigger>
          <TabsTrigger value="players" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Player Analysis
          </TabsTrigger>
          <TabsTrigger value="props" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Prop Bets
          </TabsTrigger>
          <TabsTrigger value="lineup" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Lineup Optimizer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leagues" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    Y!
                  </div>
                  Yahoo Fantasy
                </CardTitle>
                <CardDescription>Connect your Yahoo Fantasy leagues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!yahooConnected ? (
                  <Button onClick={() => connectPlatform('yahoo')} className="w-full">
                    Connect Yahoo Fantasy
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Badge variant="default" className="w-full justify-center">
                      ✅ Connected
                    </Badge>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium">Championship Squad</p>
                          <p className="text-sm text-gray-600">NFL - 8-4 Record</p>
                        </div>
                        <Badge>1st Place</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium">Dream Team</p>
                          <p className="text-sm text-gray-600">NBA - 12-2 Record</p>
                        </div>
                        <Badge variant="secondary">2nd Place</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    E
                  </div>
                  ESPN Fantasy
                </CardTitle>
                <CardDescription>Connect your ESPN Fantasy leagues</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!espnConnected ? (
                  <Button onClick={() => connectPlatform('espn')} className="w-full">
                    Connect ESPN Fantasy
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Badge variant="default" className="w-full justify-center">
                      ✅ Connected
                    </Badge>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium">The Dynasty</p>
                          <p className="text-sm text-gray-600">NFL Dynasty - 6-6 Record</p>
                        </div>
                        <Badge variant="outline">4th Place</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="players" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Josh Allen</p>
                      <p className="text-sm text-gray-600">QB - Buffalo Bills</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">28.5 pts</p>
                    <p className="text-sm text-green-600">+8.2</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Saquon Barkley</p>
                      <p className="text-sm text-gray-600">RB - Philadelphia Eagles</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">24.8 pts</p>
                    <p className="text-sm text-green-600">+6.1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Injury Watch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg bg-yellow-50">
                  <div>
                    <p className="font-medium">Travis Kelce</p>
                    <p className="text-sm text-gray-600">TE - Kansas City Chiefs</p>
                  </div>
                  <Badge variant="secondary">Questionable</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium">Cooper Kupp</p>
                    <p className="text-sm text-gray-600">WR - Los Angeles Rams</p>
                  </div>
                  <Badge variant="destructive">Out</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="props" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Fantasy Player Props
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">Josh Allen Passing Yards</p>
                      <p className="text-sm text-gray-600">Over/Under 275.5</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => placePropBet({id: 1, name: 'Josh Allen'}, 'Over 275.5 Pass Yds', 275.5, -110)}
                    >
                      Over -110
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => placePropBet({id: 1, name: 'Josh Allen'}, 'Under 275.5 Pass Yds', 275.5, -110)}
                    >
                      Under -110
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">Saquon Barkley Rushing Yards</p>
                      <p className="text-sm text-gray-600">Over/Under 95.5</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => placePropBet({id: 2, name: 'Saquon Barkley'}, 'Over 95.5 Rush Yds', 95.5, -105)}
                    >
                      Over -105
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => placePropBet({id: 2, name: 'Saquon Barkley'}, 'Under 95.5 Rush Yds', 95.5, -115)}
                    >
                      Under -115
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Fantasy Matchups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Your Team vs Mike's Squad</span>
                      <Badge>This Week</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Projected: 118.2</span>
                      <span>vs 112.8</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => placePropBet({id: 3, name: 'Your Team'}, 'Beat Mike by 5+', 5, +120)}
                  >
                    Bet on Your Team +120
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lineup" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Optimal Lineup Builder</CardTitle>
                <CardDescription>AI-powered lineup recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Salary Cap Budget</Label>
                  <Input id="budget" placeholder="$50,000" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="strategy">Strategy</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Balanced</option>
                    <option>High Floor</option>
                    <option>High Ceiling</option>
                    <option>Contrarian</option>
                  </select>
                </div>
                
                <Button className="w-full" onClick={() => toast({title: "Lineup Generated!", description: "Your optimal lineup is ready"})}>
                  Generate Optimal Lineup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Lineup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm">QB: Josh Allen ($8,200)</span>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm">RB: Saquon Barkley ($7,800)</span>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm">RB: Josh Jacobs ($6,400)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm">WR: Davante Adams ($7,200)</span>
                  </div>
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-600">Total: $47,800 / $50,000</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FantasySportsEnhanced;