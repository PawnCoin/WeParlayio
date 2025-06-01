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

// Featured game will be pulled from real API data



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

  // Get upcoming events from unified sports endpoint
  const { data: upcomingEvents, isLoading: isLoadingUpcomingEvents } = useQuery({
    queryKey: ["/api/unified-sports/upcoming-events"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/unified-sports/upcoming-events');
        if (response.ok) {
          const data = await response.json();
          console.log('Upcoming events API response:', data);
          console.log('Events array:', data.events);
          console.log('Events array length:', data.events?.length);
          return data.events || [];
        }
        return [];
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
              .filter((event: any) => sportFilter === "All Sports" || event.sport?.includes(sportFilter) || event.league?.includes(sportFilter))
              .slice(0, 6)
              .map((event: any) => (
                <UpcomingGameCard key={`${event.id}-${event.sport || 'unknown'}`} game={{
                  id: event.id,
                  homeTeam: {
                    id: 1,
                    name: event.homeTeam,
                    logo: ""
                  },
                  awayTeam: {
                    id: 2,
                    name: event.awayTeam,
                    logo: ""
                  },
                  startTime: event.date,
                  bookmakers: [],
                  odds: {
                    homeSpread: { line: -3.5, odds: -110 },
                    awaySpread: { line: 3.5, odds: -110 },
                    total: { line: 220.5, odds: -110 }
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
    </div>
  );
};

export default Home;