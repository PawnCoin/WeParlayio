import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Play, 
  Trophy, 
  Swords, 
  Zap, 
  Gamepad2, 
  TrendingUp,
  Shield,
  Star,
  ArrowRight,
  Users,
  Target,
  Tv,
  Brain,
  Sparkles,
  ChartBar
} from 'lucide-react';

export default function VIPDashboard() {
  const vipFeatures = [
    {
      title: 'Live Streaming',
      description: 'Watch live sports with integrated real-time betting',
      icon: Play,
      path: '/vip/live-streaming',
      color: 'bg-red-600',
      features: ['Live video streams', 'Real-time odds', 'Instant betting', 'Multiple sports']
    },
    {
      title: 'Fantasy Sports',
      description: 'Advanced fantasy leagues with premium analytics',
      icon: Trophy,
      path: '/vip/fantasy',
      color: 'bg-purple-600',
      features: ['Premium leagues', 'Advanced stats', 'Custom scoring', 'Daily contests']
    },
    {
      title: 'Head-to-Head Betting',
      description: 'Challenge friends with SMS betting integration',
      icon: Swords,
      path: '/vip/head-to-head',
      color: 'bg-orange-600',
      features: ['SMS challenges', 'Friend battles', 'Custom stakes', 'Real-time updates']
    },
    {
      title: 'Tournaments',
      description: 'Exclusive VIP tournaments with higher stakes',
      icon: Crown,
      path: '/vip/tournaments',
      color: 'bg-yellow-600',
      features: ['VIP-only events', 'Higher rewards', 'Premium prizes', 'Leaderboards']
    },
    {
      title: 'Gaming Integration',
      description: 'Bet on esports and gaming events',
      icon: Gamepad2,
      path: '/vip/gaming-integration',
      color: 'bg-blue-600',
      features: ['Esports betting', 'Gaming tournaments', 'Live streams', 'Player stats']
    },
    {
      title: 'Live Streaming',
      description: 'Premium IPTV sports channels for VIP members',
      icon: Tv,
      path: '/vip/live-streaming',
      color: 'bg-green-600',
      features: ['296+ sports channels', 'HD streaming', 'Live events', 'VIP-only access']
    },
    {
      title: 'Plaid Banking',
      description: 'Bank-grade security with instant ACH transfers',
      icon: Shield,
      path: '/plaid-banking',
      color: 'bg-indigo-600',
      features: ['Direct bank linking', 'Secure ACH transfers', 'Real-time balances', 'Industry-standard encryption']
    }
  ];

  const vipBenefits = [
    'Priority customer support',
    'Exclusive betting markets',
    'Higher betting limits',
    'Advanced analytics dashboard',
    'Premium live streams',
    'Early access to new features',
    'VIP-only tournaments',
    'Enhanced withdrawal limits'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-12 h-12 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold text-white">VIP Dashboard</h1>
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Exclusive access to premium WeParlay features
          </p>
          <Badge variant="outline" className="text-yellow-500 border-yellow-500 px-4 py-2">
            <Star className="w-4 h-4 mr-2" />
            VIP Member
          </Badge>
        </div>

        {/* FLAGSHIP FEATURE: King VIP Engine */}
        <div className="mb-12">
          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-900/40 via-yellow-900/30 to-orange-900/40 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-400/10 via-transparent to-transparent" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-400/20 to-transparent blur-3xl" />
            
            <CardHeader className="relative z-10 pb-2">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 blur-lg opacity-60 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-4 rounded-xl shadow-lg">
                      <Crown className="w-10 h-10 text-black" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                        King VIP Engine
                      </CardTitle>
                      <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold px-3 py-1 animate-pulse">
                        <Sparkles className="w-3 h-3 mr-1" />
                        FLAGSHIP
                      </Badge>
                    </div>
                    <p className="text-amber-200/80 text-lg">Advanced AI-Powered Betting Intelligence</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-amber-400/50 text-amber-300 px-4 py-2 text-sm">
                  <Brain className="w-4 h-4 mr-2" />
                  26-Point Analysis System
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-black/30 rounded-xl p-4 border border-amber-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <ChartBar className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-200 font-semibold">Edge Scoring</span>
                  </div>
                  <p className="text-gray-400 text-sm">Proprietary algorithm analyzes line movements, public vs sharp action, and situational factors</p>
                </div>
                <div className="bg-black/30 rounded-xl p-4 border border-amber-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-amber-200 font-semibold">Smart Bankroll</span>
                  </div>
                  <p className="text-gray-400 text-sm">Risk-adjusted bet sizing with Safe (10%) and Standard (20%) modes</p>
                </div>
                <div className="bg-black/30 rounded-xl p-4 border border-amber-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    <span className="text-amber-200 font-semibold">Parlay Builder</span>
                  </div>
                  <p className="text-gray-400 text-sm">Auto-generates optimal 2, 3, 4-team parlays plus the legendary "King Cosmic Ticket"</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-gray-400">Live Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="text-gray-400">VIP Exclusive</span>
                  </div>
                </div>
                <Link href="/vip/king-engine">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 hover:from-amber-500 hover:via-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-3 text-lg shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
                    data-testid="button-launch-king-engine"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Launch King Engine
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* VIP Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {vipFeatures.map((feature, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center mb-3">
                  <div className={`${feature.color} p-3 rounded-lg mr-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                </div>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {feature.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-300">
                      <Target className="w-3 h-3 mr-2 text-green-500" />
                      {feat}
                    </div>
                  ))}
                </div>
                <Link href={feature.path}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Access Feature
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* VIP Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-6 h-6 mr-3 text-blue-500" />
                VIP Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vipBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-300">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    {benefit}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900 to-purple-900 border-blue-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-green-500" />
                VIP Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Bets Placed</span>
                <span className="text-white font-bold">$12,450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Win Rate</span>
                <span className="text-green-400 font-bold">68.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">VIP Level</span>
                <Badge className="bg-yellow-600 text-white">Gold</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Pawn Coin Balance</span>
                <span className="text-yellow-400 font-bold">2,847 $Pc</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="w-6 h-6 mr-3 text-purple-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => window.location.href = '/live-sports-streaming'}
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Live
              </Button>
              <Link href="/vip/tournaments">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                  <Trophy className="w-4 h-4 mr-2" />
                  Join Tournament
                </Button>
              </Link>
              <Link href="/vip/head-to-head">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  <Swords className="w-4 h-4 mr-2" />
                  Challenge Friend
                </Button>
              </Link>
              <Link href="/vip/fantasy">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Fantasy League
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Prompt */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Want to upgrade your VIP tier for even more benefits?</p>
          <Button 
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-8 py-3 text-lg"
            onClick={() => window.location.href = '/upgrade-tier'}
          >
            <Crown className="w-5 h-5 mr-2" />
            Upgrade VIP Tier
          </Button>
        </div>
      </div>
    </div>
  );
}