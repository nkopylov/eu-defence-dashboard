import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { NetworkLink } from '@/app/types';

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
    // Query to get all dependencies with company names
    const query = `
      SELECT 
        d.id,
        d.source_ticker as source,
        d.target_ticker as target,
        d.description,
        d.value,
        s.name as source_name,
        t.name as target_name
      FROM dependencies d
      JOIN companies s ON d.source_ticker = s.ticker
      JOIN companies t ON d.target_ticker = t.ticker
      ORDER BY s.name, t.name
    `;
    
    const dependencies = await db.queryWithPool<NetworkLink & { id: number, source_name: string, target_name: string }>(query);
    
    return NextResponse.json({
      success: true,
      dependencies
    });
  } catch (error) {
    console.error('Error fetching dependencies:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dependencies' },
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
    if (!body.source || !body.target || !body.description || body.value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate value is between 1 and 10
    if (body.value < 1 || body.value > 10) {
      return NextResponse.json(
        { success: false, error: 'Value must be between 1 and 10' },
        { status: 400 }
      );
    }
    
    // Check if companies exist
    const sourceCompanyResult = await db.queryWithPool<{ count: number }>(
      'SELECT COUNT(*) as count FROM companies WHERE ticker = $1',
      [body.source]
    );
    
    const targetCompanyResult = await db.queryWithPool<{ count: number }>(
      'SELECT COUNT(*) as count FROM companies WHERE ticker = $1',
      [body.target]
    );
    
    if (sourceCompanyResult[0].count === 0) {
      return NextResponse.json(
        { success: false, error: 'Source company does not exist' },
        { status: 400 }
      );
    }
    
    if (targetCompanyResult[0].count === 0) {
      return NextResponse.json(
        { success: false, error: 'Target company does not exist' },
        { status: 400 }
      );
    }
    
    // Check if dependency already exists
    const existingDependencyResult = await db.queryWithPool<{ count: number }>(
      'SELECT COUNT(*) as count FROM dependencies WHERE source_ticker = $1 AND target_ticker = $2',
      [body.source, body.target]
    );
    
    if (existingDependencyResult[0].count > 0) {
      // Update existing dependency
      await db.queryWithPool(
        `UPDATE dependencies
         SET description = $1, value = $2
         WHERE source_ticker = $3 AND target_ticker = $4`,
        [body.description, body.value, body.source, body.target]
      );
    } else {
      // Insert new dependency
      await db.queryWithPool(
        `INSERT INTO dependencies (source_ticker, target_ticker, description, value)
         VALUES ($1, $2, $3, $4)`,
        [body.source, body.target, body.description, body.value]
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Dependency created/updated successfully'
    });
  } catch (error) {
    console.error('Error creating dependency:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to create dependency' },
      { status: 500 }
    );
  }
}