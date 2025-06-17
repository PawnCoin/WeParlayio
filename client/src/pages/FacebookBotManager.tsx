
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Facebook, 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  Eye, 
  BarChart3,
  Clock,
  Users,
  Heart,
  MessageSquare,
  Share2
} from 'lucide-react';

interface FacebookBotConfig {
  isActive: boolean;
  postingInterval: number; // minutes
  maxPostsPerDay: number;
  simulationMode: boolean;
}

interface FacebookPost {
  id: string;
  content: string;
  timestamp: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  botName: string;
}

export default function FacebookBotManager() {
  const [botConfig, setBotConfig] = useState<FacebookBotConfig>({
    isActive: false,
    postingInterval: 120, // 2 hours
    maxPostsPerDay: 8,
    simulationMode: true
  });
  
  const [customPost, setCustomPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();

  // Fetch bot status
  const { data: botStatus } = useQuery({
    queryKey: ['/api/social-media-bots/facebook-status'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch recent posts
  const { data: recentPosts } = useQuery({
    queryKey: ['/api/social-media-bots/facebook-posts'],
    refetchInterval: 60000 // Refresh every minute
  });

  // Start/Stop bot mutation
  const toggleBotMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      const response = await fetch('/api/social-media-bots/facebook/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isActive, 
          config: botConfig 
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Bot Updated" : "Error",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
    }
  });

  // Post immediately mutation
  const postNowMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/social-media-bots/facebook/post-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Posted Successfully" : "Posting Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
      if (data.success) {
        setCustomPost('');
      }
    }
  });

  const handleToggleBot = () => {
    const newActiveState = !botConfig.isActive;
    setBotConfig(prev => ({ ...prev, isActive: newActiveState }));
    toggleBotMutation.mutate(newActiveState);
  };

  const handlePostNow = () => {
    if (!customPost.trim()) {
      toast({
        title: "Error",
        description: "Please enter content to post",
        variant: "destructive"
      });
      return;
    }
    
    setIsPosting(true);
    postNowMutation.mutate(customPost);
    setTimeout(() => setIsPosting(false), 2000);
  };

  const samplePosts = [
    "🔥 Just hit a massive NFL parlay on WeParlay! Patriots +7.5, Over 45.5, and Chiefs ML = EASY MONEY! 💰 Who's riding with me next? #WeParlay #BettingWins #NFL",
    "⚡ LIVE BETTING ALERT: Lakers vs Warriors - Over 220.5 looking juicy! Real-time odds on WeParlay are unmatched 🏀 #WeParlay #LiveBetting #NBA",
    "💎 VIP members on WeParlay get exclusive early access to playoff lines! Upgrade your game today 🏆 #WeParlay #VIP #PlayoffBetting"
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Facebook className="h-8 w-8 text-blue-600" />
            Facebook Bot Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Manage automated Facebook posting bots for WeParlay promotion
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={botConfig.isActive ? "default" : "secondary"}>
            {botConfig.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant={botConfig.simulationMode ? "outline" : "destructive"}>
            {botConfig.simulationMode ? "Simulation" : "Live"}
          </Badge>
        </div>
      </div>

      {/* Bot Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Bot Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Bot Status</span>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={botConfig.isActive}
                    onCheckedChange={handleToggleBot}
                    disabled={toggleBotMutation.isPending}
                  />
                  {botConfig.isActive ? (
                    <Play className="h-4 w-4 text-green-600" />
                  ) : (
                    <Pause className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Posting Interval (minutes)</label>
                <Input
                  type="number"
                  value={botConfig.postingInterval}
                  onChange={(e) => setBotConfig(prev => ({ 
                    ...prev, 
                    postingInterval: parseInt(e.target.value) || 120 
                  }))}
                  min="30"
                  max="1440"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Max Posts Per Day</label>
                <Input
                  type="number"
                  value={botConfig.maxPostsPerDay}
                  onChange={(e) => setBotConfig(prev => ({ 
                    ...prev, 
                    maxPostsPerDay: parseInt(e.target.value) || 8 
                  }))}
                  min="1"
                  max="50"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Simulation Mode</span>
                <Switch
                  checked={botConfig.simulationMode}
                  onCheckedChange={(checked) => setBotConfig(prev => ({ 
                    ...prev, 
                    simulationMode: checked 
                  }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Bot Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Posts Today</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {botStatus?.postsToday || 0}
                  </div>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Reach</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {botStatus?.totalReach || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post Now Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Post Immediately
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your Facebook post content here..."
            value={customPost}
            onChange={(e) => setCustomPost(e.target.value)}
            rows={4}
            className="resize-none"
          />
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Characters: {customPost.length}/2000
            </div>
            <Button 
              onClick={handlePostNow}
              disabled={isPosting || !customPost.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPosting ? "Posting..." : "Post Now"}
            </Button>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Sample Posts:</h4>
            <div className="space-y-2">
              {samplePosts.map((post, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm">{post}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setCustomPost(post)}
                  >
                    Use This Post
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts?.map((post: FacebookPost) => (
              <div key={post.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm mb-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{post.botName}</span>
                      <span>{new Date(post.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.engagement.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {post.engagement.comments}
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      {post.engagement.shares}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
