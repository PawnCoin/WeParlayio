// PSN Profiles Web Scraper for WeParlay Gaming
// Scrapes PlayStation Network profile data from psnprofiles.com

import axios from 'axios';
import * as cheerio from 'cheerio';
import NodeCache from 'node-cache';

// Cache for 5 minutes to avoid excessive requests
const cache = new NodeCache({ stdTTL: 300 });

export interface PSNProfile {
  username: string;
  avatar?: string;
  level: number;
  trophies: {
    platinum: number;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
  };
  gamesPlayed: number;
  completedGames: number;
  completion: string;
  worldRank?: number;
  countryRank?: number;
  recentGames: PSNGame[];
}

export interface PSNGame {
  name: string;
  platform: string;
  progress: string;
  lastPlayed: string;
  trophies: {
    earned: number;
    total: number;
  };
}

export class PSNProfilesScraper {
  private baseUrl = 'https://psnprofiles.com';
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  async scrapeProfile(psnId: string): Promise<PSNProfile> {
    const cacheKey = `psn-profile-${psnId}`;
    
    // Check cache first
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) as PSNProfile;
    }

    try {
      const url = `${this.baseUrl}/${psnId}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Extract profile data
      const profile: PSNProfile = {
        username: psnId,
        avatar: $('.avatar img').attr('src'),
        level: parseInt($('.level').text().replace('Level ', '')) || 0,
        trophies: {
          platinum: parseInt($('.platinum').text().replace(',', '')) || 0,
          gold: parseInt($('.gold').text().replace(',', '')) || 0,
          silver: parseInt($('.silver').text().replace(',', '')) || 0,
          bronze: parseInt($('.bronze').text().replace(',', '')) || 0,
          total: parseInt($('.total').text().replace(',', '')) || 0
        },
        gamesPlayed: parseInt($('#gamesPlayed').text()) || 0,
        completedGames: parseInt($('#gamesCompleted').text()) || 0,
        completion: $('.completion-rate').text().trim() || '0%',
        recentGames: this.scrapeRecentGames($)
      };

      // Try to get ranking data
      const rankText = $('.rank').text();
      if (rankText.includes('World Rank')) {
        profile.worldRank = parseInt(rankText.match(/World Rank #(\d+)/)?.[1] || '0');
      }
      if (rankText.includes('Country Rank')) {
        profile.countryRank = parseInt(rankText.match(/Country Rank #(\d+)/)?.[1] || '0');
      }

      // Cache the result
      cache.set(cacheKey, profile);
      
      return profile;
    } catch (error) {
      console.error('PSN Profiles scraping error:', error);
      throw new Error(`Failed to scrape PSN profile for ${psnId}`);
    }
  }

  private scrapeRecentGames($: cheerio.CheerioAPI): PSNGame[] {
    const games: PSNGame[] = [];
    
    $('.game-row').each((index, element) => {
      if (index >= 5) return; // Only get recent 5 games
      
      const $game = $(element);
      const game: PSNGame = {
        name: $game.find('.game-title').text().trim(),
        platform: $game.find('.platform').text().trim(),
        progress: $game.find('.progress').text().trim(),
        lastPlayed: $game.find('.last-played').text().trim(),
        trophies: {
          earned: parseInt($game.find('.trophies-earned').text()) || 0,
          total: parseInt($game.find('.trophies-total').text()) || 0
        }
      };
      
      if (game.name) {
        games.push(game);
      }
    });
    
    return games;
  }

  async searchProfiles(query: string): Promise<string[]> {
    const cacheKey = `psn-search-${query}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) as string[];
    }

    try {
      const url = `${this.baseUrl}/search/users?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const profiles: string[] = [];
      
      $('.search-result .username').each((index, element) => {
        if (index >= 10) return; // Limit to 10 results
        const username = $(element).text().trim();
        if (username) {
          profiles.push(username);
        }
      });

      cache.set(cacheKey, profiles);
      return profiles;
    } catch (error) {
      console.error('PSN search error:', error);
      return [];
    }
  }

  async getGameStats(psnId: string, gameId: string): Promise<any> {
    const cacheKey = `psn-game-${psnId}-${gameId}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    try {
      const url = `${this.baseUrl}/${psnId}/${gameId}`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      const gameStats = {
        gameName: $('.game-title').text().trim(),
        platform: $('.platform').text().trim(),
        completion: $('.completion-rate').text().trim(),
        trophiesEarned: parseInt($('.trophies-earned').text()) || 0,
        trophiesTotal: parseInt($('.trophies-total').text()) || 0,
        difficulty: $('.difficulty-rating').text().trim(),
        playTime: $('.play-time').text().trim(),
        lastPlayed: $('.last-played').text().trim()
      };

      cache.set(cacheKey, gameStats);
      return gameStats;
    } catch (error) {
      console.error('PSN game stats error:', error);
      throw new Error(`Failed to get game stats for ${psnId}/${gameId}`);
    }
  }

  // Generate betting recommendations based on PSN profile data
  generateBettingRecommendations(profile: PSNProfile): any {
    const completionRate = parseFloat(profile.completion.replace('%', ''));
    const trophyRatio = profile.trophies.platinum / Math.max(profile.gamesPlayed, 1);
    
    return {
      skillLevel: completionRate > 80 ? 'expert' : completionRate > 50 ? 'intermediate' : 'casual',
      bettingConfidence: completionRate > 70 ? 'high' : 'medium',
      recommendedBets: [
        `Game completion (${completionRate}% avg completion rate)`,
        `Trophy hunting (${trophyRatio.toFixed(2)} platinum per game)`,
        `New game performance prediction`
      ],
      riskAssessment: completionRate > 75 ? 'low' : 'medium'
    };
  }
}

export const psnProfilesScraper = new PSNProfilesScraper();