import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { dailyTournamentStates } from "@shared/schema";

export type DailyTournamentState = Record<string, any> & {
  id: string;
  day: string;
  status: string;
  lockAt: string;
  settleAfter: string;
};

class DailyTournamentRepository {
  async listForDay(day: string): Promise<DailyTournamentState[]> {
    const rows = await db.select({ state: dailyTournamentStates.state })
      .from(dailyTournamentStates)
      .where(eq(dailyTournamentStates.day, day))
      .orderBy(desc(dailyTournamentStates.createdAt));
    return rows.map(row => row.state as DailyTournamentState);
  }

  async get(id: string): Promise<DailyTournamentState | undefined> {
    const [row] = await db.select({ state: dailyTournamentStates.state })
      .from(dailyTournamentStates)
      .where(eq(dailyTournamentStates.id, id))
      .limit(1);
    return row?.state as DailyTournamentState | undefined;
  }

  async save(tournament: DailyTournamentState): Promise<void> {
    const record = {
      id: tournament.id,
      day: tournament.day,
      status: tournament.status,
      state: tournament,
      lockAt: new Date(tournament.lockAt),
      settleAfter: new Date(tournament.settleAfter),
      updatedAt: new Date(),
    };
    await db.insert(dailyTournamentStates)
      .values(record)
      .onConflictDoUpdate({
        target: dailyTournamentStates.id,
        set: {
          day: record.day,
          status: record.status,
          state: record.state,
          lockAt: record.lockAt,
          settleAfter: record.settleAfter,
          updatedAt: record.updatedAt,
        },
      });
  }
}

export const dailyTournamentRepository = new DailyTournamentRepository();
