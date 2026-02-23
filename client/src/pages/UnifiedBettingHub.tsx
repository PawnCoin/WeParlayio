import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, TrendingUp, BarChart3, Zap, Target, Calculator } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Import existing betting components (temporarily disabled problematic ones)
// import ArbitrageDetector from "@/components/betting/ArbitrageDetector";
// import BettingAnalyticsDashboard from "@/components/betting/BettingAnalyticsDashboard";
// import AdvancedParlayBuilder from "@/components/betting/AdvancedParlayBuilder";

// Simplified Live Betting Component
function SimpleLiveBetting() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Live In-Game Betting
          <Badge variant="outline">2 Live Games</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chiefs vs Bills */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">LIVE</Badge>
                <span className="text-sm">Q2 - 8:42</span>
              </div>
              <div className="text-sm font-mono">Chiefs 14 - 10 Bills</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm">Chiefs -150</Button>
              <Button variant="outline" size="sm">Chiefs -3.5</Button>
              <Button variant="outline" size="sm">O 47.5</Button>
            </div>
          </div>

          {/* Lakers vs Warriors */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">LIVE</Badge>
                <span className="text-sm">2nd - 3:15</span>
              </div>
              <div className="text-sm font-mono">Lakers 52 - 48 Warriors</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm">Lakers +110</Button>
              <Button variant="outline" size="sm">Lakers +2.5</Button>
              <Button variant="outline" size="sm">O 220.5</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simplified Odds Comparison
function QuickOddsComparison() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Quick Odds Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-2 border rounded">
            <span className="text-sm">Chiefs vs Bills</span>
            <div className="flex gap-2">
              <Badge variant="outline">DK: -150</Badge>
              <Badge variant="outline">FD: -155</Badge>
              <Badge variant="secondary">Best: -150</Badge>
            </div>
          </div>
          <div className="flex justify-between items-center p-2 border rounded">
            <span className="text-sm">Lakers vs Warriors</span>
            <div className="flex gap-2">
              <Badge variant="outline">DK: +110</Badge>
              <Badge variant="outline">FD: +105</Badge>
              <Badge variant="secondary">Best: +110</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UnifiedBettingHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("standard");

  // Determine user tier
  const userTier = (user as any)?.tier || 'standard';
  const isVIP = userTier === 'vip' || userTier === 'premium';
  const isProfessional = userTier === 'professional' || userTier === 'elite';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Betting Hub</h1>
        <div className="flex items-center gap-2">
          <Badge variant={isProfessional ? "default" : isVIP ? "secondary" : "outline"}>
            {isProfessional ? "Professional" : isVIP ? "VIP" : "Standard"}
          </Badge>
          {isProfessional && <Crown className="h-5 w-5 text-yellow-500" />}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="standard">Standard Betting</TabsTrigger>
          <TabsTrigger value="live">Live Betting</TabsTrigger>
          <TabsTrigger value="vip" disabled={!isVIP}>
            VIP Features {!isVIP && <Crown className="h-3 w-3 ml-1" />}
          </TabsTrigger>
          <TabsTrigger value="professional" disabled={!isProfessional}>
            Professional {!isProfessional && <Crown className="h-3 w-3 ml-1" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Standard Sports Betting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" onClick={() => window.location.href = '/comprehensive-betting'}>
                    <Target className="h-4 w-4 mr-2" />
                    Browse All Sports
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/vip/king-engine'}>
                    King Engine Parlays
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/my-bets'}>
                    My Betting History
                  </Button>
                </div>
              </CardContent>
            </Card>

            <QuickOddsComparison />
          </div>
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <SimpleLiveBetting />
        </TabsContent>

        <TabsContent value="vip" className="space-y-6">
          {isVIP ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    VIP Exclusive Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full">
                      Enhanced Live Betting
                    </Button>
                    <Button className="w-full" variant="outline">
                      VIP Customer Support
                    </Button>
                    <Button className="w-full" variant="outline">
                      Exclusive Promotions
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>VIP Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Advanced betting insights for VIP members</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Upgrade to VIP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-xl font-semibold mb-2">VIP Features Locked</h3>
                  <p className="text-muted-foreground mb-4">
                    Unlock enhanced live betting, priority support, and exclusive promotions
                  </p>
                  <Button onClick={() => window.location.href = '/tier-comparison'}>
                    Upgrade to VIP
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          {isProfessional ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Professional Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => setActiveTab("arbitrage")}
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Arbitrage Detection
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => setActiveTab("analytics")}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Performance Analytics
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => setActiveTab("parlay")}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Advanced Parlay Builder
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Market Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Sharp Money Flow</span>
                        <Badge variant="secondary">Chiefs -3.5</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Steam Moves</span>
                        <Badge variant="secondary">O 47.5 → O 48</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Line Movement</span>
                        <Badge variant="destructive">Lakers +2.5 → +3</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Professional Component Tabs */}
              <Tabs defaultValue="arbitrage" className="w-full">
                <TabsList>
                  <TabsTrigger value="arbitrage">Arbitrage Detection</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
                  <TabsTrigger value="parlay">Advanced Parlays</TabsTrigger>
                </TabsList>

                <TabsContent value="arbitrage">
                  <Card>
                    <CardHeader>
                      <CardTitle>Arbitrage Detection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-8">
                        <Calculator className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">Professional Arbitrage Tools</h3>
                        <p className="text-muted-foreground">Advanced arbitrage detection across multiple sportsbooks</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle>Professional Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-8">
                        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">Advanced Performance Metrics</h3>
                        <p className="text-muted-foreground">Comprehensive betting analytics and ROI tracking</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="parlay">
                  <Card>
                    <CardHeader>
                      <CardTitle>Advanced Parlay Builder</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-8">
                        <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">Professional Parlay Tools</h3>
                        <p className="text-muted-foreground">Smart parlay optimization and correlation analysis</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Professional Features Locked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Elite Tools Awaiting</h3>
                  <p className="text-muted-foreground mb-4">
                    Access arbitrage detection, advanced analytics, Kelly criterion calculations, and professional trading tools
                  </p>
                  <Button onClick={() => window.location.href = '/tier-comparison'}>
                    Upgrade to Professional
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}