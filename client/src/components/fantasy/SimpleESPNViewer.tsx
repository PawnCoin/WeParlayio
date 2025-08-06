import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLink, Trophy, Info, Maximize2, X } from "lucide-react";

export default function SimpleESPNViewer() {
  const [leagueId, setLeagueId] = useState('');
  const [seasonYear, setSeasonYear] = useState('2024');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getESPNUrl = () => {
    if (!leagueId) return '#';
    return `https://fantasy.espn.com/football/league?leagueId=${leagueId}&seasonId=${seasonYear}`;
  };

  return (
    <Card className="bg-white/5 border-white/10 mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-red-500" />
          ESPN Fantasy League Access
        </CardTitle>
        <CardDescription className="text-gray-300">
          ESPN doesn't offer OAuth authentication for fantasy leagues. Enter your league ID to view it directly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-blue-200 text-sm">
              <p className="font-medium mb-2">ESPN Fantasy Limitation:</p>
              <p>ESPN does not provide API access for private fantasy leagues. You can:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>View your league directly on ESPN's website</li>
                <li>Use public leagues only</li>
                <li>Manually share league information</li>
              </ul>
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
              placeholder="2024"
              value={seasonYear}
              onChange={(e) => setSeasonYear(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Maximize2 className="w-4 h-4 mr-2" />
                View ESPN in WeParlay
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl w-[95vw] h-[90vh] bg-gray-900 border-gray-700">
              <DialogHeader className="border-b border-gray-700 pb-4">
                <DialogTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-red-500" />
                    ESPN Fantasy Football
                    {leagueId && <span className="text-sm text-gray-400">- League {leagueId}</span>}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  ESPN Fantasy Football embedded in WeParlay - Stay on our site while managing your fantasy team
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 mt-4">
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6 flex flex-col items-center justify-center h-full text-center">
                  <Trophy className="w-16 h-16 text-red-500 mb-4" />
                  <h3 className="text-white text-xl font-semibold mb-2">ESPN Blocks Embedding</h3>
                  <p className="text-gray-300 mb-4">ESPN prevents their site from being displayed in frames for security reasons.</p>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => window.open(leagueId ? getESPNUrl() : 'https://fantasy.espn.com/football/', '_blank')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open ESPN in New Tab
                    </Button>
                    <p className="text-gray-400 text-sm">Opens in a new tab so you can switch back to WeParlay</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={() => window.open('https://fantasy.espn.com/football/', '_blank')}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open ESPN Directly
          </Button>
        </div>

        <div className="bg-gray-900/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">How to find your ESPN League ID:</h4>
          <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
            <li>Go to your league on ESPN Fantasy Football</li>
            <li>Look at the URL - it contains "leagueId=XXXXXXX"</li>
            <li>Copy the numbers after "leagueId=" (e.g., 123456789)</li>
            <li>Paste it above for quick access</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}