import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Wallet, 
  CheckCircle, 
  Circle, 
  Star, 
  Trophy,
  Gift,
  Zap,
  Shield,
  ArrowRight,
  Play,
  Coins,
  Award,
  Target,
  Book
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  action: string;
  completed: boolean;
  reward: {
    type: 'tokens' | 'badge' | 'points';
    amount: number;
    name: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export default function WalletTutorial() {
  const { isConnected, connect, disconnect } = useWallet();
  const [currentStep, setCurrentStep] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [earnedReward, setEarnedReward] = useState<any>(null);
  const [tutorialProgress, setTutorialProgress] = useState(0);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'connect',
      title: 'Connect Your Wallet',
      description: 'Connect your Web3 wallet to start your WeParlay journey',
      action: 'Click Connect Wallet',
      completed: isConnected,
      reward: { type: 'tokens', amount: 100, name: 'Pawn Coins' },
      difficulty: 'easy'
    },
    {
      id: 'verify',
      title: 'Verify Wallet Address',
      description: 'Confirm your wallet address for security',
      action: 'Sign verification message',
      completed: false,
      reward: { type: 'points', amount: 50, name: 'Experience Points' },
      difficulty: 'easy'
    },
    {
      id: 'add-token',
      title: 'Add Pawn Coin Token',
      description: 'Add our custom ERC-20 token to your wallet',
      action: 'Add PC token (0x2Fe269292f74F0a98C5786088317B4f86313C211)',
      completed: false,
      reward: { type: 'tokens', amount: 250, name: 'Bonus Pawn Coins' },
      difficulty: 'medium'
    },
    {
      id: 'first-bet',
      title: 'Place Your First Bet',
      description: 'Make your first sports bet using Pawn Coins',
      action: 'Navigate to Sports Betting',
      completed: false,
      reward: { type: 'badge', amount: 1, name: 'First Timer Badge' },
      difficulty: 'medium'
    },
    {
      id: 'stake-tokens',
      title: 'Stake Pawn Coins',
      description: 'Stake your tokens to earn passive rewards',
      action: 'Stake minimum 500 PC tokens',
      completed: false,
      reward: { type: 'tokens', amount: 500, name: 'Staking Bonus' },
      difficulty: 'hard'
    }
  ];

  const achievements: Achievement[] = [
    {
      id: 'wallet-master',
      title: 'Wallet Master',
      description: 'Complete all wallet tutorial steps',
      icon: '🏆',
      progress: tutorialSteps.filter(s => s.completed).length,
      maxProgress: tutorialSteps.length
    },
    {
      id: 'quick-learner',
      title: 'Quick Learner',
      description: 'Complete tutorial in under 10 minutes',
      icon: '⚡',
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'crypto-native',
      title: 'Crypto Native',
      description: 'Connect 3 different wallet types',
      icon: '🌐',
      progress: 1,
      maxProgress: 3
    }
  ];

  useEffect(() => {
    const completedSteps = tutorialSteps.filter(step => step.completed).length;
    setTutorialProgress((completedSteps / tutorialSteps.length) * 100);
  }, [isConnected]);

  const handleStepComplete = (stepIndex: number) => {
    const step = tutorialSteps[stepIndex];
    if (!step.completed) {
      step.completed = true;
      setEarnedReward(step.reward);
      setShowRewardModal(true);
      setCurrentStep(Math.min(stepIndex + 1, tutorialSteps.length - 1));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'tokens': return <Coins className="h-4 w-4" />;
      case 'badge': return <Award className="h-4 w-4" />;
      case 'points': return <Star className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Gamified Wallet Connection Tutorial</h1>
          <p className="text-muted-foreground">Learn Web3 basics while earning rewards</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
          <Book className="h-4 w-4 mr-2" />
          Interactive Guide
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="h-5 w-5" />
                Tutorial Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall</span>
                  <span className="text-white">{Math.round(tutorialProgress)}%</span>
                </div>
                <Progress value={tutorialProgress} className="h-3" />
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Rewards Earned</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pawn Coins</span>
                    <span className="text-green-500 font-medium">+850 PC</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Experience</span>
                    <span className="text-blue-500 font-medium">+125 XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Badges</span>
                    <span className="text-purple-500 font-medium">3 Earned</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.maxProgress) * 100} 
                    className="h-2" 
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Tutorial Steps */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Wallet className="h-5 w-5" />
                Tutorial Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tutorialSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border transition-all ${
                    index === currentStep
                      ? 'border-blue-500 bg-blue-500/10'
                      : step.completed
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {step.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : index === currentStep ? (
                        <Play className="h-6 w-6 text-blue-500" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{step.title}</h3>
                        <Badge className={`${getDifficultyColor(step.difficulty)} text-white text-xs`}>
                          {step.difficulty}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          {getRewardIcon(step.reward.type)}
                          <span className="text-muted-foreground">
                            +{step.reward.amount} {step.reward.name}
                          </span>
                        </div>
                        
                        {!step.completed && index === currentStep && (
                          <Button
                            onClick={() => handleStepComplete(index)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {step.action}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Interactive Wallet Demo */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5" />
                Live Wallet Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                {!isConnected ? (
                  <div className="space-y-4">
                    <div className="p-6 border-2 border-dashed border-border rounded-lg">
                      <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Ready to Connect?</h3>
                      <p className="text-muted-foreground mb-4">
                        Connect your wallet to unlock Web3 features and start earning rewards
                      </p>
                      <Button 
                        onClick={connect}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect Wallet
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-green-500/10 border-2 border-green-500 rounded-lg">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Wallet Connected!</h3>
                      <p className="text-muted-foreground mb-4">
                        Great! Your wallet is now connected. You can proceed to the next step.
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button 
                          variant="outline"
                          onClick={disconnect}
                        >
                          Disconnect
                        </Button>
                        <Button 
                          onClick={() => handleStepComplete(0)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Continue Tutorial
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reward Modal */}
      <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-center text-white">Reward Earned!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="h-16 w-16 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            {earnedReward && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  You earned {earnedReward.amount} {earnedReward.name}!
                </h3>
                <p className="text-muted-foreground">
                  Keep completing tutorial steps to earn more rewards
                </p>
              </div>
            )}
            <Button 
              onClick={() => setShowRewardModal(false)}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}