// Asset management utilities for WeParlay
// Handles dynamic loading and caching of sports and team assets

import { ESPNAssetService } from './espnAssetService';
import { UniversalTeamService } from './universalTeamService';

export class AssetManager {
  private static iconCache = new Map<string, string>();
  private static logoCache = new Map<string, string>();
  private static playerCache = new Map<string, string>();
  private static espnCache = new Map<string, any>();

  // ESPN API endpoints for assets
  private static ESPN_TEAM_LOGOS = {
    nba: (teamId: string) => `https://a.espncdn.com/i/teamlogos/nba/500/${teamId.toLowerCase()}.png`,
    nfl: (teamId: string) => `https://a.espncdn.com/i/teamlogos/nfl/500/${teamId.toLowerCase()}.png`,
    mlb: (teamId: string) => `https://a.espncdn.com/i/teamlogos/mlb/500/${teamId.toLowerCase()}.png`,
    nhl: (teamId: string) => `https://a.espncdn.com/i/teamlogos/nhl/500/${teamId.toLowerCase()}.png`,
    ncaaf: (teamId: string) => `https://a.espncdn.com/i/teamlogos/ncaa/500/${teamId}.png`,
    ncaab: (teamId: string) => `https://a.espncdn.com/i/teamlogos/ncaa/500/${teamId}.png`
  };

  private static ESPN_SPORT_ICONS = {
    basketball: 'https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-basketball.png',
    football: 'https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-football.png',
    baseball: 'https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-baseball.png',
    hockey: 'https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-hockey.png',
    soccer: 'https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-soccer.png',
    tennis: 'https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-tennis.png',
    golf: 'https://a.espncdn.com/redesign/assets/img/icons/ESPN-icon-golf.png'
  };

  // Team ID mappings for ESPN API
  private static TEAM_ID_MAPPINGS: Record<string, Record<string, string>> = {
    nba: {
      'Boston Celtics': 'bos', 'Brooklyn Nets': 'bkn', 'New York Knicks': 'ny',
      'Philadelphia 76ers': 'phi', 'Toronto Raptors': 'tor', 'Chicago Bulls': 'chi',
      'Cleveland Cavaliers': 'cle', 'Detroit Pistons': 'det', 'Indiana Pacers': 'ind',
      'Milwaukee Bucks': 'mil', 'Atlanta Hawks': 'atl', 'Charlotte Hornets': 'cha',
      'Miami Heat': 'mia', 'Orlando Magic': 'orl', 'Washington Wizards': 'wsh',
      'Denver Nuggets': 'den', 'Minnesota Timberwolves': 'min', 'Oklahoma City Thunder': 'okc',
      'Portland Trail Blazers': 'por', 'Utah Jazz': 'utah', 'Golden State Warriors': 'gs',
      'LA Clippers': 'lac', 'Los Angeles Lakers': 'lal', 'Phoenix Suns': 'phx',
      'Sacramento Kings': 'sac', 'Dallas Mavericks': 'dal', 'Houston Rockets': 'hou',
      'Memphis Grizzlies': 'mem', 'New Orleans Pelicans': 'no', 'San Antonio Spurs': 'sa'
    },
    nfl: {
      'Arizona Cardinals': 'ari', 'Atlanta Falcons': 'atl', 'Baltimore Ravens': 'bal',
      'Buffalo Bills': 'buf', 'Carolina Panthers': 'car', 'Chicago Bears': 'chi',
      'Cincinnati Bengals': 'cin', 'Cleveland Browns': 'cle', 'Dallas Cowboys': 'dal',
      'Denver Broncos': 'den', 'Detroit Lions': 'det', 'Green Bay Packers': 'gb',
      'Houston Texans': 'hou', 'Indianapolis Colts': 'ind', 'Jacksonville Jaguars': 'jax',
      'Kansas City Chiefs': 'kc', 'Las Vegas Raiders': 'lv', 'Los Angeles Chargers': 'lac',
      'Los Angeles Rams': 'lar', 'Miami Dolphins': 'mia', 'Minnesota Vikings': 'min',
      'New England Patriots': 'ne', 'New Orleans Saints': 'no', 'New York Giants': 'nyg',
      'New York Jets': 'nyj', 'Philadelphia Eagles': 'phi', 'Pittsburgh Steelers': 'pit',
      'San Francisco 49ers': 'sf', 'Seattle Seahawks': 'sea', 'Tampa Bay Buccaneers': 'tb',
      'Tennessee Titans': 'ten', 'Washington Commanders': 'wsh'
    }
  };

  // Get ESPN team logo
  static async getESPNTeamLogo(teamName: string, league: string = 'nba'): Promise<string> {
    const cacheKey = `espn-${league}-${teamName}`;
    if (this.logoCache.has(cacheKey)) {
      return this.logoCache.get(cacheKey)!;
    }

    try {
      const teamMappings = this.TEAM_ID_MAPPINGS[league.toLowerCase()];
      const teamId = teamMappings?.[teamName];

      if (teamId && this.ESPN_TEAM_LOGOS[league.toLowerCase() as keyof typeof this.ESPN_TEAM_LOGOS]) {
        const logoUrl = this.ESPN_TEAM_LOGOS[league.toLowerCase() as keyof typeof this.ESPN_TEAM_LOGOS](teamId);

        // Verify the image exists
        const exists = await this.checkImageExists(logoUrl);
        if (exists) {
          this.logoCache.set(cacheKey, logoUrl);
          return logoUrl;
        }
      }
    } catch (error) {
      console.warn(`Failed to get ESPN logo for ${teamName}:`, error);
    }

    // Fallback to local assets
    return this.getTeamLogo(teamName, league);
  }

  // Get ESPN sport icon
  static getESPNSportIcon(sportKey: string): string {
    const normalizedSport = sportKey.toLowerCase().replace(/[^a-z]/g, '');
    return this.ESPN_SPORT_ICONS[normalizedSport as keyof typeof this.ESPN_SPORT_ICONS] || 
           this.getSportIcon(sportKey);
  }

  // Get player headshot from ESPN
  static async getESPNPlayerImage(playerId: string, sport: string = 'nba'): Promise<string> {
    const cacheKey = `espn-player-${sport}-${playerId}`;
    if (this.playerCache.has(cacheKey)) {
      return this.playerCache.get(cacheKey)!;
    }

    try {
      // ESPN player headshot URLs
      const playerImageUrl = `https://a.espncdn.com/i/headshots/${sport}/players/full/${playerId}.png`;

      const exists = await this.checkImageExists(playerImageUrl);
      if (exists) {
        this.playerCache.set(cacheKey, playerImageUrl);
        return playerImageUrl;
      }

      // Fallback to smaller image
      const smallImageUrl = `https://a.espncdn.com/i/headshots/${sport}/players/full/${playerId}.jpg`;
      const smallExists = await this.checkImageExists(smallImageUrl);
      if (smallExists) {
        this.playerCache.set(cacheKey, smallImageUrl);
        return smallImageUrl;
      }
    } catch (error) {
      console.warn(`Failed to get ESPN player image for ${playerId}:`, error);
    }

    // Return default player silhouette
    return `https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png&w=350&h=254`;
  }

  // Fetch team data from ESPN API
  static async fetchESPNTeamData(league: string, teamId?: string): Promise<any> {
    const cacheKey = `espn-data-${league}-${teamId || 'all'}`;
    if (this.espnCache.has(cacheKey)) {
      return this.espnCache.get(cacheKey);
    }

    try {
      const sportMap: Record<string, string> = {
        'nba': 'basketball/nba',
        'nfl': 'football/nfl',
        'mlb': 'baseball/mlb',
        'nhl': 'hockey/nhl',
        'ncaaf': 'football/college-football',
        'ncaab': 'basketball/mens-college-basketball'
      };

      const sport = sportMap[league.toLowerCase()];
      if (!sport) throw new Error(`Unsupported league: ${league}`);

      const url = teamId 
        ? `https://site.api.espn.com/apis/site/v2/sports/${sport}/teams/${teamId}`
        : `https://site.api.espn.com/apis/site/v2/sports/${sport}/teams`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`ESPN API error: ${response.status}`);

      const data = await response.json();
      this.espnCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.warn(`Failed to fetch ESPN team data:`, error);
      return null;
    }
  }

  // Check if image URL exists and is accessible
  private static async checkImageExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get sport icon using ESPN service
  static getSportIcon(sportKey: string): string {
    if (this.iconCache.has(sportKey)) {
      return this.iconCache.get(sportKey)!;
    }

    const iconPath = ESPNAssetService.getSportIcon(sportKey);
    this.iconCache.set(sportKey, iconPath);
    return iconPath;
  }

  // Get team logo using Universal Team Service
  static getTeamLogo(teamName: string, league: string = 'nba'): string {
    const cacheKey = `${league}-${teamName}`;
    if (this.logoCache.has(cacheKey)) {
      return this.logoCache.get(cacheKey)!;
    }

    const logoPath = UniversalTeamService.getTeamLogo(teamName, league);
    this.logoCache.set(cacheKey, logoPath);
    return logoPath;
  }

  // Get player photo
  static getPlayerPhoto(playerId: string, sport: string): string {
    return UniversalTeamService.getPlayerPhoto(playerId, sport);
  }

  // Preload assets for better performance
  static async preloadAssets(assets: string[]): Promise<void> {
    const promises = assets.map(asset => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(asset);
        img.onerror = () => reject(new Error(`Failed to load: ${asset}`));
        img.src = asset;
      });
    });

    try {
      await Promise.all(promises);
      console.log('✅ Assets preloaded successfully');
    } catch (error) {
      console.warn('⚠️ Some assets failed to preload:', error);
    }
  }

  // Check if asset exists
  static async checkAssetExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get available sports icons
  static getAvailableSports(): string[] {
    return [
      'basketball', 'football', 'baseball', 'hockey', 'soccer',
      'tennis', 'golf', 'boxing', 'mma', 'cricket', 'rugby',
      'formula1', 'nascar', 'esports'
    ];
  }

  // Get available leagues
  static getAvailableLeagues(): string[] {
    return [
      'nba', 'nfl', 'mlb', 'nhl', 'mls', 'premier-league',
      'la-liga', 'serie-a', 'bundesliga', 'ligue-1', 'ncaa',
      'wnba', 'ufc', 'boxing', 'nascar', 'tennis', 'esports'
    ];
  }
}