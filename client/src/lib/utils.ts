import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTeamLogoUrl(teamName: string, sport: string): string {
  const sportLower = sport.toLowerCase();
  return `https://a.espncdn.com/i/teamlogos/${sportLower}/500/generic.png`;
}

export function getSportColors(sport: string): { primary: string; secondary: string } {
  const colorMap: Record<string, { primary: string; secondary: string }> = {
    NFL: { primary: '#1E3A8A', secondary: '#3B82F6' },
    NBA: { primary: '#000000', secondary: '#FF6B00' },
    MLB: { primary: '#0C2C56', secondary: '#CE1141' },
    NHL: { primary: '#000000', secondary: '#B91C1C' },
    NCAAF: { primary: '#003366', secondary: '#FFB81C' },
    NCAAB: { primary: '#003366', secondary: '#FFB81C' },
    WNBA: { primary: '#1E3A8A', secondary: '#E50E25' },
    EPL: { primary: '#37003C', secondary: '#0066FF' },
  };
  return colorMap[sport] || { primary: '#1F2937', secondary: '#374151' };
}

export function getLeagueLogoUrl(sport: string): string {
  const logoMap: Record<string, string> = {
    NFL: 'https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-football.png',
    NBA: 'https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png',
    MLB: 'https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-baseball.png',
    NHL: 'https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-hockey.png',
    NCAAF: 'https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-football.png',
    NCAAB: 'https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png',
    WNBA: 'https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png',
    EPL: 'https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-soccer.png',
  };
  return logoMap[sport] || 'https://a.espncdn.com/media/img/teams/logo_default.png';
}
