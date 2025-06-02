import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Brain,
  Calculator,
  Target,
  Crown,
  Zap,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  Trophy
} from 'lucide-react';

interface BettingModel {
  id: string;
  name: string;
  description: string;
  accuracy: number;
  type: 'ai' | 'statistical' | 'consensus';
  status: 'active' | 'training' | 'disabled';
  predictions: number;
  roi: number;
}

interface VIPFeature {
  id: string;
  name: string;
  description: string;
  tier: 'diamond' | 'platinum' | 'gold';
  available: boolean;
  icon: string;
}

interface BettingStrategy {
  id: string;
  name: string;
  type: 'martingale' | 'kelly' | 'fibonacci' | 'custom';
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  minBankroll: number;
  expectedRoi: number;
}

export default function AdvancedBettingFeaturesHub() {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [betAmount, setBetAmount] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch AI betting models
  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['/api/betting/ai-models'],
    refetchInterval: 30000,
  });

  // Fetch VIP features
  const { data: vipFeatures } = useQuery({
    queryKey: ['/api/betting/vip-features'],
  });

  // Fetch betting strategies
  const { data: strategies } = useQuery({
    queryKey: ['/api/betting/strategies'],
  });

  // AI prediction mutation
  const aiPredictionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/betting/ai-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to get AI prediction');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "AI Prediction Generated",
        description: `Confidence: ${data.confidence}% - ${data.recommendation}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Prediction Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Strategy optimization mutation
  const optimizeStrategyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/betting/optimize-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to optimize strategy');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Strategy Optimized",
        description: `Expected ROI: ${data.expectedRoi}%`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Optimization Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mock data for AI models
  const mockModels: BettingModel[] = [
    {
      id: 'neural-odds',
      name: 'Neural Odds Predictor',
      description: 'Deep learning model trained on 10M+ betting outcomes',
      accuracy: 73.5,
      type: 'ai',
      status: 'active',
      predictions: 15420,
      roi: 12.8
    },
    {
      id: 'consensus-engine',
      name: 'Market Consensus Engine',
      description: 'Aggregates predictions from 50+ professional handicappers',
      accuracy: 68.2,
      type: 'consensus',
      status: 'active',
      predictions: 8930,
      roi: 9.4
    },
    {
      id: 'statistical-analyzer',
      name: 'Statistical Performance Analyzer',
      description: 'Advanced statistics and team performance metrics',
      accuracy: 71.1,
      type: 'statistical',
      status: 'active',
      predictions: 12650,
      roi: 11.2
    }
  ];

  // Mock VIP features
  const mockVipFeatures: VIPFeature[] = [
    {
      id: 'priority-odds',
      name: 'Priority Odds Access',
      description: 'Get odds 5 seconds before market moves',
      tier: 'diamond',
      available: true,
      icon: '⚡'
    },
    {
      id: 'ai-insider',
      name: 'AI Insider Reports',
      description: 'Detailed AI analysis with injury reports and insider info',
      tier: 'platinum',
      available: true,
      icon: '🧠'
    },
    {
      id: 'bankroll-protection',
      name: 'Smart Bankroll Protection',
      description: 'Automatic bet sizing based on Kelly Criterion',
      tier: 'gold',
      available: true,
      icon: '🛡️'
    }
  ];

  // Mock betting strategies
  const mockStrategies: BettingStrategy[] = [
    {
      id: 'kelly-criterion',
      name: 'Kelly Criterion',
      type: 'kelly',
      description: 'Mathematically optimal bet sizing for long-term growth',
      riskLevel: 'medium',
      minBankroll: 1000,
      expectedRoi: 15.2
    },
    {
      id: 'martingale-modified',
      name: 'Modified Martingale',
      type: 'martingale',
      description: 'Progressive betting with built-in stop-loss protection',
      riskLevel: 'high',
      minBankroll: 2500,
      expectedRoi: 22.8
    },
    {
      id: 'fibonacci-sequence',
      name: 'Fibonacci Progression',
      type: 'fibonacci',
      description: 'Lower risk progression system with steady returns',
      riskLevel: 'low',
      minBankroll: 500,
      expectedRoi: 8.5
    }
  ];

  const bettingModels = models || mockModels;
  const vipFeaturesData = vipFeatures || mockVipFeatures;
  const bettingStrategies = strategies || mockStrategies;

  const generateAIPrediction = (modelId: string) => {
    aiPredictionMutation.mutate({
      modelId,
      gameId: 'nfl-game-123',
      betAmount: parseFloat(betAmount) || 100
    });
  };

  const optimizeStrategy = (strategyId: string) => {
    optimizeStrategyMutation.mutate({
      strategyId,
      bankroll: 5000,
      riskTolerance: 'medium'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
          <Brain className="h-8 w-8 text-purple-500" />
          <span>Advanced Betting Features</span>
        </h1>
        <p className="text-gray-600">AI-powered predictions, VIP features, and professional betting strategies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Betting Models */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-500" />
                <span>AI Betting Models</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {modelsLoading ? (
                <div className="text-center py-8">Loading AI models...</div>
              ) : (
                <div className="space-y-4">
                  {bettingModels.map((model) => (
                    <div key={model.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{model.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>
                              {model.status}
                            </Badge>
                            <span className="text-green-600">
                              <TrendingUp className="h-4 w-4 inline mr-1" />
                              {model.accuracy}% accuracy
                            </span>
                            <span className="text-blue-600">
                              {model.roi}% ROI
                            </span>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => generateAIPrediction(model.id)}
                          disabled={aiPredictionMutation.isPending}
                          className="ml-4"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Get Prediction
                        </Button>
                      </div>
                      
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-xs text-gray-600 mb-1">Model Performance</div>
                        <div className="flex justify-between text-sm">
                          <span>Predictions Made: {model.predictions.toLocaleString()}</span>
                          <span className={`font-semibold ${model.roi > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                            {model.roi > 0 ? '+' : ''}{model.roi}% Total ROI
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Betting Strategies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-green-500" />
                <span>Professional Betting Strategies</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bettingStrategies.map((strategy) => (
                  <div key={strategy.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{strategy.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <Badge variant={
                            strategy.riskLevel === 'low' ? 'secondary' : 
                            strategy.riskLevel === 'medium' ? 'default' : 'destructive'
                          }>
                            {strategy.riskLevel} risk
                          </Badge>
                          <span className="text-gray-600">
                            Min: ${strategy.minBankroll}
                          </span>
                          <span className="text-green-600">
                            <Target className="h-4 w-4 inline mr-1" />
                            {strategy.expectedRoi}% Expected ROI
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => optimizeStrategy(strategy.id)}
                        disabled={optimizeStrategyMutation.isPending}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Optimize
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* VIP Features & Tools */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span>VIP Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vipFeaturesData.map((feature) => (
                  <div key={feature.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{feature.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{feature.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant={
                            feature.tier === 'diamond' ? 'default' :
                            feature.tier === 'platinum' ? 'secondary' : 'outline'
                          }>
                            {feature.tier}
                          </Badge>
                          {feature.available ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-purple-600" />
                  Upgrade Your Tier
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Unlock advanced betting features with higher tier memberships
                </p>
                <Button className="w-full">
                  <Crown className="h-4 w-4 mr-2" />
                  View Tier Benefits
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Bet Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-blue-500" />
                <span>Smart Bet Calculator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Bet Amount</Label>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="100"
                />
              </div>

              <div>
                <Label>Strategy</Label>
                <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {bettingStrategies.map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Optimal Bet
              </Button>

              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-600 mb-1">Recommended Bet Size</div>
                <div className="text-2xl font-bold text-green-600">
                  ${betAmount ? (parseFloat(betAmount) * 1.15).toFixed(2) : '0.00'}
                </div>
                <div className="text-xs text-gray-500">Based on Kelly Criterion</div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                <span>Your Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Win Rate</span>
                  <span className="font-semibold text-green-600">68.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total ROI</span>
                  <span className="font-semibold text-green-600">+24.7%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Bet Size</span>
                  <span className="font-semibold">$127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Best Streak</span>
                  <span className="font-semibold text-blue-600">12 wins</span>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Detailed Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}