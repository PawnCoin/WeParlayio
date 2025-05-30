
// Asset Manager Utility
// Centralized management for team logos and sport icons

import { getTeamLogoPath } from '@/assets/teams/team-logos';
import { getSportIconPath } from '@/assets/sports/sports-icons';
import { getTeamLogo } from './teamLogos'; // Fallback to existing system

export class AssetManager {
  /**
   * Get team logo with fallback strategy
   * 1. Try local assets first
   * 2. Fallback to existing teamLogos.ts (ESPN CDN)
   * 3. Default sport icon if team not found
   */
  static getTeamLogo(teamName: string, league: string = 'nba'): string {
    try {
      // Try local assets first
      const localPath = getTeamLogoPath(teamName, league);
      if (localPath && !localPath.includes('undefined')) {
        return localPath;
      }
    } catch (error) {
      console.warn(`Local asset not found for ${teamName} in ${league}`);
    }

    // Fallback to existing ESPN CDN system
    try {
      const espnLogo = getTeamLogo(teamName, league.toUpperCase());
      if (espnLogo) {
        return espnLogo;
      }
    } catch (error) {
      console.warn(`ESPN CDN logo not found for ${teamName}`);
    }

    // Final fallback to sport icon
    return AssetManager.getSportIcon(league);
  }

  /**
   * Get sport icon with fallback
   */
  static getSportIcon(sportKey: string): string {
    try {
      return getSportIconPath(sportKey.toLowerCase());
    } catch (error) {
      // Default basketball icon as ultimate fallback
      return '/src/assets/sports/basketball.svg';
    }
  }

  /**
   * Preload critical assets for better performance
   */
  static preloadCriticalAssets(teams: string[], leagues: string[]) {
    const criticalAssets: string[] = [];
    
    // Add team logos
    teams.forEach(team => {
      leagues.forEach(league => {
        criticalAssets.push(this.getTeamLogo(team, league));
      });
    });

    // Add sport icons
    leagues.forEach(league => {
      criticalAssets.push(this.getSportIcon(league));
    });

    // Preload images
    criticalAssets.forEach(src => {
      if (src && src.startsWith('/src/assets/')) {
        const img = new Image();
        img.src = src;
      }
    });
  }

  /**
   * Check if asset exists locally
   */
  static async assetExists(path: string): Promise<boolean> {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default AssetManager;
