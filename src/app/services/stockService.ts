import { StockData, DateRange } from "../types";

// Function to generate random stock data as fallback
function generateMockStockData(ticker: string, dateRange: DateRange): StockData[] {
  const data: StockData[] = [];
  const days = Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Base price depends on ticker to make different companies have different price ranges
  const basePrice = ticker.charCodeAt(0) + ticker.charCodeAt(ticker.length - 1);
  let lastClose = basePrice + Math.random() * 50;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(dateRange.startDate);
    date.setDate(date.getDate() + i);
    
    // Create some random movement but with a trend
    const change = (Math.random() - 0.5) * 5;
    const percentChange = 1 + (change / 100);
    
    lastClose = lastClose * percentChange;
    const open = lastClose * (1 + (Math.random() - 0.5) * 0.01);
    const high = Math.max(open, lastClose) * (1 + Math.random() * 0.02);
    const low = Math.min(open, lastClose) * (1 - Math.random() * 0.02);
    
    data.push({
      date,
      open,
      high,
      low,
      close: lastClose,
      volume: Math.floor(Math.random() * 1000000) + 500000,
    });
  }
  
  return data;
}

export async function getStockData(ticker: string, dateRange: DateRange): Promise<StockData[]> {
  // Log the date range change to confirm the function is being called
  console.log(`Fetching data for ${ticker} from ${dateRange.startDate.toLocaleDateString()} to ${dateRange.endDate.toLocaleDateString()}`);
  
  try {
    // Call our Next.js API route which safely handles the Yahoo Finance API
    const startDateStr = dateRange.startDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const endDateStr = dateRange.endDate.toISOString().split('T')[0];
    
    // Append isToday flag if in today mode
    const isTodayParam = dateRange.isToday ? `&isToday=true` : '';
    
    const response = await fetch(`/api/stock?ticker=${ticker}&startDate=${startDateStr}&endDate=${endDateStr}${isTodayParam}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success || !Array.isArray(result.data) || result.data.length === 0) {
      throw new Error('No data returned from stock API');
    }
    
    // Transform Yahoo Finance data to our StockData format
    const stockData: StockData[] = result.data.map((item: any) => {
      // Create a proper date object from the date string or date object
      const dateObj = typeof item.date === 'string' 
        ? new Date(item.date) // Use full ISO string for today mode
        : new Date(item.date);
        
      return {
        date: dateObj,
        open: Number(item.open),
        high: Number(item.high),
        low: Number(item.low),
        close: Number(item.close),
        volume: Number(item.volume),
      };
    });
    
    console.log(`Retrieved ${stockData.length} data points for ${ticker} from Yahoo Finance API`);
    return stockData;
  } catch (error) {
    console.error(`Error fetching stock data for ${ticker}:`, error);
    console.warn('Falling back to mock data');
    
    // Fallback to mock data if API call fails
    const mockData = generateMockStockData(ticker, dateRange);
    return mockData;
  }
}