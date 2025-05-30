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
import BusinessProposalModal from "@/components/business/BusinessProposalModal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, BarChart2, Handshake, Users, Crown, Sparkles } from "lucide-react";

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



const Home: React.FC = () => {
  const [sportFilter, setSportFilter] = useState("All Sports");
  const [selectedTab, setSelectedTab] = useState("game-lines");
  const [showPartnersModal, setShowPartnersModal] = useState(false);

  // Get all available sports
  const { data: sports, isLoading: isLoadingSports } = useQuery({
    queryKey: ["/api/sports"],
    queryFn: () => sportsBetAPI.getSports(),
  });

  // Get live events from all sports
  const { data: liveEvents, isLoading: isLoadingLiveEvents } = useQuery({
    queryKey: ["/api/events/live"],
    queryFn: () => sportsBetAPI.getLiveEvents(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get upcoming events from all sports
  const { data: upcomingEvents, isLoading: isLoadingUpcomingEvents } = useQuery({
    queryKey: ["/api/events/upcoming"],
    queryFn: async () => {
      try {
        // Try unified sports API first
        const response = await fetch('/api/unified-sports/upcoming-events?limit=10');
        if (response.ok) {
          const data = await response.json();
          return data.events || data || [];
        }
        
        // Fallback to individual sport endpoints
        const sports = ['basketball_nba', 'basketball_wnba', 'baseball_mlb', 'americanfootball_nfl'];
        const allEvents = [];
        
        for (const sport of sports) {
          try {
            const sportResponse = await fetch(`/api/sports/${sport}/upcoming?limit=3`);
            if (sportResponse.ok) {
              const sportData = await sportResponse.json();
              allEvents.push(...(Array.isArray(sportData) ? sportData : []));
            }
          } catch (error) {
            console.log(`Failed to fetch ${sport} upcoming events`);
          }
        }
        
        return allEvents.slice(0, 10);
      } catch (error) {
        console.error('Failed to fetch upcoming events:', error);
        return [];
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Get active tournament
  const { data: activeTournament, isLoading: isLoadingTournament } = useQuery({
    queryKey: ["/api/tournaments/1"],
    queryFn: () => sportsBetAPI.getTournament(1),
    retry: false,
    // Silently handle tournament not found error
    onError: (error) => {
      console.log("Active tournament not found", error);
    }
  });

  return (
    <div data-bind="dashboard">
      {/* Interactive Onboarding Experience */}
      <OnboardingExperience />

      {/* Personalized Welcome Dashboard */}
      <div className="mb-8">
        <WelcomeDashboard />
      </div>

      {/* Partnership Opportunities Banner */}
      <div className="mb-6">
        <Card className="bg-gradient-to-r from-gray-900 via-slate-900 to-black border-0 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-slate-900/95 to-black/95"></div>
          <CardContent className="relative z-10 p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-2">
                  <Crown className="h-5 w-5 text-yellow-400 mr-2" />
                  <h2 className="text-lg font-bold">Partner with WeParlay</h2>
                  <Sparkles className="h-4 w-4 text-yellow-400 ml-2" />
                </div>
                <p className="text-sm text-gray-300">
                  🎯 Up to $60,000/month • 🔥 Premium API showcase • 💎 VIP tier access
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  size="sm"
                  onClick={() => setShowPartnersModal(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-2 rounded-lg transition-all duration-200"
                >
                  <Handshake className="h-4 w-4 mr-1" />
                  Explore
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPartnersModal(true)}
                  className="border border-gray-400 text-gray-300 hover:bg-gray-800 hover:text-white font-bold px-4 py-2 rounded-lg transition-all duration-200"
                >
                  <Users className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Header With Tabs */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Sports Betting</h1>
          <div className="flex space-x-2">
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Sports">All Sports</SelectItem>
                {sports && sports.map((sport: any) => (
                  <SelectItem key={sport.key} value={sport.key}>
                    {sport.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
          <Tabs defaultValue="game-lines" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="flex-wrap">
              <TabsTrigger value="game-lines">Game Lines</TabsTrigger>
              <TabsTrigger value="player-props">Player Props</TabsTrigger>
              <TabsTrigger value="team-props">Team Props</TabsTrigger>
              <TabsTrigger value="parlays">Parlays</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Live Streaming Promotion - Simple but Effective */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 border-0 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 via-red-700/90 to-red-800/90"></div>
          <div className="absolute top-2 right-2">
            <div className="flex items-center bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
              LIVE
            </div>
          </div>
          <CardContent className="relative z-10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2 flex items-center">
                  <Crown className="h-6 w-6 text-yellow-400 mr-2" />
                  Watch Games Live While You Bet
                </h3>
                <p className="text-red-100 mb-3">
                  🔥 Stream live sports directly on WeParlay • Real-time betting • No switching apps
                </p>
                <p className="text-sm text-red-200">
                  Exclusive to Platinum members only
                </p>
              </div>
              <div className="text-right">
                <Button 
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                >
                  Upgrade to Platinum
                </Button>
                <p className="text-xs text-red-200 mt-1">Join the elite</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Animated Sports Stats Carousel */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-primary" />
          Sports Stats Leaders
        </h2>
        <StatsCarousel />
      </div>

      {/* Live Events Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
          Live Events
        </h2>

        {isLoadingLiveEvents ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : liveEvents && liveEvents.length > 0 ? (
          <div className="space-y-4">
            {liveEvents
              .filter((event: any) => sportFilter === "All Sports" || event.sport_key === sportFilter)
              .map((event: any) => (
                <GameCard key={event.id} game={{
                  id: event.id,
                  homeTeam: {
                    id: event.home_team_id,
                    name: event.home_team,
                    logo: "",
                    record: event.home_record || "",
                    location: "Home"
                  },
                  awayTeam: {
                    id: event.away_team_id,
                    name: event.away_team,
                    logo: "",
                    record: event.away_record || "",
                    location: "Away"
                  },
                  startTime: event.commence_time,
                  status: "live",
                  homeScore: event.scores?.home || 0,
                  awayScore: event.scores?.away || 0,
                  period: event.period || "In Progress",
                  timeRemaining: event.time_remaining || "",
                  sportName: event.sport_title || "Sports",
                  odds: event.bookmakers?.[0]?.markets || {}
                }} />
              ))}
          </div>
        ) : (
          <div className="bg-muted/30 p-8 text-center rounded-lg">
            <p className="text-muted-foreground">No live events at the moment. Check back later!</p>
          </div>
        )}
      </div>

      {/* Upcoming Events Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>

        {isLoadingUpcomingEvents ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents
              .filter((event: any) => sportFilter === "All Sports" || event.sport_key === sportFilter || event.sport_key?.includes(sportFilter))
              .slice(0, 6)
              .map((event: any) => (
                <UpcomingGameCard key={`${event.id}-${event.sport_key || 'unknown'}`} game={{
                  id: event.id,
                  homeTeam: {
                    id: event.home_team_id || 1,
                    name: event.home_team,
                    logo: ""
                  },
                  awayTeam: {
                    id: event.away_team_id || 2,
                    name: event.away_team,
                    logo: ""
                  },
                  startTime: event.commence_time,
                  bookmakers: event.bookmakers || [],
                  odds: {
                    homeSpread: event.bookmakers?.[0]?.markets?.find((m: any) => m.key === "spreads")?.outcomes?.find((o: any) => o.name === event.home_team) || { line: -3.5, odds: -110 },
                    awaySpread: event.bookmakers?.[0]?.markets?.find((m: any) => m.key === "spreads")?.outcomes?.find((o: any) => o.name === event.away_team) || { line: 3.5, odds: -110 },
                    total: event.bookmakers?.[0]?.markets?.find((m: any) => m.key === "totals")?.outcomes?.[0] || { line: 220.5, odds: -110 }
                  }
                }} />
              ))}
          </div>
        ) : (
          <div className="bg-muted/30 p-8 text-center rounded-lg">
            <p className="text-muted-foreground">No upcoming events found. Check back later!</p>
          </div>
        )}
      </div>

      {/* Tournament Bracket Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Tournament Bracket</h2>
        <BracketView tournamentId={1} />
      </div>

      {/* Fantasy Tools Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Fantasy Tools</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Partnership Modal */}
      <BusinessProposalModal 
        isOpen={showPartnersModal}
        onClose={() => setShowPartnersModal(false)}
      />
    </div>
  );
};

export default Home;