// Utility functions for sports data, logos, and images

/**
 * Get team logo URL for a given team name
 * Uses public sports image CDNs to get officially licensed logos
 */
export const getTeamLogoUrl = (teamName: string, league: string = 'NBA'): string => {
  if (!teamName) {
    return `https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-basketball.png`;
  }
  
  // Import our team logo mappings
  const { 
    nbaTeamLogos, 
    nflTeamLogos, 
    mlbTeamLogos, 
    nhlTeamLogos, 
    wnbaTeamLogos, 
    ncaafTeamLogos, 
    ncaabTeamLogos, 
    ncaawTeamLogos,
    ufcFighterLogos,
    boxingFighterLogos,
    nascarDriverLogos,
    tennisPlayerLogos
  } = require('./teamLogos');

  // First, check if we have an exact match in our comprehensive logo database
  if (league === 'NBA' && nbaTeamLogos[teamName]) {
    return nbaTeamLogos[teamName];
  } else if (league === 'NFL' && nflTeamLogos[teamName]) {
    return nflTeamLogos[teamName];
  } else if (league === 'MLB' && mlbTeamLogos[teamName]) {
    return mlbTeamLogos[teamName];
  } else if (league === 'NHL' && nhlTeamLogos[teamName]) {
    return nhlTeamLogos[teamName];
  } else if (league === 'WNBA' && wnbaTeamLogos[teamName]) {
    return wnbaTeamLogos[teamName];
  } else if (league === 'NCAAF' && ncaafTeamLogos[teamName]) {
    return ncaafTeamLogos[teamName];
  } else if (league === 'NCAAB' && ncaabTeamLogos[teamName]) {
    return ncaabTeamLogos[teamName];
  } else if (league === 'NCAAW' && ncaawTeamLogos[teamName]) {
    return ncaawTeamLogos[teamName];
  } else if (league === 'UFC' && ufcFighterLogos[teamName]) {
    return ufcFighterLogos[teamName];
  } else if (league === 'BOXING' && boxingFighterLogos[teamName]) {
    return boxingFighterLogos[teamName];
  } else if (league === 'NASCAR' && nascarDriverLogos[teamName]) {
    return nascarDriverLogos[teamName];
  } else if ((league === 'TENNIS' || league === 'ATP' || league === 'WTA') && tennisPlayerLogos[teamName]) {
    return tennisPlayerLogos[teamName];
  }
  
  // If not found in our database, try the ESPN API with normalized team name
  // Remove special characters and normalize team name for URL
  const normalizedTeamName = teamName
    .toLowerCase()
    .replace(/\s+/g, '-')  // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ''); // Remove special characters
  
  // Map well-known team names to their official IDs where needed
  const teamMappings: Record<string, string> = {
    'los-angeles-lakers': 'lal',
    'los-angeles-clippers': 'lac',
    'golden-state-warriors': 'gs',
    'boston-celtics': 'bos',
    'brooklyn-nets': 'bkn',
    'new-york-knicks': 'ny',
    'miami-heat': 'mia',
    'toronto-raptors': 'tor',
    'philadelphia-76ers': 'phi',
    'denver-nuggets': 'den',
    'dallas-mavericks': 'dal',
    'milwaukee-bucks': 'mil',
    'phoenix-suns': 'phx',
    'houston-rockets': 'hou',
    'portland-trail-blazers': 'por',
    'portland-blazers': 'por',
    'san-antonio-spurs': 'sa',
    'chicago-bulls': 'chi',
    'oklahoma-city-thunder': 'okc',
    'cleveland-cavaliers': 'cle',
    'memphis-grizzlies': 'mem',
    'new-orleans-pelicans': 'no',
    'detroit-pistons': 'det',
    'charlotte-hornets': 'cha',
    'washington-wizards': 'wsh',
    'indiana-pacers': 'ind',
    'utah-jazz': 'utah',
    'minnesota-timberwolves': 'min',
    'orlando-magic': 'orl',
    'sacramento-kings': 'sac',
    // NFL teams
    'baltimore-ravens': 'bal',
    'buffalo-bills': 'buf',
    'cincinnati-bengals': 'cin',
    'cleveland-browns': 'cle',
    'pittsburgh-steelers': 'pit',
    'chicago-bears': 'chi',
    'detroit-lions': 'det',
    'green-bay-packers': 'gb',
    'minnesota-vikings': 'min',
    'houston-texans': 'hou',
    'indianapolis-colts': 'ind',
    'jacksonville-jaguars': 'jax',
    'tennessee-titans': 'ten',
    'denver-broncos': 'den',
    'kansas-city-chiefs': 'kc',
    'las-vegas-raiders': 'lv',
    'los-angeles-chargers': 'lac',
    // Add more mappings for other leagues
  };
  
  const teamId = teamMappings[normalizedTeamName] || normalizedTeamName;
  
  // Use ESPN's CDN for team logos with proper error handling
  try {
    if (league === 'NBA' || league === 'basketball_nba') {
      return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/${teamId}.png`;
    } else if (league === 'NFL' || league === 'football_nfl') {
      return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/${teamId}.png`;
    } else if (league === 'MLB' || league === 'baseball_mlb') {
      return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/mlb/500/${teamId}.png`;
    } else if (league === 'NHL' || league === 'icehockey_nhl') {
      return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/nhl/500/${teamId}.png`;
    } else if (league === 'NCAAF' || league === 'football_ncaaf') {
      return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/${teamId}.png`;
    } else if (league === 'NCAAB' || league === 'basketball_ncaab') {
      return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/${teamId}.png`;
    } else if (league === 'WNBA' || league === 'basketball_wnba') {
      return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/wnba/500/${teamId}.png`;
    } else if (league === 'SOCCER' || league.includes('soccer')) {
      return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/${teamId}.png`;
    } else if (league === 'UFC' || league === 'mma_ufc') {
      return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/mma/500/${teamId}.png`;
    } else if (league === 'BOXING' || league === 'boxing_main') {
      return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/boxing/500/${teamId}.png`;
    } else if (league === 'NASCAR' || league === 'motorsport_nascar') {
      return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/motorsport/500/${teamId}.png`;
    } else if (league === 'TENNIS' || league === 'tennis_atp' || league === 'tennis_wta') {
      return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/tennis/500/${teamId}.png`;
    }
  } catch (error) {
    console.log(`Error loading logo for ${teamName} in league ${league}`);
  }
  
  // If league-specific logo not found, try to fetch a generic logo based on sport type
  const sportType = league.split('_')[0] || '';
  if (sportType === 'basketball') {
    return `https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-basketball.png`;
  } else if (sportType === 'football') {
    return `https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-football.png`;
  } else if (sportType === 'baseball') {
    return `https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-baseball.png`;
  } else if (sportType === 'hockey' || sportType === 'icehockey') {
    return `https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-hockey.png`;
  } else if (sportType === 'soccer') {
    return `https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-soccer.png`;
  }
  
  // Default fallback logo
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
  const date = typeof eventTime === 'string' ? new Date(eventTime) : eventTime;
  
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