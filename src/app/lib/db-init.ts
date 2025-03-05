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
    
    console.log('🔵 Database schema initialized successfully');
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