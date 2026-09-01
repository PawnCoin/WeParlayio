import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, weparlayCashLedger } from "@shared/schema";

export type WeparlayCashLedgerEntryInput = {
  userId: string;
  referenceId: string;
  type: string;
  amount: number;
  description: string;
  metadata?: Record<string, unknown>;
};

export async function recordWeparlayCashLedgerEntry(
  input: WeparlayCashLedgerEntryInput,
): Promise<string> {
  if (!Number.isFinite(input.amount) || input.amount === 0) {
    throw new Error("Ledger amount must be a non-zero finite number");
  }

  return db.transaction(async (tx) => {
    const [user] = await tx
      .select({
        id: users.id,
        balance: users.weparlayCashBalance,
      })
      .from(users)
      .where(eq(users.id, input.userId))
      .for("update");

    if (!user) {
      throw new Error("User not found");
    }

    const [existingEntry] = await tx
      .select({
        id: weparlayCashLedger.id,
        userId: weparlayCashLedger.userId,
        type: weparlayCashLedger.type,
        amount: weparlayCashLedger.amount,
      })
      .from(weparlayCashLedger)
      .where(eq(weparlayCashLedger.referenceId, input.referenceId))
      .limit(1);

    if (existingEntry) {
      if (
        existingEntry.userId !== input.userId ||
        existingEntry.type !== input.type ||
        existingEntry.amount !== input.amount
      ) {
        throw new Error("Ledger reference already exists with different entry details");
      }
      return existingEntry.id;
    }

    const balanceBefore = user.balance ?? 0;
    const balanceAfter = balanceBefore + input.amount;
    if (balanceAfter < 0) {
      throw new Error("Insufficient WeParlay Cash");
    }

    const [entry] = await tx
      .insert(weparlayCashLedger)
      .values({
        userId: input.userId,
        referenceId: input.referenceId,
        type: input.type,
        amount: input.amount,
        balanceBefore,
        balanceAfter,
        description: input.description,
        metadata: input.metadata,
      })
      .returning({ id: weparlayCashLedger.id });

    await tx
      .update(users)
      .set({
        weparlayCashBalance: balanceAfter,
        updatedAt: new Date(),
      })
      .where(eq(users.id, input.userId));

    return entry.id;
  });
}