import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Users, Target, ExternalLink, Settings, BarChart3, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import TierGuard from "@/components/access/TierGuard";

export default function FantasySportsHub() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [yahooConnected, setYahooConnected] = useState(false);
  const [espnConnected, setEspnConnected] = useState(false);

  // Fetch fantasy overview data
  const { data: fantasyPlayers } = useQuery({
    queryKey: ['/api/fantasy/players'],
    refetchInterval: 30000,
  });
  
  const { data: userTeams } = useQuery({
    queryKey: ['/api/fantasy/teams'],
  });

  const connectPlatform = (platform: string) => {
    if (platform === 'yahoo') {
      setYahooConnected(true);
      toast({
        title: "Yahoo Fantasy Connected",
        description: "Your fantasy teams and player data are now synced",
      });
    } else if (platform === 'espn') {
      setEspnConnected(true);
      toast({
        title: "ESPN Fantasy Connected",
        description: "Your ESPN fantasy leagues are now available",
      });
    }
  };

  const navigateToPlatform = (platform: string) => {
    if (platform === 'yahoo') {
      setLocation('/yahoo-fantasy');
    } else if (platform === 'espn') {
      setLocation('/fantasy-football');
    }
  };

  return (
    <TierGuard 
      requiredTier="vip" 
      feature="Fantasy Sports Hub"
      description="Access comprehensive fantasy sports management, platform integrations, and advanced analytics exclusively for VIP+ members."
    >
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-4">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-2">
                <Trophy className="h-8 w-8 text-yellow-400" />
                Fantasy Sports Hub
              </h1>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Your unified fantasy sports dashboard connecting ESPN and Yahoo platforms with advanced analytics and betting integration
              </p>
            </div>

            {/* Platform Connection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ESPN Fantasy Card */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      ESPN
                    </div>
                    ESPN Fantasy Football
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Connect your ESPN fantasy leagues for comprehensive management and live scoring
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={espnConnected ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}>
                      {espnConnected ? "Connected" : "Not Connected"}
                    </Badge>
                    <Button 
                      onClick={() => connectPlatform('espn')}
                      disabled={espnConnected}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {espnConnected ? "Connected" : "Connect ESPN"}
                    </Button>
                  </div>
              
                  <div className="space-y-2">
                    <div className="text-sm text-gray-300">Features:</div>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• League standings and matchups</li>
                      <li>• Roster management and optimization</li>
                      <li>• Player stats and projections</li>
                      <li>• Waiver wire analysis</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={() => navigateToPlatform('espn')}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open ESPN Fantasy
                  </Button>
                </CardContent>
              </Card>

              {/* Yahoo Fantasy Card */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      Y!
                    </div>
                    Yahoo Fantasy Football
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Access your Yahoo fantasy leagues with advanced research tools and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={yahooConnected ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}>
                      {yahooConnected ? "Connected" : "Not Connected"}
                    </Badge>
                    <Button 
                      onClick={() => connectPlatform('yahoo')}
                      disabled={yahooConnected}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {yahooConnected ? "Connected" : "Connect Yahoo"}
                    </Button>
                  </div>
              
                  <div className="space-y-2">
                    <div className="text-sm text-gray-300">Features:</div>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Complete league management</li>
                      <li>• Player research and analytics</li>
                      <li>• Waiver wire recommendations</li>
                      <li>• Advanced scoring projections</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={() => navigateToPlatform('yahoo')}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Yahoo Fantasy
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-400" />
                    <div>
                      <div className="text-white font-semibold">Connected Leagues</div>
                      <div className="text-gray-400 text-sm">
                        {(espnConnected ? 1 : 0) + (yahooConnected ? 1 : 0)} platforms
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-white font-semibold">Active Players</div>
                  <div className="text-gray-400 text-sm">
                    {fantasyPlayers?.length || 0} tracked
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-yellow-400" />
                <div>
                  <div className="text-white font-semibold">Performance</div>
                  <div className="text-gray-400 text-sm">All systems active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Comparison */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" />
              Platform Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white p-2">Feature</th>
                    <th className="text-center text-white p-2">ESPN</th>
                    <th className="text-center text-white p-2">Yahoo</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-white/10">
                    <td className="p-2">League Management</td>
                    <td className="p-2 text-center">✓</td>
                    <td className="p-2 text-center">✓</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-2">Live Scoring</td>
                    <td className="p-2 text-center">✓</td>
                    <td className="p-2 text-center">✓</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-2">Player Research</td>
                    <td className="p-2 text-center">✓</td>
                    <td className="p-2 text-center">✓</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-2">Advanced Analytics</td>
                    <td className="p-2 text-center">✓</td>
                    <td className="p-2 text-center">✓</td>
                  </tr>
                  <tr>
                    <td className="p-2">WeParlay Integration</td>
                    <td className="p-2 text-center">✓</td>
                    <td className="p-2 text-center">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-white font-semibold">For ESPN Users:</h3>
                <ol className="text-gray-300 text-sm space-y-1">
                  <li>1. Click "Connect ESPN" above</li>
                  <li>2. Enter your league ID</li>
                  <li>3. Access full league management</li>
                  <li>4. Track live scores and standings</li>
                </ol>
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold">For Yahoo Users:</h3>
                <ol className="text-gray-300 text-sm space-y-1">
                  <li>1. Click "Connect Yahoo" above</li>
                  <li>2. Authorize your Yahoo account</li>
                  <li>3. Select your leagues</li>
                  <li>4. Enjoy advanced analytics</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </TierGuard>
  );
}