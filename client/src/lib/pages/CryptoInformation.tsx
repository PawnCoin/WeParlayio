import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import WalletSecurityFAQ from "@/components/security/WalletSecurityFAQ";
import GasFeeEstimator from "@/components/wallet/GasFeeEstimator";
import { DollarSign, BitcoinIcon, Landmark, BarChart2, Wallet, TrendingUp, ReceiptText, Info, RefreshCw, AlertCircle } from "lucide-react";

// Custom Bitcoin icon
const Bitcoin = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11.767 19.089c4.924.868 9.593-2.535 10.461-7.459.868-4.924-2.535-9.593-7.459-10.461-4.924-.868-9.593 2.535-10.461 7.459-.868 4.924 2.535 9.593 7.459 10.461z" />
    <path d="M15.5 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <path d="M10 19 6.5 12 10 5" />
  </svg>
);

// Create table for odds conversion
const OddsConversionTable: React.FC = () => {
  const [stake, setStake] = useState<string>("100");
  const [oddsFormat, setOddsFormat] = useState<string>("decimal");
  
  // Sample odds for different bet types
  const sampleOdds = [
    { type: "Moneyline Favorite", decimal: 1.74, american: -135, fraction: "3/4", implied: 57.5, payout: { usd: 174, btc: 0.00348, eth: 0.0435 } },
    { type: "Moneyline Underdog", decimal: 2.20, american: 120, fraction: "6/5", implied: 45.5, payout: { usd: 220, btc: 0.0044, eth: 0.055 } },
    { type: "Point Spread -7.5", decimal: 1.91, american: -110, fraction: "10/11", implied: 52.4, payout: { usd: 191, btc: 0.00382, eth: 0.04775 } },
    { type: "Total Over 220.5", decimal: 1.95, american: -105, fraction: "19/20", implied: 51.3, payout: { usd: 195, btc: 0.0039, eth: 0.04875 } },
    { type: "Parlay (3 Team)", decimal: 6.05, american: 505, fraction: "5.05/1", implied: 16.5, payout: { usd: 605, btc: 0.0121, eth: 0.15125 } },
  ];
  
  // Format odds based on selected format
  const formatOdds = (decimalOdds: number, format: string) => {
    switch (format) {
      case "decimal":
        return decimalOdds.toFixed(2);
      case "american":
        return decimalOdds >= 2 
          ? `+${Math.round((decimalOdds - 1) * 100)}` 
          : `${Math.round(-100 / (decimalOdds - 1))}`;
      case "fraction":
        const getGCD = (a: number, b: number): number => {
          return b ? getGCD(b, a % b) : a;
        };
        
        // Convert decimal odds to fraction
        const decimal = Math.round((decimalOdds - 1) * 100);
        const numerator = decimal;
        const denominator = 100;
        const gcd = getGCD(numerator, denominator);
        
        return `${numerator/gcd}/${denominator/gcd}`;
      case "implied":
        return `${Math.round((1 / decimalOdds) * 100)}%`;
      default:
        return decimalOdds.toFixed(2);
    }
  };
  
  // Calculate payout based on stake and odds
  const calculatePayout = (stakeValue: number, decimalOdds: number, currency: string) => {
    const payout = stakeValue * decimalOdds;
    
    // Convert to cryptocurrency if needed
    if (currency === "btc") {
      return (payout * 0.00002).toFixed(8); // Mock BTC conversion
    } else if (currency === "eth") {
      return (payout * 0.00025).toFixed(6); // Mock ETH conversion
    }
    
    return payout.toFixed(2);
  };
  
  // Handle stake changes
  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isNaN(Number(value)) || value === "") {
      setStake(value);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ReceiptText className="h-5 w-5 mr-2 text-primary" />
          Cryptocurrency Odds Converter
        </CardTitle>
        <CardDescription>
          Compare how odds are represented across different formats and potential cryptocurrency returns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Stake Amount (USD)</label>
            <Input 
              type="text" 
              value={stake} 
              onChange={handleStakeChange}
              placeholder="Enter stake amount"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Odds Format</label>
            <select 
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
              value={oddsFormat}
              onChange={(e) => setOddsFormat(e.target.value)}
            >
              <option value="decimal">Decimal (European)</option>
              <option value="american">American</option>
              <option value="fraction">Fractional (UK)</option>
              <option value="implied">Implied Probability</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-sm font-medium">Bet Type</th>
                <th className="text-left py-2 px-3 text-sm font-medium">Odds</th>
                <th className="text-right py-2 px-3 text-sm font-medium">USD Payout</th>
                <th className="text-right py-2 px-3 text-sm font-medium">BTC Equivalent</th>
                <th className="text-right py-2 px-3 text-sm font-medium">ETH Equivalent</th>
              </tr>
            </thead>
            <tbody>
              {sampleOdds.map((odd, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                  <td className="py-2 px-3 text-sm">{odd.type}</td>
                  <td className="py-2 px-3 text-sm font-medium">{formatOdds(odd.decimal, oddsFormat)}</td>
                  <td className="py-2 px-3 text-sm text-right">
                    <div className="flex items-center justify-end">
                      <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                      <span>{calculatePayout(Number(stake) || 0, odd.decimal, "usd")}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-sm text-right">
                    <div className="flex items-center justify-end">
                      <Bitcoin />
                      <span className="ml-1">{calculatePayout(Number(stake) || 0, odd.decimal, "btc")}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-sm text-right">
                    <div className="flex items-center justify-end">
                      <BitcoinIcon className="h-3 w-3 mr-1 text-blue-500" />
                      <span>{calculatePayout(Number(stake) || 0, odd.decimal, "eth")}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <Alert className="mt-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Understanding Cryptocurrency Returns</AlertTitle>
          <AlertDescription>
            <p className="mt-1">
              When betting with cryptocurrency, your potential returns are subject to price volatility. Your bet is placed using the current exchange rate, but the value of your winnings may change by the time you withdraw.
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

// Price Volatility Simulator
const PriceVolatilitySimulator: React.FC = () => {
  const [betAmount, setBetAmount] = useState<string>("0.1");
  const [currency, setCurrency] = useState<string>("ETH");
  const [priceChange, setPriceChange] = useState<number>(0);
  
  // Currency options
  const currencies = [
    { symbol: "BTC", name: "Bitcoin", price: 68521, volatility: "High" },
    { symbol: "ETH", name: "Ethereum", price: 3952, volatility: "Medium-High" },
    { symbol: "SOL", name: "Solana", price: 146.52, volatility: "High" },
    { symbol: "USDT", name: "Tether", price: 1.00, volatility: "Very Low" },
    { symbol: "USDC", name: "USD Coin", price: 1.00, volatility: "Very Low" },
  ];
  
  // Get selected currency details
  const selectedCurrency = currencies.find(c => c.symbol === currency);
  
  // Handle betting simulation
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!isNaN(Number(value)) || value === "") {
      setBetAmount(value);
    }
  };
  
  // Handle price change simulation
  const handlePriceChange = (value: number) => {
    setPriceChange(value);
  };
  
  // Calculate USD value
  const calculateUsdValue = (amount: number, currencySymbol: string) => {
    const curr = currencies.find(c => c.symbol === currencySymbol);
    if (!curr) return {
      initial: 0,
      final: 0,
      difference: 0
    };
    
    const baseValue = amount * curr.price;
    const adjustedValue = baseValue * (1 + priceChange / 100);
    
    return {
      initial: baseValue,
      final: adjustedValue,
      difference: adjustedValue - baseValue
    };
  };
  
  const amount = Number(betAmount) || 0;
  const usdValue = calculateUsdValue(amount, currency);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Cryptocurrency Price Volatility Simulator
        </CardTitle>
        <CardDescription>
          See how price changes affect the value of your bets over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Bet Amount</label>
            <div className="flex">
              <Input 
                type="text" 
                value={betAmount} 
                onChange={handleBetAmountChange}
                className="flex-1"
              />
              <select 
                className="w-24 px-2 rounded-md border border-input bg-background ml-2"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {currencies.map(curr => (
                  <option key={curr.symbol} value={curr.symbol}>{curr.symbol}</option>
                ))}
              </select>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Current price: ${selectedCurrency?.price.toLocaleString()} per {selectedCurrency?.symbol}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Price Change Simulation</label>
            <div className="flex items-center">
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-md border"
                onClick={() => handlePriceChange(Math.max(-50, priceChange - 5))}
              >
                -
              </button>
              <div className="px-3 flex-1 text-center font-medium">
                {priceChange > 0 ? '+' : ''}{priceChange}%
              </div>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-md border"
                onClick={() => handlePriceChange(Math.min(100, priceChange + 5))}
              >
                +
              </button>
            </div>
            <div className="flex justify-between mt-2">
              <button 
                className="text-xs px-1.5 py-0.5 rounded border"
                onClick={() => handlePriceChange(-20)}
              >
                -20%
              </button>
              <button 
                className="text-xs px-1.5 py-0.5 rounded border"
                onClick={() => handlePriceChange(-10)}
              >
                -10%
              </button>
              <button 
                className="text-xs px-1.5 py-0.5 rounded border"
                onClick={() => handlePriceChange(0)}
              >
                0%
              </button>
              <button 
                className="text-xs px-1.5 py-0.5 rounded border"
                onClick={() => handlePriceChange(10)}
              >
                +10%
              </button>
              <button 
                className="text-xs px-1.5 py-0.5 rounded border"
                onClick={() => handlePriceChange(20)}
              >
                +20%
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Initial USD Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${usdValue.initial.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                When placing the bet
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Final USD Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${usdValue.final.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                After {priceChange}% price change
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Value Difference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${usdValue.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {usdValue.difference >= 0 ? '+' : ''}{usdValue.difference.toFixed(2)} USD
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.abs(usdValue.difference / usdValue.initial * 100).toFixed(2)}% change
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6 bg-muted/50 rounded-md p-4">
          <h3 className="text-sm font-medium mb-2">Understanding Volatility Risk</h3>
          <p className="text-sm text-muted-foreground">
            Cryptocurrency prices can be highly volatile, changing by significant percentages in short periods. When betting with cryptocurrency:
          </p>
          <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground space-y-1">
            <li>The USD value of your bet may change significantly between placing and settlement</li>
            <li>If prices increase, your winnings will be worth more in USD</li>
            <li>If prices decrease, your winnings will be worth less in USD</li>
            <li>Stablecoins like USDT and USDC offer protection against volatility</li>
          </ul>
          
          <div className="flex items-center mt-4 text-xs">
            <div className="flex-1 text-center p-2 border-r">
              <div className="font-medium mb-1">Low Volatility</div>
              <div className="text-muted-foreground">USDT, USDC</div>
            </div>
            <div className="flex-1 text-center p-2 border-r">
              <div className="font-medium mb-1">Medium Volatility</div>
              <div className="text-muted-foreground">ETH, BNB</div>
            </div>
            <div className="flex-1 text-center p-2">
              <div className="font-medium mb-1">High Volatility</div>
              <div className="text-muted-foreground">BTC, SOL</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main cryptocurrency information page
const CryptoInformation: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("odds");
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Cryptocurrency Betting Guide</h1>
      <p className="text-muted-foreground mb-6">
        Everything you need to know about betting with cryptocurrency on WeParlay
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="odds">
            <BarChart2 className="h-4 w-4 mr-2" />
            Crypto Odds
          </TabsTrigger>
          <TabsTrigger value="volatility">
            <TrendingUp className="h-4 w-4 mr-2" />
            Price Volatility
          </TabsTrigger>
          <TabsTrigger value="gas">
            <RefreshCw className="h-4 w-4 mr-2" />
            Gas Fees
          </TabsTrigger>
          <TabsTrigger value="security">
            <Wallet className="h-4 w-4 mr-2" />
            Wallet Security
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="odds">
            <OddsConversionTable />
          </TabsContent>
          
          <TabsContent value="volatility">
            <PriceVolatilitySimulator />
          </TabsContent>
          
          <TabsContent value="gas">
            <GasFeeEstimator />
          </TabsContent>
          
          <TabsContent value="security">
            <WalletSecurityFAQ />
          </TabsContent>
        </div>
      </Tabs>
      
      {!isAuthenticated && (
        <Alert className="mt-8" variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Start betting with cryptocurrency</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Connect your wallet to place bets with cryptocurrency on WeParlay</span>
            <Button>
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CryptoInformation;