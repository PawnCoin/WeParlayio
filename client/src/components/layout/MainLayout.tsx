import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import BettingSlip from "../betting/BettingSlip";
import BetNotifications from "../notifications/BetNotifications";
import { useAuth } from "@/hooks/useAuth";
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
import { ChevronDown, Menu, Wallet, Coins, Shield, ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/WeParlay/Logo";
import WalletConnect from "@/components/auth/WalletConnect";
import WalletNotifications from "@/components/wallet/WalletNotifications";
import { useBetting } from "@/contexts/BettingContext";
import { useQuery } from "@tanstack/react-query";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, isAuthenticated, logout, connectWallet } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { selectedCurrency, setSelectedCurrency } = useBetting();
  const { toast } = useToast();

  // Fetch WeParlay Cash balance
  const { data: cashBalance } = useQuery({
    queryKey: ['/api/user/cash-balance'],
    enabled: isAuthenticated,
  });

  const handleCurrencySwitch = () => {
    const newMode = selectedCurrency === 'WEPARLAY' ? 'USD' : 'WEPARLAY';
    setSelectedCurrency(newMode);
    toast({
      title: `Switched to ${newMode === 'WEPARLAY' ? 'WeParlay Cash' : 'Real Money'} Mode`,
      description: `You're now betting with ${newMode === 'WEPARLAY' ? 'virtual currency' : 'real money'}`,
      duration: 3000,
    });
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/comprehensive-betting", label: "Sports Betting" },
    { href: "/fantasy", label: "Fantasy" },
    { href: "/tournaments", label: "Tournaments" },
    { href: "/video-gaming", label: "Gaming" },
    { href: "/trivia", label: "Trivia" },
    { href: "/results", label: "Results" },
    { href: "/social", label: "Social" }
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black shadow-lg px-4 text-white border-b border-gray-800">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Enhanced with tagline and hover effects */}
            <div className="flex items-center">
              <Link href="/">
                <Logo size="md" withTagline={true} className="cursor-pointer transform hover:scale-105 transition-transform duration-300" />
              </Link>
            </div>

            {/* Navigation for desktop */}
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div className={`${
                    location === link.href
                      ? "text-green-400 border-b-2 border-green-400 bg-green-400/10"
                      : "text-gray-300 hover:text-green-400 hover:bg-green-400/5 transition-all duration-300"
                  } font-semibold cursor-pointer py-2 px-3 text-sm rounded-t-lg`}>
                    {link.label}
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-gray-900 to-gray-800 border-t border-gray-700 z-50 backdrop-blur-lg">
              <div className="grid grid-cols-4 px-2 py-3">
                {navLinks.slice(0, 4).map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div className={`${
                      location === link.href
                        ? "text-green-400 bg-green-400/20"
                        : "text-gray-300 hover:text-white"
                    } flex flex-col items-center py-3 px-2 text-xs font-medium rounded-lg transition-all duration-300`}>
                      <div className="w-6 h-6 mb-1 flex items-center justify-center text-lg">
                        {link.label === 'Home' && '🏠'}
                        {link.label === 'Sports Betting' && '⚡'}
                        {link.label === 'Fantasy' && '🏆'}
                        {link.label === 'Tournaments' && '🥇'}
                      </div>
                      <span className="truncate text-[10px]">{link.label.split(' ')[0]}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Currency Mode Toggle & Wallet Access */}
            <div className="hidden md:flex items-center space-x-2">
              <CurrencyModeToggle variant="compact" className="bg-black/20 p-2 rounded-md" />

              <Link href="/wallet-management">
                <Button variant="ghost" size="sm" className="text-white hover:text-green-500 flex items-center">
                  <Wallet className="h-4 w-4 mr-1" />
                  <span>Wallet</span>
                </Button>
              </Link>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="default" 
                        className={`${
                          selectedCurrency === 'WEPARLAY' 
                            ? 'bg-blue-600 hover:bg-blue-700 border-blue-500' 
                            : 'bg-green-700 hover:bg-green-600 border-green-600'
                        } text-white px-4 py-2 rounded-md flex items-center transition-all duration-300`}
                      >
                        <div className="flex items-center">
                          {selectedCurrency === 'WEPARLAY' ? (
                            <>
                              <span className="text-blue-200 text-xs mr-1">🎮</span>
                              <span>{(cashBalance?.balance || user?.weplayTokenBalance || 10000).toLocaleString()} WPC</span>
                            </>
                          ) : (
                            <>
                              <span className="text-green-200 text-xs mr-1">💰</span>
                              <span>${user?.balance?.toFixed(2) || "0.00"}</span>
                            </>
                          )}
                        </div>
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild className="flex items-center">
                        <Link href="/wallet-management">
                          <div className="flex items-center w-full">
                            <Wallet className="mr-2 h-4 w-4" />
                            Manage Wallets
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="flex items-center">
                        <Link href="/wallet-management?tab=deposit-withdraw">
                          <div className="flex items-center w-full">
                            <Coins className="mr-2 h-4 w-4" />
                            Deposit/Withdraw
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        Transaction History
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleCurrencySwitch} className="flex items-center cursor-pointer">
                        <div className="flex items-center w-full">
                          <ArrowRightLeft className="mr-2 h-4 w-4" />
                          Switch to {selectedCurrency === 'WEPARLAY' ? 'Real Money' : 'WeParlay Cash'}
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-2">
                        <CurrencyModeToggle variant="default" />
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Betting Notifications */}
                  <BetNotifications userId={user?.id} />

                  {/* Wallet Notifications */}
                  <WalletNotifications />

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
                          <DropdownMenuItem asChild>
                            <Link href="/wallet-management">Wallet Management</Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href="/admin-bypass">
                          <div className="flex items-center text-blue-500 font-semibold">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <WalletConnect 
                  onConnect={(address, type) => {
                    console.log(`Connected wallet: ${address} (${type})`);
                    // Connect the wallet using our authentication hook
                    connectWallet(address, type);
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
          <div className="flex-1 overflow-y-auto p-2 md:p-6 pb-24 md:pb-4 custom-scrollbar bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:text-neutral-light">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>

          {/* Betting Slip Column - Mobile Bottom Sheet */}
          <div className="hidden md:block w-80 bg-white/95 backdrop-blur-lg shadow-xl border-l border-gray-200 flex-shrink-0 overflow-y-auto custom-scrollbar dark:bg-gray-900/95 dark:border-gray-700 dark:text-neutral-light">
            <BettingSlip />
          </div>
          
          {/* Mobile Betting Slip - Fixed Bottom */}
          <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 max-h-60 overflow-y-auto dark:bg-neutral-dark dark:border-gray-700">
            <BettingSlip />
          </div>
        </div>
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;