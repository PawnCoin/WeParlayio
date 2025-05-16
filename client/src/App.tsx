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
import Settings from "@/pages/Settings";
import SignUp from "@/pages/SignUp";
import MainLayout from "@/components/layout/MainLayout";
import OnboardingProvider from "@/components/onboarding/OnboardingProvider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/live-betting" component={LiveBettingReal} />
      <Route path="/fantasy" component={FantasySports} />
      <Route path="/tournaments" component={Tournaments} />
      <Route path="/results" component={Results} />
      <Route path="/social" component={Social} />
      <Route path="/settings" component={Settings} />
      <Route path="/signup" component={SignUp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OnboardingProvider>
          <Toaster />
          <MainLayout>
            <Router />
          </MainLayout>
        </OnboardingProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
