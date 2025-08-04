import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Swords, MessageSquare, Users, Clock } from 'lucide-react';
import TierGuard from '@/components/access/TierGuard';

export default function VIPHeadToHead() {
  const activeChallenge = [
    {
      id: 1,
      challenger: 'ProBettor23',
      sport: 'NFL',
      matchup: 'Chiefs vs Patriots',
      wager: 500,
      prediction: 'Chiefs -3.5',
      timeLeft: '2h 45m'
    },
    {
      id: 2,
      challenger: 'SportsFan99',
      sport: 'NBA',
      matchup: 'Lakers vs Warriors',
      wager: 250,
      prediction: 'Over 225.5',
      timeLeft: '45m'
    }
  ];

  return (
    <TierGuard requiredTier="vip" feature="Head-to-Head Betting">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">VIP Head-to-Head Betting</h1>
            <p className="text-xl text-gray-300">
              Challenge friends with SMS betting integration
            </p>
            <Badge variant="outline" className="text-orange-500 border-orange-500 mt-4">
              <Swords className="w-4 h-4 mr-2" />
              VIP Exclusive
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Challenges */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Active Challenges</h2>
              <div className="space-y-4">
                {activeChallenge.map((challenge) => (
                  <Card key={challenge.id} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{challenge.matchup}</CardTitle>
                        <Badge variant="secondary" className="bg-orange-600">
                          {challenge.sport}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm">Challenger</p>
                            <p className="font-bold">{challenge.challenger}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">Wager</p>
                            <p className="font-bold text-green-400">${challenge.wager}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-400 text-sm">Their Prediction</p>
                          <p className="font-bold">{challenge.prediction}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                            <span className="text-sm">{challenge.timeLeft} left</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="default" size="sm">Accept</Button>
                            <Button variant="outline" size="sm">Counter</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Create Challenge */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Create New Challenge</h2>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Challenge a Friend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="h-20" variant="outline">
                        <div className="text-center">
                          <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                          <p>SMS Challenge</p>
                        </div>
                      </Button>
                      <Button className="h-20" variant="outline">
                        <div className="text-center">
                          <Users className="w-6 h-6 mx-auto mb-2" />
                          <p>Friend List</p>
                        </div>
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-gray-900 rounded-lg">
                      <h3 className="font-bold mb-2">VIP Features:</h3>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• SMS notifications for challenges</li>
                        <li>• Real-time bet tracking</li>
                        <li>• Custom wager amounts</li>
                        <li>• Friend performance stats</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TierGuard>
  );
}