import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Brain, Tv, Zap, TrendingUp, Users, CheckCircle } from 'lucide-react';
import AIBetRecommendations from '@/components/betting/AIBetRecommendations';
import AdvancedLiveStreaming from '@/components/streaming/AdvancedLiveStreaming';

// Enhanced SMS Betting Component
const EnhancedSMSBetting: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Instant SMS Challenges",
      description: "Send betting challenges directly via SMS to friends",
      benefits: ["Real-time notifications", "No app required for friends", "Higher acceptance rates"]
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Auto-Settlement System",
      description: "Automatic bet settlement when games conclude",
      benefits: ["Instant payouts", "No manual intervention", "Reduced disputes"]
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "SMS Analytics",
      description: "Track performance and engagement metrics",
      benefits: ["Response time tracking", "Acceptance rate analytics", "User engagement insights"]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Enhanced SMS Betting System</h2>
        <p className="text-lg text-muted-foreground">
          Revolutionary Head-to-Head SMS betting with auto-settlement capabilities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center">
            <CardHeader>
              <div className="mx-auto text-primary mb-4">
                {feature.icon}
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            How Enhanced SMS Betting Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h4 className="font-semibold mb-2">Create Challenge</h4>
              <p className="text-sm text-muted-foreground">
                Select a live game and create your betting challenge
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h4 className="font-semibold mb-2">Send SMS</h4>
              <p className="text-sm text-muted-foreground">
                Challenge is sent via SMS to your friend's phone
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h4 className="font-semibold mb-2">Accept & Bet</h4>
              <p className="text-sm text-muted-foreground">
                Friend accepts via text link and bet is locked in
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <h4 className="font-semibold mb-2">Auto-Settle</h4>
              <p className="text-sm text-muted-foreground">
                Game ends, winner determined, payout processed automatically
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isAuthenticated && (
        <Card className="border-2 border-primary">
          <CardContent className="text-center p-6">
            <h3 className="text-xl font-semibold mb-2">Ready to Start SMS Betting?</h3>
            <p className="text-muted-foreground mb-4">
              Join WeParlay to experience the future of social betting
            </p>
            <a href="/api/login" className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Get Started Now
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const EnhancedFeatures: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Enhanced WeParlay Features</h1>
        <p className="text-xl text-muted-foreground">
          Experience the next generation of social sports betting
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Badge variant="secondary" className="px-4 py-2">
            <MessageSquare className="h-4 w-4 mr-2" />
            Enhanced SMS Betting
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Brain className="h-4 w-4 mr-2" />
            AI Recommendations
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Tv className="h-4 w-4 mr-2" />
            Live Streaming
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="sms" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Enhanced SMS Betting
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="streaming" className="flex items-center gap-2">
            <Tv className="h-4 w-4" />
            Live Streaming
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sms" className="mt-8">
          <EnhancedSMSBetting />
        </TabsContent>

        <TabsContent value="ai" className="mt-8">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">AI-Powered Bet Recommendations</h2>
              <p className="text-lg text-muted-foreground">
                Machine learning algorithms analyze data to provide winning bet suggestions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto text-primary mb-4">
                    <Brain className="h-8 w-8" />
                  </div>
                  <CardTitle>Advanced Analytics</CardTitle>
                  <CardDescription>
                    AI processes thousands of data points for each recommendation
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto text-primary mb-4">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <CardTitle>High Success Rate</CardTitle>
                  <CardDescription>
                    74% average success rate with detailed confidence scoring
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto text-primary mb-4">
                    <Zap className="h-8 w-8" />
                  </div>
                  <CardTitle>Real-time Updates</CardTitle>
                  <CardDescription>
                    Recommendations update live based on changing game conditions
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <AIBetRecommendations />
          </div>
        </TabsContent>

        <TabsContent value="streaming" className="mt-8">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Advanced Live Streaming Integration</h2>
              <p className="text-lg text-muted-foreground">
                Watch live sports with integrated betting and social features
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto text-primary mb-4">
                    <Tv className="h-8 w-8" />
                  </div>
                  <CardTitle>Multi-Source Streaming</CardTitle>
                  <CardDescription>
                    Multiple stream sources ensure uninterrupted viewing
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto text-primary mb-4">
                    <Users className="h-8 w-8" />
                  </div>
                  <CardTitle>Live Chat</CardTitle>
                  <CardDescription>
                    Engage with other viewers in real-time chat
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto text-primary mb-4">
                    <Zap className="h-8 w-8" />
                  </div>
                  <CardTitle>Integrated Betting</CardTitle>
                  <CardDescription>
                    Place bets directly while watching without leaving the stream
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <AdvancedLiveStreaming />
          </div>
        </TabsContent>
      </Tabs>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>
            See how WeParlay's enhanced features compare to traditional betting platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Feature</th>
                  <th className="text-center p-4">Traditional Platforms</th>
                  <th className="text-center p-4">WeParlay Enhanced</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium">SMS Betting</td>
                  <td className="p-4 text-center text-red-500">✗</td>
                  <td className="p-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Auto-Settlement</td>
                  <td className="p-4 text-center text-red-500">✗</td>
                  <td className="p-4 text-center text-green-500">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">AI Recommendations</td>
                  <td className="p-4 text-center text-yellow-500">Basic</td>
                  <td className="p-4 text-center text-green-500">Advanced ML</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Live Streaming</td>
                  <td className="p-4 text-center text-yellow-500">Limited</td>
                  <td className="p-4 text-center text-green-500">Multi-Source</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Social Features</td>
                  <td className="p-4 text-center text-yellow-500">Basic</td>
                  <td className="p-4 text-center text-green-500">Comprehensive</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedFeatures;