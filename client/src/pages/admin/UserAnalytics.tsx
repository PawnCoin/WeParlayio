
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BarChart3, 
  Users, 
  Activity, 
  Clock, 
  Crown, 
  TrendingUp, 
  TrendingDown,
  UserPlus,
  UserCheck,
  UserX,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart
} from "recharts";
import { apiRequest } from "@/lib/queryClient";

interface UserAnalyticsData {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  newUsersToday: number;
  userGrowthRate: number;
  activityRate: number;
  conversionRate: number;
  avgSessionDuration: number;
  churnRate: number;
  retentionRate: number;
  userGrowthData: Array<{
    date: string;
    newUsers: number;
    totalUsers: number;
    activeUsers: number;
  }>;
  tierDistribution: Array<{
    name: string;
    value: number;
    color: string;
    percentage: number;
  }>;
  engagementMetrics: Array<{
    activity: string;
    users: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  recentActivity: Array<{
    id: string;
    username: string;
    activity: string;
    tier: string;
    value: string;
    timestamp: string;
    userAvatar?: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  userSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
    growthRate: number;
  }>;
  behaviorPatterns: Array<{
    pattern: string;
    frequency: number;
    userCount: number;
    conversionImpact: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const UserAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/user-analytics", dateRange, selectedSegment],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/admin/user-analytics?range=${dateRange}&segment=${selectedSegment}`);
      return response as UserAnalyticsData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'diamond': return 'bg-purple-500 text-white';
      case 'platinum': return 'bg-blue-500 text-white';
      case 'gold': return 'bg-yellow-500 text-black';
      case 'silver': return 'bg-gray-400 text-black';
      case 'bronze': return 'bg-orange-600 text-white';
      default: return 'bg-gray-200 text-black';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">User Analytics</h1>
            <p className="text-muted-foreground">Comprehensive user behavior and engagement analysis</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex space-x-2">
        {(['7d', '30d', '90d'] as const).map((range) => (
          <Button 
            key={range}
            variant={dateRange === range ? "default" : "outline"} 
            size="sm"
            onClick={() => setDateRange(range)}
          >
            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
          </Button>
        ))}
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analytics?.totalUsers || 0)}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {(analytics?.userGrowthRate || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <Badge variant="outline" className="text-green-600">
                {Math.abs(analytics?.userGrowthRate || 0)}% this period
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analytics?.activeUsers || 0)}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Progress 
                value={(analytics?.activeUsers || 0) / (analytics?.totalUsers || 1) * 100} 
                className="w-16 h-2"
              />
              <span>{analytics?.activityRate || 0}% activity rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(analytics?.premiumUsers || 0)}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-purple-600">
                {analytics?.conversionRate || 0}% conversion
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((analytics?.avgSessionDuration || 0) / 60)}m
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-blue-600">
                {analytics?.retentionRate || 0}% retention
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Trend</CardTitle>
          <CardDescription>User acquisition and engagement over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.userGrowthData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="totalUsers" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Total Users"
                />
                <Area 
                  type="monotone" 
                  dataKey="activeUsers" 
                  stackId="2"
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Active Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="newUsers" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="New Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* User Segments & Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Tier Distribution</CardTitle>
            <CardDescription>Breakdown of user subscription tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.tierDistribution || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                  >
                    {analytics?.tierDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Users']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Engagement Metrics</CardTitle>
            <CardDescription>Activity patterns and engagement levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.engagementMetrics?.map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium">{metric.activity}</div>
                    {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                    {metric.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                  </div>
                  <div className="flex items-center space-x-4">
                    <Progress value={metric.percentage} className="w-20" />
                    <span className="text-sm font-mono w-8">{metric.users}</span>
                    <Badge variant="outline" className="w-12 text-center">
                      {metric.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Segments Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>User Segments Performance</CardTitle>
          <CardDescription>Revenue and growth by user segments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.userSegments || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="segment" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="User Count" />
                <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent User Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent User Activity</CardTitle>
          <CardDescription>Latest high-impact user actions and behaviors</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics?.recentActivity?.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.userAvatar} />
                        <AvatarFallback>{activity.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{activity.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>{activity.activity}</TableCell>
                  <TableCell>
                    <Badge className={getTierColor(activity.tier)}>
                      {activity.tier.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{activity.value}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getImpactColor(activity.impact)}
                    >
                      {activity.impact.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {activity.timestamp}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Behavior Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>User Behavior Patterns</CardTitle>
          <CardDescription>Most common user behaviors and their conversion impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.behaviorPatterns?.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{pattern.pattern}</div>
                  <div className="text-sm text-muted-foreground">
                    {pattern.userCount} users • {pattern.frequency} occurrences
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={pattern.conversionImpact} className="w-20" />
                  <Badge variant="outline">
                    {pattern.conversionImpact}% impact
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalytics;
