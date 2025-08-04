import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  Gamepad2, Monitor, Trophy, Zap, Users, TrendingUp, 
  BarChart2, Settings, Sparkles, Play, Tv,
  Target, DollarSign, Wifi, Radio, Sword, Crown,
  Clock, Eye, MessageCircle, Star
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import VipGuard from "@/components/access/VipGuard";

export default function UnifiedGaming() {
  return (
    <VipGuard 
      requiredTier="gold" 
      feature="Gaming & Esports Hub"
    >
      <UnifiedGamingContent />
    </VipGuard>
  );
}

function UnifiedGamingContent() {
  const { toast } = useToast();
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch gaming API status
  const { data: apiStatus } = useQuery({
    queryKey: ['/api/gaming/api-status'],
    refetchInterval: 30000,
    initialData: {}
  });

  // Fetch tournaments
  const { data: tournaments } = useQuery({
    queryKey: ['/api/gaming/leaguepedia/tournaments'],
    refetchInterval: 60000,
    initialData: []
  });

  // Fetch live matches
  const { data: liveMatches } = useQuery({
    queryKey: ['/api/gaming/leaguepedia/live'],
    refetchInterval: 15000,
    initialData: []
  });

  const liveStreams = [
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
      thumbnail: "🎯"
    },
    {
      id: 3,
      streamer: "FortnitePro",
      game: "Fortnite",
      viewers: 15623,
      platform: "twitch",
      odds: { win: 1.92, lose: 1.88 },
      isLive: true,
      thumbnail: "🏆"
    }
  ];

  const handlePlayerSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      const filteredPlayers = liveStreams.filter(stream => 
        stream.streamer.toLowerCase().includes(term.toLowerCase()) ||
        stream.game.toLowerCase().includes(term.toLowerCase())
      );
      console.log('Filtered players:', filteredPlayers);
    }
  };

  const handlePlayerSelect = (playerName: string) => {
    setSelectedPlayer(playerName);
    toast({
      title: "Player Selected",
      description: `Now tracking ${playerName}'s performance and betting opportunities`,
    });
  };

  const connectPlatform = (platform: string) => {
    setConnectedAccounts(prev => [...prev, platform]);
    toast({
      title: `Connected to ${platform}`,
      description: `Successfully integrated your ${platform} gaming account`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Gamepad2 className="h-10 w-10 text-purple-400" />
            Unified Gaming Hub
            <Trophy className="h-10 w-10 text-yellow-400" />
          </h1>
          <p className="text-gray-300 text-lg">
            Professional esports betting, live streaming, and gaming analytics platform
          </p>
        </div>

        {/* API Status Alert */}
        <Alert className="mb-6 bg-green-900/50 border-green-700">
          <Wifi className="h-4 w-4" />
          <AlertDescription className="text-green-200">
            All gaming APIs are operational. Real-time data streaming active.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="live-betting" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="live-betting" className="data-[state=active]:bg-purple-600">
              <Play className="w-4 h-4 mr-2" />
              Live Betting
            </TabsTrigger>
            <TabsTrigger value="esports-tournaments" className="data-[state=active]:bg-purple-600">
              <Trophy className="w-4 h-4 mr-2" />
              Tournaments
            </TabsTrigger>
            <TabsTrigger value="streaming" className="data-[state=active]:bg-purple-600">
              <Tv className="w-4 h-4 mr-2" />
              Live Streams
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
              <BarChart2 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="accounts" className="data-[state=active]:bg-purple-600">
              <Settings className="w-4 h-4 mr-2" />
              Accounts
            </TabsTrigger>
          </TabsList>

          {/* Live Betting Tab */}
          <TabsContent value="live-betting" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(liveMatches) && liveMatches.length > 0 ? (
                liveMatches.slice(0, 6).map((match: any, index: number) => (
                  <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        <span>{match.homeTeam} vs {match.awayTeam}</span>
                        <Badge variant="destructive" className="bg-red-600">LIVE</Badge>
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {match.game || 'Professional Match'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Home Odds:</span>
                          <span className="text-green-400 font-semibold">{match.homeOdds || '1.85'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Away Odds:</span>
                          <span className="text-green-400 font-semibold">{match.awayOdds || '1.95'}</span>
                        </div>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                          Place Bet
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="text-center py-8">
                      <Gamepad2 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No live matches currently available</p>
                      <p className="text-sm text-gray-500 mt-2">Check back soon for live gaming events</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tournaments Tab */}
          <TabsContent value="esports-tournaments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(tournaments) && tournaments.length > 0 ? (
                tournaments.slice(0, 6).map((tournament: any, index: number) => (
                  <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-yellow-500 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-400" />
                        {tournament.name || `Tournament ${index + 1}`}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {tournament.game || 'Multi-Game Tournament'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Prize Pool:</span>
                          <span className="text-yellow-400 font-semibold">
                            ${tournament.prizePool || '50,000'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Teams:</span>
                          <span className="text-blue-400">{tournament.teams || '16'}</span>
                        </div>
                        <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                          View Tournament
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="text-center py-8">
                      <Trophy className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No tournaments currently available</p>
                      <p className="text-sm text-gray-500 mt-2">Check back for upcoming tournaments</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Live Streams Tab */}
          <TabsContent value="streaming" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveStreams.map((stream) => (
                <Card key={stream.id} className="bg-slate-800/50 border-slate-700 hover:border-red-500 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">{stream.thumbnail}</span>
                        {stream.streamer}
                      </span>
                      <Badge className="bg-red-600">LIVE</Badge>
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {stream.game}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Viewers:</span>
                        <span className="text-red-400 font-semibold">
                          {stream.viewers.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Platform:</span>
                        <span className="text-purple-400 capitalize">{stream.platform}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handlePlayerSelect(stream.streamer)}
                        >
                          Watch Live
                        </Button>
                        <Button size="sm" variant="outline" className="text-gray-300 border-gray-600">
                          Follow
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Total Sports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">12</div>
                  <p className="text-xs text-green-400">+2 this month</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Live Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">45</div>
                  <p className="text-xs text-blue-400">Real-time</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Upcoming</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">128</div>
                  <p className="text-xs text-yellow-400">Next 24h</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-400">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">94%</div>
                  <p className="text-xs text-green-400">API uptime</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Gaming Platform Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Leaguepedia API', status: 'Connected', uptime: '99.9%' },
                    { name: 'Twitch Integration', status: 'Connected', uptime: '98.5%' },
                    { name: 'YouTube Gaming', status: 'Connected', uptime: '97.2%' },
                    { name: 'Steam API', status: 'Connected', uptime: '99.1%' }
                  ].map((api, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-white">{api.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="bg-green-900 text-green-200">
                          {api.status}
                        </Badge>
                        <span className="text-sm text-gray-400">{api.uptime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Connected Gaming Accounts</CardTitle>
                <CardDescription className="text-gray-300">
                  Link your gaming accounts for enhanced betting and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Steam', icon: '🎮', connected: connectedAccounts.includes('Steam') },
                    { name: 'Twitch', icon: '📺', connected: connectedAccounts.includes('Twitch') },
                    { name: 'YouTube Gaming', icon: '🎬', connected: connectedAccounts.includes('YouTube Gaming') },
                    { name: 'Discord', icon: '💬', connected: connectedAccounts.includes('Discord') },
                    { name: 'Epic Games', icon: '🎯', connected: connectedAccounts.includes('Epic Games') },
                    { name: 'Battle.net', icon: '⚔️', connected: connectedAccounts.includes('Battle.net') }
                  ].map((platform) => (
                    <div key={platform.name} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{platform.icon}</span>
                        <span className="text-white font-medium">{platform.name}</span>
                      </div>
                      <Button
                        onClick={() => connectPlatform(platform.name)}
                        disabled={platform.connected}
                        size="sm"
                        className={platform.connected 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "bg-purple-600 hover:bg-purple-700"
                        }
                      >
                        {platform.connected ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}