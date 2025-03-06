import { getDependencyNetwork } from '@/app/lib/companies-repository';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const network = await getDependencyNetwork();
    
    return NextResponse.json({
      success: true,
      network
    });
  } catch (error) {
    console.error('Error fetching network data:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch network data' },
      { status: 500 }
    );
  }
}