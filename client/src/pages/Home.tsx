import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import sportsBetAPI from "@/lib/sportsBetAPI";
import GameCard from "@/components/betting/GameCard";
import UpcomingGameCard from "@/components/betting/UpcomingGameCard";
import BracketView from "@/components/tournaments/BracketView";
import FantasyTeamBuilder from "@/components/fantasy/FantasyTeamBuilder";
import PlayerPropsTable from "@/components/betting/PlayerPropsTable";
import { StatsCarousel } from "@/components/StatsCarousel";
import WelcomeDashboard from "@/components/dashboard/WelcomeDashboard";
import OnboardingExperience from "@/components/onboarding/OnboardingExperience";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, BarChart2 } from "lucide-react";

const Home: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");

  // Fetch live events with real API data
  const { data: liveEvents, isLoading: isLoadingLive } = useQuery({
    queryKey: ['/api/events/live'],
    refetchInterval: 5000,
    onError: (error) => console.error('Live events error:', error)
  });

  // Show onboarding for new users
  if (!localStorage.getItem('hasVisited')) {
    return <OnboardingExperience />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Welcome Dashboard */}
      <WelcomeDashboard />

      {/* Filters and Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={selectedSport} onValueChange={setSelectedSport}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            <SelectItem value="football">Football</SelectItem>
            <SelectItem value="basketball">Basketball</SelectItem>
            <SelectItem value="baseball">Baseball</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="live" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="live">Live Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart2 className="h-4 w-4 mr-2" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          <TabsTrigger value="fantasy">Fantasy</TabsTrigger>
          <TabsTrigger value="props">Player Props</TabsTrigger>
        </TabsList>

        {/* Live Events Tab */}
        <TabsContent value="live" className="space-y-4">
          <StatsCarousel />
          
          {isLoadingLive ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : liveEvents && Array.isArray(liveEvents) && liveEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveEvents.map((event: any, index: number) => (
                <GameCard 
                  key={event.id || index} 
                  game={{
                    id: event.id,
                    homeTeam: {
                      name: event.home_team || 'Home Team',
                      logo: '',
                      score: event.home_score || 0
                    },
                    awayTeam: {
                      name: event.away_team || 'Away Team', 
                      logo: '',
                      score: event.away_score || 0
                    },
                    sport: event.sport_title || 'Live Event',
                    status: 'live',
                    startTime: event.commence_time || new Date().toISOString(),
                    odds: {
                      moneyline: { home: -110, away: +120 },
                      spread: { home: { line: -3.5, odds: -110 }, away: { line: 3.5, odds: -110 } },
                      total: { over: { line: 45.5, odds: -110 }, under: { line: 45.5, odds: -110 } }
                    }
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No live events available</p>
            </div>
          )}
        </TabsContent>

        {/* Upcoming Events Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          {isLoadingLive ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <UpcomingGameCard 
                  key={i}
                  game={{
                    id: i,
                    homeTeam: { name: 'Team A', logo: '' },
                    awayTeam: { name: 'Team B', logo: '' },
                    sport: 'NFL',
                    startTime: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
                    odds: { moneyline: { home: -110, away: +120 } }
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <StatsCarousel />
        </TabsContent>

        {/* Tournaments Tab */}
        <TabsContent value="tournaments">
          <div className="max-w-4xl mx-auto">
            <BracketView tournamentId={1} />
          </div>
        </TabsContent>

        {/* Fantasy Tab */}
        <TabsContent value="fantasy">
          <div className="max-w-6xl mx-auto">
            <FantasyTeamBuilder 
              availablePlayers={[]}
              onTeamUpdate={() => {}}
              salaryCap={50000}
            />
          </div>
        </TabsContent>

        {/* Player Props Tab */}
        <TabsContent value="props">
          <PlayerPropsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home;