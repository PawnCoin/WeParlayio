import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Trophy, 
  Target, 
  Clock, 
  Users, 
  Gamepad2,
  Bitcoin,
  Activity,
  Award,
  BarChart3
} from 'lucide-react';

interface UserAnalytics {
  user: {
    id: string;
    username: string;
    tier: string;
    joinDate: string;
    lastActive: string;
  };
  betting: {
    totalBets: number;
    winRate: number;
    totalWagered: number;
    totalWon: number;
    profitLoss: number;
    favoriteSport: string;
    biggestWin: number;
    currentStreak: number;
    streakType: string;
  };
  crypto: {
    pawnCoinBalance: number;
    totalCryptoWagered: number;
    cryptoWinRate: number;
    stakingRewards: number;
    portfolioValue: number;
  };
  engagement: {
    sessionsThisMonth: number;
    avgSessionTime: number;
    featuresUsed: string[];
    referrals: number;
    socialShares: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    earned: boolean;
    progress?: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    amount: number;
    currency?: string;
    timestamp: string;
  }>;
}

export default function UserAnalytics() {
  const { data: analytics, isLoading, error } = useQuery<UserAnalytics>({
    queryKey: ['/api/user/analytics'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-blue-300">Loading your analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <p className="text-red-400">Please log in to view your analytics</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'text-amber-600';
      case 'silver': return 'text-slate-400';
      case 'gold': return 'text-yellow-500';
      case 'platinum': return 'text-purple-400';
      case 'diamond': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    if (currency === 'PC') return `${amount.toLocaleString()} PC`;
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-blue-300">Your complete betting performance overview</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-blue-300">Member Since</div>
            <div className="text-white font-medium">
              {new Date(analytics.user.joinDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* User Overview */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {analytics.user.username}
                </div>
                <Badge className={`${getTierColor(analytics.user.tier)} bg-slate-700`}>
                  {analytics.user.tier.toUpperCase()} TIER
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-blue-300 mb-1">Profit/Loss</div>
                <div className={`text-2xl font-bold ${analytics.betting.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center justify-center gap-2`}>
                  {analytics.betting.profitLoss >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  {formatCurrency(Math.abs(analytics.betting.profitLoss))}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-blue-300 mb-1">Win Rate</div>
                <div className="text-2xl font-bold text-white">
                  {analytics.betting.winRate}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-blue-300 mb-1">Current Streak</div>
                <div className={`text-2xl font-bold ${analytics.betting.streakType === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                  {analytics.betting.currentStreak} {analytics.betting.streakType}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-300">Total Bets</div>
                  <div className="text-2xl font-bold text-white">{analytics.betting.totalBets}</div>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-300">Total Wagered</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(analytics.betting.totalWagered)}</div>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-300">Biggest Win</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(analytics.betting.biggestWin)}</div>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-300">Pawn Coin Balance</div>
                  <div className="text-2xl font-bold text-white">{formatCurrency(analytics.crypto.pawnCoinBalance, 'PC')}</div>
                </div>
                <Bitcoin className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="betting" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="betting" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Betting Stats
            </TabsTrigger>
            <TabsTrigger value="crypto" className="data-[state=active]:bg-blue-600">
              <Bitcoin className="w-4 h-4 mr-2" />
              Crypto Portfolio
            </TabsTrigger>
            <TabsTrigger value="engagement" className="data-[state=active]:bg-blue-600">
              <Activity className="w-4 h-4 mr-2" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-blue-600">
              <Award className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="betting" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Betting Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-blue-300">Win Rate</span>
                    <span className="text-white font-bold">{analytics.betting.winRate}%</span>
                  </div>
                  <Progress value={analytics.betting.winRate} className="bg-slate-700" />
                  
                  <div className="flex justify-between">
                    <span className="text-blue-300">Total Wagered</span>
                    <span className="text-white">{formatCurrency(analytics.betting.totalWagered)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-blue-300">Total Won</span>
                    <span className="text-green-400">{formatCurrency(analytics.betting.totalWon)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-blue-300">Favorite Sport</span>
                    <span className="text-white">{analytics.betting.favoriteSport}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                        <div>
                          <div className="text-white text-sm">{activity.description}</div>
                          <div className="text-blue-300 text-xs">
                            {new Date(activity.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">
                            {formatCurrency(activity.amount, activity.currency)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
            </div>
          </TabsContent>

          <TabsContent value="crypto" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bitcoin className="w-5 h-5" />
                    Crypto Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-blue-300">Pawn Coin Balance</span>
                    <span className="text-white font-bold">{formatCurrency(analytics.crypto.pawnCoinBalance, 'PC')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-blue-300">Portfolio Value</span>
                    <span className="text-green-400">{formatCurrency(analytics.crypto.portfolioValue)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-blue-300">Crypto Win Rate</span>
                    <span className="text-white">{analytics.crypto.cryptoWinRate}%</span>
                  </div>
                  <Progress value={analytics.crypto.cryptoWinRate} className="bg-slate-700" />
                  
                  <div className="flex justify-between">
                    <span className="text-blue-300">Staking Rewards</span>
                    <span className="text-yellow-400">{formatCurrency(analytics.crypto.stakingRewards, 'PC')}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-blue-300">Total Crypto Wagered</span>
                    <span className="text-white">{formatCurrency(analytics.crypto.totalCryptoWagered, 'PC')}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Crypto Betting Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-white mb-2">
                      {analytics.crypto.cryptoWinRate}%
                    </div>
                    <div className="text-blue-300 mb-4">Crypto Win Rate</div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-400">
                          {formatCurrency(analytics.crypto.portfolioValue)}
                        </div>
                        <div className="text-sm text-blue-300">Portfolio Value</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-400">
                          {formatCurrency(analytics.crypto.stakingRewards, 'PC')}
                        </div>
                        <div className="text-sm text-blue-300">Rewards Earned</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Platform Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-blue-300">Sessions This Month</span>
                    <span className="text-white font-bold">{analytics.engagement.sessionsThisMonth}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-blue-300">Avg Session Time</span>
                    <span className="text-white">{analytics.engagement.avgSessionTime} minutes</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-blue-300">Referrals</span>
                    <span className="text-white">{analytics.engagement.referrals}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-blue-300">Social Shares</span>
                    <span className="text-white">{analytics.engagement.socialShares}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    Features Used
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analytics.engagement.featuresUsed.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-600 text-white">
                        {feature.replace('-', ' ').toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.achievements.map((achievement) => (
                <Card key={achievement.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.earned ? 'bg-yellow-500' : 'bg-slate-600'
                      }`}>
                        <Award className={`w-6 h-6 ${
                          achievement.earned ? 'text-white' : 'text-slate-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className={`font-medium ${
                          achievement.earned ? 'text-white' : 'text-slate-400'
                        }`}>
                          {achievement.name}
                        </div>
                        
                        {!achievement.earned && achievement.progress !== undefined && (
                          <div className="mt-2">
                            <div className="text-xs text-blue-300 mb-1">
                              Progress: {achievement.progress}%
                            </div>
                            <Progress value={achievement.progress} className="bg-slate-700" />
                          </div>
                        )}
                        
                        {achievement.earned && (
                          <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}