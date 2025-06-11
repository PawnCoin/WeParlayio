import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WebSocketHandler } from "@/lib/websocketHandler";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Tournaments from "@/pages/Tournaments";
import Results from "@/pages/Results";
import SocialBetting from "@/pages/SocialBetting";
import Settings from "@/pages/Settings";
import SecuritySettings from "@/pages/SecuritySettings";
import HeadToHeadBetting from "@/pages/HeadToHeadBetting";
import LoginEnhanced from "@/pages/LoginEnhanced";
import AuthTestDemo from "@/pages/AuthTestDemo";
import UserDirectory from "@/pages/UserDirectory";
import SocialMediaBots from "@/pages/SocialMediaBots";

import EmailMonitoring from "@/pages/EmailMonitoring";
import VipFeatures from "./pages/VipFeatures";
import WalletManagement from "./pages/WalletManagement";
import EsportsHub from "./pages/EsportsHub";
import Trivia from "@/pages/Trivia";
import BettingExperience from "@/pages/BettingExperience"; // New enhanced betting page
import SportPage from "@/pages/SportPage"; // New sport page
import BettingDashboard from "@/pages/BettingDashboard"; // Professional sports betting dashboard
import MobileLogin from "@/pages/MobileLogin"; // Login page with social login options
import EnhancedFeatures from "@/pages/EnhancedFeatures"; // Advanced features page
import ThemeSettingsPage from "@/pages/ThemeSettingsPage"; // Theme settings page
// Removed duplicate AdminDashboard import
import AdminLogin from "@/pages/AdminLogin"; // Admin login page
import NotificationTest from "@/pages/NotificationTest"; // Email and SMS testing
import PrivacyPolicy from "@/pages/PrivacyPolicy"; // Privacy policy page for social login requirements
import TermsOfService from "@/pages/TermsOfService"; // Terms of service page for social login requirements
import SecurityInfo from "@/pages/SecurityInfo"; // Security information page showing our protection measures
import Support from "@/pages/Support"; // Automated support system
import CryptoInformation from "@/pages/CryptoInformation"; // Cryptocurrency information and guides
// SMS functionality consolidated into Head-to-Head Betting
import UserProfileBanking from "@/pages/UserProfileBanking"; // Complete user profile with integrated banking
import MyBets from "@/pages/MyBets"; // User betting history and tracking
import WeParlayCash from "@/pages/WeParlayCash"; // WeParlay Cash hub and management
import BettingManager from "@/pages/BettingManager";
import PaymentDemo from "@/pages/PaymentDemo";
import WalletTest from "@/pages/WalletTest";
import UserProfilePage from "@/pages/UserProfilePage";
import FantasySportsEnhanced from "@/pages/FantasySportsEnhanced";
import GamingIntegration from "@/pages/GamingIntegration";
import SocialHub from "@/pages/SocialHub";
import BlockchainPerformance from "@/pages/BlockchainPerformance";
import WalletTutorial from "@/pages/WalletTutorial";
import StreamingRecommendations from "@/pages/StreamingRecommendations";
import SocialSharing from "@/pages/SocialSharing";
import LiveStreaming from "@/pages/LiveStreaming";
import FantasyFootball from "@/pages/FantasyFootball";
import YahooFantasyFootball from "@/pages/YahooFantasyFootball";
import FantasySportsHub from "@/pages/FantasySportsHub";
import FantasyAnalyticsDashboard from "@/pages/FantasyAnalyticsDashboard";
import TierComparison from "@/pages/TierComparison";
import SMSOptIn from "@/pages/SMSOptIn";

import MainLayout from "@/components/layout/MainLayout";
import SimpleOnboarding from "@/components/onboarding/SimpleOnboarding";
import MobileVoiceBetting from "@/components/mobile/MobileVoiceBetting";
import { CurrencyModeProvider } from "./contexts/CurrencyModeContext";
import { TeamThemeProvider } from "./contexts/TeamThemeContext";
import { BetSlipProvider } from "./contexts/BetSlipContext";
import { OnboardingProvider, useOnboarding } from "./contexts/OnboardingContext";
import { BettingProvider } from "./contexts/BettingContext";
import InteractiveOnboardingWizard from "./components/onboarding/InteractiveOnboardingWizard";
import OnboardingDemo from "@/pages/OnboardingDemo";
import IPTVPlayer from "@/pages/IPTVPlayer";

import UnifiedSports from "@/pages/UnifiedSports";
import ComprehensiveBetting from "@/pages/ComprehensiveBetting";
import Odds from "@/pages/Odds";
import Parlays from "@/pages/Parlays";
import BettingAcademy from "@/pages/BettingAcademy";
import LiveHeatmap from "@/pages/LiveHeatmap";
import LiveBettingEnhanced from "@/pages/LiveBettingEnhanced";
import ErrorBoundary from "./components/ErrorBoundary";
import ThemeColorManager from "@/pages/ThemeColorManager";
import SignUpEnhanced from "@/pages/SignUpEnhanced";

import BettingChallenges from './components/betting/BettingChallenges';
import SiteNavigation from './pages/SiteNavigation';
import PageStatusChecker from './pages/PageStatusChecker';
import AdminDashboard from "@/pages/AdminDashboard";

// Import admin components
import AdminBypass from "@/pages/AdminBypass";
import OwnerAccess from "@/pages/OwnerAccess";
import ManageUsers from "@/pages/admin/ManageUsers";
import FinancialOverview from "@/pages/admin/FinancialOverview";
import Analytics from "@/pages/admin/Analytics";
import SimplePlatformSettings from "@/pages/admin/SimplePlatformSettings";
import VisualComponentEditorPage from "./pages/admin/VisualComponentEditor";
import NotificationManagement from "@/pages/system/NotificationManagement";
import TransactionManagement from "@/pages/system/TransactionManagement";
import PayoutManagement from "@/pages/system/PayoutManagement";
import SystemLogs from "@/pages/system/SystemLogs";
import ApiStatus from "@/pages/system/ApiStatus";
import SystemHealth from "@/pages/system/SystemHealth";
import UnifiedGaming from "@/pages/system/UnifiedGaming";
import SocialMediaDashboard from "@/pages/system/SocialMediaDashboard";
import LiveSportsStreaming from "@/pages/system/LiveSportsStreaming";
import VIPDashboard from "@/pages/VIPDashboard";
import BankingSystem from "@/pages/BankingSystem";
import CompleteBettingSystem from "@/pages/CompleteBettingSystem";
import MultiCurrencyBetting from "@/pages/MultiCurrencyBetting";
import UpgradeTier from "@/pages/UpgradeTier";
import PaymentCheckout from "@/pages/PaymentCheckout";
import CryptoCheckout from "@/pages/CryptoCheckout";
import TierUpgradeSuccess from "@/pages/TierUpgradeSuccess";
import CryptoWallet from "@/pages/CryptoWallet";
import CryptoBetting from "@/pages/CryptoBetting";
import TwilioOptInDemo from "@/pages/TwilioOptInDemo";
import LiveBetting from "@/pages/LiveBetting";
import UserAnalytics from "@/pages/UserAnalytics";

import { lazy } from 'react';

function Router() {
  // Track page views when routes change
  useAnalytics();

  return (
    <Switch>
      {/* Main Application Routes */}
      <Route path="/home" component={Home} />
      <Route path="/dashboard" component={BettingDashboard} />
      <Route path="/betting-dashboard" component={BettingDashboard} />
      <Route path="/betting" component={BettingDashboard} />
      <Route path="/betting-experience" component={BettingExperience} />
      <Route path="/betting-manager" component={BettingManager} />
      <Route path="/comprehensive-betting" component={ComprehensiveBetting} />
      <Route path="/odds" component={Odds} />
      <Route path="/live-betting" component={LiveBetting} />
      <Route path="/live-betting-enhanced" component={LiveBettingEnhanced} />
      <Route path="/live-heatmap" component={LiveHeatmap} />
      {/* VIP Access Features */}
      <Route path="/vip-dashboard" component={VIPDashboard} />
      <Route path="/vip" component={VIPDashboard} />
      <Route path="/vip/live-streaming" component={LiveStreaming} />
      <Route path="/vip/streaming" component={LiveStreaming} />
      <Route path="/vip/fantasy" component={FantasySportsEnhanced} />
      <Route path="/vip/tournaments" component={Tournaments} />
      <Route path="/vip/head-to-head" component={HeadToHeadBetting} />
      <Route path="/vip/blockchain-performance" component={BlockchainPerformance} />
      <Route path="/vip/gaming-integration" component={GamingIntegration} />
      <Route path="/live-streaming" component={LiveStreaming} />
      <Route path="/streaming" component={LiveStreaming} />
      <Route path="/banking" component={BankingSystem} />
      <Route path="/crypto-wallet" component={CryptoWallet} />
      <Route path="/wallet" component={CryptoWallet} />
      <Route path="/crypto-betting" component={CryptoBetting} />
      <Route path="/crypto" component={CryptoBetting} />
      <Route path="/complete-betting" component={CompleteBettingSystem} />
      <Route path="/my-bets" component={MyBets} />
      <Route path="/results" component={Results} />
      <Route path="/parlays" component={Parlays} />

      {/* Sports Pages */}
      <Route path="/sport/:sportKey" component={SportPage} />
      <Route path="/sports/:sportKey" component={SportPage} />
      <Route path="/unified-sports" component={UnifiedSports} />

      {/* Gaming & Esports */}
      <Route path="/gaming" component={UnifiedGaming} />
      <Route path="/gaming-integration" component={GamingIntegration} />
      <Route path="/esports-hub" component={EsportsHub} />
      <Route path="/betting-challenges" component={BettingChallenges} />
       {/* Add /betting-challenge route for evaluation */}
        <Route path="/betting-challenge" component={BettingChallenges} />

      {/* Fantasy Sports */}
      <Route path="/fantasy" component={FantasySportsHub} />
      <Route path="/fantasy-legacy" component={FantasySportsEnhanced} />
      <Route path="/fantasy-football" component={FantasyFootball} />
      <Route path="/yahoo-fantasy" component={YahooFantasyFootball} />
      <Route path="/fantasy/analytics" component={FantasyAnalyticsDashboard} />

      {/* Tier Management */}
      <Route path="/tier-comparison" component={TierComparison} />
      
      {/* SMS Opt-In for Twilio Compliance */}
      <Route path="/sms-opt-in" component={SMSOptIn} />

      {/* Tournaments */}
      <Route path="/tournaments" component={Tournaments} />
      <Route path="/tournament/:id" component={Tournaments} />

      {/* Social Features */}
      <Route path="/social" component={SocialHub} />
      <Route path="/social-betting" component={SocialBetting} />
      <Route path="/head-to-head" component={HeadToHeadBetting} />

      {/* Trivia */}
      <Route path="/trivia" component={Trivia} />

      {/* Twilio SMS Opt-in Demo */}
      <Route path="/twilio-opt-in-demo" component={TwilioOptInDemo} />

      {/* Streaming & IPTV */}
      <Route path="/live-streaming" component={LiveStreaming} />
      <Route path="/streaming-recommendations" component={StreamingRecommendations} />
      <Route path="/iptv-player" component={IPTVPlayer} />
      
      {/* Blockchain & Web3 Features */}
      <Route path="/blockchain-performance" component={BlockchainPerformance} />
      <Route path="/wallet-tutorial" component={WalletTutorial} />
      <Route path="/social-sharing" component={SocialSharing} />

      {/* Enhanced Features */}
      <Route path="/enhanced-features" component={EnhancedFeatures} />

      {/* VIP Features */}
      <Route path="/vip" component={VipFeatures} />
      <Route path="/vip-features" component={VipFeatures} />

      {/* WeParlay Cash */}
      <Route path="/weparlay-cash" component={WeParlayCash} />

      {/* Financial Management - Clear Separation */}
      <Route path="/banking" component={BankingSystem} />
      <Route path="/crypto-wallet" component={CryptoWallet} />
      <Route path="/wallet-management-enhancement" component={CryptoWallet} />
      <Route path="/wallet-test" component={WalletTest} />
      <Route path="/user-profile-banking" component={UserProfileBanking} />
      <Route path="/user-profile" component={UserProfilePage} />
      <Route path="/user-profile-page" component={UserProfilePage} />
      <Route path="/profile" component={UserProfilePage} />

      {/* Payment & Demo */}
      <Route path="/payment-demo" component={PaymentDemo} />
      <Route path="/payment-checkout" component={PaymentCheckout} />
      <Route path="/crypto-checkout" component={CryptoCheckout} />
      <Route path="/tier-upgrade-success" component={TierUpgradeSuccess} />
      <Route path="/onboarding-demo" component={OnboardingDemo} />
      <Route path="/notification-test" component={NotificationTest} />
      <Route path="/sms-challenge" component={HeadToHeadBetting} />
      <Route path="/sms-center" component={HeadToHeadBetting} />

      {/* Academy */}
      <Route path="/betting-academy" component={BettingAcademy} />

      {/* Settings */}
      <Route path="/settings" component={Settings} />
      <Route path="/security-settings" component={SecuritySettings} />
      <Route path="/theme-settings" component={ThemeSettingsPage} />
      <Route path="/upgrade-tier" component={UpgradeTier} />
      <Route path="/theme-color-manager" component={ThemeColorManager} />

      {/* System Management Routes */}
      <Route path="/platform-settings" component={SimplePlatformSettings} />
      <Route path="/security" component={SecuritySettings} />
      <Route path="/notifications" component={NotificationManagement} />
      <Route path="/transactions" component={TransactionManagement} />
      <Route path="/payouts" component={PayoutManagement} />
      <Route path="/logs" component={SystemLogs} />
      <Route path="/api-status" component={ApiStatus} />
      <Route path="/system/api-status" component={ApiStatus} />
      <Route path="/system-health" component={SystemHealth} />
      <Route path="/system/system-health" component={SystemHealth} />
      <Route path="/unified-gaming" component={UnifiedGaming} />
      <Route path="/system/unified-gaming" component={UnifiedGaming} />
      <Route path="/social-media-dashboard" component={SocialMediaDashboard} />
      <Route path="/system/social-media-dashboard" component={SocialMediaDashboard} />
      <Route path="/live-sports-streaming" component={LiveSportsStreaming} />
      <Route path="/system/live-sports-streaming" component={LiveSportsStreaming} />

      {/* Enhanced Multi-Currency Betting */}
      <Route path="/multi-currency-betting" component={MultiCurrencyBetting} />

      {/* Crypto */}
      <Route path="/crypto-info" component={CryptoInformation} />
      <Route path="/crypto-guide" component={CryptoInformation} />
      <Route path="/crypto-information" component={CryptoInformation} />

      {/* Support & Legal */}
      <Route path="/support" component={Support} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/security-info" component={SecurityInfo} />

      {/* Authentication */}
      <Route path="/login" component={LoginEnhanced} />
      <Route path="/login-enhanced" component={LoginEnhanced} />
      <Route path="/mobile-login" component={MobileLogin} />
      <Route path="/auth-test" component={AuthTestDemo} />
      <Route path="/auth-test-demo" component={AuthTestDemo} />
      <Route path="/community" component={UserDirectory} />
      <Route path="/users" component={UserDirectory} />
      <Route path="/social-bots" component={SocialMediaBots} />
      <Route path="/email-monitoring" component={EmailMonitoring} />

      {/* Authentication Routes */}
      <Route path="/signup" component={SignUpEnhanced} />
      <Route path="/signup-enhanced" component={SignUpEnhanced} />

      {/* Admin Routes - Direct access without authentication */}
      <Route path="/admin/manage-users" component={ManageUsers} />
      <Route path="/admin/financial-overview" component={FinancialOverview} />
      <Route path="/admin/analytics" component={Analytics} />
      <Route path="/admin/platform-settings" component={SimplePlatformSettings} />
      <Route path="/admin/visual-component-editor" component={VisualComponentEditorPage} />
      <Route path="/admin/social-media-dashboard" component={SocialMediaDashboard} />
      <Route path="/admin/user-analytics" component={lazy(() => import("./pages/admin/UserAnalytics"))} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/force-admin" component={AdminDashboard} />
      <Route path="/owner-access" component={OwnerAccess} />
      <Route path="/api-test" component={lazy(() => import("./pages/ApiTestPage"))} />

      {/* Default route */}
      <Route path="/" component={Home} />
       <Route path="/site-navigation" component={SiteNavigation} />
            <Route path="/page-status-checker" component={PageStatusChecker} />
        <Route path="/functionality-test" component={PageStatusChecker} />
      <Route component={NotFound} />
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
    console.log('🔌 WebSocket disabled in development environment');
    
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
      console.log('🚀 WeParlay Analytics initialized!');
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