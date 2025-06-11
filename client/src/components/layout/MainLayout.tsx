import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import Sidebar from "./Sidebar";
import QuickNavButton from './QuickNavButton';
import Footer from "./Footer";
import SystemStatusIndicator from '../SystemStatusIndicator';
import UnifiedBetSlip from "../betting/UnifiedBetSlip";
import BetNotifications from "../notifications/BetNotifications";
import { useAuth } from "@/hooks/useAuth.ts";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CurrencyModeToggle from "@/components/shared/CurrencyModeToggle";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, Wallet, Coins, Shield, ArrowRightLeft, History, CreditCard, Crown, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/WeParlay/Logo";
import WalletConnectionOptimized from "@/components/wallet/WalletConnectionOptimized";
import WalletNotifications from "@/components/wallet/WalletNotifications";
import FaviconOptimization from "@/components/shared/FaviconOptimization";
import SocialMediaOptimization from "@/components/shared/SocialMediaOptimization";
import UserFriendlyDisconnection from "@/components/wallet/UserFriendlyDisconnection";
import { useBetting } from "@/contexts/BettingContext";
import { useQuery } from "@tanstack/react-query";
import BusinessProposalModal from "@/components/business/BusinessProposalModal";
import { useWebSocket } from "@/hooks/useWebSocket";
import OddsTicker from "../betting/OddsTicker";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, isAuthenticated, logout, connectWallet } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isBusinessProposalOpen, setIsBusinessProposalOpen] = useState(false);

  // Check URL parameters to open business proposal modal
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('partners') === 'true') {
      setIsBusinessProposalOpen(true);
    }
  }, []);
  const { selectedCurrency, setSelectedCurrency } = useBetting();
  const { toast } = useToast();

  // Initialize WebSocket connection for real-time updates
  const {
    isConnected = false,
    connectionStatus = 'disconnected'
  } = useWebSocket({
    autoConnect: isAuthenticated,
    reconnectAttempts: 5,
    reconnectInterval: 3000
  }) || {};

  // Fetch WeParlay Cash balance
  const { data: cashBalance } = useQuery({
    queryKey: ['/api/user/cash-balance'],
    enabled: isAuthenticated,
  });

  const handleCurrencySwitch = () => {
    const newMode = selectedCurrency === 'WEPARLAY' ? 'USD' : 'WEPARLAY';
    setSelectedCurrency(newMode);

    // Save to localStorage for toggle switch sync
    localStorage.setItem('currencyMode', newMode === 'WEPARLAY' ? 'virtual' : 'real');

    toast({
      title: `Switched to ${newMode === 'WEPARLAY' ? 'WeParlay Cash' : 'Real Money'} Mode`,
      description: `You're now betting with ${newMode === 'WEPARLAY' ? 'virtual currency' : 'real money'}`,
      duration: 3000,
    });

    // Force page refresh to sync all components
    window.location.reload();
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/betting-hub", label: "Sports Betting" },
    { href: "/esports-hub", label: "Esports Hub" },
    { href: "/fantasy", label: "Fantasy" },
    { href: "/tournaments", label: "Tournaments" },
    { href: "/gaming", label: "Gaming" },
    { href: "/trivia", label: "Trivia" },
    { href: "/results", label: "Results" },
    { href: "/social-betting", label: "Social" }
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Optimization Components */}
      <FaviconOptimization />
      <SocialMediaOptimization 
        title="WeParlay - Premier Sports Betting Platform"
        description="Experience the future of sports betting with WeParlay. Live odds, fantasy sports, esports, and more."
        image="/weparlaylogo.png"
      />
      {/* Header */}
      <header className="bg-black shadow-md px-4 text-white header-dark-bg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Enhanced with tagline and hover effects */}
            <div className="flex items-center -ml-24">
              <Link href="/">
                <Logo size="md" withTagline={true} className="cursor-pointer transform hover:scale-105 transition-transform duration-300" />
              </Link>
            </div>

            {/* Navigation for desktop */}
            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div className={`${
                    location === link.href
                      ? "text-green-400 border-b-2 border-green-400 font-semibold"
                      : "text-white hover:text-green-300 transition-colors duration-200"
                  } font-medium cursor-pointer py-2 px-3 text-sm rounded-t-md hover:bg-black/20`}>
                    {link.label}
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-green-800 z-50">
              <div className="grid grid-cols-4 px-2 py-2">
                {navLinks.slice(0, 4).map((link) => (
                  <div 
                    key={link.href}
                    className={`${
                      location === link.href
                        ? "text-green-400 bg-green-900/20"
                        : "text-white hover:text-green-300 hover:bg-green-900/10"
                    } flex flex-col items-center py-2 px-1 text-xs font-medium cursor-pointer rounded-md transition-colors duration-200`}
                    onClick={() => window.location.href = link.href}
                  >
                    <div className="w-6 h-6 mb-1 flex items-center justify-center">
                      {link.label === 'Home' && '🏠'}
                      {link.label === 'Sports Betting' && '⚡'}
                      {link.label === 'Fantasy' && '🏆'}
                      {link.label === 'Tournaments' && '🥇'}
                    </div>
                    <span className="truncate">{link.label.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Currency Mode Toggle & Wallet Access */}
            <div className="hidden md:flex items-center space-x-2">
              {/* WebSocket Connection Status */}
              {isAuthenticated && (
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`} title={`Real-time updates: ${isConnected ? 'Connected' : connectionStatus}`} />
              )}

              <CurrencyModeToggle 
                variant="compact" 
                className="bg-black/20 p-2 rounded-md" 
                onCurrencyChange={handleCurrencySwitch}
              />

              <WalletConnectionOptimized />
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="default" 
                        onClick={handleCurrencySwitch}
                        className={`${
                          selectedCurrency === 'WEPARLAY' 
                            ? 'bg-blue-600 hover:bg-blue-700 border-blue-500' 
                            : 'bg-green-700 hover:bg-green-600 border-green-600'
                        } text-white px-3 py-2 rounded-md flex items-center transition-all duration-300 min-w-0`}
                      >
                        <div className="flex items-center min-w-0">
                          {selectedCurrency === 'WEPARLAY' ? (
                            <>
                              <span className="text-blue-200 text-xs mr-1 flex-shrink-0">🎮</span>
                              <span className="text-sm font-medium truncate">{(cashBalance?.balance || user?.weplayTokenBalance || 10000).toLocaleString()} WPC</span>
                            </>
                          ) : (
                            <>
                              <span className="text-green-200 text-xs mr-1 flex-shrink-0">💰</span>
                              <span className="text-sm font-medium">${user?.balance?.toFixed(2) || "0.00"}</span>
                            </>
                          )}
                        </div>
                        <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/wallet" className="flex items-center w-full">
                          <Wallet className="mr-2 h-4 w-4" />
                          Manage Wallets
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/user-profile-banking" className="flex items-center w-full">
                          <Coins className="mr-2 h-4 w-4" />
                          Deposit/Withdraw
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/weparlay-cash" className="flex items-center w-full">
                          <History className="mr-2 h-4 w-4" />
                          WeParlay Cash Hub
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my-bets" className="flex items-center w-full">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Transaction History
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleCurrencySwitch} className="flex items-center cursor-pointer">
                        <div className="flex items-center w-full">
                          <ArrowRightLeft className="mr-2 h-4 w-4" />
                          Switch to {selectedCurrency === 'WEPARLAY' ? 'Real Money' : 'WeParlay Cash'}
                        </div>
                      </DropdownMenuItem>

                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Unified Notifications - Combined Betting & Wallet */}
                  <BetNotifications userId={user?.id} showWalletNotifications={true} />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.profileImageUrl || "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} />
                          <AvatarFallback>{user?.firstName?.charAt(0) || user?.email?.charAt(0) || "W"}</AvatarFallback>
                        </Avatar>
                        <span className="hidden md:block">{user?.firstName || user?.email?.split('@')[0]}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my-bets">My Bets</Link>
                      </DropdownMenuItem>
                      {/* Only show these options to authenticated users */}
                      {isAuthenticated && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/settings">Settings</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/security-settings">Security</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/banking" className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-2 text-green-600" />
                              Traditional Banking
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/crypto-wallet" className="flex items-center">
                              <Wallet className="h-4 w-4 mr-2 text-blue-600" />
                              Crypto Wallet
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}


                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <WalletConnectionOptimized 
                  onConnect={(walletData) => {
                    console.log(`Connected wallet: ${walletData.address} (${walletData.type})`);
                    // Connect the wallet using our authentication hook
                    connectWallet(walletData.address, walletData.type);
                  }}
                />
              )}

              {/* Mobile menu button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - hidden on mobile unless open */}
        <div className={`${
          isMobileSidebarOpen ? "block" : "hidden"
        } md:block fixed md:relative z-20 inset-0 md:inset-auto bg-white md:w-64 shadow-md flex-shrink-0 h-full md:h-auto overflow-y-auto custom-scrollbar dark:bg-neutral-dark dark:text-neutral-light`}>
          <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
        </div>

        {/* Mobile sidebar backdrop */}
        {isMobileSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 z-10 bg-black/50"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Content Column */}
          <div className="flex-1 overflow-y-auto p-2 md:p-4 pb-24 md:pb-4 custom-scrollbar bg-background text-foreground light-mode-text-contrast">
            {children}
          </div>

          {/* Betting Slip Column - Mobile Bottom Sheet */}
          <div className="hidden md:block w-80 bg-card shadow-md flex-shrink-0 overflow-y-auto custom-scrollbar betting-slip-shadow border-l border-border">
            <UnifiedBetSlip />
          </div>

          {/* Mobile Betting Slip - Fixed Bottom */}
          <div className="md:hidden fixed bottom-16 left-0 right-0 bg-card border-t border-border shadow-lg z-40 max-h-60 overflow-y-auto">
            <UnifiedBetSlip />
          </div>
        </div>
      </main>
      <OddsTicker />
      {/* Footer */}
      <Footer />

      {/* Bottom Right Corner - Professionally Organized */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
        {/* System Status - Top */}
        <div className="bg-black/10 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <SystemStatusIndicator />
        </div>

        {/* Quick Navigation - Bottom */}
        <div className="bg-black/10 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <QuickNavButton />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;