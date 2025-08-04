import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gamepad2, Play, Users, TrendingUp } from 'lucide-react';
import TierGuard from '@/components/access/TierGuard';

export default function VIPGamingIntegration() {
  const esportsEvents = [
    {
      id: 1,
      game: 'League of Legends',
      tournament: 'LCS Championship',
      teams: 'Team Liquid vs Cloud9',
      viewers: 45000,
      status: 'LIVE',
      odds: { teamA: '+150', teamB: '-180' }
    },
    {
      id: 2,
      game: 'CS:GO',
      tournament: 'ESL Pro League',
      teams: 'FaZe vs NAVI',
      viewers: 32000,
      status: 'UPCOMING',
      odds: { teamA: '+110', teamB: '-135' }
    },
    {
      id: 3,
      game: 'Valorant',
      tournament: 'VCT Masters',
      teams: 'Sentinels vs 100T',
      viewers: 28000,
      status: 'LIVE',
      odds: { teamA: '+200', teamB: '-250' }
    }
  ];

  return (
    <TierGuard requiredTier="vip" feature="Gaming Integration">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">VIP Gaming Integration</h1>
            <p className="text-xl text-gray-300">
              Bet on esports and gaming events with exclusive VIP features
            </p>
            <Badge variant="outline" className="text-blue-500 border-blue-500 mt-4">
              <Gamepad2 className="w-4 h-4 mr-2" />
              VIP Exclusive
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {esportsEvents.map((event) => (
              <Card key={event.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{event.game}</CardTitle>
                    <Badge 
                      variant={event.status === 'LIVE' ? 'destructive' : 'secondary'}
                      className={event.status === 'LIVE' ? 'bg-red-600' : 'bg-yellow-600'}
                    >
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400">{event.tournament}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-400 text-sm">Matchup</p>
                      <p className="font-bold">{event.teams}</p>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-purple-400" />
                      <span className="text-sm">{event.viewers.toLocaleString()} viewers</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="text-xs">
                        Team A {event.odds.teamA}
                      </Button>
                      <Button variant="outline" className="text-xs">
                        Team B {event.odds.teamB}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1" variant="default">
                        <Play className="w-4 h-4 mr-2" />
                        Watch
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Bet
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">VIP Gaming Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <h3 className="font-bold">Esports Betting</h3>
                    <p className="text-sm text-gray-400">Major tournaments</p>
                  </div>
                  <div className="text-center">
                    <Play className="w-8 h-8 mx-auto mb-2 text-red-400" />
                    <h3 className="font-bold">Live Streams</h3>
                    <p className="text-sm text-gray-400">HD quality</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <h3 className="font-bold">Player Stats</h3>
                    <p className="text-sm text-gray-400">Advanced analytics</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <h3 className="font-bold">Community</h3>
                    <p className="text-sm text-gray-400">VIP gaming groups</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TierGuard>
  );
}