import React from "react";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/components/layout/MainLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import Home from "@/pages/Home";
import LiveSportsStreaming from "@/pages/LiveSportsStreaming";
import Tournaments from "@/pages/Tournaments";
import P2pBetting from "@/pages/P2pBetting";
import MyBets from "@/pages/MyBets";
import UserProfile from "@/pages/UserProfile";
import AuthenticationHub from "@/pages/AuthenticationHub";
import BankingSystem from "@/pages/BankingSystem";
import CryptoWallet from "@/pages/CryptoWallet";
import Settings from "@/pages/Settings";
import SecuritySettings from "@/pages/SecuritySettings";
import Support from "@/pages/Support";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import SecurityInfo from "@/pages/SecurityInfo";
import TierPricing from "@/pages/TierPricing";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";
import { CurrencyModeProvider } from "@/contexts/CurrencyModeContext";
import { TeamThemeProvider } from "@/contexts/TeamThemeContext";
import { BetSlipProvider } from "@/contexts/BetSlipContext";
import { BettingProvider } from "@/contexts/BettingContext";
import MobileVoiceBetting from "@/components/mobile/MobileVoiceBetting";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sports" component={Home} />
      <Route path="/live-betting" component={Home} />
      <Route path="/custom-bets" component={P2pBetting} />
      <Route path="/p2p-betting" component={P2pBetting} />
      <Route path="/tournaments" component={Tournaments} />
      <Route path="/tournaments/:id" component={Tournaments} />
      <Route path="/live-tv" component={LiveSportsStreaming} />
      <Route path="/live-sports-streaming" component={LiveSportsStreaming} />
      <Route path="/my-bets" component={MyBets} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/auth" component={AuthenticationHub} />
      <Route path="/login" component={AuthenticationHub} />
      <Route path="/signup" component={AuthenticationHub} />
      <Route path="/banking" component={BankingSystem} />
      <Route path="/crypto-wallet" component={CryptoWallet} />
      <Route path="/settings" component={Settings} />
      <Route path="/security-settings" component={SecuritySettings} />
      <Route path="/support" component={Support} />
      <Route path="/contact" component={Contact} />
      <Route path="/about" component={About} />
      <Route path="/tiers" component={TierPricing} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/security-info" component={SecurityInfo} />
      <Route path="*" component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CurrencyModeProvider>
          <TeamThemeProvider>
            <BetSlipProvider>
              <BettingProvider>
                <Toaster />
                <MainLayout><ErrorBoundary><Router /></ErrorBoundary></MainLayout>
                <MobileVoiceBetting />
              </BettingProvider>
            </BetSlipProvider>
          </TeamThemeProvider>
        </CurrencyModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
