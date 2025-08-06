import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Trophy, Copy, Check, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ESPNLinkCard() {
  const [leagueId, setLeagueId] = useState('');
  const [seasonYear, setSeasonYear] = useState('2025');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const getESPNUrl = () => {
    if (!leagueId) return 'https://fantasy.espn.com/football/';
    return `https://fantasy.espn.com/football/league?leagueId=${leagueId}&seasonId=${seasonYear}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getESPNUrl());
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "ESPN Fantasy link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-red-500" />
          ESPN Fantasy Quick Access
        </CardTitle>
        <CardDescription className="text-gray-300">
          Generate direct links to your ESPN Fantasy leagues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="text-orange-200 text-sm">
              <p className="font-medium mb-1">Why can't we embed ESPN?</p>
              <p>ESPN uses X-Frame-Options security headers to prevent their site from being displayed in iframes. This protects users from clickjacking attacks.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              placeholder="2025"
              value={seasonYear}
              onChange={(e) => setSeasonYear(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => window.open(getESPNUrl(), '_blank')}
            className="bg-red-600 hover:bg-red-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open ESPN Fantasy
          </Button>
          
          <Button 
            onClick={copyToClipboard}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            {copied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>

        {leagueId && (
          <div className="bg-gray-900/30 rounded-lg p-3">
            <Label className="text-white text-sm">Generated Link:</Label>
            <div className="bg-black/30 rounded p-2 mt-1">
              <code className="text-green-400 text-xs break-all">{getESPNUrl()}</code>
            </div>
          </div>
        )}

        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-2">Alternative Workflow:</h4>
          <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
            <li>Open ESPN Fantasy in a new tab using the button above</li>
            <li>Keep WeParlay open in this tab for betting and analysis</li>
            <li>Switch between tabs to manage your fantasy team and place bets</li>
            <li>Use WeParlay's analytics to inform your fantasy decisions</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}