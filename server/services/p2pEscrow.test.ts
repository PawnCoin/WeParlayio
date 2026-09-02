import assert from "node:assert/strict";
import test from "node:test";
import { p2pMoney, validateP2pAcceptance, validateP2pSettlement } from "./p2pRules";

const openChallenge = {
  status: "open",
  expiresAt: new Date("2030-01-01T00:00:00Z"),
  challengerId: "creator",
  challengeeId: null,
  challengerPick: "Lakers",
  isPublic: true,
  allowedFriends: null,
};

test("acceptance rejects self-acceptance, expiry, and identical outcomes", () => {
  assert.throws(() => validateP2pAcceptance(openChallenge, "creator", "Celtics", new Date("2029-01-01")), /own challenge/);
  assert.throws(() => validateP2pAcceptance(openChallenge, "opponent", "Lakers", new Date("2029-01-01")), /opposing outcome/);
  assert.throws(() => validateP2pAcceptance(openChallenge, "opponent", "Celtics", new Date("2031-01-01")), /expired/);
});

test("direct and friends-only private access is enforced", () => {
  const direct = { ...openChallenge, isPublic: false, challengeeId: "invited", allowedFriends: [] };
  assert.doesNotThrow(() => validateP2pAcceptance(direct, "invited", "Celtics", new Date("2029-01-01")));
  assert.throws(() => validateP2pAcceptance(direct, "stranger", "Celtics", new Date("2029-01-01")), /not for you/);
  const friends = { ...openChallenge, isPublic: false, allowedFriends: ["friend"] };
  assert.doesNotThrow(() => validateP2pAcceptance(friends, "friend", "Celtics", new Date("2029-01-01")));
  assert.throws(() => validateP2pAcceptance(friends, "stranger", "Celtics", new Date("2029-01-01")), /not allowed/);
});

test("settlement requires a participant and a fully funded pot", () => {
  const accepted = { status: "accepted", challengerId: "creator", challengeeId: "opponent", escrowHeld: 20, totalPot: 20 };
  assert.doesNotThrow(() => validateP2pSettlement(accepted, "creator"));
  assert.throws(() => validateP2pSettlement(accepted, "stranger"), /participant/);
  assert.throws(() => validateP2pSettlement({ ...accepted, escrowHeld: 10 }, "creator"), /fully funded/);
});

test("currency calculations are normalized to cents", () => {
  assert.equal(p2pMoney(0.1 + 0.2), 0.3);
  assert.equal(p2pMoney(19.999), 20);
});
