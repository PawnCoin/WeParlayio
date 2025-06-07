import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useBetSlip } from '@/contexts/BetSlipContext';
import { 
  Trophy, 
  Users, 
  Target, 
  TrendingUp, 
  Brain, 
  Shield, 
  Zap, 
  Star,
  Activity,
  BarChart3,
  MessageSquare,
  UserCheck,
  Coins,
  Award
} from "lucide-react";
import { useLocation } from "wouter";

interface PlayerAnalytics {
  playerId: string;
  name: string;
  position: string;
  team: string;
  projectedPoints: number;
  confidenceScore: number;
  injuryRisk: 'low' | 'medium' | 'high';
  weatherImpact: number;
  matchupRating: 'elite' | 'good' | 'average' | 'poor';
  usageTrend: 'increasing' | 'stable' | 'decreasing';
  sleeperPotential: number;
  recommendationScore: number;
}

interface MatchupAnalysis {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  weather: {
    temperature: number;
    windSpeed: number;
    precipitation: number;
    dome: boolean;
  };
  defensiveRankings: {
    vsQB: number;
    vsRB: number;
    vsWR: number;
    vsTE: number;
  };
  paceOfPlay: number;
  totalProjected: number;
}

export default function FantasyAnalyticsDashboard() {
  const { toast } = useToast();
  const { addBet } = useBetSlip();
  const [, setLocation] = useLocation();
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [platform, setPlatform] = useState<'espn' | 'yahoo'>('espn');
  const [leagueId, setLeagueId] = useState('');
  const [optimizationRisk, setOptimizationRisk] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');

  // Fetch player analytics
  const { data: playerAnalyticsResponse, isLoading: playerLoading } = useQuery({
    queryKey: ['/api/fantasy-analytics/player', selectedPlayer],
    enabled: !!selectedPlayer,
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch weekly matchups
  const { data: weeklyMatchupsResponse, isLoading: matchupsLoading } = useQuery({
    queryKey: ['/api/fantasy-analytics/matchups'],
    refetchInterval: 1800000, // 30 minutes
  });

  // Fetch injury analysis
  const { data: injuryAnalysisResponse, isLoading: injuryLoading } = useQuery({
    queryKey: ['/api/fantasy-analytics/injuries'],
    refetchInterval: 900000, // 15 minutes
  });

  // Fetch sleeper picks
  const { data: sleeperPicksResponse, isLoading: sleepersLoading } = useQuery({
    queryKey: ['/api/fantasy-analytics/sleepers'],
    refetchInterval: 3600000, // 1 hour
  });

  // Fetch waiver recommendations
  const { data: waiverRecommendationsResponse, isLoading: waiversLoading } = useQuery({
    queryKey: ['/api/fantasy-analytics/waivers', platform, leagueId],
    enabled: !!platform && !!leagueId,
    refetchInterval: 1800000, // 30 minutes
  });

  // Fetch expert picks
  const { data: expertPicksResponse, isLoading: expertsLoading } = useQuery({
    queryKey: ['/api/fantasy-social/expert-picks'],
    refetchInterval: 3600000, // 1 hour
  });

  // Fetch social feed
  const { data: socialFeedResponse, isLoading: feedLoading } = useQuery({
    queryKey: ['/api/fantasy-social/feed', leagueId],
    enabled: !!leagueId,
    refetchInterval: 120000, // 2 minutes
  });

  // Extract data with proper typing
  const playerAnalytics = (playerAnalyticsResponse as any)?.data as PlayerAnalytics;
  const weeklyMatchups = (weeklyMatchupsResponse as any)?.data as MatchupAnalysis[];
  const injuryAnalysis = (injuryAnalysisResponse as any)?.data as any[];
  const sleeperPicks = (sleeperPicksResponse as any)?.data as PlayerAnalytics[];
  const waiverRecommendations = (waiverRecommendationsResponse as any)?.data as any[];
  const expertPicks = (expertPicksResponse as any)?.data as any[];
  const socialFeed = (socialFeedResponse as any)?.data as any[];

  const optimizeLineup = async () => {
    if (!platform || !leagueId) {
      toast({
        title: "Missing Information",
        description: "Please select platform and enter league ID",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/fantasy-analytics/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, leagueId, riskLevel: optimizationRisk })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Lineup Optimized",
          description: `Generated optimal lineup with ${result.data.totalProjected} projected points`,
        });
      }
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Unable to optimize lineup at this time",
        variant: "destructive",
      });
    }
  };

  const analyzeTrade = async (tradeData: any) => {
    try {
      const response = await fetch('/api/fantasy-social/trades/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Trade Analysis Complete",
          description: `Fairness Score: ${result.data.fairnessScore}/100 - ${result.data.analysis.recommendation}`,
        });
      }
    } catch (error) {
      console.error('Trade analysis error:', error);
    }
  };

  const createBettingPool = async () => {
    if (!leagueId) return;

    try {
      const response = await fetch('/api/fantasy-social/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leagueId,
          platform,
          poolConfig: {
            poolType: 'weekly',
            entryFee: 10,
            currency: 'weparlay_cash',
            payoutStructure: [
              { rank: 1, percentage: 60 },
              { rank: 2, percentage: 30 },
              { rank: 3, percentage: 10 }
            ]
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Betting Pool Created",
          description: "Weekly fantasy league pool is now open for entries",
        });
      }
    } catch (error) {
      console.error('Betting pool creation error:', error);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getMatchupColor = (rating: string) => {
    switch (rating) {
      case 'elite': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'average': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-purple-400" />
            Fantasy Analytics Dashboard
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Advanced machine learning analytics, injury analysis, weather impact, and competitive features for optimal fantasy performance
          </p>
        </div>

        {/* Platform Selection */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Platform Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-white text-sm mb-2 block">Platform</label>
                <Select value={platform} onValueChange={(value: 'espn' | 'yahoo') => setPlatform(value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="espn">ESPN Fantasy</SelectItem>
                    <SelectItem value="yahoo">Yahoo Fantasy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">League ID</label>
                <Input
                  value={leagueId}
                  onChange={(e) => setLeagueId(e.target.value)}
                  placeholder="Enter your league ID"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Risk Level</label>
                <Select value={optimizationRisk} onValueChange={(value: 'conservative' | 'balanced' | 'aggressive') => setOptimizationRisk(value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/10 border-white/20">
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">Analytics</TabsTrigger>
            <TabsTrigger value="matchups" className="text-white data-[state=active]:bg-white/20">Matchups</TabsTrigger>
            <TabsTrigger value="injuries" className="text-white data-[state=active]:bg-white/20">Injuries</TabsTrigger>
            <TabsTrigger value="sleepers" className="text-white data-[state=active]:bg-white/20">Sleepers</TabsTrigger>
            <TabsTrigger value="social" className="text-white data-[state=active]:bg-white/20">Social</TabsTrigger>
            <TabsTrigger value="betting" className="text-white data-[state=active]:bg-white/20">Betting</TabsTrigger>
          </TabsList>

          {/* Player Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Player Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    placeholder="Enter player ID for analysis"
                    className="bg-white/10 border-white/20 text-white"
                  />
                  
                  {playerAnalytics && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">{playerAnalytics.name}</span>
                        <Badge className={`${getMatchupColor(playerAnalytics.matchupRating)}`}>
                          {playerAnalytics.position} - {playerAnalytics.team}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-3 rounded">
                          <div className="text-gray-300 text-sm">Projected Points</div>
                          <div className="text-white text-xl font-bold">{playerAnalytics.projectedPoints}</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded">
                          <div className="text-gray-300 text-sm">Confidence</div>
                          <div className="text-white text-xl font-bold">{playerAnalytics.confidenceScore}%</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded">
                          <div className="text-gray-300 text-sm">Injury Risk</div>
                          <div className={`text-xl font-bold ${getRiskColor(playerAnalytics.injuryRisk)}`}>
                            {playerAnalytics.injuryRisk}
                          </div>
                        </div>
                        <div className="bg-white/5 p-3 rounded">
                          <div className="text-gray-300 text-sm">Sleeper Score</div>
                          <div className="text-white text-xl font-bold">{playerAnalytics.sleeperPotential}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">Usage Trend:</span>
                        {getTrendIcon(playerAnalytics.usageTrend)}
                        <span className="text-white">{playerAnalytics.usageTrend}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Lineup Optimizer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={optimizeLineup}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                    disabled={!platform || !leagueId}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Optimize Lineup
                  </Button>
                  
                  <div className="space-y-2">
                    <div className="text-white text-sm">Optimization Features:</div>
                    <ul className="text-gray-300 text-xs space-y-1">
                      <li>• Machine learning projections</li>
                      <li>• Weather impact adjustments</li>
                      <li>• Injury risk assessment</li>
                      <li>• Matchup difficulty analysis</li>
                      <li>• Salary cap optimization</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Waiver Wire Recommendations */}
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Waiver Wire Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {waiversLoading ? (
                  <div className="text-white">Loading waiver recommendations...</div>
                ) : waiverRecommendations?.data?.length > 0 ? (
                  <div className="space-y-3">
                    {waiverRecommendations.data.slice(0, 5).map((rec: any, index: number) => (
                      <div key={index} className="bg-white/5 p-3 rounded flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">{rec.player.name}</div>
                          <div className="text-gray-300 text-sm">{rec.reasoning}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">Priority: {rec.priority}</div>
                          <div className="text-gray-300 text-sm">{rec.player.projectedPoints} proj pts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-300">Configure platform and league to see recommendations</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Matchups Tab */}
          <TabsContent value="matchups" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Weekly Matchup Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matchupsLoading ? (
                  <div className="text-white">Loading matchup analysis...</div>
                ) : weeklyMatchups?.data?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {weeklyMatchups.data.map((matchup: MatchupAnalysis, index: number) => (
                      <div key={index} className="bg-white/5 p-4 rounded">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-semibold">
                            {matchup.awayTeam} @ {matchup.homeTeam}
                          </span>
                          <span className="text-gray-300">O/U: {matchup.totalProjected}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-gray-300 text-sm">Weather</div>
                            <div className="text-white text-sm">
                              {matchup.weather.temperature}°F, {matchup.weather.windSpeed}mph
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-300 text-sm">Pace</div>
                            <div className="text-white text-sm">{matchup.paceOfPlay} plays/game</div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="text-gray-300 text-sm mb-1">Defensive Rankings</div>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <span className="text-white">QB: {matchup.defensiveRankings.vsQB}</span>
                            <span className="text-white">RB: {matchup.defensiveRankings.vsRB}</span>
                            <span className="text-white">WR: {matchup.defensiveRankings.vsWR}</span>
                            <span className="text-white">TE: {matchup.defensiveRankings.vsTE}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-300">No matchup data available</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Injury Analysis Tab */}
          <TabsContent value="injuries" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Injury Analysis & Replacements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {injuryLoading ? (
                  <div className="text-white">Loading injury analysis...</div>
                ) : injuryAnalysis?.data?.length > 0 ? (
                  <div className="space-y-4">
                    {injuryAnalysis.data.map((injury: any, index: number) => (
                      <div key={index} className="bg-white/5 p-4 rounded">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white font-semibold">{injury.playerName}</span>
                          <Badge className={getRiskColor(injury.injuryStatus === 'out' ? 'high' : 'medium')}>
                            {injury.injuryStatus}
                          </Badge>
                        </div>
                        
                        <div className="text-gray-300 text-sm mb-3">
                          {injury.injuryType} - Impact Level: {injury.impactLevel}/10
                        </div>
                        
                        {injury.replacementOptions?.length > 0 && (
                          <div>
                            <div className="text-white text-sm mb-2">Replacement Options:</div>
                            <div className="space-y-2">
                              {injury.replacementOptions.slice(0, 3).map((replacement: any, idx: number) => (
                                <div key={idx} className="bg-white/5 p-2 rounded flex justify-between">
                                  <span className="text-white text-sm">{replacement.name}</span>
                                  <span className="text-gray-300 text-sm">{replacement.projectedPoints} pts</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-300">No injury concerns at this time</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sleeper Picks Tab */}
          <TabsContent value="sleepers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top Sleeper Picks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sleepersLoading ? (
                    <div className="text-white">Finding sleeper opportunities...</div>
                  ) : sleeperPicks?.data?.length > 0 ? (
                    <div className="space-y-3">
                      {sleeperPicks.data.slice(0, 5).map((sleeper: PlayerAnalytics, index: number) => (
                        <div key={index} className="bg-white/5 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-semibold">{sleeper.name}</span>
                            <Badge className="bg-yellow-500/20 text-yellow-300">
                              {sleeper.sleeperPotential}% upside
                            </Badge>
                          </div>
                          <div className="text-gray-300 text-sm">
                            {sleeper.position} - {sleeper.team} | {sleeper.projectedPoints} projected points
                          </div>
                          <div className="text-gray-400 text-xs mt-1">
                            Confidence: {sleeper.confidenceScore}% | {sleeper.usageTrend} usage trend
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-300">No sleeper picks available</div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Expert Consensus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expertsLoading ? (
                    <div className="text-white">Loading expert analysis...</div>
                  ) : expertPicks?.data?.length > 0 ? (
                    <div className="space-y-3">
                      {expertPicks.data.slice(0, 3).map((expert: any, index: number) => (
                        <div key={index} className="bg-white/5 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-semibold">{expert.expertName}</span>
                            <Badge className="bg-blue-500/20 text-blue-300">
                              {expert.accuracy.season}% accurate
                            </Badge>
                          </div>
                          {expert.weeklyPicks?.slice(0, 2).map((pick: any, idx: number) => (
                            <div key={idx} className="text-gray-300 text-sm">
                              {pick.recommendation.toUpperCase()}: {pick.playerName} ({pick.confidence}%)
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-300">Expert picks not available</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Features Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Fantasy League Social Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feedLoading ? (
                  <div className="text-white">Loading social feed...</div>
                ) : socialFeed?.data?.length > 0 ? (
                  <div className="space-y-4">
                    {socialFeed.data.slice(0, 5).map((post: any, index: number) => (
                      <div key={index} className="bg-white/5 p-4 rounded">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {post.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-white text-sm font-semibold">{post.username}</div>
                            <div className="text-gray-400 text-xs">{post.postType.replace('_', ' ')}</div>
                          </div>
                        </div>
                        <div className="text-gray-300 text-sm">{post.content}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>{post.likes} likes</span>
                          <span>{post.comments} comments</span>
                          <span>{post.shares} shares</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-300">No social activity for this league</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Betting Features Tab */}
          <TabsContent value="betting" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Fantasy Betting Pools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={createBettingPool}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                    disabled={!leagueId}
                  >
                    Create Weekly Pool
                  </Button>
                  
                  <div className="space-y-2">
                    <div className="text-white text-sm">Pool Features:</div>
                    <ul className="text-gray-300 text-xs space-y-1">
                      <li>• Weekly, monthly, and season-long pools</li>
                      <li>• Multiple currency options (USD, WeParlay Cash, Pawn Coin)</li>
                      <li>• Customizable payout structures</li>
                      <li>• Head-to-head matchup betting</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Fantasy Tournaments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    onClick={() => setLocation('/tournaments')}
                  >
                    View Tournaments
                  </Button>
                  
                  <div className="space-y-2">
                    <div className="text-white text-sm">Tournament Types:</div>
                    <ul className="text-gray-300 text-xs space-y-1">
                      <li>• Single elimination brackets</li>
                      <li>• Round robin leagues</li>
                      <li>• Points-based competitions</li>
                      <li>• Multi-platform integration</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}