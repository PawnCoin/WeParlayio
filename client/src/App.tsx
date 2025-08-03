import React, { useEffect, Suspense } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WebSocketHandler } from "@/lib/websocketHandler";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";
import UserSatisfactionWidget from "@/components/UserSatisfactionWidget";
import LoadingFallback from "@/components/routing/LoadingFallback";
import { AdminRoutes, DevRoutes, SystemRoutes } from "@/components/routing/RouteGroups";

// Core page imports
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Tournaments from "@/pages/Tournaments";
import Results from "@/pages/Results";
import SocialBetting from "@/pages/SocialBetting";
import Settings from "@/pages/Settings";
import SecuritySettings from "@/pages/SecuritySettings";
import HeadToHeadBetting from "@/pages/HeadToHeadBetting";
import AuthenticationHub from "@/pages/AuthenticationHub";
import UserProfile from "@/pages/UserProfile";
import EsportsHub from "@/pages/EsportsHub";
import SportPage from "@/pages/SportPage";
import BettingDashboard from "@/pages/BettingDashboard";
import UnifiedBettingHub from "@/pages/UnifiedBettingHub";
import UnifiedSports from "@/pages/UnifiedSports";
import Odds from "@/pages/Odds";
import Parlays from "@/pages/Parlays";
import BettingAcademy from "@/pages/BettingAcademy";
import LiveHeatmap from "@/pages/LiveHeatmap";
import MyBets from "@/pages/MyBets";
import VIPDashboard from "@/pages/VIPDashboard";
import BankingSystem from "@/pages/BankingSystem";
import CryptoWallet from "@/pages/CryptoWallet";
import LiveBetting from "@/pages/LiveBetting";
import UpgradeTier from "@/pages/UpgradeTier";
import Support from "@/pages/Support";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import SecurityInfo from "@/pages/SecurityInfo";

// Layout and context imports
import MainLayout from "@/components/layout/MainLayout";
import SimpleOnboarding from "@/components/onboarding/SimpleOnboarding";
import MobileVoiceBetting from "@/components/mobile/MobileVoiceBetting";
import { CurrencyModeProvider } from "./contexts/CurrencyModeContext";
import { TeamThemeProvider } from "./contexts/TeamThemeContext";
import { BetSlipProvider } from "./contexts/BetSlipContext";
import { OnboardingProvider, useOnboarding } from "./contexts/OnboardingContext";
import { BettingProvider } from "./contexts/BettingContext";
import InteractiveOnboardingWizard from "./components/onboarding/InteractiveOnboardingWizard";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load less critical pages
const FantasySportsHub = React.lazy(() => import("@/pages/FantasySportsHub"));
const FantasyFootball = React.lazy(() => import("@/pages/FantasyFootball"));
const LiveStreaming = React.lazy(() => import("@/pages/LiveStreaming"));
const Trivia = React.lazy(() => import("@/pages/Trivia"));
const TierComparison = React.lazy(() => import("@/pages/TierComparison"));
const WeParlayCash = React.lazy(() => import("@/pages/WeParlayCash"));
const CryptoInformation = React.lazy(() => import("@/pages/CryptoInformation"));
const IPTVStreaming = React.lazy(() => import("@/pages/IPTVStreaming"));
const UserAnalytics = React.lazy(() => import("@/pages/UserAnalytics"));
const ThemeSettingsPage = React.lazy(() => import("@/pages/ThemeSettingsPage"));
const PaymentCheckout = React.lazy(() => import("@/pages/PaymentCheckout"));
const CryptoCheckout = React.lazy(() => import("@/pages/CryptoCheckout"));
const TierUpgradeSuccess = React.lazy(() => import("@/pages/TierUpgradeSuccess"));
const PlaidBanking = React.lazy(() => import("@/pages/PlaidBanking"));

// Development/Testing imports (conditional)
const TokenCleanupTest = React.lazy(() => import("@/pages/TokenCleanupTest"));
const NotificationTest = React.lazy(() => import("@/pages/NotificationTest"));

function Router() {
  // Track page views when routes change
  useAnalytics();

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      
      {/* Authentication Routes */}
      <Route path="/auth" component={AuthenticationHub} />
      <Route path="/login" component={AuthenticationHub} />
      <Route path="/signup" component={AuthenticationHub} />
      
      {/* Core Betting Routes */}
      <Route path="/betting-hub" component={UnifiedBettingHub} />
      <Route path="/betting-dashboard" component={BettingDashboard} />
      <Route path="/live-betting" component={LiveBetting} />
      <Route path="/odds" component={Odds} />
      <Route path="/parlays" component={Parlays} />
      <Route path="/live-heatmap" component={LiveHeatmap} />
      <Route path="/betting-academy" component={BettingAcademy} />
      <Route path="/results" component={Results} />
      <Route path="/my-bets" component={MyBets} />
      
      {/* Sports & Gaming */}
      <Route path="/sport/:sportKey" component={SportPage} />
      <Route path="/sports/:sportKey" component={SportPage} />
      <Route path="/sports" component={UnifiedSports} />
      <Route path="/esports-hub" component={EsportsHub} />
      <Route path="/tournaments" component={Tournaments} />

      {/* VIP Features (Single route per feature) */}
      <Route path="/vip" component={VIPDashboard} />
      <Route path="/banking" component={BankingSystem} />
      <Route path="/plaid-banking" component={PlaidBanking} />
      <Route path="/crypto-wallet" component={CryptoWallet} />
      
      {/* Social Features */}
      <Route path="/social" component={SocialBetting} />
      <Route path="/head-to-head" component={HeadToHeadBetting} />

      {/* User Profile & Settings */}
      <Route path="/profile" component={UserProfile} />
      <Route path="/settings" component={Settings} />
      <Route path="/security-settings" component={SecuritySettings} />
      <Route path="/upgrade-tier" component={UpgradeTier} />

      {/* Lazy-loaded Feature Pages */}
      <Suspense fallback={<LoadingFallback />}>
        <Route path="/fantasy" component={FantasySportsHub} />
        <Route path="/fantasy-football" component={FantasyFootball} />
        <Route path="/live-streaming" component={LiveStreaming} />
        <Route path="/iptv" component={IPTVStreaming} />
        <Route path="/trivia" component={Trivia} />
        <Route path="/tier-comparison" component={TierComparison} />
        <Route path="/weparlay-cash" component={WeParlayCash} />
        <Route path="/crypto-info" component={CryptoInformation} />
        <Route path="/analytics" component={UserAnalytics} />
        <Route path="/theme-settings" component={ThemeSettingsPage} />
        
        {/* Payment Routes */}
        <Route path="/payment-checkout" component={PaymentCheckout} />
        <Route path="/crypto-checkout" component={CryptoCheckout} />
        <Route path="/tier-upgrade-success" component={TierUpgradeSuccess} />
      </Suspense>

      {/* Support & Legal */}
      <Route path="/support" component={Support} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/security-info" component={SecurityInfo} />

      {/* Admin Routes (Protected) */}
      <AdminRoutes />
      
      {/* System Routes (Admin Protected) */}
      <SystemRoutes />
      
      {/* Development Routes (Dev Environment Only) */}
      <DevRoutes />
      
      {/* Development/Testing Routes (Only in Dev) */}
      {import.meta.env.DEV && (
        <Suspense fallback={<LoadingFallback />}>
          <Route path="/token-cleanup-test" component={TokenCleanupTest} />
          <Route path="/notification-test" component={NotificationTest} />
          <Route path="/test-admin-auth" component={React.lazy(() => import("@/pages/TestAdminAuth"))} />
          <Route path="/quick-admin-login" component={React.lazy(() => import("@/pages/QuickAdminLogin"))} />
        </Suspense>
      )}

      {/* Catch-all 404 Route - MUST BE LAST */}
      <Route path="*" component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  return (
    <>
      <Toaster />
      <MainLayout>
        <ErrorBoundary>
          <Router />
        </ErrorBoundary>
      </MainLayout>
      <SimpleOnboarding />
      {/* Mobile voice betting floating button (visible on all pages) */}
      <MobileVoiceBetting />
      
      {/* User satisfaction monitoring widget */}
      <UserSatisfactionWidget />

      {/* Interactive Onboarding Wizard for new users */}
      {showOnboarding && (
        <InteractiveOnboardingWizard
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
    </>
  );
}

function App() {
  // Initialize Google Analytics and WebSocket error handling when app loads
  React.useEffect(() => {
    // Initialize WebSocket error handler
    WebSocketHandler.getInstance().preventUnhandledRejection();
    
    // Only log in development
    if (import.meta.env.DEV) {
      console.log('🔌 WebSocket disabled in development environment');
    }
    
    // Verify required environment variable is present (only warn in dev)
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      if (import.meta.env.DEV) {
        console.warn('Missing Google Analytics key: VITE_GA_MEASUREMENT_ID');
      }
    } else {
      initGA();
      if (import.meta.env.DEV) {
        console.log('🚀 WeParlay Analytics initialized!');
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OnboardingProvider>
          <CurrencyModeProvider>
            <TeamThemeProvider>
              <BetSlipProvider>
                <BettingProvider>
                  <AppContent />
                </BettingProvider>
              </BetSlipProvider>
            </TeamThemeProvider>
          </CurrencyModeProvider>
        </OnboardingProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;