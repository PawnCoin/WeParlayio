import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL is available, but don't throw error if not
// We'll use in-memory storage when database is not available
let pool: Pool | null = null;
let db: any = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    console.log("Database connection established successfully");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    console.log("Falling back to in-memory storage");
  }
} else {
  console.log("No DATABASE_URL found, using in-memory storage");
}

export { pool, db };
