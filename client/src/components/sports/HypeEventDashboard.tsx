import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Flame, Star, Clock, Filter, SortDesc } from 'lucide-react';
import EventCountdownWidget from './EventCountdownWidget';
import { useQuery } from '@tanstack/react-query';

interface HypeEventDashboardProps {
  onEventSelect?: (event: any) => void;
}

export default function HypeEventDashboard({ onEventSelect }: HypeEventDashboardProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('hype');

  // Fetch real sports events from your API
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events/upcoming'],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Sample events for demonstration - replace with real API data
  const sampleEvents = [
    {
      id: 1,
      homeTeam: 'Los Angeles Lakers',
      awayTeam: 'Golden State Warriors',
      homeTeamLogo: 'https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg',
      awayTeamLogo: 'https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      sport: 'Basketball',
      league: 'NBA',
      venue: 'Crypto.com Arena',
      importance: 'high' as const,
      odds: { home: 120, away: 110 },
      hypeScore: 85,
      trending: true
    },
    {
      id: 2,
      homeTeam: 'Kansas City Chiefs',
      awayTeam: 'Buffalo Bills',
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      sport: 'Football',
      league: 'NFL',
      venue: 'Arrowhead Stadium',
      importance: 'championship' as const,
      odds: { home: 105, away: 115 },
      hypeScore: 95,
      trending: true
    },
    {
      id: 3,
      homeTeam: 'Manchester City',
      awayTeam: 'Liverpool',
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      sport: 'Soccer',
      league: 'Premier League',
      venue: 'Etihad Stadium',
      importance: 'high' as const,
      odds: { home: 140, away: 180, draw: 250 },
      hypeScore: 78,
      trending: false
    },
    {
      id: 4,
      homeTeam: 'Boston Celtics',
      awayTeam: 'Miami Heat',
      startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      sport: 'Basketball',
      league: 'NBA',
      venue: 'TD Garden',
      importance: 'medium' as const,
      odds: { home: 95, away: 125 },
      hypeScore: 62,
      trending: false
    }
  ];

  // Use real events if available, otherwise use sample data
  const displayEvents = events.length > 0 ? events : sampleEvents;

  const filterEvents = (events: any[]) => {
    let filtered = events;
    
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'trending') {
        filtered = filtered.filter(event => event.trending);
      } else if (selectedFilter === 'championship') {
        filtered = filtered.filter(event => event.importance === 'championship');
      } else if (selectedFilter === 'today') {
        const today = new Date();
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.startTime);
          return eventDate.toDateString() === today.toDateString();
        });
      }
    }

    // Sort events
    if (sortBy === 'hype') {
      filtered.sort((a, b) => (b.hypeScore || 0) - (a.hypeScore || 0));
    } else if (sortBy === 'time') {
      filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }

    return filtered;
  };

  const filteredEvents = filterEvents(displayEvents);

  const getHypeStats = () => {
    const trending = displayEvents.filter(e => e.trending).length;
    const highHype = displayEvents.filter(e => (e.hypeScore || 0) >= 80).length;
    const total = displayEvents.length;
    
    return { trending, highHype, total };
  };

  const stats = getHypeStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="bg-gradient-to-r from-purple-900 to-blue-900 border-purple-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-2xl font-bold flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              Sports Hype Center
            </CardTitle>
            
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-gray-300">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{stats.trending}</div>
                <div className="text-sm text-gray-300">Trending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{stats.highHype}</div>
                <div className="text-sm text-gray-300">High Hype</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Sorting */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                All Events
              </Button>
              <Button
                variant={selectedFilter === 'trending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('trending')}
                className="flex items-center gap-1"
              >
                <TrendingUp className="h-3 w-3" />
                Trending
              </Button>
              <Button
                variant={selectedFilter === 'championship' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('championship')}
                className="flex items-center gap-1"
              >
                <Star className="h-3 w-3" />
                Championship
              </Button>
              <Button
                variant={selectedFilter === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('today')}
                className="flex items-center gap-1"
              >
                <Clock className="h-3 w-3" />
                Today
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Button
                variant={sortBy === 'hype' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('hype')}
              >
                Sort by Hype
              </Button>
              <Button
                variant={sortBy === 'time' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('time')}
              >
                Sort by Time
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCountdownWidget
                key={event.id}
                event={event}
                size="standard"
                onBetClick={onEventSelect}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <EventCountdownWidget
                key={event.id}
                event={event}
                size="compact"
                onBetClick={onEventSelect}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Live Updates Indicator */}
      <Card className="bg-green-900 border-green-700">
        <CardContent className="pt-4">
          <div className="flex items-center justify-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Live updates every 30 seconds</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No events found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters to see more events
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}