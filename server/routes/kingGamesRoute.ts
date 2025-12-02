import { Router, Request, Response } from "express";

const router = Router();

interface RawGame {
  leagueKey: string;
  raw: {
    id: string;
    sport_title?: string;
    home_team: string;
    away_team: string;
    commence_time: string;
    bookmakers?: Array<{
      title: string;
      markets?: Array<{
        key: string;
        outcomes?: Array<{
          name: string;
          point?: number;
          price: number;
        }>;
      }>;
    }>;
  };
}

function buildMockGames(): RawGame[] {
  const now = new Date();
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
  const in4h = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
  const in6h = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
  const in8h = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString();

  return [
    {
      leagueKey: "basketball_nba",
      raw: {
        id: "mock-nba-lal-phx",
        sport_title: "NBA",
        home_team: "Los Angeles Lakers",
        away_team: "Phoenix Suns",
        commence_time: in6h,
        bookmakers: [
          {
            title: "MockBook",
            markets: [
              {
                key: "spreads",
                outcomes: [
                  { name: "Los Angeles Lakers", point: -5.5, price: -110 },
                  { name: "Phoenix Suns", point: 5.5, price: -110 },
                ],
              },
              {
                key: "h2h",
                outcomes: [
                  { name: "Los Angeles Lakers", price: -210 },
                  { name: "Phoenix Suns", price: 180 },
                ],
              },
              {
                key: "totals",
                outcomes: [
                  { name: "Over", point: 230.5, price: -110 },
                  { name: "Under", point: 230.5, price: -110 },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      leagueKey: "basketball_nba",
      raw: {
        id: "mock-nba-orl-chi",
        sport_title: "NBA",
        home_team: "Orlando Magic",
        away_team: "Chicago Bulls",
        commence_time: in2h,
        bookmakers: [
          {
            title: "MockBook",
            markets: [
              {
                key: "spreads",
                outcomes: [
                  { name: "Orlando Magic", point: -8.5, price: -110 },
                  { name: "Chicago Bulls", point: 8.5, price: -110 },
                ],
              },
              {
                key: "h2h",
                outcomes: [
                  { name: "Orlando Magic", price: -300 },
                  { name: "Chicago Bulls", price: 240 },
                ],
              },
              {
                key: "totals",
                outcomes: [
                  { name: "Over", point: 218.5, price: -110 },
                  { name: "Under", point: 218.5, price: -110 },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      leagueKey: "icehockey_nhl",
      raw: {
        id: "mock-nhl-phi-pit",
        sport_title: "NHL",
        home_team: "Philadelphia Flyers",
        away_team: "Pittsburgh Penguins",
        commence_time: in4h,
        bookmakers: [
          {
            title: "MockBook",
            markets: [
              {
                key: "spreads",
                outcomes: [
                  { name: "Philadelphia Flyers", point: -1.5, price: 180 },
                  { name: "Pittsburgh Penguins", point: 1.5, price: -210 },
                ],
              },
              {
                key: "h2h",
                outcomes: [
                  { name: "Philadelphia Flyers", price: -140 },
                  { name: "Pittsburgh Penguins", price: 120 },
                ],
              },
              {
                key: "totals",
                outcomes: [
                  { name: "Over", point: 6.5, price: -110 },
                  { name: "Under", point: 6.5, price: -110 },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      leagueKey: "americanfootball_nfl",
      raw: {
        id: "mock-nfl-dal-phi",
        sport_title: "NFL",
        home_team: "Philadelphia Eagles",
        away_team: "Dallas Cowboys",
        commence_time: in8h,
        bookmakers: [
          {
            title: "MockBook",
            markets: [
              {
                key: "spreads",
                outcomes: [
                  { name: "Philadelphia Eagles", point: -6.5, price: -110 },
                  { name: "Dallas Cowboys", point: 6.5, price: -110 },
                ],
              },
              {
                key: "h2h",
                outcomes: [
                  { name: "Philadelphia Eagles", price: -275 },
                  { name: "Dallas Cowboys", price: 220 },
                ],
              },
              {
                key: "totals",
                outcomes: [
                  { name: "Over", point: 48.5, price: -110 },
                  { name: "Under", point: 48.5, price: -110 },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      leagueKey: "basketball_ncaab",
      raw: {
        id: "mock-ncaab-duke-unc",
        sport_title: "NCAAB",
        home_team: "Duke Blue Devils",
        away_team: "North Carolina Tar Heels",
        commence_time: in4h,
        bookmakers: [
          {
            title: "MockBook",
            markets: [
              {
                key: "spreads",
                outcomes: [
                  { name: "Duke Blue Devils", point: -4.5, price: -110 },
                  { name: "North Carolina Tar Heels", point: 4.5, price: -110 },
                ],
              },
              {
                key: "h2h",
                outcomes: [
                  { name: "Duke Blue Devils", price: -180 },
                  { name: "North Carolina Tar Heels", price: 155 },
                ],
              },
              {
                key: "totals",
                outcomes: [
                  { name: "Over", point: 152.5, price: -110 },
                  { name: "Under", point: 152.5, price: -110 },
                ],
              },
            ],
          },
        ],
      },
    },
  ];
}

function leagueKeyToSport(leagueKey: string): string {
  if (!leagueKey) return "Other";
  if (leagueKey.includes("basketball_nba")) return "NBA";
  if (leagueKey.includes("americanfootball_nfl")) return "NFL";
  if (leagueKey.includes("icehockey_nhl")) return "NHL";
  if (leagueKey.includes("basketball_ncaab")) return "NCAAB";
  return "Other";
}

function isLateGameFromStart(startTimeIso: string): boolean {
  try {
    const d = new Date(startTimeIso);
    const hour = d.getHours();
    return hour >= 17;
  } catch {
    return false;
  }
}

function isPrimetimeGame(sport: string, startTimeIso: string): boolean {
  try {
    const d = new Date(startTimeIso);
    const hour = d.getHours();
    if (sport === "NFL" || sport === "NCAAF") {
      return hour >= 17;
    }
    if (sport === "NBA" || sport === "NHL") {
      return hour >= 18;
    }
    return false;
  } catch {
    return false;
  }
}

function isRivalryMatchup(sport: string, homeTeam: string, awayTeam: string): boolean {
  const key = `${homeTeam} vs ${awayTeam}`.toLowerCase();
  const rivalryPairs = [
    "los angeles lakers vs boston celtics",
    "philadelphia flyers vs pittsburgh penguins",
    "new york giants vs dallas cowboys",
    "duke blue devils vs north carolina tar heels",
    "ohio state buckeyes vs michigan wolverines",
    "philadelphia eagles vs dallas cowboys",
  ];
  return rivalryPairs.some((r) => key.includes(r) || key.includes(r.split(" vs ").reverse().join(" vs ")));
}

function buildDummyStats(teamName: string, sportTitle: string, isFav: boolean) {
  const base = isFav ? 0.7 : 0.5;
  return {
    overallPower: base * 100,
    offenseRating: 100 + (isFav ? 10 : -5),
    defenseRating: 110 - (isFav ? 10 : -5),
    formLast5: isFav ? 8 : -4,
    motivationIndex: isFav ? 0.8 : 0.6,
    injuryImpact: isFav ? 0.2 : 0.3,
    fatigueIndex: 0.3,
    h2hEdge: isFav ? 4 : -2,
    slumpBounceScore: 0.5,
  };
}

function scoreGame(game: any, market: any): { edgeScoreFavorite: number; edgeScoreDog: number } {
  const { favoriteStats, dogStats } = game;
  const { spreadLine, publicPctOnFavorite, sharpPctOnFavorite, isPrimetime, isRivalry } = market;

  const norm = (val: number | undefined, min: number, max: number): number => {
    if (val == null) return 0.5;
    if (max === min) return 0.5;
    const x = (val - min) / (max - min);
    return Math.max(0, Math.min(1, x));
  };

  const favOverall = norm(favoriteStats.overallPower, 0, 100);
  const dogOverall = norm(dogStats.overallPower, 0, 100);
  const favForm = norm(favoriteStats.formLast5, -20, 20);
  const dogForm = norm(dogStats.formLast5, -20, 20);
  const favMotivation = norm(favoriteStats.motivationIndex, 0, 1);
  const dogMotivation = norm(dogStats.motivationIndex, 0, 1);

  const publicHeavyFav = publicPctOnFavorite != null && publicPctOnFavorite > 0.7;
  const spreadMag = Math.abs(spreadLine || 0);

  let favScore = favOverall * 3 + favForm * 2 + favMotivation * 2.5;
  let dogScore = dogOverall * 3 + dogForm * 2 + dogMotivation * 2.5;

  if (publicHeavyFav) {
    dogScore += 2.1;
    favScore -= 0.9;
  }

  if (spreadMag >= 10) {
    favScore -= 1.2;
    dogScore += 0.8;
  } else if (spreadMag >= 6.5) {
    favScore -= 0.6;
    dogScore += 0.4;
  }

  if (isPrimetime || isRivalry) {
    dogScore += 0.4;
  }

  const allScores = [favScore, dogScore];
  const minScore = Math.min(...allScores);
  const maxScore = Math.max(...allScores);
  const scale = maxScore === minScore ? 1 : 10 / (maxScore - minScore);

  const edgeScoreFavorite = (favScore - minScore) * scale;
  const edgeScoreDog = (dogScore - minScore) * scale;

  return { edgeScoreFavorite, edgeScoreDog };
}

function normalizeGameForKing(leagueKey: string, raw: RawGame["raw"]) {
  const sportTitle = raw.sport_title || "";
  const sport = leagueKeyToSport(leagueKey);

  const homeTeam = raw.home_team;
  const awayTeam = raw.away_team;

  const book = raw.bookmakers?.[0];
  const spreads = book?.markets?.find((m) => m.key === "spreads");
  const h2h = book?.markets?.find((m) => m.key === "h2h");
  const totals = book?.markets?.find((m) => m.key === "totals");

  const spreadOutcomes = spreads?.outcomes || [];
  let favoriteTeam: string | null = null;
  let underdogTeam: string | null = null;
  let spreadLine: number | null = null;
  let spreadOdds = -110;

  if (spreadOutcomes.length === 2) {
    const [o1, o2] = spreadOutcomes;
    if ((o1.point || 0) < 0) {
      favoriteTeam = o1.name;
      underdogTeam = o2.name;
      spreadLine = o1.point || -3.5;
      spreadOdds = o1.price;
    } else if ((o2.point || 0) < 0) {
      favoriteTeam = o2.name;
      underdogTeam = o1.name;
      spreadLine = o2.point || -3.5;
      spreadOdds = o2.price;
    } else {
      favoriteTeam = homeTeam;
      underdogTeam = awayTeam;
      spreadLine = -3.5;
      spreadOdds = -110;
    }
  } else {
    favoriteTeam = homeTeam;
    underdogTeam = awayTeam;
    spreadLine = -3.5;
  }

  const h2hOutcomes = h2h?.outcomes || [];
  const moneylineFavoriteData = h2hOutcomes.sort((a, b) => a.price - b.price)[0];
  const moneylineFavorite = moneylineFavoriteData?.name || favoriteTeam;
  const moneylineFavOdds = moneylineFavoriteData?.price ?? -150;
  const moneylineDogData = h2hOutcomes.find((o) => o.name !== moneylineFavorite);
  const moneylineDog = moneylineDogData?.name || (moneylineFavorite === homeTeam ? awayTeam : homeTeam);
  const moneylineDogOdds = moneylineDogData?.price ?? 130;

  const totalOutcome = totals?.outcomes?.[0];
  const total = totalOutcome?.point ?? 0;

  const startTime = raw.commence_time;
  const isLateGame = isLateGameFromStart(startTime);

  const favoriteStats = buildDummyStats(favoriteTeam || homeTeam, sportTitle, true);
  const dogStats = buildDummyStats(underdogTeam || awayTeam, sportTitle, false);

  const game = {
    id: raw.id,
    sport,
    league: sportTitle,
    homeTeam,
    awayTeam,
    favoriteTeam,
    underdogTeam,
    startTime,
    isLateGame,
    favoriteStats,
    dogStats,
  };

  const market = {
    spreadLine,
    total,
    publicPctOnFavorite: 0.6,
    sharpPctOnFavorite: 0.4,
    isPrimetime: isPrimetimeGame(sport, startTime),
    isRivalry: isRivalryMatchup(sport, homeTeam, awayTeam),
    isStandalone: false,
    lineOpenedAt: spreadLine,
    currentLine: spreadLine,
    spreadFavorite: favoriteTeam,
    spreadOdds,
    moneylineFavorite,
    moneylineFavOdds,
    moneylineDog,
    moneylineDogOdds,
  };

  return { game, market };
}

router.get("/king-games", async (req: Request, res: Response) => {
  try {
    const rawGames = buildMockGames();

    const scoredGames = rawGames.map(({ leagueKey, raw }) => {
      const { game, market } = normalizeGameForKing(leagueKey, raw);
      const { edgeScoreFavorite, edgeScoreDog } = scoreGame(game, market);

      return {
        id: game.id,
        sport: game.sport,
        league: game.league,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        startTime: game.startTime,
        isLateGame: game.isLateGame,
        market: {
          spreadFavorite: market.spreadFavorite,
          spreadLine: market.spreadLine,
          spreadOdds: market.spreadOdds,
          total: market.total,
          moneylineFavorite: market.moneylineFavorite,
          moneylineFavOdds: market.moneylineFavOdds,
          moneylineDog: market.moneylineDog,
          moneylineDogOdds: market.moneylineDogOdds,
        },
        edgeScoreFavorite,
        edgeScoreDog,
      };
    });

    res.json({ games: scoredGames });
  } catch (err) {
    console.error("Error in /api/king-games:", err);
    res.status(500).json({ error: "Failed to build King games" });
  }
});

export default router;