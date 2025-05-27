import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/lib/pages/not-found";
import Home from "@/lib/pages/Home";
import LiveBettingReal from "@/lib/pages/LiveBettingReal-fixed";
import ComprehensiveBetting from "@/lib/pages/ComprehensiveBetting";
import Odds from "@/lib/pages/Odds";
import Parlays from "@/lib/pages/Parlays";
import FantasySports from "@/lib/pages/FantasySportsEnhanced";
import Tournaments from "@/lib/pages/Tournaments";
import Results from "@/lib/pages/Results";
import Settings from "@/lib/pages/Settings";
import HeadToHeadBetting from "@/lib/pages/HeadToHeadBetting";
import SignUpEnhanced from "@/lib/pages/SignUpEnhanced";
import LoginEnhanced from "@/lib/pages/LoginEnhanced";
import BettingDashboard from "@/lib/pages/BettingDashboard";
import EnhancedFeatures from "@/lib/pages/EnhancedFeatures";
import VipFeatures from "@/lib/pages/VipFeatures";
import ThemeSettingsPage from "@/lib/pages/ThemeSettingsPage";
import WalletManagement from "@/lib/pages/WalletManagementEnhanced";
import CryptoInformation from "@/lib/pages/CryptoInformation";
import MainLayout from "@/components/layout/MainLayout";
import { BetSlipProvider } from "@/contexts/BetSlipContext";
import { BettingProvider } from "@/contexts/BettingContext";
import { TeamThemeProvider } from "@/contexts/TeamThemeContext";
import { CurrencyModeProvider } from "@/contexts/CurrencyModeContext";
import ThemeProvider from "@/lib/ThemeProvider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/live-betting" component={LiveBettingReal} />
      <Route path="/betting" component={ComprehensiveBetting} />
      <Route path="/odds" component={Odds} />
      <Route path="/parlays" component={Parlays} />
      <Route path="/dashboard" component={BettingDashboard} />
      <Route path="/results" component={Results} />
      <Route path="/enhanced-features" component={EnhancedFeatures} />
      <Route path="/wallet-management" component={WalletManagement} />
      <Route path="/crypto-guide" component={CryptoInformation} />
      <Route path="/head-to-head" component={HeadToHeadBetting} />
      <Route path="/vip-features" component={VipFeatures} />
      <Route path="/tournaments" component={Tournaments} />
      <Route path="/fantasy-sports" component={FantasySports} />
      <Route path="/login" component={LoginEnhanced} />
      <Route path="/signup" component={SignUpEnhanced} />
      <Route path="/settings" component={Settings} />
      <Route path="/theme-settings" component={ThemeSettingsPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BettingProvider>
          <BetSlipProvider>
            <CurrencyModeProvider>
              <TeamThemeProvider>
                <TooltipProvider>
                  <MainLayout>
                    <Router />
                  </MainLayout>
                  <Toaster />
                </TooltipProvider>
              </TeamThemeProvider>
            </CurrencyModeProvider>
          </BetSlipProvider>
        </BettingProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;