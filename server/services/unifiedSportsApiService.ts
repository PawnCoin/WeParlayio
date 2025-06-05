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
   * Get comprehensive sports list prioritizing AllSportsAPI first with fallbacks
   */
  async getMassiveSportsList(): Promise<any> {
    try {
      console.log('Fetching sports from AllSportsAPI...');
      
      // Primary source: AllSportsAPI
      try {
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
      } catch (error) {
        console.warn('AllSportsAPI failed, trying fallbacks:', error);
      }
      
      // Fallback 1: RapidAPI
      try {
        const rapidSports = await this.rapidApi.getSports();
        if (rapidSports.length > 0) {
          console.log(`✅ RapidAPI fallback: Retrieved ${rapidSports.length} sports`);
          return rapidSports;
        }
      } catch (error) {
        console.warn('RapidAPI fallback failed:', error);
      }
      
      // Fallback 2: SportsGameOdds
      try {
        const sportsGameSports = await this.sportsGameOdds.getSports();
        if (sportsGameSports.length > 0) {
          console.log(`✅ SportsGameOdds fallback: Retrieved ${sportsGameSports.length} sports`);
          return sportsGameSports;
        }
      } catch (error) {
        console.warn('SportsGameOdds fallback failed:', error);
      }
      
      // Fallback 3: Grid API
      try {
        const gridSports = await this.gridApi.getSports();
        if (gridSports.length > 0) {
          console.log(`✅ Grid API fallback: Retrieved ${gridSports.length} sports`);
          return gridSports;
        }
      } catch (error) {
        console.warn('Grid API fallback failed:', error);
      }
      
      console.log('All sports APIs failed - no data available');
      return [];
    } catch (error) {
      console.error('Error in getMassiveSportsList:', error);
      return [];
    }
  }

  /**
   * Get unified odds prioritizing AllSportsAPI with fallbacks
   */
  async getUnifiedOdds(sport?: string): Promise<any> {
    try {
      // Primary source: AllSportsAPI
      try {
        const allSportsOdds = await this.allSportsApi.getOdds(sport || 'americanfootball_nfl');
        if (allSportsOdds.length > 0) {
          console.log(`✅ AllSportsAPI odds: ${allSportsOdds.length} events`);
          return allSportsOdds;
        }
      } catch (error) {
        console.warn('AllSportsAPI odds failed, trying fallbacks:', error);
      }
      
      // Fallback 1: OddsAPI
      try {
        const oddsApiData = await this.oddsApi.getOdds(sport);
        if (oddsApiData.length > 0) {
          console.log(`✅ OddsAPI fallback: ${oddsApiData.length} events`);
          return oddsApiData;
        }
      } catch (error) {
        console.warn('OddsAPI fallback failed:', error);
      }
      
      // Fallback 2: RapidAPI
      try {
        const rapidOdds = await this.rapidApi.getOdds(sport);
        if (rapidOdds.length > 0) {
          console.log(`✅ RapidAPI fallback: ${rapidOdds.length} events`);
          return rapidOdds;
        }
      } catch (error) {
        console.warn('RapidAPI fallback failed:', error);
      }
      
      console.log('All odds APIs failed - no data available');
      return [];
    } catch (error) {
      console.error('Error fetching unified odds:', error);
      return [];
    }
  }

  /**
   * Get live events prioritizing AllSportsAPI with fallbacks
   */
  async getUnifiedLiveEvents(): Promise<any> {
    try {
      // Primary source: AllSportsAPI
      try {
        const liveEvents = await this.allSportsApi.getLiveEvents();
        if (liveEvents.length > 0) {
          console.log(`✅ AllSportsAPI live events: ${liveEvents.length} events`);
          return liveEvents;
        }
      } catch (error) {
        console.warn('AllSportsAPI live events failed, trying fallbacks:', error);
      }
      
      // Fallback 1: OddsAPI
      try {
        const oddsLiveEvents = await this.oddsApi.getLiveEvents();
        if (oddsLiveEvents.length > 0) {
          console.log(`✅ OddsAPI fallback: ${oddsLiveEvents.length} events`);
          return oddsLiveEvents;
        }
      } catch (error) {
        console.warn('OddsAPI live events fallback failed:', error);
      }
      
      // Fallback 2: Grid API
      try {
        const gridLiveEvents = await this.gridApi.getLiveEvents();
        if (gridLiveEvents.length > 0) {
          console.log(`✅ Grid API fallback: ${gridLiveEvents.length} events`);
          return gridLiveEvents;
        }
      } catch (error) {
        console.warn('Grid API live events fallback failed:', error);
      }
      
      console.log('All live events APIs failed - no data available');
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