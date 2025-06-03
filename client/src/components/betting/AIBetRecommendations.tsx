import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Brain, TrendingUp, Target, Zap, AlertTriangle, CheckCircle, Star, BarChart3 } from 'lucide-react';

interface AIRecommendation {
  id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  recommendedPick: string;
  confidence: number;
  expectedValue: number;
  reasoning: string[];
  riskLevel: 'low' | 'medium' | 'high';
  suggestedAmount: number;
  odds: number;
  gameTime: string;
  keyFactors: string[];
  historicalAccuracy: number;
}

interface AIAnalytics {
  totalRecommendations: number;
  successRate: number;
  avgROI: number;
  bestSport: string;
  confidenceDistribution: { low: number; medium: number; high: number };
}

const AIBetRecommendations: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null);

  // Fetch AI recommendations
  const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery({
    queryKey: ['/api/ai/recommendations'],
    enabled: isAuthenticated,
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch AI analytics
  const { data: analytics } = useQuery({
    queryKey: ['/api/ai/analytics'],
    enabled: isAuthenticated,
  });

  // Place AI-recommended bet
  const placeBet = useMutation({
    mutationFn: async (recommendation: AIRecommendation) => {
      return apiRequest('POST', '/api/bets/place-ai-recommendation', {
        recommendationId: recommendation.id,
        gameId: recommendation.gameId,
        pick: recommendation.recommendedPick,
        amount: recommendation.suggestedAmount,
        odds: recommendation.odds,
      });
    },
    onSuccess: () => {
      toast({
        title: "AI Bet Placed!",
        description: "Your AI-recommended bet has been placed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/analytics'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'high': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Bet Recommendations
          </CardTitle>
          <CardDescription>
            Please log in to access AI-powered betting recommendations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Analytics Overview */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              AI Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{analytics.successRate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">+{analytics.avgROI}%</div>
                <div className="text-sm text-muted-foreground">Avg ROI</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{analytics.totalRecommendations}</div>
                <div className="text-sm text-muted-foreground">Total Recommendations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{analytics.bestSport}</div>
                <div className="text-sm text-muted-foreground">Best Sport</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Bet Recommendations
            <Badge variant="secondary" className="ml-2">
              {recommendations.length} Active
            </Badge>
          </CardTitle>
          <CardDescription>
            AI-powered betting recommendations based on advanced analytics and machine learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendationsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No AI recommendations available at the moment.</p>
              <p className="text-sm">Check back soon for new opportunities!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec: AIRecommendation) => (
                <Card key={rec.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{rec.sport}</Badge>
                          <Badge className={getRiskBadgeColor(rec.riskLevel)}>
                            {rec.riskLevel.toUpperCase()} RISK
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{rec.historicalAccuracy}% accuracy</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg">
                          {rec.homeTeam} vs {rec.awayTeam}
                        </h3>
                        <p className="text-sm text-muted-foreground">{rec.gameTime}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getConfidenceColor(rec.confidence)}`}>
                          {rec.confidence}%
                        </div>
                        <div className="text-sm text-muted-foreground">Confidence</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm font-medium mb-1">Recommended Pick</div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-500" />
                          <span className="font-semibold">{rec.recommendedPick}</span>
                          <Badge variant="outline">@{rec.odds}</Badge>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Suggested Amount</div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">${rec.suggestedAmount}</span>
                          <span className="text-sm text-green-500">
                            +{rec.expectedValue}% EV
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">AI Reasoning</div>
                      <ul className="space-y-1">
                        {rec.reasoning.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Key Factors</div>
                      <div className="flex flex-wrap gap-1">
                        {rec.keyFactors.map((factor, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => placeBet.mutate(rec)}
                        disabled={placeBet.isPending}
                        className="flex-1"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Place AI Bet
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedRecommendation(rec)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confidence Distribution */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Confidence Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">High Confidence (80%+)</span>
                <span className="text-sm font-medium">{analytics.confidenceDistribution.high}%</span>
              </div>
              <Progress value={analytics.confidenceDistribution.high} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Medium Confidence (60-79%)</span>
                <span className="text-sm font-medium">{analytics.confidenceDistribution.medium}%</span>
              </div>
              <Progress value={analytics.confidenceDistribution.medium} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Low Confidence (Below 60%)</span>
                <span className="text-sm font-medium">{analytics.confidenceDistribution.low}%</span>
              </div>
              <Progress value={analytics.confidenceDistribution.low} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIBetRecommendations;