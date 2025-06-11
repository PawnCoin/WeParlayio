import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Calendar, Users, DollarSign, Clock, Star, Target } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import TierGuard from '@/components/access/TierGuard';

interface Tournament {
  id: string;
  name: string;
  sport: string;
  format: string;
  prizePool: number;
  entryFee: number;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'active' | 'completed';
  description: string;
  rules: string;
  brackets?: any;
}

interface TournamentEntry {
  id: string;
  tournamentId: string;
  userId: string;
  teamName: string;
  entryDate: string;
  status: 'registered' | 'active' | 'eliminated' | 'winner';
  currentRound: number;
  totalEarnings: number;
}

interface Bracket {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  team1: string;
  team2: string;
  winner?: string;
  scheduledTime: string;
  status: 'scheduled' | 'in_progress' | 'completed';
}

const Tournaments: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [teamName, setTeamName] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all tournaments
  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery({
    queryKey: ['/api/tournaments'],
    refetchInterval: 60000,
  });

  // Fetch user's tournament entries
  const { data: userEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['/api/tournaments/my-entries'],
    refetchInterval: 60000,
  });

  // Fetch brackets for selected tournament
  const { data: brackets = [], isLoading: bracketsLoading } = useQuery({
    queryKey: ['/api/tournaments/brackets', selectedTournament?.id],
    enabled: !!selectedTournament,
    refetchInterval: 30000,
  });

  // Join tournament mutation
  const joinTournamentMutation = useMutation({
    mutationFn: async (entryData: {
      tournamentId: string;
      teamName: string;
    }) => {
      return apiRequest('POST', '/api/tournaments/join', entryData);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Successfully Joined Tournament",
          description: `You've joined "${selectedTournament?.name}" with team "${teamName}"`,
        });
        setTeamName('');
        queryClient.invalidateQueries({ queryKey: ['/api/tournaments/my-entries'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
      } else {
        toast({
          title: "Failed to Join Tournament",
          description: data.message || "Unable to join tournament",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join tournament. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleJoinTournament = () => {
    if (!selectedTournament || !teamName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a team name",
        variant: "destructive",
      });
      return;
    }

    joinTournamentMutation.mutate({
      tournamentId: selectedTournament.id,
      teamName: teamName.trim()
    });
  };

  const filteredTournaments = tournaments.filter((tournament: Tournament) => {
    const matchesSport = selectedSport === 'all' || tournament.sport === selectedSport;
    const matchesStatus = selectedStatus === 'all' || tournament.status === selectedStatus;
    const matchesSearch = tournament.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getEntryStatusColor = (status: string) => {
    switch (status) {
      case 'winner': return 'text-yellow-600';
      case 'active': return 'text-green-600';
      case 'eliminated': return 'text-red-600';
      case 'registered': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const sports = ['all', 'football', 'basketball', 'baseball', 'soccer', 'esports'];
  const statuses = ['all', 'upcoming', 'active', 'completed'];

  const isUserInTournament = (tournamentId: string) => {
    return userEntries.some((entry: TournamentEntry) => entry.tournamentId === tournamentId);
  };

  return (
    <TierGuard 
      requiredTier="vip" 
      feature="Tournaments"
      description="Access exclusive tournament competitions, brackets tracking, and prize pool participation exclusively for VIP+ members."
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="h-8 w-8 text-yellow-600" />
                Tournaments
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Join competitive tournaments and win prizes</p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{tournaments.filter((t: Tournament) => t.status === 'active').length}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{tournaments.filter((t: Tournament) => t.status === 'upcoming').length}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userEntries.length}</div>
                <div className="text-sm text-gray-600">My Entries</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Filter by sport" />
              </SelectTrigger>
              <SelectContent>
                {sports.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Tournaments</TabsTrigger>
            <TabsTrigger value="my-tournaments">My Tournaments</TabsTrigger>
            <TabsTrigger value="brackets">Brackets</TabsTrigger>
          </TabsList>

          {/* Browse Tournaments Tab */}
          <TabsContent value="browse" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tournaments List */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 gap-4">
                  {tournamentsLoading ? (
                    <div className="text-center py-8">Loading tournaments...</div>
                  ) : filteredTournaments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No tournaments found</div>
                  ) : (
                    filteredTournaments.map((tournament: Tournament) => (
                      <Card
                        key={tournament.id}
                        className={`hover:shadow-lg transition-shadow cursor-pointer ${
                          selectedTournament?.id === tournament.id ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''
                        }`}
                        onClick={() => setSelectedTournament(tournament)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <Trophy className="h-5 w-5 text-yellow-600" />
                              {tournament.name}
                            </CardTitle>
                            <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                              {tournament.status.toUpperCase()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <DollarSign className="h-4 w-4 mx-auto mb-1 text-green-600" />
                              <div className="text-sm text-gray-600">Prize Pool</div>
                              <div className="font-bold text-green-600">${tournament.prizePool.toLocaleString()}</div>
                            </div>
                            <div className="text-center">
                              <Target className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                              <div className="text-sm text-gray-600">Entry Fee</div>
                              <div className="font-bold text-blue-600">${tournament.entryFee}</div>
                            </div>
                            <div className="text-center">
                              <Users className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                              <div className="text-sm text-gray-600">Participants</div>
                              <div className="font-bold text-purple-600">
                                {tournament.currentParticipants}/{tournament.maxParticipants}
                              </div>
                            </div>
                            <div className="text-center">
                              <Calendar className="h-4 w-4 mx-auto mb-1 text-orange-600" />
                              <div className="text-sm text-gray-600">Start Date</div>
                              <div className="font-bold text-orange-600">
                                {new Date(tournament.startDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Sport:</span>
                              <span className="font-medium">{tournament.sport}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Format:</span>
                              <span className="font-medium">{tournament.format}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            {tournament.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Tournament Details & Join Panel */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Tournament Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedTournament ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h3 className="font-semibold mb-2">{selectedTournament.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{selectedTournament.description}</p>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Sport:</span>
                              <span className="font-medium">{selectedTournament.sport}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Format:</span>
                              <span className="font-medium">{selectedTournament.format}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Start Date:</span>
                              <span className="font-medium">
                                {new Date(selectedTournament.startDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>End Date:</span>
                              <span className="font-medium">
                                {new Date(selectedTournament.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {selectedTournament.status === 'upcoming' && !isUserInTournament(selectedTournament.id) && (
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium">Team Name</label>
                              <Input
                                placeholder="Enter your team name"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="text-sm">Entry Fee:</div>
                              <div className="text-xl font-bold text-blue-600">
                                ${selectedTournament.entryFee}
                              </div>
                            </div>

                            <Button
                              onClick={handleJoinTournament}
                              disabled={joinTournamentMutation.isPending || !teamName.trim()}
                              className="w-full"
                            >
                              {joinTournamentMutation.isPending ? 'Joining...' : 'Join Tournament'}
                            </Button>
                          </div>
                        )}

                        {isUserInTournament(selectedTournament.id) && (
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                            <div className="text-green-600 font-medium">
                              ✓ You're registered for this tournament
                            </div>
                          </div>
                        )}

                        {selectedTournament.status === 'completed' && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-gray-600 font-medium">
                              Tournament Completed
                            </div>
                          </div>
                        )}

                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Rules</h4>
                          <p className="text-sm text-gray-600">{selectedTournament.rules}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Select a tournament to view details
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* My Tournaments Tab */}
          <TabsContent value="my-tournaments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Tournament Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {entriesLoading ? (
                  <div className="text-center py-8">Loading your entries...</div>
                ) : userEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No tournament entries yet</div>
                ) : (
                  <div className="space-y-4">
                    {userEntries.map((entry: TournamentEntry) => (
                      <div key={entry.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{entry.teamName}</div>
                            <div className="text-sm text-gray-600">
                              Round {entry.currentRound} • Joined {new Date(entry.entryDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${getEntryStatusColor(entry.status)}`}>
                              {entry.status.toUpperCase()}
                            </div>
                            {entry.totalEarnings > 0 && (
                              <div className="text-sm text-green-600">
                                +${entry.totalEarnings.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brackets Tab */}
          <TabsContent value="brackets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Tournament Brackets
                  {selectedTournament && (
                    <span className="text-sm text-gray-600">- {selectedTournament.name}</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedTournament ? (
                  <div className="text-center py-8 text-gray-500">
                    Select a tournament to view brackets
                  </div>
                ) : bracketsLoading ? (
                  <div className="text-center py-8">Loading brackets...</div>
                ) : brackets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No brackets available yet</div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(
                      brackets.reduce((acc: any, bracket: Bracket) => {
                        if (!acc[bracket.round]) acc[bracket.round] = [];
                        acc[bracket.round].push(bracket);
                        return acc;
                      }, {})
                    ).map(([round, roundBrackets]) => (
                      <div key={round}>
                        <h3 className="text-lg font-semibold mb-3">Round {round}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(roundBrackets as Bracket[]).map((bracket) => (
                            <div key={bracket.id} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Match {bracket.matchNumber}</span>
                                <Badge className={getStatusColor(bracket.status)}>
                                  {bracket.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2">
                                <div className={`p-2 rounded ${bracket.winner === bracket.team1 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                  <div className="font-medium">{bracket.team1}</div>
                                </div>
                                <div className="text-center text-sm text-gray-500">VS</div>
                                <div className={`p-2 rounded ${bracket.winner === bracket.team2 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                  <div className="font-medium">{bracket.team2}</div>
                                </div>
                              </div>
                              
                              <div className="mt-3 text-sm text-gray-600">
                                <Clock className="h-4 w-4 inline mr-1" />
                                {new Date(bracket.scheduledTime).toLocaleString()}
                              </div>
                            </div>
                          ))}
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
    </TierGuard>
  );
};

export default Tournaments;