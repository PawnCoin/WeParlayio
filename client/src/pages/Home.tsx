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
    queryFn: () => sportsBetAPI.getUpcomingEvents(10), // Get next 10 upcoming events
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
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 border-0 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-blue-800/90"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.2
          }}></div>
          <CardContent className="relative z-10 p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-4">
                  <Crown className="h-8 w-8 text-yellow-400 mr-3" />
                  <h2 className="text-3xl font-bold">Partner with WeParlay</h2>
                  <Sparkles className="h-6 w-6 text-yellow-400 ml-2" />
                </div>
                <p className="text-xl mb-2 text-blue-100">
                  Join our elite partnership program and unlock massive revenue opportunities
                </p>
                <p className="text-lg text-blue-200">
                  🎯 Up to $60,000/month potential • 🔥 Premium API showcase • 💎 VIP tier access
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => setShowPartnersModal(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Handshake className="h-5 w-5 mr-2" />
                  Explore Partnerships
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowPartnersModal(true)}
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-xl transition-all duration-200"
                >
                  <Users className="h-5 w-5 mr-2" />
                  View Opportunities
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-yellow-400">25-45%</div>
                <div className="text-sm text-blue-200">Commission Rates</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-yellow-400">$100K+</div>
                <div className="text-sm text-blue-200">Annual Commitment</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-yellow-400">50K+</div>
                <div className="text-sm text-blue-200">User Exposure</div>
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
              .filter((event: any) => sportFilter === "All Sports" || event.sport_key === sportFilter)
              .map((event: any) => (
                <UpcomingGameCard key={event.id} game={{
                  id: event.id,
                  homeTeam: {
                    id: event.home_team_id,
                    name: event.home_team,
                    logo: ""
                  },
                  awayTeam: {
                    id: event.away_team_id,
                    name: event.away_team,
                    logo: ""
                  },
                  startTime: event.commence_time,
                  odds: {
                    homeSpread: event.bookmakers?.[0]?.markets?.find((m: any) => m.key === "spreads")?.outcomes?.find((o: any) => o.name === event.home_team) || { line: 0, odds: 0 },
                    awaySpread: event.bookmakers?.[0]?.markets?.find((m: any) => m.key === "spreads")?.outcomes?.find((o: any) => o.name === event.away_team) || { line: 0, odds: 0 },
                    total: event.bookmakers?.[0]?.markets?.find((m: any) => m.key === "totals")?.outcomes?.[0] || { line: 0, odds: 0 }
                  }
                }} />
              ))}
          </div>
        ) : (
          <div className="bg-muted/30 p-8 text-center rounded-lg">
            <p className="text-muted-foreground">No upcoming events found.</p>
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