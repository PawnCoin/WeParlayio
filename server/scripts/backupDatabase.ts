import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
const tables = ["users", "weparlay_cash_ledger", "p2p_challenges", "p2p_transactions", "p2p_activity", "p2p_disputes", "daily_tournament_states", "support_tickets", "support_ticket_messages", "support_ticket_logs", "notifications"];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  const directory = process.env.WEPARLAY_BACKUP_DIR;
  if (!directory) throw new Error("Set WEPARLAY_BACKUP_DIR to a private persistent backup directory before running this command");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const snapshot: Record<string, unknown[]> = { exportedAt: [new Date().toISOString()], formatVersion: ["1"] };
    for (const table of tables) snapshot[table] = (await pool.query(`SELECT row_to_json(t) AS row FROM ${table} t`)).rows.map(row => row.row);
    const body = JSON.stringify(snapshot);
    const filename = `weparlay-postgres-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    await mkdir(resolve(directory), { recursive: true });
    await writeFile(join(resolve(directory), filename), body, { mode: 0o600 });
    console.log(JSON.stringify({ ok: true, file: filename, sha256: createHash("sha256").update(body).digest("hex"), tables: tables.length }));
  } finally { await pool.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
