import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface UpcomingGameCardProps {
  game: {
    id: number;
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
    odds: {
      homeSpread: {
        line: number;
        odds: number;
      };
      awaySpread: {
        line: number;
        odds: number;
      };
      total: {
        line: number;
        odds: number;
      };
    };
  };
}

const UpcomingGameCard: React.FC<UpcomingGameCardProps> = ({ game }) => {
  const { toast } = useToast();
  
  const handleAddToBetSlip = (selection: string, odds: number) => {
    toast({
      title: "Added to Bet Slip",
      description: `${selection} at ${odds > 0 ? '+' : ''}${odds}`
    });
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
    <Card className="mb-4">
      <CardContent className="p-4">
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
          <Button 
            variant="outline" 
            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-3 rounded-md text-xs flex justify-between items-center"
            onClick={() => handleAddToBetSlip(`${game.homeTeam.name} ${game.odds.homeSpread.line} (Spread)`, game.odds.homeSpread.odds)}
          >
            <span>{game.homeTeam.name.split(' ').pop()} {game.odds.homeSpread.line}</span>
            <span className="font-medium">
              {game.odds.homeSpread.odds > 0 ? `+${game.odds.homeSpread.odds}` : game.odds.homeSpread.odds}
            </span>
          </Button>
          <Button 
            variant="outline" 
            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-3 rounded-md text-xs flex justify-between items-center"
            onClick={() => handleAddToBetSlip(`${game.awayTeam.name} ${game.odds.awaySpread.line} (Spread)`, game.odds.awaySpread.odds)}
          >
            <span>{game.awayTeam.name.split(' ').pop()} {game.odds.awaySpread.line}</span>
            <span className="font-medium">
              {game.odds.awaySpread.odds > 0 ? `+${game.odds.awaySpread.odds}` : game.odds.awaySpread.odds}
            </span>
          </Button>
          <Button 
            variant="outline" 
            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 px-3 rounded-md text-xs flex justify-between items-center"
            onClick={() => handleAddToBetSlip(`O/U ${game.odds.total.line} (Total)`, game.odds.total.odds)}
          >
            <span>O/U {game.odds.total.line}</span>
            <span className="font-medium">
              {game.odds.total.odds > 0 ? `+${game.odds.total.odds}` : game.odds.total.odds}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingGameCard;
