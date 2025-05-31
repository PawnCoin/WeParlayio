import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import SocialMediaDashboard from "@/pages/SocialMediaDashboard";
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
import AdminDashboard from "@/pages/AdminDashboard"; // Admin dashboard for platform owner
import AdminLogin from "@/pages/AdminLogin"; // Admin login page
import NotificationTest from "@/pages/NotificationTest"; // Email and SMS testing
import PrivacyPolicy from "@/pages/PrivacyPolicy"; // Privacy policy page for social login requirements
import TermsOfService from "@/pages/TermsOfService"; // Terms of service page for social login requirements
import SecurityInfo from "@/pages/SecurityInfo"; // Security information page showing our protection measures
import Support from "@/pages/Support"; // Automated support system
import CryptoInformation from "@/pages/CryptoInformation"; // Cryptocurrency information and guides
import SmsChallenge from "@/pages/SmsChallenge"; // VIP SMS Challenge system
import UserProfileBanking from "@/pages/UserProfileBanking"; // Complete user profile with integrated banking
import MyBets from "@/pages/MyBets"; // User betting history and tracking
import WeParlayCash from "@/pages/WeParlayCash"; // WeParlay Cash hub and management
import BettingManager from "@/pages/BettingManager";
import PaymentDemo from "@/pages/PaymentDemo";
import WalletTest from "@/pages/WalletTest";
import UserProfilePage from "@/pages/UserProfilePage";
import FantasySportsEnhanced from "@/pages/FantasySportsEnhanced";
import GamingIntegration from "@/pages/GamingIntegration";
import LiveSportsStreaming from "@/pages/LiveSportsStreaming";
import MainLayout from "@/components/layout/MainLayout";
import SimpleOnboarding from "@/components/onboarding/SimpleOnboarding";
import MobileVoiceBetting from "@/components/mobile/MobileVoiceBetting";
import { CurrencyModeProvider } from "./contexts/CurrencyModeContext";
import { TeamThemeProvider } from "./contexts/TeamThemeContext";
import { BetSlipProvider } from "./contexts/BetSlipContext";
import { OnboardingProvider, useOnboarding } from "./contexts/OnboardingContext";
import { BettingProvider } from "./contexts/BettingContext";
import InteractiveOnboardingWizard from "./components/onboarding/InteractiveOnboardingWizard";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import OnboardingDemo from "@/pages/OnboardingDemo";
import UnifiedGaming from "@/pages/UnifiedGaming";
import UnifiedSports from "@/pages/UnifiedSports";
import ComprehensiveBetting from "@/pages/ComprehensiveBetting";
import Odds from "@/pages/Odds";
import Parlays from "@/pages/Parlays";
import BettingAcademy from "@/pages/BettingAcademy";
import LiveHeatmap from "@/pages/LiveHeatmap";
import ErrorBoundary from "./components/ErrorBoundary";
import ThemeColorManager from "@/pages/ThemeColorManager";
import SignUpEnhanced from "@/pages/SignUpEnhanced";
import WalletManagementEnhanced from "@/pages/WalletManagementEnhanced";
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
import PlatformSettings from "@/pages/admin/PlatformSettings";
import VisualComponentEditorPage from "./pages/admin/VisualComponentEditor";

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
      <Route path="/live-betting" component={BettingExperience} />
      <Route path="/live-heatmap" component={LiveHeatmap} />
      <Route path="/live-streaming" component={LiveSportsStreaming} />
      <Route path="/my-bets" component={MyBets} />
      <Route path="/results" component={Results} />
      <Route path="/parlays" component={Parlays} />

      {/* Sports Pages */}
      <Route path="/sport/:sportKey" component={SportPage} />
      <Route path="/unified-sports" component={UnifiedSports} />

      {/* Gaming & Esports */}
      <Route path="/gaming" component={UnifiedGaming} />
      <Route path="/gaming-integration" component={GamingIntegration} />
      <Route path="/esports-hub" component={EsportsHub} />
      <Route path="/betting-challenges" component={BettingChallenges} />
       {/* Add /betting-challenge route for evaluation */}
        <Route path="/betting-challenge" component={BettingChallenges} />

      {/* Fantasy Sports */}
      <Route path="/fantasy" component={FantasySportsEnhanced} />

      {/* Tournaments */}
      <Route path="/tournaments" component={Tournaments} />
      <Route path="/tournament/:id" component={Tournaments} />

      {/* Social Features */}
      <Route path="/social-betting" component={SocialBetting} />
      <Route path="/head-to-head" component={HeadToHeadBetting} />

      {/* Trivia */}
      <Route path="/trivia" component={Trivia} />

      {/* Enhanced Features */}
      <Route path="/enhanced-features" component={EnhancedFeatures} />

      {/* VIP Features */}
      <Route path="/vip" component={VipFeatures} />

      {/* WeParlay Cash */}
      <Route path="/weparlay-cash" component={WeParlayCash} />

      {/* Wallet & Banking */}
      <Route path="/wallet" component={WalletManagement} />
      <Route path="/wallet-management-enhanced" component={WalletManagementEnhanced} />
      <Route path="/wallet-test" component={WalletTest} />
      <Route path="/user-profile-banking" component={UserProfileBanking} />
      <Route path="/user-profile" component={UserProfilePage} />

      {/* Payment & Demo */}
      <Route path="/payment-demo" component={PaymentDemo} />
      <Route path="/onboarding-demo" component={OnboardingDemo} />
      <Route path="/notification-test" component={NotificationTest} />
      <Route path="/sms-challenge" component={SmsChallenge} />

      {/* Academy */}
      <Route path="/betting-academy" component={BettingAcademy} />

      {/* Settings */}
      <Route path="/settings" component={Settings} />
      <Route path="/security-settings" component={SecuritySettings} />
      <Route path="/theme-settings" component={ThemeSettingsPage} />
      <Route path="/theme-color-manager" component={ThemeColorManager} />

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
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/manage-users" component={ManageUsers} />
      <Route path="/admin/financial-overview" component={FinancialOverview} />
      <Route path="/admin/analytics" component={Analytics} />
      <Route path="/admin/platform-settings" component={PlatformSettings} />
      <Route path="/admin/visual-component-editor" component={VisualComponentEditorPage} />
      <Route path="/admin/social-media-dashboard" component={SocialMediaDashboard} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/force-admin" component={AdminDashboard} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin-bypass" component={AdminBypass} />
      <Route path="/owner-access" component={OwnerAccess} />

      {/* Default route */}
      <Route path="/" component={Home} />
       <Route path="/site-navigation" component={SiteNavigation} />
            <Route path="/page-status-checker" component={PageStatusChecker} />
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
  // Initialize Google Analytics when app loads
  React.useEffect(() => {
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