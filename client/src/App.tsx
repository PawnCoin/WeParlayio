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