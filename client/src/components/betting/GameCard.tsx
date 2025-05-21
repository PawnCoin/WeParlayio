import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus } from "lucide-react";
import { useBetSlip } from "@/contexts/BetSlipContext";

interface GameCardProps {
  game: {
    id: number;
    homeTeam: {
      id: number;
      name: string;
      logo: string;
      record: string;
      location: string;
    };
    awayTeam: {
      id: number;
      name: string;
      logo: string;
      record: string;
      location: string;
    };
    startTime: string;
    status: string;
    homeScore: number;
    awayScore: number;
    period: string;
    timeRemaining: string;
    sportName: string;
    odds: {
      moneyline: {
        home: number;
        away: number;
      };
      pointSpread: {
        home: {
          line: number;
          odds: number;
        };
        away: {
          line: number;
          odds: number;
        };
      };
      total: {
        over: {
          line: number;
          odds: number;
        };
        under: {
          line: number;
          odds: number;
        };
      };
    };
  };
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { toast } = useToast();
  const { addToBetSlip } = useBetSlip();
  const [hoveredOdds, setHoveredOdds] = useState<string | null>(null);
  
  const isLive = game.status === "live";
  const progress = isLive ? Math.floor(Math.random() * 100) : 0; // This should be calculated based on game time
  
  const handleAddToBetSlip = (selection: string, odds: number, betType: string = 'moneyline', point?: number) => {
    // Add to bet slip context
    addToBetSlip({
      pick: selection,
      homeTeam: game.homeTeam.name,
      awayTeam: game.awayTeam.name,
      odds: odds,
      betType: betType,
      point: point,
      sportId: game.id
    });
    
    // Show toast notification
    toast({
      title: "Added to Bet Slip",
      description: `${selection} at ${odds > 0 ? '+' : ''}${odds}`
    });
  };
  
  return (
    <Card className="overflow-hidden mb-6">
      {/* Game Header */}
      <CardHeader className="bg-gray-50 dark:bg-gray-800 p-4 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-2 sm:mb-0">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2">
            <i className="fas fa-basketball-ball text-sm"></i>
          </div>
          <div>
            <h3 className="font-medium">{game.sportName} - Game Lines</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLive 
                ? "Live Now" 
                : new Date(game.startTime).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
              }
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {isLive && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
              Live
            </span>
          )}
          <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary">
            <i className="fas fa-chart-line mr-1"></i> Live Stats
          </Button>
        </div>
      </CardHeader>
      
      {/* Game Content */}
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Team Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img className="w-12 h-12 mr-3 object-contain" src="https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" alt={`${game.homeTeam.name} logo`} />
              <div>
                <div className="font-semibold">{game.homeTeam.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{game.homeTeam.record}, {game.homeTeam.location}</div>
              </div>
            </div>
            <div className="text-2xl font-bold">{game.homeScore}</div>
          </div>
          
          {/* Game Stats */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{game.period}</div>
            <div className="text-lg font-semibold mb-1">{game.homeScore} - {game.awayScore}</div>
            <div className="bg-gray-100 dark:bg-gray-700 h-1 w-full rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{game.timeRemaining} remaining</div>
          </div>
          
          {/* Team Info */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{game.awayScore}</div>
            <div className="flex items-center">
              <div className="text-right mr-3">
                <div className="font-semibold">{game.awayTeam.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{game.awayTeam.record}, {game.awayTeam.location}</div>
              </div>
              <img className="w-12 h-12 object-contain" src="https://images.unsplash.com/photo-1590227632180-80a3bf110871?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" alt={`${game.awayTeam.name} logo`} />
            </div>
          </div>
        </div>
        
        {/* Betting Options */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Money Line */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-3">Money Line</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-3 rounded-md text-sm flex justify-between items-center odds-change-up"
                onClick={() => game.homeTeam?.name && game.odds?.moneyline?.home !== undefined ? 
                  handleAddToBetSlip(`${game.homeTeam.name} (Money Line)`, game.odds.moneyline.home) : 
                  handleAddToBetSlip(`Home Team (Money Line)`, -110)}
              >
                <span>{game.homeTeam.name ? game.homeTeam.name.split(' ').pop() : 'Home'}</span>
                <span className={`font-medium ${game.odds?.moneyline?.home < 0 ? "text-secondary" : ""}`}>
                  {game.odds?.moneyline?.home > 0 ? `+${game.odds.moneyline.home}` : game.odds?.moneyline?.home || 'N/A'}
                </span>
              </Button>
              <Button 
                variant="outline" 
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-3 rounded-md text-sm flex justify-between items-center"
                onClick={() => game.awayTeam?.name && game.odds?.moneyline?.away !== undefined ? 
                  handleAddToBetSlip(`${game.awayTeam.name} (Money Line)`, game.odds.moneyline.away) : 
                  handleAddToBetSlip(`Away Team (Money Line)`, -110)}
              >
                <span>{game.awayTeam.name ? game.awayTeam.name.split(' ').pop() : 'Away'}</span>
                <span className="font-medium">
                  {game.odds?.moneyline?.away > 0 ? `+${game.odds.moneyline.away}` : game.odds?.moneyline?.away || 'N/A'}
                </span>
              </Button>
            </div>
          </div>
          
          {/* Point Spread */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-3">Point Spread</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-3 rounded-md text-sm flex justify-between items-center"
                onClick={() => game.homeTeam?.name && game.odds?.pointSpread?.home?.line !== undefined ? 
                  handleAddToBetSlip(`${game.homeTeam.name} ${game.odds.pointSpread.home.line} (Spread)`, game.odds.pointSpread.home.odds) : 
                  handleAddToBetSlip(`Home Team (Spread)`, -110)}
              >
                <span>
                  {game.homeTeam.name ? game.homeTeam.name.split(' ').pop() : 'Home'} 
                  {game.odds?.pointSpread?.home?.line !== undefined ? game.odds.pointSpread.home.line : ''}
                </span>
                <span className="font-medium">
                  {game.odds?.pointSpread?.home?.odds !== undefined ? 
                    (game.odds.pointSpread.home.odds > 0 ? `+${game.odds.pointSpread.home.odds}` : game.odds.pointSpread.home.odds) 
                    : 'N/A'}
                </span>
              </Button>
              <Button 
                variant="outline" 
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-3 rounded-md text-sm flex justify-between items-center odds-change-down"
                onClick={() => game.awayTeam?.name && game.odds?.pointSpread?.away?.line !== undefined ? 
                  handleAddToBetSlip(`${game.awayTeam.name} ${game.odds.pointSpread.away.line} (Spread)`, game.odds.pointSpread.away.odds) : 
                  handleAddToBetSlip(`Away Team (Spread)`, -110)}
              >
                <span>
                  {game.awayTeam.name ? game.awayTeam.name.split(' ').pop() : 'Away'} 
                  {game.odds?.pointSpread?.away?.line !== undefined ? game.odds.pointSpread.away.line : ''}
                </span>
                <span className={`font-medium ${game.odds?.pointSpread?.away?.odds < 0 ? "text-danger" : ""}`}>
                  {game.odds?.pointSpread?.away?.odds !== undefined ? 
                    (game.odds.pointSpread.away.odds > 0 ? `+${game.odds.pointSpread.away.odds}` : game.odds.pointSpread.away.odds) 
                    : 'N/A'}
                </span>
              </Button>
            </div>
          </div>
          
          {/* Total Points */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-3">Total Points</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-3 rounded-md text-sm flex justify-between items-center"
                onClick={() => game.odds?.total?.over?.line !== undefined ? 
                  handleAddToBetSlip(`Over ${game.odds.total.over.line} (Total)`, game.odds.total.over.odds) : 
                  handleAddToBetSlip(`Over (Total)`, -110)}
              >
                <span>Over {game.odds?.total?.over?.line || 'N/A'}</span>
                <span className="font-medium">
                  {game.odds?.total?.over?.odds !== undefined ? 
                    (game.odds.total.over.odds > 0 ? `+${game.odds.total.over.odds}` : game.odds.total.over.odds) 
                    : 'N/A'}
                </span>
              </Button>
              <Button 
                variant="outline" 
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-3 rounded-md text-sm flex justify-between items-center"
                onClick={() => game.odds?.total?.under?.line !== undefined ? 
                  handleAddToBetSlip(`Under ${game.odds.total.under.line} (Total)`, game.odds.total.under.odds) : 
                  handleAddToBetSlip(`Under (Total)`, -110)}
              >
                <span>Under {game.odds?.total?.under?.line || 'N/A'}</span>
                <span className="font-medium">
                  {game.odds?.total?.under?.odds !== undefined ? 
                    (game.odds.total.under.odds > 0 ? `+${game.odds.total.under.odds}` : game.odds.total.under.odds) 
                    : 'N/A'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* View More Link */}
      <CardFooter className="border-t border-gray-200 dark:border-gray-700 p-3 text-center">
        <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium w-full">
          View All Betting Markets (45+) <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameCard;
