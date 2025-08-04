import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Trophy, Users, DollarSign } from 'lucide-react';
import TierGuard from '@/components/access/TierGuard';

export default function VIPTournaments() {
  const tournaments = [
    {
      id: 1,
      name: 'VIP Championship Series',
      type: 'Multi-Sport',
      entryFee: 1000,
      prizePool: 50000,
      participants: 24,
      maxParticipants: 32,
      status: 'Registration Open',
      startDate: '2025-08-15'
    },
    {
      id: 2,
      name: 'Elite NFL Predictor',
      type: 'NFL',
      entryFee: 500,
      prizePool: 25000,
      participants: 45,
      maxParticipants: 50,
      status: 'Almost Full',
      startDate: '2025-08-10'
    },
    {
      id: 3,
      name: 'Premium Basketball Masters',
      type: 'NBA',
      entryFee: 750,
      prizePool: 35000,
      participants: 12,
      maxParticipants: 30,
      status: 'Early Bird',
      startDate: '2025-08-20'
    }
  ];

  return (
    <TierGuard requiredTier="vip" feature="VIP Tournaments">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">VIP Tournaments</h1>
            <p className="text-xl text-gray-300">
              Exclusive VIP tournaments with higher stakes and premium rewards
            </p>
            <Badge variant="outline" className="text-yellow-500 border-yellow-500 mt-4">
              <Crown className="w-4 h-4 mr-2" />
              VIP Exclusive
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{tournament.name}</CardTitle>
                    <Badge 
                      variant={
                        tournament.status === 'Registration Open' ? 'secondary' :
                        tournament.status === 'Almost Full' ? 'destructive' : 'default'
                      }
                      className={
                        tournament.status === 'Registration Open' ? 'bg-green-600' :
                        tournament.status === 'Almost Full' ? 'bg-red-600' : 'bg-blue-600'
                      }
                    >
                      {tournament.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400">{tournament.type} Tournament</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                        <div>
                          <p className="text-gray-400">Entry Fee</p>
                          <p className="font-bold">${tournament.entryFee}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                        <div>
                          <p className="text-gray-400">Prize Pool</p>
                          <p className="font-bold">${tournament.prizePool.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-gray-400 text-sm">Participants</p>
                        <div className="flex items-center justify-between">
                          <p className="font-bold">{tournament.participants}/{tournament.maxParticipants}</p>
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(tournament.participants / tournament.maxParticipants) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-900 rounded-lg">
                      <p className="text-gray-400 text-sm">Starts</p>
                      <p className="font-bold">{tournament.startDate}</p>
                    </div>
                    
                    <Button className="w-full" variant="default">
                      <Crown className="w-4 h-4 mr-2" />
                      Join Tournament
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">VIP Tournament Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <h3 className="font-bold">Exclusive Access</h3>
                    <p className="text-sm text-gray-400">VIP-only tournaments</p>
                  </div>
                  <div className="text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <h3 className="font-bold">Higher Stakes</h3>
                    <p className="text-sm text-gray-400">Premium entry fees</p>
                  </div>
                  <div className="text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <h3 className="font-bold">Bigger Prizes</h3>
                    <p className="text-sm text-gray-400">Enhanced prize pools</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <h3 className="font-bold">Elite Competition</h3>
                    <p className="text-sm text-gray-400">Skilled participants</p>
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