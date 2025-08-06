import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Trophy, Users, TrendingUp, Calendar, Clock, Star, Target, ArrowUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface YahooLeague {
  league_key: string;
  name: string;
  league_id: string;
  season: string;
  num_teams: number;
  current_week: number;
  start_week: number;
  end_week: number;
  is_finished: boolean;
}

interface YahooTeam {
  team_key: string;
  team_id: string;
  name: string;
  managers: Array<{
    nickname: string;
    email: string;
  }>;
  wins: number;
  losses: number;
  ties: number;
  percentage: number;
  points_for: number;
  points_against: number;
  rank: number;
}

interface YahooPlayer {
  player_key: string;
  player_id: string;
  name: {
    full: string;
    first: string;
    last: string;
  };
  editorial_team_abbr: string;
  display_position: string;
  position_type: string;
  bye_weeks: number[];
  image_url: string;
  is_undroppable: boolean;
  ownership: {
    ownership_type: string;
    owner_team_key?: string;
    owner_team_name?: string;
  };
  percent_owned: number;
  fantasy_points: number;
  projected_points: number;
}

export default function YahooFantasyDashboard() {
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  // Fetch Yahoo leagues
  const { data: leagues, isLoading: leaguesLoading } = useQuery({
    queryKey: ['/api/yahoo-real/leagues'],
    enabled: true,
  });

  // Fetch league details when a league is selected
  const { data: leagueDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['/api/yahoo-real/leagues', selectedLeague],
    enabled: !!selectedLeague,
  });

  const mockLeagues: YahooLeague[] = [
    {
      league_key: "nfl.l.123456",
      name: "WeParlay Champions League",
      league_id: "123456",
      season: "2025",
      num_teams: 12,
      current_week: 8,
      start_week: 1,
      end_week: 17,
      is_finished: false
    },
    {
      league_key: "nfl.l.789012",
      name: "Elite Fantasy Squad",
      league_id: "789012", 
      season: "2025",
      num_teams: 10,
      current_week: 8,
      start_week: 1,
      end_week: 17,
      is_finished: false
    }
  ];

  const mockTeams: YahooTeam[] = [
    {
      team_key: "nfl.l.123456.t.1",
      team_id: "1",
      name: "WeParlay Warriors",
      managers: [{ nickname: "FantasyPro", email: "user@example.com" }],
      wins: 6,
      losses: 2,
      ties: 0,
      percentage: 0.750,
      points_for: 1245.6,
      points_against: 1089.2,
      rank: 1
    },
    {
      team_key: "nfl.l.123456.t.2", 
      team_id: "2",
      name: "Betting Legends",
      managers: [{ nickname: "ChampionBetter", email: "user2@example.com" }],
      wins: 5,
      losses: 3,
      ties: 0,
      percentage: 0.625,
      points_for: 1189.4,
      points_against: 1156.8,
      rank: 2
    }
  ];

  const mockPlayers: YahooPlayer[] = [
    {
      player_key: "nfl.p.12345",
      player_id: "12345",
      name: { full: "Josh Allen", first: "Josh", last: "Allen" },
      editorial_team_abbr: "BUF",
      display_position: "QB",
      position_type: "O",
      bye_weeks: [12],
      image_url: "https://s.yimg.com/iu/api/res/1.2/placeholder.jpg",
      is_undroppable: true,
      ownership: { ownership_type: "team", owner_team_key: "nfl.l.123456.t.1", owner_team_name: "WeParlay Warriors" },
      percent_owned: 98.5,
      fantasy_points: 189.6,
      projected_points: 22.4
    },
    {
      player_key: "nfl.p.67890",
      player_id: "67890", 
      name: { full: "Christian McCaffrey", first: "Christian", last: "McCaffrey" },
      editorial_team_abbr: "SF",
      display_position: "RB",
      position_type: "O",
      bye_weeks: [9],
      image_url: "https://s.yimg.com/iu/api/res/1.2/placeholder.jpg",
      is_undroppable: true,
      ownership: { ownership_type: "team", owner_team_key: "nfl.l.123456.t.1", owner_team_name: "WeParlay Warriors" },
      percent_owned: 99.2,
      fantasy_points: 156.8,
      projected_points: 18.9
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-purple-500" />
            Yahoo Fantasy Dashboard
          </CardTitle>
          <CardDescription className="text-gray-300">
            Your Yahoo Fantasy leagues with WeParlay integration
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <div className="grid gap-4">
                {mockLeagues.map((league) => (
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
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="teams" className="space-y-4 mt-6">
              <div className="grid gap-4">
                {mockTeams.map((team, index) => (
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
            </TabsContent>

            <TabsContent value="players" className="space-y-4 mt-6">
              <div className="grid gap-4">
                {mockPlayers.map((player) => (
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
                          <div className="text-xl font-bold text-white">{player.fantasy_points}</div>
                          <div className="text-sm text-gray-400">Points</div>
                          <div className="text-sm text-green-400">Proj: {player.projected_points}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="matchups" className="space-y-4 mt-6">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-semibold mb-2">Matchups Coming Soon</h3>
                  <p className="text-gray-300 mb-4">
                    Weekly matchup data will be displayed here when connected to your Yahoo account
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Connect Yahoo Account
                  </Button>
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
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}