interface TeamStats {
  overallPower: number;
  offenseRating: number;
  defenseRating: number;
  formLast5: number;
  motivationIndex: number;
  injuryImpact: number;
  fatigueIndex: number;
  h2hEdge: number;
  slumpBounceScore: number;
}

interface Game {
  favoriteTeam: string;
  underdogTeam: string;
  homeTeam: string;
  awayTeam: string;
  favoriteStats: TeamStats;
  dogStats: TeamStats;
}

interface Market {
  spreadLine: number;
  total: number;
  publicPctOnFavorite?: number;
  sharpPctOnFavorite?: number;
  isPrimetime?: boolean;
  isRivalry?: boolean;
  isStandalone?: boolean;
  lineOpenedAt?: number;
  currentLine?: number;
}

export function scoreGame(game: Game, market: Market): { edgeScoreFavorite: number; edgeScoreDog: number } {
  const {
    favoriteTeam,
    underdogTeam,
    homeTeam,
    favoriteStats,
    dogStats,
  } = game;

  const {
    spreadLine,
    total,
    publicPctOnFavorite,
    sharpPctOnFavorite,
    isPrimetime,
    isRivalry,
    isStandalone,
    lineOpenedAt,
    currentLine,
  } = market;

  const lineMove =
    currentLine != null && lineOpenedAt != null ? currentLine - lineOpenedAt : 0;

  const norm = (val: number | undefined, min: number, max: number): number => {
    if (val == null) return 0.5;
    if (max === min) return 0.5;
    const x = (val - min) / (max - min);
    return Math.max(0, Math.min(1, x));
  };

  const favOverall = norm(favoriteStats.overallPower, 0, 100);
  const dogOverall = norm(dogStats.overallPower, 0, 100);

  const favOff = norm(favoriteStats.offenseRating, 80, 130);
  const dogOff = norm(dogStats.offenseRating, 80, 130);

  const favDef = norm(favoriteStats.defenseRating, 80, 130);
  const dogDef = norm(dogStats.defenseRating, 80, 130);

  const favForm = norm(favoriteStats.formLast5, -20, 20);
  const dogForm = norm(dogStats.formLast5, -20, 20);

  const favMotivation = norm(favoriteStats.motivationIndex, 0, 1);
  const dogMotivation = norm(dogStats.motivationIndex, 0, 1);

  const favInjuries = 1 - norm(favoriteStats.injuryImpact, 0, 1);
  const dogInjuries = 1 - norm(dogStats.injuryImpact, 0, 1);

  const favFatigue = 1 - norm(favoriteStats.fatigueIndex, 0, 1);
  const dogFatigue = 1 - norm(dogStats.fatigueIndex, 0, 1);

  const favHome = favoriteTeam === homeTeam ? 1 : 0.3;
  const dogHome = underdogTeam === homeTeam ? 1 : 0.3;

  const favH2H = norm(favoriteStats.h2hEdge, -10, 10);
  const dogH2H = norm(dogStats.h2hEdge, -10, 10);

  const favSlumpBounce = norm(favoriteStats.slumpBounceScore, 0, 1);
  const dogSlumpBounce = norm(dogStats.slumpBounceScore, 0, 1);

  const publicHeavyFav = publicPctOnFavorite != null && publicPctOnFavorite > 0.7;
  const sharpOnDog =
    sharpPctOnFavorite != null &&
    sharpPctOnFavorite < 0.5 &&
    (publicPctOnFavorite ?? 0) > 0.6;

  const spreadMag = Math.abs(spreadLine || 0);

  const teslaFav = teslaScore(spreadLine, total);
  const teslaDog = teslaScore(-spreadLine, total);

  const primetimeBoost = isPrimetime || isStandalone ? 1 : 0;
  const rivalryBoost = isRivalry ? 1 : 0;

  const liveManipRisk =
    (isPrimetime || isStandalone ? 0.5 : 0) +
    (Math.abs(spreadLine || 0) >= 7 ? 0.3 : 0) +
    (publicPctOnFavorite && publicPctOnFavorite > 0.75 ? 0.3 : 0);

  const suspiciousMove = lineMove && Math.abs(lineMove) >= 1.5 ? 1 : 0;

  const W = {
    teamOverall: 3,
    offense: 2,
    defense: 3,
    form: 2,
    motivation: 2.5,
    injuries: 3,
    fatigue: 2,
    home: 2,
    h2h: 1.5,
    slumpBounce: 1.5,
    publicSharp: 3,
    spreadShape: 2,
    primetime: 1,
    rivalry: 1,
    tesla: 1.5,
    manipRisk: 2,
  };

  let favScore =
    W.teamOverall * favOverall +
    W.offense * favOff +
    W.defense * (1 - favDef) +
    W.form * favForm +
    W.motivation * favMotivation +
    W.injuries * favInjuries +
    W.fatigue * favFatigue +
    W.home * favHome +
    W.h2h * favH2H +
    W.slumpBounce * favSlumpBounce +
    W.tesla * teslaFav;

  let dogScore =
    W.teamOverall * dogOverall +
    W.offense * dogOff +
    W.defense * (1 - dogDef) +
    W.form * dogForm +
    W.motivation * dogMotivation +
    W.injuries * dogInjuries +
    W.fatigue * dogFatigue +
    W.home * dogHome +
    W.h2h * dogH2H +
    W.slumpBounce * dogSlumpBounce +
    W.tesla * teslaDog;

  if (publicHeavyFav) {
    dogScore += W.publicSharp * 0.7;
    favScore -= W.publicSharp * 0.3;
  }
  if (sharpOnDog) {
    dogScore += W.publicSharp * 0.8;
  }

  if (spreadMag >= 10) {
    favScore -= W.spreadShape * 0.6;
    dogScore += W.spreadShape * 0.4;
  } else if (spreadMag >= 6.5) {
    favScore -= W.spreadShape * 0.3;
    dogScore += W.spreadShape * 0.2;
  }

  if (primetimeBoost || rivalryBoost) {
    dogScore += W.primetime * 0.4 * primetimeBoost;
    dogScore += W.rivalry * 0.4 * rivalryBoost;
  }

  if (liveManipRisk > 0.5) {
    favScore -= W.manipRisk * 0.5;
    dogScore += W.manipRisk * 0.3;
  }

  if (suspiciousMove && publicHeavyFav && lineMove > 0) {
    dogScore += W.publicSharp * 0.6;
  }

  const allScores = [favScore, dogScore];
  const minScore = Math.min(...allScores);
  const maxScore = Math.max(...allScores);
  const scale = maxScore === minScore ? 1 : 10 / (maxScore - minScore);

  const edgeScoreFavorite = (favScore - minScore) * scale;
  const edgeScoreDog = (dogScore - minScore) * scale;

  return { edgeScoreFavorite, edgeScoreDog };
}

function teslaScore(spread: number, total: number): number {
  const magicNums = [3, 6, 9, 12, 18, 21, 24];
  const s = Math.abs(spread || 0);
  const t = total || 0;

  const nearestSpreadDiff = Math.min(
    ...magicNums.map((n) => Math.abs(s - n))
  );
  const nearestTotalDiff = Math.min(
    ...magicNums.map((n) => Math.abs(t - n))
  );

  const spreadScore = Math.max(0, 1 - nearestSpreadDiff / 10);
  const totalScore = Math.max(0, 1 - nearestTotalDiff / 30);

  return spreadScore * 0.6 + totalScore * 0.4;
}