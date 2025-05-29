/**
 * Theme Color Utilities
 * 
 * This module provides utilities for calculating color contrast and generating
 * recommended color palettes for light and dark modes.
 */

// Calculate relative luminance for WCAG contrast calculations
function getLuminance(hexColor: string): number {
  // Convert hex to RGB
  let r = parseInt(hexColor.slice(1, 3), 16) / 255;
  let g = parseInt(hexColor.slice(3, 5), 16) / 255;
  let b = parseInt(hexColor.slice(5, 7), 16) / 255;
  
  // Adjust values based on perception
  r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(foreground: string, background: string): number {
  const lumFg = getLuminance(foreground);
  const lumBg = getLuminance(background);
  
  const light = Math.max(lumFg, lumBg);
  const dark = Math.min(lumFg, lumBg);
  
  return (light + 0.05) / (dark + 0.05);
}

// Check if a color pair meets WCAG AA standards (4.5:1 for normal text)
export function meetsWCAGAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

// Check if a color pair meets WCAG AAA standards (7:1 for normal text)
export function meetsWCAGAAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 7;
}

// Generate appropriate text color for a given background
export function getTextColorForBackground(background: string): string {
  const luminance = getLuminance(background);
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

// Adjust color brightness
export function adjustBrightness(color: string, amount: number): string {
  // Convert hex to RGB
  let r = parseInt(color.slice(1, 3), 16);
  let g = parseInt(color.slice(3, 5), 16);
  let b = parseInt(color.slice(5, 7), 16);
  
  // Adjust brightness
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Generate a contrasting color palette for both light and dark modes
export function generateThemeColorPalette(primaryColor: string) {
  // Calculate contrasting colors
  const isDarkPrimary = getLuminance(primaryColor) < 0.5;
  
  return {
    light: {
      background: "#FFFFFF",
      foreground: "#333333",
      primary: primaryColor,
      primaryForeground: isDarkPrimary ? "#FFFFFF" : "#000000",
      secondary: adjustBrightness(primaryColor, -30),
      secondaryForeground: isDarkPrimary ? "#FFFFFF" : "#000000",
      muted: "#F1F5F9",
      mutedForeground: "#64748B",
      accent: adjustBrightness(primaryColor, 30),
      accentForeground: isDarkPrimary ? "#000000" : "#FFFFFF",
    },
    dark: {
      background: "#0F172A",
      foreground: "#F8FAFC",
      primary: adjustBrightness(primaryColor, isDarkPrimary ? 30 : -30),
      primaryForeground: isDarkPrimary ? "#000000" : "#FFFFFF",
      secondary: adjustBrightness(primaryColor, isDarkPrimary ? -30 : 30),
      secondaryForeground: "#FFFFFF",
      muted: "#1E293B",
      mutedForeground: "#94A3B8",
      accent: adjustBrightness(primaryColor, isDarkPrimary ? 60 : -60),
      accentForeground: isDarkPrimary ? "#000000" : "#FFFFFF",
    }
  };
}

// Professional contrast validation (WCAG AA requires 4.5:1 for normal text, 3:1 for large text)
export function validateProfessionalContrast(foreground: string, background: string): {
  ratio: number;
  isAccessible: boolean;
  level: 'AAA' | 'AA' | 'Fail';
} {
  const ratio = getContrastRatio(foreground, background);
  
  return {
    ratio,
    isAccessible: ratio >= 4.5,
    level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail'
  };
}

// Generate professional color palette with guaranteed contrast
export function generateProfessionalPalette(primaryColor: string, isDarkMode: boolean) {
  const primaryL = getLuminance(primaryColor);
  
  if (isDarkMode) {
    return {
      background: "#0f172a",
      foreground: "#f8fafc",
      card: "#1e293b", 
      cardForeground: "#f1f5f9",
      primary: primaryL < 0.4 ? adjustBrightness(primaryColor, 40) : primaryColor,
      primaryForeground: "#ffffff",
      secondary: "#334155",
      secondaryForeground: "#f1f5f9",
      muted: "#334155",
      mutedForeground: "#94a3b8",
      accent: "#475569",
      accentForeground: "#f1f5f9",
      border: "#334155",
      input: "#334155",
    };
  } else {
    return {
      background: "#ffffff",
      foreground: "#1a1a1a",
      card: "#f8fafc",
      cardForeground: "#1e293b", 
      primary: primaryL > 0.6 ? adjustBrightness(primaryColor, -40) : primaryColor,
      primaryForeground: "#ffffff",
      secondary: "#f1f5f9",
      secondaryForeground: "#334155",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      accent: "#e2e8f0", 
      accentForeground: "#1e293b",
      border: "#e2e8f0",
      input: "#e2e8f0",
    };
  }
}

// This function can be used when creating component-specific overrides
export function generateComponentContrastColors(baseColor: string, isDarkMode: boolean) {
  const baseL = getLuminance(baseColor);
  
  if (isDarkMode) {
    // Dark mode - ensure text is light enough
    return {
      background: baseColor,
      text: baseL < 0.5 ? "#FFFFFF" : "#000000",
      border: adjustBrightness(baseColor, 30),
      highlight: adjustBrightness(baseColor, 20),
    };
  } else {
    // Light mode - ensure text is dark enough
    return {
      background: baseColor,
      text: baseL > 0.5 ? "#000000" : "#FFFFFF",
      border: adjustBrightness(baseColor, -30),
      highlight: adjustBrightness(baseColor, -15),
    };
  }
}