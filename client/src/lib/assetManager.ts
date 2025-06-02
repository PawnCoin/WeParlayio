/**
 * Asset Manager for WeParlay.io
 * Handles team logos, sport icons, and other assets
 */

export class AssetManager {
  // ESPN API base URLs for team logos and sport icons
  private static readonly ESPN_LOGO_BASE = 'https://a.espncdn.com/i/teamlogos';
  private static readonly ESPN_ICON_BASE = 'https://a.espncdn.com/i/icons/';

  // Main method to get team logos with fallbacks
  static getTeamLogo(teamName: string, league: string = 'NBA'): string {
    if (!teamName) {
      return this.getESPNSportIcon(league);
    }

    // Try ESPN team logos first
    const espnLogo = this.getESPNTeamLogo(teamName, league);
    if (espnLogo) return espnLogo;

    // Generate simple initials logo as fallback
    return this.generateInitialsLogo(teamName);
  }

  // ESPN team logo getter
  static getESPNTeamLogo(teamName: string, league: string): string {
    const normalizedTeam = teamName.toLowerCase().replace(/\s+/g, '');
    const leagueMap: Record<string, string> = {
      'nba': 'nba/500',
      'nfl': 'nfl/500',
      'mlb': 'mlb/500',
      'nhl': 'nhl/500',
      'soccer': 'soccer/500',
      'mls': 'soccer/500'
    };

    const leaguePath = leagueMap[league.toLowerCase()] || 'nba/500';
    
    // Team ID mappings for major teams
    const teamIds: Record<string, Record<string, string>> = {
      nba: {
        'lakers': '13',
        'warriors': '9',
        'celtics': '2',
        'bulls': '4',
        'heat': '14',
        'spurs': '21',
        'knicks': '18',
        'nets': '17'
      },
      nfl: {
        'patriots': '17',
        'cowboys': '6',
        'steelers': '23',
        'packers': '9',
        'giants': '19',
        '49ers': '25',
        'eagles': '21',
        'chiefs': '12'
      },
      mlb: {
        'yankees': '10',
        'redsox': '2',
        'dodgers': '19',
        'giants': '26',
        'cubs': '16',
        'cardinals': '24',
        'astros': '18',
        'mets': '21'
      }
    };

    const leagueTeams = teamIds[league.toLowerCase()];
    if (leagueTeams && leagueTeams[normalizedTeam]) {
      return `${this.ESPN_LOGO_BASE}/${leaguePath}/${leagueTeams[normalizedTeam]}.png`;
    }

    return '';
  }

  // ESPN sport icon getter
  static getESPNSportIcon(sport: string): string {
    const sportMap: Record<string, string> = {
      'nba': 'basketball',
      'nfl': 'football',
      'mlb': 'baseball',
      'nhl': 'hockey',
      'soccer': 'soccer',
      'mls': 'soccer',
      'tennis': 'tennis',
      'golf': 'golf',
      'boxing': 'boxing',
      'mma': 'mma'
    };

    const iconName = sportMap[sport.toLowerCase()] || 'sports';
    return `${this.ESPN_ICON_BASE}${iconName}.svg`;
  }

  // Generate simple initials logo
  private static generateInitialsLogo(teamName: string): string {
    const initials = teamName.split(' ').map(word => word[0]).join('').substring(0, 3);
    
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="#1d428a"/>
        <text x="20" y="26" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${initials}</text>
      </svg>
    `)}`;
  }

  // Get player image
  static getPlayerImage(playerName: string, sport: string = 'NBA'): string {
    if (!playerName) return this.getDefaultPlayerImage();
    
    // ESPN player headshots
    const normalizedName = playerName.toLowerCase().replace(/\s+/g, '-');
    return `https://a.espncdn.com/i/headshots/${sport.toLowerCase()}/${normalizedName}.png`;
  }

  // Default player silhouette
  static getDefaultPlayerImage(): string {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="30" fill="#e5e7eb"/>
        <circle cx="30" cy="25" r="8" fill="#9ca3af"/>
        <path d="M15 50 Q15 38 30 38 Q45 38 45 50 Z" fill="#9ca3af"/>
      </svg>
    `)}`;
  }

  // Get league logo
  static getLeagueLogo(league: string): string {
    const leagueLogos: Record<string, string> = {
      'NBA': 'https://logoeps.com/wp-content/uploads/2013/03/nba-vector-logo.png',
      'NFL': 'https://logoeps.com/wp-content/uploads/2013/03/nfl-vector-logo.png',
      'MLB': 'https://logoeps.com/wp-content/uploads/2013/03/mlb-vector-logo.png',
      'NHL': 'https://logoeps.com/wp-content/uploads/2013/03/nhl-vector-logo.png',
      'MLS': 'https://logoeps.com/wp-content/uploads/2014/07/mls-vector-logo.png'
    };

    return leagueLogos[league.toUpperCase()] || this.getESPNSportIcon(league);
  }

  // Get country flag for international sports
  static getCountryFlag(countryCode: string): string {
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
  }
}

export default AssetManager;