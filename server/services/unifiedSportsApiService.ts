/**
 * Unified Sports API Service - Multi-Source Data Aggregation
 * Prioritizes AllSportsAPI unlimited subscription for authentic data only
 */

import { RapidApiService } from './rapidApiService';
import { SportsGameOddsService } from './sportsGameOddsService';
import { OddsApiService } from './oddsApiService';
import { GridApiService } from './gridApiService';
import { allSportsApiService } from './allSportsApiService';

export class UnifiedSportsApiService {
  private rapidApi: RapidApiService;
  private sportsGameOdds: SportsGameOddsService;
  private oddsApi: OddsApiService;
  private gridApi: GridApiService;
  private allSportsApi: typeof allSportsApiService;

  constructor() {
    this.rapidApi = new RapidApiService();
    this.sportsGameOdds = new SportsGameOddsService();
    this.oddsApi = new OddsApiService();
    this.gridApi = new GridApiService();
    this.allSportsApi = allSportsApiService;
  }

  /**
   * Get comprehensive sports list prioritizing AllSportsAPI unlimited subscription
   */
  async getMassiveSportsList(): Promise<any> {
    try {
      console.log('Fetching sports from AllSportsAPI unlimited subscription...');
      
      // Primary source: AllSportsAPI unlimited subscription
      const allSportsSports = await this.allSportsApi.getSports();
      
      if (allSportsSports.length > 0) {
        console.log(`✅ AllSportsAPI: Retrieved ${allSportsSports.length} sports`);
        return allSportsSports.map((sport: any, index: number) => ({
          id: index + 1,
          name: sport.title,
          key: sport.key,
          group: sport.group || 'General',
          active: sport.active !== false,
          category: sport.group || 'General',
          description: sport.description || `Live ${sport.title} betting`
        }));
      }
      
      // No fallback data - only authentic AllSportsAPI data allowed
      console.log('AllSportsAPI unavailable - returning empty data set');
      return [];
    } catch (error) {
      console.error('Error in getMassiveSportsList:', error);
      return [];
    }
  }

  /**
   * Get unified odds prioritizing AllSportsAPI
   */
  async getUnifiedOdds(sport?: string): Promise<any> {
    try {
      // Primary source: AllSportsAPI
      const allSportsOdds = await this.allSportsApi.getOdds(sport);
      
      if (allSportsOdds.length > 0) {
        console.log(`✅ AllSportsAPI odds: ${allSportsOdds.length} events`);
        return allSportsOdds;
      }
      
      // No fallback - only authentic data
      return [];
    } catch (error) {
      console.error('Error fetching unified odds:', error);
      return [];
    }
  }

  /**
   * Get live events prioritizing AllSportsAPI
   */
  async getUnifiedLiveEvents(): Promise<any> {
    try {
      // Primary source: AllSportsAPI
      const liveEvents = await this.allSportsApi.getLiveEvents();
      
      if (liveEvents.length > 0) {
        console.log(`✅ AllSportsAPI live events: ${liveEvents.length} events`);
        return liveEvents;
      }
      
      // No fallback - only authentic data
      return [];
    } catch (error) {
      console.error('Error fetching live events:', error);
      return [];
    }
  }

  /**
   * Get upcoming events prioritizing AllSportsAPI
   */
  async getUnifiedUpcomingEvents(days: number = 7): Promise<any> {
    try {
      // Primary source: AllSportsAPI
      const upcomingEvents = await this.allSportsApi.getUpcomingEvents(days);
      
      if (upcomingEvents.length > 0) {
        console.log(`✅ AllSportsAPI upcoming events: ${upcomingEvents.length} events`);
        return upcomingEvents;
      }
      
      // No fallback - only authentic data
      return [];
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return [];
    }
  }

  /**
   * Get sport-specific data prioritizing AllSportsAPI
   */
  async getSportSpecificData(sportKey: string): Promise<any> {
    try {
      // Primary source: AllSportsAPI
      const sportData = await this.allSportsApi.getSportData(sportKey);
      
      if (sportData) {
        console.log(`✅ AllSportsAPI sport data for ${sportKey}`);
        return sportData;
      }
      
      // No fallback - only authentic data
      return null;
    } catch (error) {
      console.error(`Error fetching sport data for ${sportKey}:`, error);
      return null;
    }
  }
}

// Create and export unified service instance
export const unifiedSportsApiService = new UnifiedSportsApiService();