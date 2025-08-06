import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Eye, Users, Trophy } from "lucide-react";

export default function ESPNLeagueViewer() {
  const [leagueId, setLeagueId] = useState('');
  const [seasonYear, setSeasonYear] = useState('2024');

  const getESPNUrl = () => {
    if (!leagueId) return '#';
    return `https://fantasy.espn.com/football/league?leagueId=${leagueId}&seasonId=${seasonYear}`;
  };

  return (
    <Card className="bg-white/5 border-white/10 mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          ESPN Fantasy League Viewer
        </CardTitle>
        <CardDescription className="text-gray-300">
          Enter your ESPN Fantasy Football League ID to view it directly here
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="leagueId" className="text-white">League ID</Label>
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

        {leagueId && (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => window.open(getESPNUrl(), '_blank')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View League on ESPN
            </Button>

            <div className="bg-white/5 rounded-lg p-1">
              <iframe
                src={getESPNUrl()}
                className="w-full h-96 rounded-lg border-0"
                title="ESPN Fantasy League"
                allow="fullscreen"
              />
            </div>
            <p className="text-gray-400 text-xs">
              Note: Some ESPN features may require you to be logged into ESPN
            </p>
          </div>
        )}

        <Card className="bg-blue-900/20 border-blue-700/30">
          <CardContent className="p-4">
            <h4 className="text-blue-300 font-medium mb-2">How to find your ESPN League ID:</h4>
            <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
              <li>Go to your league on ESPN Fantasy Football</li>
              <li>Look at the URL - it contains "leagueId=XXXXXXX"</li>
              <li>Copy the numbers after "leagueId=" (e.g., 123456789)</li>
              <li>Paste it above to view your league here</li>
            </ol>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}