import React, { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/components/layout/MainLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import Home from "@/pages/Home";
import { CurrencyModeProvider } from "@/contexts/CurrencyModeContext";
import { TeamThemeProvider } from "@/contexts/TeamThemeContext";
import { BetSlipProvider } from "@/contexts/BetSlipContext";
import { BettingProvider } from "@/contexts/BettingContext";

const LiveSportsStreaming = lazy(() => import("@/pages/LiveSportsStreaming"));
const Tournaments = lazy(() => import("@/pages/Tournaments"));
const P2pBetting = lazy(() => import("@/pages/P2pBetting"));
const MyBets = lazy(() => import("@/pages/MyBets"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const AuthenticationHub = lazy(() => import("@/pages/AuthenticationHub"));
const ComingSoonFinancialServices = lazy(() => import("@/pages/ComingSoonFinancialServices"));
const Settings = lazy(() => import("@/pages/Settings"));
const SecuritySettings = lazy(() => import("@/pages/SecuritySettings"));
const Support = lazy(() => import("@/pages/Support"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const SecurityInfo = lazy(() => import("@/pages/SecurityInfo"));
const TierPricing = lazy(() => import("@/pages/TierPricing"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const NotFound = lazy(() => import("@/pages/not-found"));

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
      <Route path="/banking"><ComingSoonFinancialServices service="banking" /></Route>
      <Route path="/crypto-wallet"><ComingSoonFinancialServices service="crypto" /></Route>
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
                <MainLayout>
                  <ErrorBoundary>
                    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
                      <Router />
                    </Suspense>
                  </ErrorBoundary>
                </MainLayout>
              </BettingProvider>
            </BetSlipProvider>
          </TeamThemeProvider>
        </CurrencyModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
