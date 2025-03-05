import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

// Middleware to check if the user is authenticated
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const expectedApiKey = process.env.ADMIN_API_KEY || 'dev-admin-key';
  
  return !!authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] === expectedApiKey;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const ticker = params.ticker;
    
    // Query to get the company with its category information
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
      WHERE c.ticker = $1
    `;
    
    const result = await db.queryWithPool(query, [ticker]);
    
    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      company: result[0]
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const ticker = params.ticker;
    
    // First check if there are any dependencies using this company
    const dependenciesQuery = `
      SELECT COUNT(*) as count
      FROM dependencies
      WHERE source_ticker = $1 OR target_ticker = $1
    `;
    
    const dependenciesResult = await db.queryWithPool<{ count: number }>(dependenciesQuery, [ticker]);
    
    if (dependenciesResult[0].count > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete company with dependencies. Please remove dependencies first.' 
        },
        { status: 400 }
      );
    }
    
    // Delete the company
    await db.queryWithPool('DELETE FROM companies WHERE ticker = $1', [ticker]);
    
    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const ticker = params.ticker;
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.country || !body.products || !body.categoryType) {
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
    
    // Update the company
    await db.queryWithPool(
      `UPDATE companies
       SET
         name = $1,
         country = $2,
         products = $3,
         sector = $4,
         defense_potential = $5,
         description = $6,
         category_id = $7,
         material_category_id = $8,
         defense_uses = $9,
         revenue = $10,
         market_cap = $11,
         eu_fund_focus = $12
       WHERE ticker = $13
      `,
      [
        body.name,
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
        body.euFundFocus || false,
        ticker
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Company updated successfully'
    });
  } catch (error) {
    console.error('Error updating company:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to update company' },
      { status: 500 }
    );
  }
}