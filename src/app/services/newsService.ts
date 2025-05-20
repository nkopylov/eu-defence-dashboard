import { Company, DateRange } from '../types';

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

/**
 * Fetches news articles related to the defence industry
 * and optionally filtered by companies
 */
export async function getNewsArticles(
  companies: Company[] = [], 
  dateRange: DateRange,
  page: number = 1,
  pageSize: number = 25
): Promise<{ articles: NewsArticle[]; totalResults: number }> {
  try {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    
    // Add date filters
    if (dateRange.startDate) {
      params.set('from', dateRange.startDate.toISOString().split('T')[0]);
    }
    if (dateRange.endDate) {
      params.set('to', dateRange.endDate.toISOString().split('T')[0]);
    }
    
    // Add company filters if any - only send if we have at least one company
    if (companies.length > 0) {
      // Send both company names and tickers
      const companyData = companies.map(c => ({
        name: c.name,
        ticker: c.ticker
      }));
      params.set('companies', JSON.stringify(companyData));
    } else {
      // Make sure to remove any companies parameter if it was set previously
      params.delete('companies');
    }
    
    const response = await fetch(`/api/news?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch news articles');
    }
    
    return {
      articles: data.articles,
      totalResults: data.totalResults
    };
  } catch (error) {
    console.error('Error fetching news articles:', error);
    throw error;
  }
}
