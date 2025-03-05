import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticker = searchParams.get('ticker');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!ticker || !startDate || !endDate) {
    return NextResponse.json(
      { error: 'Missing required parameters: ticker, startDate, or endDate' },
      { status: 400 }
    );
  }

  try {
    const result = await yahooFinance.historical(ticker, {
      period1: startDate, // Format should be YYYY-MM-DD
      period2: endDate,
      interval: '1d', // Daily data
    });

    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('No data returned from Yahoo Finance API');
    }

    // Ensure consistent date format for all results
    const formattedResult = result.map((item: any) => ({
      ...item,
      date: item.date.toISOString().split('T')[0] // Format as YYYY-MM-DD string
    }));
    
    return NextResponse.json({ success: true, data: formattedResult });
  } catch (error) {
    console.error(`Error fetching stock data for ${ticker}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch stock data for ${ticker}`, details: (error as Error).message },
      { status: 500 }
    );
  }
}