import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBetSlip } from '@/contexts/BetSlipContext';
import { Play, Clock, Trophy, Users } from "lucide-react";

const Home: React.FC = () => {
  const { addBet } = useBetSlip();

  // Fetch real live events
  const { data: liveEvents, isLoading: loadingLive } = useQuery({
    queryKey: ['/api/events/live'],
    refetchInterval: 10000,
  });

  // Fetch real upcoming events
  const { data: upcomingEvents, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['/api/events/upcoming'],
    refetchInterval: 30000,
  });

  // Fetch real sports data
  const { data: sports, isLoading: loadingSports } = useQuery({
    queryKey: ['/api/sports'],
    refetchInterval: 60000,
  });

  const handleBet = (event: any, betType: string, selection: string, odds: number) => {
    addBet({
      id: `${event.id}-${betType}-${selection}`,
      eventId: event.id,
      gameTitle: `${event.away_team || 'Away'} vs ${event.home_team || 'Home'}`,
      betType,
      selection,
      odds,
      amount: 0,
      potential: 0,
      sport: event.sport_title || 'Live Event',
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to WeParlay</h1>
        <p className="text-lg text-gray-600">Professional Sports Betting with Real-Time Data</p>
      </div>

      {/* Live Events Section - Only show if there are actual live events */}
      {Array.isArray(liveEvents) && liveEvents.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold">Live Events</h2>
            <Badge variant="secondary" className="animate-pulse">
              {liveEvents.length} Live Now
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveEvents.slice(0, 6).map((event: any, index: number) => (
              <Card key={event.id || index} className="border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {event.away_team || 'Away'} vs {event.home_team || 'Home'}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{event.sport_title}</Badge>
                        <Badge variant="secondary" className="animate-pulse">LIVE</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleBet(event, 'moneyline', event.away_team || 'Away', -110)}
                    >
                      <span>{event.away_team || 'Away'}</span>
                      <span className="ml-2 font-mono">-110</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleBet(event, 'moneyline', event.home_team || 'Home', +120)}
                    >
                      <span>{event.home_team || 'Home'}</span>
                      <span className="ml-2 font-mono">+120</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events Section - Only show if there are actual upcoming events */}
      {Array.isArray(upcomingEvents) && upcomingEvents.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <Badge variant="outline">
              {upcomingEvents.length} Scheduled
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingEvents.slice(0, 8).map((event: any, index: number) => (
              <Card key={event.id || index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {event.away_team || 'Away'} vs {event.home_team || 'Home'}
                  </CardTitle>
                  <Badge variant="outline" className="w-fit">
                    {event.sport_title}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 mb-3">
                    {event.commence_time ? new Date(event.commence_time).toLocaleDateString() : 'TBD'}
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleBet(event, 'pre-game', 'Early Line', -105)}
                  >
                    View Lines
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sports Categories - Only show if we have real sports data */}
      {Array.isArray(sports) && sports.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold">Available Sports</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sports.map((sport: any) => (
              <Card key={sport.id} className="text-center cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="font-medium">{sport.name}</h3>
                  <p className="text-sm text-gray-600">
                    {sport.event_count || 0} events
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats - Only show real data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-red-500" />
              Live Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Array.isArray(liveEvents) ? liveEvents.length : 0}
            </div>
            <p className="text-sm text-gray-600">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Array.isArray(upcomingEvents) ? upcomingEvents.length : 0}
            </div>
            <p className="text-sm text-gray-600">Scheduled events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-orange-500" />
              Sports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Array.isArray(sports) ? sports.length : 0}
            </div>
            <p className="text-sm text-gray-600">Available markets</p>
          </CardContent>
        </Card>
      </div>

      {/* Loading States */}
      {(loadingLive || loadingUpcoming || loadingSports) && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading real-time sports data...</p>
        </div>
      )}

      {/* No Data Message */}
      {!loadingLive && !loadingUpcoming && !loadingSports && 
       (!Array.isArray(liveEvents) || liveEvents.length === 0) &&
       (!Array.isArray(upcomingEvents) || upcomingEvents.length === 0) &&
       (!Array.isArray(sports) || sports.length === 0) && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Events Available</h3>
          <p className="text-gray-600">Check back later for live sports events and betting opportunities.</p>
        </div>
      )}
    </div>
  );
};

export default Home;