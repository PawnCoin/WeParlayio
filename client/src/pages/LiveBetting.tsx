import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import sportsBetAPI from "@/lib/sportsBetAPI";
import GameCard from "@/components/betting/GameCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dot, Filter } from "lucide-react";

// Mock game data for live betting page
const liveGames = [
  {
    id: 1,
    homeTeam: {
      id: 1,
      name: "Boston Celtics",
      logo: "",
      record: "20-5",
      location: "Home"
    },
    awayTeam: {
      id: 2,
      name: "LA Lakers",
      logo: "",
      record: "16-8",
      location: "Away"
    },
    startTime: new Date().toISOString(),
    status: "live",
    homeScore: 94,
    awayScore: 87,
    period: "3rd Quarter",
    timeRemaining: "9:24",
    sportName: "NBA",
    odds: {
      moneyline: {
        home: -145,
        away: 125
      },
      pointSpread: {
        home: {
          line: -4.5,
          odds: -110
        },
        away: {
          line: 4.5,
          odds: -110
        }
      },
      total: {
        over: {
          line: 223.5,
          odds: -110
        },
        under: {
          line: 223.5,
          odds: -110
        }
      }
    }
  },
  {
    id: 2,
    homeTeam: {
      id: 7,
      name: "Golden State Warriors",
      logo: "",
      record: "18-7",
      location: "Home"
    },
    awayTeam: {
      id: 8,
      name: "Dallas Mavericks",
      logo: "",
      record: "15-10",
      location: "Away"
    },
    startTime: new Date().toISOString(),
    status: "live",
    homeScore: 102,
    awayScore: 98,
    period: "4th Quarter",
    timeRemaining: "4:15",
    sportName: "NBA",
    odds: {
      moneyline: {
        home: -175,
        away: 155
      },
      pointSpread: {
        home: {
          line: -3.5,
          odds: -110
        },
        away: {
          line: 3.5,
          odds: -110
        }
      },
      total: {
        over: {
          line: 225.5,
          odds: -110
        },
        under: {
          line: 225.5,
          odds: -110
        }
      }
    }
  }
];

const LiveBetting: React.FC = () => {
  const [sportFilter, setSportFilter] = useState("All Sports");
  
  const { data: sports, isLoading: isLoadingSports } = useQuery({
    queryKey: ["/api/sports"],
    queryFn: () => sportsBetAPI.getSports(),
  });
  
  const { data: liveEvents, isLoading: isLoadingLiveEvents } = useQuery({
    queryKey: ["/api/events/live"],
    queryFn: () => sportsBetAPI.getLiveEvents(),
  });
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Live Betting</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time odds and in-play betting
            </p>
          </div>
          <div className="flex space-x-2">
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Sports">All Sports</SelectItem>
                <SelectItem value="Basketball">Basketball</SelectItem>
                <SelectItem value="Football">Football</SelectItem>
                <SelectItem value="Baseball">Baseball</SelectItem>
                <SelectItem value="Hockey">Hockey</SelectItem>
                <SelectItem value="Soccer">Soccer</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>
        
        <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
          <Tabs defaultValue="all-games" className="w-full">
            <TabsList className="flex-wrap">
              <TabsTrigger value="all-games">All Games</TabsTrigger>
              <TabsTrigger value="basketball">Basketball</TabsTrigger>
              <TabsTrigger value="football">Football</TabsTrigger>
              <TabsTrigger value="baseball">Baseball</TabsTrigger>
              <TabsTrigger value="hockey">Hockey</TabsTrigger>
              <TabsTrigger value="soccer">Soccer</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Live Games Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <span className="inline-flex items-center mr-2">
            <Dot className="h-5 w-5 text-green-500 animate-pulse" />
            <span className="font-medium">Live Now ({liveGames.length})</span>
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Odds update automatically
          </span>
        </div>
        
        {isLoadingLiveEvents ? (
          // Loading state
          Array(2).fill(0).map((_, index) => (
            <Card key={index} className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-8 w-28" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Display live games
          liveGames.map(game => (
            <GameCard key={game.id} game={game} />
          ))
        )}
      </div>
      
      {/* Live Betting Statistics */}
      <div className="bg-white dark:bg-neutral-dark rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Live Game Statistics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Stats */}
          <div>
            <h3 className="font-medium mb-3">Boston Celtics vs LA Lakers</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Field Goal %</span>
                  <div className="flex gap-4">
                    <span className="w-12 text-right">48.2%</span>
                    <span className="w-12 text-right">44.5%</span>
                  </div>
                </div>
                <div className="flex h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="bg-primary" style={{ width: "52%" }}></div>
                  <div className="bg-accent" style={{ width: "48%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>3-Point %</span>
                  <div className="flex gap-4">
                    <span className="w-12 text-right">38.9%</span>
                    <span className="w-12 text-right">36.2%</span>
                  </div>
                </div>
                <div className="flex h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="bg-primary" style={{ width: "53%" }}></div>
                  <div className="bg-accent" style={{ width: "47%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Free Throw %</span>
                  <div className="flex gap-4">
                    <span className="w-12 text-right">84.2%</span>
                    <span className="w-12 text-right">78.6%</span>
                  </div>
                </div>
                <div className="flex h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="bg-primary" style={{ width: "54%" }}></div>
                  <div className="bg-accent" style={{ width: "46%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Rebounds</span>
                  <div className="flex gap-4">
                    <span className="w-12 text-right">42</span>
                    <span className="w-12 text-right">38</span>
                  </div>
                </div>
                <div className="flex h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="bg-primary" style={{ width: "55%" }}></div>
                  <div className="bg-accent" style={{ width: "45%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Assists</span>
                  <div className="flex gap-4">
                    <span className="w-12 text-right">24</span>
                    <span className="w-12 text-right">19</span>
                  </div>
                </div>
                <div className="flex h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="bg-primary" style={{ width: "57%" }}></div>
                  <div className="bg-accent" style={{ width: "43%" }}></div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-6 mt-4 text-xs text-center">
              <div>
                <div className="w-4 h-4 bg-primary mx-auto"></div>
                <span>Boston Celtics</span>
              </div>
              <div>
                <div className="w-4 h-4 bg-accent mx-auto"></div>
                <span>LA Lakers</span>
              </div>
            </div>
          </div>
          
          {/* Quarter by Quarter */}
          <div>
            <h3 className="font-medium mb-3">Quarter by Quarter</h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <div className="grid grid-cols-5 text-xs text-center font-medium bg-gray-50 dark:bg-gray-800 p-2">
                <div className="col-span-1">Team</div>
                <div>Q1</div>
                <div>Q2</div>
                <div>Q3</div>
                <div>Q4</div>
              </div>
              
              <div className="grid grid-cols-5 text-sm text-center p-2 border-b border-gray-200 dark:border-gray-700">
                <div className="col-span-1 font-medium text-left">Boston</div>
                <div>28</div>
                <div>32</div>
                <div>34</div>
                <div>-</div>
              </div>
              
              <div className="grid grid-cols-5 text-sm text-center p-2">
                <div className="col-span-1 font-medium text-left">LA Lakers</div>
                <div>26</div>
                <div>30</div>
                <div>31</div>
                <div>-</div>
              </div>
            </div>
            
            <h3 className="font-medium mb-3 mt-6">Scoring Leaders</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="text-sm font-medium">Boston Celtics</div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm">J. Tatum</span>
                  <span className="text-sm font-medium">28 pts</span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="text-sm font-medium">LA Lakers</div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm">L. James</span>
                  <span className="text-sm font-medium">26 pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Live Betting Tips */}
      <div className="bg-white dark:bg-neutral-dark rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold mb-4">Live Betting Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Momentum Shifts</div>
            <p className="text-sm">Watch for teams gaining momentum after timeouts or big plays as odds often adjust more slowly than the game dynamics.</p>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Player Foul Trouble</div>
            <p className="text-sm">Key players in foul trouble often lead to point spreads widening. Consider betting on the underdog in these situations.</p>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Late Game Scenarios</div>
            <p className="text-sm">In close games, underdogs tend to cover as favorites may win by smaller margins due to careful clock management.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveBetting;
