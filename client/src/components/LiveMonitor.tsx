import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Users, DollarSign, TrendingUp, AlertTriangle, Eye, Pause, Play } from 'lucide-react';

interface LiveEvent {
  id: string;
  type: 'bet_placed' | 'user_login' | 'payment' | 'system_alert' | 'game_update';
  timestamp: string;
  description: string;
  amount?: number;
  currency?: string;
  userId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
}

interface LiveStats {
  activeUsers: number;
  totalBetsToday: number;
  revenueToday: number;
  systemLoad: number;
  responseTime: number;
  errorRate: number;
}

export default function LiveMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch live events
  const { data: events, refetch: refetchEvents } = useQuery({
    queryKey: ['/api/live/events'],
    staleTime: 1000,
    refetchInterval: autoRefresh ? 2000 : false, // Refresh every 2 seconds
    enabled: isMonitoring,
  });

  // Fetch live statistics
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/live/stats'],
    staleTime: 1000,
    refetchInterval: autoRefresh ? 5000 : false, // Refresh every 5 seconds
    enabled: isMonitoring,
  });

  // Fetch active bets
  const { data: activeBets } = useQuery({
    queryKey: ['/api/live/active-bets'],
    staleTime: 5000,
    refetchInterval: autoRefresh ? 10000 : false,
    enabled: isMonitoring,
  });

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      refetchEvents();
      refetchStats();
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'bet_placed': return DollarSign;
      case 'user_login': return Users;
      case 'payment': return TrendingUp;
      case 'system_alert': return AlertTriangle;
      case 'game_update': return Activity;
      default: return Activity;
    }
  };

  const getEventColor = (type: string, severity?: string) => {
    if (severity === 'critical') return 'text-red-500';
    if (severity === 'high') return 'text-orange-500';
    
    switch (type) {
      case 'bet_placed': return 'text-green-500';
      case 'user_login': return 'text-blue-500';
      case 'payment': return 'text-purple-500';
      case 'system_alert': return 'text-yellow-500';
      case 'game_update': return 'text-cyan-500';
      default: return 'text-gray-500';
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = 'text-muted-foreground' }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs text-muted-foreground">
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from yesterday
              </p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Monitor</h2>
          <p className="text-muted-foreground">Real-time platform activity and performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {autoRefresh ? 'Pause' : 'Resume'} Auto-refresh
          </Button>
          <Button
            variant={isMonitoring ? 'destructive' : 'default'}
            size="sm"
            onClick={toggleMonitoring}
          >
            <Eye className="mr-2 h-4 w-4" />
            {isMonitoring ? 'Stop' : 'Start'} Monitoring
          </Button>
        </div>
      </div>

      {/* Live Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon={Users}
          color="text-blue-500"
        />
        <StatCard
          title="Bets Today"
          value={stats?.totalBetsToday || 0}
          icon={DollarSign}
          color="text-green-500"
        />
        <StatCard
          title="Revenue Today"
          value={`$${(stats?.revenueToday || 0).toLocaleString()}`}
          icon={TrendingUp}
          color="text-purple-500"
        />
        <StatCard
          title="System Load"
          value={`${stats?.systemLoad || 0}%`}
          icon={Activity}
          color={stats?.systemLoad > 80 ? 'text-red-500' : 'text-green-500'}
        />
        <StatCard
          title="Response Time"
          value={`${stats?.responseTime || 0}ms`}
          icon={Activity}
          color={stats?.responseTime > 500 ? 'text-red-500' : 'text-green-500'}
        />
        <StatCard
          title="Error Rate"
          value={`${stats?.errorRate || 0}%`}
          icon={AlertTriangle}
          color={stats?.errorRate > 1 ? 'text-red-500' : 'text-green-500'}
        />
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Live Events</TabsTrigger>
          <TabsTrigger value="bets">Active Bets</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Event Stream
                <Badge variant="outline" className="ml-auto">
                  {isMonitoring ? 'Live' : 'Paused'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Real-time platform activity and user interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events?.length > 0 ? (
                  events.slice(0, 50).map((event: LiveEvent) => {
                    const EventIcon = getEventIcon(event.type);
                    const eventColor = getEventColor(event.type, event.severity);
                    
                    return (
                      <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                        <EventIcon className={`h-4 w-4 ${eventColor}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{event.description}</p>
                            {event.amount && (
                              <Badge variant="outline" className="text-xs">
                                {event.currency === 'USD' ? '$' : ''}{event.amount}
                                {event.currency !== 'USD' ? ` ${event.currency}` : ''}
                              </Badge>
                            )}
                            {event.severity && (
                              <Badge 
                                variant={event.severity === 'critical' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {event.severity}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {isMonitoring ? 'Waiting for events...' : 'Monitoring paused'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Active Bets
              </CardTitle>
              <CardDescription>
                Currently active bets and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeBets?.length > 0 ? (
                  activeBets.map((bet: any) => (
                    <div key={bet.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{bet.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {bet.user} • {bet.sport}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {bet.currency === 'USD' ? '$' : ''}{bet.amount}
                          {bet.currency !== 'USD' ? ` ${bet.currency}` : ''}
                        </p>
                        <Badge variant="outline">{bet.status}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No active bets
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts
              </CardTitle>
              <CardDescription>
                Critical system notifications and warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {events?.filter((e: LiveEvent) => e.type === 'system_alert').length > 0 ? (
                  events.filter((e: LiveEvent) => e.type === 'system_alert').map((alert: LiveEvent) => (
                    <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <div className="flex-1">
                        <p className="font-medium">{alert.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No active alerts</p>
                    <p className="text-sm">All systems operating normally</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}