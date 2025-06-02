import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import YahooFantasyFootballDisplay from '@/components/fantasy/YahooFantasyFootballDisplay';
import ESPNFantasyDisplay from '@/components/fantasy/ESPNFantasyDisplay';
import { Trophy, Target } from "lucide-react";

const FantasySportsEnhanced: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Fantasy Sports Hub
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Connect your fantasy football accounts from Yahoo and ESPN to view leagues, standings, rosters, and player stats in one place.
        </p>
      </div>

      {/* Fantasy Platform Tabs */}
      <Tabs defaultValue="yahoo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="yahoo" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              Y!
            </div>
            Yahoo Fantasy
          </TabsTrigger>
          <TabsTrigger value="espn" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              ESPN
            </div>
            ESPN Fantasy
          </TabsTrigger>
        </TabsList>

        {/* Yahoo Fantasy Tab */}
        <TabsContent value="yahoo">
          <YahooFantasyFootballDisplay />
        </TabsContent>

        {/* ESPN Fantasy Tab */}
        <TabsContent value="espn">
          <ESPNFantasyDisplay />
        </TabsContent>
      </Tabs>

      {/* Additional Features */}
      <div className="grid md:grid-cols-2 gap-6 mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Fantasy Betting Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Place prop bets on your fantasy players and compete with friends on player performance.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Player Prop Bets</span>
                <span className="text-green-600">Available</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Fantasy Contests</span>
                <span className="text-green-600">Available</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>League Competitions</span>
                <span className="text-blue-600">Coming Soon</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Multi-Platform Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Connect multiple fantasy platforms and manage all your teams from one dashboard.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Yahoo Fantasy Football</span>
                <span className="text-green-600">OAuth Ready</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ESPN Fantasy Football</span>
                <span className="text-orange-600">Setup Required</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Sleeper Fantasy</span>
                <span className="text-gray-400">Future Release</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FantasySportsEnhanced;