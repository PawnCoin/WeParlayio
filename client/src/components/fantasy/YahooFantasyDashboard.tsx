import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Trophy, Users, TrendingUp, Calendar, Clock, Star, Target, AlertTriangle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function YahooFantasyDashboard() {
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  // Fetch Yahoo leagues - use real data when available
  const { data: yahooLeagues, isLoading: leaguesLoading, error: leaguesError, refetch: refetchLeagues } = useQuery({
    queryKey: ['/api/yahoo-real/leagues'],
    enabled: true,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });

  // Fetch user's Yahoo teams
  const { data: yahooTeams, isLoading: teamsLoading, error: teamsError, refetch: refetchTeams } = useQuery({
    queryKey: ['/api/yahoo-real/teams'],
    enabled: true,
    retry: 1,
    staleTime: 30000,
  });

  // Fetch Yahoo players data
  const { data: yahooPlayers, isLoading: playersLoading, error: playersError, refetch: refetchPlayers } = useQuery({
    queryKey: ['/api/yahoo-real/players'],
    enabled: true,
    retry: 1,
    staleTime: 30000,
  });

  // Auth check query
  const { data: authCheck, error: authError } = useQuery({
    queryKey: ['/api/yahoo-real/test'],
    enabled: true,
    retry: 1,
  });

  const isAuthenticated = authCheck?.success === true;
  const hasAuthError = authError || authCheck?.success === false;

  // Mock data for demonstration when no real data available
  const mockLeagues = [
    {
      league_key: "nfl.l.demo1",
      name: "Demo League - Connect Yahoo for Real Data",
      league_id: "demo1",
      season: "2025",
      num_teams: 12,
      current_week: 8,
      start_week: 1,
      end_week: 17,
      is_finished: false
    }
  ];

  const mockTeams = [
    {
      team_key: "demo.t.1",
      team_id: "1",
      name: "Connect Yahoo Account",
      managers: [{ nickname: "YourTeam", email: "demo@example.com" }],
      wins: 0,
      losses: 0,
      ties: 0,
      percentage: 0,
      points_for: 0,
      points_against: 0,
      rank: 1
    }
  ];

  const mockPlayers = [
    {
      player_key: "demo.p.1",
      player_id: "1",
      name: { full: "Connect Yahoo to View Players", first: "Connect", last: "Yahoo" },
      editorial_team_abbr: "NYA",
      display_position: "QB",
      position_type: "O",
      bye_weeks: [],
      image_url: "",
      is_undroppable: false,
      ownership: { ownership_type: "free_agents" },
      percent_owned: 0,
      fantasy_points: 0,
      projected_points: 0
    }
  ];

  const handleRefreshData = () => {
    refetchLeagues();
    refetchTeams();
    refetchPlayers();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-purple-500" />
            Yahoo Fantasy Dashboard
            {hasAuthError && (
              <Badge variant="outline" className="border-red-500/50 text-red-400 ml-2">
                Authentication Required
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
          {hasAuthError && (
            <div className="mb-6">
              <Card className="bg-amber-900/20 border-amber-700/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-amber-300 font-medium mb-1">Yahoo Authentication Required</h4>
                      <p className="text-amber-200 text-sm mb-3">
                        Connect your Yahoo account to view your real fantasy leagues, teams, and player data.
                      </p>
                      <Button 
                        onClick={() => window.open('/api/yahoo-real/auth', '_blank')}
                        className="bg-purple-600 hover:bg-purple-700"
                        size="sm"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Connect Yahoo Account
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
                  {(yahooLeagues?.leagues || mockLeagues).map((league) => (
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
                                Week {league.current_week} of {league.end_week}
                              </div>
                              <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                                {league.season} Season
                              </Badge>
                            </div>
                          </div>
                          <Button 
                            onClick={() => setSelectedLeague(league.league_key)}
                            className="bg-purple-600 hover:bg-purple-700"
                            disabled={!isAuthenticated && league.league_key.includes('demo')}
                          >
                            {!isAuthenticated && league.league_key.includes('demo') ? 'Demo Data' : 'View Details'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                  {(yahooTeams?.teams || mockTeams).map((team, index) => (
                    <Card key={team.team_key} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                                #{team.rank}
                              </Badge>
                              <h3 className="text-white font-semibold">{team.name}</h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-300">
                              <span>Record: {team.wins}-{team.losses}-{team.ties}</span>
                              <span>Points For: {team.points_for}</span>
                              <span>Points Against: {team.points_against}</span>
                            </div>
                            <p className="text-gray-400 text-sm">Manager: {team.managers[0]?.nickname}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">{(team.percentage * 100).toFixed(1)}%</div>
                            <div className="text-sm text-gray-400">Win Rate</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                  {(yahooPlayers?.players || mockPlayers).map((player) => (
                    <Card key={player.player_key} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                              <span className="text-purple-400 font-bold">{player.display_position}</span>
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-white font-semibold">{player.name.full}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-300">
                                <span>{player.editorial_team_abbr}</span>
                                <span>•</span>
                                <span>{player.display_position}</span>
                                {player.is_undroppable && (
                                  <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">
                                    Undroppable
                                  </Badge>
                                )}
                              </div>
                              {player.ownership.owner_team_name && (
                                <p className="text-purple-400 text-sm">Owned by: {player.ownership.owner_team_name}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="text-xl font-bold text-white">{player.fantasy_points || 0}</div>
                            <div className="text-sm text-gray-400">Points</div>
                            <div className="text-sm text-green-400">Proj: {player.projected_points || 0}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="matchups" className="space-y-4 mt-6">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-semibold mb-2">
                    {isAuthenticated ? 'Matchups Coming Soon' : 'Connect Yahoo for Matchups'}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {isAuthenticated 
                      ? 'Weekly matchup data will be displayed here when connected to your Yahoo account'
                      : 'Connect your Yahoo account to view weekly matchups and head-to-head comparisons'
                    }
                  </p>
                  {!isAuthenticated && (
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Crown className="w-4 h-4 mr-2" />
                      Connect Yahoo Account
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-purple-900/20 border-purple-700/30">
        <CardContent className="p-4">
          <h4 className="text-purple-300 font-medium mb-2">Yahoo Fantasy + WeParlay Integration:</h4>
          <ul className="text-purple-200 text-sm space-y-1 list-disc list-inside">
            <li>View all your Yahoo Fantasy leagues in one unified dashboard</li>
            <li>Analyze player performance data to inform your WeParlay bets</li>
            <li>Track team standings and matchups without leaving WeParlay</li>
            <li>Use fantasy insights to make smarter sports betting decisions</li>
            <li>Real-time data updates when connected to your Yahoo account</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}