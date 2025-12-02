import { useMemo, useState } from "react";
import { Crown, TrendingUp, DollarSign, Target, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Team {
  name: string;
}

interface Market {
  spreadFavorite: string;
  spreadLine: number;
  spreadOdds: number;
  total: number;
  moneylineFavorite: string;
  moneylineFavOdds: number;
  moneylineDog: string;
  moneylineDogOdds: number;
}

interface Game {
  id: string;
  sport: string;
  league: string;
  startTime: string;
  homeTeam: string;
  awayTeam: string;
  isLateGame?: boolean;
  market: Market;
  edgeScoreFavorite: number;
  edgeScoreDog: number;
}

interface Side {
  gameId: string;
  sport: string;
  league: string;
  sideType: "favorite" | "dog";
  team: string;
  opponent: string;
  spread: number;
  odds: number;
  edgeScore: number;
  isLateGame: boolean;
}

interface KingCard {
  straightPlays: Side[];
  twoTeamers: Side[][];
  threeTeamers: Side[][];
  fourTeamers: Side[][];
  lateParlay: Side[] | null;
  fiveTeamer: Side[] | null;
}

interface BankrollPlan {
  perStraight: number;
  per2T: number;
  per3T: number;
  per4T: number;
  lateParlay: number;
  fiveTeamer: number;
  totalRiskPool: number;
}

function isLateGameFromTime(startTimeIso: string, thresholdHourLocal = 17): boolean {
  try {
    const date = new Date(startTimeIso);
    const hour = date.getHours();
    return hour >= thresholdHourLocal;
  } catch {
    return false;
  }
}

function makeSide(game: Game, sideType: "favorite" | "dog"): Side {
  const isFav = sideType === "favorite";
  const favoriteTeam = game.market?.spreadFavorite;
  const spreadLine = game.market?.spreadLine ?? -3.5;
  const odds = game.market?.spreadOdds ?? -110;

  let team: string;
  if (isFav) {
    team = favoriteTeam;
  } else {
    team = favoriteTeam === game.homeTeam ? game.awayTeam : game.homeTeam;
  }

  const opponent = team === game.homeTeam ? game.awayTeam : game.homeTeam;
  const spread = isFav ? spreadLine : -spreadLine;
  const edgeScore = isFav ? game.edgeScoreFavorite : game.edgeScoreDog;

  return {
    gameId: game.id,
    sport: game.sport,
    league: game.league,
    sideType,
    team,
    opponent,
    spread,
    odds,
    edgeScore,
    isLateGame:
      typeof game.isLateGame === "boolean"
        ? game.isLateGame
        : isLateGameFromTime(game.startTime),
  };
}

function buildCandidateSides(games: Game[]): Side[] {
  const sides: Side[] = [];
  for (const g of games) {
    if (!g.market || !g.market.spreadFavorite) continue;
    sides.push(makeSide(g, "favorite"));
    sides.push(makeSide(g, "dog"));
  }
  return sides.sort((a, b) => b.edgeScore - a.edgeScore);
}

function buildKingCard(games: Game[], options: {
  maxStraights?: number;
  maxTwoTeamers?: number;
  maxThreeTeamers?: number;
  maxFourTeamers?: number;
  includeFiveTeamer?: boolean;
} = {}): KingCard {
  const {
    maxStraights = 3,
    maxTwoTeamers = 2,
    maxThreeTeamers = 2,
    maxFourTeamers = 2,
    includeFiveTeamer = true,
  } = options;

  const allSides = buildCandidateSides(games);
  const earlySides = allSides.filter((s) => !s.isLateGame);
  const lateSides = allSides.filter((s) => s.isLateGame);

  const straightPlays: Side[] = [];
  for (const s of earlySides) {
    if (straightPlays.length >= maxStraights) break;
    if (straightPlays.some((p) => p.team === s.team)) continue;
    straightPlays.push(s);
  }
  if (straightPlays.length < maxStraights) {
    for (const s of lateSides) {
      if (straightPlays.length >= maxStraights) break;
      if (straightPlays.some((p) => p.team === s.team)) continue;
      straightPlays.push(s);
    }
  }

  function buildParlaysFromPool(sidesPool: Side[], size: number, maxCount: number, usedTeamsGlobal = new Set<string>()) {
    const parlays: Side[][] = [];
    const usedTeams = new Set(usedTeamsGlobal);

    for (const side of sidesPool) {
      if (parlays.length >= maxCount) break;
      if (usedTeams.has(side.team)) continue;

      const parlay: Side[] = [side];
      const localTeams = new Set([side.team]);

      for (const candidate of sidesPool) {
        if (parlay.length >= size) break;
        if (localTeams.has(candidate.team)) continue;
        if (usedTeams.has(candidate.team)) continue;
        if (side.isLateGame !== candidate.isLateGame) continue;
        parlay.push(candidate);
        localTeams.add(candidate.team);
      }

      if (parlay.length === size) {
        parlays.push(parlay);
        for (const leg of parlay) usedTeams.add(leg.team);
      }
    }
    return { parlays, usedTeams };
  }

  const coreUsedTeams = new Set<string>();

  const earlyCoreSides = earlySides.filter(
    (s) => !straightPlays.some((p) => p.gameId === s.gameId && p.team === s.team)
  );

  const { parlays: twoTeamers, usedTeams: after2T } = buildParlaysFromPool(
    earlyCoreSides, 2, maxTwoTeamers, coreUsedTeams
  );
  for (const t of after2T) coreUsedTeams.add(t);

  const earlyRemainingFor3T = earlyCoreSides.filter(
    (s) => !Array.from(coreUsedTeams).includes(s.team)
  );
  const { parlays: threeTeamers, usedTeams: after3T } = buildParlaysFromPool(
    earlyRemainingFor3T, 3, maxThreeTeamers, coreUsedTeams
  );
  for (const t of after3T) coreUsedTeams.add(t);

  const earlyRemainingFor4T = earlyCoreSides.filter(
    (s) => !Array.from(coreUsedTeams).includes(s.team)
  );
  const { parlays: fourTeamers } = buildParlaysFromPool(
    earlyRemainingFor4T, 4, maxFourTeamers, coreUsedTeams
  );

  const lateParlay: Side[] = [];
  const lateUsedTeams = new Set<string>();
  for (const s of lateSides) {
    if (lateParlay.length >= 3) break;
    if (lateUsedTeams.has(s.team)) continue;
    lateParlay.push(s);
    lateUsedTeams.add(s.team);
  }

  const fiveTeamer: Side[] = [];
  if (includeFiveTeamer) {
    const combined = [...earlySides, ...lateSides];
    for (const s of combined) {
      if (fiveTeamer.length >= 5) break;
      if (fiveTeamer.some((leg) => leg.team === s.team)) continue;
      fiveTeamer.push(s);
    }
  }

  return {
    straightPlays,
    twoTeamers,
    threeTeamers,
    fourTeamers,
    lateParlay: lateParlay.length ? lateParlay : null,
    fiveTeamer: fiveTeamer.length ? fiveTeamer : null,
  };
}

function allocateBankroll(bankroll: number, card: KingCard, riskMode = "safe"): BankrollPlan {
  const riskPct = riskMode === "standard" ? 0.2 : 0.1;
  const totalRiskPool = bankroll * riskPct;

  const numStraights = card.straightPlays.length;
  const num2T = card.twoTeamers.length;
  const num3T = card.threeTeamers.length;
  const num4T = card.fourTeamers.length;
  const hasLate = card.lateParlay ? 1 : 0;
  const has5T = card.fiveTeamer ? 1 : 0;

  const weightStraight = 3;
  const weight2T = 1.5;
  const weight3T = 1;
  const weight4T = 0.75;
  const weightLate = 0.5;
  const weight5T = 0.5;

  const totalWeight =
    numStraights * weightStraight +
    num2T * weight2T +
    num3T * weight3T +
    num4T * weight4T +
    hasLate * weightLate +
    has5T * weight5T;

  if (totalWeight === 0) {
    return {
      perStraight: 0,
      per2T: 0,
      per3T: 0,
      per4T: 0,
      lateParlay: 0,
      fiveTeamer: 0,
      totalRiskPool,
    };
  }

  const unit = totalRiskPool / totalWeight;

  return {
    perStraight: unit * weightStraight,
    per2T: unit * weight2T,
    per3T: unit * weight3T,
    per4T: unit * weight4T,
    lateParlay: hasLate ? unit * weightLate : 0,
    fiveTeamer: has5T ? unit * weight5T : 0,
    totalRiskPool,
  };
}

function ParlaySection({ title, parlays, perBet, icon }: { 
  title: string; 
  parlays: Side[][]; 
  perBet: number;
  icon?: React.ReactNode;
}) {
  if (!parlays || parlays.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">No parlays generated for this category.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
          <Badge variant="outline" className="ml-auto bg-green-500/20 text-green-400 border-green-500/50">
            ${perBet.toFixed(2)} each
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {parlays.map((legs, i) => (
          <div key={title + i} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
            <div className="text-sm font-semibold text-yellow-400 mb-2">Parlay #{i + 1}</div>
            <div className="space-y-1">
              {legs.map((s) => (
                <div key={s.gameId + s.team} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{s.sport}</Badge>
                    <span className="text-white font-medium">{s.team}</span>
                    <span className="text-gray-400">vs {s.opponent}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">{s.spread > 0 ? "+" : ""}{s.spread}</span>
                    <span className="text-gray-500">@</span>
                    <span className="text-gray-300">{s.odds}</span>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                      {s.edgeScore.toFixed(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function KingVipTool({ games }: { games: Game[] }) {
  const [bankroll, setBankroll] = useState(100);
  const [riskMode, setRiskMode] = useState("safe");

  const card = useMemo(
    () =>
      buildKingCard(games || [], {
        maxStraights: 3,
        maxTwoTeamers: 2,
        maxThreeTeamers: 2,
        maxFourTeamers: 2,
        includeFiveTeamer: true,
      }),
    [games]
  );

  const bankrollPlan = useMemo(
    () => allocateBankroll(bankroll, card, riskMode),
    [bankroll, card, riskMode]
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card className="bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Crown className="w-8 h-8 text-yellow-400" />
            <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              King VIP Engine
            </span>
          </CardTitle>
          <p className="text-gray-400">
            Bankroll-aware, multi-sport pick builder with edge scoring and parlay optimization.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Bankroll ($)</label>
              <Input
                type="number"
                min={50}
                step={10}
                value={bankroll}
                onChange={(e) => setBankroll(Number(e.target.value || 0))}
                className="w-32 bg-gray-800 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Risk Mode</label>
              <Select value={riskMode} onValueChange={setRiskMode}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safe">Very Safe (10% daily)</SelectItem>
                  <SelectItem value="standard">Standard (20% daily)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 flex items-center justify-end">
              <div className="bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700">
                <div className="text-sm text-gray-400">Total Risk Today</div>
                <div className="text-2xl font-bold text-green-400">
                  ${bankrollPlan.totalRiskPool.toFixed(2)}
                  <span className="text-sm text-gray-500 ml-2">of ${bankroll}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Straight Plays (Core)
            <Badge variant="outline" className="ml-auto bg-blue-500/20 text-blue-400 border-blue-500/50">
              ${bankrollPlan.perStraight.toFixed(2)} each
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {card.straightPlays.length === 0 ? (
            <p className="text-gray-400 text-sm">No straight plays generated.</p>
          ) : (
            <div className="space-y-2">
              {card.straightPlays.map((s) => (
                <div key={s.gameId + s.team} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{s.sport}</Badge>
                    <span className="text-white font-medium">{s.team}</span>
                    <span className="text-gray-400">vs {s.opponent}</span>
                    {s.isLateGame && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">Late</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 font-mono">{s.spread > 0 ? "+" : ""}{s.spread}</span>
                    <span className="text-gray-500">@</span>
                    <span className="text-gray-300">{s.odds}</span>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                      Edge: {s.edgeScore.toFixed(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <ParlaySection 
          title="2-Team Parlays" 
          parlays={card.twoTeamers} 
          perBet={bankrollPlan.per2T}
          icon={<Zap className="w-5 h-5 text-yellow-400" />}
        />
        <ParlaySection 
          title="3-Team Parlays" 
          parlays={card.threeTeamers} 
          perBet={bankrollPlan.per3T}
          icon={<Zap className="w-5 h-5 text-orange-400" />}
        />
      </div>

      <ParlaySection 
        title="4-Team Parlays" 
        parlays={card.fourTeamers} 
        perBet={bankrollPlan.per4T}
        icon={<Zap className="w-5 h-5 text-red-400" />}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              Late-Only Parlay (Lotto)
              <Badge variant="outline" className="ml-auto bg-orange-500/20 text-orange-400 border-orange-500/50">
                ${bankrollPlan.lateParlay.toFixed(2)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!card.lateParlay ? (
              <p className="text-gray-400 text-sm">No late parlay generated.</p>
            ) : (
              <div className="space-y-2">
                {card.lateParlay.map((s) => (
                  <div key={s.gameId + s.team} className="flex items-center justify-between text-sm bg-gray-900/50 rounded p-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{s.sport}</Badge>
                      <span className="text-white">{s.team}</span>
                      <span className="text-gray-400 text-xs">vs {s.opponent}</span>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400">{s.edgeScore.toFixed(1)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-400" />
              5-Team King Cosmic Ticket
              <Badge variant="outline" className="ml-auto bg-purple-500/20 text-purple-400 border-purple-500/50">
                ${bankrollPlan.fiveTeamer.toFixed(2)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!card.fiveTeamer ? (
              <p className="text-gray-400 text-sm">No 5-team ticket generated.</p>
            ) : (
              <div className="space-y-2">
                {card.fiveTeamer.map((s) => (
                  <div key={s.gameId + s.team} className="flex items-center justify-between text-sm bg-gray-900/50 rounded p-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{s.sport}</Badge>
                      <span className="text-white">{s.team}</span>
                      <span className="text-gray-400 text-xs">vs {s.opponent}</span>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400">{s.edgeScore.toFixed(1)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default KingVipTool;