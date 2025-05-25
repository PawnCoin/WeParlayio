// Leaguepedia API Integration for WeParlay Gaming
// Uses the official Leaguepedia API for comprehensive League of Legends esports data

import axios from 'axios';
import NodeCache from 'node-cache';

// Cache for 2 minutes for esports data
const cache = new NodeCache({ stdTTL: 120 });

export interface LeaguepediaMatch {
  tournament: string;
  team1: string;
  team2: string;
  winner: string;
  date: string;
  patch: string;
  gameLength: string;
  team1Score: number;
  team2Score: number;
}

export interface LeaguepediaPlayer {
  name: string;
  realName: string;
  team: string;
  role: string;
  country: string;
  birthDate: string;
  earnings: number;
}

export interface LeaguepediaTournament {
  name: string;
  region: string;
  startDate: string;
  endDate: string;
  prizePool: string;
  status: string;
  teams: number;
}

export class LeaguepediaAPI {
  private baseUrl = 'https://lol.fandom.com/api.php';
  private userAgent = 'WeParlay Gaming Platform (contact@weparlay.io)';

  private async makeRequest(params: any): Promise<any> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          ...params,
          format: 'json',
          formatversion: '2'
        },
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('Leaguepedia API error:', error);
      throw error;
    }
  }

  async getRecentMatches(limit: number = 50): Promise<LeaguepediaMatch[]> {
    const cacheKey = `leaguepedia-matches-${limit}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) as LeaguepediaMatch[];
    }

    try {
      const params = {
        action: 'cargoquery',
        tables: 'ScoreboardGames=SG, ScoreboardPlayers=SP, Tournaments=T',
        join_on: 'SG.UniqueGame=SP.UniqueGame, SG.Tournament=T.OverviewPage',
        fields: 'SG.Tournament, SG.Team1, SG.Team2, SG.Winner, SG.DateTime_UTC, SG.Patch, SG.Gamelength, T.Name',
        where: 'SG.DateTime_UTC IS NOT NULL',
        order_by: 'SG.DateTime_UTC DESC',
        limit: limit.toString()
      };

      const data = await this.makeRequest(params);
      
      const matches: LeaguepediaMatch[] = [];
      if (data.cargoquery) {
        for (const item of data.cargoquery) {
          const title = item.title;
          matches.push({
            tournament: title.Name || title.Tournament,
            team1: title.Team1,
            team2: title.Team2,
            winner: title.Winner,
            date: title['DateTime UTC'],
            patch: title.Patch,
            gameLength: title.Gamelength,
            team1Score: title.Team1 === title.Winner ? 1 : 0,
            team2Score: title.Team2 === title.Winner ? 1 : 0
          });
        }
      }

      cache.set(cacheKey, matches);
      return matches;
    } catch (error) {
      console.error('Error fetching recent matches:', error);
      return [];
    }
  }

  async getPlayerStats(playerName: string): Promise<LeaguepediaPlayer | null> {
    const cacheKey = `leaguepedia-player-${playerName}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) as LeaguepediaPlayer;
    }

    try {
      const params = {
        action: 'cargoquery',
        tables: 'Players',
        fields: 'ID, Name, RealName, Team, Role, Country, Birthdate, Earnings',
        where: `ID="${playerName}" OR Name="${playerName}"`,
        limit: '1'
      };

      const data = await this.makeRequest(params);
      
      if (data.cargoquery && data.cargoquery.length > 0) {
        const player = data.cargoquery[0].title;
        const playerData: LeaguepediaPlayer = {
          name: player.Name || player.ID,
          realName: player.RealName || 'Unknown',
          team: player.Team || 'Free Agent',
          role: player.Role || 'Unknown',
          country: player.Country || 'Unknown',
          birthDate: player.Birthdate || 'Unknown',
          earnings: parseFloat(player.Earnings) || 0
        };

        cache.set(cacheKey, playerData);
        return playerData;
      }

      return null;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  }

  async getTournaments(region?: string): Promise<LeaguepediaTournament[]> {
    const cacheKey = `leaguepedia-tournaments-${region || 'all'}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) as LeaguepediaTournament[];
    }

    try {
      const params = {
        action: 'cargoquery',
        tables: 'Tournaments',
        fields: 'Name, Region, DateStart, Date, PrizePool, IsQualifier, TeamNumber',
        where: region ? `Region="${region}"` : 'DateStart IS NOT NULL',
        order_by: 'DateStart DESC',
        limit: '100'
      };

      const data = await this.makeRequest(params);
      
      const tournaments: LeaguepediaTournament[] = [];
      if (data.cargoquery) {
        for (const item of data.cargoquery) {
          const tournament = item.title;
          tournaments.push({
            name: tournament.Name,
            region: tournament.Region || 'International',
            startDate: tournament.DateStart,
            endDate: tournament.Date,
            prizePool: tournament.PrizePool || 'TBD',
            status: this.getTournamentStatus(tournament.DateStart, tournament.Date),
            teams: parseInt(tournament.TeamNumber) || 0
          });
        }
      }

      cache.set(cacheKey, tournaments);
      return tournaments;
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      return [];
    }
  }

  async getTeamStats(teamName: string): Promise<any> {
    const cacheKey = `leaguepedia-team-${teamName}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    try {
      const params = {
        action: 'cargoquery',
        tables: 'Teams',
        fields: 'Name, Short, Region, TeamLocation, Website, Twitter, Earnings',
        where: `Name="${teamName}" OR Short="${teamName}"`,
        limit: '1'
      };

      const data = await this.makeRequest(params);
      
      if (data.cargoquery && data.cargoquery.length > 0) {
        const team = data.cargoquery[0].title;
        const teamData = {
          name: team.Name,
          shortName: team.Short,
          region: team.Region,
          location: team.TeamLocation,
          website: team.Website,
          twitter: team.Twitter,
          earnings: parseFloat(team.Earnings) || 0
        };

        cache.set(cacheKey, teamData);
        return teamData;
      }

      return null;
    } catch (error) {
      console.error('Error fetching team stats:', error);
      return null;
    }
  }

  async getLiveMatches(): Promise<LeaguepediaMatch[]> {
    const cacheKey = 'leaguepedia-live-matches';
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) as LeaguepediaMatch[];
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const params = {
        action: 'cargoquery',
        tables: 'ScoreboardGames=SG, Tournaments=T',
        join_on: 'SG.Tournament=T.OverviewPage',
        fields: 'SG.Tournament, SG.Team1, SG.Team2, SG.DateTime_UTC, SG.Patch, T.Name',
        where: `SG.DateTime_UTC LIKE "${today}%" AND SG.Winner IS NULL`,
        order_by: 'SG.DateTime_UTC ASC',
        limit: '20'
      };

      const data = await this.makeRequest(params);
      
      const matches: LeaguepediaMatch[] = [];
      if (data.cargoquery) {
        for (const item of data.cargoquery) {
          const title = item.title;
          matches.push({
            tournament: title.Name || title.Tournament,
            team1: title.Team1,
            team2: title.Team2,
            winner: 'TBD',
            date: title['DateTime UTC'],
            patch: title.Patch,
            gameLength: 'Live',
            team1Score: 0,
            team2Score: 0
          });
        }
      }

      cache.set(cacheKey, matches);
      return matches;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      return [];
    }
  }

  async getMatchPredictions(team1: string, team2: string): Promise<any> {
    try {
      // Get recent performance of both teams
      const team1Matches = await this.getTeamRecentMatches(team1, 10);
      const team2Matches = await this.getTeamRecentMatches(team2, 10);
      
      const team1WinRate = this.calculateWinRate(team1Matches, team1);
      const team2WinRate = this.calculateWinRate(team2Matches, team2);
      
      return {
        team1: {
          name: team1,
          winRate: team1WinRate,
          recentForm: team1Matches.slice(0, 5).map(m => m.winner === team1 ? 'W' : 'L').join('')
        },
        team2: {
          name: team2,
          winRate: team2WinRate,
          recentForm: team2Matches.slice(0, 5).map(m => m.winner === team2 ? 'W' : 'L').join('')
        },
        prediction: team1WinRate > team2WinRate ? team1 : team2,
        confidence: Math.abs(team1WinRate - team2WinRate),
        recommendedBets: [
          `Match winner: ${team1WinRate > team2WinRate ? team1 : team2}`,
          `Total maps over/under 2.5`,
          `First blood prediction`
        ]
      };
    } catch (error) {
      console.error('Error generating match predictions:', error);
      return null;
    }
  }

  private async getTeamRecentMatches(teamName: string, limit: number): Promise<LeaguepediaMatch[]> {
    try {
      const params = {
        action: 'cargoquery',
        tables: 'ScoreboardGames',
        fields: 'Tournament, Team1, Team2, Winner, DateTime_UTC, Patch, Gamelength',
        where: `(Team1="${teamName}" OR Team2="${teamName}") AND Winner IS NOT NULL`,
        order_by: 'DateTime_UTC DESC',
        limit: limit.toString()
      };

      const data = await this.makeRequest(params);
      const matches: LeaguepediaMatch[] = [];
      
      if (data.cargoquery) {
        for (const item of data.cargoquery) {
          const title = item.title;
          matches.push({
            tournament: title.Tournament,
            team1: title.Team1,
            team2: title.Team2,
            winner: title.Winner,
            date: title['DateTime UTC'],
            patch: title.Patch,
            gameLength: title.Gamelength,
            team1Score: title.Team1 === title.Winner ? 1 : 0,
            team2Score: title.Team2 === title.Winner ? 1 : 0
          });
        }
      }

      return matches;
    } catch (error) {
      console.error('Error fetching team recent matches:', error);
      return [];
    }
  }

  private calculateWinRate(matches: LeaguepediaMatch[], teamName: string): number {
    if (matches.length === 0) return 0.5;
    
    const wins = matches.filter(match => match.winner === teamName).length;
    return wins / matches.length;
  }

  private getTournamentStatus(startDate: string, endDate: string): string {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (now < start) return 'upcoming';
    if (end && now > end) return 'completed';
    return 'ongoing';
  }
}

export const leaguepediaAPI = new LeaguepediaAPI();