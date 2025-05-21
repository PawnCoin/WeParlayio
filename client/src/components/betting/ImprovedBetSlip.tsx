import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from "@/components/ui/card";
import './betslip-styles.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Trash2, 
  DollarSign, 
  Info, 
  Award, 
  Bookmark,
  Share2
} from 'lucide-react';
import ShareBetSlip from '@/components/social/ShareBetSlip';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define the bet interface
interface Bet {
  id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  betType: 'moneyline' | 'spread' | 'total';
  pick: string;
  odds: number;
  point?: number;
}

// Define saved bet slip interface
interface SavedBetSlip {
  id: string;
  name: string;
  bets: Bet[];
  createdAt: Date;
}

interface ImprovedBetSlipProps {
  betSlip: Bet[];
  onRemoveBet: (id: string) => void;
  onClearBetSlip: () => void;
  onPlaceBet: (amount: string, type: string, boostEnabled: boolean) => void;
}

const ImprovedBetSlip: React.FC<ImprovedBetSlipProps> = ({
  betSlip,
  onRemoveBet,
  onClearBetSlip,
  onPlaceBet
}) => {
  const [betAmount, setBetAmount] = useState<string>("10");
  const [betType, setBetType] = useState<'single' | 'parlay'>('single');
  const [boostEnabled, setBoostEnabled] = useState(false);
  const [savedBetSlips, setSavedBetSlips] = useState<SavedBetSlip[]>([]);
  const [savedSlipName, setSavedSlipName] = useState("");
  const { toast } = useToast();

  // Format odds for display
  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  // Calculate bet details
  const calculateBetDetails = () => {
    if (betSlip.length === 0 || !betAmount || parseFloat(betAmount) <= 0) {
      return {
        individualPayouts: [],
        totalDecimalOdds: 1,
        totalAmericanOdds: 0,
        potentialPayout: 0
      };
    }

    const amount = parseFloat(betAmount);
    const boostMultiplier = boostEnabled ? 1.05 : 1;
    
    // Calculate individual bet payouts and convert odds
    const individualPayouts = betSlip.map(bet => {
      const decimalOdds = bet.odds > 0 ? (bet.odds / 100) + 1 : (100 / Math.abs(bet.odds)) + 1;
      return {
        id: bet.id,
        teamName: bet.pick,
        americanOdds: bet.odds,
        decimalOdds: decimalOdds,
        individualPayout: amount * decimalOdds
      };
    });
    
    if (betType === 'single') {
      // For single bets, just use the first bet
      const odds = betSlip[0].odds;
      const decimalOdds = odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
      return {
        individualPayouts,
        totalDecimalOdds: decimalOdds,
        totalAmericanOdds: odds,
        potentialPayout: amount * decimalOdds * boostMultiplier
      };
    } else {
      // For parlays, multiply all odds
      let totalDecimalOdds = 1;
      betSlip.forEach(bet => {
        const decimalOdds = bet.odds > 0 ? (bet.odds / 100) + 1 : (100 / Math.abs(bet.odds)) + 1;
        totalDecimalOdds *= decimalOdds;
      });
      
      // Convert total decimal odds back to American odds
      let totalAmericanOdds = 0;
      if (totalDecimalOdds > 2) {
        totalAmericanOdds = Math.round((totalDecimalOdds - 1) * 100);
      } else {
        totalAmericanOdds = Math.round(-100 / (totalDecimalOdds - 1));
      }
      
      return {
        individualPayouts,
        totalDecimalOdds,
        totalAmericanOdds,
        potentialPayout: amount * totalDecimalOdds * boostMultiplier
      };
    }
  };
  
  // Calculate potential payout
  const calculatePotentialPayout = () => {
    return calculateBetDetails().potentialPayout;
  };

  // Save current bet slip
  const handleSaveBetSlip = () => {
    if (!savedSlipName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your saved bet slip.",
        variant: "destructive",
      });
      return;
    }

    if (betSlip.length === 0) {
      toast({
        title: "Empty Bet Slip",
        description: "Cannot save an empty bet slip.",
        variant: "destructive",
      });
      return;
    }

    const newSavedSlip: SavedBetSlip = {
      id: Math.random().toString(36).substring(2, 9),
      name: savedSlipName,
      bets: [...betSlip],
      createdAt: new Date(),
    };

    setSavedBetSlips(prev => [...prev, newSavedSlip]);
    setSavedSlipName("");

    toast({
      title: "Bet Slip Saved",
      description: `Your bet slip "${savedSlipName}" has been saved.`,
    });
  };

  // Share bet slip
  const handleShareBetSlip = () => {
    if (betSlip.length === 0) {
      toast({
        title: "Empty Bet Slip",
        description: "Cannot share an empty bet slip.",
        variant: "destructive",
      });
      return;
    }

    // In a real app this would generate a shareable link
    toast({
      title: "Bet Slip Shared",
      description: "A link to your bet slip has been copied to clipboard.",
    });
  };

  // Handle placing bet
  const handlePlaceBet = () => {
    onPlaceBet(betAmount, betType, boostEnabled);
  };

  // Get betting tip based on current bet slip
  const getBettingTip = () => {
    if (betSlip.length === 0) {
      return "Add selections to your bet slip by clicking on odds from the available games.";
    } else if (betSlip.length === 1) {
      return "You can place this as a single bet. Consider your odds and potential payout.";
    } else {
      return betType === 'single' 
        ? "You have multiple selections. Consider switching to a parlay for higher potential returns!"
        : "Parlays offer higher payouts but require all selections to win. Consider your risk tolerance.";
    }
  };

  return (
    <Card className="dark:bg-slate-900 bg-card text-card-foreground dark:text-white betting-slip-container">
      <CardHeader className="py-2 px-3 dark:bg-slate-800 bg-muted flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold">
          <div className="flex items-center text-black dark:text-white">
            <TrendingUp className="h-3 w-3 mr-1 text-primary" />
            Bet Slip {betSlip.length > 0 && `(${betSlip.length})`}
          </div>
        </CardTitle>
        
        <div className="flex items-center gap-1">
          {betSlip.length > 0 && (
            <>
              <ShareBetSlip
                betSlip={betSlip}
                totalOdds={betType === 'single' && betSlip.length > 0
                  ? betSlip[0].odds
                  : betSlip.reduce((total, bet) => {
                    const decimalOdds = bet.odds > 0 
                      ? (bet.odds / 100) + 1 
                      : (100 / Math.abs(bet.odds)) + 1;
                    return total * decimalOdds;
                  }, 1) * 100}
                potentialPayout={calculatePotentialPayout()}
                betAmount={betAmount}
                betType={betType}
              />
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Bookmark className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Save Bet Slip</DialogTitle>
                    <DialogDescription>
                      Save this bet slip for future use.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="betSlipName">Bet Slip Name</Label>
                      <Input
                        id="betSlipName"
                        value={savedSlipName}
                        onChange={(e) => setSavedSlipName(e.target.value)}
                        placeholder="E.g., My NBA Parlay"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" onClick={handleSaveBetSlip}>
                      Save Bet Slip
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearBetSlip}
                className="h-6 text-xs bg-background text-foreground p-1"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-2">
        {betSlip.length === 0 ? (
          <div className="border border-dashed border-muted rounded-md p-2 mb-2 text-center text-muted-foreground text-xs">
            Select odds to add to your bet slip
          </div>
        ) : (
          <>
            <div className="flex gap-1 mb-2">
              <Button 
                variant={betType === 'single' ? "default" : "outline"}
                className={`flex-1 text-xs p-1 h-7 ${betType === 'single' ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                onClick={() => setBetType('single')}
              >
                Singles
              </Button>
              <Button 
                variant={betType === 'parlay' ? "default" : "outline"}
                className={`flex-1 text-xs p-1 h-7 ${betType === 'parlay' ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                onClick={() => setBetType('parlay')}
                disabled={betSlip.length < 2}
              >
                Parlay
              </Button>
            </div>
            
            <div className="max-h-[150px] overflow-y-auto mb-2 bet-selections-container">
              {betSlip.map((bet) => (
                <div 
                  key={bet.id} 
                  className="bet-selection-container border border-muted dark:border-slate-700 rounded-md p-2 mb-1 text-xs bet-selection"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-xs pick-text line-clamp-1">{bet.pick}</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onRemoveBet(bet.id)}
                      className="h-6 w-6 p-0 ml-1 flex-shrink-0 text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs font-medium mb-1 team-text line-clamp-1">
                    {bet.homeTeam} vs {bet.awayTeam}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-semibold bet-type-text">
                      {bet.betType === 'moneyline' ? (
                        <span>Moneyline</span>
                      ) : bet.betType === 'spread' ? (
                        <span>Spread {bet.point && (bet.point > 0 ? '+' : '')}{bet.point}</span>
                      ) : (
                        <span>{bet.pick.includes("O/U") ? "Total" : bet.pick} {bet.point}</span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs odds-badge whitespace-nowrap ml-1">
                      {formatOdds(bet.odds)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        <div className="space-y-2">
          <div>
            <label htmlFor="betAmount" className="text-xs font-medium mb-1 block text-foreground dark:text-gray-300">
              Bet Amount ($)
            </label>
            <Input
              id="betAmount"
              type="number"
              min="1"
              step="1"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="text-xs bg-background dark:bg-gray-700 text-foreground dark:text-white h-7 dark:border-gray-600"
            />
          </div>
          
          <div className="flex items-center space-x-1 odds-boost-switch">
            <Switch 
              id="boost-mode" 
              checked={boostEnabled}
              onCheckedChange={setBoostEnabled}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="boost-mode" className="text-xs flex items-center text-foreground dark:text-gray-300">
              <Award className="h-3 w-3 mr-1 text-yellow-500" />
              5% Odds Boost
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 ml-1 text-muted-foreground dark:text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px] text-xs dark:bg-gray-800 dark:text-white">
                    <p>Using WePlay Token gives you a 5% odds boost on all bets!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
          </div>
          
          {betSlip.length > 0 && (
            <div className="py-1 border-t border-muted dark:border-gray-700">
              {/* For parlay bets, show odds breakdown */}
              {betType === 'parlay' && betSlip.length > 1 && (
                <div className="mb-2 text-xs bg-blue-50 dark:bg-slate-800 rounded-md p-2">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Parlay Breakdown</h4>
                  <div className="space-y-1">
                    {calculateBetDetails().individualPayouts.map((bet, index) => (
                      <div key={bet.id} className="flex justify-between">
                        <span className="text-muted-foreground dark:text-gray-400">{bet.teamName}</span>
                        <span className="font-medium">{formatOdds(bet.americanOdds)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1 border-t border-dashed border-blue-200 dark:border-slate-700">
                      <span className="font-semibold text-black dark:text-white">Combined Odds:</span>
                      <span className="font-semibold text-blue-700 dark:text-blue-300">
                        {formatOdds(calculateBetDetails().totalAmericanOdds)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Potential payout calculation */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-foreground dark:text-white">Potential Payout:</span>
                <span className="text-green-600 dark:text-green-400 font-bold text-xs">
                  ${calculatePotentialPayout().toFixed(2)}
                </span>
              </div>
              
              {/* If boost is enabled, show the bonus amount */}
              {boostEnabled && (
                <div className="flex justify-between items-center text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  <span className="flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    5% Boost Bonus:
                  </span>
                  <span>+${(calculatePotentialPayout() - (calculatePotentialPayout() / 1.05)).toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
          
          <Button 
            className="w-full text-white text-xs py-2 h-9 font-semibold place-bet-button" 
            disabled={betSlip.length === 0 || parseFloat(betAmount) <= 0}
            onClick={handlePlaceBet}
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Place {betType === 'parlay' ? 'Parlay' : 'Bet'}
          </Button>
        </div>
        
        <div className="mt-2 p-2 bg-blue-50 dark:bg-gray-800 rounded-md text-xs hidden md:block border border-transparent dark:border-gray-700">
          <div className="flex items-start">
            <Info className="h-3 w-3 mr-1 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-blue-800 dark:text-blue-300">
              <p className="font-semibold mb-0.5 text-xs">Tip</p>
              <p className="text-xs">{getBettingTip()}</p>
            </div>
          </div>
        </div>

        {savedBetSlips.length > 0 && (
          <div className="mt-2 hidden md:block">
            <Tabs defaultValue="saved">
              <TabsList className="w-full dark:bg-gray-800">
                <TabsTrigger value="saved" className="w-full text-xs dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Saved ({savedBetSlips.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="saved" className="p-1">
                <div className="max-h-[120px] overflow-y-auto">
                  {savedBetSlips.map((slip) => (
                    <div 
                      key={slip.id} 
                      className="border border-muted dark:border-gray-700 rounded-md p-2 mb-1 text-xs cursor-pointer hover:border-primary dark:bg-gray-800 dark:text-white"
                    >
                      <div className="font-medium text-xs">{slip.name}</div>
                      <div className="text-xs text-muted-foreground dark:text-gray-400 mt-0.5">
                        {slip.bets.length} selection{slip.bets.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex justify-end mt-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-6 py-0 px-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                          onClick={() => {
                            // Load this saved bet slip
                            toast({
                              title: "Saved Slip Loaded",
                              description: `${slip.name} has been loaded.`
                            });
                          }}
                        >
                          Load
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImprovedBetSlip;