import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Share2, MessageSquare, Heart, 
  Award, Trophy, TrendingUp, Copy, Star, 
  Calendar, Bookmark, Send, UserPlus, ThumbsUp
} from "lucide-react";
import { getTeamLogo } from "@/lib/teamLogos";

// Sample social feed data
const sampleFeed = [
  {
    id: 1,
    user: {
      id: 101,
      name: "Michael Jordan",
      username: "@airjordan",
      avatar: "https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/1035.png",
      verified: true,
      winRate: 68
    },
    content: "Just placed a parlay on Lakers, Celtics, and Warriors. Who's with me? 🏀 #NBABets",
    bet: {
      type: "Parlay",
      selections: [
        { team: "Lakers", opponent: "Nuggets", odds: +180, game: "Lakers vs Nuggets" },
        { team: "Celtics", opponent: "Bucks", odds: -120, game: "Celtics vs Bucks" },
        { team: "Warriors", opponent: "Suns", odds: +150, game: "Warriors vs Suns" }
      ],
      amount: 50,
      potentialWin: 350
    },
    likes: 42,
    comments: 8,
    shares: 5,
    timestamp: "2 hours ago"
  },
  {
    id: 2,
    user: {
      id: 102,
      name: "Tom Brady",
      username: "@tb12",
      avatar: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/2330.png",
      verified: true,
      winRate: 75
    },
    content: "Sunday's NFL games looking juicy! I'm taking the Chiefs to cover. What's your pick of the day? 🏈",
    bet: {
      type: "Spread",
      selections: [
        { team: "Chiefs", opponent: "Ravens", odds: -110, point: -3.5, game: "Chiefs vs Ravens" }
      ],
      amount: 100,
      potentialWin: 190
    },
    likes: 87,
    comments: 23,
    shares: 12,
    timestamp: "5 hours ago"
  },
  {
    id: 3,
    user: {
      id: 103,
      name: "Betting Expert",
      username: "@betmaster",
      avatar: "",
      verified: false,
      winRate: 62
    },
    content: "NHL underdogs are hitting at 58% this month! Here's my lock of the day. Don't sleep on the value here!",
    bet: {
      type: "Moneyline",
      selections: [
        { team: "Maple Leafs", opponent: "Bruins", odds: +175, game: "Maple Leafs vs Bruins" }
      ],
      amount: 75,
      potentialWin: 206
    },
    likes: 31,
    comments: 14,
    shares: 7,
    timestamp: "Yesterday"
  },
  {
    id: 4,
    user: {
      id: 104,
      name: "LeBron James",
      username: "@kingjames",
      avatar: "https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/1966.png",
      verified: true,
      winRate: 71
    },
    content: "Big game tonight! What are your predictions? I'm taking the over on this one. 👑",
    bet: {
      type: "Total",
      selections: [
        { bet: "Over 222.5", odds: -105, game: "Lakers vs Warriors" }
      ],
      amount: 200,
      potentialWin: 390
    },
    likes: 512,
    comments: 98,
    shares: 45,
    timestamp: "1 day ago"
  }
];

// Sample friends data
const friendsSample = [
  {
    id: 201,
    name: "Stephen Curry",
    username: "@stephcurry",
    avatar: "https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3975.png",
    online: true,
    winRate: 64,
    betsWon: 43,
    activeBets: 3
  },
  {
    id: 202,
    name: "Patrick Mahomes",
    username: "@patrickmahomes",
    avatar: "https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3139477.png",
    online: false,
    winRate: 70,
    betsWon: 56,
    activeBets: 5
  },
  {
    id: 203,
    name: "Alex Morgan",
    username: "@alexmorgan",
    avatar: "https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/164095.png",
    online: true,
    winRate: 58,
    betsWon: 27,
    activeBets: 2
  },
  {
    id: 204,
    name: "Aaron Judge",
    username: "@aaronjudge",
    avatar: "https://a.espncdn.com/combiner/i?img=/i/headshots/mlb/players/full/33192.png",
    online: false,
    winRate: 62,
    betsWon: 38,
    activeBets: 0
  }
];

// Sample betting groups
const bettingGroupsSample = [
  {
    id: 301,
    name: "NBA Sharp Bettors",
    members: 128,
    sport: "Basketball",
    activity: "Very Active",
    image: "https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-basketball.png",
    private: false
  },
  {
    id: 302,
    name: "NFL Sunday Crew",
    members: 86,
    sport: "Football",
    activity: "Active",
    image: "https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-football.png",
    private: false
  },
  {
    id: 303,
    name: "Baseball Betting Pros",
    members: 54,
    sport: "Baseball",
    activity: "Moderate",
    image: "https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-baseball.png",
    private: true
  }
];

// Social betting page component
const Social: React.FC = () => {
  const { toast } = useToast();
  const [postContent, setPostContent] = useState<string>("");
  
  // Fetch feed data
  const { data: feed = sampleFeed, isLoading: isFeedLoading } = useQuery({
    queryKey: ['/api/social/feed'],
    enabled: false, // Disable automatic fetching since we have sample data
  });
  
  // Fetch friends data
  const { data: friends = friendsSample, isLoading: isFriendsLoading } = useQuery({
    queryKey: ['/api/social/friends'],
    enabled: false, // Disable automatic fetching since we have sample data
  });
  
  // Fetch betting groups
  const { data: groups = bettingGroupsSample, isLoading: isGroupsLoading } = useQuery({
    queryKey: ['/api/social/groups'],
    enabled: false, // Disable automatic fetching since we have sample data
  });
  
  // Handle post submission
  const handlePostSubmit = () => {
    if (!postContent.trim()) {
      toast({
        title: "Empty post",
        description: "Please write something before posting.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Post Shared!",
      description: "Your post has been shared with your followers.",
    });
    
    setPostContent("");
  };
  
  // Handle like action on a post
  const handleLike = (postId: number) => {
    toast({
      title: "Post Liked",
      description: "You liked this post.",
    });
  };
  
  // Handle sharing a post
  const handleShare = (postId: number) => {
    toast({
      title: "Post Shared",
      description: "You shared this post with your followers.",
    });
  };
  
  // Handle copying a bet
  const handleCopyBet = (bet: any) => {
    toast({
      title: "Bet Copied!",
      description: "This bet has been added to your bet slip.",
    });
  };
  
  // Handle following a user
  const handleFollow = (userId: number) => {
    toast({
      title: "Following",
      description: "You are now following this user.",
    });
  };
  
  // Handle joining a group
  const handleJoinGroup = (groupId: number) => {
    toast({
      title: "Group Joined",
      description: "You have joined this betting group.",
    });
  };
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Social Betting</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="feed">
                <MessageSquare className="h-4 w-4 mr-2" />
                Social Feed
              </TabsTrigger>
              <TabsTrigger value="groups">
                <Users className="h-4 w-4 mr-2" />
                Betting Groups
              </TabsTrigger>
            </TabsList>
            
            {/* Social Feed Tab */}
            <TabsContent value="feed">
              {/* Post Creation */}
              <Card className="bg-card text-card-foreground mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea 
                        placeholder="Share your betting picks or thoughts..." 
                        className="bg-background text-foreground mb-3"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                      />
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-xs bg-background text-foreground">
                            Add Bet
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs bg-background text-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            Event
                          </Button>
                        </div>
                        <Button 
                          className="text-sm" 
                          onClick={handlePostSubmit}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Feed Posts */}
              <div className="space-y-4">
                {feed.map((post) => (
                  <Card key={post.id} className="bg-card text-card-foreground">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.user.avatar} alt={post.user.name} />
                          <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-foreground">{post.user.name}</span>
                            {post.user.verified && (
                              <Badge variant="secondary" className="px-1 py-0 h-5">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">{post.user.username}</span>
                            <div className="flex-1"></div>
                            <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                          </div>
                          
                          <p className="text-foreground mb-3">{post.content}</p>
                          
                          {/* Bet Card */}
                          {post.bet && (
                            <div className="bg-muted rounded-lg p-3 mb-3 relative border border-border">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-foreground">{post.bet.type} Bet</h4>
                                  <p className="text-xs text-muted-foreground">Bet Amount: ${post.bet.amount} • Potential Win: ${post.bet.potentialWin}</p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 px-2 text-xs"
                                  onClick={() => handleCopyBet(post.bet)}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy Bet
                                </Button>
                              </div>
                              
                              <div className="space-y-2">
                                {post.bet.selections.map((selection, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    {selection.team && (
                                      <img 
                                        src={getTeamLogo(selection.team)} 
                                        alt={selection.team} 
                                        className="w-5 h-5" 
                                      />
                                    )}
                                    <div className="flex-1">
                                      {selection.team ? (
                                        <span className="text-foreground">
                                          {selection.team} {selection.point && `${selection.point > 0 ? '+' : ''}${selection.point}`}
                                        </span>
                                      ) : (
                                        <span className="text-foreground">{selection.bet}</span>
                                      )}
                                      <span className="text-xs text-muted-foreground block">{selection.game}</span>
                                    </div>
                                    <Badge variant="outline" className="bg-background text-foreground">
                                      {selection.odds > 0 ? `+${selection.odds}` : selection.odds}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex justify-between items-center mt-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-muted-foreground"
                              onClick={() => handleLike(post.id)}
                            >
                              <Heart className="h-4 w-4 mr-1" />
                              {post.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {post.comments}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-muted-foreground"
                              onClick={() => handleShare(post.id)}
                            >
                              <Share2 className="h-4 w-4 mr-1" />
                              {post.shares}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                              <Bookmark className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            {/* Betting Groups Tab */}
            <TabsContent value="groups">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map(group => (
                  <Card key={group.id} className="bg-card text-card-foreground">
                    <CardContent className="p-0">
                      <div className="p-4 flex gap-4 items-center">
                        <div className="h-12 w-12 rounded-md flex items-center justify-center bg-muted">
                          <img 
                            src={group.image} 
                            alt={group.name} 
                            className="h-8 w-8" 
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold flex items-center text-foreground">
                            {group.name} 
                            {group.private && (
                              <Badge variant="outline" className="ml-2 text-xs bg-background text-foreground">
                                Private
                              </Badge>
                            )}
                          </h3>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Users className="h-3 w-3 mr-1" />
                            <span>{group.members} members</span>
                            <span className="mx-2">•</span>
                            <span>{group.sport}</span>
                            <span className="mx-2">•</span>
                            <span>{group.activity}</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-background text-foreground"
                          onClick={() => handleJoinGroup(group.id)}
                        >
                          Join
                        </Button>
                      </div>
                      
                      <div className="border-t border-border px-4 py-3 flex justify-between bg-muted text-xs text-muted-foreground">
                        <span>Recent Activity: 23 new bets today</span>
                        <span>Created 2 months ago</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Create Group Card */}
                <Card className="bg-card text-card-foreground border-dashed">
                  <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                    <Users className="h-10 w-10 mb-3 text-primary" />
                    <h3 className="font-medium mb-1 text-foreground">Create a Betting Group</h3>
                    <p className="text-sm text-muted-foreground mb-4">Start your own group and invite friends to share bets</p>
                    <Button>Create Group</Button>
                  </CardContent>
                </Card>
              </div>
              
              <h3 className="text-lg font-semibold mt-8 mb-3 text-foreground">Recommended Groups</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-card text-card-foreground">
                  <CardContent className="p-0">
                    <div className="p-4 flex gap-4 items-center">
                      <div className="h-12 w-12 rounded-md flex items-center justify-center bg-muted">
                        <img 
                          src="https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-hockey.png" 
                          alt="Hockey Group" 
                          className="h-8 w-8" 
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">NHL Puck Predictors</h3>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          <span>209 members</span>
                          <span className="mx-2">•</span>
                          <span>Hockey</span>
                          <span className="mx-2">•</span>
                          <span>Very Active</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-background text-foreground"
                      >
                        Join
                      </Button>
                    </div>
                    
                    <div className="border-t border-border px-4 py-3 flex justify-between bg-muted text-xs text-muted-foreground">
                      <span>Recent Activity: 35 new bets today</span>
                      <span>Created 5 months ago</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-card text-card-foreground">
                  <CardContent className="p-0">
                    <div className="p-4 flex gap-4 items-center">
                      <div className="h-12 w-12 rounded-md flex items-center justify-center bg-muted">
                        <img 
                          src="https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-soccer.png" 
                          alt="Soccer Group" 
                          className="h-8 w-8" 
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Premier League Bettors</h3>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          <span>182 members</span>
                          <span className="mx-2">•</span>
                          <span>Soccer</span>
                          <span className="mx-2">•</span>
                          <span>Active</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-background text-foreground"
                      >
                        Join
                      </Button>
                    </div>
                    
                    <div className="border-t border-border px-4 py-3 flex justify-between bg-muted text-xs text-muted-foreground">
                      <span>Recent Activity: 18 new bets today</span>
                      <span>Created 3 months ago</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Top Bettors */}
          <Card className="bg-card text-card-foreground">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center text-foreground">
                <Trophy className="h-4 w-4 mr-2 text-primary" />
                Top Bettors
              </CardTitle>
              <CardDescription>Highest win rates this month</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {friends.slice(0, 3).map((friend, index) => (
                  <div key={friend.id} className="flex items-center gap-3 p-3">
                    <div className="text-xl font-semibold text-muted-foreground w-6 text-center">
                      {index + 1}
                    </div>
                    <Avatar>
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-foreground">{friend.name}</span>
                        {index === 0 && (
                          <Badge className="ml-2 px-1 py-0 h-5 bg-yellow-500 text-white">
                            <Award className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{friend.betsWon} bets won</div>
                    </div>
                    <div>
                      <div className="font-semibold text-right text-primary">
                        {friend.winRate}%
                      </div>
                      <div className="text-xs text-muted-foreground text-right">Win rate</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 text-center">
                <Button variant="link" className="text-primary text-xs">
                  View All Rankings
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Friends List */}
          <Card className="bg-card text-card-foreground">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center text-foreground">
                <Users className="h-4 w-4 mr-2 text-primary" />
                Friends
              </CardTitle>
              <CardDescription>People you follow</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center gap-3 p-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={friend.avatar} alt={friend.name} />
                        <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {friend.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{friend.name}</div>
                      <div className="text-xs text-muted-foreground">{friend.username}</div>
                    </div>
                    {friend.activeBets > 0 ? (
                      <Badge variant="secondary" className="text-xs bg-background text-foreground">
                        {friend.activeBets} active bets
                      </Badge>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-3 mx-3 text-sm bg-background text-foreground"
                style={{ width: 'calc(100% - 24px)' }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Find Friends
              </Button>
            </CardContent>
          </Card>
          
          {/* Trending Bets */}
          <Card className="bg-card text-card-foreground">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center text-foreground">
                <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                Trending Bets
              </CardTitle>
              <CardDescription>Popular picks right now</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <img 
                        src={getTeamLogo("Golden State Warriors")} 
                        alt="Warriors" 
                        className="w-5 h-5 mr-2" 
                      />
                      <span className="font-medium text-foreground">Warriors -4.5</span>
                    </div>
                    <Badge variant="outline" className="bg-background text-foreground">+115</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Warriors vs Grizzlies</span>
                    <div className="flex items-center text-green-500">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      <span>82% taking this</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <img 
                        src={getTeamLogo("Kansas City Chiefs", "NFL")} 
                        alt="Chiefs" 
                        className="w-5 h-5 mr-2" 
                      />
                      <span className="font-medium text-foreground">Chiefs ML</span>
                    </div>
                    <Badge variant="outline" className="bg-background text-foreground">-150</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Chiefs vs Bills</span>
                    <div className="flex items-center text-green-500">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      <span>78% taking this</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <span className="font-medium text-foreground">LAL/BOS Over 224.5</span>
                    </div>
                    <Badge variant="outline" className="bg-background text-foreground">-110</Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Lakers vs Celtics</span>
                    <div className="flex items-center text-green-500">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      <span>65% taking this</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Social;