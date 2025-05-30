
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import App from './App';
import './index.css';
import { initializeCrashPrevention } from './utils/crashPrevention';
import { errorReporting } from './utils/errorReporting';
import ErrorBoundary from './components/ErrorBoundary';

// Initialize crash prevention first
initializeCrashPrevention();

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Safe initialization function
function initializeApp() {
  try {
    const root = ReactDOM.createRoot(
      document.getElementById('root') as HTMLElement
    );

    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <App />
              <Toaster />
            </BrowserRouter>
          </QueryClientProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );

    console.log('🚀 WeParlay application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    errorReporting.reportError({
      message: 'App initialization failed',
      errorType: 'javascript',
      severity: 'critical',
      context: { error }
    });
    
    // Show fallback UI
    document.getElementById('root')!.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="color: #1f2937; margin-bottom: 1rem;">WeParlay</h1>
          <p style="color: #6b7280; margin-bottom: 1rem;">Loading your premium betting experience...</p>
          <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer;">
            Reload
          </button>
        </div>
      </div>
    `;
  }
}

// Initialize the app
initializeApp();
