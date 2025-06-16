import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for serverless environment with better error handling
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;
neonConfig.poolQueryViaFetch = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Initialize pool with retry logic
let pool: Pool;
let db: ReturnType<typeof drizzle>;

async function initializeDatabase() {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000,
      });

      // Test the connection
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();

      db = drizzle({ client: pool, schema });
      console.log('✅ Database connection established successfully');
      break;
    } catch (error) {
      retries++;
      console.error(`Database connection attempt ${retries} failed:`, error);
      
      if (retries >= maxRetries) {
        console.error('❌ Failed to connect to database after multiple attempts');
        // Create a mock pool for development to prevent app crash
        pool = new Pool({ 
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
          max: 1,
        });
        db = drizzle({ client: pool, schema });
        break;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * retries));
    }
  }
}

// Initialize database connection
initializeDatabase().catch(console.error);

// Export with proper error handling
export { pool, db };

// Export initialization function for use in server startup
export { initializeDatabase };