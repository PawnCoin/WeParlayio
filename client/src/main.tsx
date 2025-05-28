import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);

  // Don't prevent default for critical errors, but log them properly
  if (event.reason && event.reason.message && !event.reason.message.includes('WebSocket')) {
    console.warn('Non-critical promise rejection handled:', event.reason);
    event.preventDefault();
  }
});
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import ThemeProvider from "./lib/ThemeProvider";
import { initWordPressSync } from "./lib/wordpressSync";
import { BettingProvider } from "./contexts/BettingContext";
import { TeamThemeProvider } from "./contexts/TeamThemeContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { errorReporting } from "./utils/errorReporting";

// Initialize WordPress design sync when the app loads
// This allows design changes made in WordPress to automatically apply to the app
initWordPressSync();

// Performance monitoring
const loadStart = performance.now();

// Initialize error reporting
console.log('🛡️ WeParlay Error Reporting System initialized');

// Apply theme and WordPress config early
import('./lib/wordpressSync').then(({ applyWordPressConfig }) => {
  applyWordPressConfig();
}).catch(console.error);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);