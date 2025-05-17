import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define WeParlay brand colors
const THEME_COLORS = {
  light: {
    primary: '#3498db',    // WeParlay blue
    secondary: '#2ecc71',  // WeParlay green
    accent: '#e67e22',     // WeParlay orange
    background: '#FFFFFF',
    text: '#121212',
    cardBackground: '#F5F5F5',
    border: '#E0E0E0',
  },
  dark: {
    primary: '#2980b9',    // Darker blue for dark mode
    secondary: '#27ae60',  // Darker green for dark mode
    accent: '#d35400',     // Darker orange for dark mode
    background: '#121212',
    text: '#FFFFFF',
    cardBackground: '#1E1E1E',
    border: '#333333',
  }
};

type ThemeType = 'light' | 'dark';
type ThemeColors = typeof THEME_COLORS.light;

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('light');

  useEffect(() => {
    // Load saved theme from AsyncStorage on app start
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setThemeState(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    // Save theme preference to AsyncStorage
    AsyncStorage.setItem('theme', newTheme).catch(error => {
      console.error('Failed to save theme preference:', error);
    });
  };

  const colors = THEME_COLORS[theme];

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};