import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown, Percent, DollarSign, Info, BarChart3, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

// Risk level definitions
const RISK_LEVELS = [
  { name: "Very Safe", range: [1, 1.5], color: "bg-green-500", description: "Low risk, lower returns" },
  { name: "Safe", range: [1.5, 2], color: "bg-green-400", description: "Modest risk, modest returns" },
  { name: "Balanced", range: [2, 3], color: "bg-blue-500", description: "Medium risk, medium returns" },
  { name: "Aggressive", range: [3, 5], color: "bg-orange-500", description: "Higher risk, higher returns" },
  { name: "Very Aggressive", range: [5, 1000], color: "bg-red-500", description: "Highest risk, potential for significant returns" },
];

const BetRiskCalculator: React.FC = () => {
  const [betAmount, setBetAmount] = useState<number>(10);
  const [odds, setOdds] = useState<number>(2.0);
  const [riskLevel, setRiskLevel] = useState<string>("");
  const [riskColor, setRiskColor] = useState<string>("bg-blue-500");
  const [potentialWinnings, setPotentialWinnings] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("american");
  const [americanOdds, setAmericanOdds] = useState<string>("+100");
  const [isUp, setIsUp] = useState<boolean>(true);

  // Convert odds between formats
  const convertOdds = (value: number | string, from: string, to: string) => {
    let decimalOdds = 0;

    // Convert to decimal
    if (from === "american") {
      const americanValue = typeof value === 'string' ? parseInt(value.replace(/[+\\-]/g, '')) : 0;
      if (value.toString().startsWith('+')) {
        decimalOdds = (americanValue / 100) + 1;
      } else {
        decimalOdds = (100 / americanValue) + 1;
      }
    } else if (from === "decimal") {
      decimalOdds = typeof value === 'number' ? value : parseFloat(value);
    } else if (from === "fractional") {
      const [numerator, denominator] = value.toString().split('/').map(num => parseInt(num));
      decimalOdds = (numerator / denominator) + 1;
    }

    // Convert from decimal to target format
    if (to === "american") {
      if (decimalOdds >= 2) {
        return `+${Math.round((decimalOdds - 1) * 100)}`;
      } else {
        return `-${Math.round(100 / (decimalOdds - 1))}`;
      }
    } else if (to === "decimal") {
      return decimalOdds;
    } else if (to === "fractional") {
      const fraction = decimalOdds - 1;
      // This is a simplified conversion - real-world might need more sophistication
      if (fraction === 0.5) return "1/2";
      if (fraction === 1) return "1/1";
      if (fraction === 1.5) return "3/2";
      if (fraction === 2) return "2/1";
      // Default fallback
      return `${Math.round(fraction * 100)}/100`;
    }

    return decimalOdds;
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Convert current decimal odds to the new format
    if (value === "american") {
      setAmericanOdds(convertOdds(odds, "decimal", "american") as string);
    } else if (value === "fractional") {
      // Handle fractional odds display if needed
    }
  };

  // Handle odds input change
  const handleOddsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeTab === "decimal") {
      const newOdds = parseFloat(e.target.value);
      if (!isNaN(newOdds) && newOdds > 1) {
        setOdds(newOdds);
        setAmericanOdds(convertOdds(newOdds, "decimal", "american") as string);
      }
    } else if (activeTab === "american") {
      setAmericanOdds(e.target.value);
      
      // Extract numeric part and sign
      const sign = e.target.value.startsWith('-') ? -1 : 1;
      const numericValue = parseInt(e.target.value.replace(/[+\\-]/g, ''));
      
      if (!isNaN(numericValue)) {
        let decimalOdds;
        if (sign > 0) {
          decimalOdds = (numericValue / 100) + 1;
        } else {
          decimalOdds = (100 / numericValue) + 1;
        }
        setOdds(decimalOdds);
      }
    }
  };

  // Increment/decrement odds
  const adjustOdds = (increment: boolean) => {
    let newOdds;
    if (increment) {
      newOdds = odds + 0.1;
      setIsUp(true);
    } else {
      newOdds = Math.max(1.1, odds - 0.1);
      setIsUp(false);
    }
    setOdds(parseFloat(newOdds.toFixed(2)));
    setAmericanOdds(convertOdds(newOdds, "decimal", "american") as string);
  };

  // Calculate potential winnings
  useEffect(() => {
    const winnings = betAmount * odds - betAmount;
    setPotentialWinnings(parseFloat(winnings.toFixed(2)));
    
    // Determine risk level
    for (const level of RISK_LEVELS) {
      if (odds >= level.range[0] && odds <= level.range[1]) {
        setRiskLevel(level.name);
        setRiskColor(level.color);
        break;
      }
    }
  }, [betAmount, odds]);

  // Trigger celebration animation when winnings exceed certain thresholds
  useEffect(() => {
    if (potentialWinnings > 100 && !showCelebration) {
      setShowCelebration(true);
      
      // Trigger celebration with confetti
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const triggerConfetti = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0.5, y: 0.7 },
          colors: ['#5D3FD3', '#00BFFF', '#FF69B4'],
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(triggerConfetti);
        } else {
          setTimeout(() => setShowCelebration(false), 1000);
        }
      };
      
      triggerConfetti();
    }
  }, [potentialWinnings, showCelebration]);

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardTitle className="flex items-center justify-between">
          <span>Bet Risk Calculator</span>
          <BarChart3 className="h-5 w-5" />
        </CardTitle>
        <CardDescription className="text-blue-100">
          Calculate potential returns and analyze your betting risk
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        {/* Bet amount input */}
        <div className="space-y-2">
          <Label htmlFor="bet-amount" className="text-sm font-medium flex items-center gap-1">
            <DollarSign className="h-4 w-4" /> Bet Amount
          </Label>
          <div className="flex items-center space-x-3">
            <Slider
              value={[betAmount]}
              min={1}
              max={1000}
              step={1}
              onValueChange={(values) => setBetAmount(values[0])}
              className="flex-1"
            />
            <Input
              id="bet-amount"
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(parseInt(e.target.value) || 1)}
              className="w-20"
            />
          </div>
        </div>
        
        {/* Odds input with different formats */}
        <div className="space-y-2">
          <Label htmlFor="odds" className="text-sm font-medium flex items-center gap-1">
            <Percent className="h-4 w-4" /> Odds
          </Label>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="decimal">Decimal</TabsTrigger>
              <TabsTrigger value="american">American</TabsTrigger>
              <TabsTrigger value="fractional">Fractional</TabsTrigger>
            </TabsList>
            
            <TabsContent value="decimal" className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="flex flex-1 items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-r-none"
                    onClick={() => adjustOdds(false)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Input
                    id="odds"
                    type="number"
                    value={odds.toFixed(2)}
                    onChange={handleOddsChange}
                    className="rounded-none text-center w-full"
                    step="0.1"
                    min="1.1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-l-none"
                    onClick={() => adjustOdds(true)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
                <AnimatePresence>
                  <motion.div
                    key={isUp ? "up" : "down"}
                    initial={{ opacity: 0, y: isUp ? 10 : -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-sm font-semibold ${isUp ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {isUp ? "↑" : "↓"}
                  </motion.div>
                </AnimatePresence>
              </div>
            </TabsContent>
            
            <TabsContent value="american" className="space-y-2">
              <Input
                id="american-odds"
                value={americanOdds}
                onChange={handleOddsChange}
                className="text-center"
              />
            </TabsContent>
            
            <TabsContent value="fractional" className="space-y-2">
              <Input
                id="fractional-odds"
                value={convertOdds(odds, "decimal", "fractional") as string}
                readOnly
                className="text-center"
              />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Risk level indicator */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="mb-2 flex justify-between items-center">
            <h3 className="text-sm font-medium">Risk Level</h3>
            <span className={`px-2 py-1 text-xs text-white rounded-full ${riskColor}`}>
              {riskLevel}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-300">
            <motion.div
              className={`h-2 rounded-full ${riskColor}`}
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(100, (odds / 10) * 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-6 flex flex-col gap-4">
        <div className="w-full rounded-lg bg-gray-100 p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Potential Winnings:</span>
            <motion.span
              key={potentialWinnings}
              className="text-xl font-bold text-green-600"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.3 }}
            >
              ${potentialWinnings.toFixed(2)}
            </motion.span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-medium">Total Return:</span>
            <span className="text-gray-700 font-semibold">
              ${(betAmount + potentialWinnings).toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Info className="h-4 w-4 mr-2" />
          <span>Higher odds mean higher risk but potentially higher rewards.</span>
        </div>
        
        {odds > 5 && (
          <div className="flex items-center text-sm text-orange-500 bg-orange-50 p-2 rounded">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>Caution: These odds represent a high-risk bet.</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default BetRiskCalculator;