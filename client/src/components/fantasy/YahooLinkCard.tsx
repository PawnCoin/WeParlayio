import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function YahooLinkCard() {
  const [leagueId, setLeagueId] = useState('');
  const [season, setSeason] = useState('2025');
  const { toast } = useToast();

  const handleOpenYahoo = () => {
    if (leagueId) {
      const yahooUrl = `https://football.fantasysports.yahoo.com/f1/${leagueId}`;
      window.open(yahooUrl, '_blank');
    } else {
      // Open Yahoo Fantasy main page
      window.open('https://football.fantasysports.yahoo.com/', '_blank');
    }
  };

  const handleCopyLink = () => {
    if (leagueId) {
      const yahooUrl = `https://football.fantasysports.yahoo.com/f1/${leagueId}`;
      navigator.clipboard.writeText(yahooUrl);
      toast({
        title: "Link Copied",
        description: "Yahoo Fantasy league link copied to clipboard",
      });
    }
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            Y!
          </div>
          Yahoo Fantasy Quick Access
        </CardTitle>
        <CardDescription className="text-gray-300">
          Generate direct links to your Yahoo Fantasy leagues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Banner */}
        <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-700/50 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-300 space-y-1">
            <p className="font-medium">Yahoo Fantasy Integration:</p>
            <p className="text-xs">Yahoo provides OAuth authentication for fantasy leagues. Connect your account for full access.</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="yahoo-league-id" className="text-sm text-gray-300">
              League ID (Optional)
            </label>
            <Input
              id="yahoo-league-id"
              placeholder="e.g., 123456789"
              value={leagueId}
              onChange={(e) => setLeagueId(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="yahoo-season" className="text-sm text-gray-300">
              Season
            </label>
            <Input
              id="yahoo-season"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleOpenYahoo}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Yahoo Fantasy
          </Button>
          <Button 
            onClick={handleCopyLink}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            disabled={!leagueId}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>

        {/* Alternative Workflow */}
        <div className="space-y-3">
          <h4 className="text-white font-medium">Alternative Workflow:</h4>
          <div className="space-y-2 text-sm text-gray-300">
            <p>1. Open Yahoo Fantasy in a new tab using the button above</p>
            <p>2. Keep WeParlay open in this tab for betting and analysis</p>
            <p>3. Switch between tabs to manage your fantasy team and place bets</p>
            <p>4. Use WeParlay's analytics to inform your fantasy decisions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}