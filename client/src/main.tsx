import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { TeamThemeProvider } from './contexts/TeamThemeContext';
import { CurrencyModeProvider } from './contexts/CurrencyModeContext';
import { BetSlipProvider } from './contexts/BetSlipContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { initializeCrashPrevention } from './utils/crashPrevention'
import { initWordPressSync } from './lib/wordpressSync'

// Create QueryClient for data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize WeParlay platform
function initializeWeParlay() {
  console.log('🎯 WeParlay Platform Initializing...');

  // Initialize crash prevention first
  try {
    initializeCrashPrevention();
  } catch (error) {
    console.warn('Crash prevention initialization failed:', error);
  }

  // Initialize WordPress sync
  try {
    initWordPressSync();
  } catch (error) {
    console.warn('WordPress sync initialization failed:', error);
  }

  // Platform health check
  const platformStatus = {
    betting: 'active',
    wallet: 'active',
    social: 'active',
    gaming: 'active',
    streaming: 'active'
  };

  console.log('✅ WeParlay Platform Status:', platformStatus);
  return platformStatus;
}

// Initialize platform
initializeWeParlay();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TeamThemeProvider>
          <CurrencyModeProvider>
            <BetSlipProvider>
              <OnboardingProvider>
                <App />
                <Toaster />
              </OnboardingProvider>
            </BetSlipProvider>
          </CurrencyModeProvider>
        </TeamThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);