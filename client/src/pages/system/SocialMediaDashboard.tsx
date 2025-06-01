import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Share2, 
  Heart, 
  BarChart3,
  Settings,
  Calendar,
  Bell,
  Send,
  Eye,
  ThumbsUp,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

export default function SocialMediaDashboard() {
  // Social media statistics
  const { data: socialStats } = useQuery({
    queryKey: ['/api/social/statistics'],
    staleTime: 30 * 1000,
  });

  // Recent posts and engagement
  const { data: recentPosts } = useQuery({
    queryKey: ['/api/social/recent-posts'],
    staleTime: 60 * 1000,
  });

  // Scheduled posts
  const { data: scheduledPosts } = useQuery({
    queryKey: ['/api/social/scheduled'],
    staleTime: 60 * 1000,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Media Dashboard</h1>
          <p className="text-muted-foreground">
            Manage social media presence and community engagement
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button size="sm">
            <Send className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Social Media Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{socialStats?.totalFollowers || '47.2K'}</p>
                <p className="text-sm text-muted-foreground">Total Followers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{socialStats?.engagementRate || '8.3%'}</p>
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Share2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{socialStats?.postsToday || 12}</p>
                <p className="text-sm text-muted-foreground">Posts Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{socialStats?.reach || '125K'}</p>
                <p className="text-sm text-muted-foreground">Weekly Reach</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>Followers and engagement across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      platform: 'Twitter', 
                      icon: Twitter, 
                      followers: '18.5K', 
                      engagement: '12.4%',
                      growth: '+2.3%',
                      status: 'active'
                    },
                    { 
                      platform: 'Instagram', 
                      icon: Instagram, 
                      followers: '15.2K', 
                      engagement: '8.7%',
                      growth: '+5.1%',
                      status: 'active'
                    },
                    { 
                      platform: 'Facebook', 
                      icon: Facebook, 
                      followers: '12.8K', 
                      engagement: '6.2%',
                      growth: '+1.8%',
                      status: 'active'
                    },
                    { 
                      platform: 'Discord', 
                      icon: MessageCircle, 
                      followers: '3.7K', 
                      engagement: '24.1%',
                      growth: '+8.9%',
                      status: 'active'
                    }
                  ].map((platform) => (
                    <div key={platform.platform} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <platform.icon className="h-6 w-6" />
                        <div>
                          <p className="font-medium">{platform.platform}</p>
                          <p className="text-sm text-muted-foreground">{platform.followers} followers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{platform.engagement}</p>
                        <Badge variant={platform.growth.startsWith('+') ? 'default' : 'destructive'}>
                          {platform.growth}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest posts and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      platform: 'Twitter',
                      content: 'New betting opportunities available for tonight\'s games! 🏀',
                      likes: 127,
                      shares: 43,
                      comments: 18,
                      time: '2 hours ago'
                    },
                    {
                      platform: 'Instagram',
                      content: 'Check out this week\'s biggest wins! 💰',
                      likes: 245,
                      shares: 67,
                      comments: 32,
                      time: '4 hours ago'
                    },
                    {
                      platform: 'Facebook',
                      content: 'WeParlay community is growing strong! Join us...',
                      likes: 89,
                      shares: 23,
                      comments: 15,
                      time: '6 hours ago'
                    }
                  ].map((post, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{post.platform}</Badge>
                        <span className="text-xs text-muted-foreground">{post.time}</span>
                      </div>
                      <p className="text-sm mb-3">{post.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {post.likes}
                        </span>
                        <span className="flex items-center">
                          <Share2 className="h-3 w-3 mr-1" />
                          {post.shares}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {post.comments}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Platforms</CardTitle>
              <CardDescription>Manage social media platform integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { 
                    name: 'Twitter',
                    icon: Twitter,
                    status: 'connected',
                    lastSync: '5 minutes ago',
                    posts: 145,
                    autoPost: true
                  },
                  { 
                    name: 'Instagram',
                    icon: Instagram,
                    status: 'connected',
                    lastSync: '10 minutes ago',
                    posts: 89,
                    autoPost: true
                  },
                  { 
                    name: 'Facebook',
                    icon: Facebook,
                    status: 'connected',
                    lastSync: '15 minutes ago',
                    posts: 67,
                    autoPost: false
                  },
                  { 
                    name: 'Discord',
                    icon: MessageCircle,
                    status: 'disconnected',
                    lastSync: 'Never',
                    posts: 0,
                    autoPost: false
                  }
                ].map((platform) => (
                  <Card key={platform.name} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <platform.icon className="h-6 w-6" />
                        <h3 className="font-semibold">{platform.name}</h3>
                      </div>
                      <Badge 
                        variant={platform.status === 'connected' ? 'default' : 'secondary'}
                      >
                        {platform.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Last Sync:</span>
                        <span className="font-medium">{platform.lastSync}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Posts:</span>
                        <span className="font-medium">{platform.posts}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Auto-Post:</span>
                        <Switch checked={platform.autoPost} />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        Configure
                      </Button>
                      <Button 
                        size="sm" 
                        variant={platform.status === 'connected' ? 'destructive' : 'default'}
                        className="flex-1"
                      >
                        {platform.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
                <CardDescription>Compose and schedule social media content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="post-content">Content</Label>
                  <Textarea 
                    id="post-content" 
                    placeholder="What's happening in the WeParlay community?"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Platforms</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="cursor-pointer">Twitter</Badge>
                      <Badge variant="outline" className="cursor-pointer">Instagram</Badge>
                      <Badge variant="outline" className="cursor-pointer">Facebook</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Schedule</Label>
                    <Input id="schedule" type="datetime-local" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Post Now
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Posts</CardTitle>
                <CardDescription>Upcoming social media posts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      content: 'Weekly sports betting tips and strategies...',
                      platforms: ['Twitter', 'Facebook'],
                      scheduledFor: 'Today at 6:00 PM',
                      status: 'pending'
                    },
                    {
                      content: 'Join our live betting session tonight!',
                      platforms: ['Instagram', 'Twitter'],
                      scheduledFor: 'Tomorrow at 8:00 AM',
                      status: 'pending'
                    },
                    {
                      content: 'Community highlights from this week',
                      platforms: ['Facebook'],
                      scheduledFor: 'Friday at 3:00 PM',
                      status: 'pending'
                    }
                  ].map((post, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <p className="text-sm mb-2">{post.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex gap-1">
                          {post.platforms.map((platform) => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                        <span>{post.scheduledFor}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="destructive">Cancel</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Top Performing Posts</h3>
                  {[
                    { content: 'Weekend betting special...', engagement: '15.2%', reach: '8.5K' },
                    { content: 'Community winner spotlight', engagement: '12.8%', reach: '6.2K' },
                    { content: 'Live betting tips', engagement: '11.4%', reach: '5.8K' }
                  ].map((post, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="text-sm font-medium mb-2">{post.content}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Engagement: {post.engagement}</span>
                        <span>Reach: {post.reach}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Growth Metrics</h3>
                  {[
                    { metric: 'Follower Growth', value: '+2.4%', period: 'This Week' },
                    { metric: 'Engagement Rate', value: '+1.8%', period: 'This Month' },
                    { metric: 'Reach Growth', value: '+5.2%', period: 'This Week' },
                    { metric: 'Click-through Rate', value: '+3.1%', period: 'This Month' }
                  ].map((metric, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <Badge variant="default">{metric.value}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{metric.period}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Audience Insights</h3>
                  {[
                    { demographic: 'Age 18-24', percentage: '32%' },
                    { demographic: 'Age 25-34', percentage: '41%' },
                    { demographic: 'Age 35-44', percentage: '18%' },
                    { demographic: 'Age 45+', percentage: '9%' }
                  ].map((demo, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{demo.demographic}</span>
                        <span className="text-sm">{demo.percentage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Settings</CardTitle>
              <CardDescription>Configure posting preferences and automation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-Post Betting Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically post when new betting opportunities become available
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Community Highlights</Label>
                    <p className="text-sm text-muted-foreground">
                      Share user wins and community achievements
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Cross-Platform Posting</Label>
                    <p className="text-sm text-muted-foreground">
                      Post to all connected platforms simultaneously
                    </p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="post-frequency">Daily Post Limit</Label>
                    <Input id="post-frequency" placeholder="5" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="optimal-time">Optimal Posting Time</Label>
                    <Input id="optimal-time" type="time" defaultValue="18:00" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hashtags">Default Hashtags</Label>
                  <Input 
                    id="hashtags" 
                    placeholder="#WeParlay #SportsBetting #Community"
                    defaultValue="#WeParlay #SportsBetting #Community"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button>Save Settings</Button>
                <Button variant="outline">Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}