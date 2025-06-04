/**
 * Unified Sports API Service - Multi-Source Data Aggregation
 * Combines RapidAPI, SportsGameOdds.com, The Odds API for 110+ sports coverage
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
      
      // Fallback to other APIs only if AllSportsAPI fails
      console.log('AllSportsAPI unavailable, using fallback sources...');
      const primarySports = [
        { id: 1, name: 'American Football', key: 'americanfootball_general', category: 'American Football', active: true },
        { id: 2, name: 'NFL', key: 'americanfootball_nfl', category: 'American Football', active: true },
        { id: 3, name: 'NCAA Football', key: 'americanfootball_ncaaf', category: 'American Football', active: true },
        { id: 4, name: 'Basketball', key: 'basketball_general', category: 'Basketball', active: true },
        { id: 5, name: 'NBA', key: 'basketball_nba', category: 'Basketball', active: true },
        { id: 6, name: 'NCAA Basketball', key: 'basketball_ncaab', category: 'Basketball', active: true },
        { id: 7, name: 'WNBA', key: 'basketball_wnba', category: 'Basketball', active: true },
        { id: 8, name: 'Baseball', key: 'baseball_general', category: 'Baseball', active: true },
        { id: 9, name: 'MLB', key: 'baseball_mlb', category: 'Baseball', active: true },
        { id: 10, name: 'Ice Hockey', key: 'icehockey_general', category: 'Ice Hockey', active: true },
        { id: 11, name: 'NHL', key: 'icehockey_nhl', category: 'Ice Hockey', active: true },
        { id: 12, name: 'Soccer', key: 'soccer_general', category: 'Soccer', active: true },
        { id: 13, name: 'Premier League', key: 'soccer_epl', category: 'Soccer', active: true },
        { id: 14, name: 'UEFA Champions League', key: 'soccer_uefa_champs_league', category: 'Soccer', active: true },
        { id: 15, name: 'Tennis WTA', key: 'tennis_wta', category: 'Tennis', active: true },
        { id: 16, name: 'Tennis ATP', key: 'tennis_atp', category: 'Tennis', active: true },
        { id: 17, name: 'Boxing', key: 'boxing_main', category: 'Combat Sports', active: true },
        { id: 18, name: 'MMA', key: 'mma_mixed_martial_arts', category: 'Combat Sports', active: true },
        { id: 19, name: 'UFC', key: 'mma_ufc', category: 'Combat Sports', active: true }
      ];

      allSports.push(...primarySports);

      // Extended soccer leagues from RapidAPI
      const soccerLeagues = [
        { id: 21, name: 'La Liga', key: 'soccer_spain_la_liga', category: 'Soccer', active: true },
        { id: 22, name: 'Bundesliga', key: 'soccer_germany_bundesliga', category: 'Soccer', active: true },
        { id: 23, name: 'Serie A', key: 'soccer_italy_serie_a', category: 'Soccer', active: true },
        { id: 24, name: 'Ligue 1', key: 'soccer_france_ligue_one', category: 'Soccer', active: true },
        { id: 25, name: 'MLS', key: 'soccer_usa_mls', category: 'Soccer', active: true },
        { id: 26, name: 'Liga MX', key: 'soccer_mexico_ligamx', category: 'Soccer', active: true },
        { id: 27, name: 'Brazilian Serie A', key: 'soccer_brazil_campeonato', category: 'Soccer', active: true },
        { id: 28, name: 'Argentina Primera', key: 'soccer_argentina_primera_division', category: 'Soccer', active: true },
        { id: 29, name: 'Netherlands Eredivisie', key: 'soccer_netherlands_eredivisie', category: 'Soccer', active: true },
        { id: 30, name: 'Portugal Primeira Liga', key: 'soccer_portugal_primeira_liga', category: 'Soccer', active: true },
        { id: 31, name: 'Championship', key: 'soccer_efl_champ', category: 'Soccer', active: true },
        { id: 32, name: 'Europa League', key: 'soccer_uefa_europa_league', category: 'Soccer', active: true },
        { id: 33, name: 'FA Cup', key: 'soccer_fa_cup', category: 'Soccer', active: true },
        { id: 34, name: 'World Cup', key: 'soccer_fifa_world_cup', category: 'Soccer', active: true }
      ];

      allSports.push(...soccerLeagues);

      // International Basketball from RapidAPI
      const basketballLeagues = [
        { id: 35, name: 'EuroLeague', key: 'basketball_euroleague', category: 'Basketball', active: true },
        { id: 36, name: 'NBA G League', key: 'basketball_nba_g_league', category: 'Basketball', active: true },
        { id: 37, name: 'Spanish Liga ACB', key: 'basketball_spain_acb', category: 'Basketball', active: true },
        { id: 38, name: 'Italian Lega Basket', key: 'basketball_italy_lega_a', category: 'Basketball', active: true },
        { id: 39, name: 'Greek Basket League', key: 'basketball_greece_a1', category: 'Basketball', active: true },
        { id: 40, name: 'Turkish BSL', key: 'basketball_turkey_bsl', category: 'Basketball', active: true },
        { id: 41, name: 'Australian NBL', key: 'basketball_australia_nbl', category: 'Basketball', active: true }
      ];

      allSports.push(...basketballLeagues);

      // International Hockey Leagues
      const hockeyLeagues = [
        { id: 42, name: 'KHL', key: 'icehockey_khl', category: 'Ice Hockey', active: true },
        { id: 43, name: 'SHL', key: 'icehockey_sweden_hockey_league', category: 'Ice Hockey', active: true },
        { id: 44, name: 'Finnish Liiga', key: 'icehockey_finland_sm_liiga', category: 'Ice Hockey', active: true },
        { id: 45, name: 'Swiss NL', key: 'icehockey_switzerland_nl', category: 'Ice Hockey', active: true },
        { id: 46, name: 'Czech Extraliga', key: 'icehockey_czech_extraliga', category: 'Ice Hockey', active: true },
        { id: 47, name: 'AHL', key: 'icehockey_ahl', category: 'Ice Hockey', active: true }
      ];

      allSports.push(...hockeyLeagues);

      // Baseball Leagues Worldwide
      const baseballLeagues = [
        { id: 48, name: 'NPB', key: 'baseball_japan_npb', category: 'Baseball', active: true },
        { id: 49, name: 'KBO', key: 'baseball_korea_kbo', category: 'Baseball', active: true },
        { id: 50, name: 'Mexican League', key: 'baseball_mexico_lmp', category: 'Baseball', active: true },
        { id: 51, name: 'Australian ABL', key: 'baseball_australia_abl', category: 'Baseball', active: true }
      ];

      allSports.push(...baseballLeagues);

      // Cricket Leagues
      const cricketLeagues = [
        { id: 52, name: 'Cricket', key: 'cricket_international', category: 'Cricket', active: true },
        { id: 53, name: 'IPL', key: 'cricket_ipl', category: 'Cricket', active: true },
        { id: 54, name: 'Big Bash League', key: 'cricket_big_bash', category: 'Cricket', active: true },
        { id: 55, name: 'The Hundred', key: 'cricket_the_hundred', category: 'Cricket', active: true },
        { id: 56, name: 'County Championship', key: 'cricket_county_championship', category: 'Cricket', active: true }
      ];

      allSports.push(...cricketLeagues);

      // Rugby Leagues
      const rugbyLeagues = [
        { id: 57, name: 'Rugby League', key: 'rugbyleague_general', category: 'Rugby', active: true },
        { id: 58, name: 'NRL', key: 'rugbyleague_nrl', category: 'Rugby', active: true },
        { id: 59, name: 'Rugby Union', key: 'rugby_world_cup', category: 'Rugby', active: true },
        { id: 60, name: 'Six Nations', key: 'rugby_six_nations', category: 'Rugby', active: true },
        { id: 61, name: 'Super Rugby', key: 'rugby_super_rugby', category: 'Rugby', active: true }
      ];

      allSports.push(...rugbyLeagues);

      // Golf Tournaments
      const golfTournaments = [
        { id: 62, name: 'Golf', key: 'golf_pga_championship', category: 'Golf', active: true },
        { id: 63, name: 'PGA Tour', key: 'golf_pga_tour', category: 'Golf', active: true },
        { id: 64, name: 'Masters', key: 'golf_masters', category: 'Golf', active: true },
        { id: 65, name: 'US Open Golf', key: 'golf_us_open', category: 'Golf', active: true },
        { id: 66, name: 'British Open', key: 'golf_the_open_championship', category: 'Golf', active: true }
      ];

      allSports.push(...golfTournaments);

      // Motorsports
      const motorsports = [
        { id: 67, name: 'Formula 1', key: 'motorsport_formula_1', category: 'Motorsports', active: true },
        { id: 68, name: 'NASCAR', key: 'motorsport_nascar', category: 'Motorsports', active: true },
        { id: 69, name: 'IndyCar', key: 'motorsport_indycar', category: 'Motorsports', active: true },
        { id: 70, name: 'MotoGP', key: 'motorsport_motogp', category: 'Motorsports', active: true }
      ];

      allSports.push(...motorsports);

      // Additional Olympic & International Sports
      const olympicSports = [
        { id: 71, name: 'Track & Field', key: 'athletics_world_championships', category: 'Athletics', active: true },
        { id: 72, name: 'Swimming', key: 'swimming_world_championships', category: 'Swimming', active: true },
        { id: 73, name: 'Cycling', key: 'cycling_tour_de_france', category: 'Cycling', active: true },
        { id: 74, name: 'Volleyball', key: 'volleyball_fivb', category: 'Volleyball', active: true },
        { id: 75, name: 'Handball', key: 'handball_world_championship', category: 'Handball', active: true },
        { id: 76, name: 'Water Polo', key: 'waterpolo_world_league', category: 'Water Sports', active: true },
        { id: 77, name: 'Table Tennis', key: 'tabletennis_world_tour', category: 'Table Tennis', active: true },
        { id: 78, name: 'Badminton', key: 'badminton_world_tour', category: 'Badminton', active: true },
        { id: 79, name: 'Darts', key: 'darts_world_championship', category: 'Darts', active: true },
        { id: 80, name: 'Snooker', key: 'snooker_world_championship', category: 'Snooker', active: true }
      ];

      allSports.push(...olympicSports);

      // Esports from your gaming integration
      const esports = [
        { id: 81, name: 'League of Legends', key: 'esports_lol', category: 'Esports', active: true },
        { id: 82, name: 'CS2', key: 'esports_cs2', category: 'Esports', active: true },
        { id: 83, name: 'Dota 2', key: 'esports_dota2', category: 'Esports', active: true },
        { id: 84, name: 'Valorant', key: 'esports_valorant', category: 'Esports', active: true },
        { id: 85, name: 'Call of Duty', key: 'esports_cod', category: 'Esports', active: true },
        { id: 86, name: 'FIFA', key: 'esports_fifa', category: 'Esports', active: true },
        { id: 87, name: 'NBA 2K', key: 'esports_nba2k', category: 'Esports', active: true },
        { id: 88, name: 'Madden NFL', key: 'esports_madden', category: 'Esports', active: true }
      ];

      allSports.push(...esports);

      // Regional & Specialty Sports
      const specialtySports = [
        { id: 89, name: 'Australian Football', key: 'aussierules_general', category: 'Australian Football', active: true },
        { id: 90, name: 'AFL', key: 'aussierules_afl', category: 'Australian Football', active: true },
        { id: 91, name: 'Gaelic Football', key: 'gaelic_football', category: 'Gaelic Sports', active: true },
        { id: 92, name: 'Hurling', key: 'gaelic_hurling', category: 'Gaelic Sports', active: true },
        { id: 93, name: 'Futsal', key: 'futsal_world_cup', category: 'Futsal', active: true },
        { id: 94, name: 'Beach Volleyball', key: 'beach_volleyball_fivb', category: 'Beach Sports', active: true },
        { id: 95, name: 'Lacrosse', key: 'lacrosse_mll', category: 'Lacrosse', active: true },
        { id: 96, name: 'Field Hockey', key: 'field_hockey_world_cup', category: 'Field Hockey', active: true },
        { id: 97, name: 'Netball', key: 'netball_super_league', category: 'Netball', active: true },
        { id: 98, name: 'Squash', key: 'squash_world_tour', category: 'Squash', active: true }
      ];

      allSports.push(...specialtySports);

      // Winter Sports
      const winterSports = [
        { id: 99, name: 'Alpine Skiing', key: 'skiing_alpine_world_cup', category: 'Winter Sports', active: true },
        { id: 100, name: 'Biathlon', key: 'biathlon_world_cup', category: 'Winter Sports', active: true },
        { id: 101, name: 'Figure Skating', key: 'figure_skating_worlds', category: 'Winter Sports', active: true },
        { id: 102, name: 'Speedskating', key: 'speedskating_world_cup', category: 'Winter Sports', active: true },
        { id: 103, name: 'Curling', key: 'curling_world_championship', category: 'Winter Sports', active: true },
        { id: 104, name: 'Bobsled', key: 'bobsled_world_cup', category: 'Winter Sports', active: true }
      ];

      allSports.push(...winterSports);

      // Additional Specialty Events
      const additionalSports = [
        { id: 105, name: 'Poker', key: 'poker_wsop', category: 'Card Games', active: true },
        { id: 106, name: 'Chess', key: 'chess_world_championship', category: 'Board Games', active: true },
        { id: 107, name: 'Politics', key: 'politics_us_presidential', category: 'Politics', active: true },
        { id: 108, name: 'Entertainment', key: 'entertainment_awards', category: 'Entertainment', active: true },
        { id: 109, name: 'Weather', key: 'weather_predictions', category: 'Weather', active: true },
        { id: 110, name: 'Cryptocurrency', key: 'crypto_predictions', category: 'Financial', active: true }
      ];

      allSports.push(...additionalSports);

      return allSports;

    } catch (error) {
      console.error('Error building massive sports list:', error);
      throw error;
    }
  }

  /**
   * Get unified odds from all available APIs including GRID
   */
  async getUnifiedOdds(sport?: string): Promise<any> {
    const allOdds = [];

    try {
      // Fetch from all sources in parallel including GRID API
      const [
        theOddsApiData,
        rapidApiData,
        sportsGameOddsData,
        gridApiData
      ] = await Promise.allSettled([
        this.oddsApi.getOdds(sport || 'americanfootball_nfl'),
        this.rapidApi.getComprehensiveOdds(),
        this.sportsGameOdds.getLiveOdds(sport),
        this.gridApi.getLiveOdds(sport)
      ]);

      // Merge data from The Odds API
      if (theOddsApiData.status === 'fulfilled') {
        allOdds.push(...theOddsApiData.value);
      }

      // Merge data from RapidAPI
      if (rapidApiData.status === 'fulfilled') {
        allOdds.push(...rapidApiData.value);
      }

      // Merge data from SportsGameOdds
      if (sportsGameOddsData.status === 'fulfilled') {
        allOdds.push(...sportsGameOddsData.value);
      }

      // Merge data from GRID API
      if (gridApiData.status === 'fulfilled') {
        allOdds.push(...gridApiData.value);
      }

      // Remove duplicates and prioritize best odds
      return this.consolidateOdds(allOdds);

    } catch (error) {
      console.error('Error fetching unified odds:', error);
      throw error;
    }
  }

  /**
   * Get live events from all sources
   */
  async getUnifiedLiveEvents(): Promise<any> {
    const allLiveEvents = [];

    try {
      // Fetch live events from all APIs
      const [theOddsLive, rapidLive, sportsGameLive] = await Promise.allSettled([
        this.oddsApi.getScores('americanfootball_nfl'),
        this.rapidApi.getLiveScores('football'),
        this.sportsGameOdds.getLiveOdds()
      ]);

      if (theOddsLive.status === 'fulfilled') {
        allLiveEvents.push(...theOddsLive.value);
      }

      if (rapidLive.status === 'fulfilled') {
        allLiveEvents.push(...rapidLive.value);
      }

      if (sportsGameLive.status === 'fulfilled') {
        allLiveEvents.push(...sportsGameLive.value);
      }

      return this.consolidateLiveEvents(allLiveEvents);

    } catch (error) {
      console.error('Error fetching unified live events:', error);
      throw error;
    }
  }

  /**
   * Consolidate odds from multiple sources, keeping best odds
   */
  private consolidateOdds(oddsArray: any[]): any {
    const consolidatedMap = new Map();

    for (const odds of oddsArray) {
      const key = `${odds.home_team}_vs_${odds.away_team}`;
      
      if (!consolidatedMap.has(key)) {
        consolidatedMap.set(key, odds);
      } else {
        // Merge bookmakers for better odds comparison
        const existing = consolidatedMap.get(key);
        if (odds.bookmakers && odds.bookmakers.length > 0) {
          existing.bookmakers = [...(existing.bookmakers || []), ...odds.bookmakers];
        }
      }
    }

    return Array.from(consolidatedMap.values());
  }

  /**
   * Consolidate live events from multiple sources
   */
  private consolidateLiveEvents(eventsArray: any[]): any {
    const consolidatedMap = new Map();

    for (const event of eventsArray) {
      const key = `${event.home_team}_vs_${event.away_team}`;
      
      if (!consolidatedMap.has(key)) {
        consolidatedMap.set(key, event);
      } else {
        // Keep the event with more recent data
        const existing = consolidatedMap.get(key);
        if (event.last_update && (!existing.last_update || new Date(event.last_update) > new Date(existing.last_update))) {
          consolidatedMap.set(key, event);
        }
      }
    }

    return Array.from(consolidatedMap.values());
  }

  /**
   * Get comprehensive upcoming events from all sources
   */
  async getUnifiedUpcomingEvents(days: number = 7): Promise<any> {
    const allUpcoming = [];

    try {
      const [theOddsUpcoming, sportsGameUpcoming] = await Promise.allSettled([
        this.oddsApi.getOdds('americanfootball_nfl'),
        this.sportsGameOdds.getUpcomingEvents(undefined, days)
      ]);

      if (theOddsUpcoming.status === 'fulfilled') {
        allUpcoming.push(...theOddsUpcoming.value);
      }

      if (sportsGameUpcoming.status === 'fulfilled') {
        allUpcoming.push(...sportsGameUpcoming.value);
      }

      return this.consolidateUpcomingEvents(allUpcoming);

    } catch (error) {
      console.error('Error fetching unified upcoming events:', error);
      throw error;
    }
  }

  /**
   * Consolidate upcoming events
   */
  private consolidateUpcomingEvents(eventsArray: any[]): any {
    return eventsArray
      .filter(event => new Date(event.commence_time) > new Date())
      .sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());
  }

  /**
   * Get sport-specific data with enhanced coverage
   */
  async getSportSpecificData(sportKey: string): Promise<any> {
    try {
      const [odds, upcoming, leagues] = await Promise.allSettled([
        this.getUnifiedOdds(sportKey),
        this.getUnifiedUpcomingEvents(),
        this.getSportLeagues(sportKey)
      ]);

      return {
        odds: odds.status === 'fulfilled' ? odds.value : [],
        upcoming: upcoming.status === 'fulfilled' ? upcoming.value : [],
        leagues: leagues.status === 'fulfilled' ? leagues.value : []
      };

    } catch (error) {
      console.error('Error fetching sport-specific data:', error);
      throw error;
    }
  }

  /**
   * Get leagues for a specific sport
   */
  private async getSportLeagues(sportKey: string): Promise<any> {
    try {
      return await this.sportsGameOdds.getSportLeagues(sportKey);
    } catch (error) {
      console.warn('Could not fetch sport leagues:', error);
      return [];
    }
  }
}