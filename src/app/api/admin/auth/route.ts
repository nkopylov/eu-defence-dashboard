import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');
  
  // Extract the Bearer token from the header
  const headerKey = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  
  // The expected API key should be in an environment variable
  // For development, we'll use a hardcoded value
  const expectedApiKey = process.env.ADMIN_API_KEY || 'dev-admin-key';
  
  // Check if the header key is valid
  if (headerKey === expectedApiKey) {
    return NextResponse.json({
      success: true,
      message: 'Authorization successful'
    });
  }

  return NextResponse.json(
    { 
      success: false, 
      error: 'Unauthorized',
      headerKeyProvided: !!headerKey,
      expectedKeyLength: expectedApiKey.length
    },
    { status: 401 }
  );
}