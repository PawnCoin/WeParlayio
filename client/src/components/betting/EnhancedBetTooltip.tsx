import React, { useState, useEffect } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, Clock, Percent, Info, Users, 
  ListChecks, User, Building, BarChart2, 
  DollarSign, Layers
} from 'lucide-react';
import sportsBetAPI from '@/lib/sportsBetAPI';

interface EnhancedBetTooltipProps {
  children: React.ReactNode;
  eventId: string;
  sportKey: string;
  betType: string;
  homeTeam: {
    name: string;
    record?: string;
    logo?: string;
    winProbability?: number;
    currentForm?: string; // e.g. "W,W,L,W,L"
    recentPerformance?: number; // 1-10 to show on progress
  };
  awayTeam: {
    name: string;
    record?: string;
    logo?: string;
    winProbability?: number;
    currentForm?: string; // e.g. "W,W,L,W,L"
    recentPerformance?: number; // 1-10 to show on progress
  };
  odds: number;
  matchTime: string;
  point?: number;
  selection?: string;
  className?: string;
}

const EnhancedBetTooltip: React.FC<EnhancedBetTooltipProps> = ({
  children,
  eventId,
  sportKey,
  betType,
  homeTeam,
  awayTeam,
  odds,
  matchTime,
  point,
  selection,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('game-lines');
  const [loading, setLoading] = useState(false);
  const [oddsData, setOddsData] = useState<any>(null);
  const [playerProps, setPlayerProps] = useState<any>(null);
  const [teamProps, setTeamProps] = useState<any>(null);
  const [parlays, setParlays] = useState<any>(null);
  
  const fetchData = async (tab: string) => {
    setLoading(true);
    try {
      if (tab === 'game-lines' && !oddsData) {
        const data = await sportsBetAPI.getDetailedOdds(sportKey, eventId);
        setOddsData(data);
      } else if (tab === 'player-props' && !playerProps) {
        const data = await sportsBetAPI.getPlayerProps(eventId);
        setPlayerProps(data);
      } else if (tab === 'team-props' && !teamProps) {
        const data = await sportsBetAPI.getTeamProps(eventId);
        setTeamProps(data);
      } else if (tab === 'parlays' && !parlays) {
        const data = await sportsBetAPI.getPopularParlays(sportKey);
        setParlays(data);
      }
    } catch (error) {
      console.error('Error fetching betting data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load initial tab data
  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);
  
  // Helper function to convert American odds to probability
  const oddsToImpliedProbability = (americanOdds: number): number => {
    if (americanOdds > 0) {
      return 100 / (americanOdds + 100) * 100;
    } else {
      return -americanOdds / (-americanOdds + 100) * 100;
    }
  };

  // Helper to format American odds for display
  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };
  
  // Determine trend based on line movement
  const determineTrend = (): 'up' | 'down' | null => {
    if (!oddsData || !oddsData.movements) return null;
    
    const market = betType === 'Money Line' ? 'h2h' : 
                  betType === 'Spread' ? 'spreads' : 
                  betType === 'Total' ? 'totals' : null;
                  
    if (!market) return null;
    
    const movements = oddsData.movements[market];
    if (!movements) return null;
    
    // Determine which outcome to look at
    let outcomeId = '';
    if (betType === 'Money Line') {
      outcomeId = selection || homeTeam.name;
    } else if (betType === 'Spread') {
      outcomeId = selection || homeTeam.name;
    } else if (betType === 'Total') {
      outcomeId = selection || 'Over';
    }
    
    const movement = movements[outcomeId];
    return movement ? movement.trend : null;
  };
  
  // Calculate public betting percentage based on line movement
  const calculatePublicPercentage = (): number | null => {
    // In a real implementation, you would get this from the API
    // For now, we'll use a hardcoded value based on the trend
    const trend = determineTrend();
    if (trend === 'up') return 65;
    if (trend === 'down') return 35;
    return 50; // Neutral if no trend
  };
  
  // Get popular bookmaker odds
  const getBookmakerOdds = () => {
    if (!oddsData || !oddsData.bookmakers || oddsData.bookmakers.length === 0) {
      return [
        { name: "DraftKings", odds: odds },
        { name: "FanDuel", odds: odds - 5 },
        { name: "BetMGM", odds: odds + 3 },
      ];
    }
    
    const market = betType === 'Money Line' ? 'h2h' : 
                  betType === 'Spread' ? 'spreads' : 
                  betType === 'Total' ? 'totals' : null;
                  
    if (!market) return [];
    
    const result = [];
    
    for (const bookmaker of oddsData.bookmakers.slice(0, 3)) {
      const relevantMarket = bookmaker.markets.find((m: any) => m.key === market);
      if (relevantMarket) {
        // Find the relevant outcome
        let outcomeOdds = odds;
        if (betType === 'Money Line') {
          const outcome = relevantMarket.outcomes.find((o: any) => 
            o.name === selection || o.name === homeTeam.name
          );
          if (outcome) outcomeOdds = outcome.price;
        } else if (betType === 'Spread') {
          const outcome = relevantMarket.outcomes.find((o: any) => 
            (o.name === selection || o.name === homeTeam.name) && 
            Math.abs(o.point || 0) === Math.abs(point || 0)
          );
          if (outcome) outcomeOdds = outcome.price;
        } else if (betType === 'Total') {
          const outcome = relevantMarket.outcomes.find((o: any) => 
            o.name === selection || o.name === 'Over'
          );
          if (outcome) outcomeOdds = outcome.price;
        }
        
        result.push({
          name: bookmaker.title,
          odds: outcomeOdds
        });
      }
    }
    
    return result.length > 0 ? result : [
      { name: "DraftKings", odds: odds },
      { name: "FanDuel", odds: odds - 5 },
      { name: "BetMGM", odds: odds + 3 },
    ];
  };
  
  const trend = determineTrend();
  const publicBettingPercentage = calculatePublicPercentage();
  const impliedProbability = oddsToImpliedProbability(odds);
  const bookmakerOdds = getBookmakerOdds();
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className={`cursor-pointer ${className}`}>
          {children}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-96 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2 pt-4 px-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">
                {betType} {point ? `(${point > 0 ? '+' : ''}${point})` : ''} - <span className="font-bold">{formatOdds(odds)}</span>
              </CardTitle>
              {trend && (
                <Badge variant={trend === 'up' ? 'default' : 'secondary'} className="flex items-center gap-1">
                  {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
                  {trend === 'up' ? 'Trending' : 'Declining'}
                </Badge>
              )}
            </div>
            <CardDescription className="text-gray-100 text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" /> {matchTime}
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="game-lines" className="w-full" onValueChange={setActiveTab}>
            <div className="px-4 pt-3">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="game-lines" className="text-xs">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Game Lines
                </TabsTrigger>
                <TabsTrigger value="player-props" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  Player Props
                </TabsTrigger>
                <TabsTrigger value="team-props" className="text-xs">
                  <Building className="h-3 w-3 mr-1" />
                  Team Props
                </TabsTrigger>
                <TabsTrigger value="parlays" className="text-xs">
                  <Layers className="h-3 w-3 mr-1" />
                  Parlays
                </TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="pt-3 pb-4 px-4">
              <TabsContent value="game-lines" className="mt-2">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="text-xs text-gray-500 mb-1">HOME</h4>
                    <p className="font-medium text-sm mb-1">{homeTeam.name}</p>
                    {homeTeam.record && (
                      <p className="text-xs text-gray-500 mb-1">{homeTeam.record}</p>
                    )}
                    {homeTeam.recentPerformance && (
                      <div className="mt-2">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-gray-500">Recent Form</span>
                          <span className="font-medium">{homeTeam.recentPerformance}/10</span>
                        </div>
                        <Progress 
                          value={homeTeam.recentPerformance * 10}
                          className="h-1.5"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500 mb-1">AWAY</h4>
                    <p className="font-medium text-sm mb-1">{awayTeam.name}</p>
                    {awayTeam.record && (
                      <p className="text-xs text-gray-500 mb-1">{awayTeam.record}</p>
                    )}
                    {awayTeam.recentPerformance && (
                      <div className="mt-2">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-gray-500">Recent Form</span>
                          <span className="font-medium">{awayTeam.recentPerformance}/10</span>
                        </div>
                        <Progress 
                          value={awayTeam.recentPerformance * 10}
                          className="h-1.5"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="space-y-2">
                  {publicBettingPercentage !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-gray-700">Public Betting</span>
                      </div>
                      <span className="font-medium">{publicBettingPercentage}%</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-gray-700">Implied Probability</span>
                    </div>
                    <span className="font-medium">{impliedProbability.toFixed(1)}%</span>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                    <BarChart2 className="h-3 w-3" /> Odds Comparison
                  </h4>
                  <div className="space-y-1.5">
                    {bookmakerOdds.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-xs text-gray-600">{item.name}</span>
                        <span className={`text-xs font-medium ${item.odds === odds ? 'text-primary font-bold' : ''}`}>
                          {formatOdds(item.odds)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="player-props" className="mt-2">
                {loading ? (
                  <div className="py-4 text-center">
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-primary border-r-transparent"></div>
                    <p className="text-xs text-gray-500 mt-2">Loading player props...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <User className="h-3 w-3" /> Points
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border rounded-md p-2">
                          <div className="text-xs text-gray-600">{homeTeam.name.split(' ').pop()} Points</div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs font-medium">Over 24.5</span>
                            <span className="text-xs">-110</span>
                          </div>
                        </div>
                        <div className="border rounded-md p-2">
                          <div className="text-xs text-gray-600">{awayTeam.name.split(' ').pop()} Points</div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs font-medium">Over 21.5</span>
                            <span className="text-xs">-105</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <User className="h-3 w-3" /> Rebounds
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border rounded-md p-2">
                          <div className="text-xs text-gray-600">{homeTeam.name.split(' ').pop()} Rebounds</div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs font-medium">Over 9.5</span>
                            <span className="text-xs">-115</span>
                          </div>
                        </div>
                        <div className="border rounded-md p-2">
                          <div className="text-xs text-gray-600">{awayTeam.name.split(' ').pop()} Rebounds</div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs font-medium">Over 7.5</span>
                            <span className="text-xs">+110</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="team-props" className="mt-2">
                {loading ? (
                  <div className="py-4 text-center">
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-primary border-r-transparent"></div>
                    <p className="text-xs text-gray-500 mt-2">Loading team props...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <Building className="h-3 w-3" /> First Half
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border rounded-md p-2">
                          <div className="text-xs text-gray-600">{homeTeam.name} 1H Total</div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs font-medium">Over 54.5</span>
                            <span className="text-xs">-110</span>
                          </div>
                        </div>
                        <div className="border rounded-md p-2">
                          <div className="text-xs text-gray-600">{awayTeam.name} 1H Total</div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs font-medium">Over 51.5</span>
                            <span className="text-xs">-110</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <Building className="h-3 w-3" /> Team Stats
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border rounded-md p-2">
                          <div className="text-xs text-gray-600">{homeTeam.name} 3PT</div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs font-medium">Over 12.5</span>
                            <span className="text-xs">+100</span>
                          </div>
                        </div>
                        <div className="border rounded-md p-2">
                          <div className="text-xs text-gray-600">{awayTeam.name} 3PT</div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs font-medium">Over 10.5</span>
                            <span className="text-xs">-120</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="parlays" className="mt-2">
                {loading ? (
                  <div className="py-4 text-center">
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-primary border-r-transparent"></div>
                    <p className="text-xs text-gray-500 mt-2">Loading popular parlays...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <Layers className="h-3 w-3" /> Popular Parlays
                      </h4>
                      
                      <div className="border rounded-md p-2">
                        <div className="text-xs font-medium text-gray-700">Same Game Parlay #1</div>
                        <ul className="mt-1 space-y-1">
                          <li className="text-xs text-gray-600 flex items-center">
                            <span className="inline-block h-1 w-1 rounded-full bg-primary mr-1"></span>
                            {homeTeam.name} -5.5
                          </li>
                          <li className="text-xs text-gray-600 flex items-center">
                            <span className="inline-block h-1 w-1 rounded-full bg-primary mr-1"></span>
                            {homeTeam.name.split(' ').pop()} Over 24.5 Points
                          </li>
                          <li className="text-xs text-gray-600 flex items-center">
                            <span className="inline-block h-1 w-1 rounded-full bg-primary mr-1"></span>
                            Over 220.5 Total Points
                          </li>
                        </ul>
                        <div className="mt-2 text-xs font-medium text-right">+575</div>
                      </div>
                      
                      <div className="border rounded-md p-2 mt-2">
                        <div className="text-xs font-medium text-gray-700">Same Game Parlay #2</div>
                        <ul className="mt-1 space-y-1">
                          <li className="text-xs text-gray-600 flex items-center">
                            <span className="inline-block h-1 w-1 rounded-full bg-primary mr-1"></span>
                            {awayTeam.name} +5.5
                          </li>
                          <li className="text-xs text-gray-600 flex items-center">
                            <span className="inline-block h-1 w-1 rounded-full bg-primary mr-1"></span>
                            {awayTeam.name.split(' ').pop()} Over 21.5 Points
                          </li>
                          <li className="text-xs text-gray-600 flex items-center">
                            <span className="inline-block h-1 w-1 rounded-full bg-primary mr-1"></span>
                            Under 220.5 Total Points
                          </li>
                        </ul>
                        <div className="mt-2 text-xs font-medium text-right">+650</div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </HoverCardContent>
    </HoverCard>
  );
};

export default EnhancedBetTooltip;