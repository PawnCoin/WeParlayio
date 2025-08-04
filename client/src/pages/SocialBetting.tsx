import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, MessageCircle, Trophy, TrendingUp, Share2, 
  Heart, ThumbsUp, ThumbsDown, Eye, Star, Target,
  DollarSign, Clock, Flame, Crown, Zap
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SocialBetting() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('community');
  const [newPostContent, setNewPostContent] = useState('');

  // Fetch social betting data
  const { data: socialFeed } = useQuery({
    queryKey: ['/api/social/feed'],
    refetchInterval: 30000,
    initialData: []
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['/api/social/leaderboard'],
    refetchInterval: 60000,
    initialData: []
  });

  // Mock social data
  const mockPosts = [
    {
      id: 1,
      user: { name: "BettingPro", avatar: "🎯", tier: "Gold" },
      content: "Just hit a 5-leg parlay on tonight's NBA games! Lakers, Warriors, and Celtics all covered. My analysis paid off! 🏀💰",
      bet: { amount: 250, payout: 1875, odds: "+650" },
      likes: 42,
      comments: 8,
      timestamp: "2 hours ago",
      sport: "NBA"
    },
    {
      id: 2,
      user: { name: "SportsWizard", avatar: "🧙‍♂️", tier: "Platinum" },
      content: "Sharing my NFL Week 15 picks. Chiefs -7.5 is a lock, and I'm taking the under on Bills vs Dolphins. Weather gonna be a factor! ❄️",
      bet: { amount: 500, payout: 950, odds: "+90" },
      likes: 28,
      comments: 15,
      timestamp: "4 hours ago",
      sport: "NFL"
    },
    {
      id: 3,
      user: { name: "EsportsExpert", avatar: "🎮", tier: "Silver" },
      content: "T1 vs DRX in LCK finals tomorrow. T1 at +120 is incredible value. Faker's playoff form is unmatched! #LoL #LCK",
      bet: { amount: 100, payout: 220, odds: "+120" },
      likes: 67,
      comments: 23,
      timestamp: "6 hours ago",
      sport: "Esports"
    }
  ];

  const mockLeaderboard = [
    { rank: 1, name: "BettingKing", profit: 15420, winRate: 68, streak: 7, tier: "Platinum" },
    { rank: 2, name: "OddsShark", profit: 12890, winRate: 65, streak: 4, tier: "Gold" },
    { rank: 3, name: "PickMaster", profit: 11240, winRate: 63, streak: 9, tier: "Gold" },
    { rank: 4, name: "SportsGuru", profit: 9870, winRate: 61, streak: 2, tier: "Silver" },
    { rank: 5, name: "BetWise", profit: 8560, winRate: 59, streak: 5, tier: "Silver" }
  ];

  const handleLike = (postId: number) => {
    toast({
      title: "Post Liked!",
      description: "Your reaction has been recorded",
    });
  };

  const handleFollow = (username: string) => {
    toast({
      title: `Following ${username}`,
      description: "You'll now see their betting insights in your feed",
    });
  };

  const handleShare = (postId: number) => {
    navigator.clipboard.writeText(`Check out this betting insight: ${window.location.origin}/social/post/${postId}`);
    toast({
      title: "Link Copied!",
      description: "Post link copied to clipboard",
    });
  };

  const createPost = () => {
    if (!newPostContent.trim()) return;
    
    toast({
      title: "Post Created!",
      description: "Your betting insight has been shared with the community",
    });
    setNewPostContent('');
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'text-purple-400';
      case 'gold': return 'text-yellow-400';
      case 'silver': return 'text-gray-400';
      default: return 'text-blue-400';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'bg-purple-600';
      case 'gold': return 'bg-yellow-600';
      case 'silver': return 'bg-gray-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Users className="h-10 w-10 text-blue-400" />
            Social Betting Hub
            <MessageCircle className="h-10 w-10 text-green-400" />
          </h1>
          <p className="text-gray-300 text-lg">
            Connect with fellow bettors, share insights, and follow top performers
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">2,847</div>
              <div className="text-sm text-gray-400">Active Bettors</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">5,234</div>
              <div className="text-sm text-gray-400">Posts Today</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">156</div>
              <div className="text-sm text-gray-400">Win Streaks</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">68%</div>
              <div className="text-sm text-gray-400">Avg Win Rate</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="community" className="data-[state=active]:bg-blue-600">
              <MessageCircle className="w-4 h-4 mr-2" />
              Community
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-blue-600">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="following" className="data-[state=active]:bg-blue-600">
              <Heart className="w-4 h-4 mr-2" />
              Following
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-blue-600">
              <Share2 className="w-4 h-4 mr-2" />
              Create Post
            </TabsTrigger>
          </TabsList>

          {/* Community Feed */}
          <TabsContent value="community" className="space-y-6">
            <div className="space-y-4">
              {mockPosts.map((post) => (
                <Card key={post.id} className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-slate-700 text-2xl">
                            {post.user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold">{post.user.name}</h3>
                            <Badge className={`${getTierBadge(post.user.tier)} text-white text-xs`}>
                              {post.user.tier}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Badge variant="outline" className="text-gray-400 border-gray-600">
                              {post.sport}
                            </Badge>
                            <Clock className="h-3 w-3" />
                            <span>{post.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleFollow(post.user.name)}>
                        Follow
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300 leading-relaxed">{post.content}</p>
                    
                    {/* Bet Details */}
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-sm text-gray-400">Bet Amount</div>
                            <div className="text-white font-semibold">${post.bet.amount}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Potential Payout</div>
                            <div className="text-green-400 font-semibold">${post.bet.payout}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Odds</div>
                            <div className="text-blue-400 font-semibold">{post.bet.odds}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleLike(post.id)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleShare(post.id)}
                          className="text-gray-400 hover:text-green-400"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Target className="h-4 w-4 mr-1" />
                        Copy Bet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  Top Performers This Month
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Ranked by profit and win rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLeaderboard.map((user) => (
                    <div key={user.rank} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          user.rank === 1 ? 'bg-yellow-600 text-yellow-100' :
                          user.rank === 2 ? 'bg-gray-400 text-gray-900' :
                          user.rank === 3 ? 'bg-amber-600 text-amber-100' :
                          'bg-slate-600 text-slate-200'
                        }`}>
                          {user.rank}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{user.name}</span>
                            <Badge className={`${getTierBadge(user.tier)} text-white text-xs`}>
                              {user.tier}
                            </Badge>
                            {user.streak >= 5 && (
                              <Badge className="bg-orange-600 text-white text-xs">
                                <Flame className="h-3 w-3 mr-1" />
                                {user.streak}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">Win Rate: {user.winRate}%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-semibold text-lg">
                          +${user.profit.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user.streak} streak
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Following */}
          <TabsContent value="following" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Your Following</CardTitle>
                <CardDescription className="text-gray-300">
                  Bettors you're currently following
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Heart className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">You're not following anyone yet</p>
                  <p className="text-sm text-gray-500 mt-2">Start following top bettors to see their insights</p>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                    Discover Bettors
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Post */}
          <TabsContent value="create" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Share Your Betting Insight</CardTitle>
                <CardDescription className="text-gray-300">
                  Share your picks, analysis, and strategies with the community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    Your Insight
                  </label>
                  <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your betting analysis, picks, or strategy..."
                    className="w-full h-32 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 resize-none focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Eye className="h-4 w-4" />
                    <span>Visible to all community members</span>
                  </div>
                  <Button 
                    onClick={createPost}
                    disabled={!newPostContent.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Insight
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}