/**
 * ESPN API Service for Team Logos and Player Headshots
 * Provides authentic team branding and player images for WeParlay
 */

export class ESPNApiService {
  private baseUrl = 'https://site.api.espn.com/apis/site/v2';
  
  /**
   * Get team logos for NFL
   */
  async getNFLTeams(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sports/football/nfl/teams`);
      const data = await response.json();
      
      return data.sports[0].leagues[0].teams.map((team: any) => ({
        id: team.team.id,
        name: team.team.displayName,
        abbreviation: team.team.abbreviation,
        color: team.team.color,
        alternateColor: team.team.alternateColor,
        logo: team.team.logos?.[0]?.href || '',
        darkLogo: team.team.logos?.find((logo: any) => logo.rel?.includes('dark'))?.href || team.team.logos?.[0]?.href,
        location: team.team.location,
        nickname: team.team.nickname
      }));
    } catch (error) {
      console.error('ESPN NFL Teams API error:', error);
      return [];
    }
  }

  /**
   * Get team logos for NBA
   */
  async getNBATeams(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sports/basketball/nba/teams`);
      const data = await response.json();
      
      return data.sports[0].leagues[0].teams.map((team: any) => ({
        id: team.team.id,
        name: team.team.displayName,
        abbreviation: team.team.abbreviation,
        color: team.team.color,
        alternateColor: team.team.alternateColor,
        logo: team.team.logos?.[0]?.href || '',
        darkLogo: team.team.logos?.find((logo: any) => logo.rel?.includes('dark'))?.href || team.team.logos?.[0]?.href,
        location: team.team.location,
        nickname: team.team.nickname
      }));
    } catch (error) {
      console.error('ESPN NBA Teams API error:', error);
      return [];
    }
  }

  /**
   * Get team logos for MLB
   */
  async getMLBTeams(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sports/baseball/mlb/teams`);
      const data = await response.json();
      
      return data.sports[0].leagues[0].teams.map((team: any) => ({
        id: team.team.id,
        name: team.team.displayName,
        abbreviation: team.team.abbreviation,
        color: team.team.color,
        alternateColor: team.team.alternateColor,
        logo: team.team.logos?.[0]?.href || '',
        darkLogo: team.team.logos?.find((logo: any) => logo.rel?.includes('dark'))?.href || team.team.logos?.[0]?.href,
        location: team.team.location,
        nickname: team.team.nickname
      }));
    } catch (error) {
      console.error('ESPN MLB Teams API error:', error);
      return [];
    }
  }

  /**
   * Get team logos for NHL
   */
  async getNHLTeams(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sports/hockey/nhl/teams`);
      const data = await response.json();
      
      return data.sports[0].leagues[0].teams.map((team: any) => ({
        id: team.team.id,
        name: team.team.displayName,
        abbreviation: team.team.abbreviation,
        color: team.team.color,
        alternateColor: team.team.alternateColor,
        logo: team.team.logos?.[0]?.href || '',
        darkLogo: team.team.logos?.find((logo: any) => logo.rel?.includes('dark'))?.href || team.team.logos?.[0]?.href,
        location: team.team.location,
        nickname: team.team.nickname
      }));
    } catch (error) {
      console.error('ESPN NHL Teams API error:', error);
      return [];
    }
  }

  /**
   * Get all teams across all sports
   */
  async getAllTeams(): Promise<{ [sport: string]: any[] }> {
    const [nflTeams, nbaTeams, mlbTeams, nhlTeams] = await Promise.all([
      this.getNFLTeams(),
      this.getNBATeams(),
      this.getMLBTeams(),
      this.getNHLTeams()
    ]);

    return {
      nfl: nflTeams,
      nba: nbaTeams,
      mlb: mlbTeams,
      nhl: nhlTeams
    };
  }

  /**
   * Get NFL player roster with headshots
   */
  async getNFLRoster(teamId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sports/football/nfl/teams/${teamId}/roster`);
      const data = await response.json();
      
      return data.athletes?.map((athlete: any) => ({
        id: athlete.id,
        name: athlete.displayName,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        position: athlete.position?.abbreviation || athlete.position?.name,
        jersey: athlete.jersey,
        headshot: athlete.headshot?.href || '',
        height: athlete.height,
        weight: athlete.weight,
        age: athlete.age,
        experience: athlete.experience?.years
      })) || [];
    } catch (error) {
      console.error('ESPN NFL Roster API error:', error);
      return [];
    }
  }

  /**
   * Get NBA player roster with headshots
   */
  async getNBARoster(teamId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sports/basketball/nba/teams/${teamId}/roster`);
      const data = await response.json();
      
      return data.athletes?.map((athlete: any) => ({
        id: athlete.id,
        name: athlete.displayName,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        position: athlete.position?.abbreviation || athlete.position?.name,
        jersey: athlete.jersey,
        headshot: athlete.headshot?.href || '',
        height: athlete.height,
        weight: athlete.weight,
        age: athlete.age,
        experience: athlete.experience?.years
      })) || [];
    } catch (error) {
      console.error('ESPN NBA Roster API error:', error);
      return [];
    }
  }

  /**
   * Get team by abbreviation
   */
  async getTeamByAbbreviation(sport: string, abbreviation: string): Promise<any | null> {
    try {
      const teams = await this.getTeamsBySport(sport);
      return teams.find(team => team.abbreviation.toLowerCase() === abbreviation.toLowerCase()) || null;
    } catch (error) {
      console.error('Error getting team by abbreviation:', error);
      return null;
    }
  }

  /**
   * Get teams by sport
   */
  async getTeamsBySport(sport: string): Promise<any[]> {
    switch (sport.toLowerCase()) {
      case 'nfl':
      case 'football':
        return this.getNFLTeams();
      case 'nba':
      case 'basketball':
        return this.getNBATeams();
      case 'mlb':
      case 'baseball':
        return this.getMLBTeams();
      case 'nhl':
      case 'hockey':
        return this.getNHLTeams();
      default:
        return [];
    }
  }

  /**
   * Get game data with team logos
   */
  async getGameWithLogos(sport: string, gameId: string): Promise<any | null> {
    try {
      const response = await fetch(`${this.baseUrl}/sports/${this.getSportPath(sport)}/summary?event=${gameId}`);
      const data = await response.json();
      
      if (data.header?.competitions?.[0]) {
        const competition = data.header.competitions[0];
        const competitors = competition.competitors || [];
        
        return {
          id: gameId,
          date: competition.date,
          status: competition.status?.type?.description || 'Scheduled',
          homeTeam: {
            id: competitors[0]?.team?.id,
            name: competitors[0]?.team?.displayName,
            abbreviation: competitors[0]?.team?.abbreviation,
            logo: competitors[0]?.team?.logos?.[0]?.href || '',
            score: competitors[0]?.score || 0,
            color: competitors[0]?.team?.color
          },
          awayTeam: {
            id: competitors[1]?.team?.id,
            name: competitors[1]?.team?.displayName,
            abbreviation: competitors[1]?.team?.abbreviation,
            logo: competitors[1]?.team?.logos?.[0]?.href || '',
            score: competitors[1]?.score || 0,
            color: competitors[1]?.team?.color
          }
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting game with logos:', error);
      return null;
    }
  }

  /**
   * Helper to get sport path for ESPN API
   */
  private getSportPath(sport: string): string {
    const sportPaths: { [key: string]: string } = {
      'nfl': 'football/nfl',
      'football': 'football/nfl',
      'nba': 'basketball/nba',
      'basketball': 'basketball/nba',
      'mlb': 'baseball/mlb',
      'baseball': 'baseball/mlb',
      'nhl': 'hockey/nhl',
      'hockey': 'hockey/nhl'
    };
    return sportPaths[sport.toLowerCase()] || 'football/nfl';
  }

  /**
   * Get trending players with headshots
   */
  async getTrendingPlayers(sport: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sports/${this.getSportPath(sport)}/news`);
      const data = await response.json();
      
      const players: any[] = [];
      
      // Extract players mentioned in headlines/stories
      for (const article of data.articles?.slice(0, limit) || []) {
        if (article.athletes?.length > 0) {
          for (const athlete of article.athletes) {
            if (!players.find(p => p.id === athlete.id)) {
              players.push({
                id: athlete.id,
                name: athlete.displayName,
                position: athlete.position?.abbreviation,
                headshot: athlete.headshot?.href || '',
                team: athlete.team?.displayName,
                teamLogo: athlete.team?.logos?.[0]?.href || ''
              });
            }
          }
        }
      }
      
      return players.slice(0, limit);
    } catch (error) {
      console.error('Error getting trending players:', error);
      return [];
    }
  }
}

export const espnApiService = new ESPNApiService();