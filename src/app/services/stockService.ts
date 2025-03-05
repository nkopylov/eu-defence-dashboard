import { StockData, DateRange } from "../types";

// Function to generate random stock data for development
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
    // For development, use mock data instead of actual API calls
    // In a production app, you would implement a server-side API route
    // to handle the Yahoo Finance API calls safely
    const mockData = generateMockStockData(ticker, dateRange);
    console.log(`Generated ${mockData.length} data points for ${ticker}`);
    
    return mockData;
  } catch (error) {
    console.error(`Error generating stock data for ${ticker}:`, error);
    return [];
  }
}