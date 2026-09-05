import { Router } from "express";
import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { isAuthenticated } from "../replitAuth";
import { dailyTournamentRepository as tournamentStore } from "../services/dailyTournamentRepository";
import { recordWeparlayCashLedgerEntry } from "../services/weparlayCashLedger";
import { hasIndependentConfirmation, scoreTournament, splitPot, validateTournamentResults } from "../services/tournamentSettlement";
import { espnApiService } from "../services/espnApiService";

const router = Router();
const excludedFieldSports = /golf|nascar|formula|racing|cycling/i;
const sameDay = (value: string, day: string) => new Date(value).toISOString().slice(0, 10) === day;
const isBeforeLock = (tournament: any) => Date.now() < new Date(tournament.lockAt).getTime();
const tournamentLedgerReference = (tournamentId: string, userId: string, type: "entry_fee" | "refund" | "payout") =>
  `tournament:${tournamentId}:${type}:${userId}`;
const eventSchema = z.object({
  id: z.string(), sport: z.string(), startTime: z.string(),
  homeTeam: z.string(), awayTeam: z.string(), status: z.string().optional(),
  homeScore: z.number().optional(), awayScore: z.number().optional(),
});
const entrySchema = z.object({ currency: z.enum(["weparlay_cash", "real_money", "crypto"]), picks: z.record(z.string()).optional() });
const resultSchema = z.object({
  provider: z.string().trim().min(2).max(40),
  results: z.array(z.discriminatedUnion("status", [
    z.object({ eventId: z.string(), status: z.enum(["closed", "completed"]), homeScore: z.number(), awayScore: z.number() }),
    z.object({ eventId: z.string(), status: z.literal("cancelled") }),
  ])).min(1),
});
const settlementAuthorized = (provided: unknown) => {
  const expected = process.env.TOURNAMENT_SETTLEMENT_KEY;
  if (!expected || typeof provided !== "string") return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(provided);
  return left.length === right.length && timingSafeEqual(left, right);
};
const digestResults = (results: Array<any>) => createHash("sha256").update(JSON.stringify([...results].sort((a, b) => a.eventId.localeCompare(b.eventId)))).digest("hex");

router.get("/", async (_req, res) => {
  try {
    const day = new Date().toISOString().slice(0, 10);
    res.json({ tournaments: await tournamentStore.listForDay(day) });
  } catch (error: any) {
    res.status(500).json({ message: "Unable to load today's tournaments", detail: error.message });
  }
});
router.get("/:id", async (req, res) => {
  const tournament = await tournamentStore.get(req.params.id);
  if (!tournament) return res.status(404).json({ message: "Tournament not found" });
  res.json({ tournament });
});

router.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const body = z.object({
      name: z.string().trim().min(3).max(80),
      format: z.enum(["daily", "march_madness"]),
      entryFee: z.number().positive(),
      currency: z.enum(["weparlay_cash", "real_money", "crypto"]),
      events: z.array(eventSchema).min(1),
    }).parse(req.body);
    if (body.currency !== "weparlay_cash") return res.status(503).json({ message: "Real-money and crypto tournament entry is not active until compliance approval" });
    const day = new Date().toISOString().slice(0, 10);
    const maxEvents = body.format === "march_madness" ? 68 : 8;
    if (body.events.length > maxEvents) return res.status(400).json({ message: "This format allows up to " + maxEvents + " events" });
    if (new Set(body.events.map(event => event.id)).size !== body.events.length) return res.status(400).json({ message: "Each event can only appear once" });
    if (body.events.some(event => !sameDay(event.startTime, day))) return res.status(400).json({ message: "Every event must be scheduled for today" });
    if (body.events.some(event => new Date(event.startTime).getTime() <= Date.now())) return res.status(400).json({ message: "Only events that have not started can be selected" });
    if (body.events.some(event => excludedFieldSports.test(event.sport) || !event.homeTeam || !event.awayTeam)) return res.status(400).json({ message: "Only head-to-head or team-versus-team events can be used" });
    const id = "daily-" + day + "-" + Date.now().toString(36);
    const lockAt = body.events.reduce((earliest, event) => new Date(event.startTime).getTime() < new Date(earliest).getTime() ? event.startTime : earliest, body.events[0].startTime);
    const tournament = {
      id, ...body, day, creatorId: userId, pot: body.entryFee, status: "open",
      lockAt,
      settleAfter: new Date(day + "T23:59:59.999Z").toISOString(),
      entries: [{ userId, funded: true, picks: {}, wins: 0, status: "picks_required" }],
      chat: [], verified: false, createdAt: new Date().toISOString(),
    };
    await recordWeparlayCashLedgerEntry({
      userId,
      referenceId: tournamentLedgerReference(id, userId, "entry_fee"),
      type: "entry_fee",
      amount: -body.entryFee,
      description: `Tournament entry fee for ${id}`,
      metadata: { tournamentId: id, currency: "weparlay_cash" },
    });
    try {
      await tournamentStore.save(tournament);
    } catch (saveError) {
      await recordWeparlayCashLedgerEntry({
        userId,
        referenceId: tournamentLedgerReference(id, userId, "refund"),
        type: "refund",
        amount: body.entryFee,
        description: `Refund for failed tournament creation ${id}`,
        metadata: { tournamentId: id, currency: "weparlay_cash" },
      });
      throw saveError;
    }
    res.json({ tournament });
  } catch (error: any) {
    res.status(400).json({ message: error?.issues?.[0]?.message || error.message });
  }
});

router.post("/:id/fund", isAuthenticated, async (req: any, res) => {
  try {
    const tournament = await tournamentStore.get(req.params.id);
    if (!tournament || tournament.status !== "open") return res.status(400).json({ message: "Tournament entry is closed" });
    if (!isBeforeLock(tournament)) return res.status(400).json({ message: "Tournament entry locked when the first event began" });
    const userId = req.user?.claims?.sub;
    const { currency } = entrySchema.parse(req.body);
    if (currency !== "weparlay_cash") return res.status(503).json({ message: "This funding method is not active yet" });
    if (tournament.entries.some((entry: any) => entry.userId === userId)) return res.status(400).json({ message: "Entry already funded" });
    await recordWeparlayCashLedgerEntry({
      userId,
      referenceId: tournamentLedgerReference(tournament.id, userId, "entry_fee"),
      type: "entry_fee",
      amount: -tournament.entryFee,
      description: `Tournament entry fee for ${tournament.id}`,
      metadata: { tournamentId: tournament.id, currency: "weparlay_cash" },
    });
    tournament.entries.push({ userId, funded: true, picks: {}, wins: 0, status: "picks_required" });
    tournament.pot += tournament.entryFee;
    try {
      await tournamentStore.save(tournament);
    } catch (saveError) {
      await recordWeparlayCashLedgerEntry({
        userId,
        referenceId: tournamentLedgerReference(tournament.id, userId, "refund"),
        type: "refund",
        amount: tournament.entryFee,
        description: `Refund for failed tournament entry ${tournament.id}`,
        metadata: { tournamentId: tournament.id, currency: "weparlay_cash" },
      });
      throw saveError;
    }
    res.json({ tournament });
  } catch (error: any) { res.status(400).json({ message: error.message }); }
});

router.put("/:id/picks", isAuthenticated, async (req: any, res) => {
  try {
    const tournament = await tournamentStore.get(req.params.id);
    const userId = req.user?.claims?.sub;
    const entry = tournament?.entries.find((item: any) => item.userId === userId && item.funded);
    if (!entry) return res.status(403).json({ message: "Fund the entry before selecting winners" });
    if (!isBeforeLock(tournament)) return res.status(400).json({ message: "Predictions are locked because the tournament has begun" });
    if (entry.status === "submitted") return res.status(400).json({ message: "Submitted predictions are locked" });
    const picks = z.record(z.string()).parse(req.body.picks);
    if (Object.keys(picks).length !== tournament.events.length) return res.status(400).json({ message: "A prediction is required for every match" });
    if (tournament.events.some((event: any) => ![event.homeTeam, event.awayTeam].includes(picks[event.id]))) return res.status(400).json({ message: "Pick one winner for every match" });
    entry.picks = picks; entry.status = "submitted";
    await tournamentStore.save(tournament);
    res.json({ tournament });
  } catch (error: any) { res.status(400).json({ message: error.message }); }
});

// Protected result intake for the scheduled tournament verification job. It
// returns a scorecard only when every tournament event has an ESPN final; the
// existing verify-results endpoint still requires a second provider and the
// end-of-day hold before any escrow can be released.
router.get("/:id/results/espn", async (req, res) => {
  try {
    if (!settlementAuthorized(req.header("x-tournament-settlement-key"))) return res.status(403).json({ message: "Settlement access denied" });
    const tournament = await tournamentStore.get(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Tournament not found" });

    const resolved = await Promise.all(tournament.events.map(async (event: any) => ({ event, final: await espnApiService.getFinalEventById(event.id) })));
    const unresolved = resolved.filter(({ final }) => !final).map(({ event }) => event.id);
    if (unresolved.length) return res.status(409).json({ message: "Not every tournament event has a verified ESPN final", unresolvedEventIds: unresolved });

    const results = resolved.map(({ event, final }) => ({
      eventId: event.id,
      status: "completed" as const,
      homeScore: final.homeTeam.score,
      awayScore: final.awayTeam.score,
    }));
    res.json({ provider: "ESPN", results, tournamentId: tournament.id, generatedAt: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Unable to load ESPN tournament results" });
  }
});

router.post("/:id/verify-results", async (req, res) => {
  try {
    if (!process.env.TOURNAMENT_SETTLEMENT_KEY) return res.status(503).json({ message: "Tournament settlement is not configured" });
    if (!settlementAuthorized(req.header("x-tournament-settlement-key"))) return res.status(403).json({ message: "Settlement access denied" });
    const tournament = await tournamentStore.get(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Tournament not found" });
    if (tournament.status === "paid" || tournament.status === "refunded") return res.json({ tournament, alreadySettled: true });
    if (Date.now() < new Date(tournament.settleAfter).getTime()) return res.status(409).json({ message: "Results cannot be settled before the end-of-day hold" });

    const body = resultSchema.parse(req.body);
    validateTournamentResults(tournament.events, body.results);
    const hash = digestResults(body.results);
    const now = new Date();
    const previous = tournament.verificationChecks?.at(-1);
    const currentCheck = { provider: body.provider, hash, checkedAt: now.toISOString() };
    tournament.verificationChecks = [...(tournament.verificationChecks || []), currentCheck].slice(-10);
    tournament.status = "verifying";
    await tournamentStore.save(tournament);

    if (!hasIndependentConfirmation(previous, currentCheck)) {
      return res.status(202).json({ tournament, message: "A matching result check from a second provider after 30 seconds is still required" });
    }

    const { winnersByEvent, eligibleEntries, winners, highScore, scoredEventCount } = scoreTournament(tournament.events, body.results, tournament.entries);
    if (!eligibleEntries.length || scoredEventCount === 0) {
      tournament.status = "settling";
      await tournamentStore.save(tournament);
      for (const entry of tournament.entries) {
        await recordWeparlayCashLedgerEntry({
          userId: entry.userId,
          referenceId: tournamentLedgerReference(tournament.id, entry.userId, "refund"),
          type: "refund",
          amount: tournament.entryFee,
          description: `Tournament refund for ${tournament.id}`,
          metadata: { tournamentId: tournament.id, currency: "weparlay_cash" },
        });
      }
      tournament.status = "refunded";
      tournament.chat = [];
      tournament.verified = true;
      tournament.settledAt = now.toISOString();
      tournament.settlementReason = !eligibleEntries.length
        ? "No funded entry submitted a complete prediction card"
        : "Every tournament event was cancelled, tied, or voided";
      tournament.resultHash = hash;
      tournament.resultProviders = [previous.provider, body.provider];
      tournament.settlementAudit = [...(tournament.settlementAudit || []), {
        action: "refunded",
        at: now.toISOString(),
        resultHash: hash,
        providers: tournament.resultProviders,
        reason: tournament.settlementReason,
        refundedUserIds: tournament.entries.map((entry: any) => entry.userId).sort(),
      }].slice(-20);
      await tournamentStore.save(tournament);
      return res.json({ tournament });
    }

    const payoutBreakdown = splitPot(tournament.pot, winners.map((winner: any) => winner.userId));
    tournament.status = "settling";
    await tournamentStore.save(tournament);
    for (const winner of winners) {
      await recordWeparlayCashLedgerEntry({
        userId: winner.userId,
        referenceId: tournamentLedgerReference(tournament.id, winner.userId, "payout"),
        type: "payout",
        amount: payoutBreakdown[winner.userId],
        description: `Tournament payout for ${tournament.id}`,
        metadata: { tournamentId: tournament.id, currency: "weparlay_cash" },
      });
      winner.status = "winner";
      winner.payout = payoutBreakdown[winner.userId];
    }
    tournament.events = tournament.events.map((event: any) => ({ ...event, result: body.results.find(result => result.eventId === event.id), winner: winnersByEvent.get(event.id) || "void" }));
    tournament.status = "paid";
    tournament.chat = [];
    tournament.verified = true;
    tournament.winnerIds = winners.map((winner: any) => winner.userId);
    tournament.highScore = highScore;
    tournament.payoutBreakdown = payoutBreakdown;
    tournament.payoutPerWinner = winners.length === 1 ? payoutBreakdown[winners[0].userId] : undefined;
    tournament.resultProvider = body.provider;
    tournament.resultProviders = [previous.provider, body.provider];
    tournament.resultHash = hash;
    tournament.settledAt = now.toISOString();
    tournament.settlementAudit = [...(tournament.settlementAudit || []), {
      action: "paid",
      at: now.toISOString(),
      resultHash: hash,
      providers: tournament.resultProviders,
      highScore,
      winnerIds: tournament.winnerIds,
      payoutBreakdown,
    }].slice(-20);
    await tournamentStore.save(tournament);
    res.json({ tournament });
  } catch (error: any) {
    res.status(400).json({ message: error?.issues?.[0]?.message || error.message });
  }
});

router.post("/:id/chat", isAuthenticated, async (req: any, res) => {
  try {
    const tournament = await tournamentStore.get(req.params.id);
    if (!tournament) return res.status(404).json({ message: "Tournament not found" });
    if (["paid", "refunded"].includes(tournament.status)) return res.status(410).json({ message: "This tournament chat has closed" });
    const message = z.string().trim().min(1).max(200).parse(req.body.message);
    tournament.chat.push({ id: Date.now(), userId: req.user?.claims?.sub, message, createdAt: new Date().toISOString() });
    tournament.chat = tournament.chat.slice(-200);
    await tournamentStore.save(tournament);
    res.json({ chat: tournament.chat });
  } catch (error: any) { res.status(400).json({ message: error.message }); }
});

export default router;
