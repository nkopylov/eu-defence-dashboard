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
 * Seed the database with initial data
 */
export async function seedCompaniesFromStaticData() {
  try {
    // Get category IDs
    const defenseCategory = await db.queryWithPool<{ id: number }>(
      'SELECT id FROM company_categories WHERE name = $1', 
      ['defense']
    );
    
    const potentialCategory = await db.queryWithPool<{ id: number }>(
      'SELECT id FROM company_categories WHERE name = $1', 
      ['potential']
    );
    
    const materialsCategory = await db.queryWithPool<{ id: number }>(
      'SELECT id FROM company_categories WHERE name = $1', 
      ['materials']
    );
    
    // Get material category IDs
    const materialCategoryMap = await db.queryWithPool<{ id: number, name: string }>(
      'SELECT id, name FROM material_categories'
    );
    
    const materialCategoryIds = materialCategoryMap.reduce((acc, category) => {
      acc[category.name] = category.id;
      return acc;
    }, {} as Record<string, number>);
    
    // Import company data from static files
    // We'll dynamically import these in the future, but for now we'll 
    // assume these imports would be coming from existing data
    const { companies } = await import('../data/companies');
    const { potentialDefenceCompanies } = await import('../data/potentialCompanies');
    const { materialCompanies } = await import('../data/materialCompanies');
    
    // Insert companies
    await Promise.all(companies.map(company => {
      return db.queryWithPool(
        `INSERT INTO companies 
         (name, ticker, country, products, category_id, revenue, market_cap, eu_fund_focus)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (ticker) DO UPDATE
         SET name = $1, country = $3, products = $4, category_id = $5, 
             revenue = $6, market_cap = $7, eu_fund_focus = $8`,
        [
          company.name,
          company.ticker,
          company.country,
          company.products,
          defenseCategory[0].id,
          company.revenue || null,
          company.marketCap || null,
          company.euFundFocus || false
        ]
      );
    }));
    
    // Insert potential defense companies
    await Promise.all(potentialDefenceCompanies.map(company => {
      return db.queryWithPool(
        `INSERT INTO companies 
         (name, ticker, country, products, sector, defense_potential, category_id, revenue, market_cap, eu_fund_focus)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (ticker) DO UPDATE
         SET name = $1, country = $3, products = $4, sector = $5, defense_potential = $6, category_id = $7,
             revenue = $8, market_cap = $9, eu_fund_focus = $10`,
        [
          company.name,
          company.ticker,
          company.country,
          company.products,
          company.sector || null,
          company.defensePotential || null,
          potentialCategory[0].id,
          company.revenue || null,
          company.marketCap || null,
          company.euFundFocus || false
        ]
      );
    }));
    
    // Insert material companies
    await Promise.all(materialCompanies.map(company => {
      return db.queryWithPool(
        `INSERT INTO companies 
         (name, ticker, country, products, category_id, material_category_id, defense_uses, revenue, market_cap, eu_fund_focus)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (ticker) DO UPDATE
         SET name = $1, country = $3, products = $4, category_id = $5, 
             material_category_id = $6, defense_uses = $7, revenue = $8, market_cap = $9, eu_fund_focus = $10`,
        [
          company.name,
          company.ticker,
          company.country,
          company.products,
          materialsCategory[0].id,
          materialCategoryIds[company.category || ''] || null,
          company.defenseUses || null,
          company.revenue || null,
          company.marketCap || null,
          company.euFundFocus || false
        ]
      );
    }));
    
    console.log('🟢 Database seeded with company data successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    return { success: false, error };
  }
}

/**
 * Initialize and seed the database
 */
export async function setupDatabase() {
  const initResult = await initializeDatabase();
  if (!initResult.success) {
    throw new Error('Failed to initialize database');
  }
  
  const seedResult = await seedCompaniesFromStaticData();
  if (!seedResult.success) {
    throw new Error('Failed to seed database');
  }
  
  return { success: true };
}