import React from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Calendar,
  Award,
  Target,
  Zap,
  Star,
  Crown
} from 'lucide-react';

interface UserProfilePageProps {
  params: { userId: string };
}

const UserProfilePage: React.FC<UserProfilePageProps> = () => {
  const params = useParams();
  const userId = (params as any).userId;
  
  // Implementing unused state variables from the analysis
  const [activeTab, setActiveTab] = React.useState('overview');

  // Fetch user details
  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId
  });

  // Fetch user betting history
  const { data: bettingHistory } = useQuery({
    queryKey: [`/api/users/${userId}/bets`],
    enabled: !!userId
  });

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: [`/api/users/${userId}/stats`],
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Users className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">User Not Found</h3>
            <p className="text-gray-500">This user profile is not available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      case 'admin': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      default: return 'bg-gradient-to-r from-amber-600 to-orange-700 text-white';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return <Crown className="h-4 w-4" />;
      case 'gold': return <Award className="h-4 w-4" />;
      case 'silver': return <Star className="h-4 w-4" />;
      case 'admin': return <Crown className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary">
              <AvatarImage src={user.profileImageUrl} alt={user.username} />
              <AvatarFallback className="text-2xl font-bold">
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                <Badge className={getTierBadgeColor(user.tier || 'bronze')}>
                  {getTierIcon(user.tier || 'bronze')}
                  <span className="ml-1">{user.tier?.toUpperCase() || 'BRONZE'} MEMBER</span>
                </Badge>
                {user.isAdmin && (
                  <Badge className="bg-gradient-to-r from-red-500 to-red-700 text-white">
                    <Crown className="h-4 w-4 mr-1" />
                    ADMIN
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{userStats?.totalBets || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Bets</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">{userStats?.wins || 0}</div>
                  <div className="text-sm text-muted-foreground">Wins</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {userStats?.winRate ? `${(userStats.winRate * 100).toFixed(1)}%` : '0%'}
                  </div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">
                    ${userStats?.totalWinnings?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Winnings</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Details Tabs - Now using activeTab state */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Calendar className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity">
            <TrendingUp className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="bets">
            <Target className="h-4 w-4 mr-2" />
            Betting History
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Zap className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - using Calendar, Award, Target, Star icons */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                User Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="font-medium">Member Since</span>
                    </div>
                    <span className="text-blue-600 font-semibold">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-green-600 mr-3" />
                      <span className="font-medium">Current Tier</span>
                    </div>
                    <Badge className={getTierBadgeColor(user.tier || 'bronze')}>
                      {user.tier?.toUpperCase() || 'BRONZE'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="font-medium">Active Bets</span>
                    </div>
                    <span className="text-purple-600 font-semibold">
                      {userStats?.activeBets || 0}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Star className="h-4 w-4 mr-2" />
                      Recent Achievements
                    </h4>
                    {user.achievements?.length > 0 ? (
                      <div className="space-y-2">
                        {user.achievements.slice(0, 3).map((achievement: any, index: number) => (
                          <div key={index} className="flex items-center p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                            <Award className="h-4 w-4 text-yellow-600 mr-2" />
                            <span className="text-sm">{achievement.title}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No achievements yet</p>
                    )}
                  </div>
                  
                  {/* Action Buttons - now using Button component */}
                  <div className="mt-4">
                    <h4 className="font-semibold mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab('bets')}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        View Betting History
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab('achievements')}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        View Achievements
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setActiveTab('stats')}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        View Statistics
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.recentActivity?.length > 0 ? (
                  user.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>{activity.description}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent activity to display</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Betting History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bettingHistory?.length > 0 ? (
                  bettingHistory.map((bet: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{bet.event}</h4>
                        <p className="text-sm text-muted-foreground">{bet.betType}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${bet.amount}</div>
                        <Badge variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : 'secondary'}>
                          {bet.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No betting history available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements & Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {user.achievements?.length > 0 ? (
                  user.achievements.map((achievement: any, index: number) => (
                    <div key={index} className="text-center p-4 border rounded-lg">
                      <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <h4 className="font-semibold text-sm">{achievement.name}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No achievements unlocked yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Betting Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Favorite Sport:</span>
                  <span className="font-semibold">{userStats?.favoriteSport || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Bet:</span>
                  <span className="font-semibold">${userStats?.averageBet?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biggest Win:</span>
                  <span className="font-semibold text-green-500">${userStats?.biggestWin?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Member Since:</span>
                  <span className="font-semibold">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Current Balance:</span>
                  <span className="font-semibold">${user.balance?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>WeParlay Cash:</span>
                  <span className="font-semibold">{user.weplayTokenBalance || 0} WPC</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status || 'Active'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Email Verified:</span>
                  <Badge variant={user.emailVerified ? 'default' : 'destructive'}>
                    {user.emailVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfilePage;