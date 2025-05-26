// Advanced AI Betting Insights for WeParlay Platform
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Lightbulb
} from 'lucide-react';

interface BettingInsight {
  id: string;
  type: 'prediction' | 'trend' | 'alert' | 'opportunity';
  confidence: number;
  title: string;
  description: string;
  recommendedAction?: string;
  potentialReturn?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export default function AiBettingInsights() {
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  // Fetch AI-generated betting insights
  const { data: insights, isLoading } = useQuery({
    queryKey: ['/api/ai/betting-insights'],
    refetchInterval: 60000, // Update every minute
    staleTime: 30000, // Consider fresh for 30 seconds
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <Brain className="h-5 w-5" />;
      case 'trend': return <TrendingUp className="h-5 w-5" />;
      case 'alert': return <AlertTriangle className="h-5 w-5" />;
      case 'opportunity': return <Target className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Betting Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const insightsData = insights || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Betting Insights
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            {insightsData.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insightsData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>AI is analyzing current betting markets...</p>
            <p className="text-sm">New insights will appear as data becomes available</p>
          </div>
        ) : (
          insightsData.map((insight: BettingInsight) => (
            <div
              key={insight.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedInsight === insight.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedInsight(
                selectedInsight === insight.id ? null : insight.id
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <Badge className={getRiskBadgeColor(insight.riskLevel)}>
                        {insight.riskLevel} risk
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {insight.description}
                    </p>
                    
                    {selectedInsight === insight.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        {insight.recommendedAction && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Recommended Action:
                            </p>
                            <p className="text-sm text-gray-600">
                              {insight.recommendedAction}
                            </p>
                          </div>
                        )}
                        
                        {insight.potentialReturn && (
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-green-600 font-medium">
                              Potential Return: +{insight.potentialReturn}%
                            </span>
                          </div>
                        )}
                        
                        <Button size="sm" className="mt-3">
                          <Target className="h-4 w-4 mr-2" />
                          Apply Insight
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Confidence</span>
                    <div className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${getConfidenceColor(insight.confidence)}`}></div>
                      <span className="text-xs font-medium">{insight.confidence}%</span>
                    </div>
                  </div>
                  
                  {insight.type === 'opportunity' && (
                    <Badge className="bg-green-100 text-green-800">
                      <Zap className="h-3 w-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Powered by WeParlay AI Engine</span>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Real-time Analysis</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}