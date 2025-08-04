import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Users, Zap, Clock, Tv, Radio, Calendar } from 'lucide-react';
import TierGuard from '@/components/access/TierGuard';
import LiveStreamPlayer from '@/components/LiveStreamPlayer';

interface IPTVChannel {
  id: string;
  name: string;
  category: string;
  logo: string;
  streamUrl: string;
  quality: string;
  isLive: boolean;
}

interface EPGProgram {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: string;
  live: boolean;
}

interface EPGData {
  channelId: string;
  programs: EPGProgram[];
}

export default function VIPLiveStreaming() {
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: iptvChannels = [] } = useQuery<IPTVChannel[]>({ 
    queryKey: ['/api/iptv/channels'],
    retry: false
  });
  
  const { data: epgData = [] } = useQuery<EPGData[]>({ 
    queryKey: ['/api/iptv/epg'],
    retry: false
  });

  const categories = ['all', ...Array.from(new Set(iptvChannels.map(c => c.category)))];
  const filteredChannels = selectedCategory === 'all' ? iptvChannels : iptvChannels.filter(c => c.category === selectedCategory);

  const getCurrentProgram = (channelId: string) => {
    const now = new Date();
    const channelEPG = epgData.find(e => e.channelId === channelId);
    return channelEPG?.programs.find(p => new Date(p.startTime) <= now && new Date(p.endTime) >= now) || null;
  };
  const liveEvents = [
    {
      id: 1,
      title: 'Chiefs vs Patriots',
      sport: 'NFL',
      viewers: 24567,
      status: 'LIVE',
      timeRemaining: '3rd Quarter - 8:45'
    },
    {
      id: 2,
      title: 'Lakers vs Warriors',
      sport: 'NBA',
      viewers: 18234,
      status: 'LIVE', 
      timeRemaining: '2nd Quarter - 5:22'
    },
    {
      id: 3,
      title: 'Real Madrid vs Barcelona',
      sport: 'Soccer',
      viewers: 45123,
      status: 'UPCOMING',
      timeRemaining: 'Starts in 45 minutes'
    }
  ];

  return (
    <TierGuard requiredTier="vip" feature="Live Streaming">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">VIP Live Streaming</h1>
            <p className="text-xl text-gray-300">
              Watch live sports with integrated real-time betting
            </p>
            <Badge variant="outline" className="text-red-500 border-red-500 mt-4">
              <Play className="w-4 h-4 mr-2" />
              VIP Exclusive
            </Badge>
          </div>

          {/* Live Streaming Tabs */}
          <Tabs defaultValue="sports" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="sports" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Sports Streams
              </TabsTrigger>
              <TabsTrigger value="tv" className="flex items-center gap-2">
                <Tv className="h-4 w-4" />
                Live TV Channels
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sports">
              {/* Featured Sports Stream */}
              <div className="mb-8">
                <LiveStreamPlayer
                  gameTitle="Chiefs vs Patriots"
                  homeTeam="Kansas City Chiefs"
                  awayTeam="New England Patriots"
                  league="NFL"
                  viewerCount={24567}
                  isLive={true}
                  userTier="platinum"
                  quality="HD"
                  eventId="nfl-chiefs-patriots-2025"
                  className="max-w-4xl mx-auto"
                />
              </div>
            </TabsContent>

            <TabsContent value="tv">
              {/* IPTV Live TV Section */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Channel List */}
                <div className="lg:col-span-1">
                  <div className="mb-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredChannels.map(channel => (
                      <Card 
                        key={channel.id} 
                        onClick={() => setSelectedChannel(channel)}
                        className={`p-3 cursor-pointer transition-all hover:bg-gray-700 ${
                          selectedChannel?.id === channel.id ? 'bg-blue-700 border-blue-500' : 'bg-gray-800'
                        }`}
                      >
                        <div className="flex gap-3 items-center">
                          <img src={channel.logo} alt={channel.name} className="w-8 h-8 rounded" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">{channel.name}</div>
                            <div className="text-xs text-blue-300 truncate">
                              {getCurrentProgram(channel.id)?.title || 'No Info'}
                            </div>
                          </div>
                          {channel.isLive && <Badge className="bg-red-500 text-xs">LIVE</Badge>}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Video Player */}
                <div className="lg:col-span-2">
                  {selectedChannel ? (
                    <LiveStreamPlayer
                      gameTitle={selectedChannel.name}
                      homeTeam={getCurrentProgram(selectedChannel.id)?.title || selectedChannel.name}
                      awayTeam=""
                      league={selectedChannel.category}
                      viewerCount={Math.floor(Math.random() * 10000) + 1000}
                      isLive={selectedChannel.isLive}
                      userTier="platinum"
                      quality={selectedChannel.quality}
                      eventId={selectedChannel.id}
                      streamUrl={selectedChannel.streamUrl}
                      className="w-full"
                    />
                  ) : (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="aspect-video flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <Tv className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-semibold mb-2">Select a Channel</p>
                          <p className="text-sm">Choose a channel from the list to start watching</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Program Guide */}
                <div className="lg:col-span-1">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        Program Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedChannel ? (
                        epgData.find(e => e.channelId === selectedChannel.id)?.programs.map(program => (
                          <div key={program.id} className={`p-2 rounded text-xs ${
                            program.live ? 'bg-red-500/20 border border-red-500/30' : 'bg-gray-700'
                          }`}>
                            <div className="flex items-center gap-1 text-xs text-gray-300 mb-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {new Date(program.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                {new Date(program.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <div className="font-semibold text-white text-sm">{program.title}</div>
                            <div className="text-xs text-blue-300">{program.category}</div>
                          </div>
                        )) || <p className="text-sm text-gray-400">No EPG available</p>
                      ) : (
                        <p className="text-sm text-gray-400">Select a channel to view program guide</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {liveEvents.map((event) => (
              <Card key={event.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{event.title}</CardTitle>
                    <Badge 
                      variant={event.status === 'LIVE' ? 'destructive' : 'secondary'}
                      className={event.status === 'LIVE' ? 'bg-red-600' : 'bg-yellow-600'}
                    >
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400">{event.sport}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{event.viewers.toLocaleString()} viewers</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{event.timeRemaining}</span>
                      </div>
                    </div>
                    
                    <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                      <Play className="w-16 h-16 text-gray-600" />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1" variant="default">
                        <Play className="w-4 h-4 mr-2" />
                        Watch Live
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Zap className="w-4 h-4 mr-2" />
                        Live Bet
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </TierGuard>
  );
}