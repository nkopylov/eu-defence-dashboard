import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from 'pg';

// Configure Neon to use WebSockets for serverless environments
neonConfig.webSocketConstructor = globalThis.WebSocket;
neonConfig.fetchConnectionCache = true;

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL as string;

// Set up the SQL executor for serverless environments
export const sql = neon(databaseUrl);

// Optional: Set up a connection pool for server components
// This is useful for transactions and more complex database operations
let pool: Pool | undefined;

if (process.env.NODE_ENV === 'production') {
  // In production, use the pooled connection (Neon has connection pooling built-in)
  pool = new Pool({
    connectionString: databaseUrl,
  });
} else {
  // In development, use the unpooled connection for more reliable local development
  // If DATABASE_URL_UNPOOLED is not set, fall back to DATABASE_URL
  const devConnectionString = process.env.DATABASE_URL_UNPOOLED || databaseUrl;
  pool = new Pool({
    connectionString: devConnectionString,
  });
}

export const db = {
  // Basic query function using the SQL tag
  query: sql,

  // More advanced query function with the connection pool for complex operations
  async queryWithPool<T>(
    text: string, 
    params: any[] = []
  ): Promise<T[]> {
    const client = await pool!.connect();
    try {
      const result = await client.query(text, params);
      return result.rows as T[];
    } finally {
      client.release();
    }
  },

  // Transaction helper
  async transaction<T>(
    callback: (client: any) => Promise<T>
  ): Promise<T> {
    const client = await pool!.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
};