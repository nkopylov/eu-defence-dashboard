import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

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
    // Query to get all company categories
    const companyCategories = await db.queryWithPool(
      'SELECT id, name FROM company_categories ORDER BY name'
    );
    
    // Query to get all material categories
    const materialCategories = await db.queryWithPool(
      'SELECT id, name FROM material_categories ORDER BY name'
    );
    
    return NextResponse.json({
      success: true,
      companyCategories,
      materialCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
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
    if (!body.name || !body.type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    let result;
    
    // Check the type to determine which table to insert into
    if (body.type === 'company') {
      // Check if category already exists
      const existingCategory = await db.queryWithPool(
        'SELECT id FROM company_categories WHERE name = $1',
        [body.name]
      );
      
      if (existingCategory.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Company category already exists' },
          { status: 400 }
        );
      }
      
      // Insert the company category
      result = await db.queryWithPool(
        'INSERT INTO company_categories (name) VALUES ($1) RETURNING id',
        [body.name]
      );
    } else if (body.type === 'material') {
      // Check if category already exists
      const existingCategory = await db.queryWithPool(
        'SELECT id FROM material_categories WHERE name = $1',
        [body.name]
      );
      
      if (existingCategory.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Material category already exists' },
          { status: 400 }
        );
      }
      
      // Insert the material category
      result = await db.queryWithPool(
        'INSERT INTO material_categories (name) VALUES ($1) RETURNING id',
        [body.name]
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid category type' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      id: result[0].id,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}