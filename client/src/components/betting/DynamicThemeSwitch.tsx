import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sun, Moon, EyeOff } from "lucide-react";

interface DynamicThemeSwitchProps {
  showLabel?: boolean;
}

/**
 * Component that allows switching between light and dark modes
 * with built-in color contrast adjustment
 */
export default function DynamicThemeSwitch({ showLabel = true }: DynamicThemeSwitchProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [highContrast, setHighContrast] = useState(false);
  
  useEffect(() => {
    const html = document.documentElement;
    const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
    setTheme(currentTheme as 'light' | 'dark');
  }, []);
  
  const toggleTheme = () => {
    const html = document.documentElement;
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    if (newTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    setTheme(newTheme);
  };
  
  const toggleContrast = () => {
    const html = document.documentElement;
    setHighContrast(!highContrast);
    
    if (!highContrast) {
      html.classList.add('high-contrast');
      
      // Apply high contrast styles for text in bet slips
      document.querySelectorAll('.pick-text, .team-text, .bet-type-text').forEach((el) => {
        if (theme === 'dark') {
          (el as HTMLElement).style.color = '#ffffff';
        } else {
          (el as HTMLElement).style.color = '#000000';
        }
        (el as HTMLElement).style.fontWeight = 'bold';
      });
      
    } else {
      html.classList.remove('high-contrast');
      
      // Remove high contrast styles
      document.querySelectorAll('.pick-text, .team-text, .bet-type-text').forEach((el) => {
        (el as HTMLElement).style.color = '';
        (el as HTMLElement).style.fontWeight = '';
      });
    }
  };
  
  return (
    <div className="flex items-center gap-x-2">
      {showLabel && <Label className="mr-2">Theme:</Label>}
      
      <div className="flex border rounded-md p-0.5">
        <Button 
          variant={theme === 'light' ? 'default' : 'ghost'} 
          size="sm"
          className="flex items-center h-8 px-2"
          onClick={() => theme === 'dark' && toggleTheme()}
        >
          <Sun size={16} className="mr-1" />
          {showLabel && <span>Light</span>}
        </Button>
        
        <Button
          variant={theme === 'dark' ? 'default' : 'ghost'}
          size="sm"
          className="flex items-center h-8 px-2"
          onClick={() => theme === 'light' && toggleTheme()}
        >
          <Moon size={16} className="mr-1" />
          {showLabel && <span>Dark</span>}
        </Button>
      </div>
      
      <div className="flex items-center ml-2">
        <EyeOff size={16} className="mr-1" />
        <Switch
          checked={highContrast}
          onCheckedChange={toggleContrast}
          aria-label="Toggle high contrast mode"
        />
        {showLabel && <Label className="ml-1">High Contrast</Label>}
      </div>
    </div>
  );
}