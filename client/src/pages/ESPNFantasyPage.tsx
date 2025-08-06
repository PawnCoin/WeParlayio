import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { useLocation } from "wouter";

export default function ESPNFantasyPage() {
  const [, setLocation] = useLocation();
  const [leagueId, setLeagueId] = useState('');
  const [seasonYear, setSeasonYear] = useState('2024');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getESPNUrl = () => {
    if (!leagueId) return 'https://fantasy.espn.com/football/';
    return `https://fantasy.espn.com/football/league?leagueId=${leagueId}&seasonId=${seasonYear}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/fantasy')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Fantasy Hub
              </Button>
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-red-500" />
                <h1 className="text-xl font-bold text-white">ESPN Fantasy Football</h1>
              </div>
            </div>
            <Badge variant="outline" className="border-red-500/50 text-red-400">
              Embedded in WeParlay
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!isFullscreen && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white">League Settings</CardTitle>
              <CardDescription className="text-gray-300">
                Enter your ESPN Fantasy Football league details for direct access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <Label htmlFor="leagueId" className="text-white">League ID (Optional)</Label>
                  <Input
                    id="leagueId"
                    placeholder="e.g., 123456789"
                    value={leagueId}
                    onChange={(e) => setLeagueId(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="season" className="text-white">Season</Label>
                  <Input
                    id="season"
                    placeholder="2024"
                    value={seasonYear}
                    onChange={(e) => setSeasonYear(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="w-4 h-4 mr-2" />
                      Show Controls
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4 mr-2" />
                      Fullscreen View
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => window.open(getESPNUrl(), '_blank')}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ESPN Iframe Container */}
        <Card className={`bg-white/5 border-white/10 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
          <CardContent className="p-2">
            {isFullscreen && (
              <div className="flex justify-between items-center mb-2 px-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-red-500" />
                  <span className="text-white font-medium">ESPN Fantasy Football</span>
                  {leagueId && <span className="text-gray-400 text-sm">League {leagueId}</span>}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsFullscreen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <Minimize2 className="w-4 h-4 mr-2" />
                  Exit Fullscreen
                </Button>
              </div>
            )}
            <div className={`bg-gray-800 rounded-lg border border-gray-600 ${isFullscreen ? 'h-[calc(100vh-12rem)]' : 'h-96 md:h-[32rem]'} flex flex-col items-center justify-center text-center p-8`}>
              <Trophy className="w-20 h-20 text-red-500 mb-6" />
              <h2 className="text-white text-2xl font-bold mb-4">ESPN Embedding Blocked</h2>
              <p className="text-gray-300 mb-6 max-w-md">ESPN uses security measures that prevent embedding their site in other domains. This protects users from clickjacking attacks.</p>
              
              <div className="space-y-4 w-full max-w-sm">
                <Button 
                  onClick={() => window.open(getESPNUrl(), '_blank')}
                  className="w-full bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Open ESPN Fantasy
                </Button>
                
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                  <p className="text-blue-200 text-sm">
                    <strong>Tip:</strong> Open ESPN in a new tab and switch between tabs to use both WeParlay and ESPN seamlessly.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isFullscreen && (
          <Card className="bg-blue-900/20 border-blue-700/30 mt-6">
            <CardContent className="p-4">
              <h4 className="text-blue-300 font-medium mb-2">Using ESPN Fantasy on WeParlay:</h4>
              <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
                <li>This embedded view keeps you on WeParlay while accessing ESPN</li>
                <li>Use fullscreen mode for the best experience</li>
                <li>Enter your league ID above for direct league access</li>
                <li>You may need to log into ESPN within the frame</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}