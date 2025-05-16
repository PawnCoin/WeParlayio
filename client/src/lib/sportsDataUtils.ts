// Utility functions for sports data, logos, and images

/**
 * Get team logo URL for a given team name
 * Uses public sports image CDNs to get officially licensed logos
 */
export const getTeamLogoUrl = (teamName: string, league: string = 'NBA'): string => {
  // Remove special characters and normalize team name for URL
  const normalizedTeamName = teamName
    .toLowerCase()
    .replace(/\s+/g, '-')  // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove special characters
  
  // Map well-known team names to their official IDs where needed
  const teamMappings: Record<string, string> = {
    'los-angeles-lakers': 'lakers',
    'los-angeles-clippers': 'clippers',
    'golden-state-warriors': 'warriors',
    'boston-celtics': 'celtics',
    'brooklyn-nets': 'nets',
    'new-york-knicks': 'knicks',
    'miami-heat': 'heat',
    'toronto-raptors': 'raptors',
    'philadelphia-76ers': 'sixers',
    'denver-nuggets': 'nuggets',
    'dallas-mavericks': 'mavericks',
    'milwaukee-bucks': 'bucks',
    'phoenix-suns': 'suns',
    'houston-rockets': 'rockets',
    'portland-trail-blazers': 'trail-blazers',
    'portland-blazers': 'trail-blazers',
    'san-antonio-spurs': 'spurs',
    'chicago-bulls': 'bulls',
    'oklahoma-city-thunder': 'thunder',
    'cleveland-cavaliers': 'cavaliers',
    'memphis-grizzlies': 'grizzlies',
    'new-orleans-pelicans': 'pelicans',
    'detroit-pistons': 'pistons',
    'charlotte-hornets': 'hornets',
    'washington-wizards': 'wizards',
    'indiana-pacers': 'pacers',
    'utah-jazz': 'jazz',
    'minnesota-timberwolves': 'timberwolves',
    'orlando-magic': 'magic',
    'sacramento-kings': 'kings',
  };
  
  const teamId = teamMappings[normalizedTeamName] || normalizedTeamName;
  
  // Use ESPN's CDN for team logos
  if (league === 'NBA') {
    return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/${teamId}.png`;
  } else if (league === 'NFL') {
    return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/${teamId}.png`;
  } else if (league === 'MLB') {
    return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/${teamId}.png`;
  } else if (league === 'NHL') {
    return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/${teamId}.png`;
  }
  
  // Fallback to a generic sports logo
  return `https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-basketball.png`;
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
  const date = typeof eventTime === 'string' ? new Date(eventTime) : eventTime;
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format event date for display
 */
export const formatGameDate = (eventTime: string | Date): string => {
  const date = typeof eventTime === 'string' ? new Date(eventTime) : eventTime;
  
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