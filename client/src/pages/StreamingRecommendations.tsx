import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, TrendingUp, Star, Clock, Filter, Zap, Target, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface StreamingRecommendation {
  id: string;
  title: string;
  description: string;
  sport: string;
  league: string;
  confidence: number;
  expectedValue: string;
  timeToStart: string;
  aiReasoning: string;
  streamingChannel: string;
  priority: 'high' | 'medium' | 'low';
  category: 'trending' | 'value' | 'upset' | 'safe';
}

const StreamingRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<StreamingRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchRecommendations();
  }, [selectedSport, selectedCategory]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      // Mock AI-powered recommendations for development
      const mockRecommendations: StreamingRecommendation[] = [
        {
          id: 'rec_001',
          title: 'Bills vs Chiefs - Over 54.5 Points',
          description: 'High-scoring potential based on weather conditions and offensive trends',
          sport: 'nfl',
          league: 'NFL',
          confidence: 89,
          expectedValue: '+12.8%',
          timeToStart: '2h 15m',
          aiReasoning: 'Both teams averaging 28+ PPG, dome conditions, key defensive injuries',
          streamingChannel: 'ESPN (Channel 142)',
          priority: 'high',
          category: 'value'
        },
        {
          id: 'rec_002',
          title: 'Lakers ML vs Warriors',
          description: 'Home court advantage with key player returning from injury',
          sport: 'nba',
          league: 'NBA',
          confidence: 76,
          expectedValue: '+8.2%',
          timeToStart: '4h 45m',
          aiReasoning: 'LeBron James probable to return, Warriors 1-4 on back-to-backs',
          streamingChannel: 'TNT (Channel 245)',
          priority: 'medium',
          category: 'trending'
        },
        {
          id: 'rec_003',
          title: 'Rangers vs Capitals - Under 6.5 Goals',
          description: 'Strong goaltending matchup in crucial divisional game',
          sport: 'nhl',
          league: 'NHL',
          confidence: 82,
          expectedValue: '+15.1%',
          timeToStart: '6h 30m',
          aiReasoning: 'Both goalies sub-2.20 GAA last 10 games, low-scoring recent H2H',
          streamingChannel: 'MSG (Channel 634)',
          priority: 'high',
          category: 'safe'
        },
        {
          id: 'rec_004',
          title: 'Real Madrid vs Barcelona - Draw No Bet',
          description: 'El Clasico upset potential with defensive focus',
          sport: 'soccer',
          league: 'La Liga',
          confidence: 71,
          expectedValue: '+22.4%',
          timeToStart: '1d 2h',
          aiReasoning: 'Madrid missing 3 key attackers, Barca defensive improvements',
          streamingChannel: 'ESPN+ (Channel 789)',
          priority: 'medium',
          category: 'upset'
        }
      ];

      setTimeout(() => {
        let filtered = mockRecommendations;
        
        if (selectedSport !== 'all') {
          filtered = filtered.filter(rec => rec.sport === selectedSport);
        }
        
        if (selectedCategory !== 'all') {
          filtered = filtered.filter(rec => rec.category === selectedCategory);
        }
        
        setRecommendations(filtered);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching streaming recommendations:', error);
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Target className="h-4 w-4 text-red-500" />;
      case 'medium': return <BarChart3 className="h-4 w-4 text-yellow-500" />;
      case 'low': return <TrendingUp className="h-4 w-4 text-green-500" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'value': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'upset': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'safe': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">AI Stream Intelligence</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Smart recommendations powered by advanced analytics and machine learning
            </p>
          </div>
        </div>
        
        {user?.tier && (
          <Badge variant="secondary" className="mb-4">
            {user.tier.toUpperCase()} Member - Premium AI Insights
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={selectedSport} onValueChange={setSelectedSport}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            <SelectItem value="nfl">NFL</SelectItem>
            <SelectItem value="nba">NBA</SelectItem>
            <SelectItem value="nhl">NHL</SelectItem>
            <SelectItem value="soccer">Soccer</SelectItem>
            <SelectItem value="mlb">MLB</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="value">Value Bets</SelectItem>
            <SelectItem value="upset">Upset Alerts</SelectItem>
            <SelectItem value="safe">Safe Picks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Stream Analytics</TabsTrigger>
          <TabsTrigger value="insights">Market Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6">
              {recommendations.map((rec) => (
                <Card key={rec.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getPriorityIcon(rec.priority)}
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                          <Badge className={getCategoryColor(rec.category)}>
                            {rec.category}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {rec.description}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {rec.expectedValue}
                        </div>
                        <div className="text-sm text-gray-500">Expected Value</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{rec.timeToStart}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{rec.confidence}% confidence</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{rec.streamingChannel}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                      <h4 className="font-semibold text-sm mb-1">AI Analysis:</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {rec.aiReasoning}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        Add to Bet Slip
                      </Button>
                      <Button variant="outline" size="sm">
                        View Stream
                      </Button>
                      <Button variant="ghost" size="sm">
                        More Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Stream Performance Analytics
              </CardTitle>
              <CardDescription>
                Real-time analysis of streaming viewership and betting correlation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">2.4M</div>
                  <div className="text-sm text-gray-600">Active Viewers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+18%</div>
                  <div className="text-sm text-gray-600">Betting Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">94.2%</div>
                  <div className="text-sm text-gray-600">AI Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">156</div>
                  <div className="text-sm text-gray-600">Live Channels</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Intelligence
              </CardTitle>
              <CardDescription>
                Advanced market trends and betting intelligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    Trending Markets
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    NFL Over/Under bets seeing 34% increase in volume today. Prime time games showing strong public backing on favorites.
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                    Value Opportunities
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Contrarian betting opportunities in NBA with 76% public on popular teams. Historical data suggests fade opportunities.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                    AI Predictions
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    Machine learning models show 89% accuracy on tonight's recommendations. Weather and injury data heavily weighted.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StreamingRecommendations;