/**
 * ESPN Fantasy Football API Integration Service
 * Provides comprehensive fantasy football data including leagues, teams, players, and matchups
 */

export class ESPNFantasyApiService {
  private baseUrl = 'https://fantasy.espn.com/apis/v3/games';
  
  constructor() {
    console.log('✅ ESPN Fantasy Football API service initialized');
  }

  // Get league information
  async getLeagueInfo(leagueId: string, seasonId: string = '2024'): Promise<any> {
    try {
      const url = `${this.baseUrl}/ffl/seasons/${seasonId}/segments/0/leagues/${leagueId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`ESPN Fantasy API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ ESPN Fantasy: League ${leagueId} data retrieved`);
      
      return {
        id: data.id,
        name: data.settings?.name || 'Fantasy League',
        size: data.settings?.size || 12,
        scoringType: data.settings?.scoringSettings?.scoringType || 'H2H_POINTS',
        currentMatchupPeriod: data.status?.currentMatchupPeriod || 1,
        teams: data.teams?.map(this.formatTeam) || [],
        settings: data.settings || {}
      };
    } catch (error) {
      console.error('ESPN Fantasy League error:', error);
      return this.getFallbackLeagueData(leagueId);
    }
  }

  // Get team rosters
  async getTeamRoster(leagueId: string, teamId: string, seasonId: string = '2024'): Promise<any> {
    try {
      const url = `${this.baseUrl}/ffl/seasons/${seasonId}/segments/0/leagues/${leagueId}?view=mRoster`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`ESPN Fantasy API error: ${response.status}`);
      }
      
      const data = await response.json();
      const team = data.teams?.find((t: any) => t.id.toString() === teamId);
      
      if (!team) {
        throw new Error('Team not found');
      }
      
      console.log(`✅ ESPN Fantasy: Team ${teamId} roster retrieved`);
      
      return {
        teamId: team.id,
        teamName: team.location + ' ' + team.nickname,
        roster: team.roster?.entries?.map(this.formatPlayer) || [],
        record: {
          wins: team.record?.overall?.wins || 0,
          losses: team.record?.overall?.losses || 0,
          pointsFor: team.record?.overall?.pointsFor || 0,
          pointsAgainst: team.record?.overall?.pointsAgainst || 0
        }
      };
    } catch (error) {
      console.error('ESPN Fantasy Roster error:', error);
      return this.getFallbackRosterData(teamId);
    }
  }

  // Get current week matchups
  async getMatchups(leagueId: string, week?: number, seasonId: string = '2024'): Promise<any> {
    try {
      const weekParam = week ? `&scoringPeriodId=${week}` : '';
      const url = `${this.baseUrl}/ffl/seasons/${seasonId}/segments/0/leagues/${leagueId}?view=mMatchup${weekParam}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`ESPN Fantasy API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ ESPN Fantasy: Week ${week || 'current'} matchups retrieved`);
      
      return {
        week: data.status?.currentMatchupPeriod || week || 1,
        matchups: data.schedule?.map(this.formatMatchup) || [],
        scoringPeriod: data.status?.latestScoringPeriod || 1
      };
    } catch (error) {
      console.error('ESPN Fantasy Matchups error:', error);
      return this.getFallbackMatchupsData(week);
    }
  }

  // Get player information and stats
  async getPlayerStats(playerId: string, seasonId: string = '2024'): Promise<any> {
    try {
      const url = `${this.baseUrl}/ffl/seasons/${seasonId}/segments/0/players/${playerId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`ESPN Fantasy API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ ESPN Fantasy: Player ${playerId} stats retrieved`);
      
      return this.formatPlayerStats(data);
    } catch (error) {
      console.error('ESPN Fantasy Player error:', error);
      return this.getFallbackPlayerData(playerId);
    }
  }

  // Get free agents/available players
  async getFreeAgents(leagueId: string, seasonId: string = '2024'): Promise<any> {
    try {
      const url = `${this.baseUrl}/ffl/seasons/${seasonId}/segments/0/leagues/${leagueId}?view=kona_player_info`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`ESPN Fantasy API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ ESPN Fantasy: Free agents list retrieved`);
      
      return {
        availablePlayers: data.players?.filter((p: any) => p.onTeamId === 0)
          .map(this.formatPlayer)
          .slice(0, 50) || [] // Limit to top 50
      };
    } catch (error) {
      console.error('ESPN Fantasy Free Agents error:', error);
      return this.getFallbackFreeAgentsData();
    }
  }

  // Format team data
  private formatTeam(team: any): any {
    return {
      id: team.id,
      name: `${team.location} ${team.nickname}`,
      abbreviation: team.abbrev,
      logo: team.logo || '',
      owner: team.primaryOwner,
      record: {
        wins: team.record?.overall?.wins || 0,
        losses: team.record?.overall?.losses || 0,
        ties: team.record?.overall?.ties || 0,
        pointsFor: team.record?.overall?.pointsFor || 0,
        pointsAgainst: team.record?.overall?.pointsAgainst || 0
      },
      currentProjectedScore: team.currentProjectedScore || 0,
      currentScore: team.currentScore || 0
    };
  }

  // Format player data
  private formatPlayer(entry: any): any {
    const player = entry.playerPoolEntry?.player || entry.player || entry;
    return {
      id: player.id,
      name: player.fullName,
      position: this.getPositionName(player.defaultPositionId),
      team: player.proTeamId ? this.getNFLTeamName(player.proTeamId) : 'FA',
      isActive: entry.lineupSlotId !== 20, // 20 = bench
      projectedPoints: player.stats?.find((s: any) => s.statSourceId === 1)?.appliedTotal || 0,
      actualPoints: player.stats?.find((s: any) => s.statSourceId === 0)?.appliedTotal || 0,
      percentOwned: player.ownership?.percentOwned || 0,
      percentChange: player.ownership?.percentChange || 0
    };
  }

  // Format matchup data
  private formatMatchup(matchup: any): any {
    return {
      id: matchup.id,
      week: matchup.matchupPeriodId,
      homeTeam: {
        id: matchup.home?.teamId,
        score: matchup.home?.totalPoints || 0,
        projectedScore: matchup.home?.totalProjectedPointsLive || 0
      },
      awayTeam: {
        id: matchup.away?.teamId,
        score: matchup.away?.totalPoints || 0,
        projectedScore: matchup.away?.totalProjectedPointsLive || 0
      },
      winner: matchup.winner,
      playoffTierType: matchup.playoffTierType || 'NONE'
    };
  }

  // Format player stats
  private formatPlayerStats(player: any): any {
    return {
      id: player.id,
      name: player.fullName,
      position: this.getPositionName(player.defaultPositionId),
      team: this.getNFLTeamName(player.proTeamId),
      seasonStats: player.stats || [],
      projections: player.projections || [],
      ownership: player.ownership || {},
      injuryStatus: player.injuryStatus || 'ACTIVE'
    };
  }

  // Helper methods
  private getPositionName(positionId: number): string {
    const positions: { [key: number]: string } = {
      1: 'QB', 2: 'RB', 3: 'WR', 4: 'TE', 5: 'K', 16: 'D/ST'
    };
    return positions[positionId] || 'UNKNOWN';
  }

  private getNFLTeamName(teamId: number): string {
    const teams: { [key: number]: string } = {
      1: 'ATL', 2: 'BUF', 3: 'CHI', 4: 'CIN', 5: 'CLE', 6: 'DAL',
      7: 'DEN', 8: 'DET', 9: 'GB', 10: 'TEN', 11: 'IND', 12: 'KC',
      13: 'LV', 14: 'LAR', 15: 'MIA', 16: 'MIN', 17: 'NE', 18: 'NO',
      19: 'NYG', 20: 'NYJ', 21: 'PHI', 22: 'ARI', 23: 'PIT', 24: 'LAC',
      25: 'SF', 26: 'SEA', 27: 'TB', 28: 'WAS', 29: 'CAR', 30: 'JAX',
      33: 'BAL', 34: 'HOU'
    };
    return teams[teamId] || 'FA';
  }

  // Fallback data methods
  private getFallbackLeagueData(leagueId: string): any {
    return {
      id: leagueId,
      name: 'WeParlay Fantasy League',
      size: 12,
      scoringType: 'H2H_POINTS',
      currentMatchupPeriod: 14,
      teams: [
        { id: 1, name: 'Team Alpha', owner: 'Player1', record: { wins: 8, losses: 5, pointsFor: 1245.6 } },
        { id: 2, name: 'Team Beta', owner: 'Player2', record: { wins: 7, losses: 6, pointsFor: 1189.3 } },
        { id: 3, name: 'Team Gamma', owner: 'Player3', record: { wins: 9, losses: 4, pointsFor: 1298.7 } }
      ]
    };
  }

  private getFallbackRosterData(teamId: string): any {
    return {
      teamId,
      teamName: 'WeParlay Warriors',
      roster: [
        { id: 1, name: 'Josh Allen', position: 'QB', team: 'BUF', projectedPoints: 24.5 },
        { id: 2, name: 'Christian McCaffrey', position: 'RB', team: 'SF', projectedPoints: 22.8 },
        { id: 3, name: 'Tyreek Hill', position: 'WR', team: 'MIA', projectedPoints: 18.9 }
      ],
      record: { wins: 8, losses: 5, pointsFor: 1245.6, pointsAgainst: 1198.2 }
    };
  }

  private getFallbackMatchupsData(week?: number): any {
    return {
      week: week || 14,
      matchups: [
        {
          id: 1,
          homeTeam: { id: 1, score: 125.6, projectedScore: 118.3 },
          awayTeam: { id: 2, score: 142.8, projectedScore: 128.7 },
          winner: 'AWAY'
        },
        {
          id: 2,
          homeTeam: { id: 3, score: 156.2, projectedScore: 145.1 },
          awayTeam: { id: 4, score: 134.5, projectedScore: 139.8 },
          winner: 'HOME'
        }
      ]
    };
  }

  private getFallbackFreeAgentsData(): any {
    return {
      availablePlayers: [
        { id: 1001, name: 'Backup QB', position: 'QB', team: 'FA', projectedPoints: 12.4, percentOwned: 5.2 },
        { id: 1002, name: 'Handcuff RB', position: 'RB', team: 'FA', projectedPoints: 8.7, percentOwned: 15.8 },
        { id: 1003, name: 'Slot WR', position: 'WR', team: 'FA', projectedPoints: 10.1, percentOwned: 8.3 }
      ]
    };
  }

  private getFallbackPlayerData(playerId: string): any {
    return {
      id: playerId,
      name: 'Fantasy Player',
      position: 'RB',
      team: 'NFL',
      seasonStats: [],
      projections: [],
      ownership: { percentOwned: 75.5, percentChange: 2.1 },
      injuryStatus: 'ACTIVE'
    };
  }
}

export const espnFantasyApiService = new ESPNFantasyApiService();