import { and, desc, eq, gt, inArray, lt, ne, or, sql } from "drizzle-orm";
import { db } from "../db";
import { p2pActivity, p2pChallenges, p2pTransactions, users } from "@shared/schema";
import { assertP2pAmount, p2pMoney as money, validateP2pAcceptance, validateP2pSettlement } from "./p2pRules";

async function lockUser(tx: any, userId: string) {
  const [user] = await tx.select().from(users).where(eq(users.id, userId)).for("update");
  if (!user) throw new Error("User not found");
  return user;
}

async function changeBalance(tx: any, userId: string, amount: number, referenceId: string, type: string, description: string, metadata: { challengeId: string }) {
  const user = await lockUser(tx, userId);
  const before = money(user.weparlayCashBalance ?? 0);
  const after = money(before + amount);
  if (after < 0) throw new Error("Insufficient WeParlay Cash balance");

  await tx.update(users).set({ weparlayCashBalance: after, updatedAt: new Date() }).where(eq(users.id, userId));
  await tx.insert(p2pTransactions).values({
    challengeId: metadata.challengeId,
    userId,
    transactionType: type,
    amount,
    currency: "weparlay_cash",
    balanceBefore: before,
    balanceAfter: after,
    description,
  });
  await tx.execute(sql`
    INSERT INTO weparlay_cash_ledger
      (user_id, reference_id, type, amount, balance_before, balance_after, description, metadata)
    VALUES
      (${userId}, ${referenceId}, ${type}, ${amount}, ${before}, ${after}, ${description}, ${JSON.stringify(metadata)}::jsonb)
  `);
}

export async function createFundedP2pChallenge(input: any) {
  assertP2pAmount(input.betAmount);
  return db.transaction(async (tx) => {
    const { idempotencyKey, ...challengeInput } = input;
    const [challenge] = await tx.insert(p2pChallenges).values({
      ...challengeInput,
      id: idempotencyKey,
      totalPot: money(input.betAmount * 2),
      escrowHeld: input.betAmount,
      status: "open",
    }).onConflictDoNothing({ target: p2pChallenges.id }).returning();
    if (!challenge) {
      const [existing] = await tx.select().from(p2pChallenges).where(eq(p2pChallenges.id, idempotencyKey)).limit(1);
      if (!existing || existing.challengerId !== input.challengerId) throw new Error("Idempotency key is already in use");
      return existing;
    }
    await changeBalance(tx, input.challengerId, -input.betAmount, `p2p:${challenge.id}:deposit:${input.challengerId}`, "escrow_deposit", `P2P challenge ${challenge.id} escrow deposit`, { challengeId: challenge.id });
    return challenge;
  });
}

export async function acceptFundedP2pChallenge(challengeId: string, userId: string, pick: string) {
  return db.transaction(async (tx) => {
    const [challenge] = await tx.select().from(p2pChallenges).where(eq(p2pChallenges.id, challengeId)).for("update");
    if (!challenge) throw new Error("Challenge not found");
    validateP2pAcceptance(challenge, userId, pick);

    await changeBalance(tx, userId, -challenge.betAmount, `p2p:${challenge.id}:deposit:${userId}`, "escrow_deposit", `P2P challenge ${challenge.id} escrow deposit`, { challengeId });
    const [updated] = await tx.update(p2pChallenges).set({
      challengeeId: userId,
      challengeePick: pick,
      escrowHeld: money((challenge.escrowHeld ?? 0) + challenge.betAmount),
      status: "accepted",
      acceptedAt: new Date(),
      updatedAt: new Date(),
    }).where(and(eq(p2pChallenges.id, challengeId), eq(p2pChallenges.status, "open"))).returning();
    if (!updated) throw new Error("Challenge was accepted by another user");
    return updated;
  });
}

export async function cancelAndRefundP2pChallenge(challengeId: string, requesterId?: string, expired = false) {
  return db.transaction(async (tx) => {
    const [challenge] = await tx.select().from(p2pChallenges).where(eq(p2pChallenges.id, challengeId)).for("update");
    if (!challenge) throw new Error("Challenge not found");
    if (challenge.status === "cancelled" || challenge.status === "expired") return challenge;
    if (challenge.status !== "open") throw new Error("Only open challenges can be cancelled");
    if (requesterId && challenge.challengerId !== requesterId) throw new Error("Only the challenger can cancel this challenge");

    if ((challenge.escrowHeld ?? 0) > 0) {
      await changeBalance(tx, challenge.challengerId, challenge.betAmount, `p2p:${challenge.id}:refund:${challenge.challengerId}`, "refund", `P2P challenge ${challenge.id} refund`, { challengeId });
    }
    const [updated] = await tx.update(p2pChallenges).set({
      status: expired ? "expired" : "cancelled",
      escrowHeld: 0,
      settlementReason: expired ? "Join deadline expired without an opponent" : "Cancelled by challenger",
      settledAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(p2pChallenges.id, challengeId)).returning();
    return updated;
  });
}

export async function settleP2pChallenge(challengeId: string, winnerId: string, reason: string) {
  return db.transaction(async (tx) => {
    const [challenge] = await tx.select().from(p2pChallenges).where(eq(p2pChallenges.id, challengeId)).for("update");
    if (!challenge) throw new Error("Challenge not found");
    if (challenge.status === "settled" && challenge.winnerUserId === winnerId) return challenge;
    validateP2pSettlement(challenge, winnerId);

    await changeBalance(tx, winnerId, challenge.totalPot, `p2p:${challenge.id}:release:${winnerId}`, "escrow_release", `P2P challenge ${challenge.id} winnings`, { challengeId });
    const [updated] = await tx.update(p2pChallenges).set({ status: "settled", winnerUserId: winnerId, settlementReason: reason, escrowHeld: 0, settledAt: new Date(), updatedAt: new Date() }).where(eq(p2pChallenges.id, challengeId)).returning();
    return updated;
  });
}

export async function expireOpenP2pChallenges() {
  const expired = await db.select({ id: p2pChallenges.id }).from(p2pChallenges).where(and(eq(p2pChallenges.status, "open"), lt(p2pChallenges.expiresAt, new Date())));
  for (const item of expired) await cancelAndRefundP2pChallenge(item.id, undefined, true);
}

export const getP2pChallenge = async (id: string) => (await db.select().from(p2pChallenges).where(eq(p2pChallenges.id, id)).limit(1))[0];
export const getP2pActivity = (id: string) => db.select().from(p2pActivity).where(eq(p2pActivity.challengeId, id)).orderBy(p2pActivity.createdAt);
export const createP2pActivity = async (value: any) => (await db.insert(p2pActivity).values(value).returning())[0];

export async function getAvailableP2pChallenges(userId: string) {
  await expireOpenP2pChallenges();
  return db.select().from(p2pChallenges).where(and(eq(p2pChallenges.status, "open"), gt(p2pChallenges.expiresAt, new Date()), ne(p2pChallenges.challengerId, userId), or(eq(p2pChallenges.isPublic, true), eq(p2pChallenges.challengeeId, userId)))).orderBy(desc(p2pChallenges.createdAt));
}

export async function getUserP2pChallenges(userId: string) {
  await expireOpenP2pChallenges();
  return db.select().from(p2pChallenges).where(or(eq(p2pChallenges.challengerId, userId), eq(p2pChallenges.challengeeId, userId))).orderBy(desc(p2pChallenges.createdAt));
}

export async function getP2pStats(userId: string) {
  const challenges = await db.select().from(p2pChallenges).where(or(eq(p2pChallenges.challengerId, userId), eq(p2pChallenges.challengeeId, userId)));
  const settled = challenges.filter((c) => c.status === "settled");
  const won = settled.filter((c) => c.winnerUserId === userId);
  return { totalChallenges: challenges.length, wonChallenges: won.length, totalWinnings: money(won.reduce((sum, c) => sum + c.totalPot, 0)), winRate: settled.length ? won.length / settled.length : 0 };
}

export async function getP2pChallengeWithNames(id: string) {
  const challenge = await getP2pChallenge(id);
  if (!challenge) return undefined;
  const ids = [challenge.challengerId, challenge.challengeeId].filter(Boolean) as string[];
  const people = ids.length ? await db.select({ id: users.id, username: users.username, firstName: users.firstName }).from(users).where(inArray(users.id, ids)) : [];
  const name = (userId: string | null) => people.find((p) => p.id === userId)?.username || people.find((p) => p.id === userId)?.firstName || "Unknown";
  return { ...challenge, challengerUsername: name(challenge.challengerId), challengeeUsername: challenge.challengeeId ? name(challenge.challengeeId) : null };
}
