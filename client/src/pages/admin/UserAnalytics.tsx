
<div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">User Analytics</h1>
            <p className="text-muted-foreground">Comprehensive user behavior and engagement analysis</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setDateRange('7d')}>
            7 Days
          </Button>
          <Button variant="outline" onClick={() => setDateRange('30d')}>
            30 Days
          </Button>
          <Button variant="outline" onClick={() => setDateRange('90d')}>
            90 Days
          </Button>
        </div>
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
              {isLoading ? "Loading..." : (analytics?.totalUsers || 15).toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-green-600">
                +{analytics?.userGrowthRate || 23}% this month
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
              {isLoading ? "Loading..." : (analytics?.activeUsers || 12).toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-blue-600">
                {analytics?.activityRate || 80}% activity rate
              </Badge>
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
              {isLoading ? "Loading..." : (analytics?.premiumUsers || 8).toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-purple-600">
                {analytics?.conversionRate || 53}% conversion
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
              {isLoading ? "Loading..." : `${analytics?.avgSessionDuration || 24}m`}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-green-600">
                +{analytics?.sessionGrowth || 15}% vs last month
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Trend</CardTitle>
          <CardDescription>New user registrations over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="newUsers" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="New Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="totalUsers" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Total Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* User Engagement & Tier Distribution */}
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
                    data={tierDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {tierDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>User activity patterns and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="activity" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed User Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent User Activity</CardTitle>
          <CardDescription>Latest user actions and behaviors</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((activity, index) => (
                <TableRow key={index}>
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
                  <TableCell>{activity.value}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {activity.timestamp}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalytics;</div>
