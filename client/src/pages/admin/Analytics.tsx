import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Activity, Target, Clock, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AnalyticsData {
  userGrowth: Array<{ month: string; users: number; revenue: number }>;
  bettingActivity: Array<{ sport: string; bets: number; revenue: number }>;
  userEngagement: Array<{ day: string; activeUsers: number; sessions: number }>;
  conversionFunnel: Array<{ stage: string; users: number; percentage: number }>;
  platformMetrics: {
    totalUsers: number;
    activeUsers: number;
    retentionRate: number;
    avgSessionTime: number;
    conversionRate: number;
    churnRate: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/admin/analytics"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/analytics");
      return response as AnalyticsData;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Platform performance metrics and insights</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : (analytics?.platformMetrics.totalUsers || 0).toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-green-600">
                +{analytics?.platformMetrics.retentionRate || 0}% retention
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
              {isLoading ? "Loading..." : (analytics?.platformMetrics.activeUsers || 0).toLocaleString()}
            </div>
            <Progress 
              value={(analytics?.platformMetrics.activeUsers || 0) / (analytics?.platformMetrics.totalUsers || 1) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : `${(analytics?.platformMetrics.conversionRate || 0).toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Visitor to bettor conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : `${Math.round((analytics?.platformMetrics.avgSessionTime || 0) / 60)}m`}
            </div>
            <p className="text-xs text-muted-foreground">
              Average user session duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : `${(analytics?.platformMetrics.churnRate || 0).toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly user churn rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth & Revenue</CardTitle>
            <CardDescription>Monthly growth trends</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="users" fill="#8884d8" name="New Users" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Betting Activity by Sport */}
        <Card>
          <CardHeader>
            <CardTitle>Betting Activity by Sport</CardTitle>
            <CardDescription>Revenue distribution across sports</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.bettingActivity || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ sport, percentage }) => `${sport} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {analytics?.bettingActivity?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Daily User Engagement</CardTitle>
          <CardDescription>Active users and session data over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.userEngagement || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="activeUsers" fill="#8884d8" name="Active Users" />
                <Bar dataKey="sessions" fill="#82ca9d" name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey from visit to active betting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.conversionFunnel?.map((stage, index) => (
              <div key={stage.stage} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{stage.stage}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Progress value={stage.percentage} className="w-32" />
                  <span className="text-sm font-mono">{stage.users.toLocaleString()}</span>
                  <Badge variant="outline">{stage.percentage.toFixed(1)}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}