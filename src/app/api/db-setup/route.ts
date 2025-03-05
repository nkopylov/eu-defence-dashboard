import { NextRequest, NextResponse } from 'next/server';
import { setupDatabase } from '@/app/lib/db-init';

export async function POST(request: NextRequest) {
  // Add basic protection - in production you would use proper authentication
  const authHeader = request.headers.get('authorization');
  const expectedApiKey = process.env.ADMIN_API_KEY || 'dev-api-key';
  
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== expectedApiKey) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const result = await setupDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized and seeded successfully'
    });
  } catch (error) {
    console.error('Error in database setup:', error);
    
    return NextResponse.json(
      { error: 'Failed to initialize database', details: (error as Error).message },
      { status: 500 }
    );
  }
}