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

  // Filter for sports and esports channels only - but keep original design
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

          {/* Featured Live Stream - Main Video Player */}
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
            ) : sportsChannels.length > 0 ? (
              <LiveStreamPlayer
                gameTitle={sportsChannels[0].name}
                homeTeam={getCurrentProgram(sportsChannels[0].id)?.title || sportsChannels[0].name}
                awayTeam=""
                league={sportsChannels[0].category}
                viewerCount={Math.floor(Math.random() * 10000) + 1000}
                isLive={sportsChannels[0].isLive}
                userTier="platinum"
                quality={sportsChannels[0].quality}
                eventId={sportsChannels[0].id}
                streamUrl={sportsChannels[0].streamUrl}
                className="max-w-4xl mx-auto"
              />
            ) : (
              <Card className="bg-gray-800 border-gray-700 max-w-4xl mx-auto">
                <CardContent className="aspect-video flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">Loading Sports Channels</p>
                    <p className="text-sm">Connecting to your IPTV subscription</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Live TV Channels Section */}
          {iptvChannels.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Live TV Channels</h2>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {categories.slice(0, 6).map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="capitalize"
                      >
                        {category === 'all' ? 'All' : category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredChannels.map((channel) => (
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
                          {getCurrentProgram(channel.id)?.title || 'No Info'}
                        </p>
                        {channel.isLive && <Badge className="bg-red-500 text-xs">LIVE</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Original Sports Events Grid (but show real sports from IPTV) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sportsChannels.map((channel) => (
              <Card key={channel.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{channel.name}</CardTitle>
                    <Badge 
                      variant={channel.isLive ? 'destructive' : 'secondary'}
                      className={channel.isLive ? 'bg-red-600' : 'bg-yellow-600'}
                    >
                      {channel.isLive ? 'LIVE' : 'OFFLINE'}
                    </Badge>
                  </div>
                  <p className="text-gray-400">{channel.category}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{Math.floor(Math.random() * 50000 + 1000).toLocaleString()} viewers</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{getCurrentProgram(channel.id)?.title || 'Live Sports'}</span>
                      </div>
                    </div>
                    
                    <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                      <Play className="w-16 h-16 text-gray-600" />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        variant="default"
                        onClick={() => setSelectedChannel(channel)}
                      >
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
            
            {sportsChannels.length === 0 && iptvChannels.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400">
                  <Tv className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">Loading Sports Channels...</p>
                  <p className="text-sm">Connecting to your IPTV subscription</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TierGuard>
  );
}