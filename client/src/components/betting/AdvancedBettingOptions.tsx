import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart2, Clock, RefreshCcw, User, Users, Plus } from "lucide-react";

interface AdvancedBettingOptionsProps {
  eventId: string;
  sportKey: string;
  homeTeam: string;
  awayTeam: string;
}

// API client for enhanced betting options
const advancedBettingAPI = {
  getAllMarkets: async (eventId: string, sportKey: string) => {
    const response = await apiRequest(
      "GET", 
      `/api/events/${eventId}/all-markets?sport=${sportKey}`
    );
    return response.json();
  },
  
  getPlayerProps: async (eventId: string, sportKey: string) => {
    const response = await apiRequest(
      "GET", 
      `/api/events/${eventId}/player-props?sport=${sportKey}`
    );
    return response.json();
  },
  
  getTeamProps: async (eventId: string, sportKey: string) => {
    const response = await apiRequest(
      "GET", 
      `/api/events/${eventId}/team-props?sport=${sportKey}`
    );
    return response.json();
  }
};

const AdvancedBettingOptions: React.FC<AdvancedBettingOptionsProps> = ({ 
  eventId, 
  sportKey,
  homeTeam,
  awayTeam
}) => {
  const { addToBetSlip } = useBetSlip();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("game-lines");
  const [activeMarket, setActiveMarket] = useState<string | null>(null);
  const [hoveredOdds, setHoveredOdds] = useState<string | null>(null);
  
  // Fetch all betting markets with real-time data updates
  const { 
    data: allMarkets, 
    isLoading: isLoadingMarkets,
    refetch: refetchMarkets,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['/api/events', eventId, 'all-markets', sportKey],
    queryFn: () => advancedBettingAPI.getAllMarkets(eventId, sportKey),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time odds
    retry: 1,
    onError: () => {
      toast({
        title: "Couldn't load betting markets",
        description: "We're currently having issues loading the betting options. Please try again later.",
        variant: "destructive"
      });
    }
  });
  
  // Handle adding a selection to the bet slip
  const handleAddSelection = (
    selection: string,
    odds: number,
    betType: string = 'prop',
    point?: number
  ) => {
    addToBetSlip({
      pick: selection,
      homeTeam,
      awayTeam,
      odds,
      betType,
      point,
      sportId: parseInt(eventId)
    });
    
    toast({
      title: "Added to Bet Slip",
      description: `${selection} at ${odds > 0 ? '+' : ''}${odds}`
    });
  };
  
  // Format odds for display
  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };
  
  // Get last updated time
  const getLastUpdatedTime = () => {
    if (!dataUpdatedAt) return "Not yet loaded";
    
    return new Date(dataUpdatedAt).toLocaleTimeString();
  };
  
  // Manually refresh betting data
  const handleRefresh = () => {
    refetchMarkets();
    
    toast({
      title: "Refreshing odds data",
      description: "Getting the latest betting lines and props...",
    });
  };
  
  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
  
  const renderGameLines = () => {
    if (!allMarkets?.gameLines?.length) {
      return <p className="text-center py-6 text-gray-500">No game lines available at this time</p>;
    }
    
    // Get the first bookmaker with the most markets
    const bookmaker = allMarkets.gameLines[0];
    
    return (
      <div className="space-y-4">
        {bookmaker.markets.map((market: any, index: number) => (
          <Card key={`${market.key}-${index}`} className="overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 py-3 px-4">
              <CardTitle className="text-sm font-medium">
                {market.key === 'h2h' ? 'Money Line' : 
                  market.key === 'spreads' ? 'Point Spread' : 
                  market.key === 'totals' ? 'Total Points' : 
                  market.key}
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3 px-4">
              <div className="grid grid-cols-2 gap-3">
                {market.outcomes.map((outcome: any, i: number) => (
                  <div 
                    key={`${outcome.name}-${i}`}
                    className="relative" 
                    onMouseEnter={() => setHoveredOdds(`${market.key}-${outcome.name}-${i}`)}
                    onMouseLeave={() => setHoveredOdds(null)}
                  >
                    <Button 
                      variant="outline" 
                      className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-3 rounded-md text-sm flex justify-between items-center w-full"
                      onClick={() => handleAddSelection(
                        `${outcome.name} ${outcome.point ? outcome.point : ''} (${market.key === 'h2h' ? 'Money Line' : market.key})`, 
                        outcome.price,
                        market.key,
                        outcome.point
                      )}
                    >
                      <span>
                        {outcome.name} 
                        {outcome.point ? ` ${outcome.point}` : ''}
                      </span>
                      <span className="font-medium">
                        {formatOdds(outcome.price)}
                      </span>
                    </Button>
                    {hoveredOdds === `${market.key}-${outcome.name}-${i}` && (
                      <Button 
                        size="sm" 
                        className="absolute -top-3 -right-3 bg-primary hover:bg-primary/90 text-white rounded-full h-7 w-7 p-0 flex items-center justify-center shadow-md z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSelection(
                            `${outcome.name} ${outcome.point ? outcome.point : ''} (${market.key === 'h2h' ? 'Money Line' : market.key})`, 
                            outcome.price,
                            market.key,
                            outcome.point
                          );
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderPlayerProps = () => {
    if (!allMarkets?.playerProps?.length) {
      return <p className="text-center py-6 text-gray-500">No player props available at this time</p>;
    }
    
    // Get the first bookmaker with player props
    const bookmaker = allMarkets.playerProps[0];
    
    return (
      <div className="space-y-4">
        <Accordion type="single" collapsible>
          {bookmaker.markets.map((market: any, index: number) => (
            <AccordionItem key={`${market.key}-${index}`} value={market.key}>
              <AccordionTrigger className="hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>{market.key.replace('player_', '').replace('_', ' ')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-3">
                <div className="space-y-3">
                  {market.outcomes.map((outcome: any, i: number) => (
                    <div 
                      key={`${outcome.name}-${i}`}
                      className="relative" 
                      onMouseEnter={() => setHoveredOdds(`${market.key}-${outcome.name}-${i}`)}
                      onMouseLeave={() => setHoveredOdds(null)}
                    >
                      <Button 
                        variant="outline" 
                        className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-3 rounded-md text-sm flex justify-between items-center w-full"
                        onClick={() => handleAddSelection(
                          `${outcome.name} ${outcome.point ? outcome.point : ''} (${market.key.replace('player_', '')})`, 
                          outcome.price,
                          'player_prop',
                          outcome.point
                        )}
                      >
                        <span>
                          {outcome.name}: {outcome.description || `${outcome.point > 0 ? 'Over' : 'Under'} ${Math.abs(outcome.point)}`}
                        </span>
                        <span className="font-medium">
                          {formatOdds(outcome.price)}
                        </span>
                      </Button>
                      {hoveredOdds === `${market.key}-${outcome.name}-${i}` && (
                        <Button 
                          size="sm" 
                          className="absolute -top-3 -right-3 bg-primary hover:bg-primary/90 text-white rounded-full h-7 w-7 p-0 flex items-center justify-center shadow-md z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddSelection(
                              `${outcome.name} ${outcome.point ? outcome.point : ''} (${market.key.replace('player_', '')})`, 
                              outcome.price,
                              'player_prop',
                              outcome.point
                            );
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  };
  
  const renderTeamProps = () => {
    if (!allMarkets?.teamProps?.length) {
      return <p className="text-center py-6 text-gray-500">No team props available at this time</p>;
    }
    
    // Get the first bookmaker with team props
    const bookmaker = allMarkets.teamProps[0];
    
    return (
      <div className="space-y-4">
        <Accordion type="single" collapsible>
          {bookmaker.markets.map((market: any, index: number) => (
            <AccordionItem key={`${market.key}-${index}`} value={market.key}>
              <AccordionTrigger className="hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{market.key.replace('team_', '').replace('_', ' ')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-3">
                <div className="space-y-3">
                  {market.outcomes.map((outcome: any, i: number) => (
                    <div 
                      key={`${outcome.name}-${i}`}
                      className="relative" 
                      onMouseEnter={() => setHoveredOdds(`${market.key}-${outcome.name}-${i}`)}
                      onMouseLeave={() => setHoveredOdds(null)}
                    >
                      <Button 
                        variant="outline" 
                        className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-3 rounded-md text-sm flex justify-between items-center w-full"
                        onClick={() => handleAddSelection(
                          `${outcome.name} ${outcome.point ? outcome.point : ''} (${market.key.replace('team_', '')})`, 
                          outcome.price,
                          'team_prop',
                          outcome.point
                        )}
                      >
                        <span>
                          {outcome.name}: {outcome.description || `${outcome.point > 0 ? 'Over' : 'Under'} ${Math.abs(outcome.point)}`}
                        </span>
                        <span className="font-medium">
                          {formatOdds(outcome.price)}
                        </span>
                      </Button>
                      {hoveredOdds === `${market.key}-${outcome.name}-${i}` && (
                        <Button 
                          size="sm" 
                          className="absolute -top-3 -right-3 bg-primary hover:bg-primary/90 text-white rounded-full h-7 w-7 p-0 flex items-center justify-center shadow-md z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddSelection(
                              `${outcome.name} ${outcome.point ? outcome.point : ''} (${market.key.replace('team_', '')})`, 
                              outcome.price,
                              'team_prop',
                              outcome.point
                            );
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Betting Markets</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              <span>Updated: {getLastUpdatedTime()}</span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 px-2"
              onClick={handleRefresh}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="game-lines" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="game-lines" className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-2" />
              <span>Game Lines</span>
            </TabsTrigger>
            <TabsTrigger value="player-props" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>Player Props</span>
            </TabsTrigger>
            <TabsTrigger value="team-props" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>Team Props</span>
            </TabsTrigger>
          </TabsList>
          
          {isLoadingMarkets ? (
            renderLoadingSkeleton()
          ) : (
            <>
              <TabsContent value="game-lines" className="mt-0">
                {renderGameLines()}
              </TabsContent>
              
              <TabsContent value="player-props" className="mt-0">
                {renderPlayerProps()}
              </TabsContent>
              
              <TabsContent value="team-props" className="mt-0">
                {renderTeamProps()}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedBettingOptions;