import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/lib/pages/not-found";
import ComprehensiveBetting from "@/lib/pages/ComprehensiveBetting";
import LiveBettingReal from "@/lib/pages/LiveBettingReal-fixed";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { BetSlipProvider } from "@/contexts/BetSlipContext";
import { TeamThemeProvider } from "@/contexts/TeamThemeContext";
import { CurrencyModeProvider } from "@/contexts/CurrencyModeContext";
import ThemeProvider from "@/lib/ThemeProvider";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Main betting pages - accessible to everyone for BEST FUNCTIONING site */}
      <Route path="/" component={ComprehensiveBetting} />
      <Route path="/betting" component={ComprehensiveBetting} />
      <Route path="/live-betting" component={LiveBettingReal} />
      <Route path="/odds" component={LiveBettingReal} />
      <Route path="/parlays" component={LiveBettingReal} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
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
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;