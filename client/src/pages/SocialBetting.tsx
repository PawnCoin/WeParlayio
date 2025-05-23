import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Share2, MessageSquare, Globe, Activity, UserPlus, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BettingChallenge from '@/components/social/BettingChallenge';

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
  
  // Mock feed data
  const socialFeed = [
    {
      id: 'p1',
      user: { id: 'u2', name: 'Jordan', avatar: '' },
      type: 'win',
      content: 'Just won a 5-leg parlay on NBA games! +1200 odds!',
      game: 'NBA Parlay',
      timestamp: '2 hours ago',
      likes: 8,
      comments: 3
    },
    {
      id: 'p2',
      user: { id: 'u3', name: 'Taylor', avatar: '' },
      type: 'share',
      content: 'Who wants to join my MLB season-long challenge?',
      game: 'MLB Challenge',
      timestamp: '5 hours ago',
      likes: 12,
      comments: 7
    },
    {
      id: 'p3',
      user: { id: 'u4', name: 'Casey', avatar: '' },
      type: 'prediction',
      content: "I think the Lakers are taking the championship this year. Who's with me?",
      game: 'NBA Finals',
      timestamp: '1 day ago',
      likes: 24,
      comments: 15
    }
  ];
  
  // Mock friend activity
  const friendActivity = [
    {
      id: 'a1',
      user: { id: 'u5', name: 'Riley', avatar: '' },
      action: 'placed a bet',
      details: 'Moneyline on Celtics',
      timestamp: '30 minutes ago'
    },
    {
      id: 'a2',
      user: { id: 'u6', name: 'Morgan', avatar: '' },
      action: 'won a challenge',
      details: 'UFC Fight Night Pool',
      timestamp: '2 hours ago'
    },
    {
      id: 'a3',
      user: { id: 'u7', name: 'Quinn', avatar: '' },
      action: 'shared a bet slip',
      details: '3-team parlay',
      timestamp: '4 hours ago'
    }
  ];
  
  // Mock groups
  const bettingGroups = [
    {
      id: 'g1',
      name: 'NBA Enthusiasts',
      members: 28,
      activeChallenge: true,
      image: ''
    },
    {
      id: 'g2',
      name: 'NFL Sunday Club',
      members: 42,
      activeChallenge: true,
      image: ''
    },
    {
      id: 'g3',
      name: 'UFC Bettors',
      members: 16,
      activeChallenge: false,
      image: ''
    }
  ];

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
                            <AvatarImage src={post.user.avatar} />
                            <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{post.user.name}</div>
                            <div className="text-xs text-muted-foreground">{post.timestamp}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="h-fit">
                          {post.type === 'win' && 'Winner 🏆'}
                          {post.type === 'share' && 'Challenge'}
                          {post.type === 'prediction' && 'Prediction'}
                        </Badge>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm">{post.content}</p>
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex gap-3">
                            <Button size="sm" variant="ghost" className="h-8 px-2">
                              <Heart className="h-4 w-4 mr-1" />
                              {post.likes}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 px-2">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {post.comments}
                            </Button>
                          </div>
                          <SocialShareButton
                            type={post.type === 'win' ? 'win' : post.type === 'share' ? 'challenge' : 'prediction'}
                            content={post.content}
                            user={{ name: post.user.name }}
                          />
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
              {friendActivity.map(activity => (
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