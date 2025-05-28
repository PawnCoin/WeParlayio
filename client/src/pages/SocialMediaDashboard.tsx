
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Clock, Play, Pause, Settings, TrendingUp, Users, MessageSquare, Heart, Shield, Crown, Bot, Zap, Lock, Activity, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Bot {
  name: string;
  personality: string;
  platforms: string[];
  profileImage: string;
  bio: string;
  postingInterval: number;
  lastPost: Date | null;
  nextPost: Date;
  isActive: boolean;
  totalPosts: number;
  engagement: number;
  realPosting: boolean;
  simulationMode: boolean;
}

interface SocialPlatform {
  name: string;
  icon: string;
  connected: boolean;
  realApiConnected: boolean;
  followers: number;
  posts: number;
  engagement: number;
  color: string;
  apiStatus: 'connected' | 'simulation' | 'disconnected';
}

export default function SocialMediaDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [globalSimulationMode, setGlobalSimulationMode] = useState(true);

  // Admin check - only allow access to admins
  const isAdmin = user?.isAdmin || user?.tier === 'admin' || user?.email === 'support@weparlay.io';

  // API Key states for real posting
  const [apiKeys, setApiKeys] = useState({
    twitter: '',
    facebook: '',
    instagram: '',
    reddit: '',
    tiktok: '',
    snapchat: ''
  });

  // Fetch bot status
  const { data: botStatus, isLoading } = useQuery({
    queryKey: ['/api/marketing/bot-status'],
    refetchInterval: 30000,
    enabled: isAdmin
  });

  // Activate all bots
  const activateBots = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/marketing/activate-bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationMode: globalSimulationMode })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: globalSimulationMode ? "🤖 Simulation Bots Activated!" : "🚀 LIVE Bots Activated!",
        description: globalSimulationMode 
          ? "Bots are posting in simulation mode (console only)"
          : "WARNING: Bots are now posting to REAL social media!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/bot-status'] });
    }
  });

  // Trigger immediate posts
  const triggerPosts = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/marketing/trigger-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationMode: globalSimulationMode })
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: globalSimulationMode ? "🤖 Simulation Posts Triggered!" : "🔥 LIVE Posts Triggered!",
        description: `${data.results?.length || 0} bots just posted ${globalSimulationMode ? 'in simulation' : 'to real platforms'}!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/bot-status'] });
    }
  });

  // Toggle bot activation
  const toggleBot = useMutation({
    mutationFn: async ({ botName, isActive }: { botName: string; isActive: boolean }) => {
      const response = await fetch('/api/marketing/toggle-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botName, isActive, simulationMode: globalSimulationMode })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/bot-status'] });
    }
  });

  // Save API configurations
  const saveApiConfig = useMutation({
    mutationFn: async (config: any) => {
      const response = await fetch('/api/marketing/save-api-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "🔧 API Configuration Saved",
        description: "Social media API settings have been updated",
      });
    }
  });

  const socialPlatforms: SocialPlatform[] = [
    {
      name: 'Twitter',
      icon: '🐦',
      connected: true,
      realApiConnected: !!apiKeys.twitter,
      followers: 15420,
      posts: 847,
      engagement: 4.2,
      color: 'bg-blue-500',
      apiStatus: apiKeys.twitter ? 'connected' : 'simulation'
    },
    {
      name: 'Facebook',
      icon: '📘',
      connected: false,
      realApiConnected: !!apiKeys.facebook,
      followers: 8930,
      posts: 234,
      engagement: 3.1,
      color: 'bg-blue-600',
      apiStatus: apiKeys.facebook ? 'connected' : 'simulation'
    },
    {
      name: 'Instagram',
      icon: '📷',
      connected: true,
      realApiConnected: !!apiKeys.instagram,
      followers: 12340,
      posts: 567,
      engagement: 5.8,
      color: 'bg-pink-500',
      apiStatus: apiKeys.instagram ? 'connected' : 'simulation'
    },
    {
      name: 'TikTok',
      icon: '🎵',
      connected: false,
      realApiConnected: !!apiKeys.tiktok,
      followers: 25670,
      posts: 123,
      engagement: 12.3,
      color: 'bg-black',
      apiStatus: apiKeys.tiktok ? 'connected' : 'simulation'
    },
    {
      name: 'Reddit',
      icon: '🤖',
      connected: true,
      realApiConnected: !!apiKeys.reddit,
      followers: 4890,
      posts: 178,
      engagement: 2.9,
      color: 'bg-orange-500',
      apiStatus: apiKeys.reddit ? 'connected' : 'simulation'
    },
    {
      name: 'Snapchat',
      icon: '👻',
      connected: false,
      realApiConnected: !!apiKeys.snapchat,
      followers: 7340,
      posts: 89,
      engagement: 8.7,
      color: 'bg-yellow-400',
      apiStatus: apiKeys.snapchat ? 'connected' : 'simulation'
    }
  ];

  const getTimeUntilNextPost = (nextPost: Date) => {
    const now = new Date();
    const diff = nextPost.getTime() - now.getTime();
    if (diff <= 0) return 'Ready to post';
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      twitter: '🐦',
      facebook: '📘',
      instagram: '📷',
      tiktok: '🎵',
      reddit: '🤖',
      snapchat: '👻'
    };
    return icons[platform.toLowerCase()] || '📱';
  };

  // Access denied for non-admins
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <CardTitle className="text-2xl text-red-600">🚫 Access Denied</CardTitle>
            <CardDescription>
              {!isAuthenticated 
                ? "Please log in to access the bot control system"
                : "Admin privileges required to access social media bots"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Badge variant="destructive" className="mb-4">
              <Lock className="w-4 h-4 mr-2" />
              ADMIN ONLY AREA
            </Badge>
            <p className="text-sm text-muted-foreground">
              Only platform administrators can manage marketing bots
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Admin Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            WeParlay Marketing Bot Control Center
            <Badge className="bg-red-500 text-white">
              <Shield className="w-4 h-4 mr-1" />
              ADMIN ONLY
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Welcome {user?.username} - Manage your automated marketing army
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Bot className="w-5 h-5 text-yellow-600" />
            <div>
              <Label className="text-sm font-medium">Simulation Mode</Label>
              <Switch 
                checked={globalSimulationMode}
                onCheckedChange={setGlobalSimulationMode}
              />
            </div>
          </div>
          <Button 
            onClick={() => triggerPosts.mutate()}
            disabled={triggerPosts.isPending}
            className={globalSimulationMode 
              ? "bg-blue-500 hover:bg-blue-600" 
              : "bg-red-500 hover:bg-red-600"
            }
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {triggerPosts.isPending ? 'Posting...' : (globalSimulationMode ? 'Test Posts' : '⚠️ LIVE Posts')}
          </Button>
          <Button 
            onClick={() => activateBots.mutate()}
            disabled={activateBots.isPending}
            className={globalSimulationMode 
              ? "bg-green-500 hover:bg-green-600" 
              : "bg-orange-500 hover:bg-orange-600"
            }
          >
            <Play className="w-4 h-4 mr-2" />
            {activateBots.isPending ? 'Activating...' : (globalSimulationMode ? 'Start Simulation' : '🚨 GO LIVE')}
          </Button>
        </div>
      </div>

      {/* Warning Banner */}
      {!globalSimulationMode && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">⚠️ LIVE POSTING MODE ENABLED</h3>
                <p className="text-sm">Bots will post to REAL social media accounts. Ensure API keys are configured correctly.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="bots" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="bots">Bot Management</TabsTrigger>
          <TabsTrigger value="platforms">Platform Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="api-config">API Configuration</TabsTrigger>
          <TabsTrigger value="activity">Live Activity</TabsTrigger>
        </TabsList>

        {/* Bot Management */}
        <TabsContent value="bots" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {botStatus?.bots?.map((bot: Bot) => (
              <Card key={bot.name} className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedBot(selectedBot === bot.name ? null : bot.name)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={bot.profileImage} 
                      alt={bot.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {bot.name}
                        {bot.isActive ? (
                          <Badge className="bg-green-500 text-white">
                            <Activity className="w-3 h-3 mr-1" />
                            LIVE
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Pause className="w-3 h-3 mr-1" />
                            PAUSED
                          </Badge>
                        )}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {bot.personality}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {bot.bio}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {bot.platforms.map((platform) => (
                      <span key={platform} className="text-lg">
                        {getPlatformIcon(platform)}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mode</span>
                      <Badge variant={bot.simulationMode ? "secondary" : "destructive"}>
                        {bot.simulationMode ? "Simulation" : "LIVE"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Post</span>
                      <span className="font-medium">
                        {getTimeUntilNextPost(bot.nextPost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posts Today</span>
                      <span className="font-medium">{Math.floor(Math.random() * 12) + 1}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Active</span>
                    <Switch 
                      checked={bot.isActive} 
                      onCheckedChange={(checked) => 
                        toggleBot.mutate({ botName: bot.name, isActive: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Platform Status */}
        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialPlatforms.map((platform) => (
              <Card key={platform.name} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${platform.color}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{platform.icon}</span>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={platform.connected ? "default" : "secondary"}>
                        {platform.connected ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> Connected</>
                        ) : (
                          <><AlertCircle className="w-3 h-3 mr-1" /> Disconnected</>
                        )}
                      </Badge>
                      <Badge variant={platform.apiStatus === 'connected' ? "default" : "secondary"}>
                        {platform.apiStatus === 'connected' ? 'API Ready' : 'Simulation'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Followers</span>
                    <span className="font-medium">{platform.followers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Posts</span>
                    <span className="font-medium">{platform.posts}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Engagement</span>
                    <span className="font-medium">{platform.engagement}%</span>
                  </div>
                  <Progress value={platform.engagement * 10} className="h-2" />
                  {!platform.realApiConnected && (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      ⚠️ API not configured - using simulation mode
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +12% from last week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">84.2K</div>
                <p className="text-xs text-muted-foreground">
                  <Users className="w-3 h-3 inline mr-1" />
                  +8% from last week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6.8%</div>
                <p className="text-xs text-muted-foreground">
                  <Heart className="w-3 h-3 inline mr-1" />
                  +2.3% from last week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{botStatus?.totalBots || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Configuration */}
        <TabsContent value="api-config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Social Media API Configuration
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                >
                  {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </CardTitle>
              <CardDescription>
                Configure API keys for real social media posting. Leave blank to use simulation mode.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(apiKeys).map(([platform, key]) => (
                <div key={platform}>
                  <Label htmlFor={platform} className="capitalize">
                    {platform} API Key
                  </Label>
                  <Input
                    id={platform}
                    type={showApiKeys ? "text" : "password"}
                    value={key}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, [platform]: e.target.value }))}
                    placeholder={`Enter ${platform} API key`}
                  />
                </div>
              ))}
              <Button 
                onClick={() => saveApiConfig.mutate(apiKeys)}
                disabled={saveApiConfig.isPending}
                className="w-full"
              >
                {saveApiConfig.isPending ? 'Saving...' : 'Save API Configuration'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Activity */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bot Activity</CardTitle>
              <CardDescription>Live feed of bot posts and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    botName: 'SportsFan_Mike',
                    platform: 'Twitter',
                    content: 'Just crushed another NFL bet on WeParlay! 🏈💰',
                    timestamp: new Date(),
                    engagement: { likes: 23, retweets: 8, replies: 5 },
                    mode: 'simulation'
                  },
                  {
                    botName: 'CryptoQueen_Sarah',
                    platform: 'Reddit',
                    content: 'WeParlay crypto payments are instant! Best betting platform',
                    timestamp: new Date(Date.now() - 3600000),
                    engagement: { upvotes: 45, comments: 12 },
                    mode: 'simulation'
                  },
                  {
                    botName: 'HighRoller_James',
                    platform: 'Instagram',
                    content: 'VIP treatment on WeParlay worth every penny 💎',
                    timestamp: new Date(Date.now() - 7200000),
                    engagement: { likes: 156, comments: 23 },
                    mode: 'simulation'
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <Bot className="w-5 h-5 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{activity.botName}</span>
                        <Badge variant="outline">{activity.platform}</Badge>
                        <Badge variant={activity.mode === 'simulation' ? "secondary" : "destructive"}>
                          {activity.mode}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{activity.timestamp.toLocaleTimeString()}</span>
                        <span>💖 {Object.values(activity.engagement)[0]}</span>
                        <span>🔄 {Object.values(activity.engagement)[1]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
