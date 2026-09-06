import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const requiredTables = [
  "users", "weparlay_cash_ledger", "p2p_challenges", "p2p_transactions", "p2p_activity", "p2p_disputes",
  "daily_tournament_states", "support_tickets", "support_ticket_messages", "support_ticket_logs", "notifications",
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query("SELECT 1");
    const result = await pool.query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1)", [requiredTables],
    );
    const found = new Set(result.rows.map(row => row.table_name));
    const missing = requiredTables.filter(table => !found.has(table));
    if (missing.length) throw new Error(`Missing required tables: ${missing.join(", ")}. Run npm run db:migrate.`);
    console.log(JSON.stringify({ ok: true, database: "reachable", tables: requiredTables.length }));
  } finally {
    await pool.end();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
