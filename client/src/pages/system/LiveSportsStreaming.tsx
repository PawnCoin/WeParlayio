import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useQuery } from '@tanstack/react-query';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  Users, 
  Eye, 
  Wifi, 
  Settings, 
  Camera, 
  Mic,
  Monitor,
  Cast,
  Radio,
  Video,
  Globe,
  Shield,
  Activity,
  Zap,
  RefreshCw
} from 'lucide-react';

export default function LiveSportsStreaming() {
  // Streaming statistics
  const { data: streamingStats } = useQuery({
    queryKey: ['/api/streaming/statistics'],
    staleTime: 10 * 1000,
  });

  // Active streams
  const { data: activeStreams } = useQuery({
    queryKey: ['/api/streaming/active'],
    staleTime: 5 * 1000,
    refetchInterval: 5 * 1000,
  });

  // Stream health metrics
  const { data: streamHealth } = useQuery({
    queryKey: ['/api/streaming/health'],
    staleTime: 5 * 1000,
    refetchInterval: 5 * 1000,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live Sports Streaming</h1>
          <p className="text-muted-foreground">
            Manage live sports streams and broadcasting
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Video className="h-4 w-4 mr-2" />
            Start Stream
          </Button>
        </div>
      </div>

      {/* Streaming Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Radio className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{streamingStats?.liveStreams || 12}</p>
                <p className="text-sm text-muted-foreground">Live Streams</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{streamingStats?.totalViewers || '47.2K'}</p>
                <p className="text-sm text-muted-foreground">Total Viewers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Wifi className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{streamingStats?.bandwidth || '2.8 Gbps'}</p>
                <p className="text-sm text-muted-foreground">Bandwidth</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{streamingStats?.uptime || '99.8%'}</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active-streams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active-streams">Active Streams</TabsTrigger>
          <TabsTrigger value="stream-sources">Stream Sources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="active-streams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Sports Streams</CardTitle>
              <CardDescription>Currently broadcasting sports events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 'nfl-001',
                    title: 'NFL: Chiefs vs Raiders',
                    sport: 'American Football',
                    status: 'live',
                    viewers: '15.2K',
                    quality: '1080p',
                    bitrate: '6000 kbps',
                    uptime: '2h 15m',
                    health: 'excellent'
                  },
                  {
                    id: 'nba-002',
                    title: 'NBA: Lakers vs Warriors',
                    sport: 'Basketball',
                    status: 'live',
                    viewers: '12.8K',
                    quality: '720p',
                    bitrate: '4500 kbps',
                    uptime: '1h 45m',
                    health: 'good'
                  },
                  {
                    id: 'mlb-003',
                    title: 'MLB: Yankees vs Red Sox',
                    sport: 'Baseball',
                    status: 'starting',
                    viewers: '8.9K',
                    quality: '1080p',
                    bitrate: '5500 kbps',
                    uptime: '0h 05m',
                    health: 'excellent'
                  },
                  {
                    id: 'nhl-004',
                    title: 'NHL: Bruins vs Rangers',
                    sport: 'Hockey',
                    status: 'buffering',
                    viewers: '6.3K',
                    quality: '720p',
                    bitrate: '3800 kbps',
                    uptime: '0h 52m',
                    health: 'poor'
                  }
                ].map((stream) => (
                  <Card key={stream.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{stream.title}</h3>
                          <Badge 
                            variant={
                              stream.status === 'live' ? 'default' : 
                              stream.status === 'starting' ? 'secondary' : 'destructive'
                            }
                          >
                            {stream.status === 'live' && <Radio className="h-3 w-3 mr-1" />}
                            {stream.status}
                          </Badge>
                          <Badge 
                            variant={
                              stream.health === 'excellent' ? 'default' :
                              stream.health === 'good' ? 'secondary' : 'destructive'
                            }
                          >
                            {stream.health}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{stream.sport}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Viewers:</span>
                            <p className="font-medium">{stream.viewers}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Quality:</span>
                            <p className="font-medium">{stream.quality}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Bitrate:</span>
                            <p className="font-medium">{stream.bitrate}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Uptime:</span>
                            <p className="font-medium">{stream.uptime}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stream ID:</span>
                            <p className="font-medium font-mono text-xs">{stream.id}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {stream.status === 'live' ? (
                          <Button size="sm" variant="destructive">
                            <Square className="h-4 w-4 mr-2" />
                            Stop
                          </Button>
                        ) : stream.status === 'buffering' ? (
                          <Button size="sm" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Restart
                          </Button>
                        ) : (
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stream-sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stream Sources</CardTitle>
              <CardDescription>Manage streaming sources and providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { 
                    name: 'ESPN+ API', 
                    type: 'API Integration',
                    status: 'connected', 
                    streams: 8,
                    quality: 'HD',
                    cost: '$299/month'
                  },
                  { 
                    name: 'NBC Sports', 
                    type: 'Partner Feed',
                    status: 'connected', 
                    streams: 5,
                    quality: '4K',
                    cost: '$450/month'
                  },
                  { 
                    name: 'Fox Sports', 
                    type: 'Direct Feed',
                    status: 'connected', 
                    streams: 3,
                    quality: 'HD',
                    cost: '$380/month'
                  },
                  { 
                    name: 'CBS Sports', 
                    type: 'API Integration',
                    status: 'maintenance', 
                    streams: 0,
                    quality: 'HD',
                    cost: '$320/month'
                  },
                  { 
                    name: 'DAZN', 
                    type: 'Partner Feed',
                    status: 'disconnected', 
                    streams: 0,
                    quality: '4K',
                    cost: '$500/month'
                  },
                  { 
                    name: 'Custom RTMP', 
                    type: 'Self-Hosted',
                    status: 'connected', 
                    streams: 2,
                    quality: 'HD',
                    cost: 'Free'
                  }
                ].map((source) => (
                  <Card key={source.name} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{source.name}</h3>
                      <Badge 
                        variant={
                          source.status === 'connected' ? 'default' :
                          source.status === 'maintenance' ? 'secondary' : 'destructive'
                        }
                      >
                        {source.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">{source.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Streams:</span>
                        <span className="font-medium">{source.streams}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Quality:</span>
                        <span className="font-medium">{source.quality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost:</span>
                        <span className="font-medium">{source.cost}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Configure
                      </Button>
                      <Button 
                        size="sm" 
                        variant={source.status === 'connected' ? 'destructive' : 'default'}
                        className="flex-1"
                      >
                        {source.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Streaming Performance</CardTitle>
                <CardDescription>Real-time metrics and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Avg Bitrate</span>
                        <Zap className="h-4 w-4 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold">5.2 Mbps</p>
                      <p className="text-xs text-muted-foreground">+8% from last hour</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Buffer Rate</span>
                        <Monitor className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold">0.3%</p>
                      <p className="text-xs text-muted-foreground">-12% from yesterday</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Peak Viewing Hours</h4>
                    {[
                      { time: '7:00 PM - 9:00 PM', viewers: '52.3K', sports: 'NFL, NBA' },
                      { time: '12:00 PM - 2:00 PM', viewers: '28.7K', sports: 'MLB, Soccer' },
                      { time: '9:00 PM - 11:00 PM', viewers: '35.1K', sports: 'NHL, Boxing' }
                    ].map((period, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg mb-2">
                        <div>
                          <p className="font-medium">{period.time}</p>
                          <p className="text-sm text-muted-foreground">{period.sports}</p>
                        </div>
                        <span className="font-bold">{period.viewers}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Viewer locations and regional performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { region: 'North America', viewers: '28.5K', percentage: '58%', latency: '45ms' },
                    { region: 'Europe', viewers: '12.3K', percentage: '25%', latency: '67ms' },
                    { region: 'Asia Pacific', viewers: '5.8K', percentage: '12%', latency: '89ms' },
                    { region: 'South America', viewers: '2.1K', percentage: '4%', latency: '78ms' },
                    { region: 'Other', viewers: '0.5K', percentage: '1%', latency: '112ms' }
                  ].map((region) => (
                    <div key={region.region} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium">{region.region}</p>
                          <p className="text-sm text-muted-foreground">Latency: {region.latency}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{region.viewers}</p>
                        <p className="text-sm text-muted-foreground">{region.percentage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Streaming Configuration</CardTitle>
              <CardDescription>Configure streaming parameters and quality settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-Start Streams</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically start streaming when events begin
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Adaptive Bitrate</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically adjust quality based on viewer connection
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">DVR Recording</Label>
                    <p className="text-sm text-muted-foreground">
                      Record streams for replay and highlights
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-bitrate">Maximum Bitrate</Label>
                    <Input id="max-bitrate" placeholder="8000 kbps" defaultValue="8000 kbps" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-viewers">Max Concurrent Viewers</Label>
                    <Input id="max-viewers" placeholder="100000" defaultValue="100000" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cdn-provider">CDN Provider</Label>
                    <Input id="cdn-provider" placeholder="CloudFront" defaultValue="CloudFront" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup-servers">Backup Servers</Label>
                    <Input id="backup-servers" placeholder="3" defaultValue="3" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rtmp-url">RTMP Server URL</Label>
                  <Input 
                    id="rtmp-url" 
                    placeholder="rtmp://live.weparlay.io/live"
                    defaultValue="rtmp://live.weparlay.io/live"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button>Save Configuration</Button>
                <Button variant="outline">Test Connection</Button>
                <Button variant="outline">Reset Defaults</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}