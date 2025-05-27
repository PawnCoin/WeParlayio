import React from "react";

// COMPONENT DISABLED - All toggle switches removed from WeParlay platform
// Currency switching is now handled exclusively through:
// 1. Blue WPC balance button in header 
// 2. Dropdown menu in betting sections
// This eliminates duplicate controls and user confusion

interface CurrencyModeToggleProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
  onCurrencyChange?: () => void;
}

export default function CurrencyModeToggle(props: CurrencyModeToggleProps) {
  // Return null to completely remove this toggle switch component
  return null;
}