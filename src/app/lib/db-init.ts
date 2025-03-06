import fs from 'fs';
import path from 'path';
import { db } from './db';

/**
 * Initialize the database schema
 */
export async function initializeDatabase() {
  try {
    // Read the schema SQL file
    const schemaPath = path.join(process.cwd(), 'src/app/lib/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema SQL
    await db.queryWithPool(schemaSql);
    
    // Check if the dependencies table has the correct columns
    try {
      // Try to query the dependencies table
      await db.queryWithPool('SELECT source_ticker, target_ticker FROM dependencies LIMIT 1');
    } catch {
      // If there's an error, the table might have old structure or not exist at all
      
      // Drop and recreate the table with correct structure
      await db.queryWithPool(`
        DROP TABLE IF EXISTS dependencies CASCADE;
        
        CREATE TABLE IF NOT EXISTS dependencies (
          id SERIAL PRIMARY KEY,
          source_ticker VARCHAR(50) NOT NULL REFERENCES companies(ticker),
          target_ticker VARCHAR(50) NOT NULL REFERENCES companies(ticker),
          description TEXT NOT NULL,
          value INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (source_ticker, target_ticker)
        );
        
        CREATE TRIGGER update_dependencies_timestamp BEFORE UPDATE ON dependencies
        FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
      `);
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error);
    return { success: false, error };
  }
}

/**
 * Initialize the database
 */
export async function setupDatabase() {
  const initResult = await initializeDatabase();
  if (!initResult.success) {
    throw new Error('Failed to initialize database');
  }
  
  return { success: true };
}