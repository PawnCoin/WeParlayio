import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  Target, 
  TrendingUp, 
  Zap,
  Activity,
  BarChart3,
  Crown,
  Shield
} from "lucide-react";
import LiveInGameBetting from "@/components/betting/LiveInGameBetting";
import AdvancedParlayBuilder from "@/components/betting/AdvancedParlayBuilder";
import ArbitrageDetector from "@/components/betting/ArbitrageDetector";
import BettingAnalyticsDashboard from "@/components/betting/BettingAnalyticsDashboard";

export default function ProfessionalBetting() {
  const [activeTab, setActiveTab] = useState("live");

  const features = [
    {
      id: "live",
      title: "Live In-Game Betting",
      description: "Real-time odds updates during games with prop bets and momentum tracking",
      icon: Activity,
      color: "text-red-500",
      badge: "LIVE"
    },
    {
      id: "parlay",
      title: "Advanced Parlay Builder",
      description: "Multi-leg betting with correlation analysis and risk assessment",
      icon: Calculator,
      color: "text-blue-500",
      badge: "PRO"
    },
    {
      id: "arbitrage",
      title: "Arbitrage Detection",
      description: "Real-time odds comparison across multiple sportsbooks for guaranteed profits",
      icon: Target,
      color: "text-green-500",
      badge: "ELITE"
    },
    {
      id: "analytics",
      title: "Performance Analytics",
      description: "Comprehensive betting analytics with ROI tracking and Kelly criterion",
      icon: BarChart3,
      color: "text-purple-500",
      badge: "INSIGHTS"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold">Professional Betting Suite</h1>
            <Shield className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced tools and analytics designed for professional bettors who demand precision, 
            real-time data, and sophisticated risk management capabilities.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
              Elite Tier Access
            </Badge>
            <Badge variant="secondary">Professional Tools</Badge>
            <Badge variant="outline">Real-Time Data</Badge>
          </div>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card 
              key={feature.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                activeTab === feature.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setActiveTab(feature.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Professional Tools Interface */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-yellow-500" />
                <div>
                  <CardTitle className="text-2xl">Professional Trading Interface</CardTitle>
                  <p className="text-muted-foreground">
                    Advanced betting tools with institutional-grade analytics
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-gradient-to-r from-green-500 to-blue-500">
                Live Market Data
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="live" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Live Betting
                </TabsTrigger>
                <TabsTrigger value="parlay" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Parlay Builder
                </TabsTrigger>
                <TabsTrigger value="arbitrage" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Arbitrage
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="mt-6">
                <LiveInGameBetting />
              </TabsContent>

              <TabsContent value="parlay" className="mt-6">
                <AdvancedParlayBuilder />
              </TabsContent>

              <TabsContent value="arbitrage" className="mt-6">
                <ArbitrageDetector />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <BettingAnalyticsDashboard />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Professional Features Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Real-Time Advantages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Live odds updates every 2 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">In-game momentum tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Multi-sportsbook comparison</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Arbitrage opportunity alerts</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-500" />
                Advanced Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">Kelly criterion calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">ROI performance tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">Correlation risk analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">Betting pattern insights</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                Risk Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-sm">Bankroll optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-sm">Streak monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-sm">Variance analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-sm">Professional recommendations</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Ready to Trade Like a Professional?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Access real-time market data, advanced analytics, and professional-grade 
                tools that give you the edge in sports betting markets.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Crown className="h-5 w-5 mr-2" />
                Upgrade to Elite
              </Button>
              <Button variant="outline" size="lg">
                View Pricing
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Real-time data feeds
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Professional analytics
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                Arbitrage detection
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}