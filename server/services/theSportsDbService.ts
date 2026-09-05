type FinalScore = {
  source: 'TheSportsDB';
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
};

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Optional corroborating results feed. The public key is appropriate for
 * development only; production should use an account key and respect the
 * provider's rate limits and terms.
 */
export class TheSportsDbService {
  private readonly baseUrl = 'https://www.thesportsdb.com/api/v1/json';

  async findFinalByTeams(input: { homeTeam: string; awayTeam: string; startTime: string }): Promise<FinalScore | null> {
    const date = new Date(input.startTime);
    if (Number.isNaN(date.getTime())) return null;
    const day = date.toISOString().slice(0, 10);
    const key = process.env.THESPORTSDB_API_KEY || '123';

    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(key)}/eventsday.php?d=${day}`);
      if (!response.ok) return null;
      const payload = await response.json();
      const expectedHome = normalise(input.homeTeam);
      const expectedAway = normalise(input.awayTeam);
      const event = (payload.events || []).find((item: any) =>
        normalise(item.strHomeTeam || '') === expectedHome &&
        normalise(item.strAwayTeam || '') === expectedAway &&
        item.intHomeScore !== null && item.intHomeScore !== undefined &&
        item.intAwayScore !== null && item.intAwayScore !== undefined,
      );
      if (!event) return null;
      const homeScore = Number(event.intHomeScore);
      const awayScore = Number(event.intAwayScore);
      if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) return null;
      return { source: 'TheSportsDB', homeTeam: event.strHomeTeam, awayTeam: event.strAwayTeam, homeScore, awayScore };
    } catch (error) {
      console.warn('TheSportsDB final-result lookup failed:', error);
      return null;
    }
  }
}

export const theSportsDbService = new TheSportsDbService();
