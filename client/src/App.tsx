import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import LiveBettingReal from "@/pages/LiveBettingReal";
import FantasySports from "@/pages/FantasySports";
import Tournaments from "@/pages/Tournaments";
import Results from "@/pages/Results";
import Social from "@/pages/Social";
import SocialBetting from "@/pages/SocialBetting";
import Settings from "@/pages/Settings";
import SecuritySettings from "@/pages/SecuritySettings"; // Advanced security & wallet management
import HeadToHeadBetting from "@/pages/HeadToHeadBetting"; // Head-to-head real money betting
import SignUp from "@/pages/SignUp";
import SignUpEnhanced from "@/pages/SignUpEnhanced";
import LoginEnhanced from "@/pages/LoginEnhanced";
import AuthTestDemo from "@/pages/AuthTestDemo";
import UserDirectory from "@/pages/UserDirectory";
import SocialMediaBots from "@/pages/SocialMediaBots";
import SocialMediaDashboard from "@/pages/SocialMediaDashboard";
import EmailMonitoring from "@/pages/EmailMonitoring";
import VideoGaming from "./pages/VideoGaming";
import VipFeatures from "./pages/VipFeatures";
import WalletManagement from "./pages/WalletManagement";
import WalletManagementEnhanced from "./pages/WalletManagementEnhanced";
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
import LiveBettingEnhanced from "@/pages/LiveBettingEnhanced";
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
import LiveBettingEnhanced from "@/pages/BettingExperience";

// Import admin components
import AdminBypass from "@/pages/AdminBypass";

// Admin route guard component
const AdminRoute = ({ component: Component, ...rest }: any) => {
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [, navigate] = useLocation();

  React.useEffect(() => {
    // Check if user has admin access
    const hasAdminAccess = localStorage.getItem('weparlay-admin-access') === 'true';
    const adminExpiry = localStorage.getItem('weparlay-admin-expiry');

    if (hasAdminAccess && adminExpiry && parseInt(adminExpiry) > Date.now()) {
      setIsAuthorized(true);
    } else {
      // Redirect to admin bypass page
      navigate('/admin-bypass');
    }

    setIsLoading(false);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthorized ? <Component {...rest} /> : null;
};

function Router() {
  // Track page views when routes change
  useAnalytics();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/live-betting" component={LiveBettingEnhanced} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin" component={(props) => <AdminRoute component={AdminDashboard} {...props} />} />
      <Route path="/admin-dashboard" component={(props) => <AdminRoute component={AdminDashboard} {...props} />} />
      <Route path="/admin-bypass" component={AdminBypass} />
      <Route path="/live-betting-classic" component={LiveBettingReal} />
      <Route path="/betting-dashboard" component={BettingDashboard} />
      <Route path="/enhanced-features" component={EnhancedFeatures} />
      <Route path="/vip" component={VipFeatures} />
      <Route path="/fantasy" component={FantasySports} />
      <Route path="/tournaments" component={Tournaments} />
      <Route path="/results" component={Results} />
      <Route path="/social" component={Social} />
      <Route path="/social-betting" component={SocialBetting} />
      <Route path="/gaming" component={UnifiedGaming} />
      <Route path="/unified-sports" component={UnifiedSports} />
      <Route path="/comprehensive-betting" component={ComprehensiveBetting} />
      <Route path="/odds" component={Odds} />
      <Route path="/parlays" component={Parlays} />
      <Route path="/betting-academy" component={BettingAcademy} />
      <Route path="/live-heatmap" component={LiveHeatmap} />
      <Route path="/video-gaming" component={VideoGaming} />
      <Route path="/esports-hub" component={EsportsHub} />
      <Route path="/gaming-integration" component={UnifiedGaming} />
      <Route path="/trivia" component={Trivia} />
      <Route path="/settings" component={Settings} />
      <Route path="/security-settings" component={SecuritySettings} />
      <Route path="/security-info" component={SecurityInfo} />
      <Route path="/security" component={SecurityInfo} />
      <Route path="/head-to-head" component={HeadToHeadBetting} />
      <Route path="/signup" component={SignUpEnhanced} />
      <Route path="/signup-classic" component={SignUp} />
      <Route path="/signup-enhanced" component={SignUpEnhanced} />
      <Route path="/login" component={LoginEnhanced} />
      <Route path="/login-enhanced" component={LoginEnhanced} />
      <Route path="/mobile-login" component={MobileLogin} />
      <Route path="/auth-test" component={AuthTestDemo} />
      <Route path="/auth-test-demo" component={AuthTestDemo} />
      <Route path="/community" component={UserDirectory} />
      <Route path="/users" component={UserDirectory} />
      <Route path="/social-bots" component={(props) => <AdminRoute component={SocialMediaBots} {...props} />} />
      <Route path="/social-dashboard" component={(props) => <AdminRoute component={SocialMediaDashboard} {...props} />} />
      <Route path="/email-monitoring" component={EmailMonitoring} />
      <Route path="/theme-manager" component={ThemeSettingsPage} />
      <Route path="/sports/:sportKey" component={SportPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/support" component={Support} />
      <Route path="/crypto-information" component={CryptoInformation} />
      <Route path="/sms-challenge" component={SmsChallenge} />
      <Route path="/security-info" component={SecurityInfo} />
      <Route path="/theme-color-manager" component={ThemeColorManager} />
      <Route path="/theme-settings" component={ThemeSettingsPage} />
      <Route path="/notification-test" component={NotificationTest} />
      <Route path="/profile" component={UserProfileBanking} />
      <Route path="/user-profile" component={UserProfileBanking} />
      <Route path="/my-account" component={UserProfileBanking} />
      <Route path="/my-bets" component={MyBets} />
      <Route path="/weparlay-cash" component={WeParlayCash} />
      <Route path="/onboarding-demo" component={OnboardingDemo} />
      <Route path="/wallet-management" component={WalletManagement} />
      <Route path="/wallet-management-enhanced" component={WalletManagementEnhanced} />
      
      {/* Additional Pages - Previously Missing Routes */}
      <Route path="/betting-manager" component={BettingManager} />
      <Route path="/live-betting-fixed" component={LiveBettingReal} />
      <Route path="/payment-demo" component={PaymentDemo} />
      <Route path="/wallet-test" component={WalletTest} />
      <Route path="/user-profile-page" component={UserProfilePage} />
      <Route path="/fantasy-enhanced" component={FantasySportsEnhanced} />
      <Route path="/gaming-integration-alt" component={GamingIntegration} />
      <Route path="/live-betting-enhanced" component={LiveBettingEnhanced} />
      
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
        <Router />
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