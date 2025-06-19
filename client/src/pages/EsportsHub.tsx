import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Gamepad2, 
  TrendingUp, 
  Users, 
  Target, 
  Trophy,
  Crown,
  Eye,
  Clock,
  Play,
  Star,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import TierGuard from '@/components/access/TierGuard';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface LiveMatch {
  id: string;
  game: string;
  teams: [string, string];
  viewers: number;
  odds: [number, number];
  status: 'live' | 'upcoming' | 'finished';
  tournament: string;
  prize: string;
}

const EsportsHub: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedMatch, setSelectedMatch] = useState<LiveMatch | null>(null);
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState(false);

  const mockLiveMatches: LiveMatch[] = [
    {
      id: '1',
      game: 'League of Legends',
      teams: ['Team Liquid', 'Cloud9'],
      viewers: 85000,
      odds: [1.85, 1.95],
      status: 'live',
      tournament: 'LCS Championship',
      prize: '$100,000'
    },
    {
      id: '2',
      game: 'CS:GO',
      teams: ['FaZe Clan', 'NAVI'],
      viewers: 120000,
      odds: [2.10, 1.75],
      status: 'live',
      tournament: 'ESL Pro League',
      prize: '$250,000'
    }
  ];

  const handleWatchLive = (match: LiveMatch) => {
    toast({
      title: "Opening Live Stream",
      description: `Loading ${match.teams[0]} vs ${match.teams[1]}...`,
      duration: 2000,
    });
    window.location.href = '/live-sports-streaming';
  };

  const placeBet = (matchId: string, team: number) => {
    toast({
      title: "Bet Placed",
      description: `Your bet has been placed successfully!`,
    });
  };

  return (
    <TierGuard 
      requiredTier="vip" 
      feature="Esports Hub"
      description="Access live esports tournaments, professional match betting, streaming integration, and advanced esports analytics exclusively for VIP+ members."
    >
      <ErrorBoundary>
        <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Gamepad2 className="h-8 w-8 text-blue-600" />
                Esports Hub
              </h1>
            </div>

            <Tabs defaultValue="live" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="live">Live Matches</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="space-y-4">
                {mockLiveMatches.map((match) => (
                  <Card key={match.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive" className="animate-pulse">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                            LIVE
                          </Badge>
                          <span className="text-sm text-gray-600">{match.game}</span>
                        </div>
                        <h3 className="font-semibold text-lg">
                          {match.teams[0]} vs {match.teams[1]}
                        </h3>
                        <p className="text-sm text-gray-600">{match.tournament}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">{match.viewers.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm">{match.prize}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleWatchLive(match)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Watch Live
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => placeBet(match.id, 0)}
                          >
                            {match.teams[0]} {match.odds[0]}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => placeBet(match.id, 1)}
                          >
                            {match.teams[1]} {match.odds[1]}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="upcoming">
                <Card className="p-6 text-center">
                  <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Upcoming Matches</h3>
                  <p className="text-gray-600">Check back soon for upcoming esports matches!</p>
                </Card>
              </TabsContent>

              <TabsContent value="tournaments">
                <Card className="p-6 text-center">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Tournaments</h3>
                  <p className="text-gray-600">Tournament brackets coming soon!</p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Popular Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['League of Legends', 'CS:GO', 'Dota 2', 'Valorant'].map((game) => (
                    <div key={game} className="flex items-center justify-between">
                      <span className="text-sm">{game}</span>
                      <Badge variant="secondary">Live</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  Personal Gaming
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/unified-gaming'}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Gaming Hub
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/video-gaming'}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Video Gaming Bets
                </Button>
                <p className="text-xs text-muted-foreground">
                  Bet on your own gameplay and achievements
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Viewers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {mockLiveMatches.reduce((sum, match) => sum + match.viewers, 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Total Viewers</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Stream Modal */}
        {isLiveStreamOpen && selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {selectedMatch.teams[0]} vs {selectedMatch.teams[1]}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setIsLiveStreamOpen(false)}
                >
                  Close
                </Button>
              </div>
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <Play className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-xl">Live Stream Player</p>
                  <p className="text-sm opacity-75">
                    {selectedMatch.viewers.toLocaleString()} viewers
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </ErrorBoundary>
    </TierGuard>
  );
};

export default EsportsHub;