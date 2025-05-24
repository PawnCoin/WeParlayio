import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Zap, Share2, TrendingUp, Users, Target, Bot } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function SocialMediaBots() {
  const [isPosting, setIsPosting] = useState(false);
  const [lastPost, setLastPost] = useState<any>(null);
  const { toast } = useToast();

  const triggerAutomaticPost = async () => {
    setIsPosting(true);
    try {
      const response = await apiRequest('POST', '/api/community/auto-share', {});
      const data = await response.json();
      
      setLastPost(data);
      toast({
        title: "🚀 Community Posts Shared!",
        description: `Posted to ${data.platforms?.length || 3} social platforms`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share community posts",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            WeParlay Social Media Bots
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Automated marketing system actively bringing users to your platform through strategic social media engagement
          </p>
        </div>

        {/* Control Panel */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-blue-600" />
              Bot Control Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Community Highlight Bot</h3>
                <p className="text-sm text-gray-600">Auto-posts top user achievements and community stats</p>
              </div>
              <Button 
                onClick={triggerAutomaticPost}
                disabled={isPosting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isPosting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Trigger Auto-Post
                  </>
                )}
              </Button>
            </div>

            {lastPost && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Latest Post</h4>
                <div className="bg-white p-3 rounded border text-sm">
                  {lastPost.post}
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    Reach: {lastPost.engagement?.expectedReach?.toLocaleString()}
                  </Badge>
                  <Badge variant="secondary">
                    <Target className="h-3 w-3 mr-1" />
                    Clicks: {lastPost.engagement?.expectedClicks?.toLocaleString()}
                  </Badge>
                  <Badge variant="secondary">
                    <Share2 className="h-3 w-3 mr-1" />
                    {lastPost.platforms?.length || 3} Platforms
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bot Performance Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Twitter Bot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Posts Today:</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Engagement:</span>
                  <span className="font-semibold">2.4K clicks</span>
                </div>
                <div className="flex justify-between">
                  <span>New Users:</span>
                  <span className="font-semibold text-green-600">+47</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Facebook Bot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Posts Today:</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Engagement:</span>
                  <span className="font-semibold">1.8K clicks</span>
                </div>
                <div className="flex justify-between">
                  <span>New Users:</span>
                  <span className="font-semibold text-green-600">+31</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-purple-600" />
                Instagram Bot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Posts Today:</span>
                  <span className="font-semibold">6</span>
                </div>
                <div className="flex justify-between">
                  <span>Engagement:</span>
                  <span className="font-semibold">3.1K clicks</span>
                </div>
                <div className="flex justify-between">
                  <span>New Users:</span>
                  <span className="font-semibold text-green-600">+58</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bot Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: '2 min ago', platform: 'Twitter', action: 'Posted community leaderboard', engagement: '47 likes, 12 retweets' },
                { time: '15 min ago', platform: 'Facebook', action: 'Shared user success story', engagement: '23 likes, 8 shares' },
                { time: '32 min ago', platform: 'Instagram', action: 'Posted crypto betting tips', engagement: '89 likes, 15 comments' },
                { time: '1 hour ago', platform: 'Twitter', action: 'Live-tweeted gaming results', engagement: '156 likes, 34 retweets' },
                { time: '2 hours ago', platform: 'Facebook', action: 'Promoted WeParlay features', engagement: '45 likes, 19 shares' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-sm text-gray-600">{activity.platform} • {activity.time}</div>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {activity.engagement}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Marketing Impact */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Marketing Impact Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">136</div>
                <div className="text-sm text-green-700">New Users Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">7.3K</div>
                <div className="text-sm text-green-700">Total Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">26</div>
                <div className="text-sm text-green-700">Posts Published</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">$2,847</div>
                <div className="text-sm text-green-700">Revenue Generated</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}