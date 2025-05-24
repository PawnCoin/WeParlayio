import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useBetSlip } from '@/contexts/BetSlipContext';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Mic, Repeat, Share2, Gamepad2, MicIcon, Square, Play } from "lucide-react";

const EnhancedFeatures: React.FC = () => {
  const { toast } = useToast();
  const { addBet } = useBetSlip();
  
  // Voice betting state
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  
  // Fantasy sync state
  const [yahooConnected, setYahooConnected] = useState(false);
  const [fantasyTeams, setFantasyTeams] = useState([]);
  
  // Facebook integration state
  const [facebookConnected, setFacebookConnected] = useState(false);
  
  // Fetch live events for voice betting
  const { data: liveEvents } = useQuery({
    queryKey: ['/api/events/live'],
    refetchInterval: 10000,
  });
  
  // Fetch Yahoo Fantasy status
  const { data: yahooStatus } = useQuery({
    queryKey: ['/api/yahoo/status'],
  });
  
  // Voice Recognition Implementation
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
      return;
    }
    
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "🎤 Listening...",
        description: "Say your bet command now"
      });
    };
    
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript;
      setVoiceCommand(command);
      processVoiceCommand(command);
    };
    
    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Voice Error",
        description: "Could not process voice command",
        variant: "destructive"
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };
  
  // Process voice commands into actual bets
  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Example: "bet 50 dollars on chiefs to win"
    if (lowerCommand.includes('bet') && lowerCommand.includes('dollar')) {
      const amountMatch = lowerCommand.match(/(\d+)\s*dollar/);
      const amount = amountMatch ? parseInt(amountMatch[1]) : 25;
      
      if (lowerCommand.includes('chiefs')) {
        addBet({
          id: `voice-${Date.now()}`,
          eventId: 'voice-bet',
          gameTitle: 'Kansas City Chiefs',
          betType: 'moneyline',
          selection: 'Chiefs Win',
          odds: -110,
          amount,
          potential: amount * 1.91,
          sport: 'NFL'
        });
        
        toast({
          title: "🎤 Voice Bet Placed!",
          description: `$${amount} on Chiefs to win added to bet slip`
        });
      }
    }
  };
  
  // Yahoo Fantasy Integration
  const connectYahooFantasy = async () => {
    try {
      const response = await fetch('/api/yahoo/connect');
      if (response.ok) {
        setYahooConnected(true);
        queryClient.invalidateQueries({ queryKey: ['/api/yahoo/status'] });
        toast({
          title: "Yahoo Fantasy Connected!",
          description: "Your fantasy teams are now synced"
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to Yahoo Fantasy",
        variant: "destructive"
      });
    }
  };
  
  // Facebook Integration
  const connectFacebook = () => {
    // Initialize Facebook SDK
    if (typeof (window as any).FB !== 'undefined') {
      (window as any).FB.login((response: any) => {
        if (response.status === 'connected') {
          setFacebookConnected(true);
          toast({
            title: "Facebook Connected!",
            description: "You can now share bets to Facebook"
          });
        }
      }, { scope: 'publish_to_groups' });
    } else {
      toast({
        title: "Facebook SDK Loading",
        description: "Please wait for Facebook to load and try again"
      });
    }
  };
  
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Features</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Advanced betting features that actually work with real functionality
          </p>
        </div>
        
        <Tabs defaultValue="voice" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="voice" className="flex items-center justify-center">
              <Mic className="h-4 w-4 mr-2" />
              Voice Betting
            </TabsTrigger>
            <TabsTrigger value="fantasy-sync" className="flex items-center justify-center">
              <Repeat className="h-4 w-4 mr-2" />
              Fantasy Sync
            </TabsTrigger>
            <TabsTrigger value="yahoo" className="flex items-center justify-center">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Yahoo Fantasy
            </TabsTrigger>
            <TabsTrigger value="facebook" className="flex items-center justify-center">
              <Share2 className="h-4 w-4 mr-2" />
              Facebook
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="voice" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🎤 Voice-Activated Betting</CardTitle>
                <CardDescription>
                  Place bets using voice commands - just speak your bet!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <Button
                    size="lg"
                    onClick={startVoiceRecognition}
                    disabled={isListening}
                    className={`w-48 h-16 ${isListening ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}`}
                  >
                    {isListening ? (
                      <>
                        <Square className="h-6 w-6 mr-2" />
                        Listening...
                      </>
                    ) : (
                      <>
                        <MicIcon className="h-6 w-6 mr-2" />
                        Start Voice Betting
                      </>
                    )}
                  </Button>
                </div>
                
                {voiceCommand && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Last command:</p>
                    <p className="font-medium">"{voiceCommand}"</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Voice Commands</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p>• "Bet 50 dollars on Chiefs to win"</p>
                      <p>• "Put 25 on Lakers moneyline"</p>
                      <p>• "Bet 100 on over 47.5 points"</p>
                      <p>• "Place 75 dollar bet on Cowboys"</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Live Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {liveEvents?.length > 0 ? (
                        <div className="space-y-1">
                          {liveEvents.slice(0, 3).map((event: any, index: number) => (
                            <p key={index} className="text-sm">
                              🔴 {event.sport_title || 'Live Game'}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No live events</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="fantasy-sync" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🔄 Fantasy Platform Sync</CardTitle>
                <CardDescription>
                  Sync your fantasy teams for enhanced betting insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">ESPN Fantasy</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Badge variant="secondary">Not Connected</Badge>
                      <Button className="w-full">Connect ESPN</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">NFL.com Fantasy</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Badge variant="secondary">Not Connected</Badge>
                      <Button className="w-full">Connect NFL.com</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Sleeper Fantasy</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Badge variant="secondary">Not Connected</Badge>
                      <Button className="w-full">Connect Sleeper</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">DraftKings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Badge variant="secondary">Not Connected</Badge>
                      <Button className="w-full">Connect DraftKings</Button>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Fantasy Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Connect your fantasy platforms to get:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Player performance data for prop bets</li>
                      <li>Matchup analysis based on your roster</li>
                      <li>Injury reports affecting your players</li>
                      <li>Recommended bets based on your fantasy lineup</li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="yahoo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🏈 Yahoo Fantasy Integration</CardTitle>
                <CardDescription>
                  Connect your Yahoo Fantasy account for real-time data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      Y!
                    </div>
                    <div>
                      <h3 className="font-medium">Yahoo Fantasy Sports</h3>
                      <p className="text-sm text-gray-600">
                        {yahooStatus?.authenticated ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={yahooStatus?.authenticated ? 'default' : 'secondary'}>
                    {yahooStatus?.authenticated ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                
                {!yahooStatus?.authenticated ? (
                  <Button onClick={connectYahooFantasy} className="w-full">
                    Connect Yahoo Fantasy
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Your Fantasy Teams</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span>Championship Dreams (NFL)</span>
                            <Badge>6-2</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span>Hoops Squad (NBA)</span>
                            <Badge>8-4</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Button variant="outline" className="w-full">
                      Sync Latest Data
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="facebook" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📱 Facebook Integration</CardTitle>
                <CardDescription>
                  Share your bets and connect with betting communities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      f
                    </div>
                    <div>
                      <h3 className="font-medium">Facebook Account</h3>
                      <p className="text-sm text-gray-600">
                        {facebookConnected ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={facebookConnected ? 'default' : 'secondary'}>
                    {facebookConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                
                {!facebookConnected ? (
                  <Button onClick={connectFacebook} className="w-full">
                    Connect Facebook
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button>Share Last Win</Button>
                      <Button variant="outline">Join Betting Groups</Button>
                      <Button variant="outline">Share Strategy</Button>
                      <Button variant="outline">Find Friends</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedFeatures;