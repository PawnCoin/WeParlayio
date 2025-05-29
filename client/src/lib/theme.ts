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
    foreground: "#1a1a1a", // High contrast text
    card: "#f8fafc",
    cardForeground: "#1e293b",
    primary: "#2563eb", // Professional blue
    primaryForeground: "#ffffff",
    secondary: "#f1f5f9",
    secondaryForeground: "#334155",
    muted: "#f1f5f9",
    mutedForeground: "#64748b",
    accent: "#e2e8f0",
    accentForeground: "#1e293b",
    destructive: "#dc2626",
    destructiveForeground: "#ffffff",
    border: "#e2e8f0",
    input: "#e2e8f0",
    ring: "#2563eb",
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

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
