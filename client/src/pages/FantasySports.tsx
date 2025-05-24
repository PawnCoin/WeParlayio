import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import sportsBetAPI from "@/lib/sportsBetAPI";
import yahooFantasyAPI, { YahooTeam, YahooPlayer } from "@/lib/yahooFantasyAPI";
import FantasyTeamBuilder from "@/components/fantasy/FantasyTeamBuilder";
import ComingSoon from "@/components/shared/ComingSoon";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Trophy, FileSymlink, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FantasySports: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeSport, setActiveSport] = useState("basketball");
  const [selectedTeamKey, setSelectedTeamKey] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Check if the user is authenticated with Yahoo
  const { data: yahooAuthenticated, isLoading: isCheckingYahoo, refetch: refetchYahooStatus } = useQuery({
    queryKey: ["yahoo-auth-status"],
    queryFn: () => yahooFantasyAPI.isAuthenticated(),
    enabled: isAuthenticated,
    staleTime: 60000, // Refetch every minute to keep auth status current
  });
  
  // Get user's fantasy teams from Yahoo when authenticated
  const { data: yahooTeams, isLoading: isLoadingYahooTeams, refetch: refetchYahooTeams } = useQuery({
    queryKey: ["yahoo-teams"],
    queryFn: () => yahooFantasyAPI.getUserTeams(),
    enabled: !!yahooAuthenticated,
    refetchOnWindowFocus: false,
  });
  
  // Get team roster when a team is selected
  const { data: teamRoster, isLoading: isLoadingRoster } = useQuery({
    queryKey: ["yahoo-team-roster", selectedTeamKey],
    queryFn: () => yahooFantasyAPI.getTeamRoster(selectedTeamKey!),
    enabled: !!selectedTeamKey && !!yahooAuthenticated,
    refetchOnWindowFocus: false,
  });
  
  const handleYahooConnect = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to connect with Yahoo Fantasy",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // The real Yahoo OAuth flow - this will redirect to Yahoo
      await yahooFantasyAPI.authenticate();
      toast({
        title: "Connecting to Yahoo Fantasy",
        description: "You'll be redirected to Yahoo to authorize access",
      });
    } catch (error) {
      console.error("Error connecting to Yahoo Fantasy:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Yahoo Fantasy. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleImportTeam = async (teamId: string, teamName?: string) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Use the updated importTeam method to import from Yahoo
      await yahooFantasyAPI.importTeam(teamId, teamName);
      
      toast({
        title: "Team Imported",
        description: "Yahoo Fantasy team has been successfully imported",
      });
    } catch (error) {
      console.error("Error importing team:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import team. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Fantasy Sports</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Build your dream team and compete in contests
            </p>
          </div>
          <div className="flex space-x-2">
            <Select value={activeSport} onValueChange={setActiveSport}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basketball">Basketball</SelectItem>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="baseball">Baseball</SelectItem>
                <SelectItem value="hockey">Hockey</SelectItem>
                <SelectItem value="soccer">Soccer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
          <Tabs defaultValue="my-teams" className="w-full">
            <TabsList className="flex-wrap">
              <TabsTrigger value="my-teams">My Teams</TabsTrigger>
              <TabsTrigger value="create-team">Create Team</TabsTrigger>
              <TabsTrigger value="contests">Contests</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="yahoo-integration">Yahoo Integration</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <Tabs defaultValue="my-teams" className="w-full">
        <TabsContent value="my-teams">
          {isAuthenticated ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fantasy All-Stars</CardTitle>
                  <CardDescription>NBA Basketball • Created 2 weeks ago</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Team Value</div>
                      <div className="text-lg font-medium">$47,500 <span className="text-sm text-gray-500 dark:text-gray-400">/ $50,000</span></div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Projected Points</div>
                      <div className="text-lg font-medium">259.2</div>
                    </div>
                  </div>
                  
                  <Progress value={95} className="h-2 mb-4" />
                  
                  <div className="grid grid-cols-5 gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
                    <div>POS</div>
                    <div className="col-span-2">PLAYER</div>
                    <div className="text-right">SALARY</div>
                    <div className="text-right">PROJ</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-2 items-center text-sm">
                      <div className="font-medium">PG</div>
                      <div className="col-span-2 flex items-center">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                        <span>S. Curry</span>
                      </div>
                      <div className="text-right">$9,800</div>
                      <div className="text-right font-medium text-green-600">48.7</div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 items-center text-sm">
                      <div className="font-medium">SG</div>
                      <div className="col-span-2 flex items-center">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback>DM</AvatarFallback>
                        </Avatar>
                        <span>D. Mitchell</span>
                      </div>
                      <div className="text-right">$8,400</div>
                      <div className="text-right font-medium text-green-600">42.1</div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 items-center text-sm">
                      <div className="font-medium">SF</div>
                      <div className="col-span-2 flex items-center">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback>JT</AvatarFallback>
                        </Avatar>
                        <span>J. Tatum</span>
                      </div>
                      <div className="text-right">$10,200</div>
                      <div className="text-right font-medium text-green-600">51.4</div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 items-center text-sm">
                      <div className="font-medium">PF</div>
                      <div className="col-span-2 flex items-center">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback>GA</AvatarFallback>
                        </Avatar>
                        <span>G. Antetokounmpo</span>
                      </div>
                      <div className="text-right">$11,500</div>
                      <div className="text-right font-medium text-green-600">56.8</div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 items-center text-sm">
                      <div className="font-medium">C</div>
                      <div className="col-span-2 flex items-center">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback>NJ</AvatarFallback>
                        </Avatar>
                        <span>N. Jokic</span>
                      </div>
                      <div className="text-right">$12,000</div>
                      <div className="text-right font-medium text-green-600">60.2</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Edit Team</Button>
                  <Button>Enter Contest</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Dream Team</CardTitle>
                  <CardDescription>NBA Basketball • Created 5 days ago</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Team Value</div>
                      <div className="text-lg font-medium">$45,300 <span className="text-sm text-gray-500 dark:text-gray-400">/ $50,000</span></div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Projected Points</div>
                      <div className="text-lg font-medium">247.8</div>
                    </div>
                  </div>
                  
                  <Progress value={91} className="h-2 mb-4" />
                  
                  <div className="grid grid-cols-5 gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
                    <div>POS</div>
                    <div className="col-span-2">PLAYER</div>
                    <div className="text-right">SALARY</div>
                    <div className="text-right">PROJ</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-2 items-center text-sm">
                      <div className="font-medium">PG</div>
                      <div className="col-span-2 flex items-center">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback>DE</AvatarFallback>
                        </Avatar>
                        <span>D. Edwards</span>
                      </div>
                      <div className="text-right">$9,200</div>
                      <div className="text-right font-medium text-green-600">45.2</div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 items-center text-sm">
                      <div className="font-medium">SG</div>
                      <div className="col-span-2 flex items-center">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback>DB</AvatarFallback>
                        </Avatar>
                        <span>D. Booker</span>
                      </div>
                      <div className="text-right">$8,800</div>
                      <div className="text-right font-medium text-green-600">44.5</div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 items-center text-sm">
                      <div className="font-medium">SF</div>
                      <div className="col-span-2 flex items-center">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback>LJ</AvatarFallback>
                        </Avatar>
                        <span>L. James</span>
                      </div>
                      <div className="text-right">$10,500</div>
                      <div className="text-right font-medium text-green-600">52.1</div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 items-center text-sm">
                      <div className="font-medium">PF</div>
                      <div className="col-span-2 flex items-center">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback>KD</AvatarFallback>
                        </Avatar>
                        <span>K. Durant</span>
                      </div>
                      <div className="text-right">$10,300</div>
                      <div className="text-right font-medium text-green-600">49.8</div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 items-center text-sm">
                      <div className="font-medium">C</div>
                      <div className="col-span-2 flex items-center">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback>JE</AvatarFallback>
                        </Avatar>
                        <span>J. Embiid</span>
                      </div>
                      <div className="text-right">$11,500</div>
                      <div className="text-right font-medium text-green-600">56.2</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Edit Team</Button>
                  <Button>Enter Contest</Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-dark rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">Not Logged In</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Please log in to view and manage your fantasy teams
              </p>
              <Button>Log In</Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="create-team">
          <FantasyTeamBuilder />
        </TabsContent>
        
        <TabsContent value="contests">
          <div className="bg-white dark:bg-neutral-dark rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium">Available Contests</h2>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contest</TableHead>
                  <TableHead>Entry Fee</TableHead>
                  <TableHead>Prize Pool</TableHead>
                  <TableHead>Entries</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-primary" />
                      <span>NBA All-Stars Draft</span>
                    </div>
                  </TableCell>
                  <TableCell>$5</TableCell>
                  <TableCell>$10,000</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span>1,250</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">/ 2,000</span>
                    </div>
                  </TableCell>
                  <TableCell>Tonight, 7:00 PM</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm">Enter</Button>
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-primary" />
                      <span>3-Point Shootout</span>
                    </div>
                  </TableCell>
                  <TableCell>$2</TableCell>
                  <TableCell>$5,000</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span>950</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">/ 3,000</span>
                    </div>
                  </TableCell>
                  <TableCell>Tomorrow, 3:30 PM</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm">Enter</Button>
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-accent" />
                      <span>NBA Mega Contest</span>
                      <Badge variant="outline" className="ml-2">Featured</Badge>
                    </div>
                  </TableCell>
                  <TableCell>$20</TableCell>
                  <TableCell>$50,000</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span>1,875</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">/ 2,500</span>
                    </div>
                  </TableCell>
                  <TableCell>Sat, 8:00 PM</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm">Enter</Button>
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-primary" />
                      <span>Free NBA Contest</span>
                      <Badge className="ml-2 bg-green-500">Free</Badge>
                    </div>
                  </TableCell>
                  <TableCell>$0</TableCell>
                  <TableCell>$500</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span>4,256</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">/ 10,000</span>
                    </div>
                  </TableCell>
                  <TableCell>Tonight, 9:00 PM</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm">Enter</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="leaderboard">
          <div className="bg-white dark:bg-neutral-dark rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium">Fantasy Leaderboard</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Top performers for NBA contests this week
              </p>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Contest</TableHead>
                  <TableHead>Prize</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Badge className="bg-yellow-500">1st</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <span>JDFantasy</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">Dream Makers</TableCell>
                  <TableCell className="font-bold">324.6</TableCell>
                  <TableCell>NBA Mega Contest</TableCell>
                  <TableCell>$5,000</TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell>
                    <Badge className="bg-gray-400">2nd</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>TS</AvatarFallback>
                      </Avatar>
                      <span>TopShot</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">Ball Handlers</TableCell>
                  <TableCell className="font-bold">315.2</TableCell>
                  <TableCell>NBA Mega Contest</TableCell>
                  <TableCell>$2,500</TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell>
                    <Badge className="bg-amber-700">3rd</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>BP</AvatarFallback>
                      </Avatar>
                      <span>BballPro</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">Court Kings</TableCell>
                  <TableCell className="font-bold">310.8</TableCell>
                  <TableCell>NBA Mega Contest</TableCell>
                  <TableCell>$1,000</TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell>4th</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>MM</AvatarFallback>
                      </Avatar>
                      <span>MegaManager</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">Slam Dunkers</TableCell>
                  <TableCell className="font-bold">305.4</TableCell>
                  <TableCell>NBA Mega Contest</TableCell>
                  <TableCell>$750</TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell>5th</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>RS</AvatarFallback>
                      </Avatar>
                      <span>RimShaker</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">Basket Cases</TableCell>
                  <TableCell className="font-bold">299.7</TableCell>
                  <TableCell>NBA Mega Contest</TableCell>
                  <TableCell>$500</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="yahoo-integration">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Yahoo Fantasy Sports Integration</CardTitle>
                <CardDescription>
                  Connect your Yahoo Fantasy account to import your teams and player data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isCheckingYahoo ? (
                  <div className="flex flex-col items-center justify-center p-6">
                    <Skeleton className="h-12 w-12 rounded-full mb-4" />
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : yahooAuthenticated ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Successfully Connected</h3>
                        <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                          <p>Your Yahoo Fantasy Sports account is connected. You can now import your teams.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 mb-6">
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
                      <FileSymlink className="h-8 w-8 text-yellow-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Connect Your Yahoo Account</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                      Link your Yahoo Fantasy Sports account to import your existing teams and players
                    </p>
                    <Button onClick={handleYahooConnect}>
                      Connect to Yahoo Fantasy
                    </Button>
                  </div>
                )}
                
                {yahooAuthenticated && (
                  <>
                    <h3 className="font-medium text-lg mb-4">Your Yahoo Fantasy Teams</h3>
                    
                    {isLoadingYahooTeams ? (
                      <div className="space-y-4">
                        {Array(2).fill(0).map((_, index) => (
                          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                            <div className="flex justify-between items-center">
                              <div className="space-y-2">
                                <Skeleton className="h-5 w-32 mb-1" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                              <Skeleton className="h-9 w-24" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : yahooTeams?.length ? (
                      <div className="space-y-4">
                        {yahooTeams.map((team) => (
                          <div key={team.team_id} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <h4 className="font-medium">{team.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {team.league?.name} • W: {team.team_stats.wins} • L: {team.team_stats.losses} • Rank: {team.team_stats.rank}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant={selectedTeamKey === team.team_id ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => setSelectedTeamKey(selectedTeamKey === team.team_id ? null : team.team_id)}
                                >
                                  {selectedTeamKey === team.team_id ? "Hide Roster" : "View Roster"}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleImportTeam(team.team_id, team.name)}
                                  className="flex items-center gap-1"
                                >
                                  Import <ArrowRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {selectedTeamKey === team.team_id && (
                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h5 className="font-medium text-sm mb-3">Team Roster</h5>
                                
                                {isLoadingRoster ? (
                                  <div className="space-y-2">
                                    {Array(5).fill(0).map((_, index) => (
                                      <div key={index} className="flex justify-between items-center">
                                        <div className="flex items-center">
                                          <Skeleton className="h-8 w-8 rounded-full mr-2" />
                                          <div>
                                            <Skeleton className="h-4 w-24 mb-1" />
                                            <Skeleton className="h-3 w-16" />
                                          </div>
                                        </div>
                                        <Skeleton className="h-4 w-16" />
                                      </div>
                                    ))}
                                  </div>
                                ) : teamRoster?.length ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    {teamRoster.map((player) => (
                                      <div key={player.player_id} className="flex items-center justify-between border border-gray-100 dark:border-gray-800 rounded p-2">
                                        <div className="flex items-center">
                                          <Avatar className="w-8 h-8 mr-2">
                                            <AvatarImage src={player.photo_url} alt={player.name} />
                                            <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <div className="font-medium">{player.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                              {player.position} • {player.team}
                                              {player.injury_status && player.injury_status !== 'OK' && (
                                                <span className="ml-1 text-red-500">{player.injury_status}</span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900">
                                            {player.projected_points || '—'} pts
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                                    No players found in this roster
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-md">
                        <p className="text-gray-500 dark:text-gray-400">No Yahoo Fantasy teams found</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            
            {yahooAuthenticated && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Import History</CardTitle>
                  <CardDescription>
                    Track your team imports from Yahoo Fantasy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Yahoo Team</TableHead>
                        <TableHead>Local Team</TableHead>
                        <TableHead>Import Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Fantasy All-Stars</TableCell>
                        <TableCell>Dream Team</TableCell>
                        <TableCell>
                          {new Date(Date.now() - 86400000 * 3).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900">
                            Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FantasySports;
