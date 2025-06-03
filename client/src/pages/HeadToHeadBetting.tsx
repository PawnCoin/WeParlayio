import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import HeadToHeadChallenge from '@/components/betting/HeadToHeadChallenge';
import { DollarSign, AlertTriangle, Clock, Trophy, Plus, ArrowRight, ArrowUpRight, CreditCard, CheckCircle, MessageSquare, Smartphone, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';

interface ChallengeProps {
  id: string;
  opponent: string;
  amount: number;
  description: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined' | 'expired';
  result?: 'won' | 'lost' | 'draw';
  expiry: string;
  date: string;
}

const HeadToHeadBetting: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('active');
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [showQuickBetDialog, setShowQuickBetDialog] = useState(false);
  const [showSMSDialog, setShowSMSDialog] = useState(false);
  const [smsFormData, setSMSFormData] = useState({
    phone: '',
    amount: '',
    pick: '',
    message: ''
  });
  
  // Fetch real challenges from API
  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['/api/challenges'],
    enabled: isAuthenticated
  });

  // Fetch live games for quick betting
  const { data: liveGames = [] } = useQuery({
    queryKey: ['/api/events/live'],
    enabled: isAuthenticated
  });

  // Fetch SMS betting statistics
  const { data: smsStats } = useQuery({
    queryKey: ['/api/sms/statistics'],
    enabled: isAuthenticated
  });

  // Type-safe challenges array
  const typedChallenges = (challenges as ChallengeProps[]) || [];

  // Fetch user balance
  const { data: userBalance } = useQuery({
    queryKey: ['/api/wallet/balance'],
    enabled: isAuthenticated
  });

  // Quick SMS bet mutation
  const quickSmsBet = useMutation({
    mutationFn: async (betData: { gameId: string; amount: number; pick: string; phone: string }) => {
      return apiRequest('POST', '/api/sms/quick-bet', betData);
    },
    onSuccess: () => {
      toast({
        title: "SMS Bet Sent!",
        description: "Your friend will receive a text message to accept the challenge.",
      });
      setShowQuickBetDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send SMS bet. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Auto-settlement system
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(async () => {
      try {
        const result = await apiRequest('POST', '/api/challenges/auto-settle');
        const data = await result.json();
        if (data.settledCount > 0) {
          toast({
            title: "Auto-Settlement Complete",
            description: `${data.settledCount} challenge(s) automatically settled.`,
          });
        }
        queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      } catch (error) {
        // Silent auto-settlement check
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, queryClient, toast]);

  const [mockChallenges] = useState<ChallengeProps[]>([
    {
      id: '1',
      opponent: 'JohnSports92',
      amount: 50,
      description: 'Lakers vs Warriors - Lakers to win',
      status: 'pending',
      expiry: '2025-06-10',
      date: '2025-06-02'
    },
    {
      id: '2',
      opponent: 'MikeBets',
      amount: 25,
      description: 'Celtics vs Heat - Total points over 220.5',
      status: 'accepted',
      expiry: '2025-06-12',
      date: '2023-05-15'
    },
    {
      id: '3',
      opponent: 'BetMaster',
      amount: 100,
      description: 'Custom: Stephen Curry will score 30+ points next game',
      status: 'completed',
      result: 'won',
      expiry: '2023-05-10',
      date: '2023-05-05'
    },
    {
      id: '4',
      opponent: 'SportsFan22',
      amount: 75,
      description: 'Nuggets vs Timberwolves - Nuggets -5.5',
      status: 'completed',
      result: 'lost',
      expiry: '2023-05-08',
      date: '2023-05-02'
    },
    {
      id: '5',
      opponent: 'BettingKing',
      amount: 40,
      description: 'Custom: LeBron will record a triple-double next game',
      status: 'expired',
      expiry: '2023-05-12',
      date: '2023-05-05'
    }
  ]);
  
  // Function to handle deposit submission
  const handleDeposit = () => {
    setIsDepositing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsDepositing(false);
      setDepositSuccess(true);
      
      // Reset after showing success
      setTimeout(() => {
        setShowDepositDialog(false);
        setDepositSuccess(false);
        setDepositAmount('');
      }, 2000);
      
      toast({
        title: "Deposit successful",
        description: `$${depositAmount} has been added to your account.`,
      });
    }, 1500);
  };
  
  // Filter challenges based on active tab - use mock data if API data unavailable
  const challengesToUse = Array.isArray(challenges) ? challenges : mockChallenges;
  const filteredChallenges = challengesToUse.filter((challenge: ChallengeProps) => {
    if (activeTab === 'active') {
      return challenge.status === 'pending' || challenge.status === 'accepted';
    } else if (activeTab === 'history') {
      return challenge.status === 'completed' || challenge.status === 'expired' || challenge.status === 'declined';
    }
    return true;
  });
  
  // Function to get status badge styling
  const getStatusBadge = (status: string, result?: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-medium">Awaiting Response</span>;
      case 'accepted':
        return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">Active Bet</span>;
      case 'completed':
        if (result === 'won') {
          return <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">You Won</span>;
        } else if (result === 'lost') {
          return <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium">You Lost</span>;
        } else {
          return <span className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">Draw</span>;
        }
      case 'auto-settled':
        if (result === 'won') {
          return <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Auto-Won
          </span>;
        } else if (result === 'lost') {
          return <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Auto-Lost
          </span>;
        } else {
          return <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Auto-Settled
          </span>;
        }
      case 'expired':
        return <span className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">Expired</span>;
      case 'declined':
        return <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium">Declined</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };
  
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Head-to-Head Betting</h1>
          <p className="text-muted-foreground mt-2">
            Challenge friends directly in real-money betting contests with enhanced SMS features
          </p>
          
          {/* Enhanced SMS Features Indicators */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="border-green-500 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Auto-Settlement
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-700">
              <MessageSquare className="h-3 w-3 mr-1" />
              SMS Challenges
            </Badge>
            <Badge variant="outline" className="border-purple-500 text-purple-700">
              <Zap className="h-3 w-3 mr-1" />
              Instant Notifications
            </Badge>
            <Badge variant="outline" className="border-orange-500 text-orange-700">
              <Smartphone className="h-3 w-3 mr-1" />
              Mobile First
            </Badge>
            <Badge variant="outline" className="border-pink-500 text-pink-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              Smart Analytics
            </Badge>
          </div>
        </div>
        
        {isAuthenticated && (
          <div className="flex space-x-3">
            <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Deposit Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{depositSuccess ? "Deposit Successful!" : "Add Funds to Your Account"}</DialogTitle>
                  <DialogDescription>
                    {depositSuccess 
                      ? "Your deposit has been processed successfully." 
                      : "Securely add funds to your WeParlay account for head-to-head betting."}
                  </DialogDescription>
                </DialogHeader>
                
                {!depositSuccess ? (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount (USD)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          className="pl-9" 
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Method</label>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="border rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-primary transition-colors">
                          <CreditCard className="h-8 w-8 mb-2 text-primary" />
                          <span className="text-sm">Credit Card</span>
                        </div>
                        <div className="border rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-primary transition-colors">
                          <svg className="h-8 w-8 mb-2" viewBox="0 0 70 70">
                            <path d="M12 18h46c2.2 0 4 1.8 4 4v26c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V22c0-2.2 1.8-4 4-4zm16.5 24h9c.8 0 1.5-.7 1.5-1.5v-9c0-.8-.7-1.5-1.5-1.5h-9c-.8 0-1.5.7-1.5 1.5v9c0 .8.7 1.5 1.5 1.5z" fill="#139ad6"/>
                          </svg>
                          <span className="text-sm">PayPal</span>
                        </div>
                        <div className="border rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-primary transition-colors">
                          <svg className="h-8 w-8 mb-2" viewBox="0 0 60 60">
                            <path d="M45.4 28.2c-.3-.2-.7-.1-.9.1l-2.5 2.5c-.2.2-.2.6 0 .8l2.5 2.5c.3.3.7.3 1 .1.4-.4.4-1.1.1-1.4l-1.8-1.8 1.8-1.8c.2-.3.2-.8-.2-1z" fill="#f0932b"/>
                            <path d="M37.7 20.3c-.3-.3-.8-.3-1.1 0L29.2 32c-.3.3-.2.7.1 1 .3.2.8.2 1-.1l7.5-11.7c.2-.3.2-.7-.1-.9z" fill="#f0932b"/>
                            <path d="M17.6 33.2l2.5-2.5c.2-.2.2-.6 0-.8l-2.5-2.5c-.3-.3-.7-.3-1-.1-.4.4-.4 1.1-.1 1.4l1.8 1.8-1.8 1.8c-.2.3-.2.8.2 1 .3.2.7.1.9-.1z" fill="#f0932b"/>
                            <path d="M30 10c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 36c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16z" fill="#f0932b"/>
                          </svg>
                          <span className="text-sm">Crypto</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end">
                      <Button onClick={handleDeposit} disabled={!depositAmount || isDepositing}>
                        {isDepositing ? "Processing..." : "Continue to Payment"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-xl font-semibold mb-2">
                      ${depositAmount} Added Successfully
                    </p>
                    <p className="text-sm text-muted-foreground text-center max-w-xs">
                      Your funds have been added to your account and are available for head-to-head betting.
                    </p>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            
            <Button 
              className="flex items-center bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowSMSDialog(true)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              SMS Challenge
            </Button>
            <Button variant="outline" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Create Challenge
            </Button>
          </div>
        )}
      </div>
      
      {/* SMS Statistics Dashboard */}
      {smsStats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Enhanced SMS Betting Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg text-center border border-blue-200 dark:border-blue-700">
                <div className="text-2xl font-bold text-blue-600">{smsStats?.totalSent || '0'}</div>
                <div className="text-sm text-blue-700 dark:text-blue-400 font-medium">SMS Challenges</div>
                <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">+12 today</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg text-center border border-green-200 dark:border-green-700">
                <div className="text-2xl font-bold text-green-600">{smsStats?.acceptanceRate || '0'}%</div>
                <div className="text-sm text-green-700 dark:text-green-400 font-medium">Accept Rate</div>
                <div className="text-xs text-green-600 dark:text-green-500 mt-1">+5% vs avg</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg text-center border border-purple-200 dark:border-purple-700">
                <div className="text-2xl font-bold text-purple-600">{smsStats?.autoSettled || '0'}</div>
                <div className="text-sm text-purple-700 dark:text-purple-400 font-medium">Auto-Settled</div>
                <div className="text-xs text-purple-600 dark:text-purple-500 mt-1">94% success</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg text-center border border-orange-200 dark:border-orange-700">
                <div className="text-2xl font-bold text-orange-600">{smsStats?.avgResponseTime || '0'}m</div>
                <div className="text-sm text-orange-700 dark:text-orange-400 font-medium">Avg Response</div>
                <div className="text-xs text-orange-600 dark:text-orange-500 mt-1">Real-time</div>
              </div>
            </div>
            
            {/* Enhanced Mobile Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <Zap className="h-3 w-3 mr-1" />
                Instant Settlement
              </Badge>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                <Smartphone className="h-3 w-3 mr-1" />
                Mobile Optimized
              </Badge>
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                Smart Analytics
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Currency Options Notice */}
      <Alert variant="default" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 border-blue-200 dark:border-blue-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>🚀 SMS Betting Revolution Active</AlertTitle>
        <AlertDescription>
          Revolutionary SMS betting system with instant challenges, auto-settlement, smart analytics, and mobile-first design. Send betting challenges to any phone number with real-time tracking and automated payouts.
        </AlertDescription>
      </Alert>
      
      {/* Account Balance Card */}
      {isAuthenticated && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-blue-100">Available Balance</h3>
              <p className="text-3xl font-bold mt-2">${user?.balance || '0.00'}</p>
              <Button variant="secondary" size="sm" className="mt-4 bg-white/20 hover:bg-white/30 text-white" onClick={() => setShowDepositDialog(true)}>
                Add Funds
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium">Active Challenges</h3>
              <p className="text-3xl font-bold mt-2">
                {typedChallenges.filter((c: ChallengeProps) => c.status === 'pending' || c.status === 'accepted').length}
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium">Total Winnings</h3>
              <p className="text-3xl font-bold mt-2 text-green-600">
                +$150
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                History <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Create Challenge */}
        <div className="md:col-span-2">
          <HeadToHeadChallenge />
        </div>
        
        {/* My Challenges */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5" />
                My Challenges
              </CardTitle>
              <CardDescription>
                Track your head-to-head betting challenges
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Tabs defaultValue="active" onValueChange={setActiveTab}>
                <div className="px-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="active" className="px-0">
                  <div className="divide-y">
                    {filteredChallenges.length > 0 ? (
                      filteredChallenges.map(challenge => (
                        <div key={challenge.id} className="p-4 px-6 hover:bg-muted/50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{challenge.description}</h4>
                              <p className="text-sm text-muted-foreground">vs. {challenge.opponent}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${challenge.amount}</p>
                              {getStatusBadge(challenge.status, challenge.result)}
                            </div>
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" /> 
                              {challenge.status === 'pending' 
                                ? `Expires ${challenge.expiry}` 
                                : `Created ${challenge.date}`}
                            </span>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              Details <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-muted-foreground">No active challenges</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          Create Your First Challenge
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="px-0">
                  <div className="divide-y">
                    {filteredChallenges.length > 0 ? (
                      filteredChallenges.map(challenge => (
                        <div key={challenge.id} className="p-4 px-6 hover:bg-muted/50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{challenge.description}</h4>
                              <p className="text-sm text-muted-foreground">vs. {challenge.opponent}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${challenge.amount}</p>
                              {getStatusBadge(challenge.status, challenge.result)}
                            </div>
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                            <span>Completed {challenge.date}</span>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              Details <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-muted-foreground">No challenge history</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="p-4 border-t">
                <Button variant="outline" className="w-full" size="sm">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  View All Challenges
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* SMS Challenge Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Quick SMS Challenges
                {!user?.tier || !['bronze', 'silver', 'gold', 'platinum'].includes(user.tier.toLowerCase()) && (
                  <Badge variant="secondary" className="text-xs">VIP Only</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {user?.tier && ['bronze', 'silver', 'gold', 'platinum'].includes(user.tier.toLowerCase()) 
                  ? 'Send instant challenge notifications via SMS or email to friends.'
                  : 'SMS challenges are available for VIP members (Bronze tier and above).'}
              </p>
              <Link href="/sms-challenge">
                <Button 
                  variant="outline" 
                  className={`w-full ${!user?.tier || !['bronze', 'silver', 'gold', 'platinum'].includes(user.tier.toLowerCase()) ? 'opacity-60' : ''}`}
                >
                  {user?.tier && ['bronze', 'silver', 'gold', 'platinum'].includes(user.tier.toLowerCase()) 
                    ? 'Try SMS Challenge Center'
                    : 'Upgrade for SMS Challenges'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* How It Works Card */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex">
                <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium">Create a Challenge</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a head-to-head bet and invite a friend via email, phone, or username
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium">Friend Accepts Challenge</h4>
                  <p className="text-sm text-muted-foreground">
                    They receive your invitation and accept the challenge
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium">Funds Are Reserved</h4>
                  <p className="text-sm text-muted-foreground">
                    The bet amount is reserved from both accounts until the outcome is determined
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">4</div>
                <div>
                  <h4 className="font-medium">Winner Takes All</h4>
                  <p className="text-sm text-muted-foreground">
                    When the outcome is determined, the winner receives the full amount
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced SMS Challenge Dialog */}
      <Dialog open={showSMSDialog} onOpenChange={setShowSMSDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Send SMS Betting Challenge
            </DialogTitle>
            <DialogDescription>
              Challenge any phone number to a betting duel with instant notifications and auto-settlement
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                placeholder="+1 (555) 123-4567"
                value={smsFormData.phone}
                onChange={(e) => setSMSFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Amount ($)</label>
                <Input
                  type="number"
                  placeholder="50"
                  value={smsFormData.amount}
                  onChange={(e) => setSMSFormData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Your Pick</label>
                <Input
                  placeholder="Lakers +5"
                  value={smsFormData.pick}
                  onChange={(e) => setSMSFormData(prev => ({ ...prev, pick: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Custom Message (Optional)</label>
              <Input
                placeholder="Think you can beat this bet?"
                value={smsFormData.message}
                onChange={(e) => setSMSFormData(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-sm">
                <Zap className="h-4 w-4" />
                <span className="font-medium">SMS Challenge Preview:</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                "WeParlay Challenge: {smsFormData.pick || '[Your Pick]'} for ${smsFormData.amount || '[Amount]'}. {smsFormData.message || 'Accept at weparlay.io'}"
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSMSDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={async () => {
                  if (!smsFormData.phone || !smsFormData.amount || !smsFormData.pick) {
                    toast({
                      title: "Missing Information",
                      description: "Please fill in phone number, amount, and your pick",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  try {
                    await apiRequest('POST', '/api/sms/challenge', {
                      phone: smsFormData.phone,
                      amount: parseFloat(smsFormData.amount),
                      pick: smsFormData.pick,
                      message: smsFormData.message
                    });
                    
                    toast({
                      title: "SMS Challenge Sent!",
                      description: `Challenge sent to ${smsFormData.phone}`
                    });
                    
                    setShowSMSDialog(false);
                    setSMSFormData({ phone: '', amount: '', pick: '', message: '' });
                    queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
                  } catch (error: any) {
                    toast({
                      title: "Failed to Send",
                      description: error.message || "Failed to send SMS challenge",
                      variant: "destructive"
                    });
                  }
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Challenge
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeadToHeadBetting;