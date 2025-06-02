import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Users, Target, TrendingUp, Calendar } from 'lucide-react';

interface FantasyLeague {
  league_key: string;
  league_id: string;
  name: string;
  logo_url?: string;
  num_teams: number;
  season: string;
  start_date: string;
  end_date: string;
  is_finished: boolean;
}

interface FantasyTeam {
  team_key: string;
  team_id: string;
  name: string;
  logo_url?: string;
  managers: Array<{
    manager_id: string;
    nickname: string;
    email: string;
  }>;
  wins: number;
  losses: number;
  ties: number;
  points_for: number;
  points_against: number;
}

interface FantasyPlayer {
  player_key: string;
  player_id: string;
  name: {
    full: string;
    first: string;
    last: string;
  };
  position_type: string;
  display_position: string;
  team_abbr: string;
  team_name: string;
  bye_weeks: { week: string }[];
  projected_points?: number;
  actual_points?: number;
  ownership_percentage?: number;
  status?: string;
}

const YahooFantasyFootballDisplay: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  // Check Yahoo connection status
  const { data: yahooStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/yahoo/status'],
    retry: false,
  });

  // Fetch user's fantasy leagues
  const { data: leagues, isLoading: leaguesLoading } = useQuery({
    queryKey: ['/api/yahoo/leagues'],
    enabled: yahooStatus?.connected,
    retry: false,
  });

  // Fetch league standings
  const { data: standings, isLoading: standingsLoading } = useQuery({
    queryKey: ['/api/yahoo/standings', selectedLeague],
    enabled: !!selectedLeague && yahooStatus?.connected,
    retry: false,
  });

  // Fetch team roster
  const { data: roster, isLoading: rosterLoading } = useQuery({
    queryKey: ['/api/yahoo/roster', selectedLeague, selectedTeam],
    enabled: !!selectedLeague && !!selectedTeam && yahooStatus?.connected,
    retry: false,
  });

  // Yahoo login mutation
  const loginMutation = useMutation({
    mutationFn: async () => {
      window.location.href = '/api/yahoo/login';
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: "Failed to start Yahoo login process",
        variant: "destructive",
      });
    },
  });

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!yahooStatus?.connected) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              Y!
            </div>
            Connect Yahoo Fantasy Football
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Connect your Yahoo Fantasy Football account to view your leagues, teams, and players.
          </p>
          <Button 
            onClick={() => loginMutation.mutate()}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Connecting...' : 'Connect Yahoo Fantasy'}
          </Button>
          {yahooStatus?.error && (
            <p className="text-sm text-red-600">{yahooStatus.error}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            Y!
          </div>
          <div>
            <h1 className="text-2xl font-bold">Yahoo Fantasy Football</h1>
            <p className="text-gray-600">Connected and synced</p>
          </div>
        </div>
        <Badge variant="default" className="bg-green-600">
          Connected
        </Badge>
      </div>

      {/* Leagues Selection */}
      {leagues && leagues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Your Fantasy Leagues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {leagues.map((league: FantasyLeague) => (
                <div 
                  key={league.league_key}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedLeague === league.league_key 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedLeague(league.league_key)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{league.name}</h3>
                      <p className="text-sm text-gray-600">
                        {league.num_teams} teams • {league.season} season
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={league.is_finished ? "secondary" : "default"}>
                        {league.is_finished ? 'Finished' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* League Details */}
      {selectedLeague && (
        <Tabs defaultValue="standings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="myteam">My Team</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="matchups">Matchups</TabsTrigger>
          </TabsList>

          {/* Standings Tab */}
          <TabsContent value="standings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  League Standings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {standingsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : standings && standings.length > 0 ? (
                  <div className="space-y-2">
                    {standings.map((team: FantasyTeam, index: number) => (
                      <div 
                        key={team.team_key}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedTeam === team.team_key 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTeam(team.team_key)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">{team.name}</h4>
                              <p className="text-sm text-gray-600">
                                {team.managers?.[0]?.nickname || 'Manager'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{team.wins}-{team.losses}-{team.ties}</p>
                            <p className="text-sm text-gray-600">
                              {team.points_for?.toFixed(1)} pts
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No standings data available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Team Tab */}
          <TabsContent value="myteam">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Team Roster
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedTeam ? (
                  <p className="text-center text-gray-500 py-8">
                    Select a team from standings to view roster
                  </p>
                ) : rosterLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : roster && roster.length > 0 ? (
                  <div className="space-y-3">
                    {['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].map(position => {
                      const positionPlayers = roster.filter((player: FantasyPlayer) => 
                        player.display_position === position
                      );
                      
                      return (
                        <div key={position} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2 text-purple-600">{position}</h4>
                          {positionPlayers.length > 0 ? (
                            <div className="space-y-2">
                              {positionPlayers.map((player: FantasyPlayer) => (
                                <div key={player.player_key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <p className="font-medium">{player.name.full}</p>
                                    <p className="text-sm text-gray-600">
                                      {player.team_abbr} • {player.display_position}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    {player.projected_points && (
                                      <p className="text-sm font-medium">
                                        {player.projected_points.toFixed(1)} pts
                                      </p>
                                    )}
                                    {player.status && (
                                      <Badge variant="secondary" className="text-xs">
                                        {player.status}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No players at this position</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No roster data available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Available Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Player search and waiver wire coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matchups Tab */}
          <TabsContent value="matchups">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Weekly Matchups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Matchup details coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {leaguesLoading && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
          </CardContent>
        </Card>
      )}

      {leagues && leagues.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No fantasy leagues found for this account.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default YahooFantasyFootballDisplay;