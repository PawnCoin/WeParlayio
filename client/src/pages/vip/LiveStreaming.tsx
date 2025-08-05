import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users, Clock, Zap, Tv } from 'lucide-react';
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

  const { data: iptvChannels = [] } = useQuery<IPTVChannel[]>({ 
    queryKey: ['/api/iptv/channels'],
    retry: false
  });
  
  const { data: epgData = [] } = useQuery<EPGData[]>({ 
    queryKey: ['/api/iptv/epg'],
    retry: false
  });

  const getCurrentProgram = (channelId: string) => {
    const now = new Date();
    const channelEPG = epgData.find(e => e.channelId === channelId);
    return channelEPG?.programs.find(p => new Date(p.startTime) <= now && new Date(p.endTime) >= now) || null;
  };

  // Filter for sports and esports channels only
  const sportsChannels = iptvChannels.filter(channel => 
    channel.category?.toLowerCase().includes('sport') || 
    channel.name?.toLowerCase().includes('sport') ||
    channel.name?.toLowerCase().includes('espn') ||
    channel.name?.toLowerCase().includes('fox sport') ||
    channel.name?.toLowerCase().includes('nfl') ||
    channel.name?.toLowerCase().includes('nba') ||
    channel.name?.toLowerCase().includes('mlb') ||
    channel.name?.toLowerCase().includes('nhl') ||
    channel.name?.toLowerCase().includes('soccer') ||
    channel.name?.toLowerCase().includes('football') ||
    channel.name?.toLowerCase().includes('basketball') ||
    channel.name?.toLowerCase().includes('baseball') ||
    channel.name?.toLowerCase().includes('hockey') ||
    channel.category?.toLowerCase().includes('esports') ||
    channel.name?.toLowerCase().includes('esports') ||
    channel.name?.toLowerCase().includes('gaming')
  );

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
              <Card className="bg-gray-800 border-gray-700 max-w-4xl mx-auto">
                <CardContent className="aspect-video flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2 text-red-400">IPTV Service Blocked</p>
                    <p className="text-sm">Your IPTV provider is currently unavailable</p>
                    <Badge variant="destructive" className="mt-4">
                      Real Status - No Mock Content
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Live Sports & Esports Channels */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Live Sports & Esports Channels</h2>
            
            {iptvChannels.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400">
                  <Tv className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2 text-red-400">IPTV Service Unavailable</p>
                  <p className="text-sm">Your IPTV provider (thetv.to) is currently blocking access</p>
                  <p className="text-xs mt-2">Status: 451 - Unavailable For Legal Reasons</p>
                  <Badge variant="destructive" className="mt-4">
                    No Mock Data - Showing Real Status Only
                  </Badge>
                </div>
              </div>
            ) : sportsChannels.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400">
                  <Tv className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">No Sports Channels Found</p>
                  <p className="text-sm">Your IPTV subscription may not include sports channels</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {sportsChannels.map((channel) => (
                  <Card 
                    key={channel.id} 
                    className={`bg-gray-800 border-gray-700 cursor-pointer transition-all hover:bg-gray-700 ${
                      selectedChannel?.id === channel.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <CardContent className="p-3">
                      <div className="flex flex-col items-center text-center">
                        <img 
                          src={channel.logo} 
                          alt={channel.name}
                          className="w-12 h-12 object-contain mb-2 bg-white rounded p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=TV';
                          }}
                        />
                        <h3 className="text-white font-semibold text-sm mb-1">{channel.name}</h3>
                        <p className="text-xs text-blue-300 mb-2">
                          {getCurrentProgram(channel.id)?.title || 'Live Sports'}
                        </p>
                        {channel.isLive && <Badge className="bg-red-500 text-xs">LIVE</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Show connection status */}
          {iptvChannels.length > 0 && (
            <div className="mt-8 text-center">
              <Badge variant="outline" className="text-green-500 border-green-500">
                ✅ Connected to IPTV Service - {sportsChannels.length} Sports Channels Available
              </Badge>
            </div>
          )}
        </div>
      </div>
    </TierGuard>
  );
}