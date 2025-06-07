import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Trophy, Share2, MessageSquare, Globe, Activity, UserPlus, Heart, Plus, DollarSign, Search, Check, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const SocialBetting: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("challenges");
  const [newChallengeOpen, setNewChallengeOpen] = useState(false);
  const [challengeForm, setChallengeForm] = useState({
    eventName: '',
    amount: '',
    pick: '',
    customMessage: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user's betting challenges
  const { data: challenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['/api/challenges'],
    enabled: isAuthenticated
  });

  // Fetch friends for social features
  const { data: friendsData } = useQuery({
    queryKey: ['/api/friends'],
    enabled: isAuthenticated
  });

  // Fetch pending friend requests
  const { data: friendRequestsData } = useQuery({
    queryKey: ['/api/friends/requests'],
    enabled: isAuthenticated
  });

  // Fetch social activity feed
  const { data: socialActivity } = useQuery({
    queryKey: ['/api/social-betting/activity'],
    enabled: isAuthenticated
  });

  // Friend request mutations
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (friendId: string) => {
      return apiRequest('POST', '/api/friends/request', { friendId });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Friend request sent!" });
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const acceptFriendRequestMutation = useMutation({
    mutationFn: async (friendId: string) => {
      return apiRequest('POST', '/api/friends/accept', { friendId });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Friend request accepted!" });
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      return apiRequest('DELETE', `/api/friends/${friendId}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Friend removed" });
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Create new challenge mutation
  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData: any) => {
      return apiRequest('POST', '/api/challenges', challengeData);
    },
    onSuccess: () => {
      toast({
        title: "Challenge Created",
        description: "Your betting challenge has been sent!",
      });
      setNewChallengeOpen(false);
      setChallengeForm({ eventName: '', amount: '', pick: '', customMessage: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create challenge",
        variant: "destructive",
      });
    }
  });

  // Accept challenge mutation
  const acceptChallengeMutation = useMutation({
    mutationFn: async (challengeUuid: string) => {
      return apiRequest('POST', `/api/challenges/${challengeUuid}/accept`);
    },
    onSuccess: () => {
      toast({
        title: "Challenge Accepted",
        description: "You've accepted the betting challenge!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept challenge",
        variant: "destructive",
      });
    }
  });

  const handleCreateChallenge = () => {
    if (!challengeForm.eventName || !challengeForm.amount || !challengeForm.pick) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createChallengeMutation.mutate({
      eventName: challengeForm.eventName,
      amount: parseFloat(challengeForm.amount),
      pick: challengeForm.pick,
      customMessage: challengeForm.customMessage || `Challenge on ${challengeForm.eventName}`
    });
  };

  const handleAcceptChallenge = (challengeUuid: string) => {
    acceptChallengeMutation.mutate(challengeUuid);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please log in to access social betting features.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Social Betting</h1>
          <p className="text-muted-foreground">Challenge friends and compete in betting</p>
        </div>
        
        <Dialog open={newChallengeOpen} onOpenChange={setNewChallengeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Betting Challenge</DialogTitle>
              <DialogDescription>
                Challenge other users to a head-to-head bet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  value={challengeForm.eventName}
                  onChange={(e) => setChallengeForm({...challengeForm, eventName: e.target.value})}
                  placeholder="e.g., Lakers vs Warriors"
                />
              </div>
              <div>
                <Label htmlFor="pick">Your Pick</Label>
                <Input
                  id="pick"
                  value={challengeForm.pick}
                  onChange={(e) => setChallengeForm({...challengeForm, pick: e.target.value})}
                  placeholder="e.g., Lakers to win"
                />
              </div>
              <div>
                <Label htmlFor="amount">Bet Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={challengeForm.amount}
                  onChange={(e) => setChallengeForm({...challengeForm, amount: e.target.value})}
                  placeholder="25"
                />
              </div>
              <div>
                <Label htmlFor="message">Custom Message (Optional)</Label>
                <Input
                  id="message"
                  value={challengeForm.customMessage}
                  onChange={(e) => setChallengeForm({...challengeForm, customMessage: e.target.value})}
                  placeholder="Add a personal message..."
                />
              </div>
              <Button 
                onClick={handleCreateChallenge}
                disabled={createChallengeMutation.isPending}
                className="w-full"
              >
                {createChallengeMutation.isPending ? 'Creating...' : 'Create Challenge'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="challenges">My Challenges</TabsTrigger>
          <TabsTrigger value="activity">Social Feed</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid gap-4">
            {challengesLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">Loading challenges...</div>
                </CardContent>
              </Card>
            ) : challenges && challenges.length > 0 ? (
              challenges.map((challenge: any) => (
                <Card key={challenge.uuid}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{challenge.eventName}</h3>
                        <p className="text-sm text-muted-foreground">{challenge.customMessage}</p>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ${challenge.amount}
                          </Badge>
                          <Badge variant={
                            challenge.status === 'pending' ? 'default' :
                            challenge.status === 'accepted' ? 'secondary' :
                            challenge.status === 'completed' ? 'outline' : 'destructive'
                          }>
                            {challenge.status}
                          </Badge>
                        </div>
                      </div>
                      {challenge.status === 'pending' && challenge.createdBy !== user?.id && (
                        <Button 
                          onClick={() => handleAcceptChallenge(challenge.uuid)}
                          disabled={acceptChallengeMutation.isPending}
                        >
                          Accept Challenge
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="font-semibold">No Challenges Yet</h3>
                    <p className="text-muted-foreground">Create your first betting challenge to get started!</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid gap-4">
            {socialActivity && socialActivity.length > 0 ? (
              socialActivity.map((activity: any) => (
                <Card key={activity.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={activity.user?.profileImageUrl} />
                        <AvatarFallback>{activity.user?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{activity.user?.username || 'User'}</h4>
                        <p className="text-muted-foreground">{activity.content}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Button variant="ghost" size="sm">
                            <Heart className="h-4 w-4 mr-1" />
                            Like
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Comment
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="font-semibold">No Activity Yet</h3>
                    <p className="text-muted-foreground">Follow friends to see their betting activity!</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="friends" className="space-y-6">
          <div className="grid gap-4">
            {friends && friends.length > 0 ? (
              friends.map((friend: any) => (
                <Card key={friend.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={friend.profileImageUrl} />
                          <AvatarFallback>{friend.username?.[0]?.toUpperCase() || 'F'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{friend.username}</h4>
                          <p className="text-sm text-muted-foreground">
                            {friend.wins || 0} wins • {friend.tier || 'Bronze'} tier
                          </p>
                        </div>
                      </div>
                      <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Challenge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-2">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="font-semibold">No Friends Yet</h3>
                    <p className="text-muted-foreground">Add friends to start social betting!</p>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Find Friends
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialBetting;