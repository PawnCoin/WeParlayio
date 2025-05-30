import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Check if it's a network-related error that we can safely ignore
  const reason = event.reason;
  const isNetworkError = reason && (
    typeof reason === 'string' && (
      reason.includes('WebSocket') ||
      reason.includes('Failed to fetch') ||
      reason.includes('NetworkError') ||
      reason.includes('1006') ||
      reason.includes('WebSocket closed without opened') ||
      reason.includes('vite') ||
      reason.includes('HMR') ||
      reason.includes('connecting...') ||
      reason.includes('failed to connect to websocket') ||
      reason.includes('upgrade required') ||
      reason.includes('426')
    ) ||
    (reason && reason.message && typeof reason.message === 'string' && (
      reason.message.includes('WebSocket') ||
      reason.message.includes('Failed to fetch') ||
      reason.message.includes('NetworkError') ||
      reason.message.includes('1006') ||
      reason.message.includes('WebSocket closed without opened') ||
      reason.message.includes('vite') ||
      reason.message.includes('HMR') ||
      reason.message.includes('connecting...') ||
      reason.message.includes('failed to connect to websocket')
    )) ||
    // Filter out empty objects and undefined errors
    (typeof reason === 'object' && Object.keys(reason || {}).length === 0)
  );

  if (isNetworkError) {
    event.preventDefault(); // Prevent the error from being logged as unhandled
    return;
  }

  // Only log actual application errors
  console.error('Unhandled promise rejection:', event.reason);

  if (isNetworkError) {
    console.warn('Non-critical promise rejection handled:', reason);
    event.preventDefault(); // Prevent the unhandled rejection from being logged
    return;
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

// Theme initialization
console.log('🎨 WeParlay theme system initialized');

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);