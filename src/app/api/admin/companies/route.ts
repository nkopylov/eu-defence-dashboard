import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { Company } from '@/app/types';

// Middleware to check if the user is authenticated
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const expectedApiKey = process.env.ADMIN_API_KEY || 'dev-admin-key';
  
  return !!authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] === expectedApiKey;
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    // Query to get all companies with their category information
    const query = `
      SELECT 
        c.id, 
        c.name, 
        c.ticker, 
        c.country, 
        c.products, 
        c.sector, 
        c.defense_potential as "defensePotential", 
        c.description,
        c.defense_uses as "defenseUses", 
        mc.name as category,
        cc.name as "categoryType",
        c.revenue, 
        c.market_cap as "marketCap", 
        c.eu_fund_focus as "euFundFocus"
      FROM companies c
      JOIN company_categories cc ON c.category_id = cc.id
      LEFT JOIN material_categories mc ON c.material_category_id = mc.id
      ORDER BY c.name ASC
    `;
    
    const companies = await db.queryWithPool<Company>(query);
    
    return NextResponse.json({
      success: true,
      companies
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.ticker || !body.country || !body.products || !body.categoryType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get category ID
    const categoryResult = await db.queryWithPool<{ id: number }>(
      'SELECT id FROM company_categories WHERE name = $1',
      [body.categoryType]
    );
    
    if (categoryResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid category type' },
        { status: 400 }
      );
    }
    
    const categoryId = categoryResult[0].id;
    
    // Get material category ID if applicable
    let materialCategoryId = null;
    if (body.category && body.categoryType === 'materials') {
      const materialCategoryResult = await db.queryWithPool<{ id: number }>(
        'SELECT id FROM material_categories WHERE name = $1',
        [body.category]
      );
      
      if (materialCategoryResult.length > 0) {
        materialCategoryId = materialCategoryResult[0].id;
      }
    }
    
    // Insert the company
    await db.queryWithPool(
      `INSERT INTO companies (
         name, ticker, country, products, sector, 
         defense_potential, description, category_id, 
         material_category_id, defense_uses,
         revenue, market_cap, eu_fund_focus
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (ticker) DO UPDATE
       SET
         name = $1,
         country = $3,
         products = $4,
         sector = $5,
         defense_potential = $6,
         description = $7,
         category_id = $8,
         material_category_id = $9,
         defense_uses = $10,
         revenue = $11,
         market_cap = $12,
         eu_fund_focus = $13
      `,
      [
        body.name,
        body.ticker,
        body.country,
        body.products,
        body.sector || null,
        body.defensePotential || null,
        body.description || null,
        categoryId,
        materialCategoryId,
        body.defenseUses || null,
        body.revenue || null,
        body.marketCap || null,
        body.euFundFocus || false
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Company created/updated successfully'
    });
  } catch (error) {
    console.error('Error creating company:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to create company' },
      { status: 500 }
    );
  }
}