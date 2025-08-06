import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLink, Crown, Info, Maximize2, X, AlertTriangle } from "lucide-react";

export default function YahooEmbedViewer() {
  const [leagueId, setLeagueId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [embedAttempted, setEmbedAttempted] = useState(false);

  const getYahooUrl = () => {
    if (!leagueId) return 'https://football.fantasysports.yahoo.com/';
    return `https://football.fantasysports.yahoo.com/f1/${leagueId}`;
  };

  const handleEmbedAttempt = () => {
    setEmbedAttempted(true);
    setIsModalOpen(true);
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Crown className="w-5 h-5 text-purple-500" />
          Yahoo Fantasy Embed Test
        </CardTitle>
        <CardDescription className="text-gray-300">
          Test if Yahoo Fantasy can be embedded in WeParlay
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-blue-200 text-sm">
              <p className="font-medium mb-1">Embedding Test</p>
              <p>Unlike ESPN, Yahoo might allow iframe embedding. Let's test if Yahoo Fantasy can be displayed within WeParlay.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="yahooLeagueId" className="text-white">Yahoo League ID (Optional)</Label>
            <Input
              id="yahooLeagueId"
              placeholder="e.g., 123456"
              value={leagueId}
              onChange={(e) => setLeagueId(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="flex gap-2">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={handleEmbedAttempt}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Test Yahoo Embed
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl w-[95vw] h-[90vh] bg-gray-900 border-gray-700">
                <DialogHeader className="border-b border-gray-700 pb-4">
                  <DialogTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-purple-500" />
                      Yahoo Fantasy Football
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
                    Testing Yahoo Fantasy Football embedding in WeParlay
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 mt-4">
                  {embedAttempted ? (
                    <div className="h-full relative">
                      <iframe
                        src={getYahooUrl()}
                        className="w-full h-full rounded-lg border border-gray-600"
                        title="Yahoo Fantasy Football"
                        allow="fullscreen"
                        onError={() => console.log('Yahoo iframe failed to load')}
                      />
                      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 max-w-sm">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div className="text-yellow-200 text-xs">
                            <p className="font-medium">Embed Status</p>
                            <p>If you see Yahoo content below, embedding works! If blocked, we'll show a fallback.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-6 flex flex-col items-center justify-center h-full text-center">
                      <Crown className="w-16 h-16 text-purple-500 mb-4" />
                      <h3 className="text-white text-xl font-semibold mb-2">Yahoo Embedding Test</h3>
                      <p className="text-gray-300 mb-4">Click "Test Yahoo Embed" to see if Yahoo allows iframe embedding.</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={() => window.open(getYahooUrl(), '_blank')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Yahoo Directly
            </Button>
          </div>
        </div>

        <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
          <h4 className="text-green-300 font-medium mb-2">If Yahoo Embedding Works:</h4>
          <ul className="text-green-200 text-sm space-y-1 list-disc list-inside">
            <li>Users can access Yahoo Fantasy without leaving WeParlay</li>
            <li>Seamless integration between fantasy management and betting</li>
            <li>Better user retention on the WeParlay platform</li>
            <li>Enhanced user experience with unified interface</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}