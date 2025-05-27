import React from 'react';
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ThemeSettingsPage() {
  const [themeMode, setThemeMode] = React.useState<'light' | 'dark'>('dark');
  const [contrastMode, setContrastMode] = React.useState<'standard' | 'high'>('standard');
  const [animationMode, setAnimationMode] = React.useState<'reduced' | 'full'>('full');
  
  // WeParlay colors
  const weparlayColors = {
    blue: "#3498db",
    green: "#2ecc71",
    orange: "#e67e22",
    dark: "#2c3e50"
  };
  
  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
    // In a real app, we would also update the HTML tag class
    const htmlElement = document.documentElement;
    htmlElement.classList.toggle('dark');
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Theme Settings</h1>
      <p className="text-muted-foreground mb-8">
        Customize your WeParlay experience with these display options
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Main Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Display Preferences</CardTitle>
            <CardDescription>Adjust how WeParlay looks and feels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Theme Mode</h3>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <div className="flex items-center gap-2">
                <Label 
                  htmlFor="theme-toggle" 
                  className={themeMode === 'light' ? 'text-primary font-medium' : 'text-muted-foreground'}
                >
                  Light
                </Label>
                <Switch 
                  id="theme-toggle" 
                  checked={themeMode === 'dark'}
                  onCheckedChange={toggleTheme}
                />
                <Label 
                  htmlFor="theme-toggle" 
                  className={themeMode === 'dark' ? 'text-primary font-medium' : 'text-muted-foreground'}
                >
                  Dark
                </Label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Contrast Mode</h3>
                <p className="text-sm text-muted-foreground">Increase contrast for better readability</p>
              </div>
              <div className="flex items-center gap-2">
                <Label 
                  htmlFor="contrast-toggle" 
                  className={contrastMode === 'standard' ? 'text-primary font-medium' : 'text-muted-foreground'}
                >
                  Standard
                </Label>
                <Switch 
                  id="contrast-toggle" 
                  checked={contrastMode === 'high'}
                  onCheckedChange={() => setContrastMode(prev => prev === 'standard' ? 'high' : 'standard')}
                />
                <Label 
                  htmlFor="contrast-toggle" 
                  className={contrastMode === 'high' ? 'text-primary font-medium' : 'text-muted-foreground'}
                >
                  High
                </Label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Animation Mode</h3>
                <p className="text-sm text-muted-foreground">Adjust motion settings</p>
              </div>
              <div className="flex items-center gap-2">
                <Label 
                  htmlFor="animation-toggle" 
                  className={animationMode === 'reduced' ? 'text-primary font-medium' : 'text-muted-foreground'}
                >
                  Reduced
                </Label>
                <Switch 
                  id="animation-toggle" 
                  checked={animationMode === 'full'}
                  onCheckedChange={() => setAnimationMode(prev => prev === 'reduced' ? 'full' : 'reduced')}
                />
                <Label 
                  htmlFor="animation-toggle" 
                  className={animationMode === 'full' ? 'text-primary font-medium' : 'text-muted-foreground'}
                >
                  Full
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Color Scheme Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Color Scheme</CardTitle>
            <CardDescription>Preview the WeParlay colors in your theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="rounded-md p-6 mb-4"
              style={{ backgroundColor: themeMode === 'dark' ? '#0f172a' : '#ffffff' }}
            >
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(weparlayColors).map(([name, color]) => (
                  <div 
                    key={name} 
                    className="flex items-center p-3 rounded-md"
                    style={{ 
                      backgroundColor: color,
                      color: name === 'dark' ? '#ffffff' : '#000000'
                    }}
                  >
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                    <span className="capitalize">{name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center mt-6">
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => window.history.back()}
              >
                Back to Settings
              </Button>
              <Button>Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Accessibility Settings</CardTitle>
          <CardDescription>Make WeParlay easier to use</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="larger-text" />
              <Label htmlFor="larger-text">Larger Text</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="screen-reader" />
              <Label htmlFor="screen-reader">Screen Reader Support</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="focus-visible" />
              <Label htmlFor="focus-visible">Enhanced Focus Indicators</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Betting Slip Display</CardTitle>
          <CardDescription>Configure how betting slip appears on your screen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="floating-slip" defaultChecked />
              <Label htmlFor="floating-slip">Use floating betting slip</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="auto-hide" />
              <Label htmlFor="auto-hide">Auto-hide betting slip when empty</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="light-slip-bg" />
              <Label htmlFor="light-slip-bg">Always use light background for bet slip</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="high-contrast-slip" />
              <Label htmlFor="high-contrast-slip">High contrast text in bet slip</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}