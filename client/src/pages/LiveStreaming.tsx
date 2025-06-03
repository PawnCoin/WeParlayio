import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Play, Search, Tv, Users, Clock, Globe, ChevronRight, Star } from "lucide-react";

interface LiveStream {
  id: string;
  name: string;
  url: string;
  quality: string;
  language: string;
  viewers: number;
  isLive: boolean;
  category: string;
  thumbnail?: string;
}

const LiveStreaming: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);

  // Fetch live streams from authentic TVApp.tv service
  const { data: streams = [], isLoading } = useQuery({
    queryKey: ['/api/live-streams', selectedCategory],
    refetchInterval: 30000 // Refresh every 30 seconds for live content
  });

  // Filter streams based on search and category
  const filteredStreams = streams.filter((stream: LiveStream) => {
    const matchesSearch = stream.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || stream.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStreamPlay = (stream: LiveStream) => {
    setSelectedStream(stream);
    toast({
      title: "Stream Loading",
      description: `Loading ${stream.name}...`,
    });
  };

  const getQualityBadge = (quality: string) => {
    const color = quality === 'HD' ? 'bg-green-100 text-green-800' : 
                  quality === 'SD' ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800';
    return <Badge className={color}>{quality}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Live Sports Streaming</h1>
        <p className="text-muted-foreground">Watch live sports events with authentic TVApp.tv integration</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search live streams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="football">Football</TabsTrigger>
                <TabsTrigger value="basketball">Basketball</TabsTrigger>
                <TabsTrigger value="soccer">Soccer</TabsTrigger>
                <TabsTrigger value="hockey">Hockey</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stream List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tv className="h-5 w-5" />
                Live Streams ({filteredStreams.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredStreams.length > 0 ? (
                <div className="space-y-4">
                  {filteredStreams.map((stream: LiveStream) => (
                    <div
                      key={stream.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleStreamPlay(stream)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-gradient-to-r from-primary/20 to-primary/40 rounded flex items-center justify-center">
                          <Tv className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{stream.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{stream.viewers.toLocaleString()} viewers</span>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span>LIVE</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getQualityBadge(stream.quality)}
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-1" />
                          Watch
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Tv className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No live streams found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stream Player / Info Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                {selectedStream ? 'Now Playing' : 'Stream Info'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStream ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <Tv className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">Stream Player</p>
                      <p className="text-xs text-gray-400">Loading {selectedStream.name}...</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{selectedStream.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quality:</span>
                        <span>{selectedStream.quality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Language:</span>
                        <span>{selectedStream.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Viewers:</span>
                        <span>{selectedStream.viewers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                          LIVE
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-2">Select a stream to start watching</p>
                  <p className="text-sm text-muted-foreground">Choose from our live sports channels powered by TVApp.tv</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stream Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Stream Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Streams:</span>
                  <span className="font-semibold">{streams.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Live Now:</span>
                  <span className="font-semibold text-red-600">{streams.filter((s: LiveStream) => s.isLive).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HD Quality:</span>
                  <span className="font-semibold">{streams.filter((s: LiveStream) => s.quality === 'HD').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Viewers:</span>
                  <span className="font-semibold">{streams.reduce((total: number, s: LiveStream) => total + s.viewers, 0).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveStreaming;