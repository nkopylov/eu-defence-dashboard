import { NextRequest, NextResponse } from 'next/server';
import { getCompanyByTicker } from '@/app/lib/companies-repository';

/**
 * GET /api/companies/[ticker]
 * Get a single company by ticker
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker;
  
  try {
    const company = await getCompanyByTicker(ticker);
    
    if (!company) {
      return NextResponse.json(
        { error: `Company with ticker '${ticker}' not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error(`Error fetching company ${ticker}:`, error);
    
    return NextResponse.json(
      { error: 'Failed to fetch company', details: (error as Error).message },
      { status: 500 }
    );
  }
}