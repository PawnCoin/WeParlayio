import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Gamepad2, Monitor, Trophy, Zap, Users, TrendingUp, 
  BarChart2, Settings, Sparkles, Play, Tv, Video,
  Target, DollarSign, Wifi, Radio,
  Clock, Eye, MessageCircle, ThumbsUp, Share2
} from "lucide-react";

export default function UnifiedGaming() {
  const { toast } = useToast();
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [useFakeMoney, setUseFakeMoney] = useState(true);
  const [liveStreams, setLiveStreams] = useState([
    {
      id: 1,
      streamer: "ProGamer_Elite",
      game: "League of Legends",
      viewers: 12847,
      platform: "twitch",
      odds: { win: 1.85, lose: 1.95 },
      isLive: true,
      thumbnail: "🎮"
    },
    {
      id: 2,
      streamer: "EsportsKing",
      game: "CS:GO",
      viewers: 8392,
      platform: "youtube",
      odds: { win: 2.10, lose: 1.75 },
      isLive: true,
      thumbnail: "🔫"
    },
    {
      id: 3,
      streamer: "FortnitePro",
      game: "Fortnite",
      viewers: 15634,
      platform: "twitch",
      odds: { royale: 3.50, top10: 1.45 },
      isLive: true,
      thumbnail: "🏆"
    }
  ]);

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

  const handleCurrencyToggle = (checked: boolean) => {
    setUseFakeMoney(checked);
    toast({
      title: checked ? "Using WeParlay Cash" : "Using Real Money",
      description: checked 
        ? "You've switched to betting with virtual WeParlay Cash" 
        : "You've switched to betting with real money and crypto",
      variant: checked ? "default" : "destructive",
    });
  };

  const placeLiveStreamBet = (streamId: number, betType: string, amount: string) => {
    const stream = liveStreams.find(s => s.id === streamId);
    if (!stream) return;

    toast({
      title: "Live Stream Bet Placed!",
      description: `$${amount} bet on ${stream.streamer} - ${betType}`,
    });
  };

  const gamingPlatforms = [
    {
      id: 'xbox',
      name: 'Xbox Live',
      icon: '🎮',
      description: 'Connect Xbox Live for real-time match results',
      features: ['Match Results', 'Player Stats', 'Achievement Tracking', 'Gamerscore Betting']
    },
    {
      id: 'playstation',
      name: 'PlayStation Network',
      icon: '🎯',
      description: 'Connect PSN for live gaming data',
      features: ['Trophy Data', 'Game Progress', 'Match History', 'Rank Tracking']
    },
    {
      id: 'steam',
      name: 'Steam',
      icon: '💨',
      description: 'Connect Steam for PC gaming results',
      features: ['Game Stats', 'Achievement Data', 'Play Time', 'Inventory Value']
    },
    {
      id: 'epic',
      name: 'Epic Games',
      icon: '⚡',
      description: 'Connect Epic Games for Fortnite and more',
      features: ['Match Data', 'Rank Tracking', 'Season Stats', 'Item Shop Values']
    }
  ];

  const popularGames = [
    { 
      name: 'League of Legends', 
      platforms: ['PC'], 
      betTypes: ['Match Winner', 'First Blood', 'Dragon/Baron', 'Kill Count', 'CS Score'],
      currentMatches: 24,
      avgOdds: '1.85'
    },
    { 
      name: 'CS:GO', 
      platforms: ['PC'], 
      betTypes: ['Match Winner', 'Map Winner', 'Round Totals', 'First Kill', 'Bomb Plant'],
      currentMatches: 18,
      avgOdds: '2.10'
    },
    { 
      name: 'Fortnite', 
      platforms: ['Xbox', 'PlayStation', 'PC'], 
      betTypes: ['Victory Royale', 'Top 10 Finish', 'Eliminations', 'Damage Dealt'],
      currentMatches: 156,
      avgOdds: '12.50'
    },
    { 
      name: 'Valorant', 
      platforms: ['PC'], 
      betTypes: ['Match Winner', 'Map Score', 'Ace Rounds', 'Spike Plants', 'Agent Picks'],
      currentMatches: 31,
      avgOdds: '1.95'
    },
    { 
      name: 'Apex Legends', 
      platforms: ['Xbox', 'PlayStation', 'PC'], 
      betTypes: ['Squad Win', 'Placement', 'Damage Dealt', 'Survival Time', 'Ring Position'],
      currentMatches: 89,
      avgOdds: '8.75'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Gamepad2 className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Gaming & Esports Hub</h1>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Live Results
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Complete gaming integration, live streaming bets, and esports tournaments
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg">
          <span className="text-sm font-medium">Real Money</span>
          <Switch 
            checked={useFakeMoney}
            onCheckedChange={handleCurrencyToggle}
          />
          <span className="text-sm font-medium">WeParlay Cash</span>
        </div>
      </div>

      <Tabs defaultValue="platforms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="platforms" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Console Integration
          </TabsTrigger>
          <TabsTrigger value="live-streams" className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            Live Streaming
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Esports Betting
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Tournaments
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Console Integration Tab */}
        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gamingPlatforms.map((platform) => (
              <Card key={platform.id} className={`border-2 transition-all duration-300 ${connectedAccounts.includes(platform.id) ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-purple-200'}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{platform.icon}</span>
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
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Betting Features:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {platform.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs justify-center">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {connectedAccounts.includes(platform.id) ? (
                    <div className="space-y-2">
                      <Badge variant="default" className="w-full justify-center bg-green-600">
                        ✅ Connected & Tracking
                      </Badge>
                      <Button variant="outline" size="sm" className="w-full">
                        View Gaming Stats
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
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

          {/* Active Gaming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                Active Gaming Sessions
              </CardTitle>
              <CardDescription>
                Real-time gaming data from connected accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Xbox Live</span>
                    <Badge variant="secondary">Online</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Playing: Call of Duty</p>
                  <p className="text-sm text-gray-600">K/D: 1.8 (Current Match)</p>
                  <Button size="sm" className="mt-2 w-full">Bet on This Match</Button>
                </div>

                <div className="p-4 border rounded-lg bg-orange-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">PlayStation</span>
                    <Badge variant="secondary">Online</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Playing: FIFA 24</p>
                  <p className="text-sm text-gray-600">Score: 2-1 (75th min)</p>
                  <Button size="sm" className="mt-2 w-full">Bet on This Match</Button>
                </div>

                <div className="p-4 border rounded-lg bg-purple-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Steam</span>
                    <Badge variant="secondary">Online</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Playing: Dota 2</p>
                  <p className="text-sm text-gray-600">MMR: 3,450 (+25)</p>
                  <Button size="sm" className="mt-2 w-full">Bet on This Match</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Streaming Tab */}
        <TabsContent value="live-streams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-red-500" />
                Live Gaming Streams
              </CardTitle>
              <CardDescription>
                Bet on live streams, viewer counts, and streamer performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {liveStreams.map((stream) => (
                  <Card key={stream.id} className="border-2 border-red-200 bg-red-50/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{stream.thumbnail}</span>
                          <div>
                            <h3 className="font-bold text-sm">{stream.streamer}</h3>
                            <p className="text-xs text-gray-600">{stream.game}</p>
                          </div>
                        </div>
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          LIVE
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{stream.viewers.toLocaleString()} viewers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {stream.platform === 'twitch' ? (
                            <div className="w-4 h-4 bg-purple-600 rounded"></div>
                          ) : (
                            <div className="w-4 h-4 bg-red-600 rounded"></div>
                          )}
                          <span className="capitalize">{stream.platform}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Live Betting Options:</h4>
                        
                        {stream.game === "Fortnite" ? (
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => placeLiveStreamBet(stream.id, "Victory Royale", "25")}
                            >
                              Victory Royale {stream.odds.royale}x
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => placeLiveStreamBet(stream.id, "Top 10", "25")}
                            >
                              Top 10 {stream.odds.top10}x
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => placeLiveStreamBet(stream.id, "Win", "25")}
                            >
                              Match Win {stream.odds.win}x
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => placeLiveStreamBet(stream.id, "Lose", "25")}
                            >
                              Match Loss {stream.odds.lose}x
                            </Button>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <Button size="sm" variant="ghost" className="text-xs">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Chat Bets
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Duration Bets
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <Input 
                          placeholder="Bet amount" 
                          className="w-20 h-8 text-xs"
                          defaultValue="$25"
                        />
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          Watch & Bet
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Streaming Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Streaming Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Most Viewed Game</span>
                  <span className="font-bold">League of Legends</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Highest Betting Volume</span>
                  <span className="font-bold">CS:GO</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Peak Concurrent Viewers</span>
                  <span className="font-bold">847K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Stream Bets</span>
                  <span className="font-bold">1,234</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Stream Betting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Active Stream Bets</span>
                  <span className="font-bold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Stream Bet Win Rate</span>
                  <span className="font-bold text-green-600">72%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Favorite Streamer</span>
                  <span className="font-bold">ProGamer_Elite</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Stream Winnings</span>
                  <span className="font-bold text-green-600">$1,240</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Esports Betting Tab */}
        <TabsContent value="games" className="space-y-6">
          <div className="space-y-4">
            {popularGames.map((game, index) => (
              <Card key={index} className="border-2 hover:border-blue-200 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span>{game.name}</span>
                        <Badge variant="secondary">{game.currentMatches} live matches</Badge>
                      </CardTitle>
                      <CardDescription>
                        Average odds: {game.avgOdds}x | {game.platforms.join(', ')}
                      </CardDescription>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      View All Matches
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Available Bet Types:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        {game.betTypes.map((betType) => (
                          <Button key={betType} variant="outline" size="sm" className="text-xs">
                            {betType}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Live Matches Preview */}
                    <div className="border-t pt-3">
                      <h4 className="font-medium text-sm mb-2">Featured Live Matches:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm">Team Liquid vs FaZe Clan</span>
                          <div className="flex gap-2">
                            <Badge variant="outline">1.85</Badge>
                            <Badge variant="outline">2.10</Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm">G2 Esports vs Fnatic</span>
                          <div className="flex gap-2">
                            <Badge variant="outline">1.95</Badge>
                            <Badge variant="outline">1.90</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tournaments Tab */}
        <TabsContent value="tournaments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Active Tournaments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">League of Legends World Championship</h3>
                      <p className="text-sm text-gray-600">Grand Finals - Live Now</p>
                    </div>
                    <Badge variant="destructive">LIVE</Badge>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm">Prize Pool: $2.2M</span>
                    <Button size="sm">View Bracket</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">CS:GO Major Championship</h3>
                      <p className="text-sm text-gray-600">Semi-Finals - Tomorrow</p>
                    </div>
                    <Badge variant="secondary">Upcoming</Badge>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm">Prize Pool: $1.8M</span>
                    <Button size="sm" variant="outline">Pre-Bet</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">Valorant Champions</h3>
                      <p className="text-sm text-gray-600">Group Stage</p>
                    </div>
                    <Badge variant="outline">In Progress</Badge>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm">Prize Pool: $1.5M</span>
                    <Button size="sm" variant="outline">View Matches</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Tournaments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 bg-purple-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">WeParlay Weekly Cup</h3>
                      <p className="text-sm text-gray-600">Open Registration</p>
                    </div>
                    <Badge variant="default">Join Now</Badge>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm">Entry Fee: $25</span>
                    <Button size="sm">Register</Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">Fortnite Friday</h3>
                      <p className="text-sm text-gray-600">Weekly Battle Royale</p>
                    </div>
                    <Badge variant="secondary">This Friday</Badge>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm">Entry Fee: $15</span>
                    <Button size="sm" variant="outline">Sign Up</Button>
                  </div>
                </div>

                <Button className="w-full">Create Your Tournament</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Gaming Betting Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-muted">
                          <th className="py-3 px-2 text-left">Rank</th>
                          <th className="py-3 px-2 text-left">Player</th>
                          <th className="py-3 px-2 text-left">Win Rate</th>
                          <th className="py-3 px-2 text-left">Profit</th>
                          <th className="py-3 px-2 text-left">Specialty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { rank: 1, name: "ProGamer123", winRate: "68%", profit: "+$12,450", specialty: "League of Legends" },
                          { rank: 2, name: "EsportsKing", winRate: "65%", profit: "+$11,820", specialty: "CS:GO" },
                          { rank: 3, name: "StreamSniper", winRate: "62%", profit: "+$9,740", specialty: "Twitch Betting" },
                          { rank: 4, name: "ConsoleGod", winRate: "59%", profit: "+$8,320", specialty: "Xbox Live" },
                          { rank: 5, name: "TourneyMaster", winRate: "57%", profit: "+$7,450", specialty: "Tournaments" },
                        ].map((player, index) => (
                          <tr key={index} className="border-b border-muted hover:bg-gray-50">
                            <td className="py-4 px-2">
                              {player.rank === 1 ? (
                                <div className="flex items-center">
                                  <span className="text-yellow-500 font-bold">{player.rank}</span>
                                  <Sparkles className="h-4 w-4 ml-1 text-yellow-500" />
                                </div>
                              ) : (
                                <span className={player.rank <= 3 ? "font-bold" : ""}>{player.rank}</span>
                              )}
                            </td>
                            <td className="py-4 px-2 font-medium">{player.name}</td>
                            <td className="py-4 px-2 text-green-600 font-bold">{player.winRate}</td>
                            <td className="py-4 px-2 text-green-600 font-bold">{player.profit}</td>
                            <td className="py-4 px-2">
                              <Badge variant="outline">{player.specialty}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" />
                    Gaming Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Your Rank:</span>
                    <span className="font-bold">#156</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gaming Win Rate:</span>
                    <span className="font-bold text-green-600">52%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Gaming Bets:</span>
                    <span className="font-bold">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Game:</span>
                    <span className="font-bold">Fortnite</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gaming Profit:</span>
                    <span className="font-bold text-green-600">+$1,240</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trending Now
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">🔥 Most Bet Game</span>
                      <span className="font-bold text-sm">League of Legends</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">⚡ Highest Payout</span>
                      <span className="font-bold text-sm">$3,200 (CS:GO)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">📈 Rising Game</span>
                      <span className="font-bold text-sm">Valorant</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">🎯 Best Odds</span>
                      <span className="font-bold text-sm">12.5x (Fortnite)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}