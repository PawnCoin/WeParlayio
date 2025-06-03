import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  MessageSquare, 
  Users, 
  Target, 
  Zap, 
  CheckCircle, 
  TrendingUp, 
  Activity,
  Clock,
  Phone,
  Send,
  BarChart3
} from 'lucide-react';
import { HeadToHeadChallenge } from '@/components/betting/HeadToHeadChallenge';

interface ChallengeProps {
  id: string;
  opponent: string;
  amount: number;
  event: string;
  pick: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'auto-settled';
  expiry: string;
  date: string;
  method?: 'sms' | 'email' | 'app';
  responseTime?: number;
}

const UnifiedSMSBetting: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('create');
  const [showSMSForm, setShowSMSForm] = useState(false);
  const [smsData, setSMSData] = useState({
    phone: '',
    amount: '',
    pick: '',
    game: '',
    message: ''
  });

  // Fetch challenges with enhanced data
  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['/api/challenges'],
    enabled: isAuthenticated
  });

  // Fetch live games for quick betting
  const { data: liveGames = [] } = useQuery({
    queryKey: ['/api/events/live'],
    enabled: isAuthenticated
  });

  // Fetch SMS statistics
  const { data: smsStats } = useQuery({
    queryKey: ['/api/sms/statistics'],
    enabled: isAuthenticated
  });

  // Quick SMS bet mutation
  const sendSMSBet = useMutation({
    mutationFn: async (betData: typeof smsData) => {
      return apiRequest('POST', '/api/sms/quick-bet', betData);
    },
    onSuccess: () => {
      toast({
        title: "SMS Challenge Sent!",
        description: "Your friend will receive a text message to accept the challenge.",
      });
      setShowSMSForm(false);
      setSMSData({ phone: '', amount: '', pick: '', game: '', message: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send SMS challenge. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Auto-settlement system
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(async () => {
      try {
        await apiRequest('POST', '/api/challenges/auto-settle');
        queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      } catch (error) {
        // Silent auto-settlement check
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, queryClient]);

  const typedChallenges = (challenges as ChallengeProps[]) || [];
  const activeChallenges = typedChallenges.filter(c => c.status === 'pending' || c.status === 'accepted');
  const completedChallenges = typedChallenges.filter(c => c.status === 'completed' || c.status === 'auto-settled');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-white';
      case 'accepted': return 'bg-blue-500 text-white';
      case 'completed': return 'bg-green-500 text-white';
      case 'auto-settled': return 'bg-purple-500 text-white';
      case 'declined': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleSMSSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsData.phone || !smsData.amount || !smsData.pick) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    sendSMSBet.mutate(smsData);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Enhanced SMS Betting System</CardTitle>
            <CardDescription>
              Please log in to access SMS betting features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/api/login" className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Get Started
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Enhanced SMS Betting System</h1>
        <p className="text-muted-foreground mb-4">
          Revolutionary Head-to-Head SMS betting with auto-settlement capabilities and real-time notifications
        </p>
        
        {/* Enhanced Features Banner */}
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary" className="px-3 py-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Instant SMS Challenges
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Auto-Settlement
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Zap className="h-4 w-4 mr-2" />
            Real-time Notifications
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <TrendingUp className="h-4 w-4 mr-2" />
            SMS Analytics
          </Badge>
        </div>
      </div>

      {/* SMS Statistics */}
      {smsStats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              SMS Betting Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{smsStats.totalSent}</div>
                <div className="text-sm text-muted-foreground">SMS Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{smsStats.acceptanceRate}%</div>
                <div className="text-sm text-muted-foreground">Acceptance Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{smsStats.autoSettled}</div>
                <div className="text-sm text-muted-foreground">Auto-Settled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{smsStats.avgResponseTime}min</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create Challenge</TabsTrigger>
          <TabsTrigger value="sms">Quick SMS Bet</TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({completedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <div className="space-y-6">
            <HeadToHeadChallenge />
          </div>
        </TabsContent>

        <TabsContent value="sms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Quick SMS Challenge
              </CardTitle>
              <CardDescription>
                Send instant SMS betting challenges to friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSMSSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Friend's Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={smsData.phone}
                      onChange={(e) => setSMSData({ ...smsData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Bet Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="25"
                      value={smsData.amount}
                      onChange={(e) => setSMSData({ ...smsData, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="game">Game/Event</Label>
                    <Input
                      id="game"
                      placeholder="Lakers vs Celtics"
                      value={smsData.game}
                      onChange={(e) => setSMSData({ ...smsData, game: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pick">Your Pick</Label>
                    <Input
                      id="pick"
                      placeholder="Lakers -5.5"
                      value={smsData.pick}
                      onChange={(e) => setSMSData({ ...smsData, pick: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Custom Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Ready to lose some money? 😄"
                    value={smsData.message}
                    onChange={(e) => setSMSData({ ...smsData, message: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={sendSMSBet.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendSMSBet.isPending ? 'Sending...' : 'Send SMS Challenge'}
                </Button>
              </form>

              {/* How SMS Betting Works */}
              <div className="mt-8 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3">How Enhanced SMS Betting Works:</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                    <p>Create SMS challenge</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                    <p>Friend receives SMS link</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                    <p>Bet accepted via text</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">4</div>
                    <p>Auto-settlement when game ends</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Active Challenges
                <Badge variant="secondary">{activeChallenges.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {challengesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : activeChallenges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active challenges</p>
                  <p className="text-sm">Create your first SMS challenge!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeChallenges.map((challenge) => (
                    <div key={challenge.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{challenge.event}</h3>
                          <p className="text-sm text-muted-foreground">vs {challenge.opponent}</p>
                          {challenge.method === 'sms' && (
                            <Badge variant="outline" className="mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              SMS Challenge
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">${challenge.amount}</div>
                          <Badge className={getStatusColor(challenge.status)}>
                            {challenge.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Pick: {challenge.pick}</span>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-muted-foreground">
                            Expires: {new Date(challenge.expiry).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {challenge.responseTime && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Response time: {challenge.responseTime} minutes
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Challenge History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedChallenges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No completed challenges yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {completedChallenges.map((challenge) => (
                    <div key={challenge.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{challenge.event}</h3>
                          <p className="text-sm text-muted-foreground">vs {challenge.opponent}</p>
                          <p className="text-sm">Pick: {challenge.pick}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">${challenge.amount}</div>
                          <Badge className={getStatusColor(challenge.status)}>
                            {challenge.status === 'auto-settled' ? 'Auto-Settled' : 'Completed'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedSMSBetting;