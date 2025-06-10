/**
 * ESPN API Service for Team Logos and Player Headshots
 * Provides authentic team branding and player images for WeParlay
 * Now supports ALL ESPN sports!
 */

export class ESPNApiService {
  private baseUrl = 'https://site.api.espn.com/apis/site/v2';
  
  // Complete mapping of all ESPN sports
  private sportMappings = {
    // Major US Sports
    'nfl': 'football/nfl',
    'nba': 'basketball/nba',
    'mlb': 'baseball/mlb',
    'nhl': 'hockey/nhl',
    'wnba': 'basketball/wnba',
    'mls': 'soccer/usa.1',
    
    // College Sports
    'ncaaf': 'football/college-football',
    'ncaab': 'basketball/mens-college-basketball',
    'ncaaw': 'basketball/womens-college-basketball',
    'college-baseball': 'baseball/college-baseball',
    'college-softball': 'softball/college-softball',
    'college-hockey': 'hockey/mens-college-hockey',
    
    // International Soccer
    'premier-league': 'soccer/eng.1',
    'champions-league': 'soccer/uefa.champions',
    'europa-league': 'soccer/uefa.europa',
    'la-liga': 'soccer/esp.1',
    'serie-a': 'soccer/ita.1',
    'bundesliga': 'soccer/ger.1',
    'ligue-1': 'soccer/fra.1',
    'world-cup': 'soccer/fifa.world',
    'euros': 'soccer/uefa.euro',
    
    // Other Sports
    'tennis-atp': 'tennis/atp',
    'tennis-wta': 'tennis/wta',
    'golf-pga': 'golf/pga',
    'golf-lpga': 'golf/lpga',
    'nascar-cup': 'racing/nascar.cup',
    'formula1': 'racing/f1',
    'boxing': 'boxing',
    'mma': 'mma',
    'ufc': 'mma/ufc',
    
    // Olympics & International
    'olympics-summer': 'olympics/summer',
    'olympics-winter': 'olympics/winter',
    
    // Esports (limited ESPN coverage)
    'esports-lol': 'esports/league-of-legends',
    'esports-overwatch': 'esports/overwatch'
  };

  /**
   * Get teams for ANY sport supported by ESPN
   */
  async getTeamsForSport(sportKey: string): Promise<any[]> {
    try {
      const espnPath = this.sportMappings[sportKey.toLowerCase()];
      if (!espnPath) {
        console.warn(`Sport '${sportKey}' not found in ESPN mappings`);
        return [];
      }

      const response = await fetch(`${this.baseUrl}/sports/${espnPath}/teams`);
      const data = await response.json();
      
      // Handle different ESPN API response structures
      const teams = this.extractTeamsFromResponse(data, sportKey);
      
      console.log(`✅ ESPN: Found ${teams.length} teams for ${sportKey.toUpperCase()}`);
      return teams;
    } catch (error) {
      console.error(`ESPN API error for ${sportKey}:`, error);
      return [];
    }
  }

  /**
   * Extract teams from various ESPN response formats
   */
  private extractTeamsFromResponse(data: any, sportKey: string): any[] {
    try {
      // Standard team structure
      if (data.sports?.[0]?.leagues?.[0]?.teams) {
        return data.sports[0].leagues[0].teams.map((team: any) => ({
          id: team.team.id,
          name: team.team.displayName,
          abbreviation: team.team.abbreviation,
          color: team.team.color,
          alternateColor: team.team.alternateColor,
          logo: team.team.logos?.[0]?.href || '',
          darkLogo: team.team.logos?.find((logo: any) => logo.rel?.includes('dark'))?.href || team.team.logos?.[0]?.href,
          location: team.team.location,
          nickname: team.team.nickname,
          sport: sportKey
        }));
      }
      
      // Alternative structure for some sports
      if (data.teams) {
        return data.teams.map((team: any) => ({
          id: team.id,
          name: team.displayName || team.name,
          abbreviation: team.abbreviation,
          logo: team.logos?.[0]?.href || team.logo || '',
          sport: sportKey
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error extracting teams for ${sportKey}:`, error);
      return [];
    }
  }

  /**
   * Get ALL teams from ALL supported sports
   */
  async getAllSportsTeams(): Promise<{ [sport: string]: any[] }> {
    const allTeams: { [sport: string]: any[] } = {};
    const sportKeys = Object.keys(this.sportMappings);
    
    console.log(`🚀 Fetching teams for ${sportKeys.length} sports from ESPN...`);
    
    // Batch requests with rate limiting
    const batchSize = 5;
    for (let i = 0; i < sportKeys.length; i += batchSize) {
      const batch = sportKeys.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (sportKey) => {
        const teams = await this.getTeamsForSport(sportKey);
        return { sportKey, teams };
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ sportKey, teams }) => {
        if (teams.length > 0) {
          allTeams[sportKey] = teams;
        }
      });
      
      // Rate limiting - wait 200ms between batches
      if (i + batchSize < sportKeys.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    const totalTeams = Object.values(allTeams).reduce((sum, teams) => sum + teams.length, 0);
    console.log(`✅ ESPN: Successfully fetched ${totalTeams} teams across ${Object.keys(allTeams).length} sports`);
    
    return allTeams;
  }

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
   * Get live events across all sports
   */
  async getLiveEvents(): Promise<any[]> {
    try {
      const sports = ['nfl', 'nba', 'mlb', 'nhl'];
      const allEvents = [];

      for (const sport of sports) {
        try {
          const sportPath = this.sportMappings[sport];
          if (!sportPath) continue;

          const response = await fetch(`${this.baseUrl}/sports/${sportPath}/scoreboard`);
          const data = await response.json();
          
          if (data.events && data.events.length > 0) {
            const events = data.events.map((event: any) => ({
              id: event.id,
              sport: sport,
              name: event.name,
              shortName: event.shortName,
              status: event.status?.type?.name || 'scheduled',
              startTime: event.date,
              competitors: event.competitions?.[0]?.competitors?.map((comp: any) => ({
                id: comp.id,
                name: comp.team?.displayName || comp.team?.name,
                abbreviation: comp.team?.abbreviation,
                logo: comp.team?.logo,
                score: comp.score || '0',
                homeAway: comp.homeAway
              })) || [],
              venue: event.competitions?.[0]?.venue?.fullName,
              broadcast: event.competitions?.[0]?.broadcasts?.[0]?.names?.[0]
            }));
            allEvents.push(...events);
          }
        } catch (sportError) {
          console.error(`Error fetching ${sport} events:`, sportError);
        }
      }

      return allEvents;
    } catch (error) {
      console.error('ESPN Live Events API error:', error);
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
   * Get roster for ANY sport team
   */
  async getRosterForAnySport(sportKey: string, teamId: string): Promise<any[]> {
    try {
      const espnPath = this.sportMappings[sportKey.toLowerCase()];
      if (!espnPath) {
        console.warn(`Sport '${sportKey}' not supported for roster data`);
        return [];
      }

      const response = await fetch(`${this.baseUrl}/sports/${espnPath}/teams/${teamId}/roster`);
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
        experience: athlete.experience?.years,
        sport: sportKey,
        teamId: teamId
      })) || [];
    } catch (error) {
      console.error(`Error getting roster for ${sportKey}/${teamId}:`, error);
      return [];
    }
  }

  /**
   * Get trending players with headshots for ANY sport
   */
  async getTrendingPlayers(sport: string, limit: number = 10): Promise<any[]> {
    try {
      const espnPath = this.getSportPath(sport);
      const response = await fetch(`${this.baseUrl}/sports/${espnPath}/news`);
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
                teamLogo: athlete.team?.logos?.[0]?.href || '',
                sport: sport
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

  /**
   * Get live scores and data for ANY sport
   */
  async getLiveScoresForSport(sportKey: string): Promise<any[]> {
    try {
      const espnPath = this.sportMappings[sportKey.toLowerCase()];
      if (!espnPath) return [];

      const response = await fetch(`${this.baseUrl}/sports/${espnPath}/scoreboard`);
      const data = await response.json();
      
      return data.events?.map((event: any) => ({
        id: event.id,
        name: event.name,
        shortName: event.shortName,
        date: event.date,
        status: event.status?.type?.description,
        competitors: event.competitions?.[0]?.competitors?.map((comp: any) => ({
          id: comp.team?.id,
          name: comp.team?.displayName,
          abbreviation: comp.team?.abbreviation,
          logo: comp.team?.logos?.[0]?.href,
          score: comp.score,
          record: comp.records?.[0]?.summary
        })),
        sport: sportKey
      })) || [];
    } catch (error) {
      console.error(`Error getting live scores for ${sportKey}:`, error);
      return [];
    }
  }

  /**
   * Get comprehensive sport statistics
   */
  async getSportStatistics(): Promise<any> {
    const stats = {
      totalSports: Object.keys(this.sportMappings).length,
      supportedSports: Object.keys(this.sportMappings),
      categories: {
        'major-us': ['nfl', 'nba', 'mlb', 'nhl', 'wnba', 'mls'],
        'college': ['ncaaf', 'ncaab', 'ncaaw', 'college-baseball', 'college-softball'],
        'international-soccer': ['premier-league', 'champions-league', 'la-liga', 'serie-a', 'bundesliga'],
        'motorsports': ['nascar-cup', 'formula1'],
        'combat': ['boxing', 'mma', 'ufc'],
        'individual': ['tennis-atp', 'tennis-wta', 'golf-pga', 'golf-lpga']
      }
    };
    
    return stats;
  }

  /**
   * Search for teams across ALL sports
   */
  async searchTeamsAcrossAllSports(query: string): Promise<any[]> {
    const allTeams = await this.getAllSportsTeams();
    const results: any[] = [];
    
    Object.entries(allTeams).forEach(([sport, teams]) => {
      const matchingTeams = teams.filter(team => 
        team.name.toLowerCase().includes(query.toLowerCase()) ||
        team.abbreviation?.toLowerCase().includes(query.toLowerCase()) ||
        team.location?.toLowerCase().includes(query.toLowerCase()) ||
        team.nickname?.toLowerCase().includes(query.toLowerCase())
      );
      
      results.push(...matchingTeams);
    });
    
    return results;
  }
}

export const espnApiService = new ESPNApiService();