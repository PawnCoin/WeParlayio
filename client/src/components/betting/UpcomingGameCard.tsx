import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Wifi, WifiOff } from "lucide-react";

interface UpcomingGameCardProps {
  game: {
    id: number | string;
    homeTeam: {
      id: number;
      name: string;
      logo: string;
    };
    awayTeam: {
      id: number;
      name: string;
      logo: string;
    };
    startTime: string;
    bookmakers?: Array<{
      key: string;
      title: string;
      markets: Array<{
        key: string;
        outcomes: Array<{
          name: string;
          price: number;
          point?: number;
        }>;
      }>;
    }>;
    odds?: {
      homeSpread?: {
        line: number;
        odds: number;
      };
      awaySpread?: {
        line: number;
        odds: number;
      };
      total?: {
        line: number;
        odds: number;
      };
    };
  };
}

const UpcomingGameCard: React.FC<UpcomingGameCardProps> = ({ game }) => {
  const { toast } = useToast();
  const [liveScores, setLiveScores] = useState({
    homeScore: 0,
    awayScore: 0,
    quarter: '',
    timeRemaining: '',
    isLive: false
  });
  const [isConnected, setIsConnected] = useState(true);
  
  // Check if game is live (within 4 hours of start time)
  const isGameLive = () => {
    const now = new Date();
    const gameTime = new Date(game.startTime);
    const timeDiff = now.getTime() - gameTime.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff >= 0 && hoursDiff <= 4; // Game started and within 4 hours
  };
  
  // Fetch live scores
  const fetchLiveScores = async () => {
    if (!isGameLive()) return;
    
    try {
      const response = await fetch(`/api/live-scores/${game.id}`);
      if (response.ok) {
        const data = await response.json();
        setLiveScores({
          homeScore: data.homeScore || 0,
          awayScore: data.awayScore || 0,
          quarter: data.quarter || '',
          timeRemaining: data.timeRemaining || '',
          isLive: data.isLive || false
        });
        setIsConnected(true);
      }
    } catch (error) {
      console.log('Live scores unavailable');
      setIsConnected(false);
    }
  };
  
  // Set up polling for live games
  useEffect(() => {
    if (isGameLive()) {
      fetchLiveScores();
      const interval = setInterval(fetchLiveScores, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [game.id, game.startTime]);
  
  const handleAddToBetSlip = (selection: string, odds: number) => {
    // Add to localStorage betslip for persistence
    const existingBets = JSON.parse(localStorage.getItem('betSlip') || '[]');
    const newBet = {
      id: Date.now().toString(),
      gameId: game.id,
      selection,
      odds,
      stake: 0,
      teams: `${game.awayTeam.name} @ ${game.homeTeam.name}`,
      timestamp: new Date().toISOString(),
      isLive: liveScores.isLive,
      currentScore: liveScores.isLive ? `${liveScores.awayScore}-${liveScores.homeScore}` : null
    };
    
    // Check if bet already exists
    const existingBet = existingBets.find((bet: any) => 
      bet.gameId === game.id && bet.selection === selection
    );
    
    if (!existingBet) {
      existingBets.push(newBet);
      localStorage.setItem('betSlip', JSON.stringify(existingBets));
      
      toast({
        title: liveScores.isLive ? "Live Bet Added!" : "Added to Bet Slip",
        description: `${selection} at ${odds > 0 ? '+' : ''}${odds}${liveScores.isLive ? ' (Live Game)' : ''}`,
        duration: 3000,
      });
    } else {
      toast({
        title: "Already in Bet Slip",
        description: `${selection} is already added`,
        variant: "destructive",
        duration: 2000,
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short"
    });
  };

  return (
    <Card className="mb-4 relative">
      {liveScores.isLive && (
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <Badge variant="destructive" className="animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
            LIVE
          </Badge>
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
        </div>
      )}
      
      <CardContent className="p-4">
        {liveScores.isLive && (
          <div className="mb-3 text-center border-b pb-2">
            <div className="flex justify-center items-center gap-4 text-lg font-bold">
              <span className="text-blue-600">{game.awayTeam.name.split(' ').pop()}</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{liveScores.awayScore}</span>
                <span className="text-gray-400">-</span>
                <span className="text-2xl">{liveScores.homeScore}</span>
              </div>
              <span className="text-green-600">{game.homeTeam.name.split(' ').pop()}</span>
            </div>
            {liveScores.quarter && (
              <div className="flex justify-center items-center gap-2 text-sm text-gray-500 mt-1">
                <Clock className="h-3 w-3" />
                <span>{liveScores.quarter}</span>
                {liveScores.timeRemaining && <span>• {liveScores.timeRemaining}</span>}
              </div>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          <div className="col-span-2 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img className="w-10 h-10 object-contain" src="https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" alt={`${game.homeTeam.name} logo`} />
              <span className="font-medium">{game.homeTeam.name}</span>
            </div>
            <div className="text-xl font-semibold md:hidden">@</div>
          </div>
          
          <div className="text-center hidden md:block">
            <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(game.startTime)}</div>
            <div className="text-sm font-medium">{formatTime(game.startTime)}</div>
          </div>
          
          <div className="col-span-2 flex items-center justify-between">
            <div className="text-xl font-semibold md:hidden">@</div>
            <div className="flex items-center space-x-3">
              <span className="font-medium">{game.awayTeam.name}</span>
              <img className="w-10 h-10 object-contain" src="https://images.unsplash.com/photo-1590227632180-80a3bf110871?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" alt={`${game.awayTeam.name} logo`} />
            </div>
          </div>
        </div>
        
        <div className="mt-4 md:mt-2 border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-3 gap-2">
          {/* Home Team Spread/Moneyline */}
          <Button 
            variant="outline" 
            className="bg-gray-100 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900 hover:border-green-300 py-2 px-3 rounded-md text-xs flex justify-between items-center transition-colors"
            onClick={() => {
              // Try to get spread first, then moneyline
              const spreadMarket = game.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'spreads');
              const moneylineMarket = game.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'h2h');
              
              if (spreadMarket) {
                const homeSpread = spreadMarket.outcomes?.find((o: any) => o.name === game.homeTeam.name);
                if (homeSpread) {
                  handleAddToBetSlip(`${game.homeTeam.name} ${homeSpread.point} (Spread)`, homeSpread.price);
                  return;
                }
              }
              
              if (moneylineMarket) {
                const homeMoneyline = moneylineMarket.outcomes?.find((o: any) => o.name === game.homeTeam.name);
                if (homeMoneyline) {
                  handleAddToBetSlip(`${game.homeTeam.name} (Moneyline)`, homeMoneyline.price);
                  return;
                }
              }
              
              // Fallback
              handleAddToBetSlip(`${game.homeTeam.name} (Spread)`, -110);
            }}
          >
            <span className="truncate">
              {game.homeTeam.name ? game.homeTeam.name.split(' ').pop() : 'Home'}
              {(() => {
                const spreadMarket = game.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'spreads');
                const homeSpread = spreadMarket?.outcomes?.find((o: any) => o.name === game.homeTeam.name);
                return homeSpread?.point ? ` ${homeSpread.point}` : '';
              })()}
            </span>
            <span className="font-medium text-green-600">
              {(() => {
                const spreadMarket = game.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'spreads');
                const moneylineMarket = game.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'h2h');
                
                const homeSpread = spreadMarket?.outcomes?.find((o: any) => o.name === game.homeTeam.name);
                const homeMoneyline = moneylineMarket?.outcomes?.find((o: any) => o.name === game.homeTeam.name);
                
                const odds = homeSpread?.price || homeMoneyline?.price;
                return odds ? (odds > 0 ? `+${odds}` : odds) : 'N/A';
              })()}
            </span>
          </Button>

          {/* Away Team Spread/Moneyline */}
          <Button 
            variant="outline" 
            className="bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 hover:border-blue-300 py-2 px-3 rounded-md text-xs flex justify-between items-center transition-colors"
            onClick={() => {
              // Try to get spread first, then moneyline
              const spreadMarket = game.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'spreads');
              const moneylineMarket = game.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'h2h');
              
              if (spreadMarket) {
                const awaySpread = spreadMarket.outcomes?.find((o: any) => o.name === game.awayTeam.name);
                if (awaySpread) {
                  handleAddToBetSlip(`${game.awayTeam.name} ${awaySpread.point} (Spread)`, awaySpread.price);
                  return;
                }
              }
              
              if (moneylineMarket) {
                const awayMoneyline = moneylineMarket.outcomes?.find((o: any) => o.name === game.awayTeam.name);
                if (awayMoneyline) {
                  handleAddToBetSlip(`${game.awayTeam.name} (Moneyline)`, awayMoneyline.price);
                  return;
                }
              }
              
              // Fallback
              handleAddToBetSlip(`${game.awayTeam.name} (Spread)`, -110);
            }}
          >
            <span className="truncate">
              {game.awayTeam.name ? game.awayTeam.name.split(' ').pop() : 'Away'}
              {(() => {
                const spreadMarket = game.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'spreads');
                const awaySpread = spreadMarket?.outcomes?.find((o: any) => o.name === game.awayTeam.name);
                return awaySpread?.point ? ` ${awaySpread.point}` : '';
              })()}
            </span>
            <span className="font-medium text-blue-600">
              {(() => {
                const spreadMarket = game.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'spreads');
                const moneylineMarket = game.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'h2h');
                
                const awaySpread = spreadMarket?.outcomes?.find((o: any) => o.name === game.awayTeam.name);
                const awayMoneyline = moneylineMarket?.outcomes?.find((o: any) => o.name === game.awayTeam.name);
                
                const odds = awaySpread?.price || awayMoneyline?.price;
                return odds ? (odds > 0 ? `+${odds}` : odds) : 'N/A';
              })()}
            </span>
          </Button>

          {/* Total Over/Under */}
          <Button 
            variant="outline" 
            className="bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900 hover:border-purple-300 py-2 px-3 rounded-md text-xs flex justify-between items-center transition-colors"
            onClick={() => {
              const totalsMarket = game.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'totals');
              const overOutcome = totalsMarket?.outcomes?.find((o: any) => o.name === 'Over');
              
              if (overOutcome) {
                handleAddToBetSlip(`O/U ${overOutcome.point} (Over)`, overOutcome.price);
              } else {
                handleAddToBetSlip(`O/U (Total)`, -110);
              }
            }}
          >
            <span>
              O/U {(() => {
                const totalsMarket = game.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'totals');
                const overOutcome = totalsMarket?.outcomes?.find((o: any) => o.name === 'Over');
                return overOutcome?.point || 'N/A';
              })()}
            </span>
            <span className="font-medium text-purple-600">
              {(() => {
                const totalsMarket = game.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'totals');
                const overOutcome = totalsMarket?.outcomes?.find((o: any) => o.name === 'Over');
                const odds = overOutcome?.price;
                return odds ? (odds > 0 ? `+${odds}` : odds) : 'N/A';
              })()}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingGameCard;
