export type TournamentEvent = {
  id: string;
  homeTeam: string;
  awayTeam: string;
};

export type TournamentResult =
  | { eventId: string; status: "closed" | "completed"; homeScore: number; awayScore: number }
  | { eventId: string; status: "cancelled" };

export type TournamentEntry = {
  userId: string;
  funded: boolean;
  status: string;
  picks?: Record<string, string>;
  wins?: number;
};

export function validateTournamentResults(events: TournamentEvent[], results: TournamentResult[]): void {
  const expected = new Set(events.map(event => event.id));
  const received = new Set(results.map(result => result.eventId));
  if (results.length !== expected.size || received.size !== expected.size || [...received].some(id => !expected.has(id))) {
    throw new Error("A single final result is required for every tournament event");
  }
}

export function scoreTournament(events: TournamentEvent[], results: TournamentResult[], entries: TournamentEntry[]) {
  validateTournamentResults(events, results);
  const eventById = new Map(events.map(event => [event.id, event]));
  const winnersByEvent = new Map<string, string | null>();
  for (const result of results) {
    const event = eventById.get(result.eventId)!;
    if (result.status === "cancelled" || result.homeScore === result.awayScore) {
      winnersByEvent.set(result.eventId, null);
    } else {
      winnersByEvent.set(result.eventId, result.homeScore > result.awayScore ? event.homeTeam : event.awayTeam);
    }
  }

  const eligibleEntries = entries.filter(entry => entry.funded && entry.status === "submitted");
  for (const entry of entries) {
    entry.wins = events.reduce((wins, event) => {
      const winner = winnersByEvent.get(event.id);
      return wins + (winner && entry.picks?.[event.id] === winner ? 1 : 0);
    }, 0);
  }
  const scoredEventCount = [...winnersByEvent.values()].filter(Boolean).length;
  const highScore = eligibleEntries.length ? Math.max(...eligibleEntries.map(entry => entry.wins || 0)) : 0;
  const winners = eligibleEntries.filter(entry => (entry.wins || 0) === highScore).sort((a, b) => a.userId.localeCompare(b.userId));
  return { winnersByEvent, eligibleEntries, winners, highScore, scoredEventCount };
}

export function splitPot(pot: number, winnerIds: string[]): Record<string, number> {
  if (!Number.isFinite(pot) || pot < 0 || !winnerIds.length) throw new Error("A valid pot and at least one winner are required");
  const sorted = [...winnerIds].sort();
  const totalCents = Math.round(pot * 100);
  const baseCents = Math.floor(totalCents / sorted.length);
  let remainder = totalCents - baseCents * sorted.length;
  return Object.fromEntries(sorted.map(userId => [userId, (baseCents + (remainder-- > 0 ? 1 : 0)) / 100]));
}

export function hasIndependentConfirmation(
  previous: { provider: string; hash: string; checkedAt: string } | undefined,
  current: { provider: string; hash: string; checkedAt: string },
  minimumDelayMs = 30_000,
): boolean {
  return Boolean(previous && previous.hash === current.hash && previous.provider.toLowerCase() !== current.provider.toLowerCase()
    && new Date(current.checkedAt).getTime() - new Date(previous.checkedAt).getTime() >= minimumDelayMs);
}
