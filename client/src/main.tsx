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
  
  // Prevent crashes from missing modules or WordPress references
  if (event.error?.message?.includes('does not provide an export named') ||
      event.error?.message?.includes('wordpressSync') || 
      event.error?.message?.includes('initWordPressSync') ||
      event.error?.message?.includes('/src/lib/wordpressSync.ts')) {
    console.warn('Module import error handled gracefully - continuing without problematic module');
    event.preventDefault();
    return;
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);

  // Check if it's a network-related error or WordPress reference that we can safely ignore
  const reason = event.reason;
  const isIgnorableError = reason && (
    typeof reason === 'string' && (
      reason.includes('WebSocket') ||
      reason.includes('Failed to fetch') ||
      reason.includes('NetworkError') ||
      reason.includes('1006') ||
      reason.includes('wordpressSync') ||
      reason.includes('initWordPressSync') ||
      reason.includes('/src/lib/wordpressSync.ts')
    ) ||
    (reason.message && typeof reason.message === 'string' && (
      reason.message.includes('WebSocket') ||
      reason.message.includes('Failed to fetch') ||
      reason.message.includes('NetworkError') ||
      reason.message.includes('1006') ||
      reason.message.includes('wordpressSync') ||
      reason.message.includes('initWordPressSync') ||
      reason.message.includes('/src/lib/wordpressSync.ts')
    ))
  );

  if (isIgnorableError) {
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