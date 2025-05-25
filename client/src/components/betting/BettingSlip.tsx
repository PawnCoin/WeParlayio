import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCurrencyMode } from "@/contexts/CurrencyModeContext"; 
import CurrencyDisplay from "@/components/betting/CurrencyDisplay";
import { Shield, Trash2, Settings, X, Bitcoin, Wallet, Clock, DollarSign, Plus, Coins } from "lucide-react";
import { useBetting } from "@/contexts/BettingContext";
import { apiRequest } from "@/lib/queryClient";
import CryptoWalletConnect from "@/components/auth/CryptoWalletConnect";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BetItem {
  id: string;
  type: string;
  eventName: string;
  selection: string;
  opponent: string;
  odds: number;
  timestamp?: string;
  status?: 'pending' | 'won' | 'lost' | 'cashout';
}

interface CryptoWallet {
  id: string;
  name: string;
  icon: React.ReactNode;
  address?: string;
  connected: boolean;
}

const BettingSlip: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [wagerAmount, setWagerAmount] = useState("50.00");
  const { betItems, removeBet, clearBets, selectedCurrency, setSelectedCurrency } = useBetting();
  
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([
    {
      id: "metamask",
      name: "Metamask",
      icon: <Bitcoin className="h-4 w-4 mr-2" />,
      connected: false
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: <Bitcoin className="h-4 w-4 mr-2" />,
      connected: false
    },
    {
      id: "trust",
      name: "Trust Wallet",
      icon: <Bitcoin className="h-4 w-4 mr-2" />,
      connected: false
    },
    {
      id: "phantom",
      name: "Phantom (Solana)",
      icon: <Bitcoin className="h-4 w-4 mr-2" />,
      connected: false
    }
  ]);
  
  // State for wallet connection modal
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  // Currency options for betting - WeParlay Cash featured prominently
  const currencyOptions = [
    { 
      value: "WEPARLAY", 
      label: "WeParlay Cash", 
      icon: <span className="text-blue-500 font-bold">🎮</span>,
      description: "Virtual currency - perfect for practice!"
    },
    { 
      value: "USD", 
      label: "Real Money (USD)", 
      icon: <DollarSign className="h-4 w-4 text-green-500" />,
      description: "Actual money betting with real payouts"
    },
    { 
      value: "BTC", 
      label: "Bitcoin (BTC)", 
      icon: <Bitcoin className="h-4 w-4 text-orange-500" />,
      description: "Cryptocurrency betting"
    },
    { 
      value: "ETH", 
      label: "Ethereum (ETH)", 
      icon: <Bitcoin className="h-4 w-4 text-blue-600" />,
      description: "Cryptocurrency betting"
    },
    { 
      value: "SOL", 
      label: "Solana (SOL)", 
      icon: <Bitcoin className="h-4 w-4 text-purple-500" />,
      description: "Cryptocurrency betting"
    }
  ];
  
  const isEmpty = betItems.length === 0;
  
  const totalOdds = betItems.reduce((acc, item) => {
    // Convert American odds to decimal
    let decimalOdds;
    if (item.odds > 0) {
      decimalOdds = (item.odds / 100) + 1;
    } else {
      decimalOdds = (100 / Math.abs(item.odds)) + 1;
    }
    return acc * decimalOdds;
  }, 1);
  
  // Convert back to American odds
  const displayOdds = totalOdds > 2 
    ? `+${Math.round((totalOdds - 1) * 100)}`
    : `-${Math.round(100 / (totalOdds - 1))}`;
  
  const potentialPayout = parseFloat(wagerAmount) * totalOdds;
  const profit = potentialPayout - parseFloat(wagerAmount);
  
  const handleRemoveBet = (id: string) => {
    removeBet(id);
  };
  
  const handleWagerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input with up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setWagerAmount(value);
    }
  };
  
  const handleQuickAmount = (amount: number) => {
    setWagerAmount(amount.toFixed(2));
  };
  
  // Connect a wallet using real blockchain connections
  const connectWallet = async (walletId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to connect a wallet",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Determine which wallet provider to use
      let walletAddress: string;
      let walletProvider: string;
      
      if (walletId === 'metamask' || walletId === 'coinbase' || walletId === 'trust') {
        // Request Ethereum wallet access
        if (!window.ethereum) {
          throw new Error(`${walletId.charAt(0).toUpperCase() + walletId.slice(1)} is not installed`);
        }
        
        // Request accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found in wallet');
        }
        
        walletAddress = accounts[0];
        walletProvider = walletId;
      } 
      else if (walletId === 'phantom') {
        // Request Phantom wallet access
        if (!window.solana || !window.solana.isPhantom) {
          throw new Error('Phantom wallet is not installed');
        }
        
        // Connect to Phantom
        const { publicKey } = await window.solana.connect();
        walletAddress = publicKey.toString();
        walletProvider = 'phantom';
      }
      else {
        throw new Error(`Unsupported wallet: ${walletId}`);
      }
      
      // Update state with real wallet connection
      setCryptoWallets(prev => 
        prev.map(wallet => 
          wallet.id === walletId 
            ? { ...wallet, connected: true, address: walletAddress } 
            : wallet
        )
      );
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${walletId.charAt(0).toUpperCase() + walletId.slice(1)}`,
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to connect to the wallet. Please try again.";
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Disconnect a wallet with proper blockchain disconnection
  const disconnectWallet = async (walletId: string) => {
    try {
      // Handle Phantom wallet special disconnect case
      if (walletId === 'phantom' && window.solana?.isPhantom) {
        await window.solana.disconnect();
      }
      
      // For Ethereum wallets, we don't need to explicitly disconnect
      // as they handle their own connection state
      
      // Update local state
      setCryptoWallets(prev => 
        prev.map(wallet => 
          wallet.id === walletId 
            ? { ...wallet, connected: false, address: undefined } 
            : wallet
        )
      );
      
      toast({
        title: "Wallet Disconnected",
        description: `Successfully disconnected from ${walletId.charAt(0).toUpperCase() + walletId.slice(1)}`,
      });
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to disconnect wallet";
      
      toast({
        title: "Disconnection Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Get currency symbol
  const getCurrencySymbol = (currency: string) => {
    switch(currency) {
      case 'USD': return '$';
      case 'BTC': return '₿';
      case 'ETH': return 'Ξ';
      case 'SOL': return 'SOL';
      default: return '$';
    }
  };

  // Check if any wallet is connected for crypto currencies
  const isCryptoWalletConnected = selectedCurrency !== 'USD' && !cryptoWallets.some(wallet => wallet.connected);

  const handlePlaceBet = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to place a bet",
        variant: "destructive"
      });
      return;
    }
    
    if (isEmpty) {
      toast({
        title: "No Bets Selected",
        description: "Please add selections to your betting slip",
        variant: "destructive"
      });
      return;
    }
    
    const amount = parseFloat(wagerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid wager amount",
        variant: "destructive"
      });
      return;
    }
    
    // Check if crypto wallet is connected for crypto bets
    if (selectedCurrency !== 'USD' && isCryptoWalletConnected) {
      // Show wallet connect modal for cryptocurrency payments
      setShowWalletModal(true);
      toast({
        title: "Wallet Required",
        description: `Please connect a wallet to place a ${selectedCurrency} bet`,
        variant: "destructive"
      });
      return;
    }
    
    // For USD bets, check balance
    const userBalance = user?.balance ?? 0;
    if (selectedCurrency === 'USD' && user && amount > userBalance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance to place this bet",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Actually place the bet with the API
      const betData = {
        userId: user.id,
        eventId: betItems[0]?.id, // Use the first bet item's event ID
        selections: betItems.map(item => ({
          eventName: item.eventName,
          selection: item.selection,
          opponent: item.opponent,
          odds: item.odds,
          type: item.type
        })),
        amount: amount,
        currency: selectedCurrency,
        totalOdds: displayOdds,
        potentialPayout: potentialPayout.toFixed(2),
        betType: betItems.length > 1 ? 'parlay' : 'single'
      };

      const response = await apiRequest('POST', '/api/bets/place', betData);
      
      if (response.ok) {
        toast({
          title: "Bet Placed Successfully!",
          description: `Your ${selectedCurrency} bet for ${getCurrencySymbol(selectedCurrency)}${amount.toFixed(2)} has been placed`,
        });
        
        // Clear betting slip after successful placement
        clearBets();
        setWagerAmount("50.00");
      } else {
        throw new Error('Failed to place bet');
      }
    } catch (error) {
      console.error("Error placing bet:", error);
      toast({
        title: "Error Placing Bet",
        description: "Failed to place your bet. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Betting Slip</h2>
        <div className="flex">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary mr-2"
            onClick={() => setBetItems([])}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Betting Preferences</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>
                <Clock className="mr-2 h-4 w-4" />
                <span>Bet History</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Create Parlay</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Wallets</DropdownMenuLabel>
              {cryptoWallets.map(wallet => (
                <DropdownMenuItem 
                  key={wallet.id}
                  onClick={() => wallet.connected ? disconnectWallet(wallet.id) : connectWallet(wallet.id)}
                >
                  {wallet.icon}
                  <div className="flex-1">
                    {wallet.name}
                    {wallet.connected && (
                      <div className="text-xs text-muted-foreground truncate max-w-[130px]">
                        {wallet.address}
                      </div>
                    )}
                  </div>
                  <div className="ml-2">
                    {wallet.connected ? 
                      <div className="h-2 w-2 rounded-full bg-secondary" /> : 
                      <div className="h-2 w-2 rounded-full bg-gray-300" />
                    }
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Enhanced Currency Mode Selector with Clear Visual Indicators */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Betting Mode</h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            selectedCurrency === 'WEPARLAY' 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {selectedCurrency === 'WEPARLAY' ? '🎮 Virtual Mode' : '💰 Real Money'}
          </div>
        </div>
        
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className={`w-full border-2 ${
            selectedCurrency === 'WEPARLAY' 
              ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-950' 
              : 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-950'
          }`}>
            <SelectValue placeholder="Select betting mode" />
          </SelectTrigger>
          <SelectContent>
            {currencyOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    {option.icon}
                    <div className="ml-2">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                    </div>
                  </div>
                  {option.value === 'WEPARLAY' && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">RECOMMENDED</span>
                  )}
                  {option.value === 'USD' && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">REAL</span>
                  )}
                  {option.value !== 'USD' && option.value !== 'WEPARLAY' && !cryptoWallets.some(w => w.connected) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto text-xs text-amber-500 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowWalletModal(true);
                      }}
                    >
                      Connect wallet
                    </Button>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Mode Description with Quick Toggle */}
        <div className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-l-4 border-l-blue-500 dark:border-l-blue-400">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600 dark:text-gray-400 flex-1">
              {selectedCurrency === 'WEPARLAY' 
                ? '🎮 Playing with WeParlay Cash - Practice mode with virtual currency. Great for learning!'
                : '💰 Betting with real money - All wins and losses affect your actual balance.'
              }
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 text-xs px-2 py-1 h-auto"
              onClick={() => {
                const newMode = selectedCurrency === 'WEPARLAY' ? 'USD' : 'WEPARLAY';
                setSelectedCurrency(newMode);
                toast({
                  title: `Switched to ${newMode === 'WEPARLAY' ? 'WeParlay Cash' : 'Real Money'} Mode`,
                  description: `You're now betting with ${newMode === 'WEPARLAY' ? 'virtual currency' : 'real money'}`,
                  duration: 3000,
                });
              }}
            >
              Switch to {selectedCurrency === 'WEPARLAY' ? 'Real Money' : 'Virtual'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <Tabs defaultValue="single">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="single">Single</TabsTrigger>
          <TabsTrigger value="parlay">Parlay</TabsTrigger>
          <TabsTrigger value="teaser">Teaser</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single">
          {isEmpty ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-receipt text-gray-400 text-2xl"></i>
              </div>
              <h3 className="font-medium text-gray-600 dark:text-gray-300 mb-2">Your Slip is Empty</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add selections by clicking on odds</p>
              <Button variant="link" className="text-primary">
                View Bet History
              </Button>
            </div>
          ) : (
            <>
              {/* Bet Items */}
              <div className="space-y-3 mb-4">
                {betItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-primary transition-colors">
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">{item.type}</div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-gray-400 hover:text-danger dark:text-gray-500 dark:hover:text-red-400"
                        onClick={() => handleRemoveBet(item.id)}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    </div>
                    <div className="text-base font-semibold mb-1">{item.selection}</div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">vs {item.opponent}</div>
                      <div className="text-sm font-medium">{item.odds}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Balance Display */}
              <div className="mb-3 p-3 rounded-lg border-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${selectedCurrency === 'WEPARLAY' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                    <span className="text-sm font-medium">Available Balance</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {selectedCurrency === 'WEPARLAY' ? '🎮' : '💰'} {getCurrencySymbol(selectedCurrency)}
                      {selectedCurrency === 'WEPARLAY' 
                        ? (user?.weplayTokenBalance ?? 1000).toLocaleString()
                        : (user?.balance ?? 0).toFixed(2)
                      }
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedCurrency === 'WEPARLAY' ? 'WeParlay Cash' : 'Real Money'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Wager Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Wager Amount 
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                    selectedCurrency === 'WEPARLAY' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedCurrency === 'WEPARLAY' ? 'VIRTUAL' : 'REAL'}
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">{getCurrencySymbol(selectedCurrency)}</span>
                  </div>
                  <Input
                    type="text"
                    value={wagerAmount}
                    onChange={handleWagerChange}
                    className={`pl-8 pr-20 border-2 ${
                      selectedCurrency === 'WEPARLAY' 
                        ? 'border-blue-300 focus:border-blue-500' 
                        : 'border-green-300 focus:border-green-500'
                    }`}
                    placeholder={`Enter ${selectedCurrency === 'WEPARLAY' ? 'virtual' : 'real'} amount`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <Button 
                      variant="ghost"
                      className="h-full border-l border-gray-200 dark:border-gray-700 px-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none rounded-r-md"
                      onClick={() => {
                        if (user) {
                          if (selectedCurrency === 'WEPARLAY') {
                            const weparlayCashBalance = user.weplayTokenBalance ?? 1000;
                            setWagerAmount(weparlayCashBalance.toFixed(2));
                          } else if (selectedCurrency === 'USD') {
                            const userBalance = user.balance ?? 0;
                            setWagerAmount(userBalance.toFixed(2));
                          }
                        }
                      }}
                      disabled={!user}
                    >
                      Max
                    </Button>
                  </div>
                </div>
                
                {/* Crypto wallet warning */}
                {selectedCurrency !== 'USD' && !cryptoWallets.some(w => w.connected) && (
                  <div className="mt-2 text-xs text-amber-500 flex items-center">
                    <Wallet className="h-3 w-3 mr-1" />
                    <span>
                      <Link href="/login">
                        <span className="text-primary hover:underline cursor-pointer">Log in</span>
                      </Link> and connect a wallet to place {selectedCurrency} bets
                    </span>
                  </div>
                )}
                
                {/* Connected wallet info */}
                {selectedCurrency !== 'USD' && cryptoWallets.some(w => w.connected) && (
                  <div className="mt-2 text-xs text-green-500 flex items-center">
                    <Wallet className="h-3 w-3 mr-1" />
                    <span>
                      Using {cryptoWallets.find(w => w.connected)?.name} wallet
                    </span>
                  </div>
                )}
              </div>
              
              {/* Quick Amounts */}
              <div className="flex space-x-2 mb-4">
                <Button 
                  variant="outline" 
                  className="flex-1 py-1 text-sm"
                  onClick={() => handleQuickAmount(10)}
                >
                  {getCurrencySymbol(selectedCurrency)}10
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 py-1 text-sm"
                  onClick={() => handleQuickAmount(25)}
                >
                  {getCurrencySymbol(selectedCurrency)}25
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 py-1 text-sm"
                  onClick={() => handleQuickAmount(50)}
                >
                  {getCurrencySymbol(selectedCurrency)}50
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 py-1 text-sm"
                  onClick={() => handleQuickAmount(100)}
                >
                  {getCurrencySymbol(selectedCurrency)}100
                </Button>
              </div>
              
              {/* Bet Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Odds</span>
                  <span className="font-medium">{displayOdds}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Potential Payout</span>
                  <span className="font-medium">{getCurrencySymbol(selectedCurrency)}{potentialPayout.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Profit</span>
                  <span className="font-medium text-secondary">{getCurrencySymbol(selectedCurrency)}{profit.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Enhanced Place Bet Button with Clear Mode Indicators */}
              <Button 
                className={`w-full py-4 rounded-md font-bold text-lg flex items-center justify-center transition-all ${
                  selectedCurrency === 'WEPARLAY'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-2 border-blue-400' 
                    : selectedCurrency === 'USD' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 border-2 border-green-400' 
                    : selectedCurrency === 'BTC' 
                    ? 'bg-[#F7931A] text-white hover:bg-[#F7931A]/90' 
                    : selectedCurrency === 'ETH' 
                    ? 'bg-[#627EEA] text-white hover:bg-[#627EEA]/90'
                    : selectedCurrency === 'SOL'
                    ? 'bg-[#00FFA3] text-black hover:bg-[#00FFA3]/90'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
                onClick={handlePlaceBet}
                disabled={selectedCurrency !== 'USD' && selectedCurrency !== 'WEPARLAY' && isCryptoWalletConnected}
              >
                <div className="flex items-center space-x-2">
                  {selectedCurrency === 'WEPARLAY' ? (
                    <span className="text-xl">🎮</span>
                  ) : selectedCurrency === 'USD' ? (
                    <span className="text-xl">💰</span>
                  ) : (
                    <Bitcoin className="h-5 w-5" />
                  )}
                  <div className="flex flex-col">
                    <span>
                      {selectedCurrency === 'WEPARLAY' 
                        ? 'Place Virtual Bet' 
                        : selectedCurrency === 'USD'
                        ? 'Place Real Money Bet'
                        : `Place ${selectedCurrency} Bet`
                      }
                    </span>
                    <span className="text-xs opacity-80">
                      {selectedCurrency === 'WEPARLAY' 
                        ? 'WeParlay Cash - Practice Mode' 
                        : selectedCurrency === 'USD'
                        ? 'Real Money - Actual Winnings'
                        : `Crypto Betting`
                      }
                    </span>
                  </div>
                </div>
              </Button>
              
              {/* Wallet Connection Prompt */}
              {selectedCurrency !== 'USD' && isCryptoWalletConnected && (
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-700 dark:text-amber-400">
                  <div className="flex items-center">
                    <Wallet className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span>
                      You need to connect a cryptocurrency wallet to place bets with {selectedCurrency}. 
                      Click the settings icon in the top right and select a wallet to connect.
                    </span>
                  </div>
                </div>
              )}
              
            </>
          )}
        </TabsContent>
        
        <TabsContent value="parlay">
          <div className="text-center py-10">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Add multiple selections to create a parlay bet
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="teaser">
          <div className="text-center py-10">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Create a teaser bet by adjusting the point spread
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Responsible Gaming */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <Shield className="inline-block h-3 w-3 mr-1" />
          <a href="#" className="text-primary hover:underline">Responsible Gaming</a>
          • Must be 21+ to bet
        </p>
      </div>
    </div>
  );
};

export default BettingSlip;
