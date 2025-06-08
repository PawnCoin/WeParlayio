/**
 * Unified Sports API Service - Real Data Only with Intelligent Cascading
 * NO FAKE, MOCK, SYNTHETIC, OR PLACEHOLDER DATA ALLOWED
 * Cascades through 20+ real APIs in priority order for 100% authentic data
 */

import { priorityApiService } from './priorityApiService';

export class UnifiedSportsApiService {
  
  constructor() {
  }

  /**
   * Get unified upcoming events using priority-based fallback
   */
  async getUnifiedUpcomingEvents(): Promise<any[]> {
    const result = await priorityApiService.getOddsWithFallback();
    console.log(`📊 Unified API: Got ${result.data.length} events from ${result.source} (Priority ${result.priority})`);
    return result.data;
  }

  /**
   * Get API status for all services
   */
  async getApiStatus(): Promise<any> {
    return await priorityApiService.getAllApiStatus();
  }

  /**
   * Get sports odds for specific sport using priority fallback
   */
  async getSportOdds(sport: string): Promise<any[]> {
    const result = await priorityApiService.getOddsWithFallback(sport);
    return result.data;
  }

  /**
   * Get live games using priority fallback
   */
  async getLiveGames(): Promise<any[]> {
    const result = await priorityApiService.getOddsWithFallback();
    return result.data.filter((game: any) => game.status === 'live');
  }

  /**
   * Get upcoming games using priority fallback
   */
  async getUpcomingGames(): Promise<any[]> {
    const result = await priorityApiService.getOddsWithFallback();
    return result.data.filter((game: any) => game.status === 'scheduled');
  }

  /**
   * Get all sports odds using priority fallback
   */
  async getAllSportsOdds(): Promise<any[]> {
    const result = await priorityApiService.getOddsWithFallback();
    return result.data;
  }

  /**
   * Get best odds comparison across all sources
   */
  async getBestOdds(gameId: string): Promise<any> {
    const result = await priorityApiService.getOddsWithFallback();
    return result.data.find((game: any) => game.id === gameId);
  }

  /**
   * Get API service status
   */
  async getAPIStatus(): Promise<any> {
    return await this.getApiStatus();
  }
}

export const unifiedSportsApiService = new UnifiedSportsApiService();