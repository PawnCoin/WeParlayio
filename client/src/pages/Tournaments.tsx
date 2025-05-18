import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import sportsBetAPI from "@/lib/sportsBetAPI";
import BracketView from "@/components/tournaments/BracketView";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Trophy, Share2, Calendar, Users, ChevronDown, 
  Plus, Pen, Filter, Save, Alert 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Tournaments: React.FC = () => {
  const { toast } = useToast();
  const [activeTournament, setActiveTournament] = useState("nba-playoffs-2023");
  const [activeTab, setActiveTab] = useState("featured");
  
  const { data: tournaments, isLoading } = useQuery({
    queryKey: ["/api/tournaments"],
    queryFn: () => sportsBetAPI.getTournaments(),
  });
  
  const handleCreatePool = () => {
    toast({
      title: "Tournament Pool Created",
      description: "Your bracket pool has been created successfully.",
    });
  };
  
  const handleShareBracket = () => {
    // In a real app, this would generate a shareable link or display a share dialog
    navigator.clipboard.writeText("https://weparlay.io/tournaments/bracket/nba-playoffs-2023")
      .then(() => {
        toast({
          title: "Link Copied",
          description: "Bracket link has been copied to clipboard.",
        });
      })
      .catch(err => {
        console.error("Failed to copy link:", err);
        toast({
          title: "Failed to Copy",
          description: "Could not copy link to clipboard.",
          variant: "destructive"
        });
      });
  };

  const handleSaveBracket = () => {
    toast({
      title: "Bracket Saved",
      description: "Your bracket has been saved successfully.",
    });
  };
  
  const handleJoinPool = (poolName: string) => {
    toast({
      title: "Pool Joined",
      description: `You've successfully joined the ${poolName} pool.`,
    });
  };
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tournament Brackets</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create and participate in tournament bracket pools
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleCreatePool} className="flex items-center gap-2">
              <Trophy className="h-4 w-4" /> Create Bracket Pool
            </Button>
          </div>
        </div>
        
        <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
        </div>
      </div>
      
      <Tabs defaultValue="featured" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex-wrap mb-6">
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="my-brackets">My Brackets</TabsTrigger>
          <TabsTrigger value="public-pools">Public Pools</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>
        
        {/* Featured Tab */}
        <TabsContent value="featured">
          <div className="bg-white dark:bg-neutral-dark rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Select defaultValue={activeTournament} onValueChange={setActiveTournament}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Tournament" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nba-playoffs-2023">NBA Playoffs 2023</SelectItem>
                    <SelectItem value="ncaa-tournament-2023">NCAA Tournament 2023</SelectItem>
                    <SelectItem value="fiba-world-cup-2023">FIBA World Cup 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
                  <Trophy className="h-4 w-4 mr-2" /> Create Bracket Pool
                </Button>
                <Button variant="outline" className="flex items-center" onClick={handleShareBracket}>
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
              </div>
            </div>
            
            {/* Tournament Bracket Visualization */}
            <BracketView tournamentId={1} />
            
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-medium mb-2">Bracket Betting</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Eastern Conference Winner</div>
                  <div className="flex justify-between">
                    <span className="font-medium">Celtics</span>
                    <span className="text-primary font-medium">-120</span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Western Conference Winner</div>
                  <div className="flex justify-between">
                    <span className="font-medium">Warriors</span>
                    <span className="text-primary font-medium">+150</span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Championship Winner</div>
                  <div className="flex justify-between">
                    <span className="font-medium">Celtics</span>
                    <span className="text-primary font-medium">+175</span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Finals MVP</div>
                  <div className="flex justify-between">
                    <span className="font-medium">J. Tatum</span>
                    <span className="text-primary font-medium">+200</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Tournament Schedule</CardTitle>
                <CardDescription>Upcoming games and results</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Matchup</TableHead>
                      <TableHead>Round</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>May 15, 2023</TableCell>
                      <TableCell className="font-medium">Celtics vs Cavaliers</TableCell>
                      <TableCell>Conference Finals</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Completed</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>May 17, 2023</TableCell>
                      <TableCell className="font-medium">Bucks vs Nets</TableCell>
                      <TableCell>Conference Finals</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Completed</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>May 22, 2023</TableCell>
                      <TableCell className="font-medium">Celtics vs Bucks</TableCell>
                      <TableCell>Finals</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Completed</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tournament Leaderboard</CardTitle>
                <CardDescription>Top bracket predictions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Correct Picks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Badge className="bg-yellow-500">1</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <span>BracketMaster</span>
                        </div>
                      </TableCell>
                      <TableCell>980</TableCell>
                      <TableCell>14/15</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge className="bg-gray-400">2</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback>SB</AvatarFallback>
                          </Avatar>
                          <span>SportsFan</span>
                        </div>
                      </TableCell>
                      <TableCell>940</TableCell>
                      <TableCell>13/15</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge className="bg-amber-700">3</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback>TP</AvatarFallback>
                          </Avatar>
                          <span>TourneyPro</span>
                        </div>
                      </TableCell>
                      <TableCell>920</TableCell>
                      <TableCell>13/15</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Popular Bracket Pools</CardTitle>
              <CardDescription>Join a public bracket challenge</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-lg">NBA Championship Challenge</h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="h-4 w-4 mr-1" /> Ends May 22, 2023
                        <span className="mx-2">•</span>
                        <Users className="h-4 w-4 mr-1" /> 1,245 participants
                      </div>
                    </div>
                    <Button onClick={() => handleJoinPool("NBA Championship Challenge")}>Join Pool</Button>
                  </div>
                  <div className="mt-4 flex items-center">
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mr-3">
                      $1,000 Prize Pool
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                      $10 Entry Fee
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-lg">Free Bracket Challenge</h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="h-4 w-4 mr-1" /> Ends May 22, 2023
                        <span className="mx-2">•</span>
                        <Users className="h-4 w-4 mr-1" /> 3,782 participants
                      </div>
                    </div>
                    <Button onClick={() => handleJoinPool("Free Bracket Challenge")}>Join Pool</Button>
                  </div>
                  <div className="mt-4 flex items-center">
                    <div className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium mr-3">
                      Free Entry
                    </div>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      Prizes for Top 3
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* My Brackets Tab */}
        <TabsContent value="my-brackets">
          <div className="bg-white dark:bg-neutral-dark rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">My Bracket Entries</h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-lg">NBA Playoffs 2023</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="h-4 w-4 mr-1" /> Created Apr 15, 2023
                      <span className="mx-2">•</span>
                      <Badge className="ml-1">Active</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => toast({
                      title: "Viewing Bracket",
                      description: "Loading your NBA Playoffs 2023 bracket..."
                    })}>View Bracket</Button>
                    <Button variant="outline" onClick={() => toast({
                      title: "Edit Mode Activated",
                      description: "You can now edit your bracket picks"
                    })}>Edit Picks</Button>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Champion Pick</div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback>BC</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">Boston Celtics</span>
                      </div>
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">Active</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Accuracy</div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pool Standing</div>
                    <div className="flex justify-between">
                      <span className="font-medium">Ranked #3</span>
                      <span className="text-primary font-medium">980 pts</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-lg">NCAA Tournament 2023</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="h-4 w-4 mr-1" /> Created Mar 12, 2023
                      <span className="mx-2">•</span>
                      <Badge variant="outline" className="ml-1">Completed</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => toast({
                      title: "Viewing Bracket",
                      description: "Loading your NCAA Tournament 2023 bracket..."
                    })}>View Bracket</Button>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Champion Pick</div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback>UConn</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">UConn Huskies</span>
                      </div>
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓ Correct</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Accuracy</div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '63%' }}></div>
                      </div>
                      <span className="text-sm font-medium">63%</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pool Standing</div>
                    <div className="flex justify-between">
                      <span className="font-medium">Ranked #12</span>
                      <span className="text-primary font-medium">670 pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Public Pools Tab */}
        <TabsContent value="public-pools">
          <div className="bg-white dark:bg-neutral-dark rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold">Public Bracket Pools</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input
                    placeholder="Search pools..."
                    className="pr-8 w-full md:w-64"
                  />
                  <div className="absolute top-0 right-0 h-full flex items-center pr-3 pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pools</SelectItem>
                    <SelectItem value="free">Free Entry</SelectItem>
                    <SelectItem value="paid">Paid Entry</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/70 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-lg">NBA Championship Challenge</h3>
                      <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">Featured</Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="h-4 w-4 mr-1" /> Ends May 22, 2023
                      <span className="mx-2">•</span>
                      <Users className="h-4 w-4 mr-1" /> 1,245 participants
                    </div>
                  </div>
                  <Button onClick={() => handleJoinPool("NBA Championship Challenge")}>Join Pool</Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    $1,000 Prize Pool
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    $10 Entry Fee
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    NBA
                  </div>
                  <div className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                    60% Filled
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/70 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-lg">Free Bracket Challenge</h3>
                      <Badge className="ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">Popular</Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="h-4 w-4 mr-1" /> Ends May 22, 2023
                      <span className="mx-2">•</span>
                      <Users className="h-4 w-4 mr-1" /> 3,782 participants
                    </div>
                  </div>
                  <Button onClick={() => handleJoinPool("Free Bracket Challenge")}>Join Pool</Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                    Free Entry
                  </div>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    Prizes for Top 3
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    NBA
                  </div>
                  <div className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
                    90% Filled
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/70 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-lg">WePlay Final Four</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="h-4 w-4 mr-1" /> Starts June 2, 2023
                      <span className="mx-2">•</span>
                      <Users className="h-4 w-4 mr-1" /> 876 participants
                    </div>
                  </div>
                  <Button onClick={() => handleJoinPool("WePlay Final Four")}>Join Pool</Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    $500 Prize Pool
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    $5 Entry Fee
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    NCAA
                  </div>
                  <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                    30% Filled
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/70 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-lg">FIBA World Cup Prediction</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="h-4 w-4 mr-1" /> Starts Aug 25, 2023
                      <span className="mx-2">•</span>
                      <Users className="h-4 w-4 mr-1" /> 523 participants
                    </div>
                  </div>
                  <Button onClick={() => handleJoinPool("FIBA World Cup Prediction")}>Join Pool</Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    $250 Prize Pool
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    $2 Entry Fee
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    FIBA
                  </div>
                  <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                    15% Filled
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button variant="outline" className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" /> Load More
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Create New Tab */}
        <TabsContent value="create">
          <div className="bg-white dark:bg-neutral-dark rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Create New Bracket</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Tournament</label>
                  <Select defaultValue="nba-playoffs">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Tournament" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nba-playoffs">NBA Playoffs 2023</SelectItem>
                      <SelectItem value="ncaa-tournament">NCAA Tournament 2023</SelectItem>
                      <SelectItem value="fiba-world-cup">FIBA World Cup 2023</SelectItem>
                      <SelectItem value="nhl-playoffs">NHL Playoffs 2023</SelectItem>
                      <SelectItem value="mlb-world-series">MLB World Series 2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Bracket Name</label>
                  <Input placeholder="My Champion Bracket" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Pool Type</label>
                  <Select defaultValue="public">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Pool Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Entry Fee</label>
                  <Select defaultValue="free">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Entry Fee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid-2">$2</SelectItem>
                      <SelectItem value="paid-5">$5</SelectItem>
                      <SelectItem value="paid-10">$10</SelectItem>
                      <SelectItem value="paid-20">$20</SelectItem>
                      <SelectItem value="paid-50">$50</SelectItem>
                      <SelectItem value="paid-100">$100</SelectItem>
                      <SelectItem value="custom">Custom Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none h-24"
                  placeholder="Tell others what this bracket pool is about..."
                ></textarea>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <Checkbox id="scoring-standard" />
                  <span className="text-sm font-medium">Use standard scoring (1-2-4-8-16-32)</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                  Points double each round: 1 point for Round 1 games, 2 for Round 2, etc.
                </p>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <Checkbox id="allow-late-entries" />
                  <span className="text-sm font-medium">Allow entries after tournament begins</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                  Participants can join after games have started but cannot pick results for completed games.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8">
                <Button variant="outline" onClick={() => setActiveTab("featured")}>
                  Cancel
                </Button>
                <Button className="gap-2" onClick={handleCreatePool}>
                  <Plus className="h-4 w-4" /> Create Bracket Pool
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tournaments;