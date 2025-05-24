import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Monitor, Trophy, Zap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const GamingIntegration: React.FC = () => {
  const { toast } = useToast();
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);

  const connectGamingAccount = (platform: string, username: string) => {
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: `Please enter your ${platform} username/gamertag`,
        variant: "destructive"
      });
      return;
    }

    setConnectedAccounts([...connectedAccounts, platform]);
    toast({
      title: `${platform} Connected!`,
      description: `We can now track your gaming results for betting verification`,
    });
  };

  const gamingPlatforms = [
    {
      id: 'xbox',
      name: 'Xbox Live',
      icon: '🎮',
      description: 'Connect Xbox Live for real-time match results',
      apiEndpoint: 'Xbox Live API',
      features: ['Match Results', 'Player Stats', 'Achievement Tracking']
    },
    {
      id: 'playstation',
      name: 'PlayStation Network',
      icon: '🎯',
      description: 'Connect PSN for live gaming data',
      apiEndpoint: 'PlayStation API',
      features: ['Trophy Data', 'Game Progress', 'Match History']
    },
    {
      id: 'steam',
      name: 'Steam',
      icon: '💨',
      description: 'Connect Steam for PC gaming results',
      apiEndpoint: 'Steam Web API',
      features: ['Game Stats', 'Achievement Data', 'Play Time']
    },
    {
      id: 'epic',
      name: 'Epic Games',
      icon: '⚡',
      description: 'Connect Epic Games for Fortnite and more',
      apiEndpoint: 'Epic Games API',
      features: ['Match Data', 'Rank Tracking', 'Season Stats']
    }
  ];

  const popularGames = [
    { name: 'Call of Duty', platforms: ['Xbox', 'PlayStation', 'PC'], betTypes: ['Match Winner', 'K/D Ratio', 'Score Over/Under'] },
    { name: 'FIFA 24', platforms: ['Xbox', 'PlayStation', 'PC'], betTypes: ['Match Result', 'Goals Total', 'Player Performance'] },
    { name: 'Fortnite', platforms: ['Xbox', 'PlayStation', 'PC'], betTypes: ['Victory Royale', 'Top 10 Finish', 'Eliminations'] },
    { name: 'Apex Legends', platforms: ['Xbox', 'PlayStation', 'PC'], betTypes: ['Squad Win', 'Damage Dealt', 'Survival Time'] },
    { name: 'Rocket League', platforms: ['Xbox', 'PlayStation', 'PC'], betTypes: ['Match Win', 'Goals Scored', 'Saves Made'] }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Gamepad2 className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold">Gaming Integration</h1>
        <Badge variant="secondary">Live Results</Badge>
      </div>

      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="platforms" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Platforms
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Games
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Live Results
          </TabsTrigger>
          <TabsTrigger value="bets" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Gaming Bets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gamingPlatforms.map((platform) => (
              <Card key={platform.id} className={`border-2 ${connectedAccounts.includes(platform.id) ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{platform.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                      <p className="text-sm text-gray-600">{platform.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${platform.id}-username`}>
                      {platform.name === 'Xbox Live' ? 'Gamertag' : 
                       platform.name === 'PlayStation Network' ? 'PSN ID' : 'Username'}
                    </Label>
                    <Input 
                      id={`${platform.id}-username`}
                      placeholder={`Enter your ${platform.name} username`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Features Available:</h4>
                    <div className="flex flex-wrap gap-1">
                      {platform.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {connectedAccounts.includes(platform.id) ? (
                    <div className="space-y-2">
                      <Badge variant="default" className="w-full justify-center">
                        ✅ Connected & Tracking
                      </Badge>
                      <Button variant="outline" size="sm" className="w-full">
                        View Gaming Stats
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => {
                        const input = document.getElementById(`${platform.id}-username`) as HTMLInputElement;
                        connectGamingAccount(platform.name, input?.value || '');
                      }}
                    >
                      Connect {platform.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="games" className="space-y-4">
          <div className="space-y-4">
            {popularGames.map((game, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{game.name}</span>
                    <div className="flex gap-2">
                      {game.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Available Bet Types:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {game.betTypes.map((betType) => (
                          <Button key={betType} variant="outline" size="sm">
                            {betType}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  Live Gaming Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">ProGamer123 - Call of Duty</p>
                      <p className="text-sm text-gray-600">Match Result: Victory</p>
                    </div>
                    <Badge variant="default">WIN</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">ElitePlayer - FIFA 24</p>
                      <p className="text-sm text-gray-600">Final Score: 2-3</p>
                    </div>
                    <Badge variant="destructive">LOSS</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">SkillMaster - Fortnite</p>
                      <p className="text-sm text-gray-600">Placement: 5th</p>
                    </div>
                    <Badge variant="secondary">TOP 10</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gaming Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Win Rate (All Games)</span>
                    <span className="font-mono">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Gaming Bets</span>
                    <span className="font-mono">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Gaming Winnings</span>
                    <span className="font-mono">$2,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connected Platforms</span>
                    <span className="font-mono">{connectedAccounts.length}/4</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Gaming Bets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">Call of Duty Match</p>
                      <p className="text-sm text-gray-600">ProGamer123 to win next match</p>
                    </div>
                    <Badge variant="outline">$50</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Odds: +120</span>
                    <span>Potential: $110</span>
                  </div>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">FIFA Tournament</p>
                      <p className="text-sm text-gray-600">ElitePlayer over 3.5 goals</p>
                    </div>
                    <Badge variant="outline">$25</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Odds: +150</span>
                    <span>Potential: $62.50</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Place Gaming Bet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gamer-select">Select Gamer</Label>
                  <Input id="gamer-select" placeholder="Search gamertag..." />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bet-type">Bet Type</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Match Winner</option>
                    <option>Score Over/Under</option>
                    <option>Performance Prop</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bet-amount">Bet Amount</Label>
                  <Input id="bet-amount" placeholder="$25" />
                </div>
                
                <Button className="w-full">Place Gaming Bet</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamingIntegration;