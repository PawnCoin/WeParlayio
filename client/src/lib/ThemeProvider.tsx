import React, { useState, useEffect } from "react";
import { ThemeContext, Theme, PROFESSIONAL_COLORS } from "./theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for saved theme or user preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      if (savedTheme) return savedTheme;
    }
    
    // Default to dark mode for all new visitors
    return "dark";
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("theme", theme);
      
      const root = document.documentElement;
      
      if (theme === "dark") {
        root.classList.add("dark");
        // Apply dark mode CSS variables
        Object.entries(PROFESSIONAL_COLORS.dark).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value);
        });
      } else {
        root.classList.remove("dark");
        // Apply light mode CSS variables
        Object.entries(PROFESSIONAL_COLORS.light).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value);
        });
      }
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;