import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, Play, Pause, Settings, TrendingUp, Users, MessageSquare, Heart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

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
}

interface SocialPlatform {
  name: string;
  icon: string;
  connected: boolean;
  followers: number;
  posts: number;
  engagement: number;
  color: string;
}

export default function SocialMediaDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBot, setSelectedBot] = useState<string | null>(null);

  // Fetch bot status
  const { data: botStatus, isLoading } = useQuery({
    queryKey: ['/api/marketing/bot-status'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Activate all bots
  const activateBots = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/marketing/activate-bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "🚀 Marketing Bots Activated!",
        description: "Your social media army is now posting live content!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/bot-status'] });
    }
  });

  // Trigger immediate posts
  const triggerPosts = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/marketing/trigger-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🔥 Posts Triggered!",
        description: `${data.results?.length || 0} bots just posted across all platforms!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketing/bot-status'] });
    }
  });

  const socialPlatforms: SocialPlatform[] = [
    {
      name: 'Twitter',
      icon: '🐦',
      connected: true,
      followers: 15420,
      posts: 847,
      engagement: 4.2,
      color: 'bg-blue-500'
    },
    {
      name: 'Facebook',
      icon: '📘',
      connected: false,
      followers: 8930,
      posts: 234,
      engagement: 3.1,
      color: 'bg-blue-600'
    },
    {
      name: 'Instagram',
      icon: '📷',
      connected: true,
      followers: 12340,
      posts: 567,
      engagement: 5.8,
      color: 'bg-pink-500'
    },
    {
      name: 'TikTok',
      icon: '🎵',
      connected: false,
      followers: 25670,
      posts: 123,
      engagement: 12.3,
      color: 'bg-black'
    },
    {
      name: 'Reddit',
      icon: '🤖',
      connected: true,
      followers: 4890,
      posts: 178,
      engagement: 2.9,
      color: 'bg-orange-500'
    },
    {
      name: 'Snapchat',
      icon: '👻',
      connected: false,
      followers: 7340,
      posts: 89,
      engagement: 8.7,
      color: 'bg-yellow-400'
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">WeParlay Social Media Command Center</h1>
          <p className="text-muted-foreground">Manage your marketing bot army across all platforms</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => triggerPosts.mutate()}
            disabled={triggerPosts.isPending}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {triggerPosts.isPending ? 'Posting...' : 'Trigger Posts Now'}
          </Button>
          <Button 
            onClick={() => activateBots.mutate()}
            disabled={activateBots.isPending}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            <Play className="w-4 h-4 mr-2" />
            {activateBots.isPending ? 'Activating...' : 'Activate All Bots'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="platforms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="platforms">Platform Overview</TabsTrigger>
          <TabsTrigger value="bots">Bot Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Platform Overview */}
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
                    <Badge variant={platform.connected ? "default" : "secondary"}>
                      {platform.connected ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Connected</>
                      ) : (
                        <><AlertCircle className="w-3 h-3 mr-1" /> Disconnected</>
                      )}
                    </Badge>
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
                  {!platform.connected && (
                    <Button variant="outline" size="sm" className="w-full">
                      Connect {platform.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

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
                      <CardTitle className="text-base">{bot.name}</CardTitle>
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
                    <Switch checked={true} />
                  </div>
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

          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Engagement rates across all connected platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialPlatforms.filter(p => p.connected).map((platform) => (
                  <div key={platform.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{platform.icon}</span>
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <Progress value={platform.engagement * 10} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-12">{platform.engagement}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Connections</CardTitle>
              <CardDescription>Connect your social media accounts to enable posting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialPlatforms.map((platform) => (
                <div key={platform.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {platform.connected ? 'Connected' : 'Not connected'}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant={platform.connected ? "outline" : "default"}
                    size="sm"
                  >
                    {platform.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
              <CardDescription>Configure bot behavior and posting frequency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-posting</div>
                  <div className="text-sm text-muted-foreground">Enable automatic content posting</div>
                </div>
                <Switch checked={true} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Smart scheduling</div>
                  <div className="text-sm text-muted-foreground">Post at optimal times for engagement</div>
                </div>
                <Switch checked={true} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Cross-platform posting</div>
                  <div className="text-sm text-muted-foreground">Share content across all connected platforms</div>
                </div>
                <Switch checked={false} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}