import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import Sidebar from "./Sidebar";
import QuickNavButton from './QuickNavButton';
import Footer from "./Footer";
import SystemStatusIndicator from '../SystemStatusIndicator';
import UnifiedBetSlip from "../betting/UnifiedBetSlip";
import BetNotifications from "../notifications/BetNotifications";
import LiveScoreNotifications from "../notifications/LiveScoreNotifications";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PermissionGate from "@/components/auth/PermissionGate";
import PermissionBadge from "@/components/auth/PermissionBadge";
import CurrencyModeToggle from "@/components/shared/CurrencyModeToggle";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, Wallet, Coins, Shield, ArrowRightLeft, History, CreditCard, Crown, Briefcase, Settings, Users, User, Camera, LogOut } from "lucide-react";
import FeedbackButton from '../FeedbackButton';
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/WeParlay/Logo";
import WalletConnectionOptimized from "@/components/wallet/WalletConnectionOptimized";
import WalletNotifications from "@/components/wallet/WalletNotifications";
import FaviconOptimization from "@/components/shared/FaviconOptimization";
import SocialMediaOptimization from "@/components/shared/SocialMediaOptimization";
import UserFriendlyDisconnection from "@/components/wallet/UserFriendlyDisconnection";
import MobileNavigation from "@/components/mobile/MobileNavigation";
import { useBetting } from "@/contexts/BettingContext";
import { useBetSlip } from "@/contexts/BetSlipContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BusinessProposalModal from "@/components/business/BusinessProposalModal";
import { useWebSocket } from "@/hooks/useWebSocket";
import SimpleOnboarding from "../onboarding/SimpleOnboarding";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, refetch: refetchAuth } = useAuth();
  const queryClient = useQueryClient();

  // Handle missing user properties with proper defaults and admin status
  const currentUser = user as any || {};

  // Roles are established by the authenticated server response only.
  const isAdmin = currentUser.isAdmin === true || currentUser.role === 'admin';

  // Enhance user object with admin status
  currentUser.isAdmin = isAdmin;
  currentUser.role = isAdmin ? 'admin' : (currentUser.role || 'user');

  // Debug logging for authentication state
  React.useEffect(() => {
    console.log('🔍 Auth Debug:', {
      isAuthenticated,
      userEmail: currentUser.email,
      isAdmin,
      hasToken: !!localStorage.getItem('auth-token'),
      user: currentUser
    });
  }, [isAuthenticated, currentUser.email, isAdmin]);

  const userId = currentUser.id || 'guest';
  const userName = currentUser.firstName || currentUser.email?.split('@')[0] || 'User';
  const userInitial = currentUser.firstName?.charAt(0) || currentUser.email?.charAt(0) || "W";
  const userBalance = currentUser.balance || 0;
  const userProfileImage = currentUser.profileImageUrl;

  // Never expose privileged credentials in the client. Authentication goes through the normal flow.
  const quickAdminLogin = () => setLocation('/auth');

  // Enhanced logout function with proper cache clearing
  const logout = async () => {
    console.log('🚪 Starting logout...');

    try {
      // Call logout endpoint
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Clear all user data
    localStorage.clear(); // Clear all localStorage items
    sessionStorage.clear(); // Clear all sessionStorage items

    // Clear React Query cache
    queryClient.clear();

    console.log('✅ Logout complete, reloading...');

    // Force reload to ensure clean state
    window.location.reload();
  };

  // Simple wallet connection function
  const connectWallet = (address: string, type: string) => {
    console.log(`Connecting wallet: ${address} (${type})`);
  };
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
  const { betSlip, updateBet, removeFromBetSlip, clearBetSlip } = useBetSlip();
  const { toast } = useToast();

  // The shared slip stores optional display fields, while the unified slip needs
  // a complete display model. Normalize it once at the layout boundary.
  const normalizedBetSlip = betSlip.map((bet) => ({
    id: bet.id,
    eventId: bet.eventId,
    betType: bet.betType,
    selection: bet.selection || bet.pick || '',
    odds: bet.odds,
    amount: bet.amount || 0,
    potential: bet.potential || 0,
    point: bet.point,
    sport: bet.sport || '',
    gameInfo: {
      homeTeam: bet.homeTeam || '',
      awayTeam: bet.awayTeam || '',
    },
  }));

  const updateUnifiedBetAmount = (id: string, amount: number) => {
    updateBet(id, { amount });
  };

  // Initialize WebSocket connection for real-time updates
  const {
    isConnected = false
  } = useWebSocket({
    onConnect: () => console.log('WebSocket connected'),
    reconnectAttempts: 5,
    reconnectInterval: 3000
  }) || {};

  // Fetch WeParlay Cash balance
  const { data: cashBalance = {} as any } = useQuery({
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
    { href: "/", label: "Today's Games" },
    { href: "/custom-bets", label: "Custom Bets" },
    { href: "/tournaments", label: "Daily Tournament" },
    { href: "/live-tv", label: "Live TV" },
    { href: "/my-bets", label: "My Bets" },
    { href: "/profile", label: "Profile" }
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Onboarding Component - Singular */}
      <SimpleOnboarding />
      
      {/* Optimization Components */}
      <FaviconOptimization />
      <SocialMediaOptimization 
        title="WeParlay - Premier Sports Betting Platform"
        description="Live sports, custom peer-to-peer bets, daily tournaments, and one universal bet slip."
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
                      {link.label === "Today's Games" && '🏠'}
                      {link.label === 'Custom Bets' && '🤝'}
                      {link.label === 'Daily Tournament' && '🥇'}
                      {link.label === 'Live TV' && '📺'}
                    </div>
                    <span className="truncate">{link.label.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Currency Mode Toggle & Wallet Access - Only for authenticated users */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-2">
                {/* WebSocket Connection Status */}
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} title={`Real-time updates: ${isConnected ? 'Connected' : 'Disconnected'}`} />

                <CurrencyModeToggle 
                  variant="compact" 
                  className="bg-black/20 p-2 rounded-md" 
                  onCurrencyChange={handleCurrencySwitch}
                />

                <WalletConnectionOptimized />
              </div>
            )}

            {/* User menu - Always visible */}
            <div className="flex items-center space-x-4">
              {/* Currency/Wallet controls - Only for authenticated users */}
              {isAuthenticated && (
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
                              <span className="text-sm font-medium truncate">{(cashBalance.balance || currentUser.weplayTokenBalance || 10000).toLocaleString()} WPC</span>
                            </>
                          ) : (
                            <>
                              <span className="text-green-200 text-xs mr-1 flex-shrink-0">💰</span>
                              <span className="text-sm font-medium">${userBalance.toFixed(2)}</span>
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
                  <BetNotifications userId={userId} />
                </>
              )}

              {/* Profile Dropdown - Always Visible */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      {/* Only show profile image if user is authenticated */}
                      <AvatarImage src={isAuthenticated ? userProfileImage : undefined} />
                      <AvatarFallback>{isAuthenticated ? userInitial : "G"}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block">
                      <span className="block">{isAuthenticated ? userName : "Guest"}</span>
                      {isAuthenticated && <PermissionBadge className="mt-1" />}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Only show these options to authenticated users */}
                      {isAuthenticated ? (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/profile" className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/my-bets" className="flex items-center">
                              <History className="h-4 w-4 mr-2" />
                              My Bets
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/settings" className="flex items-center">
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/security-settings" className="flex items-center">
                              <Shield className="h-4 w-4 mr-2" />
                              Security
                            </Link>
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
                          {/* Admin access for authenticated admin users */}
                          {(currentUser.isAdmin || isAdmin) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href="/admin-dashboard" className="flex items-center">
                                  <Settings className="h-4 w-4 mr-2 text-red-600" />
                                  Admin Dashboard
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/users" className="flex items-center">
                                  <Users className="h-4 w-4 mr-2 text-purple-600" />
                                  User Management
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/social-media-bots" className="flex items-center">
                                  <span className="h-4 w-4 mr-2 text-blue-600">🤖</span>
                                  Facebook Bots
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              logout();
                            }}
                            className="cursor-pointer flex items-center"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              quickAdminLogin();
                            }}
                            className="cursor-pointer flex items-center"
                          >
                            <User className="h-4 w-4 mr-2" />
                            Login
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/signup" className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              Sign Up
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

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
            <UnifiedBetSlip 
              betSlip={normalizedBetSlip}
              onUpdateBet={updateUnifiedBetAmount}
              onRemoveBet={removeFromBetSlip}
              onClearAll={clearBetSlip}
              balances={{
                weparlay_cash: currentUser.weplayTokenBalance || currentUser.weparlayCashBalance || currentUser.balance || 10000,
                real_money: currentUser.cashBalance || 0,
                crypto: 0
              }}
            />
          </div>

          {/* Mobile Betting Slip - Fixed Bottom */}
          <div className="md:hidden fixed bottom-16 left-0 right-0 bg-card border-t border-border shadow-lg z-40 max-h-60 overflow-y-auto">
            <UnifiedBetSlip 
              betSlip={normalizedBetSlip}
              onUpdateBet={updateUnifiedBetAmount}
              onRemoveBet={removeFromBetSlip}
              onClearAll={clearBetSlip}
              balances={{
                weparlay_cash: currentUser.weplayTokenBalance || currentUser.weparlayCashBalance || currentUser.balance || 10000,
                real_money: currentUser.cashBalance || 0,
                crypto: 0
              }}
            />
          </div>
        </div>
      </main>
      {/* Footer */}
      <Footer />

      {/* Real-time Notifications - Temporarily disabled to fix infinite loop */}
      {/* <LiveScoreNotifications /> */}

      {/* Bottom Right Corner - Professionally Organized */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 items-end">


        {/* Feedback Button - Bottom */}
        <div className="transform transition-transform hover:scale-105">
          <FeedbackButton variant="floating" />
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default MainLayout;
