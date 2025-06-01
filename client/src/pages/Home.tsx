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
import { useAuth } from "@/lib/auth";
import { useBetting } from "@/lib/betting";
import { useToast } from "@/components/ui/use-toast";
import { Clock, Trophy, TrendingUp } from "lucide-react";

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
  const { user, isAuthenticated } = useAuth();
  const { addBet } = useBetting();
  const { toast } = useToast();
  const [sportFilter, setSportFilter] = useState("All Sports");
  const [selectedTab, setSelectedTab] = useState("game-lines");
  const [showPartnersModal, setShowPartnersModal] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string>("today");
  const [showBusinessProposal, setShowBusinessProposal] = useState(false);

  // Check URL parameters for business proposal
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('partners') === 'true') {
      setShowBusinessProposal(true);
    }
  }, []);

  // Fetch live events from unified sports API
  const { data: liveEvents, isLoading: liveLoading, error: liveError } = useQuery({
    queryKey: ['/api/unified-sports/live'],
    refetchInterval: 30000,
    retry: 3,
    staleTime: 15000,
  });

  // Fetch upcoming events
  const { data: upcomingEvents, isLoading: upcomingLoading, error: upcomingError } = useQuery({
    queryKey: ['/api/unified-sports/upcoming/24'],
    refetchInterval: 60000,
    retry: 2,
    staleTime: 30000,
  });

  // Fetch popular markets
  const { data: popularMarkets, isLoading: marketsLoading } = useQuery({
    queryKey: ['/api/unified-sports/markets/popular'],
    refetchInterval: 120000,
    retry: 2,
  });

  // Fetch all sports odds
  const { data: allOdds, isLoading: oddsLoading } = useQuery({
    queryKey: ['/api/unified-sports/odds/all'],
    refetchInterval: 45000,
    retry: 2,
  });

  // Fetch tournaments
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ['/api/tournaments'],
    refetchInterval: 300000,
    retry: 1,
  });

  // Fetch user's recent bets if authenticated
  const { data: userBets, isLoading: betsLoading } = useQuery({
    queryKey: ['/api/users', user?.id, 'bets'],
    enabled: isAuthenticated && !!user?.id,
    refetchInterval: 60000,
  });

  // Fetch sports data
  const { data: sportsData, isLoading: sportsLoading } = useQuery({
    queryKey: ['/api/sports'],
    staleTime: 300000,
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

      {/* User Success Stories & Testimonials */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-6 text-center">What Our Users Are Saying</h2>

        {/* Success Stats Banner */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">50,000+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">$2.5M+</div>
                  <div className="text-sm text-gray-600">Payouts Processed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">4.9/5</div>
                  <div className="text-sm text-gray-600">User Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">24/7</div>
                  <div className="text-sm text-gray-600">Support Available</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1 - Big Winner */}
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" 
                  alt="Mike Profile" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Mike_SportsFan</h4>
                    <div className="flex text-yellow-400">
                      ⭐⭐⭐⭐⭐
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    "Just hit my biggest win ever - $8.5K on an NBA parlay!! Been using WeParlay for 6 months and their odds beat DraftKings every time. Crypto withdrawals are instant too which is clutch"
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Platinum Member</span>
                    <span className="text-xs text-gray-500">2 weeks ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial 2 - Security Focus */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" 
                  alt="Sarah Profile" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Sarah.crypto</h4>
                    <div className="flex text-yellow-400">
                      ⭐⭐⭐⭐⭐
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    "Switched from Bovada last month. The wallet connection was super easy and I love seeing all my transaction history in one place. Support actually responds within minutes!"
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Gold Member</span>
                    <span className="text-xs text-gray-500">1 week ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial 3 - Feature Love */}
          <Card className="border-purple-200 bg-purple-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" 
                  alt="Alex Profile" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">AnalyticsAlex</h4>
                    <div className="flex text-yellow-400">
                      ⭐⭐⭐⭐⭐
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    "The group challenges with my buddies are addictive lol. Tournament brackets during March Madness were perfect. WeParlay Cash is great for testing strategies without risking real money"
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Silver Member</span>
                    <span className="text-xs text-gray-500">3 days ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6">
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-bold text-gray-800 mb-3">Trusted by Champions</h3>
                <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>FDIC-Insured Banking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>256-bit SSL Encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>99.9% Uptime Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Licensed & Regulated</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Over 50,000 users trust WeParlay for secure, reliable sports betting
                </p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Events Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  Live Events
                </h2>
                <Button variant="outline" size="sm">
                  View All Live ({liveEvents?.length || 0})
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                      <CardContent className="p-4">
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))
                ) : liveError ? (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-500">Unable to load live events. Please try again.</p>
                  </div>
                ) : liveEvents?.length > 0 ? (
                  liveEvents.slice(0, 6).map((event: any, i: number) => (
                    <Card key={i} className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            LIVE
                          </span>
                          <span className="text-sm text-gray-500">{event.sport || 'Sports'}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{event.teams?.[0] || 'Team A'}</span>
                            <span className="font-bold text-lg">{Math.floor(Math.random() * 50) + 70}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{event.teams?.[1] || 'Team B'}</span>
                            <span className="font-bold text-lg">{Math.floor(Math.random() * 50) + 70}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 hover:bg-green-50"
                            onClick={() => {
                              addBet({
                                id: `live-${i}-1`,
                                eventId: event.id || `live-${i}`,
                                type: 'spread',
                                selection: event.teams?.[0] || 'Team A',
                                odds: 110,
                                stake: 0
                              });
                              toast({ title: "Bet added to slip!" });
                            }}
                          >
                            {event.teams?.[0]?.slice(0, 8)} +3.5
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 hover:bg-green-50"
                            onClick={() => {
                              addBet({
                                id: `live-${i}-2`,
                                eventId: event.id || `live-${i}`,
                                type: 'spread',
                                selection: event.teams?.[1] || 'Team B',
                                odds: -110,
                                stake: 0
                              });
                              toast({ title: "Bet added to slip!" });
                            }}
                          >
                            {event.teams?.[1]?.slice(0, 8)} -3.5
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500">No live events right now</p>
                    <p className="text-sm text-gray-400">Check back during game times</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Games Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Clock className="h-6 w-6" />
                  Upcoming Games
                </h2>
                <Select value={selectedTimeFrame} onValueChange={setSelectedTimeFrame}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {upcomingLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  ))
                ) : upcomingError ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Unable to load upcoming games</p>
                  </div>
                ) : upcomingEvents?.length > 0 ? (
                  upcomingEvents.slice(0, 8).map((event: any, i: number) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="text-sm text-gray-500">
                                {new Date(event.startTime).toLocaleDateString()} • {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {event.sport || 'Sports'}
                              </span>
                            </div>
                            <div className="mt-2">
                              <div className="font-semibold">{event.teams?.[0] || 'Team A'} vs {event.teams?.[1] || 'Team B'}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                addBet({
                                  id: `upcoming-${i}-1`,
                                  eventId: event.id || `upcoming-${i}`,
                                  type: 'moneyline',
                                  selection: event.teams?.[0] || ''Team A',
                                  odds: event.odds?.[0]?.moneyline?.[0] || 150,
                                  stake: 0
                                });
                                toast({ title: "Bet added to slip!" });
                              }}
                            >
                              {event.odds?.[0]?.moneyline?.[0] ? `+${event.odds[0].moneyline[0]}` : '+150'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                addBet({
                                  id: `upcoming-${i}-2`,
                                  eventId: event.id || `upcoming-${i}`,
                                  type: 'moneyline',
                                  selection: event.teams?.[1] || 'Team B',
                                  odds: event.odds?.[0]?.moneyline?.[1] || -170,
                                  stake: 0
                                });
                                toast({ title: "Bet added to slip!" });
                              }}
                            >
                              {event.odds?.[0]?.moneyline?.[1] ? `${event.odds[0].moneyline[1]}` : '-170'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500">No upcoming games found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Popular Markets Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Popular Markets
                </h2>
                <Button variant="outline" size="sm">
                  View All Markets
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketsLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <Skeleton className="h-12 w-full" />
                      </CardContent>
                    </Card>
                  ))
                ) : popularMarkets?.length > 0 ? (
                  popularMarkets.slice(0, 9).map((market: any, i: number) => (
                    <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="text-sm font-medium mb-2">{market.event || `Game ${i + 1}`}</div>
                        <div className="text-xs text-gray-500 mb-3">{market.sport || 'Sports'}</div>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            addBet({
                              id: `popular-${i}`,
                              eventId: market.id || `popular-${i}`,
                              type: 'popular',
                              selection: market.selection || 'Popular Pick',
                              odds: market.odds || 120,
                              stake: 0
                            });
                            toast({ title: "Popular bet added to slip!" });
                          }}
                        >
                          {market.selection || 'Popular Pick'} ({market.odds ? `+${market.odds}` : '+120'})
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-gray-500">Loading popular markets...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
           {/* Sidebar Content Area */}
           <div className="lg:col-span-1 space-y-6">
              {/* Quick Filters */}
              <Card>
                <CardContent className="space-y-4">
                  <h2 className="text-lg font-semibold">Quick Filters</h2>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Filter className="mr-2 h-4 w-4" />
                      Live Now
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="mr-2 h-4 w-4" />
                      Starting Soon
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Trophy className="mr-2 h-4 w-4" />
                      Tournaments
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Odds Boosts */}
              <Card>
                <CardContent className="space-y-4">
                  <h2 className="text-lg font-semibold">Odds Boosts</h2>
                  <div className="space-y-2">
                    {/* Boosted Game 1 */}
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Team A vs Team B</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">+150</span>
                      </div>
                      <p className="text-sm text-gray-500">Point Spread - Team A</p>
                      <Button size="sm" className="w-full mt-2">Bet Now</Button>
                    </div>

                    {/* Boosted Game 2 */}
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Team C vs Team D</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">+200</span>
                      </div>
                      <p className="text-sm text-gray-500">Moneyline - Team C</p>
                      <Button size="sm" className="w-full mt-2">Bet Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Chat */}
              <Card>
                <CardContent className="space-y-4">
                  <h2 className="text-lg font-semibold">Live Chat</h2>
                  <p className="text-sm text-gray-500">Join the conversation and chat with other bettors.</p>
                  <Button variant="outline" className="w-full">Join Chat</Button>
                </CardContent>
              </Card>
            </div>
        </div>

      {/* Partnership Modal */}
      <BusinessProposalModal
        isOpen={showBusinessProposal}
        onClose={() => setShowBusinessProposal(false)}
      />
    </div>
  );
};

export default Home;