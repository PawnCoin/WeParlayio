import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Info, AlertCircle, CheckCircle, Search, Download, Filter } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  source: string;
  message: string;
  metadata?: any;
  userId?: string;
  ipAddress?: string;
}

export default function SystemLogs() {
  const [filters, setFilters] = useState({
    level: '',
    source: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  // Fetch logs with filters
  const { data: logs, isLoading } = useQuery({
    queryKey: ['/api/logs', filters],
    staleTime: 10 * 1000, // Refresh every 10 seconds
  });

  // Fetch log statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/logs/stats'],
    staleTime: 30 * 1000,
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return AlertTriangle;
      case 'warning': return AlertCircle;
      case 'info': return Info;
      case 'debug': return CheckCircle;
      default: return Info;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      case 'debug': return 'outline';
      default: return 'default';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'default' }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color === 'error' ? 'text-red-500' : color === 'warning' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Logs</h1>
          <p className="text-muted-foreground">Monitor system events and debug issues</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Errors (24h)"
          value={stats?.errors24h || 0}
          icon={AlertTriangle}
          color="error"
        />
        <StatCard
          title="Warnings (24h)"
          value={stats?.warnings24h || 0}
          icon={AlertCircle}
          color="warning"
        />
        <StatCard
          title="Total Logs (24h)"
          value={stats?.total24h || 0}
          icon={Info}
        />
        <StatCard
          title="Active Sources"
          value={stats?.activeSources || 0}
          icon={CheckCircle}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter logs by level, source, and time range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={filters.level} onValueChange={(value) => setFilters(prev => ({ ...prev, level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All levels</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={filters.source} onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All sources</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="betting">Betting Engine</SelectItem>
                  <SelectItem value="payments">Payments</SelectItem>
                  <SelectItem value="notifications">Notifications</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="errors">Errors ({logs?.filter((l: LogEntry) => l.level === 'error').length || 0})</TabsTrigger>
          <TabsTrigger value="warnings">Warnings</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All System Logs</CardTitle>
              <CardDescription>Complete system log history with all levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-8">Loading logs...</div>
                ) : logs?.length > 0 ? (
                  logs.map((log: LogEntry) => {
                    const LevelIcon = getLevelIcon(log.level);
                    return (
                      <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
                        <LevelIcon className={`h-5 w-5 mt-1 flex-shrink-0 ${
                          log.level === 'error' ? 'text-red-500' : 
                          log.level === 'warning' ? 'text-yellow-500' : 
                          'text-muted-foreground'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getLevelColor(log.level) as any}>{log.level}</Badge>
                            <Badge variant="outline">{log.source}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{log.message}</p>
                          {log.metadata && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer">
                                View metadata
                              </summary>
                              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                        {log.userId && (
                          <div className="text-xs text-muted-foreground">
                            User: {log.userId}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No logs found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Logs</CardTitle>
              <CardDescription>System errors requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs?.filter((l: LogEntry) => l.level === 'error').length > 0 ? (
                  logs.filter((l: LogEntry) => l.level === 'error').map((log: LogEntry) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg bg-red-50 border-red-200">
                      <AlertTriangle className="h-5 w-5 mt-1 text-red-500 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="destructive">Error</Badge>
                          <Badge variant="outline">{log.source}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-red-900">{log.message}</p>
                        {log.metadata && (
                          <details className="mt-2">
                            <summary className="text-xs text-red-700 cursor-pointer">
                              View error details
                            </summary>
                            <pre className="text-xs bg-red-100 p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No error logs found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warnings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Warning Logs</CardTitle>
              <CardDescription>System warnings and potential issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs?.filter((l: LogEntry) => l.level === 'warning').map((log: LogEntry) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-5 w-5 mt-1 text-yellow-500 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">Warning</Badge>
                        <Badge variant="outline">{log.source}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{log.message}</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No warning logs found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Most recent system events from the last hour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs?.slice(0, 50).map((log: LogEntry) => {
                  const LevelIcon = getLevelIcon(log.level);
                  return (
                    <div key={log.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <LevelIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={getLevelColor(log.level) as any} className="text-xs">
                            {log.level}
                          </Badge>
                          <span className="text-sm truncate">{log.message}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  );
                }) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity
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