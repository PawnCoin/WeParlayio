import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Zap, 
  Shield, 
  Brain, 
  Target, 
  Rocket, 
  Crown, 
  Star, 
  TrendingUp,
  BarChart3,
  Users,
  Lock,
  Sparkles,
  Timer,
  Globe
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const EnhancedFeatures: React.FC = () => {
  const { user } = useAuth();
  const [enabledFeatures, setEnabledFeatures] = useState({
    aiPredictions: true,
    advancedAnalytics: true,
    socialIntegration: true,
    autoOptimization: false,
    realTimeAlerts: true,
    premiumData: true
  });

  const toggleFeature = (feature: string) => {
    setEnabledFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const premiumFeatures = [
    {
      id: 'aiPredictions',
      title: 'AI-Powered Predictions',
      description: 'Advanced machine learning algorithms analyze thousands of data points',
      icon: <Brain className="h-6 w-6 text-purple-600" />,
      tier: 'VIP',
      accuracy: '94.2%',
      enabled: enabledFeatures.aiPredictions
    },
    {
      id: 'advancedAnalytics',
      title: 'Advanced Analytics Dashboard',
      description: 'Deep dive into betting patterns, ROI analysis, and performance metrics',
      icon: <BarChart3 className="h-6 w-6 text-blue-600" />,
      tier: 'PRO',
      accuracy: '99.8%',
      enabled: enabledFeatures.advancedAnalytics
    },
    {
      id: 'socialIntegration',
      title: 'Social Media Integration',
      description: 'Connect ESPN & Yahoo Fantasy, share wins, automated marketing tools',
      icon: <Users className="h-6 w-6 text-green-600" />,
      tier: 'PREMIUM',
      accuracy: '100%',
      enabled: enabledFeatures.socialIntegration
    },
    {
      id: 'autoOptimization',
      title: 'Auto Portfolio Optimization',
      description: 'Automatically optimize your betting portfolio based on risk tolerance',
      icon: <Target className="h-6 w-6 text-red-600" />,
      tier: 'VIP',
      accuracy: '87.5%',
      enabled: enabledFeatures.autoOptimization
    },
    {
      id: 'realTimeAlerts',
      title: 'Real-Time Market Alerts',
      description: 'Instant notifications for line movements, injury reports, and opportunities',
      icon: <Timer className="h-6 w-6 text-orange-600" />,
      tier: 'PREMIUM',
      accuracy: '98.1%',
      enabled: enabledFeatures.realTimeAlerts
    },
    {
      id: 'premiumData',
      title: 'Premium Data Sources',
      description: 'Access to exclusive data feeds from professional sports analytics providers',
      icon: <Shield className="h-6 w-6 text-indigo-600" />,
      tier: 'DIAMOND',
      accuracy: '99.9%',
      enabled: enabledFeatures.premiumData
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'VIP': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'PRO': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'PREMIUM': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'DIAMOND': return 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="h-8 w-8 text-amber-500" />
          <div>
            <h1 className="text-3xl font-bold">Enhanced Features</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Unlock the full potential of WeParlay with premium features
            </p>
          </div>
        </div>
        
        {user?.tier && (
          <div className="flex items-center gap-2 mb-6">
            <Crown className="h-5 w-5 text-yellow-500" />
            <Badge variant="secondary" className="font-semibold">
              {user.tier.toUpperCase()} Member - Premium Access Enabled
            </Badge>
          </div>
        )}
      </div>

      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="features">Premium Features</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          <TabsTrigger value="automation">Smart Automation</TabsTrigger>
          <TabsTrigger value="integrations">Platform Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-6">
            {premiumFeatures.map((feature) => (
              <Card key={feature.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {feature.icon}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                          <Badge className={getTierColor(feature.tier)}>
                            {feature.tier}
                          </Badge>
                        </div>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          {feature.accuracy}
                        </div>
                        <div className="text-xs text-gray-500">Accuracy</div>
                      </div>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={() => toggleFeature(feature.id)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" variant={feature.enabled ? "default" : "outline"}>
                      {feature.enabled ? "Configure" : "Enable Feature"}
                    </Button>
                    <Button size="sm" variant="ghost">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Win Rate</span>
                    <span className="font-bold text-green-600">73.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROI</span>
                    <span className="font-bold text-green-600">+18.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Bet Size</span>
                    <span className="font-bold">$47.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Profit</span>
                    <span className="font-bold text-green-600">$2,847.20</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Prediction Accuracy</span>
                    <span className="font-bold text-purple-600">94.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Value Bets Found</span>
                    <span className="font-bold text-blue-600">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Score</span>
                    <span className="font-bold text-yellow-600">Low</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Confidence</span>
                    <span className="font-bold text-green-600">High</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="font-semibold">AI Alert Triggered</div>
                    <div className="text-gray-600">Bills spread moved 3 points</div>
                    <div className="text-xs text-gray-500">2 minutes ago</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">Auto-Optimization</div>
                    <div className="text-gray-600">Portfolio rebalanced</div>
                    <div className="text-xs text-gray-500">1 hour ago</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">Social Share</div>
                    <div className="text-gray-600">Win streak posted to Twitter</div>
                    <div className="text-xs text-gray-500">3 hours ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Smart Automation Settings
              </CardTitle>
              <CardDescription>
                Configure automated features to optimize your betting experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Auto Portfolio Rebalancing</div>
                    <div className="text-sm text-gray-600">Automatically adjust bet sizes based on performance</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Smart Bet Sizing</div>
                    <div className="text-sm text-gray-600">AI-optimized bet amounts based on confidence levels</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Auto Cash-Out</div>
                    <div className="text-sm text-gray-600">Automatically cash out when profit targets are hit</div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Risk Management</div>
                    <div className="text-sm text-gray-600">Automatic stop-losses and daily limits</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Fantasy Sports Integration
                </CardTitle>
                <CardDescription>
                  Connect your fantasy accounts for personalized betting insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">ESPN</span>
                      </div>
                      <span>ESPN Fantasy</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">Y!</span>
                      </div>
                      <span>Yahoo Fantasy</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Connected
                    </Badge>
                  </div>
                </div>
                <Button className="w-full mt-4">
                  Manage Connections
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Social Media Integration
                </CardTitle>
                <CardDescription>
                  Share wins, create content, and grow your following
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">X</span>
                      </div>
                      <span>Twitter/X</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Connect
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">FB</span>
                      </div>
                      <span>Facebook</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Connect
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">IG</span>
                      </div>
                      <span>Instagram</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Connect
                    </Button>
                  </div>
                </div>
                <Button className="w-full mt-4">
                  Setup Auto-Sharing
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedFeatures;