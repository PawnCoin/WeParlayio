import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import sportsBetAPI from '@/lib/sportsBetAPI';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, Clock, TrendingUp, CircleDot, Activity,
  ChevronRight, ArrowUpRight, ArrowDownRight, Flame
} from 'lucide-react';
import GameCard from '@/components/betting/GameCard';
import { Separator } from '@/components/ui/separator';

// Get sport icon function - used for displaying icon in the header
const getSportIcon = (sportKey: string) => {
  // Importing dynamically to avoid circular dependencies
  const icons: Record<string, React.ReactNode> = {
    'basketball': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93 19.07 19.07"/><path d="M4.93 19.07 19.07 4.93"/><path d="M12 2a10 10 0 0 0 0 20"/><path d="M12 2v20"/></svg>,
    'football': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M12 12 2.1 7.1"/><path d="m12 12 9.9 4.9"/></svg>,
    'baseball': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.13 11.24a1 1 0 0 0 .4 1.36l5.39 3.13c.4.24.87.24 1.27 0l5.39-3.13a1 1 0 0 0 .4-1.36l-2.7-4.68a1 1 0 0 0-1.31-.38l-2.28 1.12a1 1 0 0 1-.9 0L8.5 6.18a1 1 0 0 0-1.3.38Z"/><path d="M12 22v-8"/><path d="M5 5a17 17 0 0 1 14 0"/></svg>,
    'hockey': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4 7 15l4 5h8l-4-5 4-11h-4Z"/><path d="M9 15 5 4l-2 1"/></svg>
  };
  
  const key = sportKey.split('_')[0];
  return icons[key] || <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>;
};

// Formatted time for display
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

const SportPage: React.FC = () => {
  const [, params] = useRoute<{ sportKey: string }>('/sports/:sportKey');
  const sportKey = params?.sportKey || '';
  const [activeTab, setActiveTab] = useState('live');

  // Fetch sport details
  const { data: sports } = useQuery({
    queryKey: ['/api/sports'],
    queryFn: () => sportsBetAPI.getSports(),
  });

  // Find the current sport based on the key
  const currentSport = sports?.find((sport: any) => sport.key === sportKey);

  // Fetch live events for this sport
  const { data: liveEvents, isLoading: isLoadingLive } = useQuery({
    queryKey: ['/api/events/live', sportKey],
    queryFn: () => sportsBetAPI.getLiveEventsBySport(sportKey),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch upcoming events for this sport
  const { data: upcomingEvents, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['/api/events/upcoming', sportKey],
    queryFn: () => sportsBetAPI.getUpcomingEventsBySport(sportKey),
  });

  // Tab content data
  const tabContent = {
    live: {
      title: 'Live Events',
      data: liveEvents || [],
      isLoading: isLoadingLive,
      emptyMessage: 'No live events currently available for this sport.',
    },
    upcoming: {
      title: 'Upcoming Events',
      data: upcomingEvents || [],
      isLoading: isLoadingUpcoming,
      emptyMessage: 'No upcoming events available for this sport.',
    },
    results: {
      title: 'Recent Results',
      data: [], // This would come from a specific API endpoint in production
      isLoading: false,
      emptyMessage: 'No recent results available for this sport.',
    },
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="w-full">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <Skeleton className="h-5 w-[120px]" />
              <Skeleton className="h-5 w-[80px]" />
            </div>
            <div className="flex justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
              <Skeleton className="h-8 w-[80px]" />
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
              <Skeleton className="h-8 w-[80px]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      {/* Sport Header */}
      <div className="flex items-center mb-6">
        <div className="bg-primary rounded-full p-2 mr-3 text-white">
          {getSportIcon(sportKey)}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{currentSport?.name || sportKey.charAt(0).toUpperCase() + sportKey.slice(1)}</h1>
          <div className="flex items-center text-muted-foreground gap-2 mt-1">
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>{currentSport?.eventCount || 0} Events</span>
            </Badge>
            {activeTab === 'live' && liveEvents?.length > 0 && (
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 flex items-center gap-1">
                <CircleDot className="h-3 w-3 text-red-500 animate-pulse" />
                <span>{liveEvents.length} Live</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live" className="flex items-center gap-1">
            <CircleDot className="h-4 w-4 text-red-500" /> Live
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> Upcoming
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> Results
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content Container */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            {activeTab === 'live' && <Flame className="mr-2 h-5 w-5 text-red-500" />}
            {activeTab === 'upcoming' && <Calendar className="mr-2 h-5 w-5" />}
            {activeTab === 'results' && <Clock className="mr-2 h-5 w-5" />}
            {tabContent[activeTab as keyof typeof tabContent].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tabContent[activeTab as keyof typeof tabContent].isLoading ? (
            renderSkeleton()
          ) : tabContent[activeTab as keyof typeof tabContent].data.length > 0 ? (
            <div className="space-y-4">
              {tabContent[activeTab as keyof typeof tabContent].data.map((event: any) => (
                <GameCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>{tabContent[activeTab as keyof typeof tabContent].emptyMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SportPage;