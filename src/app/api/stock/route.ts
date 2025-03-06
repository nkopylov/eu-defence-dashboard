import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

// Main GET handler that routes to appropriate function
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticker = searchParams.get('ticker');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const isToday = searchParams.get('isToday') === 'true';

  if (!ticker || !startDate || !endDate) {
    return NextResponse.json(
      { error: 'Missing required parameters: ticker, startDate, or endDate' },
      { status: 400 }
    );
  }

  try {
    let formattedResult;
    
    if (isToday) {
      formattedResult = await fetchTodayData(ticker);
    } else {
      formattedResult = await fetchHistoricalData(ticker, startDate, endDate);
    }
    
    return NextResponse.json({ success: true, data: formattedResult });
  } catch (error) {
    console.error(`Error fetching stock data for ${ticker}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch stock data for ${ticker}`, details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Function to fetch today's data (intraday if available, otherwise empty array)
async function fetchTodayData(ticker: string) {
  
  // Define the type for our stock data
  interface IntradayDataPoint {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    adjClose: number;
    isIntraday: boolean;
  }
  
  // Default to empty result with proper typing
  let formattedResult: IntradayDataPoint[] = [];
  
  // Get today's date using UTC to avoid timezone issues
  // This ensures we get the correct date regardless of server timezone
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  try {
    const chartResult = await yahooFinance.chart(ticker, {
      period1: todayStr,
      interval: '15m',
    });
    
    if (chartResult && chartResult.quotes && chartResult.quotes.length > 0) {
      const processedQuotes = chartResult.quotes
        .filter((item: any) => item.date && !isNaN(item.date))
        .map((item: any) => {
          try {
            return {
              date: new Date(item.date),
              open: typeof item.open === 'number' ? item.open : 0,
              high: typeof item.high === 'number' ? item.high : 0,
              low: typeof item.low === 'number' ? item.low : 0,
              close: typeof item.close === 'number' ? item.close : 0,
              volume: typeof item.volume === 'number' ? item.volume : 0,
              adjClose: typeof item.close === 'number' ? item.close : 0
            };
          } catch (err) {
            console.error("Error processing quote:", err);
            return null;
          }
        })
        .filter(item => item !== null);
      
      // If we have any intraday data, use it
      if (processedQuotes.length > 0) {
        formattedResult = processedQuotes.map(item => ({
          date: item.date.toISOString(),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          adjClose: item.adjClose,
          isIntraday: true
        }));
      }
    }
  } catch (chartError) {
    console.error(`Could not get real intraday data:`, chartError);
  }
  
  return formattedResult;
}

// Function to fetch historical data
async function fetchHistoricalData(ticker: string, startDate: string, endDate: string) {
  // For historical data, use the historical API with daily intervals
  const result = await yahooFinance.historical(ticker, {
    period1: startDate,
    period2: endDate,
    interval: '1d',
  });
  
  if (!result || !Array.isArray(result) || result.length === 0) {
    throw new Error('No historical data returned from Yahoo Finance API');
  }
  
  // Format the historical data
  return result.map((item: any) => ({
    ...item,
    date: item.date.toISOString().split('T')[0]
  }));
}