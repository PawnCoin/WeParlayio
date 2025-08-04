import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Users, Zap, Clock, Tv, Calendar } from 'lucide-react';
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

          {/* Featured Live Stream */}
          <div className="mb-8">
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
                className="max-w-4xl mx-auto"
              />
            ) : (
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
            )}
          </div>

          {/* Channel Selection - Integrated into existing layout */}
          {iptvChannels.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Live TV Channels</h2>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
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
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredChannels.map(channel => (
                  <Card 
                    key={channel.id} 
                    onClick={() => setSelectedChannel(channel)}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      selectedChannel?.id === channel.id ? 'bg-blue-700 border-blue-500' : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <CardContent className="p-4 text-center">
                      <img src={channel.logo} alt={channel.name} className="w-12 h-12 mx-auto mb-2 rounded" />
                      <h3 className="text-white font-semibold text-sm mb-1">{channel.name}</h3>
                      <p className="text-xs text-blue-300 mb-2">
                        {getCurrentProgram(channel.id)?.title || 'No Info'}
                      </p>
                      {channel.isLive && <Badge className="bg-red-500 text-xs">LIVE</Badge>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

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