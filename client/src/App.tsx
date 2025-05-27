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
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { BetSlipProvider } from "@/contexts/BetSlipContext";
import { BettingProvider } from "@/contexts/BettingContext";
import { TeamThemeProvider } from "@/contexts/TeamThemeContext";
import { CurrencyModeProvider } from "@/contexts/CurrencyModeContext";
import ThemeProvider from "@/lib/ThemeProvider";

function Router() {
  return (
    <Switch>
      {/* Home and main pages */}
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/comprehensive-betting" component={ComprehensiveBetting} />
      <Route path="/unified-sports" component={UnifiedSports} />
      <Route path="/onboarding" component={OnboardingDemo} />
      <Route path="/live-betting" component={LiveBettingReal} />
      <Route path="/fantasy-sports" component={FantasySports} />
      <Route path="/tournaments" component={Tournaments} />
      <Route path="/results" component={Results} />
      <Route path="/social" component={Social} />
      <Route path="/social-betting" component={SocialBetting} />
      <Route path="/odds" component={Odds} />
      <Route path="/parlays" component={Parlays} />
      <Route path="/video-gaming" component={UnifiedGaming} />
      <Route path="/gaming-integration" component={UnifiedGaming} />
      <Route path="/trivia" component={Trivia} />
      <Route path="/settings" component={Settings} />
      <Route path="/security-settings" component={SecuritySettings} />
      <Route path="/security" component={SecurityInfo} />
      <Route path="/head-to-head" component={HeadToHeadBetting} />
      <Route path="/signup" component={SignUpEnhanced} />
      <Route path="/signup-enhanced" component={SignUpEnhanced} />
      <Route path="/login" component={LoginEnhanced} />
      <Route path="/login-enhanced" component={LoginEnhanced} />
      <Route path="/mobile-login" component={MobileLogin} />
      <Route path="/auth-test" component={AuthTestDemo} />
      <Route path="/community" component={UserDirectory} />
      <Route path="/users" component={UserDirectory} />
      <Route path="/user/:userId" component={UserProfilePage} />
      <Route path="/social-bots" component={SocialMediaBots} />
      <Route path="/email-monitoring" component={EmailMonitoring} />
      <Route path="/theme-manager" component={ThemeSettingsPage} />
      <Route path="/sports/:sportKey" component={SportPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/support" component={Support} />
      <Route path="/notification-test" component={NotificationTest} />
      <Route path="/wallet-management" component={WalletManagement} />
      <Route path="/crypto-info" component={CryptoInformation} />
      <Route path="/sms-challenge" component={SmsChallenge} />
      <Route path="/enhanced-features" component={EnhancedFeatures} />
      <Route path="/vip" component={VipFeatures} />
      <Route path="/betting-dashboard" component={BettingDashboard} />
      <Route path="/betting-experience" component={BettingExperience} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin-bypass" component={AdminBypass} />
      <Route path="/profile" component={() => <div>Profile Page</div>} />
      
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