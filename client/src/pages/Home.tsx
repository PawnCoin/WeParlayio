import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import sportsBetAPI from "@/lib/sportsBetAPI";
import GameCard from "@/components/betting/GameCard";
import UpcomingGameCard from "@/components/betting/UpcomingGameCard";
import BracketView from "@/components/tournaments/BracketView";
import FantasyTeamBuilder from "@/components/fantasy/FantasyTeamBuilder";
import PlayerPropsTable from "@/components/betting/PlayerPropsTable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, BarChart2 } from "lucide-react";

const featuredGame = {
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
};

const upcomingGames = [
  {
    id: 2,
    homeTeam: {
      id: 3,
      name: "Milwaukee Bucks",
      logo: ""
    },
    awayTeam: {
      id: 4,
      name: "Miami Heat",
      logo: ""
    },
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    odds: {
      homeSpread: {
        line: -2.5,
        odds: -110
      },
      awaySpread: {
        line: 2.5,
        odds: -110
      },
      total: {
        line: 218.5,
        odds: -110
      }
    }
  },
  {
    id: 3,
    homeTeam: {
      id: 5,
      name: "Chicago Bulls",
      logo: ""
    },
    awayTeam: {
      id: 6,
      name: "Detroit Pistons",
      logo: ""
    },
    startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    odds: {
      homeSpread: {
        line: -5.5,
        odds: -110
      },
      awaySpread: {
        line: 5.5,
        odds: -110
      },
      total: {
        line: 214.5,
        odds: -110
      }
    }
  }
];

const Home: React.FC = () => {
  const [sportFilter, setSportFilter] = useState("All Games");
  
  const { data: sports, isLoading: isLoadingSports } = useQuery({
    queryKey: ["/api/sports"],
    queryFn: () => sportsBetAPI.getSports(),
  });
  
  const { data: activeTournament, isLoading: isLoadingTournament } = useQuery({
    queryKey: ["/api/tournaments/1"],
    queryFn: () => sportsBetAPI.getTournament(1),
  });
  
  return (
    <div data-bind="dashboard">
      {/* Dashboard Header With Tabs */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">NBA Basketball</h1>
          <div className="flex space-x-2">
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Games" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Games">All Games</SelectItem>
                <SelectItem value="Live Only">Live Only</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>
        
        <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
          <Tabs defaultValue="game-lines" className="w-full">
            <TabsList className="flex-wrap">
              <TabsTrigger value="game-lines">Game Lines</TabsTrigger>
              <TabsTrigger value="player-props">Player Props</TabsTrigger>
              <TabsTrigger value="team-props">Team Props</TabsTrigger>
              <TabsTrigger value="parlays">Parlays</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Featured Game Card */}
      <GameCard game={featuredGame} />
      
      <h2 className="text-lg font-bold mt-8 mb-4">Upcoming Games</h2>
      
      {/* Upcoming Games */}
      {upcomingGames.map(game => (
        <UpcomingGameCard key={game.id} game={game} />
      ))}
      
      {/* Tournament Bracket Section */}
      <h2 className="text-lg font-bold mt-8 mb-4">Tournament Bracket</h2>
      <BracketView tournamentId={1} />
      
      {/* Fantasy Tools Section */}
      <h2 className="text-lg font-bold mt-8 mb-4">Fantasy Tools</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Fantasy Team Builder */}
        <FantasyTeamBuilder />
        
        {/* Player Props Tool */}
        <Card>
          <CardContent className="p-0">
            <div className="bg-accent/10 p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-accent">Player Props Tool</h3>
                <span className="text-xs bg-accent text-white px-2 py-1 rounded">Odds Comparison</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Compare player props across multiple sportsbooks</p>
            </div>
            
            <div className="p-4">
              <PlayerPropsTable />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
