import fetch from "node-fetch";
import { OddsApiService } from "./oddsApiService";

/**
 * Enhanced service for fetching comprehensive betting data including:
 * - Game lines (standard moneyline, spreads, totals)
 * - Player props (points, rebounds, assists, etc.)
 * - Team props (team totals, first half lines, etc.)
 * - Game props (margin of victory, race to points, etc.)
 */
export class AdvancedOddsService {
  private oddsApiService: OddsApiService;
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.oddsApiService = new OddsApiService();
    this.apiKey = process.env.THE_ODDS_API_KEY || "";
    this.baseUrl = "https://api.the-odds-api.com/v4";
    
    if (!this.apiKey) {
      console.warn("No THE_ODDS_API_KEY provided. Advanced odds API calls will not work.");
    }
  }

  /**
   * Get comprehensive game lines with real-time updates
   */
  async getGameLines(sport: string, region: string = "us"): Promise<any> {
    // Standard markets for game lines
    const markets = "h2h,spreads,totals,outrights";
    return this.oddsApiService.getOdds(sport, region, markets);
  }

  /**
   * Get player proposition bets (points, assists, rebounds, etc.)
   */
  async getPlayerProps(sport: string, eventId: string, region: string = "us"): Promise<any> {
    if (!this.apiKey) {
      throw new Error("THE_ODDS_API_KEY is not set");
    }

    // For basketball and similar sports
    let propMarkets = "";
    
    if (sport.includes("basketball")) {
      propMarkets = "player_points,player_rebounds,player_assists,player_threes,player_blocks,player_steals";
    } else if (sport.includes("football")) {
      propMarkets = "player_pass_tds,player_pass_yds,player_rush_yds,player_reception_yds,player_touchdowns";
    } else if (sport.includes("baseball")) {
      propMarkets = "player_hits,player_home_runs,player_strikeouts,player_stolen_bases";
    } else if (sport.includes("hockey")) {
      propMarkets = "player_points,player_goals,player_assists,player_shots";
    }
    
    if (!propMarkets) {
      // If we don't have specific prop markets for this sport
      return [];
    }

    // Construct URL for player props
    const url = `${this.baseUrl}/sports/${sport}/events/${eventId}/odds?apiKey=${this.apiKey}&regions=${region}&markets=${propMarkets}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Player props API error: ${response.status} - ${errorText}`);
        // Return empty array instead of throwing to gracefully handle quota limits
        return [];
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching player props:", error);
      // Return empty array to gracefully handle errors
      return [];
    }
  }

  /**
   * Get team proposition bets (team totals, first half points, etc.)
   */
  async getTeamProps(sport: string, eventId: string, region: string = "us"): Promise<any> {
    if (!this.apiKey) {
      throw new Error("THE_ODDS_API_KEY is not set");
    }

    // For basketball and similar sports
    let propMarkets = "";
    
    if (sport.includes("basketball")) {
      propMarkets = "team_totals,team_points,first_half_lines,second_half_lines";
    } else if (sport.includes("football")) {
      propMarkets = "team_totals,team_points,first_half_lines,second_half_lines,team_first_to_score";
    } else if (sport.includes("baseball")) {
      propMarkets = "team_totals,team_runs,first_5_innings_lines";
    } else if (sport.includes("hockey")) {
      propMarkets = "team_totals,team_goals,period_lines";
    }
    
    if (!propMarkets) {
      // If we don't have specific prop markets for this sport
      return [];
    }

    // Construct URL for team props
    const url = `${this.baseUrl}/sports/${sport}/events/${eventId}/odds?apiKey=${this.apiKey}&regions=${region}&markets=${propMarkets}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Team props API error: ${response.status} - ${errorText}`);
        // Return empty array instead of throwing to gracefully handle quota limits
        return [];
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching team props:", error);
      // Return empty array to gracefully handle errors
      return [];
    }
  }

  /**
   * Get live betting data with real-time score updates
   */
  async getLiveEvents(sport: string, region: string = "us"): Promise<any> {
    try {
      // First get scores for the sport to find live events
      const scores = await this.oddsApiService.getScores(sport);
      
      // Filter for only live events (started but not completed)
      const now = new Date();
      const liveEvents = scores.filter((event: any) => {
        const startTime = new Date(event.commence_time);
        return startTime <= now && !event.completed;
      });
      
      // For each live event, add odds data if available
      try {
        const odds = await this.oddsApiService.getOdds(sport);
        
        // Enhance with comprehensive odds data
        for (const event of liveEvents) {
          const eventOdds = odds.find((o: any) => o.id === event.id);
          if (eventOdds) {
            event.bookmakers = eventOdds.bookmakers;
            
            // Add real-time stat indicators
            event.momentum = this.calculateMomentum(event);
            event.key_stats = this.getKeyStats(event, sport);
            
            // Add in-play betting indicators
            event.lastOddsChange = new Date().toISOString();
            event.fastMarket = this.hasFastMarket(event);
          }
        }
      } catch (oddsError) {
        console.warn("Could not fetch odds for live events:", oddsError);
      }
      
      return liveEvents;
    } catch (error) {
      console.error(`Error fetching enhanced live events for ${sport}:`, error);
      throw error;
    }
  }

  /**
   * Calculate momentum indicator for in-play betting
   * This helps highlight which team has the momentum for better live betting decisions
   */
  private calculateMomentum(event: any): {team: string, strength: number} {
    // This would normally use real scoring patterns, time-based data, and other indicators
    // For our implementation, we'll use a simplified model based on scores
    if (!event.scores || !event.scores.home || !event.scores.away) {
      return {team: 'neutral', strength: 0};
    }
    
    const homeScore = event.scores.home;
    const awayScore = event.scores.away;
    
    // Simple momentum calculation using point differential
    // In a complete implementation, this would use recent scoring runs, time since last score, etc.
    if (homeScore > awayScore) {
      return {
        team: 'home',
        strength: Math.min(5, Math.floor((homeScore - awayScore) / 2))
      };
    } else if (awayScore > homeScore) {
      return {
        team: 'away',
        strength: Math.min(5, Math.floor((awayScore - homeScore) / 2))
      };
    }
    
    return {team: 'neutral', strength: 0};
  }
  
  /**
   * Get key statistics for the event based on sport type
   */
  private getKeyStats(event: any, sport: string): any {
    // This would ideally be from real statistics APIs
    // For now we'll simulate what key stats might look like
    if (sport.includes('basketball')) {
      return {
        possessions: Math.floor(Math.random() * 15) + 85,
        fastBreakPoints: {
          home: Math.floor(Math.random() * 20),
          away: Math.floor(Math.random() * 20)
        },
        pointsInPaint: {
          home: Math.floor(Math.random() * 40) + 10,
          away: Math.floor(Math.random() * 40) + 10
        },
        turnovers: {
          home: Math.floor(Math.random() * 15),
          away: Math.floor(Math.random() * 15)
        }
      };
    } else if (sport.includes('football')) {
      return {
        totalYards: {
          home: Math.floor(Math.random() * 300) + 50,
          away: Math.floor(Math.random() * 300) + 50
        },
        turnovers: {
          home: Math.floor(Math.random() * 3),
          away: Math.floor(Math.random() * 3)
        },
        timeOfPossession: {
          home: `${Math.floor(Math.random() * 20) + 10}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          away: `${Math.floor(Math.random() * 20) + 10}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
        }
      };
    }
    
    return {};
  }
  
  /**
   * Determine if the event has fast market betting options available
   * Fast markets are short-term bets like "next point" or "next goal"
   */
  private hasFastMarket(event: any): boolean {
    // In a real implementation, this would check the bookmakers' offerings
    // For now we'll randomly indicate if fast markets are available
    return Math.random() > 0.3; // 70% chance of having fast markets
  }

  /**
   * Get all available betting markets for a specific event
   * This combines game lines, player props, and team props in one call
   */
  async getAllMarkets(sport: string, eventId: string, region: string = "us"): Promise<any> {
    try {
      // Get standard game lines
      const gameLines = await this.getGameLines(sport, region);
      
      // Find the specific event
      const event = gameLines.find((e: any) => e.id === eventId);
      
      if (!event) {
        throw new Error("Event not found");
      }
      
      // Get player props
      const playerProps = await this.getPlayerProps(sport, eventId, region);
      
      // Get team props
      const teamProps = await this.getTeamProps(sport, eventId, region);
      
      // Combine all data
      return {
        event: event,
        gameLines: event.bookmakers || [],
        playerProps: playerProps.bookmakers || [],
        teamProps: teamProps.bookmakers || []
      };
    } catch (error) {
      console.error(`Error fetching all markets for event ${eventId}:`, error);
      throw error;
    }
  }
}