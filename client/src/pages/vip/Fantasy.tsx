import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, DollarSign, TrendingUp } from 'lucide-react';
import TierGuard from '@/components/access/TierGuard';

export default function VIPFantasy() {
  const fantasyLeagues = [
    {
      id: 1,
      name: 'VIP NFL Champions',
      sport: 'NFL',
      entryFee: 250,
      prizePool: 10000,
      participants: 40,
      maxParticipants: 50,
      status: 'Open'
    },
    {
      id: 2,
      name: 'Elite NBA Masters',
      sport: 'NBA', 
      entryFee: 500,
      prizePool: 25000,
      participants: 48,
      maxParticipants: 50,
      status: 'Almost Full'
    },
    {
      id: 3,
      name: 'Premium Soccer Elite',
      sport: 'Soccer',
      entryFee: 100,
      prizePool: 5000,
      participants: 32,
      maxParticipants: 50,
      status: 'Open'
    }
  ];

  return (
    <TierGuard requiredTier="vip" feature="VIP Fantasy Sports">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">VIP Fantasy Sports</h1>
            <p className="text-xl text-gray-300">
              Exclusive high-stakes fantasy leagues with premium analytics
            </p>
            <Badge variant="outline" className="text-purple-500 border-purple-500 mt-4">
              <Trophy className="w-4 h-4 mr-2" />
              VIP Exclusive
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {fantasyLeagues.map((league) => (
              <Card key={league.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{league.name}</CardTitle>
                    <Badge 
                      variant={league.status === 'Open' ? 'secondary' : 'destructive'}
                      className={league.status === 'Open' ? 'bg-green-600' : 'bg-yellow-600'}
                    >
                      {league.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400">{league.sport} Fantasy League</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                        <div>
                          <p className="text-gray-400">Entry Fee</p>
                          <p className="font-bold">${league.entryFee}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                        <div>
                          <p className="text-gray-400">Prize Pool</p>
                          <p className="font-bold">${league.prizePool.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-gray-400 text-sm">Participants</p>
                        <div className="flex items-center justify-between">
                          <p className="font-bold">{league.participants}/{league.maxParticipants}</p>
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(league.participants / league.maxParticipants) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1" variant="default">
                        <Trophy className="w-4 h-4 mr-2" />
                        Join League
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </TierGuard>
  );
}