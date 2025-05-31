// ESPN Team/Player Matching Service
export class ESPNMatchingService {
  private teamCache = new Map();
  private playerCache = new Map();
  private teamNameMappings = new Map();
  
  constructor() {
    this.initializeTeamMappings();
  }

  // Initialize common team name variations for better matching
  private initializeTeamMappings() {
    const mappings = [
      // NBA Teams with common variations
      ['Los Angeles Lakers', ['Lakers', 'LA Lakers', 'L.A. Lakers']],
      ['Golden State Warriors', ['Warriors', 'GSW', 'Golden State']],
      ['Boston Celtics', ['Celtics', 'Boston']],
      ['Miami Heat', ['Heat', 'Miami']],
      ['Chicago Bulls', ['Bulls', 'Chicago']],
      ['New York Knicks', ['Knicks', 'NY Knicks', 'New York']],
      ['Brooklyn Nets', ['Nets', 'Brooklyn']],
      ['Philadelphia 76ers', ['76ers', 'Sixers', 'Philadelphia']],
      // NFL Teams
      ['New England Patriots', ['Patriots', 'NE Patriots', 'New England']],
      ['Dallas Cowboys', ['Cowboys', 'Dallas']],
      ['Green Bay Packers', ['Packers', 'Green Bay']],
      ['Pittsburgh Steelers', ['Steelers', 'Pittsburgh']],
      ['San Francisco 49ers', ['49ers', 'SF 49ers', 'San Francisco']],
      // Add more mappings as needed
    ];

    mappings.forEach(([canonical, variations]) => {
      this.teamNameMappings.set(canonical, canonical);
      variations.forEach(variation => {
        this.teamNameMappings.set(variation, canonical);
      });
    });
  }

  // Get ESPN teams and cache them
  async loadTeamData(sport: string = 'basketball') {
    try {
      const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${sport}/nba/teams`);
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }

      const data = await response.json();
      const teams = data.sports?.[0]?.leagues?.[0]?.teams || [];

      teams.forEach(teamData => {
        const team = teamData.team;
        if (team) {
          const teamInfo = {
            id: team.id,
            name: team.displayName,
            shortName: team.name,
            abbreviation: team.abbreviation,
            logoUrl: team.logos?.[0]?.href,
            colors: team.color ? [`#${team.color}`, `#${team.alternateColor}`] : []
          };

          // Cache by multiple keys for flexible matching
          this.teamCache.set(team.id, teamInfo);
          this.teamCache.set(team.displayName?.toLowerCase(), teamInfo);
          this.teamCache.set(team.name?.toLowerCase(), teamInfo);
          this.teamCache.set(team.abbreviation?.toLowerCase(), teamInfo);
        }
      });

      return teams.length;
    } catch (error) {
      console.error('Failed to load ESPN team data:', error);
      return 0;
    }
  }

  // Get team info by various identifiers
  getTeamInfo(identifier: string): any {
    if (!identifier) return null;

    // Try exact match first
    const exactMatch = this.teamCache.get(identifier.toLowerCase());
    if (exactMatch) return exactMatch;

    // Try mapped name
    const mappedName = this.teamNameMappings.get(identifier);
    if (mappedName) {
      return this.teamCache.get(mappedName.toLowerCase());
    }

    // Try partial matching
    const searchTerm = identifier.toLowerCase();
    for (const [key, team] of this.teamCache.entries()) {
      if (typeof key === 'string' && (
        key.includes(searchTerm) || 
        searchTerm.includes(key) ||
        team.name?.toLowerCase().includes(searchTerm) ||
        team.shortName?.toLowerCase().includes(searchTerm)
      )) {
        return team;
      }
    }

    return null;
  }

  // Get team logo URL
  getTeamLogo(teamName: string): string | null {
    const teamInfo = this.getTeamInfo(teamName);
    return teamInfo?.logoUrl || null;
  }

  // Load player roster for a team
  async loadPlayerRoster(teamId: string) {
    try {
      const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}/roster`);
      if (!response.ok) {
        throw new Error(`ESPN Roster API error: ${response.status}`);
      }

      const data = await response.json();
      const athletes = data.athletes || [];

      athletes.forEach(athleteGroup => {
        athleteGroup.items?.forEach(player => {
          const playerInfo = {
            id: player.id,
            name: player.displayName,
            firstName: player.firstName,
            lastName: player.lastName,
            position: player.position?.displayName,
            jersey: player.jersey,
            headshot: player.headshot?.href,
            teamId: teamId
          };

          // Cache by multiple keys
          this.playerCache.set(player.id, playerInfo);
          this.playerCache.set(player.displayName?.toLowerCase(), playerInfo);
          if (player.firstName && player.lastName) {
            this.playerCache.set(`${player.firstName} ${player.lastName}`.toLowerCase(), playerInfo);
          }
        });
      });

      return athletes.length;
    } catch (error) {
      console.error(`Failed to load roster for team ${teamId}:`, error);
      return 0;
    }
  }

  // Get player info by name
  getPlayerInfo(playerName: string): any {
    if (!playerName) return null;

    const searchKey = playerName.toLowerCase();
    return this.playerCache.get(searchKey) || null;
  }

  // Get player headshot URL
  getPlayerHeadshot(playerName: string): string | null {
    const playerInfo = this.getPlayerInfo(playerName);
    return playerInfo?.headshot || null;
  }

  // Smart text processing to find and replace team/player names with logos/headshots
  enrichTextWithAssets(text: string): string {
    let enrichedText = text;

    // Find team names and add logos
    for (const [key, teamInfo] of this.teamCache.entries()) {
      if (typeof key === 'string' && teamInfo.logoUrl) {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        if (enrichedText.match(regex)) {
          enrichedText = enrichedText.replace(regex, 
            `<span class="team-mention" data-logo="${teamInfo.logoUrl}">${teamInfo.name}</span>`
          );
        }
      }
    }

    // Find player names and add headshots
    for (const [key, playerInfo] of this.playerCache.entries()) {
      if (typeof key === 'string' && playerInfo.headshot) {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        if (enrichedText.match(regex)) {
          enrichedText = enrichedText.replace(regex,
            `<span class="player-mention" data-headshot="${playerInfo.headshot}">${playerInfo.name}</span>`
          );
        }
      }
    }

    return enrichedText;
  }

  // Get comprehensive team data for bracket display
  getTeamForBracket(teamName: string) {
    const teamInfo = this.getTeamInfo(teamName);
    if (!teamInfo) return null;

    return {
      name: teamInfo.name,
      logo: teamInfo.logoUrl,
      colors: teamInfo.colors,
      abbreviation: teamInfo.abbreviation
    };
  }

  // Initialize the service with common teams
  async initialize() {
    console.log('Initializing ESPN Matching Service...');
    
    // Load NBA teams
    const nbaTeamsLoaded = await this.loadTeamData('basketball');
    console.log(`Loaded ${nbaTeamsLoaded} NBA teams`);

    // Load rosters for popular teams (you can expand this list)
    const popularTeams = ['1610612747', '1610612738', '1610612744']; // Lakers, Celtics, Warriors
    for (const teamId of popularTeams) {
      await this.loadPlayerRoster(teamId);
    }

    console.log('ESPN Matching Service initialized');
  }
}

export const espnMatchingService = new ESPNMatchingService();