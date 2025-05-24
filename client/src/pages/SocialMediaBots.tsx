import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, TrendingUp, Users, MessageSquare, Play, Pause, BarChart3 } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function SocialMediaBots() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);

  // Fetch bot statistics
  const { data: botStats, isLoading } = useQuery({
    queryKey: ['/api/social-bots/stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch bot activity
  const { data: activity } = useQuery({
    queryKey: ['/api/social-bots/activity'],
    refetchInterval: 60000 // Refresh every minute
  });

  // Start/Stop bots mutation
  const startBotsMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/social-bots/start'),
    onSuccess: () => {
      setIsRunning(true);
      toast({
        title: "🤖 Bots Activated!",
        description: "Your social media army is now posting and driving traffic to WeParlay!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social-bots'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start social media bots. Check API credentials.",
        variant: "destructive"
      });
    }
  });

  // Test post mutation
  const testPostMutation = useMutation({
    mutationFn: (botId: string) => apiRequest('POST', '/api/social-bots/test-post', { botId }),
    onSuccess: (data) => {
      toast({
        title: "✅ Test Post Generated!",
        description: `Sample: "${data.post.content.substring(0, 60)}..."`,
      });
    }
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Bot className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Social Media Bot Army
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Automated marketing that drives traffic and signups to WeParlay 24/7
          </p>
        </div>

        {/* Control Panel */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Bot Control Center
            </CardTitle>
            <CardDescription>
              Manage your automated social media marketing campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => startBotsMutation.mutate()}
                disabled={startBotsMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {startBotsMutation.isPending ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Start Bot Army
              </Button>
              
              <Button
                onClick={() => testPostMutation.mutate('bot_mike_nfl')}
                variant="outline"
                disabled={testPostMutation.isPending}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Test Post
              </Button>
              
              <Badge variant={isRunning ? "default" : "secondary"} className="ml-auto">
                {isRunning ? "🟢 Active" : "🔴 Inactive"}
              </Badge>
            </div>
            
            {isRunning && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  🚀 Your bot army is actively posting to social media and driving traffic to WeParlay!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Bots</p>
                  <p className="text-2xl font-bold">{botStats?.totalBots || 5}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Daily Posts</p>
                  <p className="text-2xl font-bold">{botStats?.dailyPosts || 20}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Platforms</p>
                  <p className="text-2xl font-bold">{botStats?.platforms?.length || 4}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Est. Monthly Reach</p>
                  <p className="text-2xl font-bold">50K+</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="bots" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bots">Bot Profiles</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="setup">API Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="bots" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  name: 'SportsFan_Mike',
                  personality: '🏈 NFL Enthusiast',
                  platforms: ['Twitter', 'Facebook'],
                  posts: '3/day',
                  status: 'active'
                },
                {
                  name: 'CryptoQueen_Sarah',
                  personality: '💎 Crypto Expert',
                  platforms: ['Twitter', 'Reddit'],
                  posts: '5/day',
                  status: 'active'
                },
                {
                  name: 'BasketballPro_Tony',
                  personality: '🏀 NBA Pro',
                  platforms: ['Twitter', 'Instagram'],
                  posts: '4/day',
                  status: 'active'
                },
                {
                  name: 'CasualBettor_Lisa',
                  personality: '🎲 Social Bettor',
                  platforms: ['Facebook', 'Instagram'],
                  posts: '2/day',
                  status: 'active'
                },
                {
                  name: 'HighRoller_James',
                  personality: '💰 VIP Player',
                  platforms: ['Twitter', 'Instagram', 'Reddit'],
                  posts: '6/day',
                  status: 'active'
                }
              ].map((bot, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{bot.name}</CardTitle>
                    <CardDescription>{bot.personality}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {bot.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{bot.posts}</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {bot.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bot Activity</CardTitle>
                <CardDescription>Live feed of bot posts and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activity?.activity?.map((post: any, index: number) => (
                    <div key={index} className="border-l-4 border-l-blue-500 pl-4 py-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="font-medium">{post.botName}</p>
                          <p className="text-gray-600">{post.content}</p>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span>Platform: {post.platform}</span>
                            <span>👍 {post.engagement.likes || post.engagement.upvotes}</span>
                            <span>💬 {post.engagement.comments || post.engagement.replies}</span>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {new Date(post.timestamp).toLocaleTimeString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Social Media API Configuration
                </CardTitle>
                <CardDescription>
                  Connect your social media accounts to enable automated posting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Twitter Setup */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      📱 Twitter/X API
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-2">Required Keys:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• TWITTER_BEARER_TOKEN</li>
                        <li>• TWITTER_API_KEY</li>
                        <li>• TWITTER_API_SECRET</li>
                      </ul>
                    </div>
                  </div>

                  {/* Instagram Setup */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      📸 Instagram API
                    </h3>
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                      <p className="text-sm text-pink-800 mb-2">Required Keys:</p>
                      <ul className="text-xs text-pink-700 space-y-1">
                        <li>• INSTAGRAM_ACCESS_TOKEN</li>
                        <li>• INSTAGRAM_APP_ID</li>
                        <li>• INSTAGRAM_APP_SECRET</li>
                      </ul>
                    </div>
                  </div>

                  {/* Facebook Setup */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      👥 Facebook API
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-2">Required Keys:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• FACEBOOK_ACCESS_TOKEN</li>
                        <li>• FACEBOOK_APP_ID</li>
                        <li>• FACEBOOK_APP_SECRET</li>
                      </ul>
                    </div>
                  </div>

                  {/* Reddit Setup */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      🤖 Reddit API
                    </h3>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-sm text-orange-800 mb-2">Required Keys:</p>
                      <ul className="text-xs text-orange-700 space-y-1">
                        <li>• REDDIT_ACCESS_TOKEN</li>
                        <li>• REDDIT_CLIENT_ID</li>
                        <li>• REDDIT_CLIENT_SECRET</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium mb-2">⚡ Ready to Launch!</p>
                  <p className="text-yellow-700 text-sm">
                    Once you provide the API keys above, your bot army will automatically post 
                    engaging content to drive traffic and signups to WeParlay. The bots post 
                    realistic betting content, win celebrations, and challenges that attract 
                    new users to your platform!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}