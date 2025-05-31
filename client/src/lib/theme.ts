import { createContext, useContext } from "react";

export type Theme = "dark" | "light";

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Professional color contrast ratios for accessibility (WCAG AA compliance)
export const PROFESSIONAL_COLORS = {
  light: {
    background: "#ffffff",
    foreground: "#0f172a", // Darker, higher contrast text
    card: "#ffffff",
    cardForeground: "#1e293b",
    primary: "#0ea5e9", // WeParlay sky blue - vibrant but professional
    primaryForeground: "#ffffff",
    secondary: "#f8fafc", // Clean light gray
    secondaryForeground: "#374151",
    muted: "#f1f5f9", // Subtle background
    mutedForeground: "#6b7280", // Medium gray for secondary text
    accent: "#10b981", // WeParlay green accent
    accentForeground: "#ffffff",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#e5e7eb", // Softer border
    input: "#f9fafb", // Light input background
    ring: "#0ea5e9", // Match primary
  },
  dark: {
    background: "#0f172a", // Deep navy for professional look
    foreground: "#f8fafc", // High contrast white
    card: "#1e293b",
    cardForeground: "#f1f5f9",
    primary: "#3b82f6", // Brighter blue for dark mode
    primaryForeground: "#ffffff",
    secondary: "#334155",
    secondaryForeground: "#f1f5f9",
    muted: "#334155",
    mutedForeground: "#94a3b8",
    accent: "#475569",
    accentForeground: "#f1f5f9",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#334155",
    input: "#334155",
    ring: "#3b82f6",
  }
};

export const WEPARLAY_COLORS = {
  primary: '#0ea5e9',      // Sky Blue (main brand)
  secondary: '#10b981',    // Emerald (success/money)
  accent: '#f59e0b',       // Amber (highlights)
  gold: '#eab308',         // Gold (premium features)
  red: '#ef4444',          // Red (danger/loss)
  gray: '#6b7280',         // Gray (neutral text)
  charcoal: '#374151',     // Dark gray (headings)
  steel: '#64748b',        // Steel gray (subtle text)
  orange: '#f97316',       // Orange (warnings/alerts)
  teal: '#14b8a6',         // Teal (info/cool accent)
  slate: '#475569',        // Slate (borders/dividers)
  emerald: '#059669'       // Emerald (wins/positive)
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);