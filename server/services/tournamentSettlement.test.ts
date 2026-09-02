import assert from "node:assert/strict";
import test from "node:test";
import { hasIndependentConfirmation, scoreTournament, splitPot, validateTournamentResults } from "./tournamentSettlement";

const events = [
  { id: "a", homeTeam: "A", awayTeam: "B" },
  { id: "c", homeTeam: "C", awayTeam: "D" },
];

test("rejects duplicate results that omit an event", () => {
  assert.throws(() => validateTournamentResults(events, [
    { eventId: "a", status: "completed", homeScore: 1, awayScore: 0 },
    { eventId: "a", status: "completed", homeScore: 1, awayScore: 0 },
  ]), /single final result/);
});

test("voids tied and cancelled events while scoring completed events", () => {
  const entries = [
    { userId: "one", funded: true, status: "submitted", picks: { a: "A", c: "C" } },
    { userId: "two", funded: true, status: "submitted", picks: { a: "B", c: "D" } },
  ];
  const scored = scoreTournament(events, [
    { eventId: "a", status: "completed", homeScore: 2, awayScore: 1 },
    { eventId: "c", status: "cancelled" },
  ], entries);
  assert.equal(scored.scoredEventCount, 1);
  assert.deepEqual(scored.winners.map(winner => winner.userId), ["one"]);
  assert.equal(entries[0].wins, 1);
  assert.equal(entries[1].wins, 0);
});

test("split payouts always add back to the exact cent-valued pot", () => {
  const payouts = splitPot(100, ["c", "a", "b"]);
  assert.deepEqual(payouts, { a: 33.34, b: 33.33, c: 33.33 });
  assert.equal(Object.values(payouts).reduce((sum, amount) => sum + amount, 0), 100);
});

test("requires matching checks from distinct providers after the hold", () => {
  const previous = { provider: "ESPN", hash: "same", checkedAt: "2026-09-01T23:59:00.000Z" };
  assert.equal(hasIndependentConfirmation(previous, { provider: "ESPN", hash: "same", checkedAt: "2026-09-01T23:59:31.000Z" }), false);
  assert.equal(hasIndependentConfirmation(previous, { provider: "Official League", hash: "same", checkedAt: "2026-09-01T23:59:31.000Z" }), true);
});
