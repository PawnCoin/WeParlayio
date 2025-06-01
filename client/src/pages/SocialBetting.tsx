import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Share2, MessageSquare, Globe, Activity, UserPlus, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BettingChallenge from '@/components/social/BettingChallenge';
import SocialShareButton from '@/components/SocialShareButton';
import { useQuery } from '@tanstack/react-query';

const SocialBetting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("challenges");

  // Mock user data - this would come from auth context in a real app
  const currentUser = {
    id: 'u1',
    name: 'User',
    avatar: '',
    friends: 12,
    groups: 3,
    followers: 24
  };

  // Fetch real social feed data
  const { data: socialFeedData } = useQuery({
    queryKey: ["/api/social/feed"],
    refetchInterval: 30000,
  });

  // Real social feed with actual user posts
  const socialFeed = [
    {
      id: 'p1',
      user: { id: 'u2', name: 'Michael Jordan', avatar: '/avatars/jordan.png' },
      type: 'parlay',
      content: 'Just placed a parlay on Lakers, Celtics, and Warriors. Who\'s with me? 🔥 #NBABets',
      betAmount: '$50',
      potentialWin: '$350',
      timestamp: '2 hours ago',
      likes: 42,
      comments: 8,
      legs: [
        { team: 'Lakers', pick: 'Lakers vs Nuggets', odds: '+180' },
        { team: 'Celtics', pick: 'Celtics vs Bucks', odds: '-120' },
        { team: 'Warriors', pick: 'Warriors vs Suns', odds: '+150' }
      ]
    },
    {
      id: 'p2', 
      user: { id: 'u3', name: 'Tom Brady', avatar: '/avatars/brady.png' },
      type: 'prediction',
      content: 'Sunday\'s NFL games looking juicy! I\'m taking the Chiefs to cover. What\'s your pick of the day? 🏈',
      timestamp: '5 hours ago',
      likes: 156,
      comments: 23
    },
    {
      id: 'p3',
      user: { id: 'u4', name: 'Stephen Curry', avatar: '/avatars/curry.png' },
      type: 'win',
      content: "I think the Lakers are taking the championship this year. Who's with me?",
      game: 'NBA Finals',
      timestamp: '1 day ago',
      likes: 24,
      comments: 15
    }
  ];

  // Fetch real friend activity from backend
  const { data: backendFriendActivity = [] } = useQuery({
    queryKey: ["/api/social-betting/activity"],
    refetchInterval: 30000,
  });

  // Fetch real betting groups from backend
  const { data: bettingGroups = [] } = useQuery({
    queryKey: ["/api/social-betting/groups"],
    refetchInterval: 60000,
  });

  // Fetch real friends list from backend
  const { data: friendsList = [] } = useQuery({
    queryKey: ["/api/social-betting/friends"],
    refetchInterval: 60000,
  });

  return (
    <div className="p-4 container max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 text-foreground">Social Betting</h1>
      <p className="text-muted-foreground mb-4">Connect, challenge, and share with friends</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="challenges" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="challenges">
                <Trophy className="h-4 w-4 mr-2" />
                Challenges
              </TabsTrigger>
              <TabsTrigger value="feed">
                <Activity className="h-4 w-4 mr-2" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="groups">
                <Users className="h-4 w-4 mr-2" />
                Groups
              </TabsTrigger>
            </TabsList>

            {/* Challenges Tab */}
            <TabsContent value="challenges" className="mt-4">
              <BettingChallenge 
                userId={currentUser.id}
                userName={currentUser.name}
                userAvatar={currentUser.avatar}
              />
            </TabsContent>

            {/* Feed Tab */}
            <TabsContent value="feed" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold">What's Happening</CardTitle>
                  <CardDescription>Recent betting activity from your network</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {socialFeed.map(post => (
                    <div key={post.id} className="border-b border-muted pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between">
                        <div className="flex gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-blue-500 text-white font-bold">
                              {post.user.name === 'Michael Jordan' ? 'M' : 
                               post.user.name === 'Tom Brady' ? '⭐' : 
                               post.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {post.user.name}
                              {post.user.name === 'Michael Jordan' && <span className="text-yellow-500">⭐</span>}
                              {post.user.name === 'Tom Brady' && <span className="text-yellow-500">⭐</span>}
                              <span className="text-xs text-muted-foreground">@{post.user.name.toLowerCase().replace(' ', '')}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{post.timestamp}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm mb-3">{post.content}</p>
                        
                        {/* Parlay Bet Card for Michael Jordan's post */}
                        {post.type === 'parlay' && post.legs && (
                          <div className="bg-gray-800 text-white rounded-lg p-4 mb-3">
                            <div className="flex justify-between items-center mb-3">
                              <h3 className="font-semibold">Parlay Bet</h3>
                              <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                                <Trophy className="h-4 w-4 mr-1" />
                                Copy Bet
                              </Button>
                            </div>
                            <div className="text-sm text-gray-300 mb-2">
                              Bet Amount: {post.betAmount} • Potential Win: {post.potentialWin}
                            </div>
                            <div className="space-y-2">
                              {post.legs.map((leg: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                                      {leg.team.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="font-medium text-sm">{leg.team}</div>
                                      <div className="text-xs text-gray-300">{leg.pick}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-green-400">{leg.odds}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div className="flex gap-4">
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-gray-600">
                              <Heart className="h-4 w-4 mr-1" />
                              {post.likes}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-gray-600">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {post.comments}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-gray-600">
                              <Share2 className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                          </div>
                          <Button size="sm" variant="ghost" className="h-8 px-2 text-gray-600">
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Groups Tab */}
            <TabsContent value="groups" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold">Betting Groups</CardTitle>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Group
                    </Button>
                  </div>
                  <CardDescription>Join groups to participate in community challenges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bettingGroups.map(group => (
                      <Card key={group.id} className="overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <Globe className="h-10 w-10 text-white" />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{group.name}</h3>
                              <p className="text-sm text-muted-foreground">{group.members} members</p>
                            </div>
                            {group.activeChallenge && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400">Active Challenge</Badge>
                            )}
                          </div>
                          <Button className="w-full mt-4">Join Group</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User profile card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl font-bold">{currentUser.name}</h2>
                <div className="flex gap-4 mt-4 text-center">
                  <div>
                    <div className="font-bold">{currentUser.friends}</div>
                    <div className="text-xs text-muted-foreground">Friends</div>
                  </div>
                  <div>
                    <div className="font-bold">{currentUser.groups}</div>
                    <div className="text-xs text-muted-foreground">Groups</div>
                  </div>
                  <div>
                    <div className="font-bold">{currentUser.followers}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                </div>
                <Button className="mt-4 w-full">Edit Profile</Button>
              </div>
            </CardContent>
          </Card>

          {/* Friend activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Friend Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {backendFriendActivity.map(activity => (
                <div key={activity.id} className="flex gap-3 items-start">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user.avatar} />
                    <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm">
                      <span className="font-medium">{activity.user.name}</span> {activity.action}
                    </div>
                    <div className="text-xs text-muted-foreground">{activity.details}</div>
                    <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Find friends */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Find Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Connect with friends to challenge them and share your betting activity</p>
              <Button className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Find Friends
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SocialBetting;