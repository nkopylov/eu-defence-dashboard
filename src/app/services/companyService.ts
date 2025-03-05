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
    // Fallback to static data if API fails
    const { companies } = await import('../data/companies');
    return companies;
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
    // Fallback to static data if API fails
    const { potentialDefenceCompanies } = await import('../data/potentialCompanies');
    return potentialDefenceCompanies;
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
    // Fallback to static data if API fails
    const { materialCompanies } = await import('../data/materialCompanies');
    return materialCompanies;
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
    
    // Fallback to static data if API fails
    try {
      // Try to find in defense companies
      const { companies } = await import('../data/companies');
      const defenseCompany = companies.find(c => c.ticker === ticker);
      if (defenseCompany) return defenseCompany;
      
      // Try to find in potential companies
      const { potentialDefenceCompanies } = await import('../data/potentialCompanies');
      const potentialCompany = potentialDefenceCompanies.find(c => c.ticker === ticker);
      if (potentialCompany) return potentialCompany;
      
      // Try to find in material companies
      const { materialCompanies } = await import('../data/materialCompanies');
      const materialCompany = materialCompanies.find(c => c.ticker === ticker);
      if (materialCompany) return materialCompany;
      
      return null;
    } catch (fallbackError) {
      console.error('Error in fallback company search:', fallbackError);
      return null;
    }
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
    
    // Fallback to searching static data if API fails
    try {
      const { companies } = await import('../data/companies');
      const { potentialDefenceCompanies } = await import('../data/potentialCompanies');
      const { materialCompanies } = await import('../data/materialCompanies');
      
      const allCompanies = [
        ...companies,
        ...potentialDefenceCompanies,
        ...materialCompanies
      ];
      
      // Simple search in name or ticker
      const lowerQuery = query.toLowerCase();
      return allCompanies.filter(company => 
        company.name.toLowerCase().includes(lowerQuery) || 
        company.ticker.toLowerCase().includes(lowerQuery)
      ).slice(0, 10); // Limit to 10 results
    } catch (fallbackError) {
      console.error('Error in fallback company search:', fallbackError);
      return [];
    }
  }
}