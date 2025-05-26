import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Brain, 
  Target, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OddsPrediction {
  eventId: string;
  predictedOdds: {
    home: number;
    away: number;
    total?: number;
  };
  confidence: number;
  movementDirection: 'up' | 'down' | 'stable';
  factors: string[];
  recommendation: 'buy' | 'sell' | 'hold';
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface MarketInsights {
  sport: string;
  momentum: number;
  volatility: number;
  volume: number;
  marketDirection: 'bullish' | 'bearish' | 'neutral';
  recommendations: string[];
}

interface OddsPredictionWidgetProps {
  eventId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  currentOdds: {
    home: number;
    away: number;
    total?: number;
  };
}

export default function OddsPredictionWidget({
  eventId,
  sport,
  homeTeam,
  awayTeam,
  currentOdds
}: OddsPredictionWidgetProps) {
  const [prediction, setPrediction] = useState<OddsPrediction | null>(null);
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/odds/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          sport,
          homeTeam,
          awayTeam,
          currentOdds
        })
      });

      const data = await response.json();
      if (data.success) {
        setPrediction(data.prediction);
        setLastUpdated(new Date());
        
        toast({
          title: "Prediction Updated",
          description: `New odds prediction generated with ${Math.round(data.prediction.confidence * 100)}% confidence`,
        });
      }
    } catch (error) {
      toast({
        title: "Prediction Failed",
        description: "Unable to generate odds prediction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await fetch(`/api/odds/insights/${sport}`);
      const data = await response.json();
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch market insights:', error);
    }
  };

  useEffect(() => {
    fetchPrediction();
    fetchInsights();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => {
      fetchPrediction();
      fetchInsights();
    }, 120000);

    return () => clearInterval(interval);
  }, [eventId, sport]);

  const getMovementIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'sell':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatFactor = (factor: string) => {
    return factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-4">
      {/* Main Prediction Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Real-time Odds Prediction
            <Badge variant="outline" className="ml-auto">
              <Zap className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              <span className="ml-3 text-sm text-muted-foreground">Analyzing market data...</span>
            </div>
          ) : prediction ? (
            <>
              {/* Current vs Predicted Odds */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Current Odds</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">{homeTeam}</span>
                      <span className="font-mono">{currentOdds.home > 0 ? '+' : ''}{currentOdds.home}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{awayTeam}</span>
                      <span className="font-mono">{currentOdds.away > 0 ? '+' : ''}{currentOdds.away}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1">
                    Predicted Odds
                    {getMovementIcon(prediction.movementDirection)}
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">{homeTeam}</span>
                      <span className="font-mono font-semibold text-primary">
                        {prediction.predictedOdds.home > 0 ? '+' : ''}{prediction.predictedOdds.home}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{awayTeam}</span>
                      <span className="font-mono font-semibold text-primary">
                        {prediction.predictedOdds.away > 0 ? '+' : ''}{prediction.predictedOdds.away}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confidence & Recommendation */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(prediction.confidence * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Confidence</div>
                  <Progress value={prediction.confidence * 100} className="mt-2 h-2" />
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Badge className={getRecommendationColor(prediction.recommendation)}>
                    {prediction.recommendation.toUpperCase()}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">Recommendation</div>
                </div>
                
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className={`text-sm font-medium ${getRiskLevelColor(prediction.riskLevel)}`}>
                    {prediction.riskLevel.toUpperCase()}
                  </div>
                  <div className="text-xs text-muted-foreground">Risk Level</div>
                </div>
              </div>

              {/* Key Factors */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Key Factors
                </h4>
                <div className="flex flex-wrap gap-1">
                  {prediction.factors.map((factor, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {formatFactor(factor)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Timeframe */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Timeframe: {prediction.timeframe}
                </div>
                {lastUpdated && (
                  <div>Updated: {lastUpdated.toLocaleTimeString()}</div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Click to generate odds prediction</p>
            </div>
          )}

          <Button 
            onClick={fetchPrediction} 
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? 'Analyzing...' : 'Refresh Prediction'}
          </Button>
        </CardContent>
      </Card>

      {/* Market Insights Card */}
      {insights && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Market Insights - {sport.toUpperCase()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Market Direction</span>
                  <Badge variant={
                    insights.marketDirection === 'bullish' ? 'default' : 
                    insights.marketDirection === 'bearish' ? 'destructive' : 'secondary'
                  }>
                    {insights.marketDirection}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Momentum</span>
                  <span className="font-mono text-sm">
                    {insights.momentum > 0 ? '+' : ''}{insights.momentum.toFixed(3)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volatility</span>
                  <span className="font-mono text-sm">{(insights.volatility * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volume</span>
                  <span className="font-mono text-sm">{Math.round(insights.volume).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {insights.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Market Recommendations</h4>
                <div className="space-y-1">
                  {insights.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}