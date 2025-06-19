import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Crown, 
  Search, 
  Filter,
  Star,
  Send,
  UserCheck,
  Lock,
  Zap
} from "lucide-react";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  subscriptionTier: string;
  balance: number;
  wins: number;
  createdAt: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

const UserDirectory: React.FC = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [showMessaging, setShowMessaging] = useState(false);

  // Get current user info
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/me'],
  });

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users/directory'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Get user's friends
  const { data: friends = [] } = useQuery<User[]>({
    queryKey: ['/api/users/friends'],
  });

  // Get messages
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/users/messages'],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Add friend mutation
  const addFriendMutation = useMutation({
    mutationFn: (userId: string) => apiRequest('POST', '/api/users/add-friend', { userId }),
    onSuccess: () => {
      toast({
        title: "✅ Friend Added!",
        description: "You can now send messages to this user",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/friends'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add friend. Make sure you have a paid membership.",
        variant: "destructive"
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { toUserId: string; content: string }) => 
      apiRequest('POST', '/api/users/send-message', data),
    onSuccess: () => {
      setMessageContent('');
      setShowMessaging(false);
      toast({
        title: "✅ Message Sent!",
        description: "Your message has been delivered",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/messages'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. You must be friends to message.",
        variant: "destructive"
      });
    }
  });

  // Filter users based on search and tier
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || user.subscriptionTier === filterTier;
    return matchesSearch && matchesTier;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'diamond': return 'bg-blue-100 text-blue-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getTierIcon = (tier: string) => {
    if (['diamond', 'gold', 'silver', 'bronze'].includes(tier)) {
      return <Crown className="h-3 w-3" />;
    }
    return null;
  };

  const canInteract = currentUser?.subscriptionTier && 
                     ['diamond', 'gold', 'silver', 'bronze'].includes(currentUser.subscriptionTier);

  const isFriend = (userId: string) => friends.some((friend: any) => friend.id === userId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Users className="h-8 w-8 text-blue-500" />
            WeParlay Community
          </h1>
          <p className="text-gray-600">Connect with fellow bettors and build your network</p>
          
          {!canInteract && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Lock className="h-5 w-5" />
                <span className="font-medium">Upgrade to interact with other users!</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Get a paid membership to add friends and send messages
              </p>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by username or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <select 
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Tiers</option>
                <option value="diamond">Diamond</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="bronze">Bronze</option>
                <option value="wood">Wood (Free)</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{filteredUsers.length} users found</span>
              {canInteract && (
                <>
                  <span>•</span>
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span>{friends.length} friends</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user: User) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profileImageUrl} />
                      <AvatarFallback>
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user.username}</h3>
                      <p className="text-sm text-gray-500">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </div>
                  {user.isOnline && (
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={`${getTierColor(user.subscriptionTier)} flex items-center gap-1`}>
                    {getTierIcon(user.subscriptionTier)}
                    {user.subscriptionTier.toUpperCase()}
                  </Badge>
                  {user.wins > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {user.wins} wins
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">Balance</p>
                    <p className="font-medium">${user.balance}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Joined</p>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {canInteract ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {!isFriend(user.id) ? (
                        <Button 
                          onClick={() => addFriendMutation.mutate(user.id)}
                          size="sm" 
                          className="flex-1"
                          disabled={addFriendMutation.isPending}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add Friend
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => {
                            setSelectedUser(user);
                            setShowMessaging(true);
                          }}
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      )}
                    </div>
                    
                    {/* Social Sharing Actions */}
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => {
                          // Share user profile to social media
                          const shareText = `Check out ${user.username} on WeParlay! 🎯 ${user.wins} wins with $${user.balance} balance. Join the community! #WeParlay #SportsBox`;
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
                        }}
                      >
                        Share
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => {
                          toast({
                            title: "👍 Liked!",
                            description: `You liked ${user.username}'s profile`,
                          });
                        }}
                      >
                        Like
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => {
                          // Challenge user to bet
                          toast({
                            title: "🎯 Challenge Sent!",
                            description: `Bet challenge sent to ${user.username}`,
                          });
                        }}
                      >
                        Challenge
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-gray-500 py-2">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm">Upgrade to interact</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Messaging Modal */}
        <Dialog open={showMessaging} onOpenChange={setShowMessaging}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Send Message to {selectedUser?.username}
              </DialogTitle>
              <DialogDescription>
                Send a direct message to this user
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Textarea
                placeholder="Type your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => selectedUser && sendMessageMutation.mutate({
                    toUserId: selectedUser.id,
                    content: messageContent
                  })}
                  disabled={!messageContent.trim() || sendMessageMutation.isPending}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowMessaging(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upgrade CTA for free users */}
        {!canInteract && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Unlock Social Features</h3>
                <p className="text-gray-600 mb-4">
                  Upgrade to any paid tier to add friends, send messages, and connect with the WeParlay community!
                </p>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                  onClick={() => setLocation('/upgrade-tier')}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Membership
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserDirectory;