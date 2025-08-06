import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Users, Target, ExternalLink, Settings, BarChart3, TrendingUp, CheckCircle, XCircle, RefreshCw, Crown } from "lucide-react";
import { useLocation } from "wouter";
import ESPNFantasyEmbed from "@/components/ESPNFantasyEmbed";

export default function FantasySportsHub() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [yahooStatus, setYahooStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [espnStatus, setEspnStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [yahooData, setYahooData] = useState<any>(null);
  const [espnData, setEspnData] = useState<any>(null);

  // Test Real Yahoo Fantasy connection
  const testYahooConnection = async () => {
    try {
      const response = await fetch('/api/yahoo-real/test');
      const data = await response.json();
      if (data.success && data.authenticated) {
        setYahooStatus('connected');
        setYahooData(data);
      } else {
        setYahooStatus('disconnected');
      }
    } catch (error) {
      setYahooStatus('disconnected');
    }
  };

  // Test ESPN Fantasy connection
  const testEspnConnection = async () => {
    try {
      const response = await fetch('/api/espn-fantasy/league/test');
      const data = await response.json();
      if (data.success) {
        setEspnStatus('connected');
        setEspnData(data.data);
      } else {
        setEspnStatus('disconnected');
      }
    } catch (error) {
      setEspnStatus('disconnected');
    }
  };

  // Test connections on mount
  useEffect(() => {
    testYahooConnection();
    testEspnConnection();
  }, []);

  // Fetch fantasy overview data
  const { data: fantasyPlayers } = useQuery({
    queryKey: ['/api/fantasy/players'],
    refetchInterval: 30000,
  });
  
  const { data: userTeams } = useQuery({
    queryKey: ['/api/fantasy/teams'],
  });

  const connectToYahoo = () => {
    // Redirect to Real Yahoo OAuth 2.0
    window.location.href = '/api/yahoo-real/oauth/start';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
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

            {/* ESPN Fantasy League Embed */}
            <ESPNFantasyEmbed />

            {/* Platform Connection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ESPN Fantasy Card */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        ESPN
                      </div>
                      ESPN Fantasy
                    </div>
                    {getStatusIcon(espnStatus)}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Public ESPN data only - ESPN doesn't offer OAuth for fantasy leagues
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(espnStatus)}>
                      {espnStatus === 'loading' ? 'Testing...' : 
                       espnStatus === 'connected' ? 'Public data only' : 'Using fallback data'}
                    </Badge>
                    <Button 
                      onClick={testEspnConnection}
                      size="sm"
                      variant="outline"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Test
                    </Button>
                  </div>

                  <div className="bg-orange-900/30 p-3 rounded-lg border border-orange-700/50">
                    <div className="text-sm text-orange-300 space-y-1">
                      <p className="font-medium">ESPN Limitation:</p>
                      <p className="text-xs">ESPN does not provide OAuth authentication for personal fantasy leagues. Users must manually share league URLs.</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setLocation('/fantasy-football')}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Public ESPN Data
                  </Button>
                </CardContent>
              </Card>

              {/* Yahoo Fantasy Card */}
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        Y!
                      </div>
                      Yahoo Fantasy
                    </div>
                    {getStatusIcon(yahooStatus)}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Yahoo fantasy league connection with OAuth authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(yahooStatus)}>
                      {yahooStatus === 'loading' ? 'Testing...' : 
                       yahooStatus === 'connected' ? 'Connected' : 'Using fallback data'}
                    </Badge>
                    <Button 
                      onClick={testYahooConnection}
                      size="sm"
                      variant="outline"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Test
                    </Button>
                  </div>

                  {yahooStatus === 'connected' && yahooData && yahooData.data && yahooData.data.league && (
                    <div className="bg-gray-900/50 p-3 rounded-lg">
                      <div className="text-sm text-gray-300 space-y-1">
                        <p><strong>League:</strong> {yahooData.data.league.name}</p>
                        <p><strong>Teams:</strong> {yahooData.data.league.size}</p>
                        <p><strong>Week:</strong> {yahooData.data.league.currentMatchupPeriod}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button 
                      onClick={connectToYahoo}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="sm"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Connect Yahoo Account
                    </Button>
                    <Button 
                      onClick={() => window.open('/api/yahoo-fantasy', '_blank')}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Yahoo Data
                    </Button>
                  </div>
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
                      <div className="text-white font-semibold">Connected Platforms</div>
                      <div className="text-gray-400 text-sm">
                        {(espnStatus === 'connected' ? 1 : 0) + (yahooStatus === 'connected' ? 1 : 0)} of 2 active
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
  );
}