import { db } from './db';
import { Company, MaterialCategory } from '../types';

/**
 * Get all defence companies
 */
export async function getDefenceCompanies(): Promise<Company[]> {
  const companies = await db.queryWithPool<Company & { category_id: number }>(
    `SELECT c.id, c.name, c.ticker, c.country, c.products, c.sector, 
            c.defense_potential as "defensePotential", c.description, 
            c.revenue, c.market_cap as "marketCap", c.eu_fund_focus as "euFundFocus"
     FROM companies c
     JOIN company_categories cc ON c.category_id = cc.id
     WHERE cc.name = 'defense'
     ORDER BY c.name ASC`
  );
  
  return companies.map(company => ({
    name: company.name,
    ticker: company.ticker,
    country: company.country,
    products: company.products,
    sector: company.sector || undefined,
    defensePotential: company.defensePotential || undefined,
    description: company.description || undefined,
    revenue: company.revenue,
    marketCap: company.marketCap,
    euFundFocus: company.euFundFocus
  }));
}

/**
 * Get all potential defence companies
 */
export async function getPotentialDefenceCompanies(): Promise<Company[]> {
  const companies = await db.queryWithPool<Company & { category_id: number }>(
    `SELECT c.id, c.name, c.ticker, c.country, c.products, c.sector, 
            c.defense_potential as "defensePotential", c.description,
            c.revenue, c.market_cap as "marketCap", c.eu_fund_focus as "euFundFocus"
     FROM companies c
     JOIN company_categories cc ON c.category_id = cc.id
     WHERE cc.name = 'potential'
     ORDER BY c.name ASC`
  );
  
  return companies.map(company => ({
    name: company.name,
    ticker: company.ticker,
    country: company.country,
    products: company.products,
    sector: company.sector || undefined,
    defensePotential: company.defensePotential || undefined,
    description: company.description || undefined,
    revenue: company.revenue,
    marketCap: company.marketCap,
    euFundFocus: company.euFundFocus
  }));
}

/**
 * Get all material companies
 */
export async function getMaterialCompanies(): Promise<(Company & { category: MaterialCategory })[]> {
  const companies = await db.queryWithPool<Company & { category_id: number, material_category_id: number, material_category_name: string, defense_uses: string }>(
    `SELECT c.id, c.name, c.ticker, c.country, c.products, c.sector, 
            c.defense_potential as "defensePotential", c.description,
            c.defense_uses as "defenseUses", mc.name as material_category_name,
            c.revenue, c.market_cap as "marketCap", c.eu_fund_focus as "euFundFocus"
     FROM companies c
     JOIN company_categories cc ON c.category_id = cc.id
     JOIN material_categories mc ON c.material_category_id = mc.id
     WHERE cc.name = 'materials'
     ORDER BY mc.name, c.name ASC`
  );
  
  return companies.map(company => ({
    name: company.name,
    ticker: company.ticker,
    country: company.country,
    products: company.products,
    sector: company.sector || undefined,
    defensePotential: company.defensePotential || undefined,
    description: company.description || undefined,
    category: company.material_category_name as MaterialCategory,
    defenseUses: company.defenseUses || undefined,
    revenue: company.revenue,
    marketCap: company.marketCap,
    euFundFocus: company.euFundFocus
  }));
}

/**
 * Get a company by ticker
 */
export async function getCompanyByTicker(ticker: string): Promise<Company | null> {
  const companies = await db.queryWithPool<Company & { 
    category_id: number, 
    material_category_id: number | null, 
    material_category_name: string | null,
    defense_uses: string | null,
    category_name: string
  }>(
    `SELECT c.id, c.name, c.ticker, c.country, c.products, c.sector, 
            c.defense_potential as "defensePotential", c.description,
            c.defense_uses as "defenseUses", 
            mc.name as material_category_name,
            cc.name as category_name,
            c.revenue, c.market_cap as "marketCap", c.eu_fund_focus as "euFundFocus"
     FROM companies c
     JOIN company_categories cc ON c.category_id = cc.id
     LEFT JOIN material_categories mc ON c.material_category_id = mc.id
     WHERE c.ticker = $1`,
    [ticker]
  );
  
  if (companies.length === 0) {
    return null;
  }
  
  const company = companies[0];
  
  // Build the company object based on its category
  const baseCompany: Company = {
    name: company.name,
    ticker: company.ticker,
    country: company.country,
    products: company.products,
    sector: company.sector || undefined,
    defensePotential: company.defensePotential || undefined,
    description: company.description || undefined,
    revenue: company.revenue,
    marketCap: company.marketCap,
    euFundFocus: company.euFundFocus
  };
  
  // Add material category if applicable
  if (company.category_name === 'materials' && company.material_category_name) {
    return {
      ...baseCompany,
      category: company.material_category_name as MaterialCategory,
      defenseUses: company.defenseUses || undefined
    };
  }
  
  return baseCompany;
}

/**
 * Search companies by name or ticker
 */
export async function searchCompanies(query: string): Promise<Company[]> {
  const companies = await db.queryWithPool<Company & { 
    category_id: number, 
    material_category_id: number | null, 
    material_category_name: string | null,
    defense_uses: string | null,
    category_name: string
  }>(
    `SELECT c.id, c.name, c.ticker, c.country, c.products, c.sector, 
            c.defense_potential as "defensePotential", c.description,
            c.defense_uses as "defenseUses", 
            mc.name as material_category_name,
            cc.name as category_name,
            c.revenue, c.market_cap as "marketCap", c.eu_fund_focus as "euFundFocus"
     FROM companies c
     JOIN company_categories cc ON c.category_id = cc.id
     LEFT JOIN material_categories mc ON c.material_category_id = mc.id
     WHERE c.name ILIKE $1 OR c.ticker ILIKE $1
     ORDER BY c.name ASC
     LIMIT 10`,
    [`%${query}%`]
  );
  
  return companies.map(company => {
    const baseCompany: Company = {
      name: company.name,
      ticker: company.ticker,
      country: company.country,
      products: company.products,
      sector: company.sector || undefined,
      defensePotential: company.defensePotential || undefined,
      description: company.description || undefined,
      revenue: company.revenue,
      marketCap: company.marketCap,
      euFundFocus: company.euFundFocus
    };
    
    // Add material category if applicable
    if (company.category_name === 'materials' && company.material_category_name) {
      return {
        ...baseCompany,
        category: company.material_category_name as MaterialCategory,
        defenseUses: company.defenseUses || undefined
      };
    }
    
    return baseCompany;
  });
}