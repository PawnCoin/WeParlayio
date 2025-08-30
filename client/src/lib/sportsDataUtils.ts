// Utility functions for sports data, logos, and images

// Import the unified team logo system
import { getTeamLogo } from './teamLogos';

// Use the unified team logo system for consistency across the site
export const getTeamLogoUrl = (teamName: string, league: string = 'NBA'): string => {
  return getTeamLogo(teamName, league);
};

/**
 * Get player image URL for a given player name and team
 */
export const getPlayerImageUrl = (playerName: string, teamName: string = '', sport: string = 'basketball'): string => {
  // Normalize player name for URL (remove spaces, special characters)
  const normalizedName = playerName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  // For NBA players, use NBA's CDN (when available)
  if (sport === 'basketball') {
    // Map well-known NBA player IDs (this would be expanded in a real app)
    const playerMappings: Record<string, string> = {
      'lebron-james': '2544',
      'stephen-curry': '201939',
      'kevin-durant': '201142',
      'giannis-antetokounmpo': '203507',
      'kawhi-leonard': '202695',
      'james-harden': '201935',
      'joel-embiid': '203954',
      'luka-doncic': '1629029',
      'jayson-tatum': '1628369',
      'nikola-jokic': '203999',
      'anthony-davis': '203076',
      'damian-lillard': '203081',
      'kyrie-irving': '202681',
      'donovan-mitchell': '1628378',
      'trae-young': '1629027',
      'zion-williamson': '1629627',
      'ja-morant': '1629630',
      'jimmy-butler': '202710',
      'bam-adebayo': '1628389',
      'paul-george': '202331',
    };
    
    if (playerMappings[normalizedName]) {
      return `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerMappings[normalizedName]}.png`;
    }
  }
  
  // Fallback to NBA.com generic player image
  return 'https://cdn.nba.com/headshots/nba/latest/1040x760/fallback.png';
};

/**
 * Format sports odds from American format to readable text
 */
export const formatOdds = (odds: number): string => {
  return odds > 0 ? `+${odds}` : odds.toString();
};

/**
 * Convert American odds to decimal format
 */
export const americanToDecimal = (americanOdds: number): number => {
  if (americanOdds > 0) {
    return americanOdds / 100 + 1;
  } else {
    return 100 / Math.abs(americanOdds) + 1;
  }
};

/**
 * Convert American odds to fractional format
 * Returns a string representation of the fractional odds
 */
export const americanToFractional = (americanOdds: number): string => {
  if (americanOdds > 0) {
    const numerator = americanOdds;
    const denominator = 100;
    
    // Simplify fraction
    const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
    const divisor = gcd(numerator, denominator);
    
    return `${numerator/divisor}/${denominator/divisor}`;
  } else {
    const numerator = 100;
    const denominator = Math.abs(americanOdds);
    
    // Simplify fraction
    const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
    const divisor = gcd(numerator, denominator);
    
    return `${numerator/divisor}/${denominator/divisor}`;
  }
};

/**
 * Calculate payout for a bet based on odds and stake amount
 */
export const calculatePayout = (odds: number, stake: number): number => {
  if (odds > 0) {
    return stake + (stake * (odds / 100));
  } else {
    return stake + (stake / (Math.abs(odds) / 100));
  }
};

/**
 * Format sports event time - converts to user's local time
 */
export const formatGameTime = (eventTime: string | Date): string => {
  if (!eventTime) return 'TBD';
  
  const date = typeof eventTime === 'string' ? new Date(eventTime) : eventTime;
  
  if (isNaN(date.getTime())) return 'TBD';
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format event date for display
 */
export const formatGameDate = (eventTime: string | Date): string => {
  if (!eventTime) return 'TBD';
  
  const date = typeof eventTime === 'string' ? new Date(eventTime) : eventTime;
  
  if (isNaN(date.getTime())) return 'TBD';
  
  return date.toLocaleDateString();
};

/**
 * Get data for a specific league from league code
 */
export const getLeagueInfo = (leagueCode: string): { name: string, sport: string, fullName: string } => {
  const leagues: Record<string, { name: string, sport: string, fullName: string }> = {
    'basketball_nba': { 
      name: 'NBA', 
      sport: 'basketball',
      fullName: 'National Basketball Association'
    },
    'basketball_ncaab': { 
      name: 'NCAAB', 
      sport: 'basketball',
      fullName: 'NCAA Basketball'
    },
    'football_nfl': { 
      name: 'NFL', 
      sport: 'football',
      fullName: 'National Football League'
    },
    'baseball_mlb': { 
      name: 'MLB', 
      sport: 'baseball',
      fullName: 'Major League Baseball'
    },
    'icehockey_nhl': { 
      name: 'NHL', 
      sport: 'hockey',
      fullName: 'National Hockey League'
    },
    'soccer_epl': { 
      name: 'EPL', 
      sport: 'soccer',
      fullName: 'English Premier League'
    },
  };
  
  return leagues[leagueCode] || { 
    name: leagueCode.split('_').pop()?.toUpperCase() || 'SPORTS', 
    sport: leagueCode.split('_')[0] || 'general',
    fullName: 'Sports League'
  };
};