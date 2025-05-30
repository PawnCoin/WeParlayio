
// ESPN Asset Service - Comprehensive sports logos and icons
// This service provides access to ESPN's vast collection of team logos and sports icons

export class ESPNAssetService {
  private static baseUrl = 'https://a.espncdn.com';
  private static logoCache = new Map<string, string>();

  // Get team logo from ESPN's CDN
  static getTeamLogo(teamName: string, league: string, teamId?: string): string {
    const cacheKey = `${league}-${teamName}-${teamId}`;
    
    if (this.logoCache.has(cacheKey)) {
      return this.logoCache.get(cacheKey)!;
    }

    let logoUrl = '';
    
    // If we have a specific team ID, use it directly
    if (teamId) {
      logoUrl = this.getLogoByLeagueAndId(league, teamId);
    } else {
      // Try to get logo by team name mapping
      logoUrl = this.getLogoByTeamName(teamName, league);
    }

    this.logoCache.set(cacheKey, logoUrl);
    return logoUrl;
  }

  // Get sport icon from ESPN
  static getSportIcon(sport: string): string {
    const sportIcons: Record<string, string> = {
      basketball: `${this.baseUrl}/redesign/assets/img/icons/ESPN-icon-basketball.png`,
      football: `${this.baseUrl}/redesign/assets/img/icons/ESPN-icon-football.png`,
      baseball: `${this.baseUrl}/redesign/assets/img/icons/ESPN-icon-baseball.png`,
      hockey: `${this.baseUrl}/redesign/assets/img/icons/ESPN-icon-hockey.png`,
      soccer: `${this.baseUrl}/redesign/assets/img/icons/ESPN-icon-soccer.png`,
      tennis: `${this.baseUrl}/redesign/assets/img/icons/ESPN-icon-tennis.png`,
      golf: `${this.baseUrl}/redesign/assets/img/icons/ESPN-icon-golf.png`,
      boxing: `${this.baseUrl}/redesign/assets/img/icons/ESPN-icon-boxing.png`,
      mma: `${this.baseUrl}/redesign/assets/img/icons/ESPN-icon-mma.png`,
      nascar: `${this.baseUrl}/redesign/assets/img/icons/ESPN-icon-nascar.png`,
      esports: `${this.baseUrl}/redesign/assets/img/icons/ESPN-icon-esports.png`,
      cricket: `${this.baseUrl}/redesign/assets/img/icons/ESPN-icon-cricket.png`,
      rugby: `${this.baseUrl}/redesign/assets/img/icons/ESPN-icon-rugby.png`
    };

    return sportIcons[sport.toLowerCase()] || sportIcons.basketball;
  }

  // Get logo by league and team ID
  private static getLogoByLeagueAndId(league: string, teamId: string): string {
    const leagueEndpoints: Record<string, string> = {
      // North American Sports
      'nba': `${this.baseUrl}/i/teamlogos/nba/500/${teamId}.png`,
      'nfl': `${this.baseUrl}/i/teamlogos/nfl/500/${teamId}.png`,
      'mlb': `${this.baseUrl}/i/teamlogos/mlb/500/${teamId}.png`,
      'nhl': `${this.baseUrl}/i/teamlogos/nhl/500/${teamId}.png`,
      'wnba': `${this.baseUrl}/i/teamlogos/wnba/500/${teamId}.png`,
      'mls': `${this.baseUrl}/i/teamlogos/soccer/500/${teamId}.png`,
      
      // College Sports
      'ncaa': `${this.baseUrl}/i/teamlogos/ncaa/500/${teamId}.png`,
      'ncaaf': `${this.baseUrl}/i/teamlogos/ncaa/500/${teamId}.png`,
      'ncaab': `${this.baseUrl}/i/teamlogos/ncaa/500/${teamId}.png`,
      'ncaaw': `${this.baseUrl}/i/teamlogos/ncaa/500/${teamId}.png`,
      
      // International Soccer
      'premier-league': `${this.baseUrl}/i/teamlogos/soccer/500/${teamId}.png`,
      'la-liga': `${this.baseUrl}/i/teamlogos/soccer/500/${teamId}.png`,
      'serie-a': `${this.baseUrl}/i/teamlogos/soccer/500/${teamId}.png`,
      'bundesliga': `${this.baseUrl}/i/teamlogos/soccer/500/${teamId}.png`,
      'ligue-1': `${this.baseUrl}/i/teamlogos/soccer/500/${teamId}.png`,
      'champions-league': `${this.baseUrl}/i/teamlogos/soccer/500/${teamId}.png`,
      'europa-league': `${this.baseUrl}/i/teamlogos/soccer/500/${teamId}.png`,
      
      // International Leagues
      'cfl': `${this.baseUrl}/i/teamlogos/cfl/500/${teamId}.png`,
      'afl': `${this.baseUrl}/i/teamlogos/afl/500/${teamId}.png`,
      'kbo': `${this.baseUrl}/i/teamlogos/kbo/500/${teamId}.png`,
      'npb': `${this.baseUrl}/i/teamlogos/npb/500/${teamId}.png`,
      'j-league': `${this.baseUrl}/i/teamlogos/soccer/500/${teamId}.png`,
      'a-league': `${this.baseUrl}/i/teamlogos/soccer/500/${teamId}.png`,
      
      // Combat Sports
      'ufc': `${this.baseUrl}/i/teamlogos/mma/500/${teamId}.png`,
      'boxing': `${this.baseUrl}/i/teamlogos/boxing/500/${teamId}.png`,
      
      // Motorsports
      'f1': `${this.baseUrl}/i/teamlogos/rpm/500/${teamId}.png`,
      'nascar': `${this.baseUrl}/i/teamlogos/rpm/500/${teamId}.png`,
      'indycar': `${this.baseUrl}/i/teamlogos/rpm/500/${teamId}.png`,
      
      // Tennis
      'atp': `${this.baseUrl}/i/teamlogos/tennis/500/${teamId}.png`,
      'wta': `${this.baseUrl}/i/teamlogos/tennis/500/${teamId}.png`,
      
      // Olympic & International
      'olympics': `${this.baseUrl}/i/teamlogos/olympics/500/${teamId}.png`,
      
      // Cricket
      'ipl': `${this.baseUrl}/i/teamlogos/cricket/500/${teamId}.png`,
      'bbl': `${this.baseUrl}/i/teamlogos/cricket/500/${teamId}.png`,
      'county': `${this.baseUrl}/i/teamlogos/cricket/500/${teamId}.png`,
      
      // Rugby
      'nrl': `${this.baseUrl}/i/teamlogos/rugby/500/${teamId}.png`,
      'super-rugby': `${this.baseUrl}/i/teamlogos/rugby/500/${teamId}.png`,
      'six-nations': `${this.baseUrl}/i/teamlogos/rugby/500/${teamId}.png`,
      
      // Esports
      'lol': `${this.baseUrl}/i/teamlogos/esports/500/${teamId}.png`,
      'csgo': `${this.baseUrl}/i/teamlogos/esports/500/${teamId}.png`,
      'dota2': `${this.baseUrl}/i/teamlogos/esports/500/${teamId}.png`,
      'valorant': `${this.baseUrl}/i/teamlogos/esports/500/${teamId}.png`,
      'overwatch': `${this.baseUrl}/i/teamlogos/esports/500/${teamId}.png`
    };

    return leagueEndpoints[league.toLowerCase()] || this.getDefaultLogo(league);
  }

  // Get logo by team name (fallback method)
  private static getLogoByTeamName(teamName: string, league: string): string {
    // This would map team names to ESPN team IDs
    // For now, return a constructed path
    const cleanName = teamName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return this.getLogoByLeagueAndId(league, cleanName);
  }

  // Get default logo for unknown teams
  private static getDefaultLogo(league: string): string {
    const sportType = this.getLeagueSport(league);
    return this.getSportIcon(sportType);
  }

  // Map league to sport type
  private static getLeagueSport(league: string): string {
    const leagueSportMap: Record<string, string> = {
      'nba': 'basketball',
      'wnba': 'basketball',
      'ncaab': 'basketball',
      'ncaaw': 'basketball',
      'nfl': 'football',
      'ncaaf': 'football',
      'cfl': 'football',
      'mlb': 'baseball',
      'kbo': 'baseball',
      'npb': 'baseball',
      'nhl': 'hockey',
      'mls': 'soccer',
      'premier-league': 'soccer',
      'la-liga': 'soccer',
      'serie-a': 'soccer',
      'bundesliga': 'soccer',
      'ligue-1': 'soccer',
      'j-league': 'soccer',
      'a-league': 'soccer',
      'ufc': 'mma',
      'boxing': 'boxing',
      'f1': 'nascar',
      'nascar': 'nascar',
      'indycar': 'nascar',
      'atp': 'tennis',
      'wta': 'tennis',
      'ipl': 'cricket',
      'bbl': 'cricket',
      'nrl': 'rugby',
      'super-rugby': 'rugby'
    };

    return leagueSportMap[league.toLowerCase()] || 'basketball';
  }

  // Get all available leagues
  static getAvailableLeagues(): string[] {
    return [
      // Major North American
      'nba', 'nfl', 'mlb', 'nhl', 'wnba', 'mls',
      
      // College
      'ncaa', 'ncaaf', 'ncaab', 'ncaaw',
      
      // International Soccer
      'premier-league', 'la-liga', 'serie-a', 'bundesliga', 'ligue-1',
      'champions-league', 'europa-league', 'j-league', 'a-league',
      
      // Other International
      'cfl', 'afl', 'kbo', 'npb',
      
      // Combat Sports
      'ufc', 'boxing',
      
      // Motorsports
      'f1', 'nascar', 'indycar',
      
      // Tennis
      'atp', 'wta',
      
      // Cricket
      'ipl', 'bbl', 'county',
      
      // Rugby
      'nrl', 'super-rugby', 'six-nations',
      
      // Esports
      'lol', 'csgo', 'dota2', 'valorant', 'overwatch'
    ];
  }

  // Get player photos (for fantasy/stats)
  static getPlayerPhoto(playerId: string, sport: string): string {
    const sportPaths: Record<string, string> = {
      'nba': `${this.baseUrl}/i/headshots/nba/players/full/${playerId}.png`,
      'nfl': `${this.baseUrl}/i/headshots/nfl/players/full/${playerId}.png`,
      'mlb': `${this.baseUrl}/i/headshots/mlb/players/full/${playerId}.png`,
      'nhl': `${this.baseUrl}/i/headshots/nhl/players/full/${playerId}.png`,
      'wnba': `${this.baseUrl}/i/headshots/wnba/players/full/${playerId}.png`,
      'mls': `${this.baseUrl}/i/headshots/soccer/players/full/${playerId}.png`,
      'ncaa': `${this.baseUrl}/i/headshots/college-football/players/full/${playerId}.png`,
      'soccer': `${this.baseUrl}/i/headshots/soccer/players/full/${playerId}.png`,
      'tennis': `${this.baseUrl}/i/headshots/tennis/players/full/${playerId}.png`,
      'golf': `${this.baseUrl}/i/headshots/golf/players/full/${playerId}.png`
    };

    return sportPaths[sport.toLowerCase()] || `${this.baseUrl}/redesign/assets/img/icons/ESPN-icon-${sport}.png`;
  }

  // Check if asset exists
  static async validateAsset(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Preload critical assets
  static async preloadCriticalAssets(): Promise<void> {
    const criticalAssets = [
      this.getSportIcon('basketball'),
      this.getSportIcon('football'),
      this.getSportIcon('baseball'),
      this.getSportIcon('hockey'),
      this.getSportIcon('soccer')
    ];

    await Promise.all(
      criticalAssets.map(url => 
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Don't fail on error
          img.src = url;
        })
      )
    );
  }
}
