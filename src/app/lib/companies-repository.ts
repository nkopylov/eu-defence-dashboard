import { db } from './db';
import { Company, MaterialCategory, DependencyNetwork, NetworkLink, NetworkNode } from '../types';

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

/**
 * Get dependency network data
 */
export async function getDependencyNetwork(): Promise<DependencyNetwork> {
  try {
    // Get all companies to build the nodes
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
       ORDER BY c.name`
    );
    
    // Map category_id to node type
    const nodeTypeMap: Record<string, 'producer' | 'supplier' | 'material'> = {
      'defense': 'producer',
      'potential': 'supplier',
      'materials': 'material'
    };
    
    // Map companies to nodes
    const nodes: NetworkNode[] = companies.map(company => {
      // Determine the node level based on category and other factors
      let level = 0;
      
      if (company.category_name === 'defense') {
        // Defense companies are end producers (level 0)
        level = 0;
      } else if (company.category_name === 'potential') {
        // Potential companies are typically suppliers (level 1 or 2)
        level = company.sector?.includes('Electronics') ? 2 : 1;
      } else if (company.category_name === 'materials') {
        // Material companies are level 3
        level = 3;
      }
      
      return {
        id: company.ticker.toLowerCase().replace('.', '-'),
        ticker: company.ticker,
        name: company.name,
        country: company.country,
        products: company.products,
        sector: company.sector || undefined,
        description: company.description || undefined,
        type: nodeTypeMap[company.category_name] || 'supplier',
        level,
        category: company.material_category_name as MaterialCategory,
        defenseUses: company.defense_uses || undefined,
        defensePotential: company.defensePotential || undefined,
        revenue: company.revenue,
        marketCap: company.marketCap,
        euFundFocus: company.euFundFocus
      };
    });
    
    // Get all dependencies to build the links
    const dependencies = await db.queryWithPool<NetworkLink>(
      `SELECT 
        source_ticker as source, 
        target_ticker as target, 
        value, 
        description
       FROM dependencies`
    );
    
    return {
      nodes,
      links: dependencies
    };
  } catch (error) {
    console.error('Error fetching dependency network:', error);
    throw error;
  }
}

/**
 * Add or update a dependency link
 */
export async function upsertDependency(dependency: NetworkLink): Promise<boolean> {
  try {
    await db.queryWithPool(
      `INSERT INTO dependencies 
         (source_ticker, target_ticker, value, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (source_ticker, target_ticker) 
       DO UPDATE SET
         value = $3,
         description = $4`,
      [
        dependency.source,
        dependency.target,
        dependency.value,
        dependency.description
      ]
    );
    
    return true;
  } catch (error) {
    console.error('Error upserting dependency:', error);
    return false;
  }
}