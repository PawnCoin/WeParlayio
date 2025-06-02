import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  TrendingUp, 
  MessageCircle,
  Trophy,
  Target,
  Plus,
  Share2,
  Eye,
  Clock,
  DollarSign,
  UserPlus
} from 'lucide-react';

interface SocialChallenge {
  id: string;
  createdBy: string;
  creatorName: string;
  title: string;
  description: string;
  eventName: string;
  pick: string;
  amount: number;
  odds: number;
  participants: number;
  maxParticipants: number;
  status: 'open' | 'full' | 'active' | 'completed';
  createdAt: string;
  expiresAt: string;
  sport: string;
  isPublic: boolean;
  tags: string[];
}

interface ChallengeComment {
  id: string;
  challengeId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export default function SocialBettingPlatform() {
  const [activeTab, setActiveTab] = useState('discover');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<SocialChallenge | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state for creating challenges
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    eventName: '',
    pick: '',
    amount: 25,
    maxParticipants: 10,
    sport: 'NFL',
    isPublic: true,
    expiresAt: ''
  });

  // Fetch social challenges
  const { data: challenges, isLoading } = useQuery({
    queryKey: ['/api/social-challenges'],
    refetchInterval: 30000,
  });

  // Fetch challenge comments
  const { data: comments } = useQuery({
    queryKey: ['/api/challenge-comments', selectedChallenge?.id],
    enabled: !!selectedChallenge,
  });

  // Create challenge mutation
  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData: any) => {
      const response = await fetch('/api/social-challenges/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challengeData),
      });
      if (!response.ok) throw new Error('Failed to create challenge');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge Created",
        description: "Your social betting challenge is now live!",
      });
      setShowCreateForm(false);
      setNewChallenge({
        title: '',
        description: '',
        eventName: '',
        pick: '',
        amount: 25,
        maxParticipants: 10,
        sport: 'NFL',
        isPublic: true,
        expiresAt: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social-challenges'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Join challenge mutation
  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const response = await fetch(`/api/social-challenges/${challengeId}/join`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to join challenge');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge Joined",
        description: "You've successfully joined the betting challenge!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social-challenges'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Join",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mock data for demonstration
  const mockChallenges: SocialChallenge[] = [
    {
      id: 'ch_001',
      createdBy: 'user_123',
      creatorName: 'BettingPro2024',
      title: 'Lakers vs Warriors Showdown',
      description: 'Who will dominate the Western Conference matchup?',
      eventName: 'Lakers @ Warriors',
      pick: 'Lakers ML',
      amount: 50,
      odds: -110,
      participants: 7,
      maxParticipants: 10,
      status: 'open',
      createdAt: '2024-06-02T10:00:00Z',
      expiresAt: '2024-06-02T20:00:00Z',
      sport: 'NBA',
      isPublic: true,
      tags: ['NBA', 'Western Conference', 'Rivalry']
    },
    {
      id: 'ch_002',
      createdBy: 'user_456',
      creatorName: 'NFLExpert',
      title: 'Cowboys Defense Challenge',
      description: 'Cowboys defense to record 2+ sacks vs Eagles',
      eventName: 'Cowboys vs Eagles',
      pick: 'Cowboys 2+ Sacks',
      amount: 25,
      odds: 150,
      participants: 12,
      maxParticipants: 15,
      status: 'open',
      createdAt: '2024-06-02T09:30:00Z',
      expiresAt: '2024-06-02T18:00:00Z',
      sport: 'NFL',
      isPublic: true,
      tags: ['NFL', 'Defense', 'Props']
    }
  ];

  const challengesList = challenges || mockChallenges;

  const handleCreateChallenge = () => {
    if (!newChallenge.title || !newChallenge.eventName || !newChallenge.pick) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createChallengeMutation.mutate(newChallenge);
  };

  const handleJoinChallenge = (challengeId: string) => {
    joinChallengeMutation.mutate(challengeId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff <= 0) return 'Expired';
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <span>Social Betting</span>
            </h1>
            <p className="text-gray-600">Create and join betting challenges with the community</p>
          </div>
          
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Challenge</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-challenges">My Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="nfl">NFL</SelectItem>
                    <SelectItem value="nba">NBA</SelectItem>
                    <SelectItem value="mlb">MLB</SelectItem>
                    <SelectItem value="nhl">NHL</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Amount Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Amounts</SelectItem>
                    <SelectItem value="0-25">$0 - $25</SelectItem>
                    <SelectItem value="25-50">$25 - $50</SelectItem>
                    <SelectItem value="50-100">$50 - $100</SelectItem>
                    <SelectItem value="100+">$100+</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challengesList.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getStatusColor(challenge.status)}>
                      {challenge.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{challenge.sport}</Badge>
                  </div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">{challenge.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Event:</span>
                      <span className="font-medium">{challenge.eventName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pick:</span>
                      <span className="font-medium">{challenge.pick}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-green-600">${challenge.amount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Odds:</span>
                      <span className="font-medium">
                        {challenge.odds > 0 ? '+' : ''}{challenge.odds}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{challenge.participants}/{challenge.maxParticipants}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{formatTimeRemaining(challenge.expiresAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      by {challenge.creatorName}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedChallenge(challenge)}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {challenge.status === 'open' && (
                        <Button 
                          size="sm"
                          onClick={() => handleJoinChallenge(challenge.id)}
                          disabled={joinChallengeMutation.isPending}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Join
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {challenge.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Challenges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>You haven't created any challenges yet</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setShowCreateForm(true)}
                >
                  Create Your First Challenge
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Social Betting Leaderboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div key={rank} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        rank === 2 ? 'bg-gray-100 text-gray-800' :
                        rank === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {rank}
                      </div>
                      <div>
                        <p className="font-medium">BettingPro{rank}</p>
                        <p className="text-sm text-gray-600">{(25 - rank * 2)} challenges won</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+$1,{(850 - rank * 100)}</p>
                      <p className="text-sm text-gray-600">78% win rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Challenge Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Challenge</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Challenge Title</Label>
                <Input
                  id="title"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                  placeholder="e.g., Lakers ML Challenge"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                  placeholder="Describe your betting challenge..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="eventName">Event</Label>
                <Input
                  id="eventName"
                  value={newChallenge.eventName}
                  onChange={(e) => setNewChallenge({...newChallenge, eventName: e.target.value})}
                  placeholder="e.g., Lakers @ Warriors"
                />
              </div>

              <div>
                <Label htmlFor="pick">Your Pick</Label>
                <Input
                  id="pick"
                  value={newChallenge.pick}
                  onChange={(e) => setNewChallenge({...newChallenge, pick: e.target.value})}
                  placeholder="e.g., Lakers ML"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newChallenge.amount}
                    onChange={(e) => setNewChallenge({...newChallenge, amount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={newChallenge.maxParticipants}
                    onChange={(e) => setNewChallenge({...newChallenge, maxParticipants: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sport">Sport</Label>
                <Select value={newChallenge.sport} onValueChange={(value) => setNewChallenge({...newChallenge, sport: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NFL">NFL</SelectItem>
                    <SelectItem value="NBA">NBA</SelectItem>
                    <SelectItem value="MLB">MLB</SelectItem>
                    <SelectItem value="NHL">NHL</SelectItem>
                    <SelectItem value="Soccer">Soccer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newChallenge.isPublic}
                  onChange={(e) => setNewChallenge({...newChallenge, isPublic: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label htmlFor="isPublic">Make challenge public</Label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateChallenge}
                disabled={createChallengeMutation.isPending}
              >
                {createChallengeMutation.isPending ? 'Creating...' : 'Create Challenge'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}