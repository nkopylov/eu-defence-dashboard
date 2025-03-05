import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

// Middleware to check if the user is authenticated
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const expectedApiKey = process.env.ADMIN_API_KEY || 'dev-admin-key';
  
  return !!authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] === expectedApiKey;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }
    
    // Delete the dependency
    const result = await db.queryWithPool(
      'DELETE FROM dependencies WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dependency not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Dependency deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dependency:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete dependency' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }
    
    // Get dependency details
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
      WHERE d.id = $1
    `;
    
    const result = await db.queryWithPool(query, [id]);
    
    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dependency not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      dependency: result[0]
    });
  } catch (error) {
    console.error('Error fetching dependency:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dependency' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.description || body.value === undefined) {
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
    
    // Update the dependency
    const result = await db.queryWithPool(
      `UPDATE dependencies
       SET description = $1, value = $2
       WHERE id = $3
       RETURNING id`,
      [body.description, body.value, id]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dependency not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Dependency updated successfully'
    });
  } catch (error) {
    console.error('Error updating dependency:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to update dependency' },
      { status: 500 }
    );
  }
}