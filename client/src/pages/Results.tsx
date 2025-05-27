import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import sportsBetAPI from "@/lib/sportsBetAPI";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronRight, Search, Filter, Check, X } from "lucide-react";

// Sample game results for display
const gameResults = [
  {
    id: 1,
    date: "2023-09-28",
    homeTeam: {
      name: "Boston Celtics",
      score: 112
    },
    awayTeam: {
      name: "LA Lakers",
      score: 102
    },
    status: "Final",
    league: "NBA"
  },
  {
    id: 2,
    date: "2023-09-28",
    homeTeam: {
      name: "Milwaukee Bucks",
      score: 98
    },
    awayTeam: {
      name: "Miami Heat",
      score: 104
    },
    status: "Final",
    league: "NBA"
  },
  {
    id: 3,
    date: "2023-09-27",
    homeTeam: {
      name: "Dallas Mavericks",
      score: 115
    },
    awayTeam: {
      name: "Denver Nuggets",
      score: 109
    },
    status: "Final",
    league: "NBA"
  },
  {
    id: 4,
    date: "2023-09-27",
    homeTeam: {
      name: "Golden State Warriors",
      score: 125
    },
    awayTeam: {
      name: "Phoenix Suns",
      score: 116
    },
    status: "Final",
    league: "NBA"
  }
];

// Sample bet history for display
const betHistory = [
  {
    id: 1,
    date: "2023-09-28",
    type: "Moneyline",
    selection: "Boston Celtics",
    opponent: "LA Lakers",
    odds: -145,
    stake: 100,
    profit: 68.97,
    status: "Won"
  },
  {
    id: 2,
    date: "2023-09-28",
    type: "Point Spread",
    selection: "Milwaukee Bucks -4.5",
    opponent: "Miami Heat",
    odds: -110,
    stake: 50,
    profit: -50,
    status: "Lost"
  },
  {
    id: 3,
    date: "2023-09-27",
    type: "Total Points",
    selection: "Over 223.5",
    opponent: "Dallas Mavericks vs Denver Nuggets",
    odds: -110,
    stake: 75,
    profit: 68.18,
    status: "Won"
  },
  {
    id: 4,
    date: "2023-09-27",
    type: "Parlay",
    selection: "3-Leg Parlay",
    opponent: "Multiple Games",
    odds: +450,
    stake: 25,
    profit: 112.50,
    status: "Won"
  }
];

const Results: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<string>("");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const { data: sports, isLoading: isLoadingSports } = useQuery({
    queryKey: ["/api/sports"],
    queryFn: () => sportsBetAPI.getSports(),
  });
  
  // Filter game results based on filters
  const filteredResults = gameResults.filter(game => {
    // Date filter
    if (dateFilter && !game.date.includes(dateFilter)) {
      return false;
    }
    
    // Sport filter
    if (sportFilter !== "all" && game.league.toLowerCase() !== sportFilter.toLowerCase()) {
      return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        game.homeTeam.name.toLowerCase().includes(query) ||
        game.awayTeam.name.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Filter bet history based on filters
  const filteredBets = betHistory.filter(bet => {
    // Date filter
    if (dateFilter && !bet.date.includes(dateFilter)) {
      return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        bet.selection.toLowerCase().includes(query) ||
        bet.opponent.toLowerCase().includes(query) ||
        bet.type.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Results & History</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View game results and your betting history
            </p>
          </div>
          <div className="flex space-x-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search results..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full md:w-auto"
            />
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>
        
        <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
          <Tabs defaultValue="game-results" className="w-full">
            <TabsList className="flex-wrap">
              <TabsTrigger value="game-results">Game Results</TabsTrigger>
              <TabsTrigger value="bet-history">Bet History</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <Tabs defaultValue="game-results">
        <TabsContent value="game-results">
          <div className="bg-white dark:bg-neutral-dark rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <h2 className="text-lg font-medium">Recent Game Results</h2>
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="nba">Basketball</SelectItem>
                  <SelectItem value="nfl">Football</SelectItem>
                  <SelectItem value="mlb">Baseball</SelectItem>
                  <SelectItem value="nhl">Hockey</SelectItem>
                  <SelectItem value="soccer">Soccer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>League</TableHead>
                    <TableHead>Home Team</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Away Team</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSports ? (
                    // Loading state
                    Array(4).fill(0).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-gray-500 dark:text-gray-400">
                        No game results match your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map((game) => (
                      <TableRow key={game.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                            {new Date(game.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{game.league}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{game.homeTeam.name}</TableCell>
                        <TableCell className="font-bold">
                          {game.homeTeam.score} - {game.awayTeam.score}
                        </TableCell>
                        <TableCell className="font-medium">{game.awayTeam.name}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            {game.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-primary">
                            View <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <Button variant="outline" size="sm">
                Load More Results
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="bet-history">
          <div className="bg-white dark:bg-neutral-dark rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium">Your Betting History</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Review your past bets and their outcomes
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Bet Type</TableHead>
                    <TableHead>Selection</TableHead>
                    <TableHead>Odds</TableHead>
                    <TableHead>Stake</TableHead>
                    <TableHead>Profit/Loss</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-gray-500 dark:text-gray-400">
                        No betting history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBets.map((bet) => (
                      <TableRow key={bet.id}>
                        <TableCell>
                          {new Date(bet.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{bet.type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            {bet.selection}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            vs {bet.opponent}
                          </div>
                        </TableCell>
                        <TableCell>
                          {bet.odds > 0 ? `+${bet.odds}` : bet.odds}
                        </TableCell>
                        <TableCell>${bet.stake.toFixed(2)}</TableCell>
                        <TableCell className={bet.profit > 0 ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                          {bet.profit > 0 ? `+$${bet.profit.toFixed(2)}` : `-$${Math.abs(bet.profit).toFixed(2)}`}
                        </TableCell>
                        <TableCell>
                          {bet.status === "Won" ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                              <Check className="h-3 w-3 mr-1" /> Won
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                              <X className="h-3 w-3 mr-1" /> Lost
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-primary">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Bets</div>
                      <div className="text-2xl font-bold mt-1">{betHistory.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Win Rate</div>
                      <div className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                        {((betHistory.filter(bet => bet.status === "Won").length / betHistory.length) * 100).toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Net Profit</div>
                      <div className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                        ${betHistory.reduce((sum, bet) => sum + bet.profit, 0).toFixed(2)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Button variant="outline" size="sm">
                  Download History
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="statistics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Betting Performance</CardTitle>
                <CardDescription>
                  Your betting performance over time
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center p-6">
                    <h3 className="text-xl font-medium mb-2">Betting Performance Chart</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      This area would display a chart of your betting performance over time, showing profit/loss trends.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Bet Type Analysis</CardTitle>
                <CardDescription>
                  Performance by bet type
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center p-6">
                    <h3 className="text-xl font-medium mb-2">Bet Type Chart</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      This area would display a chart showing your win rate and profit/loss by bet type (moneyline, spread, totals, etc.).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Sport Performance Breakdown</CardTitle>
                <CardDescription>
                  How you're performing across different sports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sport</TableHead>
                      <TableHead>Total Bets</TableHead>
                      <TableHead>Win Rate</TableHead>
                      <TableHead>Avg. Odds</TableHead>
                      <TableHead>Profit/Loss</TableHead>
                      <TableHead>ROI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Basketball</TableCell>
                      <TableCell>32</TableCell>
                      <TableCell>62.5%</TableCell>
                      <TableCell>-110</TableCell>
                      <TableCell className="text-green-600 dark:text-green-400">+$256.18</TableCell>
                      <TableCell>12.4%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Football</TableCell>
                      <TableCell>18</TableCell>
                      <TableCell>55.6%</TableCell>
                      <TableCell>-105</TableCell>
                      <TableCell className="text-green-600 dark:text-green-400">+$124.50</TableCell>
                      <TableCell>8.2%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Baseball</TableCell>
                      <TableCell>24</TableCell>
                      <TableCell>45.8%</TableCell>
                      <TableCell>-108</TableCell>
                      <TableCell className="text-red-600 dark:text-red-400">-$86.40</TableCell>
                      <TableCell>-4.8%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Hockey</TableCell>
                      <TableCell>12</TableCell>
                      <TableCell>58.3%</TableCell>
                      <TableCell>-112</TableCell>
                      <TableCell className="text-green-600 dark:text-green-400">+$98.75</TableCell>
                      <TableCell>9.6%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Results;
