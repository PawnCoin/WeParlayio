import { useEffect, useState } from "react";

interface Game {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  isLateGame: boolean;
  market: {
    spreadFavorite: string;
    spreadLine: number;
    spreadOdds: number;
    total: number;
    moneylineFavorite: string;
    moneylineFavOdds: number;
    moneylineDog: string;
    moneylineDogOdds: number;
  };
  edgeScoreFavorite: number;
  edgeScoreDog: number;
}

export function useTodayGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/king-games");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setGames(data.games || []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setGames([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { games, loading, error };
}