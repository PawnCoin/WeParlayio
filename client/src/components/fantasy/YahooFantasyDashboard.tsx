import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Trophy, Users, TrendingUp, Calendar, Clock, Star, Target, AlertTriangle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import YahooErrorHelper from "./YahooErrorHelper";

export default function YahooFantasyDashboard() {
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  // Check URL params for authentication status
  const urlParams = new URLSearchParams(window.location.search);
  const isJustConnected = urlParams.get('connected') === 'true';

  // Auth status query
  const { data: authStatus, refetch: refetchAuthStatus } = useQuery({
    queryKey: ['/api/yahoo-real/status'],
    refetchInterval: isJustConnected ? 2000 : 10000,
  });

  const isAuthenticated = authStatus?.authenticated === true;

  // Fetch Yahoo leagues - only when authenticated
  const { data: yahooLeagues, isLoading: leaguesLoading, error: leaguesError, refetch: refetchLeagues } = useQuery({
    queryKey: ['/api/yahoo-real/leagues'],
    enabled: isAuthenticated,
    retry: 2,
    staleTime: 30000,
  });

  // Fetch user's Yahoo teams - only when authenticated
  const { data: yahooTeams, isLoading: teamsLoading, error: teamsError, refetch: refetchTeams } = useQuery({
    queryKey: ['/api/yahoo-real/teams'],
    enabled: isAuthenticated,
    retry: 2,
    staleTime: 30000,
  });

  // Fetch Yahoo players data - only when authenticated
  const { data: yahooPlayers, isLoading: playersLoading, error: playersError, refetch: refetchPlayers } = useQuery({
    queryKey: ['/api/yahoo-real/players'],
    enabled: isAuthenticated,
    retry: 2,
    staleTime: 30000,
  });

  // Handle post-authentication data refresh
  React.useEffect(() => {
    if (isJustConnected) {
      setTimeout(() => {
        refetchAuthStatus();
        if (isAuthenticated) {
          refetchLeagues();
          refetchTeams();
          refetchPlayers();
        }
      }, 1500);
      
      // Clean URL
      window.history.replaceState({}, '', '/yahoo-fantasy');
    }
  }, [isJustConnected, isAuthenticated, refetchAuthStatus, refetchLeagues, refetchTeams, refetchPlayers]);

  const handleRefreshData = () => {
    refetchAuthStatus();
    if (isAuthenticated) {
      refetchLeagues();
      refetchTeams();
      refetchPlayers();
    }
  };

  const handleConnectYahoo = () => {
    window.location.href = '/api/yahoo-real/oauth/start';
  };

  // Show connection success message
  if (isJustConnected) {
    return (
      <div className="space-y-6">
        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Yahoo Fantasy Connected!
            </CardTitle>
            <CardDescription className="text-green-300">
              Loading your fantasy data...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-green-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Fetching your leagues, teams, and players...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-purple-500" />
            Yahoo Fantasy Dashboard
            {!isAuthenticated && (
              <Badge variant="outline" className="border-amber-500/50 text-amber-400 ml-2">
                Connect Yahoo Account
              </Badge>
            )}
            {isAuthenticated && (
              <Badge variant="outline" className="border-green-500/50 text-green-400 ml-2">
                Connected
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-gray-300 flex items-center justify-between">
            <span>Your Yahoo Fantasy leagues with WeParlay integration</span>
            <Button 
              onClick={handleRefreshData}
              size="sm"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAuthenticated && (
            <div className="mb-6 space-y-4">
              <YahooErrorHelper />
              <Card className="bg-purple-900/20 border-purple-700/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Crown className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-purple-300 font-medium mb-1">Connect Your Yahoo Fantasy Account</h4>
                      <p className="text-purple-200 text-sm mb-3">
                        After enabling Fantasy Sports API in Yahoo Developer Console, connect your account to view real fantasy data.
                      </p>
                      <Button 
                        onClick={handleConnectYahoo}
                        className="bg-purple-600 hover:bg-purple-700 w-full"
                        size="lg"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Try Connection (After Yahoo Fix)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="leagues" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10">
              <TabsTrigger value="leagues" className="text-white data-[state=active]:bg-purple-600">
                <Trophy className="w-4 h-4 mr-2" />
                Leagues
              </TabsTrigger>
              <TabsTrigger value="teams" className="text-white data-[state=active]:bg-purple-600">
                <Users className="w-4 h-4 mr-2" />
                Teams
              </TabsTrigger>
              <TabsTrigger value="players" className="text-white data-[state=active]:bg-purple-600">
                <Star className="w-4 h-4 mr-2" />
                Players
              </TabsTrigger>
              <TabsTrigger value="matchups" className="text-white data-[state=active]:bg-purple-600">
                <Target className="w-4 h-4 mr-2" />
                Matchups
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leagues" className="space-y-4 mt-6">
              {leaguesLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="animate-pulse space-y-3">
                          <div className="h-6 bg-white/10 rounded w-3/4"></div>
                          <div className="h-4 bg-white/5 rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {isAuthenticated && yahooLeagues?.leagues && yahooLeagues.leagues.length > 0 ? (
                    yahooLeagues.leagues.map((league: any) => (
                      <Card key={league.league_key} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <h3 className="text-white font-semibold text-lg">{league.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-300">
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {league.num_teams} teams
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Week {league.current_week}
                                </div>
                                <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                                  {league.season || '2025'} Season
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              onClick={() => setSelectedLeague(league.league_key)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : !isAuthenticated ? (
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-6 text-center">
                        <Crown className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                        <h3 className="text-white font-semibold mb-2">Connect Yahoo to View Leagues</h3>
                        <p className="text-gray-300 mb-4">Your Yahoo Fantasy leagues will appear here after authentication</p>
                        <Button onClick={handleConnectYahoo} className="bg-purple-600 hover:bg-purple-700">
                          Connect Yahoo Account
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-6 text-center">
                        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-white font-semibold mb-2">No Leagues Found</h3>
                        <p className="text-gray-300">No fantasy leagues found in your Yahoo account</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="teams" className="space-y-4 mt-6">
              {teamsLoading ? (
                <div className="grid gap-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="animate-pulse space-y-3">
                          <div className="h-6 bg-white/10 rounded w-3/4"></div>
                          <div className="h-4 bg-white/5 rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {isAuthenticated && yahooTeams?.teams && yahooTeams.teams.length > 0 ? (
                    yahooTeams.teams.map((team: any) => (
                      <Card key={team.team_key} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <h3 className="text-white font-semibold text-lg">{team.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-300">
                                <div className="flex items-center gap-1">
                                  <Trophy className="w-4 h-4" />
                                  {team.wins || 0}-{team.losses || 0}
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4" />
                                  {team.points_for || 0} PF
                                </div>
                                <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                                  Rank #{team.rank || 1}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : !isAuthenticated ? (
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-6 text-center">
                        <Users className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                        <h3 className="text-white font-semibold mb-2">Connect Yahoo to View Teams</h3>
                        <p className="text-gray-300 mb-4">Your fantasy teams will appear here after authentication</p>
                        <Button onClick={handleConnectYahoo} className="bg-purple-600 hover:bg-purple-700">
                          Connect Yahoo Account
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-6 text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-white font-semibold mb-2">No Teams Found</h3>
                        <p className="text-gray-300">No fantasy teams found in your Yahoo account</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="players" className="space-y-4 mt-6">
              {playersLoading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="animate-pulse space-y-3">
                          <div className="h-6 bg-white/10 rounded w-3/4"></div>
                          <div className="h-4 bg-white/5 rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {isAuthenticated && yahooPlayers?.players && yahooPlayers.players.length > 0 ? (
                    yahooPlayers.players.slice(0, 10).map((player: any) => (
                      <Card key={player.player_key} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <h3 className="text-white font-semibold">{player.name?.full || 'Unknown Player'}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-300">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4" />
                                  {player.display_position || 'N/A'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Target className="w-4 h-4" />
                                  {player.editorial_team_abbr || 'FA'}
                                </div>
                                <Badge variant="outline" className="border-green-500/50 text-green-400">
                                  {player.fantasy_points || 0} pts
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : !isAuthenticated ? (
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-6 text-center">
                        <Star className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                        <h3 className="text-white font-semibold mb-2">Connect Yahoo to View Players</h3>
                        <p className="text-gray-300 mb-4">Your fantasy players will appear here after authentication</p>
                        <Button onClick={handleConnectYahoo} className="bg-purple-600 hover:bg-purple-700">
                          Connect Yahoo Account
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-6 text-center">
                        <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-white font-semibold mb-2">No Players Found</h3>
                        <p className="text-gray-300">No fantasy players found in your Yahoo account</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="matchups" className="space-y-4 mt-6">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <Target className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Weekly Matchups</h3>
                  <p className="text-gray-300">Matchup data will be available with full Yahoo integration</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}