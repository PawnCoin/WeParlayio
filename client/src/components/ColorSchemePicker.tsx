import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { generateThemeColorPalette } from "@/lib/themeColorUtils";

// Default WeParlay color schemes
const PREDEFINED_SCHEMES = [
  {
    name: "WeParlay Classic",
    colors: {
      primary: "#3498db", // Blue
      secondary: "#2ecc71", // Green
      accent: "#e67e22", // Orange
    }
  },
  {
    name: "WeParlay Dark",
    colors: {
      primary: "#2c3e50", // Dark Blue
      secondary: "#27ae60", // Dark Green
      accent: "#d35400", // Dark Orange
    }
  },
  {
    name: "WeParlay Light",
    colors: {
      primary: "#3498db", // Blue
      secondary: "#2ecc71", // Green
      accent: "#e67e22", // Orange
      background: "#f8f9fa"
    }
  },
  {
    name: "High Contrast",
    colors: {
      primary: "#0a58ca", // Darker blue for better contrast
      secondary: "#146c43", // Darker green for better contrast
      accent: "#fd7e14", // Brighter orange for better contrast
      background: "#ffffff",
      text: "#212529"
    }
  }
];

interface ColorSchemePickerProps {
  onSchemeChange?: (scheme: any) => void;
  onCustomColorChange?: (colors: any) => void;
}

export default function ColorSchemePicker({ onSchemeChange, onCustomColorChange }: ColorSchemePickerProps) {
  const [activeScheme, setActiveScheme] = useState<string>(PREDEFINED_SCHEMES[0].name);
  const [customColors, setCustomColors] = useState({
    primary: "#3498db",
    secondary: "#2ecc71",
    accent: "#e67e22"
  });
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [autoContrast, setAutoContrast] = useState(true);
  
  // Update theme when scheme changes
  useEffect(() => {
    const selectedScheme = PREDEFINED_SCHEMES.find(s => s.name === activeScheme);
    if (selectedScheme && onSchemeChange) {
      onSchemeChange(selectedScheme.colors);
    }
  }, [activeScheme, onSchemeChange]);
  
  // Update theme when custom colors change
  useEffect(() => {
    if (activeScheme === 'custom' && onCustomColorChange) {
      onCustomColorChange(customColors);
    }
  }, [customColors, activeScheme, onCustomColorChange]);
  
  const handleColorChange = (type: 'primary' | 'secondary' | 'accent', color: string) => {
    setCustomColors(prev => ({
      ...prev,
      [type]: color
    }));
    
    // If auto contrast is enabled, adjust other colors to maintain proper contrast
    if (autoContrast) {
      const newPalette = generateThemeColorPalette(color);
      // Only apply to the current preview mode
      const modeColors = newPalette[previewMode];
      
      if (type === 'primary') {
        setCustomColors(prev => ({
          ...prev,
          primary: color,
          secondary: modeColors.secondary,
          accent: modeColors.accent
        }));
      }
    }
  };
  
  // Current scheme's colors for preview
  const currentColors = activeScheme === 'custom' 
    ? customColors 
    : PREDEFINED_SCHEMES.find(s => s.name === activeScheme)?.colors || PREDEFINED_SCHEMES[0].colors;
  
  // Generate color palette for preview
  const colorPalette = generateThemeColorPalette(currentColors.primary);
  const previewColors = colorPalette[previewMode];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Color Scheme Settings</span>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className={previewMode === 'light' ? 'bg-primary text-white' : ''}
              onClick={() => setPreviewMode('light')}
            >
              Light
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className={previewMode === 'dark' ? 'bg-primary text-white' : ''}
              onClick={() => setPreviewMode('dark')}
            >
              Dark
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preset">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preset">Preset Schemes</TabsTrigger>
            <TabsTrigger value="custom">Custom Colors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preset" className="mt-4">
            <RadioGroup 
              value={activeScheme}
              onValueChange={setActiveScheme}
              className="space-y-3"
            >
              {PREDEFINED_SCHEMES.map((scheme) => (
                <div key={scheme.name} className="flex items-center space-x-2">
                  <RadioGroupItem value={scheme.name} id={scheme.name} />
                  <Label htmlFor={scheme.name} className="flex items-center">
                    <span className="mr-2">{scheme.name}</span>
                    <div className="flex space-x-1">
                      {Object.entries(scheme.colors).filter(([key]) => ['primary', 'secondary', 'accent'].includes(key)).map(([key, color]) => (
                        <div 
                          key={key}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
          
          <TabsContent value="custom" className="mt-4">
            <div className="mb-4 flex items-center space-x-2">
              <Switch
                id="auto-contrast"
                checked={autoContrast}
                onCheckedChange={setAutoContrast}
              />
              <Label htmlFor="auto-contrast">Auto-adjust for optimal contrast</Label>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex items-center mt-1">
                  <input
                    type="color"
                    id="primary-color"
                    value={customColors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-10 h-10 rounded-md border cursor-pointer"
                  />
                  <span className="ml-2 text-sm font-mono">{customColors.primary}</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex items-center mt-1">
                  <input
                    type="color"
                    id="secondary-color"
                    value={customColors.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="w-10 h-10 rounded-md border cursor-pointer"
                  />
                  <span className="ml-2 text-sm font-mono">{customColors.secondary}</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="accent-color">Accent Color</Label>
                <div className="flex items-center mt-1">
                  <input
                    type="color"
                    id="accent-color"
                    value={customColors.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    className="w-10 h-10 rounded-md border cursor-pointer"
                  />
                  <span className="ml-2 text-sm font-mono">{customColors.accent}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Color Preview */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">Preview</h3>
          <div 
            className="p-4 rounded-md"
            style={{ backgroundColor: previewColors.background }}
          >
            <div className="mb-3 text-sm" style={{ color: previewColors.foreground }}>
              This is how your theme will look
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button style={{ 
                backgroundColor: previewColors.primary, 
                color: previewColors.primaryForeground 
              }}>
                Primary
              </Button>
              
              <Button style={{ 
                backgroundColor: previewColors.secondary, 
                color: previewColors.secondaryForeground 
              }}>
                Secondary
              </Button>
              
              <Button style={{ 
                backgroundColor: previewColors.accent, 
                color: previewColors.accentForeground 
              }}>
                Accent
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}