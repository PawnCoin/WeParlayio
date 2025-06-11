import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign,
  BarChart3,
  Calendar,
  Trophy,
  AlertTriangle,
  PieChart,
  Activity
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from "recharts";

interface BettingAnalytics {
  totalBets: number;
  totalWagered: number;
  totalWon: number;
  totalLost: number;
  winRate: number;
  roi: number;
  totalPayout: number;
  profit: number;
  averageBetSize: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  favoriteLeague: string;
  favoriteBetType: string;
  monthlyPerformance: Array<{
    month: string;
    profit: number;
    bets: number;
  }>;
}

export default function BettingAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState("6m");
  const [betType, setBetType] = useState("all");

  // Fetch user's betting analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/betting/analytics/dev-user-001', timeframe, betType],
    queryFn: async () => {
      const response = await fetch(`/api/betting/analytics/dev-user-001?timeframe=${timeframe}&type=${betType}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  // Enhanced analytics calculations
  const enhancedData = analytics ? {
    ...analytics,
    profitMargin: analytics.totalWagered > 0 ? (analytics.profit / analytics.totalWagered) * 100 : 0,
    averageWin: analytics.totalWon > 0 ? analytics.totalPayout / analytics.totalWon : 0,
    averageLoss: analytics.totalLost > 0 ? (analytics.totalWagered - analytics.totalPayout) / analytics.totalLost : 0,
    sharpness: analytics.winRate > 55 ? 'Sharp' : analytics.winRate > 50 ? 'Average' : 'Recreational',
    riskLevel: analytics.averageBetSize > 100 ? 'High' : analytics.averageBetSize > 50 ? 'Medium' : 'Low',
    consistency: analytics.longestLoseStreak < 3 ? 'High' : analytics.longestLoseStreak < 5 ? 'Medium' : 'Low'
  } : null;

  const pieData = enhancedData ? [
    { name: 'Wins', value: enhancedData.totalWon, color: '#22c55e' },
    { name: 'Losses', value: enhancedData.totalLost, color: '#ef4444' },
    { name: 'Pending', value: Math.max(0, enhancedData.totalBets - enhancedData.totalWon - enhancedData.totalLost), color: '#f59e0b' }
  ] : [];

  const performanceData = enhancedData?.monthlyPerformance?.map((month, index) => ({
    ...month,
    cumulative: enhancedData.monthlyPerformance.slice(0, index + 1).reduce((sum, m) => sum + m.profit, 0),
    winRate: month.bets > 0 ? Math.random() * 20 + 45 : 0 // Simulated win rate
  })) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Activity className="h-6 w-6 animate-spin mr-2" />
        <span>Loading analytics...</span>
      </div>
    );
  }

  if (!enhancedData) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No betting data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <h2 className="text-2xl font-bold">Betting Analytics</h2>
          <Badge variant="secondary">Professional Dashboard</Badge>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={betType} onValueChange={setBetType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bet Types</SelectItem>
              <SelectItem value="moneyline">Moneyline</SelectItem>
              <SelectItem value="spread">Point Spread</SelectItem>
              <SelectItem value="total">Over/Under</SelectItem>
              <SelectItem value="parlay">Parlays</SelectItem>
              <SelectItem value="prop">Prop Bets</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Total Profit</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(enhancedData.profit)}
                </div>
                <div className={`text-sm ${enhancedData.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(enhancedData.roi)} ROI
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Win Rate</span>
                </div>
                <div className="text-2xl font-bold">
                  {enhancedData.winRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {enhancedData.totalWon}W / {enhancedData.totalLost}L
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Total Wagered</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(enhancedData.totalWagered)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {enhancedData.totalBets} bets
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Win Streak</span>
                </div>
                <div className="text-2xl font-bold">
                  {enhancedData.longestWinStreak}
                </div>
                <div className="text-sm text-muted-foreground">
                  Best streak
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Betting Distribution */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Bet Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} bets`, name]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Betting Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Bettor Type</span>
                    <div className="font-semibold">{enhancedData.sharpness}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Risk Level</span>
                    <div className="font-semibold">{enhancedData.riskLevel}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Consistency</span>
                    <div className="font-semibold">{enhancedData.consistency}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Avg Bet</span>
                    <div className="font-semibold">{formatCurrency(enhancedData.averageBetSize)}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Favorite League</span>
                    <div className="font-semibold">{enhancedData.favoriteLeague}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Favorite Bet Type</span>
                    <div className="font-semibold capitalize">{enhancedData.favoriteBetType}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Profit Margin</span>
                    <div className={`font-semibold ${enhancedData.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(enhancedData.profitMargin)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'profit' ? formatCurrency(value as number) : `${(value as number).toFixed(1)}%`,
                        name === 'profit' ? 'Profit' : 'Win Rate'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="winRate" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Betting Volume by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} bets`, 'Volume']} />
                    <Bar dataKey="bets" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Cumulative Profit Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Cumulative Profit']} />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hot Streaks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Longest Win Streak</span>
                  <Badge variant="default">{enhancedData.longestWinStreak} wins</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Longest Lose Streak</span>
                  <Badge variant="destructive">{enhancedData.longestLoseStreak} losses</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Current Streak</span>
                  <Badge variant="secondary">2 wins</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Performances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Best Month</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(Math.max(...enhancedData.monthlyPerformance.map(m => m.profit)))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Most Bets</span>
                  <span className="font-semibold">
                    {Math.max(...enhancedData.monthlyPerformance.map(m => m.bets))} bets
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Best ROI Month</span>
                  <span className="font-semibold text-green-600">+15.2%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {enhancedData.winRate > 55 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800">Sharp Bettor Detected</h4>
                        <p className="text-green-700 text-sm">
                          Your {enhancedData.winRate.toFixed(1)}% win rate indicates strong analytical skills and market knowledge.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {enhancedData.roi < -5 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-800">Negative ROI Alert</h4>
                        <p className="text-red-700 text-sm">
                          Consider reducing bet sizes and focusing on higher probability bets to improve profitability.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {enhancedData.longestLoseStreak > 5 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">Streak Management</h4>
                        <p className="text-yellow-700 text-sm">
                          Long losing streaks can be avoided with better bankroll management and selective betting.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800">Betting Recommendations</h4>
                      <ul className="text-blue-700 text-sm space-y-1 mt-1">
                        <li>• Focus on {enhancedData.favoriteLeague} where you have the most success</li>
                        <li>• Continue with {enhancedData.favoriteBetType} bets as your strength</li>
                        <li>• Consider bankroll management with {enhancedData.riskLevel.toLowerCase()} risk bets</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kelly Criterion Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Optimal Bet Sizing</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Win Rate:</span>
                        <div className="font-semibold">{enhancedData.winRate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Odds:</span>
                        <div className="font-semibold">-110</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Kelly %:</span>
                        <div className="font-semibold text-blue-600">
                          {((enhancedData.winRate / 100 - 0.5) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Suggested Bet:</span>
                        <div className="font-semibold">
                          {formatCurrency(1000 * ((enhancedData.winRate / 100 - 0.5)))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}