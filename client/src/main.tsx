import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle unhandled promise rejections with better error recovery
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  
  // Always prevent crashes - log but don't crash the app
  event.preventDefault();
  
  // Check if it's a safe-to-ignore error
  const isSafeError = reason && (
    typeof reason === 'string' && (
      reason.includes('WebSocket') ||
      reason.includes('Failed to fetch') ||
      reason.includes('NetworkError') ||
      reason.includes('vite') ||
      reason.includes('HMR') ||
      reason.includes('connecting') ||
      reason.includes('upgrade required')
    ) ||
    (reason?.message && (
      reason.message.includes('WebSocket') ||
      reason.message.includes('Failed to fetch') ||
      reason.message.includes('NetworkError') ||
      reason.message.includes('vite')
    )) ||
    // Empty objects or null/undefined
    !reason || 
    (typeof reason === 'object' && Object.keys(reason || {}).length === 0)
  );

  if (isSafeError) {
    console.log('🔄 Non-critical error handled gracefully:', reason?.message || reason);
    return;
  }

  // Log actual application errors but don't crash
  console.warn('⚠️ Application error caught and handled:', reason);
  
  // Auto-recovery attempt
  setTimeout(() => {
    console.log('🔄 Attempting auto-recovery...');
    window.location.reload();
  }, 5000);
});
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import ThemeProvider from "./lib/ThemeProvider";
import { initWordPressSync } from "./lib/wordpressSync";
// Initialize WordPress design sync when the app loads
// This allows design changes made in WordPress to automatically apply to the app
initWordPressSync();

// Theme initialization
console.log('🎨 WeParlay theme system initialized');

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);