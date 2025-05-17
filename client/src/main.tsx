import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";
import ThemeProvider from "./lib/ThemeProvider";
import { initWordPressSync } from "./lib/wordpressSync";

// Initialize WordPress design sync when the app loads
// This allows design changes made in WordPress to automatically apply to the app
initWordPressSync();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);
