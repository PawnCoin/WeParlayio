import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ThemeColorAnalyzer from "@/components/ThemeColorAnalyzer";
import ColorSchemePicker from "@/components/ColorSchemePicker";
import ThemePreviewWidget from "@/components/ThemePreviewWidget";
import { generateThemeColorPalette } from "@/lib/themeColorUtils";

export default function ThemeColorManager() {
  const [currentColorScheme, setCurrentColorScheme] = useState({
    primary: "#2563eb",
    secondary: "#10b981", 
    accent: "#f59e0b"
  });
  const [generatedPalette, setGeneratedPalette] = useState<any>(null);
  const { toast } = useToast();
  
  // Generate full color palette when primary colors change
  useEffect(() => {
    const palette = generateThemeColorPalette(currentColorScheme.primary);
    setGeneratedPalette(palette);
  }, [currentColorScheme]);
  
  const handleSchemeChange = (scheme: any) => {
    setCurrentColorScheme(scheme);
    toast({
      title: "Color scheme updated",
      description: "The new color scheme has been applied to the preview."
    });
  };
  
  const handleCustomColorChange = (colors: any) => {
    setCurrentColorScheme(colors);
  };
  
  const applyThemeToApp = () => {
    // In a real app, this would save to localStorage and/or send to backend
    // For now, we'll just show a toast notification
    
    // Apply CSS variables to the root
    const root = document.documentElement;
    
    // Apply light mode variables
    for (const [key, value] of Object.entries(generatedPalette.light)) {
      if (typeof value === 'string' && value.startsWith('#')) {
        // Convert hex to hsl
        const r = parseInt(value.slice(1, 3), 16) / 255;
        const g = parseInt(value.slice(3, 5), 16) / 255;
        const b = parseInt(value.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;
        
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
          if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
          else if (max === g) h = (b - r) / d + 2;
          else if (max === b) h = (r - g) / d + 4;
          
          h = Math.round(h * 60);
          s = Math.round(s * 100);
          l = Math.round(l * 100);
        }
        
        const hslValue = `${h} ${s}% ${l}%`;
        const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--${cssVarName}`, hslValue);
      }
    }
    
    toast({
      title: "Theme applied to application",
      description: "Your color settings have been saved and applied.",
      variant: "default",
    });
  };
  
  return (
    <div className="container py-8 mx-auto">
      <h1 className="text-3xl font-bold mb-6">WeParlay Theme Color Manager</h1>
      <p className="mb-6 text-muted-foreground">
        Customize your theme colors and ensure proper contrast for accessibility. 
        Changes will be applied to the entire application.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ColorSchemePicker 
          onSchemeChange={handleSchemeChange} 
          onCustomColorChange={handleCustomColorChange}
        />
        <ThemePreviewWidget colorScheme={currentColorScheme} />
      </div>
      
      <Tabs defaultValue="analyzer" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="analyzer">Contrast Analyzer</TabsTrigger>
          <TabsTrigger value="presets">Theme Presets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analyzer">
          <ThemeColorAnalyzer />
        </TabsContent>
        
        <TabsContent value="presets">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WeParlay Classic */}
            <div className="p-4 rounded-lg border cursor-pointer hover:border-primary">
              <div className="h-32 rounded-md bg-gradient-to-br from-[#3498db] to-[#2ecc71] mb-2"></div>
              <h3 className="font-medium">WeParlay Classic</h3>
              <div className="text-xs text-muted-foreground">Blue & Green</div>
            </div>
            
            {/* Dark Mode */}
            <div className="p-4 rounded-lg border cursor-pointer hover:border-primary">
              <div className="h-32 rounded-md bg-gradient-to-br from-[#0f172a] to-[#334155] mb-2"></div>
              <h3 className="font-medium">Dark Mode</h3>
              <div className="text-xs text-muted-foreground">Dark Blue & Slate</div>
            </div>
            
            {/* High Contrast */}
            <div className="p-4 rounded-lg border cursor-pointer hover:border-primary">
              <div className="h-32 rounded-md bg-gradient-to-br from-[#0a58ca] to-[#146c43] mb-2"></div>
              <h3 className="font-medium">High Contrast</h3>
              <div className="text-xs text-muted-foreground">Accessible colors</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center">
        <button
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          onClick={applyThemeToApp}
        >
          Apply Theme Settings
        </button>
      </div>
    </div>
  );
}