// Asset management utilities for WeParlay
// Handles dynamic loading and caching of sports and team assets

export class AssetManager {
  private static iconCache = new Map<string, string>();
  private static logoCache = new Map<string, string>();

  // Get sport icon with fallback
  static getSportIcon(sportKey: string): string {
    if (this.iconCache.has(sportKey)) {
      return this.iconCache.get(sportKey)!;
    }

    // Try different file extensions
    const extensions = ['.svg', '.png', '.jpg'];
    const basePath = `/src/assets/sports/${sportKey.toLowerCase().replace(/\s+/g, '-')}`;

    for (const ext of extensions) {
      const iconPath = `${basePath}${ext}`;
      this.iconCache.set(sportKey, iconPath);
      return iconPath;
    }

    // Fallback to generic sport icon
    const fallbackPath = '/src/assets/sports/basketball.svg';
    this.iconCache.set(sportKey, fallbackPath);
    return fallbackPath;
  }

  // Get team logo with fallback
  static getTeamLogo(teamName: string, league: string = 'nba'): string {
    const cacheKey = `${league}-${teamName}`;
    if (this.logoCache.has(cacheKey)) {
      return this.logoCache.get(cacheKey)!;
    }

    // Try different file extensions
    const extensions = ['.svg', '.png', '.jpg'];
    const basePath = `/src/assets/teams/${league.toLowerCase()}/${teamName.toLowerCase().replace(/\s+/g, '-')}`;

    for (const ext of extensions) {
      const logoPath = `${basePath}${ext}`;
      this.logoCache.set(cacheKey, logoPath);
      return logoPath;
    }

    // Fallback to generic team logo
    const fallbackPath = '/src/assets/teams/default-team.svg';
    this.logoCache.set(cacheKey, fallbackPath);
    return fallbackPath;
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