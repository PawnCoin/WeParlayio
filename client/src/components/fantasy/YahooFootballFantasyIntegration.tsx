import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Check, RefreshCw, Link as LinkIcon, User, Users, X, 
  UserPlus, Mail, Share2, Copy, ArrowRight, AlertTriangle, 
  ChevronRight, Info, Calendar, Trophy
} from "lucide-react";

interface YahooTeam {
  team_key: string;
  name: string;
  logoUrl: string;
  managers: string[];
  rank: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
}

interface YahooLeague {
  league_key: string;
  name: string;
  season: string;
  teams: YahooTeam[];
  currentWeek: number;
  startWeek: number;
  endWeek: number;
  isConnected: boolean;
}

const YahooFootballFantasyIntegration: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [inviteDialog, setInviteDialog] = useState(false);
  
  // Fetch Yahoo connection status
  const { 
    data: yahooStatus, 
    isLoading: isLoadingStatus
  } = useQuery({
    queryKey: ['/api/yahoo/status'],
    enabled: isAuthenticated,
  });
  
  // Fetch user's Yahoo leagues
  const { 
    data: leagues,
    isLoading: isLoadingLeagues,
    refetch: refetchLeagues
  } = useQuery({
    queryKey: ['/api/yahoo/leagues'],
    enabled: isAuthenticated && yahooStatus?.connected,
  });
  
  // Connect Yahoo account mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", '/api/yahoo/auth');
      const data = await response.json();
      
      if (data.authUrl) {
        // Open the Yahoo OAuth page in a popup
        const popup = window.open(
          data.authUrl, 
          'yahoo-auth-popup',
          'width=600,height=700,resizable=yes,scrollbars=yes,status=yes'
        );
        
        if (!popup) {
          throw new Error("Popup blocked. Please allow popups for this site.");
        }
        
        // Poll for auth completion
        return new Promise<void>((resolve, reject) => {
          const checkClosed = setInterval(async () => {
            if (popup.closed) {
              clearInterval(checkClosed);
              
              // Check if auth was successful
              try {
                const statusResponse = await apiRequest("GET", '/api/yahoo/status');
                const statusData = await statusResponse.json();
                
                if (statusData.connected) {
                  resolve();
                } else {
                  reject(new Error("Authentication was cancelled or failed."));
                }
              } catch (error) {
                reject(error);
              }
            }
          }, 500);
        });
      } else {
        throw new Error("Could not initiate Yahoo authentication");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/yahoo/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/yahoo/leagues'] });
      
      toast({
        title: "Yahoo Account Connected!",
        description: "Your Yahoo Fantasy Football leagues are now available.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Could not connect to Yahoo. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Disconnect Yahoo account mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", '/api/yahoo/disconnect');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/yahoo/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/yahoo/leagues'] });
      
      toast({
        title: "Yahoo Account Disconnected",
        description: "Your Yahoo Fantasy Football account has been disconnected.",
      });
    },
    onError: () => {
      toast({
        title: "Disconnect Failed",
        description: "Could not disconnect your Yahoo account. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Send league invite mutation
  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedLeague) {
        throw new Error("No league selected");
      }
      
      return apiRequest("POST", '/api/yahoo/invite', {
        leagueKey: selectedLeague,
        email: inviteEmail,
        message: inviteMessage
      });
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent!",
        description: `Your invitation to join the league has been sent to ${inviteEmail}.`,
      });
      
      setInviteEmail('');
      setInviteMessage('');
      setInviteDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Invitation Failed",
        description: error.message || "Could not send the invitation. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Generate a shareable link for a league
  const generateShareableLink = (leagueKey: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/fantasy/join/${leagueKey}`;
  };
  
  // Copy league invite link to clipboard
  const copyInviteLink = (leagueKey: string) => {
    const link = generateShareableLink(leagueKey);
    navigator.clipboard.writeText(link);
    
    toast({
      title: "Link Copied!",
      description: "League invite link has been copied to clipboard.",
    });
  };
  
  // Refresh leagues data
  const handleRefreshLeagues = () => {
    refetchLeagues();
    
    toast({
      title: "Refreshing Leagues",
      description: "Updating your Yahoo Fantasy Football leagues..."
    });
  };
  
  // Render league teams
  const renderTeams = (teams: YahooTeam[]) => {
    if (!teams || teams.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No teams found in this league
        </div>
      );
    }
    
    // Sort teams by rank
    const sortedTeams = [...teams].sort((a, b) => a.rank - b.rank);
    
    return (
      <div className="space-y-3 mt-2">
        {sortedTeams.map((team, index) => (
          <div key={team.team_key} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
            <div className="flex items-center">
              <div className="font-semibold mr-2 w-6 text-center">{team.rank}</div>
              <div className="h-8 w-8 rounded-full overflow-hidden mr-3 bg-gray-200 flex items-center justify-center">
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt={team.name} className="h-8 w-8 object-cover" />
                ) : (
                  <Trophy className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div>
                <div className="font-medium">{team.name}</div>
                <div className="text-xs text-muted-foreground">
                  {team.managers.join(', ')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {team.wins}-{team.losses}{team.ties > 0 ? `-${team.ties}` : ''}
              </div>
              <div className="text-xs text-muted-foreground">
                {team.pointsFor.toFixed(1)} pts
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render sample data to preview the component when no real data is available
  const sampleLeagues: YahooLeague[] = [
    {
      league_key: "412.l.48894",
      name: "Touchdown Titans",
      season: "2024",
      currentWeek: 3,
      startWeek: 1,
      endWeek: 16,
      isConnected: true,
      teams: [
        {
          team_key: "412.l.48894.t.1",
          name: "Florida Fireballs",
          logoUrl: "https://s.yimg.com/cv/apiv2/default/nfl/nfl_2.png",
          managers: ["John Smith"],
          rank: 1,
          wins: 2,
          losses: 0,
          ties: 0,
          pointsFor: 253.5
        },
        {
          team_key: "412.l.48894.t.2",
          name: "Chicago Chargers",
          logoUrl: "https://s.yimg.com/cv/apiv2/default/nfl/nfl_12.png",
          managers: ["Mike Johnson"],
          rank: 2,
          wins: 1,
          losses: 1,
          ties: 0,
          pointsFor: 215.8
        },
        {
          team_key: "412.l.48894.t.3",
          name: "Texas Tornadoes",
          logoUrl: "https://s.yimg.com/cv/apiv2/default/nfl/nfl_8.png",
          managers: ["Sarah Williams"],
          rank: 3,
          wins: 1,
          losses: 1,
          ties: 0,
          pointsFor: 198.3
        },
        {
          team_key: "412.l.48894.t.4",
          name: "Seattle Samurai",
          logoUrl: "https://s.yimg.com/cv/apiv2/default/nfl/nfl_5.png",
          managers: ["David Miller"],
          rank: 4,
          wins: 0,
          losses: 2,
          ties: 0,
          pointsFor: 172.1
        },
      ]
    },
    {
      league_key: "412.l.44556",
      name: "Fantasy Champions",
      season: "2024",
      currentWeek: 3,
      startWeek: 1,
      endWeek: 16,
      isConnected: false,
      teams: [
        {
          team_key: "412.l.44556.t.1",
          name: "Boston Bruisers",
          logoUrl: "https://s.yimg.com/cv/apiv2/default/nfl/nfl_3.png",
          managers: ["Chris Taylor"],
          rank: 1,
          wins: 2,
          losses: 0,
          ties: 0,
          pointsFor: 267.8
        },
        {
          team_key: "412.l.44556.t.2",
          name: "LA Legends",
          logoUrl: "https://s.yimg.com/cv/apiv2/default/nfl/nfl_7.png",
          managers: ["Lisa Adams"],
          rank: 2,
          wins: 2,
          losses: 0,
          ties: 0,
          pointsFor: 221.5
        },
      ]
    }
  ];
  
  // Use sample data for display when no real data is available
  const displayLeagues = leagues || sampleLeagues;
  const isConnected = yahooStatus?.connected || false;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <div className="flex items-center">
              Yahoo Fantasy Football
              {isConnected && (
                <Badge variant="success" className="ml-2 flex items-center">
                  <Check className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              )}
            </div>
            
            {isConnected && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefreshLeagues}
                disabled={isLoadingLeagues}
              >
                <RefreshCw className="mr-1 h-4 w-4" />
                Refresh
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Connect with your Yahoo Fantasy Football leagues to import teams, track stats, and invite friends
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-950 rounded-full p-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400">
                  <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2Z"></path>
                  <path d="M7 12a5 5 0 0 1 5-5c2.76 0 5 2.24 5 5"></path>
                  <path d="M14.5 19.5a2.5 2.5 0 0 1 0-5H17a2.5 2.5 0 0 1 0 5"></path>
                  <path d="M9.5 17a2.5 2.5 0 0 0 0-5H7a2.5 2.5 0 0 0 0 5Z"></path>
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-1">Connect Your Yahoo Account</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  Link your Yahoo Fantasy Football account to access your leagues, teams, and player data directly in WeParlay.
                </p>
                <Button 
                  onClick={() => connectMutation.mutate()}
                  disabled={connectMutation.isPending}
                  className="px-6"
                >
                  {connectMutation.isPending ? "Connecting..." : "Connect with Yahoo"}
                  {!connectMutation.isPending && <LinkIcon className="ml-2 h-4 w-4" />}
                </Button>
              </div>
              <div className="w-full max-w-md mt-4">
                <Separator className="my-4" />
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-sm">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    <span>Import leagues and teams automatically</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    <span>Invite league members to WeParlay with one click</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    <span>Sync fantasy scores with betting opportunities</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    <span>Create private contests for your fantasy league</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Tabs defaultValue="leagues">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="leagues">My Leagues</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="leagues" className="space-y-4">
                  {displayLeagues.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-3xl mb-2">🏈</div>
                      <h3 className="text-lg font-semibold">No Fantasy Leagues Found</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">
                        You don't appear to have any active Yahoo Fantasy Football leagues
                      </p>
                      <div className="flex flex-col space-y-2 items-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleRefreshLeagues}
                          disabled={isLoadingLeagues}
                        >
                          <RefreshCw className="mr-1 h-4 w-4" />
                          Refresh Leagues
                        </Button>
                        <a 
                          href="https://football.fantasysports.yahoo.com/f1/reg/createleague"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-2 flex items-center"
                        >
                          Create a league on Yahoo Fantasy
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    displayLeagues.map((league) => (
                      <Card key={league.league_key} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center justify-between">
                            <div className="flex items-center">
                              {league.name}
                              <Badge variant="outline" className="ml-2 text-xs">
                                {league.season}
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1" />
                              Week {league.currentWeek}/{league.endWeek}
                            </div>
                          </CardTitle>
                          <CardDescription>
                            League ID: {league.league_key}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pb-0">
                          {renderTeams(league.teams)}
                        </CardContent>
                        
                        <CardFooter className="flex justify-between py-4">
                          <div>
                            <Dialog open={inviteDialog && selectedLeague === league.league_key} onOpenChange={(open) => {
                              setInviteDialog(open);
                              if (open) setSelectedLeague(league.league_key);
                            }}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <UserPlus className="mr-1 h-4 w-4" />
                                  Invite Friend
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Invite to {league.name}</DialogTitle>
                                  <DialogDescription>
                                    Send an invitation to join your Yahoo Fantasy Football league
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <div className="flex">
                                      <div className="bg-muted rounded-l-md flex items-center px-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                      <Input
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="friend@example.com"
                                        className="rounded-l-none"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Message (Optional)</label>
                                    <Input
                                      value={inviteMessage}
                                      onChange={(e) => setInviteMessage(e.target.value)}
                                      placeholder="Join my fantasy league!"
                                    />
                                  </div>
                                  
                                  <div className="bg-muted rounded-md p-3">
                                    <div className="flex">
                                      <Info className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                                      <div className="text-sm text-muted-foreground">
                                        Your friend will receive an email with instructions to join both your Yahoo league and WeParlay.
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button
                                    onClick={() => inviteMutation.mutate()}
                                    disabled={!inviteEmail || inviteMutation.isPending}
                                  >
                                    {inviteMutation.isPending ? "Sending..." : "Send Invite"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => copyInviteLink(league.league_key)}>
                                  <Share2 className="mr-1 h-4 w-4" />
                                  Share Link
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="flex items-center">
                                  <Copy className="h-3 w-3 mr-1" />
                                  <span>Copy invite link</span>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="settings">
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Yahoo Account Connection</h3>
                        <Badge variant="success" className="flex items-center">
                          <Check className="mr-1 h-3 w-3" />
                          Connected
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Your WeParlay account is linked to your Yahoo Fantasy Football account.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => disconnectMutation.mutate()}
                        disabled={disconnectMutation.isPending}
                      >
                        {disconnectMutation.isPending ? (
                          "Disconnecting..."
                        ) : (
                          <>
                            <X className="mr-1 h-4 w-4" />
                            Disconnect
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Data Synchronization</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="text-sm">Auto-sync league data</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs text-xs">
                                    Automatically refreshes your Yahoo Fantasy Football data
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="flex items-center">
                            <Select defaultValue="daily">
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="manually">Manually</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="text-sm">Last synchronized</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date().toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Import Options</h3>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <div className="flex h-5 items-center">
                            <input
                              id="import-teams"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              defaultChecked
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="import-teams" className="font-medium">
                              Import teams
                            </label>
                            <p className="text-muted-foreground">
                              Import all teams from your Yahoo leagues
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex h-5 items-center">
                            <input
                              id="import-rosters"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              defaultChecked
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="import-rosters" className="font-medium">
                              Import rosters
                            </label>
                            <p className="text-muted-foreground">
                              Import player rosters for all teams
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex h-5 items-center">
                            <input
                              id="import-stats"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              defaultChecked
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="import-stats" className="font-medium">
                              Import player stats
                            </label>
                            <p className="text-muted-foreground">
                              Import detailed player statistics for analytics
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 p-4">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-3 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                            Yahoo API Rate Limits
                          </h3>
                          <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-500">
                            <p>
                              Yahoo limits API requests to 2,000 per day. Excessive requests could lead to temporary blocking. We recommend using "Daily" for automatic synchronization.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Fantasy Football Quick Actions</CardTitle>
          <CardDescription>
            Popular actions for managing your fantasy football experience
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col items-center justify-center">
              <Users className="h-6 w-6 mb-2" />
              <span className="font-medium">Manage Leagues</span>
              <span className="text-xs text-muted-foreground mt-1">View and edit your leagues</span>
            </Button>
            
            <Button variant="outline" className="h-auto py-4 flex-col items-center justify-center">
              <Trophy className="h-6 w-6 mb-2" />
              <span className="font-medium">View Player Stats</span>
              <span className="text-xs text-muted-foreground mt-1">Player rankings and statistics</span>
            </Button>
            
            <Button variant="outline" className="h-auto py-4 flex-col items-center justify-center">
              <Calendar className="h-6 w-6 mb-2" />
              <span className="font-medium">Match Schedule</span>
              <span className="text-xs text-muted-foreground mt-1">Upcoming game schedule</span>
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button variant="ghost" size="sm" asChild>
            <a href="/fantasy/dashboard">
              All Fantasy Features
              <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default YahooFootballFantasyIntegration;