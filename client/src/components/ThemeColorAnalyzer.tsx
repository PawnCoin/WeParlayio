import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  getContrastRatio, 
  meetsWCAGAA, 
  meetsWCAGAAA,
  generateThemeColorPalette
} from "@/lib/themeColorUtils";

interface ColorContrastResult {
  foreground: string;
  background: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
}

const WEPARLAY_COLORS = {
  blue: "#3498db",
  green: "#2ecc71",
  orange: "#e67e22",
};

export default function ThemeColorAnalyzer() {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [primaryColor, setPrimaryColor] = useState<string>(WEPARLAY_COLORS.blue);
  const [colorPalette, setColorPalette] = useState<any>(null);
  const [contrastResults, setContrastResults] = useState<ColorContrastResult[]>([]);
  
  // Analyze current theme when component mounts or theme/primary color changes
  useEffect(() => {
    const newPalette = generateThemeColorPalette(primaryColor);
    setColorPalette(newPalette);
    
    const palette = newPalette[currentTheme];
    const results: ColorContrastResult[] = [];
    
    // Test all foreground/background combinations
    Object.entries(palette).forEach(([bgKey, bgValue]) => {
      if (bgKey.includes('Foreground')) return; // Skip foreground colors as backgrounds
      
      Object.entries(palette).forEach(([fgKey, fgValue]) => {
        if (!fgKey.includes('Foreground')) return; // Only use foreground colors as text
        
        const ratio = getContrastRatio(fgValue as string, bgValue as string);
        results.push({
          foreground: fgValue as string,
          background: bgValue as string,
          ratio,
          passesAA: meetsWCAGAA(fgValue as string, bgValue as string),
          passesAAA: meetsWCAGAAA(fgValue as string, bgValue as string)
        });
      });
    });
    
    setContrastResults(results);
  }, [currentTheme, primaryColor]);
  
  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>WeParlay Theme Color Analyzer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4 space-x-4">
          <div>
            <div className="mb-2 font-medium">Theme Mode</div>
            <Button 
              onClick={toggleTheme}
              variant="outline"
            >
              Toggle to {currentTheme === 'light' ? 'Dark' : 'Light'} Mode
            </Button>
          </div>
          
          <div>
            <div className="mb-2 font-medium">Primary Color</div>
            <div className="flex space-x-2">
              {Object.entries(WEPARLAY_COLORS).map(([name, color]) => (
                <button
                  key={name}
                  className={`w-8 h-8 rounded-full border ${primaryColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setPrimaryColor(color)}
                  aria-label={`Set ${name} as primary color`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Color Palette Preview</h3>
          {colorPalette && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-md" style={{ backgroundColor: colorPalette[currentTheme].background }}>
                <div className="mb-2 font-medium" style={{ color: colorPalette[currentTheme].foreground }}>Background</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded" style={{ backgroundColor: colorPalette[currentTheme].primary }}>
                    <span style={{ color: colorPalette[currentTheme].primaryForeground }}>Primary</span>
                  </div>
                  <div className="p-2 rounded" style={{ backgroundColor: colorPalette[currentTheme].secondary }}>
                    <span style={{ color: colorPalette[currentTheme].secondaryForeground }}>Secondary</span>
                  </div>
                  <div className="p-2 rounded" style={{ backgroundColor: colorPalette[currentTheme].accent }}>
                    <span style={{ color: colorPalette[currentTheme].accentForeground }}>Accent</span>
                  </div>
                  <div className="p-2 rounded" style={{ backgroundColor: colorPalette[currentTheme].muted }}>
                    <span style={{ color: colorPalette[currentTheme].mutedForeground }}>Muted</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Contrast Check</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {contrastResults.map((result, index) => (
                    <div 
                      key={index} 
                      className="text-xs p-2 rounded-md flex items-center justify-between"
                      style={{ backgroundColor: result.background }}
                    >
                      <span style={{ color: result.foreground }}>
                        Sample Text
                      </span>
                      <div className="bg-white bg-opacity-90 text-black p-1 rounded text-xs">
                        {result.ratio.toFixed(2)}:1
                        {!result.passesAA && (
                          <span className="ml-1 text-red-600">⚠️</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {contrastResults.some(r => !r.passesAA) && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              Some color combinations don't meet WCAG AA standards (4.5:1 contrast ratio).
              Consider adjusting the colors for better accessibility.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}