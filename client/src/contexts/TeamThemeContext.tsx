import React, { createContext, useContext, useState, useEffect } from 'react';

// Define team color schemes
const teamColors: Record<string, ThemeColors> = {
  // NBA Teams
  'Lakers': { primary: '#552583', secondary: '#FDB927', accent: '#000000' },
  'Warriors': { primary: '#1D428A', secondary: '#FFC72C', accent: '#000000' },
  'Celtics': { primary: '#007A33', secondary: '#BA9653', accent: '#000000' },
  'Heat': { primary: '#98002E', secondary: '#F9A01B', accent: '#000000' },
  'Bulls': { primary: '#CE1141', secondary: '#000000', accent: '#FFFFFF' },
  'Bucks': { primary: '#00471B', secondary: '#EEE1C6', accent: '#0077C0' },
  'Nets': { primary: '#000000', secondary: '#FFFFFF', accent: '#777D84' },
  'Knicks': { primary: '#006BB6', secondary: '#F58426', accent: '#BEC0C2' },
  
  // NFL Teams
  'Chiefs': { primary: '#E31837', secondary: '#FFB81C', accent: '#000000' },
  'Eagles': { primary: '#004C54', secondary: '#A5ACAF', accent: '#000000' },
  'Cowboys': { primary: '#041E42', secondary: '#869397', accent: '#FFFFFF' },
  'Patriots': { primary: '#002244', secondary: '#C60C30', accent: '#B0B7BC' },
  'Packers': { primary: '#203731', secondary: '#FFB612', accent: '#FFFFFF' },
  'Steelers': { primary: '#101820', secondary: '#FFB612', accent: '#FFFFFF' },
  
  // MLB Teams
  'Yankees': { primary: '#0C2340', secondary: '#FFFFFF', accent: '#C4CED4' },
  'Dodgers': { primary: '#005A9C', secondary: '#FFFFFF', accent: '#EF3E42' },
  'Red Sox': { primary: '#BD3039', secondary: '#0C2340', accent: '#FFFFFF' },
  'Cubs': { primary: '#0E3386', secondary: '#CC3433', accent: '#FFFFFF' },
  'Giants': { primary: '#FD5A1E', secondary: '#000000', accent: '#FFFDD0' },
  
  // NHL Teams
  'Maple Leafs': { primary: '#00205B', secondary: '#FFFFFF', accent: '#00205B' },
  'Canadiens': { primary: '#AF1E2D', secondary: '#192168', accent: '#FFFFFF' },
  'Bruins': { primary: '#FFB81C', secondary: '#000000', accent: '#FFFFFF' },
  'Blackhawks': { primary: '#CF0A2C', secondary: '#FFFFFF', accent: '#000000' },
  'Rangers': { primary: '#0038A8', secondary: '#CE1126', accent: '#FFFFFF' },
  
  // Soccer Teams
  'Barcelona': { primary: '#A50044', secondary: '#004D98', accent: '#EDBB00' },
  'Real Madrid': { primary: '#FFFFFF', secondary: '#00529F', accent: '#FFEC00' },
  'Manchester United': { primary: '#DA291C', secondary: '#FBE122', accent: '#000000' },
  'Liverpool': { primary: '#C8102E', secondary: '#F6EB61', accent: '#00B2A9' },
  'Chelsea': { primary: '#034694', secondary: '#FFFFFF', accent: '#DBA111' },
  
  // Default WeParlay theme
  'default': { primary: '#0066CC', secondary: '#66CC33', accent: '#FF6600' }
};

// Define theme colors interface
interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

// Define context type
interface TeamThemeContextType {
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
  themeColors: ThemeColors;
  availableTeams: string[];
}

// Create context
const TeamThemeContext = createContext<TeamThemeContextType | undefined>(undefined);

// Create provider component
export const TeamThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get stored team or use default
  const [selectedTeam, setSelectedTeam] = useState<string>(() => {
    const stored = localStorage.getItem('weparlay_team_theme');
    return stored || 'default';
  });
  
  // Get theme colors for selected team
  const themeColors = teamColors[selectedTeam] || teamColors.default;
  
  // Get list of available teams
  const availableTeams = Object.keys(teamColors);
  
  // Update localStorage when team changes
  useEffect(() => {
    localStorage.setItem('weparlay_team_theme', selectedTeam);
    
    // Apply CSS variables to :root
    const root = document.documentElement;
    root.style.setProperty('--team-primary', themeColors.primary);
    root.style.setProperty('--team-secondary', themeColors.secondary);
    root.style.setProperty('--team-accent', themeColors.accent);
    
  }, [selectedTeam, themeColors]);
  
  return (
    <TeamThemeContext.Provider 
      value={{ 
        selectedTeam, 
        setSelectedTeam, 
        themeColors,
        availableTeams 
      }}
    >
      {children}
    </TeamThemeContext.Provider>
  );
};

// Create hook for using the context
export function useTeamTheme(): TeamThemeContextType {
  const context = useContext(TeamThemeContext);
  
  if (context === undefined) {
    throw new Error('useTeamTheme must be used within a TeamThemeProvider');
  }
  
  return context;
}