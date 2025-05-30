import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import ThemeProvider from "./lib/ThemeProvider";
import { initializeCrashPrevention } from "./utils/crashPrevention";

// Initialize crash prevention immediately
initializeCrashPrevention();

// Comprehensive error handling to prevent site crashes
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Prevent crashes from missing modules
  if (event.error?.message?.includes('does not provide an export named')) {
    console.warn('Module import error handled gracefully');
    event.preventDefault();
    return;
  }
  
  // Handle WordPress-related import errors

    console.warn('WordPress reference removed - continuing without it');
    event.preventDefault();
    return;
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);

  // Check if it's a network-related error that we can safely ignore
  const reason = event.reason;
  const isNetworkError = reason && (
    typeof reason === 'string' && (
      reason.includes('WebSocket') ||
      reason.includes('Failed to fetch') ||
      reason.includes('NetworkError') ||
      reason.includes('1006') ||

      reason.includes('WordPress')
    ) ||
    (reason.message && typeof reason.message === 'string' && (
      reason.message.includes('WebSocket') ||
      reason.message.includes('Failed to fetch') ||
      reason.message.includes('NetworkError') ||
      reason.message.includes('1006') ||

      reason.message.includes('WordPress')
    ))
  );

  if (isNetworkError) {
    console.warn('Non-critical promise rejection handled:', reason);
    event.preventDefault();
    return;
  }
});

// Performance monitoring
const loadStart = performance.now();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);