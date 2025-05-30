
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  Star,
  Target,
  Award,
  Timer,
  DollarSign
} from 'lucide-react';

const FantasySports: React.FC = () => {
  const [activeLeagues] = useState([
    {
      id: 1,
      name: "NBA Championship League",
      sport: "Basketball",
      entryFee: 25,
      participants: 847,
      prizePool: 21175,
      timeLeft: "2h 34m",
      status: "filling"
    },
    {
      id: 2,
      name: "NFL Sunday Showdown", 
      sport: "Football",
      entryFee: 50,
      participants: 1250,
      prizePool: 62500,
      timeLeft: "1d 5h",
      status: "open"
    },
    {
      id: 3,
      name: "MLB Daily Diamonds",
      sport: "Baseball", 
      entryFee: 10,
      participants: 500,
      prizePool: 5000,
      timeLeft: "45m",
      status: "closing"
    }
  ]);

  const [playerStats] = useState([
    { name: "LeBron James", team: "LAL", position: "PF", salary: 11200, projection: 52.3 },
    { name: "Stephen Curry", team: "GSW", position: "PG", salary: 10800, projection: 48.7 },
    { name: "Kevin Durant", team: "PHX", position: "SF", salary: 10500, projection: 46.9 },
    { name: "Giannis Antetokounmpo", team: "MIL", position: "PF", salary: 12000, projection: 58.1 }
  ]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Fantasy Sports
        </h1>
        <p className="text-muted-foreground text-lg">
          Draft your dream team and compete for real money prizes
        </p>
      </div>

      <Tabs defaultValue="contests" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contests">Active Contests</TabsTrigger>
          <TabsTrigger value="players">Player Research</TabsTrigger>
          <TabsTrigger value="lineups">My Lineups</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="contests" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeLeagues.map((league) => (
              <Card key={league.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{league.name}</CardTitle>
                    <Badge 
                      variant={league.status === 'closing' ? 'destructive' : 'default'}
                    >
                      {league.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{league.sport}</div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Entry Fee
                      </span>
                      <span className="font-bold">${league.entryFee}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Participants
                      </span>
                      <span>{league.participants.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        Prize Pool
                      </span>
                      <span className="font-bold text-green-600">
                        ${league.prizePool.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        Time Left
                      </span>
                      <span className="text-red-600 font-medium">{league.timeLeft}</span>
                    </div>

                    <Button className="w-full mt-4">
                      <Target className="h-4 w-4 mr-2" />
                      Enter Contest
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="players" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top NBA Players - Tonight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Player</th>
                      <th className="text-left p-2">Team</th>
                      <th className="text-left p-2">Position</th>
                      <th className="text-left p-2">Salary</th>
                      <th className="text-left p-2">Projection</th>
                      <th className="text-left p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerStats.map((player, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{player.name}</td>
                        <td className="p-2">{player.team}</td>
                        <td className="p-2">
                          <Badge variant="outline">{player.position}</Badge>
                        </td>
                        <td className="p-2">${player.salary.toLocaleString()}</td>
                        <td className="p-2">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            {player.projection}
                          </span>
                        </td>
                        <td className="p-2">
                          <Button size="sm" variant="outline">Add</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lineups" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No Lineups Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first lineup to start competing!
              </p>
              <Button>
                <Target className="h-4 w-4 mr-2" />
                Create Lineup
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No Results Yet</h3>
              <p className="text-muted-foreground">
                Your contest results will appear here after completion.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FantasySports;
