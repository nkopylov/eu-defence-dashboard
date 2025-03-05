import { Company } from '../types';

/**
 * Fetch defense companies from the database API
 */
export async function getDefenseCompanies(): Promise<Company[]> {
  try {
    const response = await fetch('/api/companies?type=defense');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch defense companies');
    }
    
    return data.companies;
  } catch (error) {
    console.error('Error fetching defense companies:', error);
    throw error;
  }
}

/**
 * Fetch potential defense companies from the database API
 */
export async function getPotentialDefenseCompanies(): Promise<Company[]> {
  try {
    const response = await fetch('/api/companies?type=potential');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch potential defense companies');
    }
    
    return data.companies;
  } catch (error) {
    console.error('Error fetching potential defense companies:', error);
    throw error;
  }
}

/**
 * Fetch material companies from the database API
 */
export async function getMaterialCompanies(): Promise<Company[]> {
  try {
    const response = await fetch('/api/companies?type=materials');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch material companies');
    }
    
    return data.companies;
  } catch (error) {
    console.error('Error fetching material companies:', error);
    throw error;
  }
}

/**
 * Get a single company by ticker
 */
export async function getCompanyByTicker(ticker: string): Promise<Company | null> {
  try {
    const response = await fetch(`/api/companies/${encodeURIComponent(ticker)}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch company');
    }
    
    return data.company;
  } catch (error) {
    console.error(`Error fetching company ${ticker}:`, error);
    return null;
  }
}

/**
 * Search companies by name or ticker
 */
export async function searchCompanies(query: string): Promise<Company[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  try {
    const response = await fetch(`/api/companies?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to search companies');
    }
    
    return data.companies;
  } catch (error) {
    console.error(`Error searching companies for "${query}":`, error);
    return [];
  }
}