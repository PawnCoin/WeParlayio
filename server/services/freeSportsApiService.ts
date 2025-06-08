export class FreeSportsApiService {
  private lastRequest: number = 0;
  private minInterval: number = 1000; // 1 second between requests

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;

    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequest = Date.now();
  }

  async getNFLOdds(): Promise<any[]> {
    await this.rateLimit();

    try {
      const response = await fetch('http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
      if (!response.ok) throw new Error(`ESPN API error: ${response.status}`);

      const data = await response.json();
      return this.formatESPNData(data, 'NFL');
    } catch (error) {
      console.warn('ESPN NFL API failed:', error);
      return [];
    }
  }

  async getNBAOdds(): Promise<any[]> {
    await this.rateLimit();

    try {
      const response = await fetch('http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      if (!response.ok) throw new Error(`ESPN NBA API error: ${response.status}`);

      const data = await response.json();
      return this.formatESPNData(data, 'NBA');
    } catch (error) {
      console.warn('ESPN NBA API failed:', error);
      return [];
    }
  }

  async getMLBOdds(): Promise<any[]> {
    await this.rateLimit();

    try {
      const response = await fetch('http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard');
      if (!response.ok) throw new Error(`ESPN MLB API error: ${response.status}`);

      const data = await response.json();
      return this.formatESPNData(data, 'MLB');
    } catch (error) {
      console.warn('ESPN MLB API failed:', error);
      return [];
    }
  }

  async getNHLOdds(): Promise<any[]> {
    await this.rateLimit();

    try {
      const response = await fetch('http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard');
      if (!response.ok) throw new Error(`ESPN NHL API error: ${response.status}`);

      const data = await response.json();
      return this.formatESPNData(data, 'NHL');
    } catch (error) {
      console.warn('ESPN NHL API failed:', error);
      return [];
    }
  }

  async getSoccerOdds(): Promise<any[]> {
    await this.rateLimit();

    try {
      const response = await fetch('http://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard');
      if (!response.ok) throw new Error(`ESPN Soccer API error: ${response.status}`);

      const data = await response.json();
      return this.formatESPNData(data, 'Soccer');
    } catch (error) {
      console.warn('ESPN Soccer API failed:', error);
      return [];
    }
  }

  async getWNBAOdds(): Promise<any[]> {
    await this.rateLimit();

    try {
      const response = await fetch('http://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard');
      if (!response.ok) throw new Error(`ESPN WNBA API error: ${response.status}`);

      const data = await response.json();
      return this.formatESPNData(data, 'WNBA');
    } catch (error) {
      console.warn('ESPN WNBA API failed:', error);
      return [];
    }
  }

  async getTennisOdds(): Promise<any[]> {
    await this.rateLimit();

    try {
      const response = await fetch('http://site.api.espn.com/apis/site/v2/sports/tennis/scoreboard');
      if (!response.ok) throw new Error(`ESPN Tennis API error: ${response.status}`);

      const data = await response.json();
      return this.formatTennisData(data);
    } catch (error) {
      console.warn('ESPN Tennis API failed:', error);
      return [];
    }
  }

  async getGolfOdds(): Promise<any[]> {
    await this.rateLimit();

    try {
      const response = await fetch('http://site.api.espn.com/apis/site/v2/sports/golf/scoreboard');
      if (!response.ok) throw new Error(`ESPN Golf API error: ${response.status}`);

      const data = await response.json();
      return this.formatGolfData(data);
    } catch (error) {
      console.warn('ESPN Golf API failed:', error);
      return [];
    }
  }

  private formatESPNData(data: any, sport: string): any[] {
    if (!data?.events) return [];

    return data.events.map((event: any) => ({
      id: event.id,
      sport,
      homeTeam: {
        name: event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'home')?.team?.displayName || 'Unknown',
        logo: event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'home')?.team?.logos?.[0]?.href,
        score: event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'home')?.score || 0
      },
      awayTeam: {
        name: event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'away')?.team?.displayName || 'Unknown',
        logo: event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'away')?.team?.logos?.[0]?.href,
        score: event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'away')?.score || 0
      },
      startTime: event.date,
      status: event.status?.type?.description || 'Scheduled',
      odds: {
        homeWin: 1.95,
        awayWin: 1.95,
        draw: sport === 'Soccer' ? 3.25 : undefined
      }
    }));
  }

  private formatFootballData(data: any): any[] {
    if (!data?.events) return [];

    return data.events.map((event: any) => ({
      id: event.id,
      sport: 'NFL',
      homeTeam: {
        name: event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'home')?.team?.displayName || 'Unknown',
        logo: event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'home')?.team?.logos?.[0]?.href,
        score: event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'home')?.score || 0
      },
      awayTeam: {
        name: event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'away')?.team?.displayName || 'Unknown',
        logo: event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'away')?.team?.logos?.[0]?.href,
        score: event.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === 'away')?.score || 0
      },
      startTime: event.date,
      status: event.status?.type?.description || 'Scheduled'
    }));
  }

  private formatTennisData(data: any): any[] {
    if (!data?.events) return [];

    return data.events.map((event: any) => ({
      id: event.id,
      sport: 'Tennis',
      player1: {
        name: event.competitions?.[0]?.competitors?.[0]?.athlete?.displayName || 'Unknown',
        score: event.competitions?.[0]?.competitors?.[0]?.score || 0
      },
      player2: {
        name: event.competitions?.[0]?.competitors?.[1]?.athlete?.displayName || 'Unknown',
        score: event.competitions?.[0]?.competitors?.[1]?.score || 0
      },
      startTime: event.date,
      status: event.status?.type?.description || 'Scheduled'
    }));
  }

  private formatGolfData(data: any): any[] {
    if (!data?.events) return [];

    return data.events.map((event: any) => ({
      id: event.id,
      sport: 'Golf',
      tournament: event.name,
      leaderboard: event.competitions?.[0]?.competitors?.slice(0, 10).map((player: any) => ({
        name: player.athlete?.displayName || 'Unknown',
        score: player.score || 'E',
        position: player.statistics?.find((s: any) => s.name === 'position')?.displayValue || 'T1'
      })) || [],
      startTime: event.date,
      status: event.status?.type?.description || 'Scheduled'
    }));
  }

  private formatRapidApiTennis(tennisData: any[]): any[] {
    return tennisData.map((match: any) => ({
      id: match.id || Math.random().toString(36),
      sport: 'Tennis',
      player1: {
        name: match.player1?.name || 'Unknown',
        ranking: match.player1?.ranking || null
      },
      player2: {
        name: match.player2?.name || 'Unknown',
        ranking: match.player2?.ranking || null
      },
      tournament: match.tournament || 'Unknown Tournament',
      startTime: match.startTime || new Date().toISOString(),
      status: match.status || 'Scheduled',
      odds: {
        player1Win: match.odds?.player1 || 2.0,
        player2Win: match.odds?.player2 || 2.0
      }
    }));
  }

  private formatRapidApiGolf(golfData: any[]): any[] {
    return golfData.map((tournament: any) => ({
      id: tournament.id || Math.random().toString(36),
      sport: 'Golf',
      tournament: tournament.name || 'Unknown Tournament',
      venue: tournament.venue || 'Unknown Venue',
      startTime: tournament.startDate || new Date().toISOString(),
      status: tournament.status || 'Scheduled',
      leaderboard: tournament.leaderboard?.slice(0, 10) || [],
      purse: tournament.purse || null
    }));
  }

  private generateFallback(): any[] {
    console.error('No fallback data allowed - use real API sources only');
    return [];
  }
}

export const enhancedFreeSportsService = new FreeSportsApiService();