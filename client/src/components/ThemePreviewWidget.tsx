import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getContrastRatio } from "@/lib/themeColorUtils";

// This widget allows users to see a preview of how interface elements will look with the current theme

interface ThemePreviewWidgetProps {
  colorScheme?: any;
}

export default function ThemePreviewWidget({ colorScheme }: ThemePreviewWidgetProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Default WeParlay colors if none provided
  const colors = colorScheme || {
    primary: "#3498db",
    secondary: "#2ecc71",
    accent: "#e67e22",
    background: isDarkMode ? "#0f172a" : "#ffffff",
    foreground: isDarkMode ? "#f8fafc" : "#334155",
    card: isDarkMode ? "#1e293b" : "#ffffff",
    cardForeground: isDarkMode ? "#f8fafc" : "#334155",
  };
  
  // Calculate contrast ratios for accessibility feedback
  const primaryTextContrast = getContrastRatio(
    colors.primary, 
    isDarkMode ? "#0f172a" : "#ffffff"
  );
  
  const textPrimaryContrast = getContrastRatio(
    isDarkMode ? "#f8fafc" : "#334155", 
    colors.primary
  );
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Theme Preview</span>
          <div className="flex items-center space-x-2">
            <Switch
              id="theme-mode"
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
            />
            <Label htmlFor="theme-mode">Dark Mode</Label>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="p-4 rounded-md transition-colors duration-200"
          style={{ 
            backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
            color: isDarkMode ? "#f8fafc" : "#334155"
          }}
        >
          <h3 className="text-lg font-semibold mb-4">WeParlay Components</h3>
          
          <div className="space-y-6">
            {/* Button section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Buttons</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  style={{ 
                    backgroundColor: colors.primary,
                    color: textPrimaryContrast > 4.5 ? "#ffffff" : "#000000"
                  }}
                >
                  Primary Button
                </Button>
                <Button
                  variant="outline"
                  style={{ 
                    borderColor: colors.primary,
                    color: colors.primary
                  }}
                >
                  Outline Button
                </Button>
                <Button
                  style={{ 
                    backgroundColor: colors.secondary,
                    color: getContrastRatio("#ffffff", colors.secondary) > 4.5 ? "#ffffff" : "#000000"
                  }}
                >
                  Secondary Button
                </Button>
              </div>
              
              {primaryTextContrast < 4.5 && (
                <div className="text-xs text-amber-500 mt-1">
                  ⚠️ Warning: Button contrast ratio ({primaryTextContrast.toFixed(1)}:1) is below WCAG AA standards (4.5:1)
                </div>
              )}
            </div>
            
            {/* Card section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Cards</h4>
              <div className="grid grid-cols-2 gap-4">
                <div
                  style={{ 
                    backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                    color: isDarkMode ? "#f8fafc" : "#334155",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                  }}
                >
                  <h5 className="font-medium mb-2">Card Title</h5>
                  <p className="text-sm">This is a standard card component.</p>
                </div>
                
                <div
                  style={{ 
                    backgroundColor: colors.primary,
                    color: textPrimaryContrast > 4.5 ? "#ffffff" : "#000000",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                  }}
                >
                  <h5 className="font-medium mb-2">Colored Card</h5>
                  <p className="text-sm">This card uses the primary color.</p>
                </div>
              </div>
            </div>
            
            {/* Bet Slip Preview */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Bet Slip</h4>
              <div
                style={{ 
                  backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
                  borderColor: isDarkMode ? "#334155" : "#e5e7eb",
                  borderWidth: "1px",
                  borderRadius: "0.5rem",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{ 
                    backgroundColor: colors.primary,
                    color: textPrimaryContrast > 4.5 ? "#ffffff" : "#000000",
                    padding: "0.75rem",
                    fontWeight: "bold"
                  }}
                >
                  Bet Slip
                </div>
                
                <div className="p-3 space-y-2">
                  <div 
                    className="p-2 rounded text-xs"
                    style={{ 
                      backgroundColor: isDarkMode ? "#0f172a" : "#f8fafc",
                      color: isDarkMode ? "#f1f5f9" : "#334155",
                      borderWidth: "1px",
                      borderColor: isDarkMode ? "#334155" : "#e5e7eb",
                    }}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">Los Angeles Lakers</span>
                      <span 
                        className="px-1.5 py-0.5 rounded text-xs"
                        style={{ 
                          backgroundColor: isDarkMode ? "#334155" : "#e5e7eb",
                          color: isDarkMode ? "#f8fafc" : "#334155"
                        }}
                      >
                        +4.5
                      </span>
                    </div>
                    <div className="text-xs mt-1">Lakers vs Celtics</div>
                  </div>
                  
                  <div 
                    className="p-2 rounded text-xs"
                    style={{ 
                      backgroundColor: isDarkMode ? "#0f172a" : "#f8fafc",
                      color: isDarkMode ? "#f1f5f9" : "#334155",
                      borderWidth: "1px",
                      borderColor: isDarkMode ? "#334155" : "#e5e7eb",
                    }}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">Under 220.5</span>
                      <span 
                        className="px-1.5 py-0.5 rounded text-xs"
                        style={{ 
                          backgroundColor: isDarkMode ? "#334155" : "#e5e7eb",
                          color: isDarkMode ? "#f8fafc" : "#334155"
                        }}
                      >
                        -110
                      </span>
                    </div>
                    <div className="text-xs mt-1">Bulls vs Warriors</div>
                  </div>
                  
                  <Button
                    className="w-full mt-2"
                    style={{ 
                      backgroundColor: colors.primary,
                      color: textPrimaryContrast > 4.5 ? "#ffffff" : "#000000"
                    }}
                  >
                    Place Bet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}