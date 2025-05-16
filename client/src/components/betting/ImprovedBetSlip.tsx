import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle 
} from "@/components/ui/card";
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

  // Calculate potential payout
  const calculatePotentialPayout = () => {
    if (betSlip.length === 0 || !betAmount || parseFloat(betAmount) <= 0) {
      return 0;
    }

    const amount = parseFloat(betAmount);
    const boostMultiplier = boostEnabled ? 1.05 : 1;

    if (betType === 'single') {
      // For single bets, just use the first bet
      const odds = betSlip[0].odds;
      return amount * (odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1) * boostMultiplier;
    } else {
      // For parlays, multiply all odds
      let totalOdds = 1;
      betSlip.forEach(bet => {
        const decimalOdds = bet.odds > 0 ? (bet.odds / 100) + 1 : (100 / Math.abs(bet.odds)) + 1;
        totalOdds *= decimalOdds;
      });
      return amount * totalOdds * boostMultiplier;
    }
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
    <Card className="bg-card text-card-foreground">
      <CardHeader className="py-3 px-4 bg-muted flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">
          <div className="flex items-center text-foreground">
            <TrendingUp className="h-4 w-4 mr-2 text-primary" />
            Enhanced Bet Slip {betSlip.length > 0 && `(${betSlip.length})`}
          </div>
        </CardTitle>
        
        <div className="flex items-center gap-2">
          {betSlip.length > 0 && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShareBetSlip}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share bet slip with friends</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Bookmark className="h-4 w-4" />
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
                className="h-8 text-xs bg-background text-foreground"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {betSlip.length === 0 ? (
          <div className="border border-dashed border-muted rounded-md p-4 mb-4 text-center text-muted-foreground text-sm">
            Select odds to add to your bet slip
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <Button 
                variant={betType === 'single' ? "default" : "outline"}
                className={`flex-1 text-xs ${betType === 'single' ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                onClick={() => setBetType('single')}
              >
                Singles
              </Button>
              <Button 
                variant={betType === 'parlay' ? "default" : "outline"}
                className={`flex-1 text-xs ${betType === 'parlay' ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                onClick={() => setBetType('parlay')}
                disabled={betSlip.length < 2}
              >
                Parlay
              </Button>
            </div>
            
            <div className="max-h-[240px] overflow-y-auto mb-4">
              {betSlip.map((bet) => (
                <div 
                  key={bet.id} 
                  className="border border-muted rounded-md p-3 mb-2 text-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-foreground">{bet.pick}</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onRemoveBet(bet.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {bet.homeTeam} vs {bet.awayTeam}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-foreground">
                      {bet.betType === 'moneyline' ? (
                        <span>Moneyline</span>
                      ) : bet.betType === 'spread' ? (
                        <span>Spread {bet.point && (bet.point > 0 ? '+' : '')}{bet.point}</span>
                      ) : (
                        <span>{bet.pick.includes("O/U") ? "Total" : bet.pick} {bet.point}</span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs bg-background text-foreground">
                      {formatOdds(bet.odds)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        <div className="space-y-3">
          <div>
            <label htmlFor="betAmount" className="text-xs font-medium mb-1 block text-foreground">
              Bet Amount ($)
            </label>
            <Input
              id="betAmount"
              type="number"
              min="1"
              step="1"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="text-sm bg-background text-foreground"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="boost-mode" 
              checked={boostEnabled}
              onCheckedChange={setBoostEnabled}
            />
            <Label htmlFor="boost-mode" className="text-xs flex items-center">
              <Award className="h-3 w-3 mr-1 text-yellow-500" />
              Apply 5% Odds Boost
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 ml-1 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px] text-xs">
                    <p>Using WePlay Token gives you a 5% odds boost on all bets!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
          </div>
          
          {betSlip.length > 0 && (
            <div className="flex justify-between py-2 border-t border-muted">
              <span className="text-sm font-medium text-foreground">Potential Payout:</span>
              <span className="text-green-600 dark:text-green-400 font-bold">
                ${calculatePotentialPayout().toFixed(2)}
              </span>
            </div>
          )}
          
          <Button 
            className="w-full bg-primary text-white" 
            disabled={betSlip.length === 0 || parseFloat(betAmount) <= 0}
            onClick={handlePlaceBet}
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Place {betType === 'parlay' ? 'Parlay' : 'Bet'}
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-xs">
          <div className="flex items-start">
            <Info className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-blue-800 dark:text-blue-300">
              <p className="font-semibold mb-1">Betting Tip</p>
              <p>{getBettingTip()}</p>
            </div>
          </div>
        </div>

        {savedBetSlips.length > 0 && (
          <div className="mt-4">
            <Tabs defaultValue="saved">
              <TabsList className="w-full">
                <TabsTrigger value="saved" className="w-full">Saved Bets ({savedBetSlips.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="saved" className="p-2">
                <div className="max-h-[200px] overflow-y-auto">
                  {savedBetSlips.map((slip) => (
                    <div 
                      key={slip.id} 
                      className="border border-muted rounded-md p-3 mb-2 text-sm cursor-pointer hover:border-primary"
                    >
                      <div className="font-medium">{slip.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {slip.bets.length} selection{slip.bets.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex justify-end mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-7"
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