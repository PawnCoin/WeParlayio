import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, Target, TrendingUp, Star, Clock, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface FantasyLeague {
  id: string;
  name: string;
  size: number;
  currentMatchupPeriod: number;
  teams: FantasyTeam[];
}

interface FantasyTeam {
  id: number;
  name: string;
  owner: string;
  record: {
    wins: number;
    losses: number;
    ties: number;
    pointsFor: number;
    pointsAgainst: number;
  };
  currentScore: number;
  currentProjectedScore: number;
}

interface FantasyPlayer {
  id: number;
  name: string;
  position: string;
  team: string;
  projectedPoints: number;
  actualPoints: number;
  percentOwned: number;
  isActive: boolean;
}

interface Matchup {
  id: number;
  week: number;
  homeTeam: {
    id: number;
    score: number;
    projectedScore: number;
  };
  awayTeam: {
    id: number;
    score: number;
    projectedScore: number;
  };
  winner: string;
}

export default function FantasyFootball() {
  const [leagueId, setLeagueId] = useState('123456789');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [currentWeek, setCurrentWeek] = useState(14);

  // Fetch league data
  const { data: leagueData, isLoading: leagueLoading } = useQuery({
    queryKey: ['/api/espn-fantasy/league', leagueId, 'dashboard'],
    enabled: !!leagueId
  });

  // Fetch team roster if team selected
  const { data: rosterData, isLoading: rosterLoading } = useQuery({
    queryKey: ['/api/espn-fantasy/league', leagueId, 'team', selectedTeamId, 'roster'],
    enabled: !!leagueId && !!selectedTeamId
  });

  // Fetch current matchups
  const { data: matchupsData, isLoading: matchupsLoading } = useQuery({
    queryKey: ['/api/espn-fantasy/league', leagueId, 'matchups'],
    enabled: !!leagueId
  });

  // Fetch free agents
  const { data: freeAgentsData, isLoading: freeAgentsLoading } = useQuery({
    queryKey: ['/api/espn-fantasy/league', leagueId, 'free-agents'],
    enabled: !!leagueId
  });

  const league = leagueData?.data?.league;
  const teams = league?.teams || [];
  const roster = rosterData?.data?.roster || [];
  const matchups = matchupsData?.data?.matchups || [];
  const freeAgents = freeAgentsData?.data?.availablePlayers || [];

  const getTeamName = (teamId: number) => {
    const team = teams.find((t: FantasyTeam) => t.id === teamId);
    return team?.name || `Team ${teamId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-400" />
            ESPN Fantasy Football
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Comprehensive fantasy football management with live scoring, player analysis, and league insights
          </p>
          
          {/* League ID Input */}
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
            <Input
              placeholder="Enter League ID"
              value={leagueId}
              onChange={(e) => setLeagueId(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              Load League
            </Button>
          </div>
        </div>

        {/* League Overview */}
        {league && (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                {league.name}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {league.size} teams • Week {league.currentMatchupPeriod} • {league.scoringType}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-500/20 p-4 rounded-lg">
                  <div className="text-blue-300 text-sm">Current Week</div>
                  <div className="text-white text-2xl font-bold">{league.currentMatchupPeriod}</div>
                </div>
                <div className="bg-green-500/20 p-4 rounded-lg">
                  <div className="text-green-300 text-sm">Total Teams</div>
                  <div className="text-white text-2xl font-bold">{league.size}</div>
                </div>
                <div className="bg-purple-500/20 p-4 rounded-lg">
                  <div className="text-purple-300 text-sm">Scoring Format</div>
                  <div className="text-white text-lg font-bold">{league.scoringType}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="standings" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="matchups">Matchups</TabsTrigger>
            <TabsTrigger value="roster">My Roster</TabsTrigger>
            <TabsTrigger value="waiver">Waiver Wire</TabsTrigger>
          </TabsList>

          {/* Standings Tab */}
          <TabsContent value="standings" className="space-y-4">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">League Standings</CardTitle>
              </CardHeader>
              <CardContent>
                {leagueLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-300 mt-2">Loading standings...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {teams
                      .sort((a: FantasyTeam, b: FantasyTeam) => 
                        (b.record.wins - b.record.losses) - (a.record.wins - a.record.losses) ||
                        b.record.pointsFor - a.record.pointsFor
                      )
                      .map((team: FantasyTeam, index: number) => (
                        <div 
                          key={team.id}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => setSelectedTeamId(team.id.toString())}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-white font-semibold">{team.name}</div>
                              <div className="text-gray-400 text-sm">{team.owner}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">
                              {team.record.wins}-{team.record.losses}
                              {team.record.ties > 0 && `-${team.record.ties}`}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {team.record.pointsFor.toFixed(1)} PF
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matchups Tab */}
          <TabsContent value="matchups" className="space-y-4">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Week {currentWeek} Matchups
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matchupsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-300 mt-2">Loading matchups...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchups.map((matchup: Matchup) => (
                      <div key={matchup.id} className="bg-white/5 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="text-center flex-1">
                            <div className="text-white font-semibold text-sm">
                              {getTeamName(matchup.homeTeam.id)}
                            </div>
                            <div className="text-2xl font-bold text-white mt-1">
                              {matchup.homeTeam.score.toFixed(1)}
                            </div>
                            <div className="text-gray-400 text-xs">
                              Proj: {matchup.homeTeam.projectedScore.toFixed(1)}
                            </div>
                          </div>
                          <div className="text-gray-400 text-xl font-bold px-4">VS</div>
                          <div className="text-center flex-1">
                            <div className="text-white font-semibold text-sm">
                              {getTeamName(matchup.awayTeam.id)}
                            </div>
                            <div className="text-2xl font-bold text-white mt-1">
                              {matchup.awayTeam.score.toFixed(1)}
                            </div>
                            <div className="text-gray-400 text-xs">
                              Proj: {matchup.awayTeam.projectedScore.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        {matchup.winner && (
                          <div className="mt-2 text-center">
                            <Badge className="bg-green-500/20 text-green-300">
                              Winner: {matchup.winner === 'HOME' ? getTeamName(matchup.homeTeam.id) : getTeamName(matchup.awayTeam.id)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roster Tab */}
          <TabsContent value="roster" className="space-y-4">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  {selectedTeamId ? `${getTeamName(parseInt(selectedTeamId))} Roster` : 'Select a Team'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedTeamId ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Select a team from standings to view roster</p>
                  </div>
                ) : rosterLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-300 mt-2">Loading roster...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {roster.map((player: FantasyPlayer) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={player.isActive ? "default" : "secondary"}
                            className={player.isActive ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-400"}
                          >
                            {player.position}
                          </Badge>
                          <div>
                            <div className="text-white font-semibold">{player.name}</div>
                            <div className="text-gray-400 text-sm">{player.team}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            {player.actualPoints.toFixed(1)} pts
                          </div>
                          <div className="text-gray-400 text-sm">
                            Proj: {player.projectedPoints.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Waiver Wire Tab */}
          <TabsContent value="waiver" className="space-y-4">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Available Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                {freeAgentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-300 mt-2">Loading free agents...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {freeAgents.map((player: FantasyPlayer) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-500/20 text-blue-300">
                            {player.position}
                          </Badge>
                          <div>
                            <div className="text-white font-semibold">{player.name}</div>
                            <div className="text-gray-400 text-sm">{player.team}</div>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <div className="text-white font-semibold">
                              {player.projectedPoints.toFixed(1)} proj
                            </div>
                            <div className="text-gray-400 text-sm">
                              {player.percentOwned.toFixed(1)}% owned
                            </div>
                          </div>
                          <Button size="sm" className="bg-gradient-to-r from-green-600 to-blue-600">
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}