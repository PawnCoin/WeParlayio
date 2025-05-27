import React from 'react';
import HypeEventDashboard from '@/components/sports/HypeEventDashboard';
import LiveHypeTracker from '@/components/sports/LiveHypeTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, Star, Zap } from 'lucide-react';

export default function SportsHypeCenter() {
  const handleEventSelect = (event: any) => {
    // Navigate to betting interface or open bet slip
    console.log('Event selected for betting:', event);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-orange-600 to-red-600 border-orange-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="h-8 w-8 text-yellow-300 animate-pulse" />
                <div>
                  <CardTitle className="text-white text-3xl font-bold">
                    Sports Hype Center
                  </CardTitle>
                  <p className="text-orange-100 text-lg">
                    Real-time excitement tracking for the hottest sports events
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Badge className="bg-yellow-500 text-black font-bold px-4 py-2 text-lg animate-bounce">
                  <Star className="h-4 w-4 mr-1" />
                  LIVE
                </Badge>
                <Badge className="bg-red-500 text-white font-bold px-4 py-2 text-lg animate-pulse">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  TRENDING
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Live Hype Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HypeEventDashboard onEventSelect={handleEventSelect} />
          </div>
          
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-purple-800 to-pink-800 border-purple-600">
              <CardHeader>
                <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Live Buzz Tracker
                </CardTitle>
              </CardHeader>
            </Card>
            
            <LiveHypeTracker />
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-800 to-indigo-800 border-blue-600">
            <CardContent className="pt-6 text-center">
              <Flame className="h-12 w-12 text-orange-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">Real-Time Hype</h3>
              <p className="text-blue-200 text-sm">
                Track live fan excitement levels across all major sports events
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-800 to-emerald-800 border-green-600">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">Social Buzz</h3>
              <p className="text-green-200 text-sm">
                Monitor social media mentions and trending keywords live
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-800 to-violet-800 border-purple-600">
            <CardContent className="pt-6 text-center">
              <Star className="h-12 w-12 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">Smart Insights</h3>
              <p className="text-purple-200 text-sm">
                AI-powered analysis of betting volume and fan engagement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
          <CardContent className="pt-4">
            <div className="text-center text-gray-300">
              <p className="text-sm">
                Experience the thrill of sports betting with real-time hype tracking and countdown timers
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs">Updates every 30 seconds</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}