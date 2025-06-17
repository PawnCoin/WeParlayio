import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Zap, Share2, TrendingUp, Users, Target, Bot, Lock, Shield } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface BotStats {
  platform: string;
  postsToday: number;
  clicks: number;
  newUsers: number;
  revenue: number;
}

interface BotSystemStatus {
  isLiveMode: boolean;
  platforms: BotStats[];
  totalPostsToday: number;
  totalRevenueToday: number;
  lastActivity: string;
  platformsConfigured: {
    twitter: boolean;
    facebook: boolean;
  };
}

export default function SocialMediaBots() {
  const [isPosting, setIsPosting] = useState(false);
  const [lastPost, setLastPost] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [botStats, setBotStats] = useState<BotSystemStatus | null>(null);
  const { toast } = useToast();

  // Admin-only authentication - Only platform administrators can access
  const ADMIN_EMAIL = 'support@weparlay.io';
  const ADMIN_ROLES = ['admin', 'owner', 'super-admin'];

  useEffect(() => {
    // Check if user has admin privileges
    const checkAdminAccess = () => {
      // For now, using localStorage - in production this would be server-side auth
      const userEmail = localStorage.getItem('weparlay-owner-email');
      const hasAdminAccess = localStorage.getItem('weparlay-admin-access') === 'true';
      const userRole = localStorage.getItem('weparlay-user-role');
      
      if (userEmail === ADMIN_EMAIL || hasAdminAccess || ADMIN_ROLES.includes(userRole || '')) {
        setIsAuthorized(true);
        fetchBotStats();
      }
      setIsLoading(false);
    };

    const fetchBotStats = async () => {
      try {
        const response = await fetch('/api/community/bot-stats');
        if (response.ok) {
          const data = await response.json();
          setBotStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch bot stats:', error);
      }
    };

    checkAdminAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Owner Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Restricted Area</span>
            </div>
            <p className="text-gray-600">
              This Social Media Bot Control Center is exclusively accessible to the platform owner:
            </p>
            <div className="bg-red-50 p-3 rounded border text-sm">
              <strong>Authorized Users:</strong><br />
              Platform Administrators Only<br />
              {ADMIN_EMAIL}
            </div>
            <p className="text-sm text-gray-500">
              Only the platform owner can control the automated marketing bots to ensure security and prevent unauthorized access.
            </p>
            <Button 
              onClick={() => {
                // Temporary admin access for demo - remove in production
                localStorage.setItem('weparlay-admin-access', 'true');
                localStorage.setItem('weparlay-user-role', 'admin');
                setIsAuthorized(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Admin Access (Demo)
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const triggerAutomaticPost = async () => {
    setIsPosting(true);
    try {
      const response = await fetch('/api/community/auto-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': ADMIN_EMAIL,
          'x-admin-access': 'true'
        },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLastPost(data);
        toast({
          title: data.isLiveMode ? "Real Posts Shared!" : "Test Posts Generated",
          description: `${data.isLiveMode ? 'Posted to' : 'Would post to'} ${data.platforms?.length || 0} social platforms`,
        });
        
        // Refresh stats after posting
        const statsResponse = await fetch('/api/community/bot-stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setBotStats(statsData);
        }
      } else {
        throw new Error(data.message);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Social Media Bot Control
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Administrator-only control center for automated social media marketing bots with real posting capabilities
          </p>
        </div>

        {/* Control Panel */}
        <Card className="border-2 border-blue-200 dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Bot Control Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold dark:text-white">Community Highlight Bot</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Auto-posts top user achievements and community stats</p>
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
          {botStats?.platforms?.map((platform, index) => {
            const platformIcons: Record<string, JSX.Element> = {
              'Twitter': <TrendingUp className="h-5 w-5 text-green-600" />,
              'Facebook': <Users className="h-5 w-5 text-blue-600" />,
              'Instagram': <Share2 className="h-5 w-5 text-purple-600" />
            };
            
            const isConfigured = platform.platform === 'Twitter' ? botStats.platformsConfigured?.twitter : 
                               platform.platform === 'Facebook' ? botStats.platformsConfigured?.facebook : false;
            
            return (
              <Card key={platform.platform} className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    {platformIcons[platform.platform] || <Bot className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                    {platform.platform} Bot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="dark:text-gray-300">Status:</span>
                      <Badge className={
                        isConfigured && botStats.isLiveMode
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }>
                        {isConfigured && botStats.isLiveMode 
                          ? "Connected" 
                          : "Not Connected"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-300">Posts Today:</span>
                      <span className="font-semibold dark:text-white">{platform.postsToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-300">Engagement:</span>
                      <span className="font-semibold dark:text-white">{platform.clicks.toLocaleString()} clicks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-300">New Users:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">+{platform.newUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-300">Revenue:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">${platform.revenue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }) || (
            // Loading state
            <div className="col-span-3 text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
              <p className="mt-2 text-gray-600">Loading bot statistics...</p>
            </div>
          )}
        </div>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                <div>
                  <div className="font-medium text-red-800">Twitter API</div>
                  <div className="text-sm text-red-600">Authentication Failed - Invalid credentials or project access required</div>
                </div>
                <Badge className="bg-red-100 text-red-800">
                  Not Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                <div>
                  <div className="font-medium text-red-800">Facebook API</div>
                  <div className="text-sm text-red-600">Authentication Failed - Invalid access token or session expired</div>
                </div>
                <Badge className="bg-red-100 text-red-800">
                  Not Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-gray-800">Instagram API</div>
                  <div className="text-sm text-gray-600">Not configured</div>
                </div>
                <Badge className="bg-gray-100 text-gray-800">
                  Not Configured
                </Badge>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>To enable real posting:</strong> Valid API keys and proper authentication are required for each platform.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actual System Status */}
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Current System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">0</div>
                <div className="text-sm text-red-700">Successful Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">0</div>
                <div className="text-sm text-red-700">Total Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">0</div>
                <div className="text-sm text-red-700">New Users Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">$0</div>
                <div className="text-sm text-red-700">Revenue Generated</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Notice:</strong> Social media posting is currently inactive due to authentication issues. Statistics will display actual data once proper API credentials are configured.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}