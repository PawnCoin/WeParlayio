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
import VideoGaming from "@/pages/VideoGaming";
import Trivia from "@/pages/Trivia";
import BettingExperience from "@/pages/BettingExperience"; // New enhanced betting page
import SportPage from "@/pages/SportPage"; // New sport page
import BettingDashboard from "@/pages/BettingDashboard"; // Professional sports betting dashboard
import Login from "@/pages/Login"; // Login page with social login options
import EnhancedFeatures from "@/pages/EnhancedFeatures"; // Advanced features page
import VipFeatures from "@/pages/VipFeatures"; // VIP exclusive section
import ThemeSettingsPage from "@/pages/ThemeSettingsPage"; // Theme settings page
import AdminDashboard from "@/pages/AdminDashboard"; // Admin dashboard for platform owner
import PrivacyPolicy from "@/pages/PrivacyPolicy"; // Privacy policy page for social login requirements
import TermsOfService from "@/pages/TermsOfService"; // Terms of service page for social login requirements
import SecurityInfo from "@/pages/SecurityInfo"; // Security information page showing our protection measures
import Support from "@/pages/Support"; // Automated support system
import WalletManagement from "@/pages/WalletManagement"; // Cryptocurrency wallet management
import CryptoInformation from "@/pages/CryptoInformation"; // Cryptocurrency information and guides
import MainLayout from "@/components/layout/MainLayout";
import SimpleOnboarding from "@/components/onboarding/SimpleOnboarding";
import MobileVoiceBetting from "@/components/mobile/MobileVoiceBetting";
import { CurrencyModeProvider } from "./contexts/CurrencyModeContext";
import { TeamThemeProvider } from "./contexts/TeamThemeContext";
import { BetSlipProvider } from "./contexts/BetSlipContext";

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
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/live-betting" component={BettingExperience} />
      <Route path="/admin" component={(props) => <AdminRoute component={AdminDashboard} {...props} />} />
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
      <Route path="/video-gaming" component={VideoGaming} />
      <Route path="/trivia" component={Trivia} />
      <Route path="/settings" component={Settings} />
      <Route path="/security-settings" component={SecuritySettings} />
      <Route path="/security" component={SecurityInfo} />
      <Route path="/head-to-head" component={HeadToHeadBetting} />
      <Route path="/signup" component={SignUp} />
      <Route path="/login" component={Login} />
      <Route path="/theme-manager" component={ThemeSettingsPage} />
      <Route path="/sports/:sportKey" component={SportPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/support" component={Support} />
      <Route path="/wallet-management" component={WalletManagement} />
      <Route path="/crypto-information" component={CryptoInformation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CurrencyModeProvider>
          <TeamThemeProvider>
            <BetSlipProvider>
              <Toaster />
              <MainLayout>
                <Router />
              </MainLayout>
              <SimpleOnboarding />
              {/* Mobile voice betting floating button (visible on all pages) */}
              <MobileVoiceBetting />
            </BetSlipProvider>
          </TeamThemeProvider>
        </CurrencyModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
