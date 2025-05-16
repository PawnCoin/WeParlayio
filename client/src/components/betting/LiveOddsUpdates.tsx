import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBetSlip } from '@/contexts/BetSlipContext';

interface OddsUpdate {
  id: string;
  homeTeam: string;
  awayTeam: string;
  market: string;
  oldOdds: number;
  newOdds: number;
  timestamp: Date;
}

const LiveOddsUpdates: React.FC = () => {
  const [oddsUpdates, setOddsUpdates] = useState<OddsUpdate[]>([]);
  const { betSlip } = useBetSlip();
  
  // Format odds for display (American format)
  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };
  
  // Determine the trend of odds change
  const getOddsTrend = (oldOdds: number, newOdds: number): 'up' | 'down' | 'neutral' => {
    // For American odds, a higher positive number or a less negative number is worse odds
    if (oldOdds > 0 && newOdds > 0) {
      return newOdds > oldOdds ? 'down' : 'up';
    } else if (oldOdds < 0 && newOdds < 0) {
      return newOdds < oldOdds ? 'down' : 'up';
    } else if (oldOdds <= 0 && newOdds > 0) {
      return 'down';
    } else if (oldOdds >= 0 && newOdds < 0) {
      return 'up';
    }
    return 'neutral';
  };
  
  // Function to format the time (e.g., "2 minutes ago")
  const formatTime = (timestamp: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 5) {
      return 'just now';
    } else if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }
  };
  
  // Simulate receiving live odds updates
  useEffect(() => {
    // Sample teams for simulated updates
    const teams = [
      { home: "Los Angeles Lakers", away: "Golden State Warriors" },
      { home: "Boston Celtics", away: "Miami Heat" },
      { home: "Philadelphia 76ers", away: "Milwaukee Bucks" },
      { home: "Brooklyn Nets", away: "Atlanta Hawks" },
      { home: "Denver Nuggets", away: "Phoenix Suns" }
    ];
    
    // Sample markets for simulated updates
    const markets = [
      "Moneyline Home",
      "Moneyline Away",
      "Spread Home -4.5",
      "Spread Away +4.5",
      "Total Over 224.5",
      "Total Under 224.5"
    ];
    
    // Function to generate a random odds update
    const generateRandomUpdate = (): OddsUpdate => {
      const team = teams[Math.floor(Math.random() * teams.length)];
      const market = markets[Math.floor(Math.random() * markets.length)];
      const oldOdds = Math.random() > 0.5 
        ? Math.floor(Math.random() * 300) + 100 // Positive odds
        : -1 * (Math.floor(Math.random() * 300) + 100); // Negative odds
      
      // Small change in odds
      const oddsChange = Math.floor(Math.random() * 30) - 15;
      const newOdds = oldOdds + oddsChange;
      
      return {
        id: Math.random().toString(36).substring(2, 9),
        homeTeam: team.home,
        awayTeam: team.away,
        market,
        oldOdds,
        newOdds,
        timestamp: new Date()
      };
    };
    
    // Initially add a few updates
    const initialUpdates = Array(5).fill(0).map(() => generateRandomUpdate());
    setOddsUpdates(initialUpdates);
    
    // Periodically add new updates
    const interval = setInterval(() => {
      // Add a new update at the beginning
      const newUpdate = generateRandomUpdate();
      
      setOddsUpdates(prev => {
        // Keep only the latest 20 updates
        const updatedList = [newUpdate, ...prev].slice(0, 20);
        return updatedList;
      });
    }, 8000); // Every 8 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Filter odds updates for teams in bet slip
  const getRelevantUpdates = () => {
    if (betSlip.length === 0) {
      return oddsUpdates;
    }
    
    // Get all teams from bet slip
    const betSlipTeams = new Set(
      betSlip.flatMap(bet => [bet.homeTeam, bet.awayTeam])
    );
    
    // Filter updates for teams in bet slip
    return oddsUpdates.filter(update => 
      betSlipTeams.has(update.homeTeam) || betSlipTeams.has(update.awayTeam)
    );
  };
  
  const relevantUpdates = getRelevantUpdates();
  
  return (
    <Card className="w-full">
      <CardHeader className="py-3 px-4 bg-muted">
        <CardTitle className="text-base font-bold flex items-center">
          <Zap className="h-4 w-4 mr-2 text-yellow-500" />
          Live Odds Updates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {relevantUpdates.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No recent odds updates to display
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="p-4 space-y-2">
              <AnimatePresence>
                {relevantUpdates.map((update) => {
                  const trend = getOddsTrend(update.oldOdds, update.newOdds);
                  
                  return (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border border-muted rounded-md p-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium">
                            {update.homeTeam} vs {update.awayTeam}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {update.market}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs"
                        >
                          {formatTime(update.timestamp)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center mt-2">
                        <div className="text-sm mr-2">
                          {formatOdds(update.oldOdds)} →
                        </div>
                        <div className={`text-sm font-medium flex items-center ${
                          trend === 'up' ? 'text-green-600' : 
                          trend === 'down' ? 'text-red-500' : ''
                        }`}>
                          {formatOdds(update.newOdds)}
                          {trend === 'up' && (
                            <ArrowUpRight className="h-3 w-3 ml-1 text-green-600" />
                          )}
                          {trend === 'down' && (
                            <ArrowDownRight className="h-3 w-3 ml-1 text-red-500" />
                          )}
                          {trend === 'neutral' && (
                            <Minus className="h-3 w-3 ml-1" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveOddsUpdates;