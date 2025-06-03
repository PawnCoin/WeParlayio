import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target, 
  Zap, 
  Trophy,
  BarChart3,
  LineChart,
  Activity,
  Coins,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Star
} from 'lucide-react';

interface TokenPerformance {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  change24h: number;
  achievements: string[];
}

interface BlockchainAchievement {
  id: string;
  title: string;
  description: string;
  badgeType: 'bronze' | 'silver' | 'gold' | 'diamond';
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export default function BlockchainPerformance() {
  const [selectedToken, setSelectedToken] = useState('PC');
  const [achievementFilter, setAchievementFilter] = useState('all');

  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ['/api/blockchain/performance'],
    staleTime: 30000,
  });

  const { data: achievementData, isLoading: achievementLoading } = useQuery({
    queryKey: ['/api/blockchain/achievements'],
    staleTime: 60000,
  });

  const mockTokens: TokenPerformance[] = [
    {
      symbol: 'PC',
      name: 'Pawn Coin',
      balance: 15420,
      value: 3854.75,
      change24h: 12.4,
      achievements: ['Early Adopter', 'Diamond Hands', 'Volume King']
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: 2.45,
      value: 8967.32,
      change24h: -3.2,
      achievements: ['DeFi Pioneer', 'Gas Optimizer']
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 5420.89,
      value: 5420.89,
      change24h: 0.01,
      achievements: ['Stable Genius']
    }
  ];

  const mockAchievements: BlockchainAchievement[] = [
    {
      id: '1',
      title: 'Diamond Hands Achievement',
      description: 'Hold tokens for 30+ days without selling',
      badgeType: 'diamond',
      unlockedAt: new Date('2024-05-15'),
      progress: 100,
      maxProgress: 100
    },
    {
      id: '2',
      title: 'Volume Master',
      description: 'Trade over $10,000 in volume',
      badgeType: 'gold',
      unlockedAt: new Date('2024-05-20'),
      progress: 100,
      maxProgress: 100
    },
    {
      id: '3',
      title: 'Early Bird',
      description: 'Be among first 1000 Pawn Coin holders',
      badgeType: 'silver',
      unlockedAt: new Date('2024-05-01'),
      progress: 100,
      maxProgress: 100
    },
    {
      id: '4',
      title: 'DeFi Explorer',
      description: 'Interact with 5+ DeFi protocols',
      badgeType: 'bronze',
      progress: 3,
      maxProgress: 5
    },
    {
      id: '5',
      title: 'Whale Status',
      description: 'Hold over $50,000 in tokens',
      badgeType: 'diamond',
      progress: 28540,
      maxProgress: 50000
    }
  ];

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'diamond': return 'bg-gradient-to-r from-blue-400 to-purple-500';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 'bronze': return 'bg-gradient-to-r from-orange-400 to-yellow-600';
      default: return 'bg-muted';
    }
  };

  const filteredAchievements = achievementFilter === 'all' 
    ? mockAchievements 
    : achievementFilter === 'unlocked'
    ? mockAchievements.filter(a => a.unlockedAt)
    : mockAchievements.filter(a => !a.unlockedAt);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Blockchain Performance Dashboard</h1>
          <p className="text-muted-foreground">Track your token performance and unlock achievements</p>
        </div>
        <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
          <Activity className="h-4 w-4 mr-2" />
          Live Data
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tokens">Token Performance</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Portfolio</p>
                    <p className="text-2xl font-bold text-white">$18,242.96</p>
                  </div>
                  <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-green-500">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+8.2% (24h)</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pawn Coin Balance</p>
                    <p className="text-2xl font-bold text-white">15,420 PC</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Coins className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-blue-500">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span className="text-sm">+12.4% (24h)</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Achievements</p>
                    <p className="text-2xl font-bold text-white">12/18</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-yellow-500">
                  <Award className="h-4 w-4 mr-1" />
                  <span className="text-sm">66% Complete</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Performance Score</p>
                    <p className="text-2xl font-bold text-white">847</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-purple-500">
                  <Star className="h-4 w-4 mr-1" />
                  <span className="text-sm">Elite Tier</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <LineChart className="h-5 w-5" />
                Interactive Token Gain/Loss Visualization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockTokens.map((token) => (
                  <div
                    key={token.symbol}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedToken === token.symbol
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    onClick={() => setSelectedToken(token.symbol)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{token.symbol}</h3>
                        <p className="text-sm text-muted-foreground">{token.name}</p>
                      </div>
                      <div className={`flex items-center text-sm ${
                        token.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {token.change24h >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(token.change24h)}%
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-white">
                        {token.balance.toLocaleString()} {token.symbol}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${token.value.toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-3 h-2 bg-muted rounded">
                      <div
                        className={`h-full rounded transition-all ${
                          token.change24h >= 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(Math.abs(token.change24h) * 8, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <Button
              variant={achievementFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setAchievementFilter('all')}
            >
              All Achievements
            </Button>
            <Button
              variant={achievementFilter === 'unlocked' ? 'default' : 'outline'}
              onClick={() => setAchievementFilter('unlocked')}
            >
              Unlocked
            </Button>
            <Button
              variant={achievementFilter === 'locked' ? 'default' : 'outline'}
              onClick={() => setAchievementFilter('locked')}
            >
              In Progress
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`bg-card border-border ${
                  achievement.unlockedAt ? 'ring-2 ring-green-500/50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${getBadgeColor(achievement.badgeType)} flex items-center justify-center`}>
                      <Award className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-white">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100} 
                      className="h-2"
                    />
                  </div>

                  {achievement.unlockedAt && (
                    <div className="mt-4 flex items-center text-sm text-green-500">
                      <Zap className="h-4 w-4 mr-1" />
                      Unlocked {achievement.unlockedAt.toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Trading Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Volume</span>
                      <span className="text-white font-medium">$24,567</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Win Rate</span>
                      <span className="text-green-500 font-medium">73.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Best Day</span>
                      <span className="text-green-500 font-medium">+$1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Worst Day</span>
                      <span className="text-red-500 font-medium">-$324</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Achievement Progress</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="text-white">66%</span>
                      </div>
                      <Progress value={66} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Trading Achievements</span>
                        <span className="text-white">80%</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Holding Achievements</span>
                        <span className="text-white">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}