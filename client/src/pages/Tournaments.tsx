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
import { Trophy, Share2, Calendar, Users, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Tournaments: React.FC = () => {
  const { toast } = useToast();
  const [activeTournament, setActiveTournament] = useState("nba-playoffs-2023");
  
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
    navigator.clipboard.writeText("https://sportsbetpro.com/tournaments/bracket/nba-playoffs-2023")
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
      
      <Tabs defaultValue="featured" className="w-full">
        <TabsList className="flex-wrap mb-6">
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="my-brackets">My Brackets</TabsTrigger>
          <TabsTrigger value="public-pools">Public Pools</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>
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
                    <Button>Join Pool</Button>
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
                    <Button>Join Pool</Button>
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
          </div>p-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Bracket Score</div>
                    <div className="text-2xl font-bold">780 <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ 1000</span></div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Rank: 156 of 1,245</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Correct Picks</div>
                    <div className="text-2xl font-bold">11 <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ 15</span></div>
                    <div className="mt-1 text-xs text-green-600 dark:text-green-400">+3 from last round</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Championship Pick</div>
                    <div className="text-xl font-bold">Boston Celtics</div>
                    <div className="mt-1 text-xs text-green-600 dark:text-green-400">Still in contention</div>
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
                      <Badge variant="outline">Completed</Badge>
                    </div>
                  </div>
                  <div>
                    <Button variant="outline">View Bracket</Button>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Bracket Score</div>
                    <div className="text-2xl font-bold">640 <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ 1000</span></div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Final Rank: 742 of 5,123</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Correct Picks</div>
                    <div className="text-2xl font-bold">42 <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ 63</span></div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Better than 65% of brackets</div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Championship Pick</div>
                    <div className="text-xl font-bold">UConn</div>
                    <div className="mt-1 text-xs text-green-600 dark:text-green-400">Correct - 100 bonus points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="public-pools">
          <div className="bg-white dark:bg-neutral-dark rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Public Bracket Pools</h2>
              <div className="flex items-center gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="baseball">Baseball</SelectItem>
                  </SelectContent>
                </Select>
                <Input className="w-60" placeholder="Search pools..." />
              </div>
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3, 4].map((id) => (
                <div key={id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center">
                        <Trophy className="h-5 w-5 text-primary mr-2" />
                        <h3 className="font-medium text-lg">
                          {id === 1 ? "NBA Finals Challenge" : 
                           id === 2 ? "March Madness Pool" : 
                           id === 3 ? "NFL Playoff Bracket" : 
                           "MLB Postseason Challenge"}
                        </h3>
                        {id === 1 && (
                          <Badge className="ml-2 bg-yellow-500 text-white">Featured</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {id === 1 ? "2,453" : 
                           id === 2 ? "5,128" : 
                           id === 3 ? "1,872" : 
                           "945"} participants
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Closes: {id === 1 ? "Jun 1, 2023" : 
                                   id === 2 ? "Mar 16, 2023" : 
                                   id === 3 ? "Jan 14, 2023" : 
                                   "Oct 3, 2023"}
                        </span>
                        <span>
                          Entry Fee: {id === 1 ? "$25" : 
                                     id === 2 ? "$10" : 
                                     id === 3 ? "$15" : 
                                     "Free"}
                        </span>
                      </div>
                    </div>
                    <Button>Join Pool</Button>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      {id === 1 ? "$10,000" : 
                       id === 2 ? "$5,000" : 
                       id === 3 ? "$2,500" : 
                       "$500"} Prize Pool
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {id === 1 ? "NBA" : 
                       id === 2 ? "NCAA" : 
                       id === 3 ? "NFL" : 
                       "MLB"}
                    </div>
                    {id === 4 && (
                      <div className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                        Free Entry
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Bracket Pool</CardTitle>
              <CardDescription>
                Set up your own tournament bracket challenge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pool Name</label>
                  <Input placeholder="Enter pool name" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tournament</label>
                  <Select defaultValue="nba-playoffs">
                    <SelectTrigger>
                      <SelectValue placeholder="Select tournament" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nba-playoffs">NBA Playoffs 2023</SelectItem>
                      <SelectItem value="ncaa-tournament">NCAA Tournament 2023</SelectItem>
                      <SelectItem value="nfl-playoffs">NFL Playoffs 2023-24</SelectItem>
                      <SelectItem value="mlb-postseason">MLB Postseason 2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Pool Description</label>
                <Input placeholder="Enter description of your bracket pool" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Entry Fee</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <Input type="number" min="0" defaultValue="10" className="pl-7" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Entries</label>
                  <Input type="number" min="1" defaultValue="100" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deadline</label>
                  <Input type="date" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Scoring System</label>
                <Select defaultValue="standard">
                  <SelectTrigger>
                    <SelectValue placeholder="Select scoring system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (Round Multiplier)</SelectItem>
                    <SelectItem value="upset-bonus">Upset Bonus</SelectItem>
                    <SelectItem value="seed-difference">Seed Difference</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Privacy Options</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="public" />
                    <label htmlFor="public" className="text-sm">Public pool (anyone can join)</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="invite" defaultChecked />
                    <label htmlFor="invite" className="text-sm">Invite only (requires access code)</label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Prize Distribution</label>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <label className="text-sm">1st Place:</label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input type="number" min="0" defaultValue="70" className="w-20" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <label className="text-sm">2nd Place:</label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input type="number" min="0" defaultValue="20" className="w-20" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <label className="text-sm">3rd Place:</label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input type="number" min="0" defaultValue="10" className="w-20" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleCreatePool}>Create Bracket Pool</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tournaments;
