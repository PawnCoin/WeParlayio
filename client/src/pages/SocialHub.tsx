import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Trophy, 
  MessageCircle, 
  TrendingUp, 
  UserPlus, 
  Crown,
  Star,
  Target,
  Calendar,
  DollarSign,
  Zap,
  Share2,
  Heart,
  MessageSquare,
  Send
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SocialPost {
  id: number;
  userId: string;
  username: string;
  profileImage?: string;
  tier: string;
  content: string;
  type: 'bet_win' | 'bet_prediction' | 'general' | 'challenge';
  betAmount?: number;
  odds?: string;
  sport?: string;
  likes: number;
  comments: number;
  createdAt: string;
  liked?: boolean;
}

interface LeaderboardUser {
  id: string;
  username: string;
  profileImage?: string;
  tier: string;
  totalProfit: number;
  winRate: number;
  totalBets: number;
  streak: number;
  rank: number;
}

interface FriendRequest {
  id: number;
  fromUserId: string;
  fromUsername: string;
  fromProfileImage?: string;
  fromTier: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

const SocialHub: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("feed");
  const [newPostContent, setNewPostContent] = useState("");
  const [searchUsername, setSearchUsername] = useState("");

  // Fetch social feed
  const { data: socialFeed = [], isLoading: isLoadingFeed } = useQuery({
    queryKey: ["/api/social/feed"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch leaderboard
  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ["/api/social/leaderboard"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch friend requests
  const { data: friendRequests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ["/api/social/friend-requests"],
    enabled: !!user,
  });

  // Fetch friends list
  const { data: friends = [], isLoading: isLoadingFriends } = useQuery({
    queryKey: ["/api/social/friends"],
    enabled: !!user,
  });

  // Create new post mutation
  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/social/posts", { content, type: 'general' });
    },
    onSuccess: () => {
      setNewPostContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
      toast({
        title: "Success",
        description: "Your post has been shared!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (username: string) => {
      return apiRequest("POST", "/api/social/friend-request", { username });
    },
    onSuccess: () => {
      setSearchUsername("");
      toast({
        title: "Success",
        description: "Friend request sent!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send friend request. User may not exist or request already sent.",
        variant: "destructive",
      });
    },
  });

  // Accept/decline friend request mutation
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: number; action: 'accept' | 'decline' }) => {
      return apiRequest("POST", `/api/social/friend-request/${requestId}/${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/friend-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social/friends"] });
      toast({
        title: "Success",
        description: "Friend request updated!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to respond to friend request.",
        variant: "destructive",
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest("POST", `/api/social/posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/feed"] });
    },
  });

  const getTierBadgeColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return <Crown className="h-3 w-3" />;
      case 'gold': return <Star className="h-3 w-3" />;
      case 'silver': return <Target className="h-3 w-3" />;
      default: return <Zap className="h-3 w-3" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Social Hub</h1>
        <p className="text-muted-foreground">Connect with fellow bettors, share strategies, and compete on the leaderboard</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Challenges
          </TabsTrigger>
        </TabsList>

        {/* Social Feed Tab */}
        <TabsContent value="feed" className="space-y-6">
          {/* Create Post */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share Your Thoughts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Share a betting tip, celebrate a win, or start a discussion..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {newPostContent.length}/280 characters
                  </p>
                  <Button
                    onClick={() => createPostMutation.mutate(newPostContent)}
                    disabled={!newPostContent.trim() || newPostContent.length > 280 || createPostMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {createPostMutation.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feed Posts */}
          <div className="space-y-4">
            {isLoadingFeed ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : socialFeed.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">Be the first to share something with the community!</p>
                </CardContent>
              </Card>
            ) : (
              socialFeed.map((post: SocialPost) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.profileImage} />
                        <AvatarFallback>{post.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{post.username}</h3>
                          <Badge variant="outline" className={getTierBadgeColor(post.tier)}>
                            {getTierIcon(post.tier)}
                            <span className="ml-1">{post.tier}</span>
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatTimeAgo(post.createdAt)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-gray-800 dark:text-gray-200">{post.content}</p>
                          
                          {post.type === 'bet_win' && post.betAmount && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                <TrendingUp className="h-4 w-4" />
                                <span className="font-medium">Winning Bet</span>
                              </div>
                              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                Won ${post.betAmount} • {post.odds} • {post.sport}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => likePostMutation.mutate(post.id)}
                            className={`flex items-center gap-2 ${post.liked ? 'text-red-500' : ''}`}
                          >
                            <Heart className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            {post.comments}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Weekly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingLeaderboard ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((user: LeaderboardUser, index: number) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-accent/50 ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profileImage} />
                        <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.username}</h3>
                          <Badge variant="outline" className={getTierBadgeColor(user.tier)}>
                            {getTierIcon(user.tier)}
                            <span className="ml-1">{user.tier}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Win Rate: {user.winRate}%</span>
                          <span>Streak: {user.streak}</span>
                          <span>Bets: {user.totalBets}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold ${user.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {user.totalProfit >= 0 ? '+' : ''}${user.totalProfit.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Profit</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Friends Tab */}
        <TabsContent value="friends" className="space-y-6">
          {/* Add Friend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter username..."
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => sendFriendRequestMutation.mutate(searchUsername)}
                  disabled={!searchUsername.trim() || sendFriendRequestMutation.isPending}
                >
                  Send Request
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Friend Requests */}
          {friendRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Friend Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {friendRequests.map((request: FriendRequest) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={request.fromProfileImage} />
                          <AvatarFallback>{request.fromUsername.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{request.fromUsername}</h3>
                          <Badge variant="outline" className={getTierBadgeColor(request.fromTier)}>
                            {getTierIcon(request.fromTier)}
                            <span className="ml-1">{request.fromTier}</span>
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => respondToRequestMutation.mutate({ requestId: request.id, action: 'accept' })}
                          disabled={respondToRequestMutation.isPending}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => respondToRequestMutation.mutate({ requestId: request.id, action: 'decline' })}
                          disabled={respondToRequestMutation.isPending}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Friends List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Friends ({friends.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingFriends ? (
                <div className="text-center py-8">Loading friends...</div>
              ) : friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
                  <p className="text-muted-foreground">Start by sending friend requests to other users!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {friends.map((friend: any) => (
                    <div key={friend.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.profileImage} />
                        <AvatarFallback>{friend.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{friend.username}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getTierBadgeColor(friend.tier)}>
                            {getTierIcon(friend.tier)}
                            <span className="ml-1">{friend.tier}</span>
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {friend.status === 'online' ? '🟢 Online' : '⚪ Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Social Betting Challenges</h3>
              <p className="text-muted-foreground mb-4">
                Challenge friends to head-to-head betting competitions coming soon!
              </p>
              <Button disabled>
                <Trophy className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialHub;