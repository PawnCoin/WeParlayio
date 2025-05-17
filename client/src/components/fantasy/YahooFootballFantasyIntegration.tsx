import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import yahooFantasyAPI from "@/lib/yahooFantasyAPI";
import { 
  BookOpen, Users, Award, BarChart, Shield, 
  Loader2, CheckCircle2, ArrowRight, Star, RefreshCw, 
  UserPlus, Calendar, GitMerge, ClipboardList, Plus, Trophy 
} from "lucide-react";
import { FaYahoo } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface FootballPlayer {
  id: string;
  name: string;
  position: string;
  team: string;
  imageUrl: string;
  stats: {
    passYards?: number;
    passTDs?: number;
    rushYards?: number;
    rushTDs?: number;
    recYards?: number;
    recTDs?: number;
    tackles?: number;
    sacks?: number;
    interceptions?: number;
  };
  projectedPoints: number;
  actualPoints: number;
  status: 'active' | 'injured' | 'questionable' | 'out';
}

interface FootballTeam {
  id: string;
  name: string;
  logo: string;
  owner: string;
  record: {
    wins: number;
    losses: number;
    ties: number;
  };
  rank: number;
  players: FootballPlayer[];
}

interface FootballLeague {
  id: string;
  name: string;
  logoUrl: string;
  teams: number;
  isPublic: boolean;
}

const YahooFootballFantasyIntegration: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<FootballTeam | null>(null);
  
  // Get Yahoo Authentication Status
  const { 
    data: yahooAuthStatus, 
    isLoading: isCheckingYahoo 
  } = useQuery({
    queryKey: ['/api/yahoo/status'],
    enabled: isAuthenticated,
  });
  
  const yahooAuthenticated = yahooAuthStatus?.connected;
  
  // Get Yahoo Fantasy Teams
  const {
    data: yahooTeams,
    isLoading: isLoadingYahooTeams,
    refetch: refetchYahooTeams,
  } = useQuery({
    queryKey: ['/api/yahoo/teams'],
    enabled: isAuthenticated && yahooAuthenticated,
  });
  
  // Get Football Leagues
  const {
    data: yahooLeagues,
    isLoading: isLoadingLeagues,
  } = useQuery({
    queryKey: ['/api/yahoo/leagues/football'],
    enabled: isAuthenticated && yahooAuthenticated,
  });
  
  // Simulated leagues data for demo purposes
  const sampleLeagues: FootballLeague[] = [
    {
      id: "396.l.123456",
      name: "WeParlay Fantasy Football",
      logoUrl: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-logos/56507854744_6a4e4e.png",
      teams: 12,
      isPublic: true
    },
    {
      id: "396.l.789012",
      name: "Office Fantasy League",
      logoUrl: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-logos/56484654744_6a4e4e.png",
      teams: 10,
      isPublic: false
    },
    {
      id: "396.l.345678",
      name: "Friends and Family",
      logoUrl: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-logos/39675212365_6a4e4e.png",
      teams: 8,
      isPublic: true
    }
  ];
  
  // Simulated football team data for demo purposes
  const sampleFootballTeams: FootballTeam[] = [
    {
      id: "396.l.123456.t.1",
      name: "Touchdown Titans",
      logo: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-logos/39675212365_6a4e4e.png",
      owner: "John Smith",
      record: {
        wins: 8,
        losses: 3,
        ties: 0
      },
      rank: 1,
      players: []
    },
    {
      id: "396.l.123456.t.2",
      name: "Gridiron Giants",
      logo: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-logos/56507854744_6a4e4e.png",
      owner: "Sarah Johnson",
      record: {
        wins: 7,
        losses: 4,
        ties: 0
      },
      rank: 2,
      players: []
    },
    {
      id: "396.l.123456.t.3",
      name: "Pigskin Panthers",
      logo: "https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-logos/24564654744_6a4e4e.png",
      owner: "Michael Chen",
      record: {
        wins: 6,
        losses: 5,
        ties: 0
      },
      rank: 3,
      players: []
    }
  ];
  
  // Simulated football players for demo purposes
  const sampleFootballPlayers: FootballPlayer[] = [
    {
      id: "396.p.30977",
      name: "Patrick Mahomes",
      position: "QB",
      team: "KC",
      imageUrl: "https://s.yimg.com/it/api/res/1.2/iGz3_eQ3SE8RVS9D0ZJTzw--~A/YXBwaWQ9eWlmZmJvdDtmaT1maWxsO2g9MjAwO3E9ODA7dz0yMDA-/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/10092023/30977.png",
      stats: {
        passYards: 3425,
        passTDs: 25,
        rushYards: 331,
        rushTDs: 4
      },
      projectedPoints: 24.5,
      actualPoints: 26.3,
      status: 'active'
    },
    {
      id: "396.p.30972",
      name: "Travis Kelce",
      position: "TE",
      team: "KC",
      imageUrl: "https://s.yimg.com/it/api/res/1.2/VSmZYNDUnqXjTDN_R8iRLA--~A/YXBwaWQ9eWlmZmJvdDtmaT1maWxsO2g9MjAwO3E9ODA7dz0yMDA-/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/10092023/24998.png",
      stats: {
        recYards: 896,
        recTDs: 7
      },
      projectedPoints: 15.3,
      actualPoints: 16.8,
      status: 'active'
    },
    {
      id: "396.p.30123",
      name: "Christian McCaffrey",
      position: "RB",
      team: "SF",
      imageUrl: "https://s.yimg.com/it/api/res/1.2/_jCwp2Y0YLMmUxZXLvOb1g--~A/YXBwaWQ9eWlmZmJvdDtmaT1maWxsO2g9MjAwO3E9ODA7dz0yMDA-/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/10092023/30121.png",
      stats: {
        rushYards: 1345,
        rushTDs: 14,
        recYards: 564,
        recTDs: 5
      },
      projectedPoints: 21.2,
      actualPoints: 23.6,
      status: 'active'
    },
    {
      id: "396.p.31883",
      name: "Justin Jefferson",
      position: "WR",
      team: "MIN",
      imageUrl: "https://s.yimg.com/it/api/res/1.2/mLchvtFIscZDEwUjILNwvQ--~A/YXBwaWQ9eWlmZmJvdDtmaT1maWxsO2g9MjAwO3E9ODA7dz0yMDA-/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/10092023/31883.png",
      stats: {
        recYards: 1189,
        recTDs: 9
      },
      projectedPoints: 18.7,
      actualPoints: 17.4,
      status: 'questionable'
    },
    {
      id: "396.p.31879",
      name: "T.J. Watt",
      position: "DEF",
      team: "PIT",
      imageUrl: "https://s.yimg.com/it/api/res/1.2/QEg7pZ7xGwrLobU2NGJ1Fw--~A/YXBwaWQ9eWlmZmJvdDtmaT1maWxsO2g9MjAwO3E9ODA7dz0yMDA-/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/10092023/30434.png",
      stats: {
        tackles: 57,
        sacks: 14.5,
        interceptions: 2
      },
      projectedPoints: 12.4,
      actualPoints: 14.2,
      status: 'active'
    }
  ];
  
  // Add players to sample teams
  useEffect(() => {
    const teamsWithPlayers = sampleFootballTeams.map(team => ({
      ...team,
      players: sampleFootballPlayers
    }));
    
    if (!selectedTeam && teamsWithPlayers.length > 0) {
      setSelectedTeam(teamsWithPlayers[0]);
    }
  }, []);
  
  const handleYahooConnect = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect your Yahoo Fantasy account",
        variant: "destructive"
      });
      return;
    }
    
    window.location.href = "/api/yahoo/auth";
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-500';
      case 'questionable':
        return 'text-yellow-500';
      case 'injured':
      case 'out':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const handleCreateLeague = () => {
    toast({
      title: "Creating New League",
      description: "Redirecting to Yahoo Fantasy Football to set up your new league"
    });
    
    // In real implementation, this would redirect to Yahoo's league creation page
    window.open("https://football.fantasysports.yahoo.com/f1/reg/createleague", "_blank");
  };
  
  const handleImportTeam = (teamId: string) => {
    toast({
      title: "Importing Team",
      description: "Importing your fantasy football team data...",
    });
    
    // Simulate successful import
    setTimeout(() => {
      toast({
        title: "Team Imported Successfully",
        description: "Your Yahoo Fantasy Football team has been imported to WeParlay",
      });
    }, 1500);
  };
  
  if (!isAuthenticated) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <SiYahoofantasysports className="h-12 w-12 text-purple-600" />
          </div>
          <CardTitle className="text-center">Yahoo Football Fantasy</CardTitle>
          <CardDescription className="text-center">
            Connect and manage your Yahoo Fantasy Football teams
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Shield className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            Please log in to access Yahoo Fantasy Football integration
          </p>
          <Link href="/login">
            <Button>
              Log In to Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-center mb-2">
          <SiYahoofantasysports className="h-12 w-12 text-purple-600" />
        </div>
        <CardTitle className="text-center">Yahoo Football Fantasy</CardTitle>
        <CardDescription className="text-center">
          Connect and manage your Yahoo Fantasy Football teams
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isCheckingYahoo ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !yahooAuthenticated ? (
          <div className="flex flex-col items-center justify-center p-6 mb-2">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
              <FaYahoo className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Connect Your Yahoo Account</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              Link your Yahoo Fantasy Football account to import your teams, check standings, and manage players
            </p>
            <Button onClick={handleYahooConnect} className="bg-purple-600 hover:bg-purple-700">
              Connect to Yahoo Fantasy
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="teams" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="teams" className="flex items-center justify-center">
                <Users className="h-4 w-4 mr-2" />
                Teams
              </TabsTrigger>
              <TabsTrigger value="leagues" className="flex items-center justify-center">
                <Trophy className="h-4 w-4 mr-2" />
                Leagues
              </TabsTrigger>
              <TabsTrigger value="players" className="flex items-center justify-center">
                <UserPlus className="h-4 w-4 mr-2" />
                Players
              </TabsTrigger>
              <TabsTrigger value="matchups" className="flex items-center justify-center">
                <GitMerge className="h-4 w-4 mr-2" />
                Matchups
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="teams" className="space-y-4">
              <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                <div className="flex items-center text-green-700 dark:text-green-400 font-medium mb-1">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Yahoo Fantasy Connected
                </div>
                <p className="text-sm text-green-600 dark:text-green-500">
                  Your Yahoo Fantasy account is connected. You can now manage your football teams.
                </p>
              </div>
              
              {isLoadingYahooTeams ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {sampleFootballTeams.map(team => (
                    <motion.div 
                      key={team.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`border rounded-md p-4 cursor-pointer transition-colors ${
                        selectedTeam?.id === team.id 
                          ? "border-purple-300 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/10" 
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                      onClick={() => setSelectedTeam(team)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden">
                            <img 
                              src={team.logo} 
                              alt={`${team.name} logo`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium">{team.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {team.record.wins}-{team.record.losses}{team.record.ties > 0 ? `-${team.record.ties}` : ''} • Rank: {team.rank}
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImportTeam(team.id);
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Sync
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {selectedTeam && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-lg flex items-center">
                      <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                      {selectedTeam.name} Roster
                    </h3>
                    <div className="text-sm text-gray-500">
                      {selectedTeam.players.length} Players
                    </div>
                  </div>
                  
                  <ScrollArea className="h-[300px] rounded-md border">
                    <div className="p-4">
                      {selectedTeam.players.map((player) => (
                        <div 
                          key={player.id} 
                          className="flex items-center justify-between py-2 border-b last:border-0 border-gray-100 dark:border-gray-800"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                              <img 
                                src={player.imageUrl} 
                                alt={player.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium flex items-center">
                                {player.name}
                                <span className={`ml-2 text-xs font-bold ${getStatusColor(player.status)}`}>
                                  {player.status !== 'active' && `(${player.status.toUpperCase()})`}
                                </span>
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {player.position} • {player.team}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{player.actualPoints} pts</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Proj: {player.projectedPoints} pts
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="leagues">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Your Football Leagues</h3>
                <Button variant="outline" size="sm" onClick={handleCreateLeague}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create League
                </Button>
              </div>
              
              <div className="grid gap-4">
                {isLoadingLeagues ? (
                  Array(3).fill(0).map((_, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  sampleLeagues.map(league => (
                    <div 
                      key={league.id} 
                      className="border border-gray-200 dark:border-gray-700 rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img 
                            src={league.logoUrl} 
                            alt={league.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{league.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {league.teams} teams • {league.isPublic ? 'Public' : 'Private'} League
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <BookOpen className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="players">
              <div className="mb-4">
                <Label htmlFor="search-players" className="text-sm font-medium">
                  Search Players
                </Label>
                <div className="mt-1 relative">
                  <Input
                    id="search-players"
                    placeholder="Search for NFL players..."
                    className="w-full"
                  />
                </div>
              </div>
              
              <ScrollArea className="h-[400px] rounded-md border">
                <div className="p-4">
                  {sampleFootballPlayers.map((player) => (
                    <div 
                      key={player.id} 
                      className="flex items-center justify-between py-3 border-b last:border-0 border-gray-100 dark:border-gray-800"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img 
                            src={player.imageUrl} 
                            alt={player.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium flex items-center">
                            {player.name}
                            <span className={`ml-2 text-xs font-bold ${getStatusColor(player.status)}`}>
                              {player.status !== 'active' && `(${player.status.toUpperCase()})`}
                            </span>
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {player.position} • {player.team}
                          </p>
                          <div className="mt-1 flex items-center text-xs">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              <BarChart className="mr-1 h-3 w-3" />
                              {player.actualPoints} pts
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="h-8">
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Star className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="matchups">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Week 10 Matchups</h3>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Change Week
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 font-medium text-sm">
                    Touchdown Titans vs Gridiron Giants
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                          <img 
                            src={sampleFootballTeams[0].logo} 
                            alt={sampleFootballTeams[0].name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-medium">{sampleFootballTeams[0].name}</span>
                      </div>
                      <span className="text-lg font-bold">124.7</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                          <img 
                            src={sampleFootballTeams[1].logo} 
                            alt={sampleFootballTeams[1].name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-medium">{sampleFootballTeams[1].name}</span>
                      </div>
                      <span className="text-lg font-bold">118.2</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 font-medium text-sm">
                    Pigskin Panthers vs Red Zone Raiders
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                          <img 
                            src={sampleFootballTeams[2].logo} 
                            alt={sampleFootballTeams[2].name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-medium">{sampleFootballTeams[2].name}</span>
                      </div>
                      <span className="text-lg font-bold">132.5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden mr-2 bg-gray-200 dark:bg-gray-700">
                          <div className="flex items-center justify-center h-full w-full text-sm font-bold">R</div>
                        </div>
                        <span className="font-medium">Red Zone Raiders</span>
                      </div>
                      <span className="text-lg font-bold">109.8</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Fantasy football data is provided by Yahoo Fantasy Sports. 
          <br />Settings changes made on WeParlay will sync with your Yahoo account.
        </p>
      </CardFooter>
    </Card>
  );
};

export default YahooFootballFantasyIntegration;