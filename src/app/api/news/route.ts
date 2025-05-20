import { NextRequest, NextResponse } from 'next/server';
import { Company } from '../../types';

// API configuration
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MARKETAUX_API_URL = 'https://api.marketaux.com/v1/news/all';

export async function GET(request: NextRequest) {
  try {
    // Check API key
    const apiKey = process.env.MARKETAUX_TOKEN;
    if (!apiKey) {
      console.error('MARKETAUX_TOKEN environment variable not set');
      return NextResponse.json({
        success: false,
        error: 'API key configuration error',
      }, { status: 500 });
    }

    // Parse request parameters
    const searchParams = request.nextUrl.searchParams;
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(
      parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10),
      MAX_PAGE_SIZE
    );
    
    // Get date range parameters
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    
    // Get company filters
    let companiesParam = searchParams.get('companies');
    let companies: Company[] = [];
    let symbols = '';
    let privateCompanyNames: string[] = [];
    
    if (companiesParam) {
      try {
        companies = JSON.parse(companiesParam);
        
        // Separate public and private companies
        const publicCompanies: Company[] = [];
        
        companies.forEach(company => {
          if (company.ticker.startsWith('PRIVATE:')) {
            // For private companies, store the company name (without the PRIVATE: prefix)
            privateCompanyNames.push(company.name);
          } else {
            // For public companies, keep them for the symbols parameter
            publicCompanies.push(company);
          }
        });
        
        // Get tickers for public companies (limit to 10 total)
        symbols = publicCompanies
          .slice(0, 10)
          .map(company => company.ticker)
          .join(',');
      } catch (e) {
        console.error('Error parsing companies parameter:', e);
      }
    }

    // Construct query parameters for Marketaux
    const params = new URLSearchParams();
    params.append('api_token', apiKey);
    params.append('language', 'en');
    params.append('limit', pageSize.toString());
    params.append('page', page.toString());
    
    // Add date filters if provided
    if (fromDate) {
      params.append('published_after', fromDate);
    }
    if (toDate) {
      params.append('published_before', toDate);
    }
    
    // Build search query based on the companies provided
    let searchQuery = '';
    
    // If we have private companies, add their names to the search query
    if (privateCompanyNames.length > 0) {
      // Put each company name in quotes for exact matching
      searchQuery = privateCompanyNames.map(name => `"${name}"`).join(' | ');
    }
    
    // Add defense/defence terms if no companies or only using search
    if ((!symbols && privateCompanyNames.length === 0) || (!symbols && searchQuery)) {
      const defenseTerms = 'defense OR defence';
      searchQuery = searchQuery ? `${searchQuery} | ${defenseTerms}` : defenseTerms;
    }

    // Add appropriate parameters based on what we have
    if (symbols) {
      if (searchQuery) {
        searchQuery = searchQuery + ` | ${symbols}`;
      } else {
        params.append('symbols', symbols);
      }
    }
    
    if (searchQuery) {
      params.append('search', searchQuery);
    }

    // Make the API request
    const apiUrl = `${MARKETAUX_API_URL}?${params.toString()}`;
    console.log('Marketaux API request URL:', apiUrl.replace(apiKey, '[REDACTED]'));
    console.log('Request parameters:', {
      page,
      pageSize,
      fromDate,
      toDate,
      symbols: symbols || '(none)',
      privateCompanies: privateCompanyNames.length > 0 ? privateCompanyNames : '(none)',
      searchQuery: searchQuery || '(none)'
    });
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Marketaux API error:', errorText);
      return NextResponse.json({
        success: false,
        error: `API error: ${response.statusText}`,
      }, { status: response.status });
    }
    
    // Parse the response
    const data = await response.json();
    
    console.log('Marketaux API response status:', response.status);
    console.log('Response meta data:', data.meta);
    console.log('Number of articles returned:', data.data?.length || 0);
    
    // Make sure we have data to work with
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid response format from Marketaux API:', data);
      return NextResponse.json({
        success: false,
        error: 'Invalid API response format',
      }, { status: 500 });
    }
    
    // Map the response to our expected format
    const articles = data.data.map(article => ({
      source: {
        id: article.source || null,
        name: article.source_domain || 'Marketaux'
      },
      author: article.author || null,
      title: article.title,
      description: article.description || null,
      url: article.url,
      urlToImage: article.image_url || null,
      publishedAt: article.published_at,
      content: article.content || article.description || null
    }));

    // Return the results
    return NextResponse.json({
      success: true,
      articles,
      totalResults: data.meta?.found || articles.length,
    });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news';
    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}