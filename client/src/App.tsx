import { Switch, Route } from "wouter";
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
import SignUp from "@/pages/SignUp";
import VideoGaming from "@/pages/VideoGaming";
import Trivia from "@/pages/Trivia";
import BettingExperience from "@/pages/BettingExperience"; // New enhanced betting page
import SportPage from "@/pages/SportPage"; // New sport page
import BettingDashboard from "@/pages/BettingDashboard"; // Professional sports betting dashboard
import Login from "@/pages/Login"; // Login page with social login options
import EnhancedFeatures from "@/pages/EnhancedFeatures"; // Advanced features page
import VipFeatures from "@/pages/VipFeatures"; // VIP exclusive section
import MainLayout from "@/components/layout/MainLayout";
import SimpleOnboarding from "@/components/onboarding/SimpleOnboarding";
import MobileVoiceBetting from "@/components/mobile/MobileVoiceBetting";
import { CurrencyModeProvider } from "./contexts/CurrencyModeContext";
import { TeamThemeProvider } from "./contexts/TeamThemeContext";
import { BetSlipProvider } from "./contexts/BetSlipContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/live-betting" component={BettingExperience} />
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
      <Route path="/signup" component={SignUp} />
      <Route path="/login" component={Login} />
      <Route path="/sports/:sportKey" component={SportPage} />
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
