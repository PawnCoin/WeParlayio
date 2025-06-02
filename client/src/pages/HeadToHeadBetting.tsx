import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import HeadToHeadChallenge from '@/components/betting/HeadToHeadChallenge';
import VipSmsChallenge from '@/components/VipSmsChallenge';
import { DollarSign, AlertTriangle, Clock, Trophy, Plus, ArrowRight, ArrowUpRight, CreditCard, CheckCircle, MessageSquare, Crown } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('active');
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  
  const [challenges, setChallenges] = useState<ChallengeProps[]>([
    {
      id: '1',
      opponent: 'JohnSports92',
      amount: 50,
      description: 'Lakers vs Warriors - Lakers to win',
      status: 'pending',
      expiry: '2023-05-20',
      date: '2023-05-16'
    },
    {
      id: '2',
      opponent: 'MikeBets',
      amount: 25,
      description: 'Celtics vs Heat - Total points over 220.5',
      status: 'accepted',
      expiry: '2023-05-22',
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
  
  // Filter challenges based on active tab
  const filteredChallenges = challenges.filter(challenge => {
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
            Challenge friends directly in real-money betting contests
          </p>
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
            
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Create Challenge
            </Button>
          </div>
        )}
      </div>
      
      {/* Currency Options Notice */}
      <Alert variant="default" className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 border-blue-200 dark:border-blue-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Currency Options Available</AlertTitle>
        <AlertDescription>
          Head-to-head challenges now support both real money and WeParlay Cash. Choose your preferred currency when creating a challenge.
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
                {challenges.filter(c => c.status === 'pending' || c.status === 'accepted').length}
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
          {/* Check if user has VIP access for SMS challenges */}
          {user?.tier && ['bronze', 'silver', 'gold', 'platinum'].includes(user.tier.toLowerCase()) ? (
            <div className="space-y-6">
              {/* VIP SMS Challenge Section */}
              <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    VIP Challenge Center
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      {user.tier.toUpperCase()}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Send instant SMS and email challenges to friends with your VIP access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VipSmsChallenge />
                </CardContent>
              </Card>
              
              {/* Regular Challenge Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Standard Challenges</CardTitle>
                  <CardDescription>
                    Create regular head-to-head challenges via email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HeadToHeadChallenge />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Regular Challenge for Non-VIP */}
              <HeadToHeadChallenge />
              
              {/* VIP Upgrade Notice */}
              <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    Unlock VIP Challenge Features
                  </CardTitle>
                  <CardDescription>
                    Upgrade to Bronze tier or higher for instant SMS challenges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Instant SMS notifications to friends</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Priority challenge processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">VIP betting limits and bonuses</span>
                    </div>
                    <Button variant="default" className="w-full mt-4">
                      Upgrade to VIP
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
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
    </div>
  );
};

export default HeadToHeadBetting;