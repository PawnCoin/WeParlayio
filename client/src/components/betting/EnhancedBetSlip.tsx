import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Trash2, Bookmark, Share2, BarChart3, DollarSign, Info, AlertCircle, Award } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import confetti from 'canvas-confetti';

interface Bet {
  id: string;
  pick: string;
  homeTeam: string;
  awayTeam: string;
  odds: number;
  betType: string;
  point?: number;
  sportId: number;
}

interface EnhancedBetSlipProps {
  betSlip: Bet[];
  onRemoveBet: (id: string) => void;
  onClearBetSlip: () => void;
  onPlaceBet: (amount: string, betType: string, boostEnabled: boolean) => void;
  onSaveBetSlip: (name: string) => void;
  onShareBetSlip: () => void;
}

const EnhancedBetSlip: React.FC<EnhancedBetSlipProps> = ({
  betSlip,
  onRemoveBet,
  onClearBetSlip,
  onPlaceBet,
  onSaveBetSlip,
  onShareBetSlip
}) => {
  const [betAmount, setBetAmount] = useState("10");
  const [betType, setBetType] = useState<'single' | 'parlay'>('single');
  const [boostEnabled, setBoostEnabled] = useState(false);
  const [savedSlipName, setSavedSlipName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  // Format odds (American to display format)
  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  // Calculate potential payout based on bet amount and odds
  const calculatePotentialPayout = () => {
    if (betSlip.length === 0 || !betAmount || parseFloat(betAmount) <= 0) {
      return 0;
    }

    const amount = parseFloat(betAmount);
    
    // Apply boost if enabled (5% boost)
    const boostMultiplier = boostEnabled ? 1.05 : 1;

    if (betType === 'single') {
      // For single bets, just calculate the first bet in the slip
      const odds = betSlip[0].odds;
      return amount * (odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1) * boostMultiplier;
    } else {
      // For parlays, multiply all the odds together
      let totalOdds = 1;
      betSlip.forEach(bet => {
        const decimalOdds = bet.odds > 0 ? (bet.odds / 100) + 1 : (100 / Math.abs(bet.odds)) + 1;
        totalOdds *= decimalOdds;
      });
      return amount * totalOdds * boostMultiplier;
    }
  };

  // Show tips based on bet slip state
  const getBettingTip = () => {
    if (betSlip.length === 0) {
      return "Add selections to your bet slip by clicking on odds from the available games.";
    } else if (betSlip.length === 1) {
      return "You can place this as a single bet. Consider your odds and potential payout before confirming.";
    } else {
      return betType === 'single' 
        ? "You have multiple selections. Consider switching to a parlay for higher potential returns!"
        : "Parlays offer higher payouts but require all selections to win. Consider your risk tolerance.";
    }
  };

  const handlePlaceBet = () => {
    if (betSlip.length === 0 || parseFloat(betAmount) <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please add selections to your bet slip and enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    // Trigger confetti effect for successful bets
    setShowConfetti(true);
    const end = Date.now() + 1000;
    const colors = ['#22c55e', '#0ea5e9', '#f59e0b'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0.05, y: 0.7 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 0.95, y: 0.7 },
        colors: colors
      });
    
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    requestAnimationFrame(frame);

    onPlaceBet(betAmount, betType, boostEnabled);
  };

  const handleSaveBetSlip = () => {
    if (!savedSlipName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your saved bet slip.",
        variant: "destructive",
      });
      return;
    }
    
    onSaveBetSlip(savedSlipName);
    
    toast({
      title: "Bet Slip Saved",
      description: `Your bet slip "${savedSlipName}" has been saved for future use.`,
    });
    
    setSavedSlipName("");
  };

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader className="py-3 px-4 bg-muted flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">
          <div className="flex items-center text-foreground">
            <TrendingUp className="h-4 w-4 mr-2 text-primary" />
            Bet Slip {betSlip.length > 0 && `(${betSlip.length})`}
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
                      onClick={onShareBetSlip}
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
            
            <ScrollArea className="h-[240px] mb-4">
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
            </ScrollArea>
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
            <AlertCircle className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-blue-800 dark:text-blue-300">
              <p className="font-semibold mb-1">Betting Tip</p>
              <p>{getBettingTip()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedBetSlip;