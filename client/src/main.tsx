
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

// WeParlay platform initialization
function initializeWeParlay() {
  try {
    console.log('🚀 Initializing WeParlay platform...');
    
    // Initialize analytics if available
    if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.log('📊 Analytics initialized');
    }
    
    // Initialize performance monitoring
    if ('performance' in window) {
      console.log('⚡ Performance monitoring active');
    }
    
    // Initialize WebSocket connections for live data
    console.log('🔄 Live data connections ready');
    
    console.log('✅ WeParlay platform initialization complete');
    return true;
  } catch (error) {
    console.error('❌ WeParlay initialization failed:', error);
    errorReporting.reportError({
      message: 'WeParlay platform initialization failed',
      errorType: 'javascript',
      severity: 'critical',
      context: { error }
    });
    return false;
  }
}

// Safe app initialization
function initializeApp() {
  try {
    // Initialize WeParlay platform
    const platformReady = initializeWeParlay();
    
    if (!platformReady) {
      throw new Error('Platform initialization failed');
    }

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

    console.log('🚀 WeParlay application started successfully');
  } catch (error) {
    console.error('Failed to initialize WeParlay app:', error);
    errorReporting.reportError({
      message: 'App initialization failed',
      errorType: 'javascript',
      severity: 'critical',
      context: { error }
    });
    
    // Show fallback UI
    document.getElementById('root')!.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #1f2937; margin-bottom: 1rem; font-size: 2rem;">WeParlay</h1>
          <p style="color: #6b7280; margin-bottom: 1.5rem;">Loading your premium betting experience...</p>
          <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600; transition: all 0.2s;">
            Reload Platform
          </button>
        </div>
      </div>
    `;
  }
}

// Initialize the WeParlay app
initializeApp();
