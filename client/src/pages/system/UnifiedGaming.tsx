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
  Gamepad2, 
  Trophy, 
  Users, 
  Settings, 
  BarChart3, 
  Zap, 
  Shield, 
  Download,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

export default function UnifiedGaming() {
  // Gaming platform statistics
  const { data: gamingStats } = useQuery({
    queryKey: ['/api/gaming/statistics'],
    staleTime: 30 * 1000,
  });

  // Connected gaming platforms
  const { data: platforms } = useQuery({
    queryKey: ['/api/gaming/platforms'],
    staleTime: 60 * 1000,
  });

  // Active tournaments
  const { data: tournaments } = useQuery({
    queryKey: ['/api/gaming/tournaments'],
    staleTime: 30 * 1000,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Unified Gaming Management</h1>
          <p className="text-muted-foreground">
            Manage gaming integrations, tournaments, and esports betting
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Gaming Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{gamingStats?.activePlayers || 1247}</p>
                <p className="text-sm text-muted-foreground">Active Players</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{gamingStats?.liveTournaments || 18}</p>
                <p className="text-sm text-muted-foreground">Live Tournaments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">${gamingStats?.totalPrizePool || '127,450'}</p>
                <p className="text-sm text-muted-foreground">Prize Pool</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{gamingStats?.avgViewership || '5.2K'}</p>
                <p className="text-sm text-muted-foreground">Avg Viewership</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platforms">Gaming Platforms</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Gaming Platforms</CardTitle>
              <CardDescription>
                Manage integrations with gaming services and esports platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Steam', status: 'connected', users: 2847, api: 'active' },
                  { name: 'Epic Games', status: 'connected', users: 1523, api: 'active' },
                  { name: 'Battle.net', status: 'connected', users: 967, api: 'active' },
                  { name: 'Origin', status: 'disconnected', users: 0, api: 'inactive' },
                  { name: 'Xbox Live', status: 'connected', users: 1834, api: 'limited' },
                  { name: 'PlayStation', status: 'connected', users: 2156, api: 'active' }
                ].map((platform) => (
                  <Card key={platform.name} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{platform.name}</h3>
                      <Badge 
                        variant={platform.status === 'connected' ? 'default' : 'secondary'}
                      >
                        {platform.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Connected Users:</span>
                        <span className="font-medium">{platform.users.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Status:</span>
                        <Badge 
                          variant={platform.api === 'active' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {platform.api}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        Configure
                      </Button>
                      <Button 
                        size="sm" 
                        variant={platform.status === 'connected' ? 'destructive' : 'default'}
                        className="flex-1"
                      >
                        {platform.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Tournaments</CardTitle>
              <CardDescription>
                Monitor and manage esports tournaments and betting markets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: 'League of Legends World Championship',
                    game: 'League of Legends',
                    status: 'live',
                    participants: 16,
                    prizePool: '$2,225,000',
                    viewers: '45.2K',
                    bets: 1847
                  },
                  {
                    name: 'CS2 Major Championship',
                    game: 'Counter-Strike 2',
                    status: 'upcoming',
                    participants: 24,
                    prizePool: '$1,000,000',
                    viewers: '0',
                    bets: 523
                  },
                  {
                    name: 'Valorant Champions',
                    game: 'Valorant',
                    status: 'live',
                    participants: 16,
                    prizePool: '$1,000,000',
                    viewers: '28.7K',
                    bets: 1234
                  }
                ].map((tournament, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{tournament.name}</h3>
                          <Badge 
                            variant={tournament.status === 'live' ? 'default' : 'secondary'}
                          >
                            {tournament.status === 'live' ? (
                              <><Play className="h-3 w-3 mr-1" /> Live</>
                            ) : (
                              <><Clock className="h-3 w-3 mr-1" /> Upcoming</>
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{tournament.game}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Participants:</span>
                            <p className="font-medium">{tournament.participants} teams</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Prize Pool:</span>
                            <p className="font-medium">{tournament.prizePool}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Viewers:</span>
                            <p className="font-medium">{tournament.viewers}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Active Bets:</span>
                            <p className="font-medium">{tournament.bets}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm">
                          Manage Bets
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gaming Integration Settings</CardTitle>
              <CardDescription>
                Configure gaming platform connections and betting parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable Esports Betting</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to place bets on esports tournaments
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Live Match Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Real-time score and status updates for gaming matches
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Tournament Auto-Creation</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create betting markets for new tournaments
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-bet">Minimum Bet Amount</Label>
                    <Input id="min-bet" placeholder="$1.00" defaultValue="$1.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-bet">Maximum Bet Amount</Label>
                    <Input id="max-bet" placeholder="$10,000" defaultValue="$10,000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-refresh">API Refresh Interval (seconds)</Label>
                  <Input id="api-refresh" placeholder="30" defaultValue="30" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button>Save Settings</Button>
                <Button variant="outline">Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gaming Analytics</CardTitle>
              <CardDescription>
                Performance metrics and insights for gaming integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Top Games by Betting Volume</h3>
                  {[
                    { game: 'League of Legends', volume: '$425,678', change: '+12.3%' },
                    { game: 'Counter-Strike 2', volume: '$387,234', change: '+8.7%' },
                    { game: 'Valorant', volume: '$298,567', change: '+15.2%' },
                    { game: 'Dota 2', volume: '$156,789', change: '-3.4%' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.game}</p>
                        <p className="text-sm text-muted-foreground">{item.volume}</p>
                      </div>
                      <Badge 
                        variant={item.change.startsWith('+') ? 'default' : 'destructive'}
                      >
                        {item.change}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Recent Activity</h3>
                  {[
                    { event: 'New tournament created', game: 'CS2', time: '2 min ago' },
                    { event: 'Betting market opened', game: 'LoL', time: '5 min ago' },
                    { event: 'Match result updated', game: 'Valorant', time: '12 min ago' },
                    { event: 'Player statistics synced', game: 'Dota 2', time: '18 min ago' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.event}</p>
                        <p className="text-xs text-muted-foreground">{activity.game} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}